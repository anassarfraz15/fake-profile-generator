/**
 * profileGenerator.js — Core profile generation logic with seeded PRNG
 */

/**
 * Main profile generation function.
 * @param {object} filters — user-selected filters
 * @param {number} seed — numeric seed for deterministic generation
 * @returns {object} — complete profile object
 */
function generateProfile(filters, seed) {
  const rng = createRng(seed);

  const { gender: filterGender, country: countryCode, state: stateIndex, ageMode, exactAge, minAge, maxAge } = filters;

  // ── 1. Gender ──────────────────────────────────────────────
  const gender = filterGender === "Any"
    ? randItem(rng, ["Male", "Female"])
    : filterGender;

  // ── 2. Age ─────────────────────────────────────────────────
  let age;
  if (ageMode === "exact" && exactAge) {
    age = Math.max(5, Math.min(100, parseInt(exactAge, 10)));
  } else {
    const lo = Math.max(5, parseInt(minAge, 10) || 18);
    const hi = Math.min(100, parseInt(maxAge, 10) || 65);
    age = randInt(rng, lo, hi);
  }

  // ── 3. Date of birth ───────────────────────────────────────
  const dob = ageToDoB(rng, age);

  // ── 4. Country & State ─────────────────────────────────────
  const countryStates = DATA.states[countryCode] || DATA.states.US;
  const stateObj = (stateIndex !== undefined && stateIndex !== "" && countryStates[stateIndex])
    ? countryStates[stateIndex]
    : randItem(rng, countryStates);

  // ── 5. Name ────────────────────────────────────────────────
  const nameGroup = DATA.countryNameGroup[countryCode] || "western";
  const genderKey = gender === "Male" ? "male" : "female";
  const firstNames = DATA.firstNames[genderKey][nameGroup] || DATA.firstNames[genderKey].western;
  const lastNames = DATA.lastNames[nameGroup] || DATA.lastNames.western;

  const firstName = randItem(rng, firstNames);
  const lastName = randItem(rng, lastNames);
  const fullName = `${firstName} ${lastName}`;

  // ── 6. Address ─────────────────────────────────────────────
  const address = generateAddress(countryCode, stateObj, rng);

  // ── 7. Email ───────────────────────────────────────────────
  const emailVariants = [
    `${firstName.toLowerCase()}.${lastName.toLowerCase()}`,
    `${firstName.toLowerCase()}${lastName.toLowerCase()}`,
    `${firstName.toLowerCase()}.${lastName.toLowerCase()}${randInt(rng, 10, 99)}`,
    `${firstName[0].toLowerCase()}${lastName.toLowerCase()}`,
    `${firstName.toLowerCase()}${randInt(rng, 100, 999)}`,
  ];
  const emailLocal = randItem(rng, emailVariants).replace(/[^a-z0-9.]/gi, "");
  const emailDomain = randItem(rng, DATA.emailDomains);
  const email = `${emailLocal}@${emailDomain}`;

  // ── 8. Physical characteristics ────────────────────────────
  // Height: age-appropriate
  let heightCm;
  if (age <= 8) {
    heightCm = randInt(rng, 110, 135);
  } else if (age <= 12) {
    heightCm = randInt(rng, 130, 155);
  } else if (age <= 16) {
    heightCm = gender === "Male" ? randInt(rng, 155, 178) : randInt(rng, 148, 168);
  } else {
    heightCm = gender === "Male" ? randInt(rng, 165, 193) : randInt(rng, 150, 178);
  }

  // Weight: BMI 18–28 range for realistic values
  const bmiMin = age < 16 ? 16 : 18;
  const bmiMax = age < 16 ? 22 : 28;
  const bmi = bmiMin + rng() * (bmiMax - bmiMin);
  const heightM = heightCm / 100;
  const weightKg = Math.round(bmi * heightM * heightM);

  const hairColor = randItem(rng, DATA.hairColors);
  const bloodType = randWeighted(rng, DATA.bloodTypes, DATA.bloodTypeWeights);

  // ── 9. Civil status ────────────────────────────────────────
  let civilStatus;
  if (age < 18) {
    civilStatus = "Single";
  } else {
    civilStatus = randWeighted(rng, DATA.civilStatusAdult, DATA.civilStatusAdultWeights);
  }

  // ── 10. Education ──────────────────────────────────────────
  const education = generateEducation(rng, age);

  // ── 11. Employment ─────────────────────────────────────────
  const employment = generateEmployment(countryCode, age, rng);

  // ── 12. Hobbies ────────────────────────────────────────────
  const hobbyPool = age < 13 ? DATA.kidHobbies : DATA.hobbies;
  const shuffledHobbies = shuffle(rng, hobbyPool);
  const hobbiesCount = filters.extendedHobbies ? randInt(rng, 6, 10) : randInt(rng, 3, 5);
  const hobbies = shuffledHobbies.slice(0, hobbiesCount);

  // ── 13. Favorites (extended) ───────────────────────────────
  let favorites = null;
  if (filters.extendedHobbies) {
    favorites = {
      color: randItem(rng, DATA.favoriteColors),
      movie: randItem(rng, DATA.favoriteMovies),
      musicGenre: randItem(rng, DATA.favoriteMusicGenres),
      song: randItem(rng, DATA.favoriteSongs),
      book: randItem(rng, DATA.favoriteBooks),
    };
  }

  // ── 14. Vehicle ────────────────────────────────────────────
  let vehicle;
  if (age < 16) {
    vehicle = "None (too young to drive)";
  } else if (age < 18) {
    vehicle = randWeighted(rng, ["None", randItem(rng, DATA.vehicles)], [60, 40]);
  } else {
    vehicle = randWeighted(rng, ["None", randItem(rng, DATA.vehicles)], [20, 80]);
  }

  // ── 15. Family ─────────────────────────────────────────────
  const familyTemplate = randItem(rng, DATA.familyTemplates);

  // ── 16. Online status ──────────────────────────────────────
  const onlineStatus = randItem(rng, DATA.onlineStatuses);

  // ── 17. Ethnicity hint for photo ───────────────────────────
  const countryEthnicities = DATA.countries[countryCode]?.ethnicitySuggestions || [];
  const ethnicity = countryEthnicities.length ? randItem(rng, countryEthnicities) : "";

  // ── 18. Headline ───────────────────────────────────────────
  const headline = generateHeadline(age, employment, education);

  // ── Assemble base profile (before bio, which needs profile) ─
  const baseProfile = {
    seed,
    gender,
    age,
    dob: {
      date: dob,
      formatted: formatDate(dob),
    },
    firstName,
    lastName,
    fullName,
    address,
    email,
    phone: address.phone,
    height: {
      cm: heightCm,
      ftIn: cmToFtIn(heightCm),
    },
    weight: {
      kg: weightKg,
      lbs: kgToLbs(weightKg),
    },
    hairColor,
    bloodType,
    civilStatus,
    education,
    employment,
    showEmployment: !!filters.generateEmployment,
    hobbies,
    favorites,
    vehicle,
    family: familyTemplate,
    onlineStatus,
    ethnicity,
    headline,
    countryCode,
  };

  // ── 19. Bio ────────────────────────────────────────────────
  const bio = generateBio(baseProfile, rng);

  return { ...baseProfile, bio };
}

