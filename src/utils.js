const hexChars = "0123456789abcdef";

export const generateHex = (length) => {
  return Array(length)
    .fill(null)
    .map(() => hexChars[Math.floor(Math.random() * hexChars.length)])
    .join("");
};
