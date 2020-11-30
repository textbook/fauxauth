export interface Configuration {
  callbackUrl: string;
  clientId: string;
  clientSecret: string;
  codes: { [code: string]: string };
  tokenMap?: { [role: string]: string };
}

const hexChars = "0123456789abcdef";

const initialConfiguration: Partial<Configuration> = {
  callbackUrl: "http://example.org/",
  clientId: "1ae9b0ca17e754106b51",
  clientSecret: "3efb56fdbac1cb21f3d4fea9b70036e04a34d068",
};

const choice = (seq: string): string => seq[Math.floor(Math.random() * seq.length)];

export const generateHex = (length: number): string => [...Array(length)].map(() => choice(hexChars)).join("");

export const generateConfiguration = (): Configuration => ({
  codes: {},
  ...initialConfiguration,
  ...JSON.parse(process.env.FAUXAUTH_CONFIG || "{}"),
});
