const generateRandom7Digits = () => {
  const min = 1000000; // Smallest 7-digit number (10^6)
  const max = 9999999; // Largest 7-digit number (10^7 - 1)
  return Math.floor(Math.random() * (max - min + 1) + min).toString();
};

const generateAccountNumber = () => {
  const random7Digits = generateRandom7Digits();
  return "1335" + random7Digits;
};

module.exports = { generateAccountNumber };
