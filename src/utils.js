const hexChars = "0123456789abcdef";

export const generateHex = (length) => {
  return Array(length)
    .fill(null)
    .map(() => hexChars[Math.floor(Math.random() * hexChars.length)])
    .join("");
};

export const generateConfiguration = () =>
  Object.assign(
    {},
    {
      accessToken: null,
      callbackUrl: "http://example.org/",
      clientId: "1ae9b0ca17e754106b51",
      clientSecret: "3efb56fdbac1cb21f3d4fea9b70036e04a34d068",
      codes: [],
    },
    JSON.parse(process.env.FAUXAUTH_CONFIG || "{}")
  );
