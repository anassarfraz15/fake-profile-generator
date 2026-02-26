/**
 * employmentGenerator.js — Employment data generation
 */

/**
 * Generate employment data for a person.
 * @param {string} countryCode
 * @param {number} age
 * @param {function} rng
 * @returns {object} employment
 */
function generateEmployment(countryCode, age, rng) {
  // Too young
  if (age < 16) {
    return {
      status: "Student",
      note: "Too young for formal employment",
      tooYoung: true,
    };
  }

  // Determine employment status
  let status;
  if (age < 22) {
    status = randWeighted(rng, ["Student", "Employed", "Unemployed"], [60, 30, 10]);
  } else if (age < 65) {
    status = randWeighted(rng, ["Employed", "Unemployed", "Student"], [75, 15, 10]);
  } else {
    status = randWeighted(rng, ["Retired", "Employed", "Unemployed"], [65, 25, 10]);
  }

  if (status === "Unemployed") {
    return { status: "Unemployed", tooYoung: false };
  }

  if (status === "Retired") {
    return {
      status: "Retired",
      note: "Retired",
      tooYoung: false,
    };
  }

  if (status === "Student") {
    return {
      status: "Student",
      note: age < 22 ? "Full-time student" : "Part-time student",
      tooYoung: false,
    };
  }

  // Pick industry
  const industries = Object.keys(DATA.occupations);
  const industry = randItem(rng, industries);
  const occupationList = DATA.occupations[industry];
  const occupationObj = randItem(rng, occupationList);

  // Senior if age > 35
  const isSenior = age >= 35 && rng() > 0.4;
  const title = isSenior ? occupationObj.seniorTitle : occupationObj.title;

  // Company name
  const companyName = generateCompanyName(rng);

  // Company size
  const companySize = randItem(rng, DATA.companySizes);

  // Salary
  const salaryInfo = DATA.salaryRanges[countryCode] || { min: 2000, max: 8000, currency: "USD" };
  const salaryBase = randInt(rng, salaryInfo.min, salaryInfo.max);

  // Round salary nicely
  const rounded = Math.round(salaryBase / 100) * 100;
  const countryInfo = DATA.countries[countryCode];
  const formattedSalary = `${countryInfo.currencySymbol}${formatNumber(rounded)} ${salaryInfo.currency}/month`;

  return {
    status: "Employed",
    industry: capitalize(industry),
    title,
    company: companyName,
    companySize,
    salary: formattedSalary,
    salaryRaw: rounded,
    currency: salaryInfo.currency,
    tooYoung: false,
  };
}

/**
 * Generate a realistic company name.
 */
function generateCompanyName(rng) {
  const { prefixes, midwords, suffixes } = DATA.companyParts;
  const style = randInt(rng, 0, 2);

  if (style === 0) {
    // Prefix + Suffix (e.g., "Alpha Corp.")
    return `${randItem(rng, prefixes)} ${randItem(rng, suffixes)}`;
  } else if (style === 1) {
    // Prefix + Midword (e.g., "Global Solutions")
    return `${randItem(rng, prefixes)} ${randItem(rng, midwords)}`;
  } else {
    // Prefix + Midword + short suffix (e.g., "Delta Systems Inc.")
    const shortSuffix = randItem(rng, ["Inc.", "LLC", "Ltd.", "Corp.", "Co."]);
    return `${randItem(rng, prefixes)} ${randItem(rng, midwords)} ${shortSuffix}`;
  }
}
