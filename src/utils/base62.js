const characters =
  "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";

const toBase62 = (num) => {
  let base62 = "";
  while (num > 0) {
    base62 = characters[num % 62] + base62;
    num = Math.floor(num / 62);
  }
  return base62 || "0";
};

module.exports = toBase62;
