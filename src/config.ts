import cloneDeep from "lodash.clonedeep";

export interface Configuration {
	callbackUrl: string;
	clientId: string;
	clientSecret: string;
	codes: { [code: string]: string };
	tokenMap?: { [role: string]: string };
}

let currentConfiguration: Configuration;

let initialConfiguration: Configuration;

const defaultConfiguration: Omit<Configuration, "codes"> = {
	callbackUrl: "http://example.org/",
	clientId: "1ae9b0ca17e754106b51",
	clientSecret: "3efb56fdbac1cb21f3d4fea9b70036e04a34d068",
};

export const getAll = (): Configuration => currentConfiguration;

export const initialise = (overrides?: Partial<Configuration>): void => {
	initialConfiguration = {
		...cloneDeep(defaultConfiguration),
		codes: {},
		...JSON.parse(process.env.FAUXAUTH_CONFIG || "{}"),
		...cloneDeep(overrides),
	};
	reset();
};

export const reset = (): void => {
	currentConfiguration = cloneDeep(initialConfiguration);
};

export const update = (overrides: Partial<Configuration>): void => {
	currentConfiguration = {
		...cloneDeep(currentConfiguration),
		...cloneDeep(overrides),
	};
};
