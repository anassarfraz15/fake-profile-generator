/**
 * bioGenerator.js — Natural-sounding profile bio generation
 */

/**
 * Generate a 3–6 line bio appropriate to the person's age and context.
 * @param {object} profile — full profile object
 * @param {function} rng
 * @returns {string}
 */
function generateBio(profile, rng) {
  const { firstName, lastName, age, gender, address, employment, hobbies, education } = profile;
  const pronoun = gender === "Male" ? "He" : gender === "Female" ? "She" : "They";
  const possessive = gender === "Male" ? "his" : gender === "Female" ? "her" : "their";
  const objective = gender === "Male" ? "him" : gender === "Female" ? "her" : "them";
  const city = address.city;
  const country = address.country;

  // Pick 2 hobbies for bio mention
  const bioHobbies = hobbies.slice(0, 2).map((h) => h.toLowerCase());
  const hobbyStr = bioHobbies.length > 1
    ? `${bioHobbies[0]} and ${bioHobbies[1]}`
    : bioHobbies[0] || "exploring new interests";

  if (age <= 12) {
    // Young child bio
    const grade = education.grade;
    const schoolType = education.schoolType.toLowerCase();
    const sentences = [
      `${firstName} is a bright and curious ${age}-year-old living in ${city}, ${country}.`,
      `${pronoun} is currently in ${grade} at a ${schoolType} school and loves going to class.`,
      `In ${possessive} free time, ${firstName} enjoys ${hobbyStr}.`,
      randItem(rng, [
        `${pronoun} is known among ${possessive} friends for being cheerful and creative.`,
        `${firstName} dreams of becoming a scientist or explorer someday.`,
        `${possessive.charAt(0).toUpperCase() + possessive.slice(1)} favourite subjects are science and art.`,
        `${pronoun} loves spending time with ${possessive} family on weekends.`,
      ]),
    ];
    return sentences.join(" ");
  }

  if (age <= 17) {
    // Teenager bio
    const grade = education.grade;
    const sentences = [
      `${firstName} is a ${age}-year-old high school student based in ${city}, ${country}.`,
      `${pronoun} is in ${grade} and is focused on ${possessive} studies and personal growth.`,
      `Outside of school, ${firstName} is passionate about ${hobbyStr}.`,
      randItem(rng, [
        `${pronoun} is actively involved in school clubs and extracurricular activities.`,
        `${firstName} is planning to pursue higher education in a field ${pronoun.toLowerCase()} loves.`,
        `${pronoun} enjoys hanging out with friends and staying active in the community.`,
        `${possessive.charAt(0).toUpperCase() + possessive.slice(1)} friends describe ${objective} as dependable and fun to be around.`,
      ]),
    ];
    return sentences.join(" ");
  }

  if (age <= 25) {
    // Young adult bio
    const isStudent = employment.status === "Student";
    const isEmployed = employment.status === "Employed";
    let line2;
    if (isStudent) {
      line2 = `${pronoun} is currently pursuing ${possessive} degree and balancing academic and personal life.`;
    } else if (isEmployed) {
      line2 = `${pronoun} works as a ${employment.title} at ${employment.company}.`;
    } else {
      line2 = `${pronoun} is currently exploring career opportunities and developing ${possessive} skills.`;
    }
    const sentences = [
      `${firstName} ${lastName} is a ${age}-year-old based in ${city}, ${country}.`,
      line2,
      `${pronoun} has a passion for ${hobbyStr} and values continuous learning.`,
      randItem(rng, [
        `${pronoun} is ambitious, driven, and always looking for new challenges.`,
        `${firstName} believes in working hard and enjoying the journey along the way.`,
        `In ${possessive} spare time, ${pronoun.toLowerCase()} enjoys connecting with like-minded people and building meaningful relationships.`,
        `${pronoun} is known for ${possessive} enthusiasm, creativity, and positive outlook on life.`,
      ]),
    ];
    return sentences.join(" ");
  }

  if (age <= 45) {
    // Working professional bio
    const isEmployed = employment.status === "Employed";
    let line2;
    if (isEmployed) {
      line2 = `${pronoun} works as a ${employment.title} in the ${employment.industry} industry at ${employment.company}.`;
    } else {
      line2 = `${pronoun} has a background in various professional fields and is currently focused on personal development.`;
    }
    const yearsExp = age - randInt(rng, 22, 26);
    const sentences = [
      `${firstName} ${lastName} is a ${age}-year-old professional residing in ${city}, ${country}.`,
      line2,
      `With ${yearsExp > 0 ? yearsExp : 1}+ years of experience, ${pronoun.toLowerCase()} brings a wealth of expertise to everything ${pronoun.toLowerCase()} does.`,
      `Outside work, ${firstName} is deeply interested in ${hobbyStr}.`,
      randItem(rng, [
        `${pronoun} values work-life balance and is committed to ${possessive} family and community.`,
        `${firstName} is recognized for ${possessive} strong work ethic and collaborative spirit.`,
        `${possessive.charAt(0).toUpperCase() + possessive.slice(1)} colleagues describe ${objective} as reliable, innovative, and highly motivated.`,
        `${pronoun} is passionate about making a meaningful impact both professionally and personally.`,
      ]),
    ];
    return sentences.join(" ");
  }

  if (age <= 65) {
    // Senior professional / mid-life bio
    const isEmployed = employment.status === "Employed";
    let profLine;
    if (isEmployed) {
      profLine = `${pronoun} is an experienced ${employment.title} with decades of professional experience.`;
    } else {
      profLine = `${pronoun} has had a long and fulfilling career and continues to contribute meaningfully.`;
    }
    const sentences = [
      `${firstName} ${lastName} is a ${age}-year-old individual living in ${city}, ${country}.`,
      profLine,
      `${pronoun} is passionate about ${hobbyStr} and dedicates significant time to ${possessive} personal interests.`,
      randItem(rng, [
        `Throughout ${possessive} life, ${firstName} has built strong relationships and a rich personal legacy.`,
        `${pronoun} is a respected member of ${possessive} community and enjoys mentoring younger generations.`,
        `${firstName} values family, friendship, and the simple pleasures of everyday life.`,
        `${possessive.charAt(0).toUpperCase() + possessive.slice(1)} life experiences have shaped ${objective} into a wise and compassionate person.`,
      ]),
    ];
    return sentences.join(" ");
  }

  // Senior / elder bio
  const sentences = [
    `${firstName} ${lastName} is a ${age}-year-old ${employment.status === "Retired" ? "retiree" : "individual"} living in ${city}, ${country}.`,
    `${pronoun} has lived a rich and rewarding life full of experiences and memories.`,
    `In ${possessive} golden years, ${firstName} enjoys ${hobbyStr} and spending quality time with loved ones.`,
    randItem(rng, [
      `${pronoun} is cherished by ${possessive} family and friends for ${possessive} warmth and wisdom.`,
      `${firstName} has a wealth of stories to share and loves engaging with the community.`,
      `${possessive.charAt(0).toUpperCase() + possessive.slice(1)} lifelong journey has been defined by resilience, curiosity, and kindness.`,
      `${pronoun} continues to inspire those around ${objective} with ${possessive} positive attitude and zest for life.`,
    ]),
  ];
  return sentences.join(" ");
}
