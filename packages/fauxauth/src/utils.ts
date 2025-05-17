const hexChars = "0123456789abcdef";

const choice = (seq: string): string => seq[Math.floor(Math.random() * seq.length)];

export const generateHex = (length: number): string => [...Array(length)].map(() => choice(hexChars)).join("");
