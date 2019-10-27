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

export const generateHex = (length: number): string => {
  const value = Math.random() * (16 ** length - 1);
  return value.toString(16).padStart(length, "0");
};

export const generateConfiguration = (): Configuration => ({
  codes: [],
  ...initialConfiguration,
  ...JSON.parse(process.env.FAUXAUTH_CONFIG || "{}"),
});
