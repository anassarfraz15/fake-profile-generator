/**
 * addressGenerator.js — Country/state-aware address generation
 */

/**
 * Generate a postal code for the given country using the seeded rng.
 * @param {function} rng
 * @param {string} countryCode
 * @returns {string}
 */
function generatePostalCode(rng, countryCode) {
  switch (countryCode) {
    case "US":
      return String(randInt(rng, 10000, 99999));
    case "UK": {
      const areas = ["SW", "EC", "WC", "SE", "N", "NW", "E", "W", "LS", "M", "B", "G", "EH", "CF", "BS", "OX", "CB", "RG", "GU", "SL"];
      const area = randItem(rng, areas);
      const district = randInt(rng, 1, 20);
      const sector = randInt(rng, 1, 9);
      const letters = "ABDEFGHJLNPQRSTUVWXYZ";
      const u1 = letters[randInt(rng, 0, letters.length - 1)];
      const u2 = letters[randInt(rng, 0, letters.length - 1)];
      return `${area}${district} ${sector}${u1}${u2}`;
    }
    case "CA": {
      const letters = "ABCEGHJKLMNPRSTVXY";
      const l1 = letters[randInt(rng, 0, letters.length - 1)];
      const l2 = letters[randInt(rng, 0, letters.length - 1)];
      const l3 = letters[randInt(rng, 0, letters.length - 1)];
      return `${l1}${randInt(rng, 0, 9)}${l2} ${randInt(rng, 0, 9)}${l3}${randInt(rng, 0, 9)}`;
    }
    case "AU":
      return String(randInt(rng, 1000, 9999));
    case "IN":
      return String(randInt(rng, 100000, 999999));
    case "DE":
      return String(randInt(rng, 10000, 99999));
    case "FR":
      return String(randInt(rng, 10000, 99999));
    case "JP": {
      const a = pad(randInt(rng, 100, 999), 3);
      const b = pad(randInt(rng, 1000, 9999), 4);
      return `${a}-${b}`;
    }
    case "BR": {
      const a = pad(randInt(rng, 10000, 99999), 5);
      const b = pad(randInt(rng, 100, 999), 3);
      return `${a}-${b}`;
    }
    case "MX":
      return String(randInt(rng, 10000, 99999));
    case "KR":
      return String(randInt(rng, 10000, 99999));
    case "NG":
      return String(randInt(rng, 100000, 999999));
    case "ZA":
      return String(randInt(rng, 1000, 9999));
    case "PK":
      return String(randInt(rng, 10000, 99999));
    case "IT":
      return String(randInt(rng, 10000, 99999));
    case "ES":
      return String(randInt(rng, 10000, 99999));
    default:
      return String(randInt(rng, 10000, 99999));
  }
}

/**
 * Generate a phone number for the given country using the seeded rng.
 * @param {function} rng
 * @param {string} countryCode
 * @returns {string}
 */
function generatePhoneNumber(rng, countryCode) {
  const r = () => randInt(rng, 0, 9);
  const rD = (n) => Array.from({ length: n }, r).join("");

  switch (countryCode) {
    case "US":
    case "CA":
      return `(${randInt(rng, 200, 999)}) ${randInt(rng, 200, 999)}-${rD(4)}`;
    case "UK":
      return `07${rD(3)} ${rD(6)}`;
    case "AU":
      return `04${rD(2)} ${rD(3)} ${rD(3)}`;
    case "IN":
      return `+91 ${randInt(rng, 6, 9)}${rD(4)} ${rD(5)}`;
    case "DE":
      return `+49 ${randInt(rng, 100, 999)} ${rD(7)}`;
    case "FR":
      return `+33 ${randInt(rng, 1, 9)} ${rD(2)} ${rD(2)} ${rD(2)} ${rD(2)}`;
    case "JP":
      return `+81 ${randInt(rng, 10, 99)}-${rD(4)}-${rD(4)}`;
    case "BR":
      return `+55 (${randInt(rng, 11, 99)}) 9${rD(4)}-${rD(4)}`;
    case "MX":
      return `+52 ${randInt(rng, 55, 99)} ${rD(4)} ${rD(4)}`;
    case "KR":
      return `+82 1${randInt(rng, 0, 9)}-${rD(4)}-${rD(4)}`;
    case "NG":
      return `+234 ${randInt(rng, 70, 91)}${rD(1)} ${rD(3)} ${rD(4)}`;
    case "ZA":
      return `+27 ${randInt(rng, 60, 84)} ${rD(3)} ${rD(4)}`;
    case "PK":
      return `+92 ${randInt(rng, 300, 349)}-${rD(7)}`;
    case "IT":
      return `+39 ${randInt(rng, 300, 399)} ${rD(3)} ${rD(4)}`;
    case "ES":
      return `+34 ${randInt(rng, 600, 699)} ${rD(3)} ${rD(3)}`;
    default:
      return `+${randInt(rng, 1, 99)} ${rD(10)}`;
  }
}

/**
 * Generate a street address for the given country.
 * @param {function} rng
 * @param {string} countryCode
 * @returns {string}
 */
function generateStreetAddress(rng, countryCode) {
  const streetData = DATA.streetNames[countryCode] || DATA.streetNames.US;
  const streetName = randItem(rng, streetData.names);
  const suffix = randItem(rng, streetData.suffixes);
  const number = randInt(rng, 1, 9999);

  // Some countries put number before name, some after
  const numberFirst = ["US", "CA", "AU", "UK", "DE", "NG", "ZA", "PK"];
  if (numberFirst.includes(countryCode)) {
    return `${number} ${streetName} ${suffix}`;
  }
  // FR / BR / MX: suffix first (e.g. "Rue Victor Hugo, 42")
  if (["FR", "BR", "MX", "IT", "ES"].includes(countryCode)) {
    return `${suffix} ${streetName}, ${number}`;
  }
  // JP / KR: ward/district style
  if (["JP", "KR"].includes(countryCode)) {
    return `${streetName}${suffix} ${number}`;
  }
  return `${number} ${streetName} ${suffix}`;
}

/**
 * Main address generation function.
 * @param {string} countryCode
 * @param {object} stateObj — { name, abbr, cities }
 * @param {function} rng
 * @returns {object} address
 */
function generateAddress(countryCode, stateObj, rng) {
  const countryInfo = DATA.countries[countryCode];
  const city = randItem(rng, stateObj.cities);
  const street = generateStreetAddress(rng, countryCode);
  const postal = generatePostalCode(rng, countryCode);
  const phone = generatePhoneNumber(rng, countryCode);

  return {
    street,
    city,
    state: stateObj.name,
    stateAbbr: stateObj.abbr,
    postalCode: postal,
    country: countryInfo.name,
    countryCode,
    phone,
    formattedFull: `${street}, ${city}, ${stateObj.name}, ${postal}, ${countryInfo.name}`,
  };
}
