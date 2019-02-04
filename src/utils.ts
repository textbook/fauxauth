const hexChars = "0123456789abcdef";

export interface Configuration {
  accessToken: string | null;
  callbackUrl: string;
  clientId: string;
  clientSecret: string;
  codes: string[];
}

const initialConfiguration: Partial<Configuration> = {
  accessToken: null,
  callbackUrl: "http://example.org/",
  clientId: "1ae9b0ca17e754106b51",
  clientSecret: "3efb56fdbac1cb21f3d4fea9b70036e04a34d068",
};

export const generateHex = (length: number) => {
  return Array(length)
    .fill(null)
    .map(() => hexChars[Math.floor(Math.random() * hexChars.length)])
    .join("");
};

export const generateConfiguration = (): Configuration => ({
  codes: [],
  ...initialConfiguration,
  ...JSON.parse(process.env.FAUXAUTH_CONFIG || "{}"),
});