/**
 * Generate education info appropriate for age.
 */
function generateEducation(rng, age) {
  if (age < 6) {
    return {
      level: "Pre-School",
      grade: "Pre-K",
      schoolType: randItem(rng, DATA.schoolTypes),
    };
  }
  if (age >= 6 && age <= 11) {
    const grade = randInt(rng, 1, 6);
    return {
      level: "Primary School",
      grade: `Grade ${grade}`,
      schoolType: randItem(rng, DATA.schoolTypes),
    };
  }
  if (age >= 12 && age <= 13) {
    const grade = randInt(rng, 7, 8);
    return {
      level: "Middle School",
      grade: `Grade ${grade}`,
      schoolType: randItem(rng, DATA.schoolTypes),
    };
  }
  if (age >= 14 && age <= 17) {
    const grade = randInt(rng, 9, 12);
    return {
      level: "High School",
      grade: `Grade ${grade}`,
      schoolType: randItem(rng, DATA.schoolTypes),
    };
  }
  if (age >= 18 && age <= 22) {
    const year = randInt(rng, 1, 4);
    return {
      level: "College / University",
      grade: `Year ${year}`,
      schoolType: randItem(rng, ["Public University", "Private University", "Community College"]),
    };
  }
  if (age >= 22 && age <= 28 && rng() > 0.5) {
    return {
      level: "Graduate School",
      grade: `Year ${randInt(rng, 1, 3)}`,
      schoolType: randItem(rng, ["Public University", "Private University"]),
    };
  }
  // Graduated
  const levels = ["High School Diploma", "Bachelor's Degree", "Master's Degree", "Doctoral Degree"];
  const weights = [20, 50, 20, 10];
  return {
    level: randWeighted(rng, levels, weights),
    grade: "Graduated",
    schoolType: randItem(rng, ["Public", "Private"]),
  };
}

/**
 * Generate a contextual headline string.
 */
function generateHeadline(age, employment, education) {
  if (age < 6) return "Child";
  if (age < 13) return `Student • ${education.grade}`;
  if (age < 18) return `${education.level} Student • ${education.grade}`;
  if (employment.status === "Student") return `${education.level} Student`;
  if (employment.status === "Employed") return `${employment.title} • ${employment.industry} Industry`;
  if (employment.status === "Unemployed") return "Currently Seeking Employment";
  if (employment.status === "Retired") return "Retired Professional";
  return `${education.level}`;
}
