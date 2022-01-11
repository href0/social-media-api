const phoneNumberFormatter = (number) => {
  // 1. menghilangkan karakter selain angka ex : 081-020
  let formatted = number.replace(/\D/g, "");
  // 2. menghilangkan angka 0 didepan  (prefix) kemudian ganti dengan 62
  if (formatted.startsWith("0")) {
    formatted = "62" + formatted.substr(1);
  } else if (formatted.startsWith("8")) {
    formatted = "62" + formatted;
  }

  return formatted;
};

module.exports = { phoneNumberFormatter };
