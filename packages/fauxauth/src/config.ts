import debug from "debug";
import cloneDeep from "lodash.clonedeep";
import yargs from "yargs/yargs";

const log = debug("fauxauth:config");

export interface Configuration {
	callbackUrl: string;
	clientId: string;
	clientSecret: string;
	codes: { [code: string]: string };
	tokenMap?: { [role: string]: string };
}

type RawConfiguration = { [Property in keyof Configuration]: string };

let currentConfiguration: Configuration;

let initialConfiguration: Configuration;

const getYargs = (): RawConfiguration => yargs(process.argv.slice(2))
	.env("FAUXAUTH")
	.pkgConf("fauxauth")
	.config(process.env.FAUXAUTH_CONFIG ? JSON.parse(process.env.FAUXAUTH_CONFIG) : {})
	.options({
		callbackUrl: {
			default: "http://example.org/",
			describe: "The base URL to return or validate redirect_uri against",
			type: "string",
		},
		clientId: {
			default: "1ae9b0ca17e754106b51",
			describe: "The client ID to be accepted by the /authorize endpoint",
			type: "string",
		},
		clientSecret: {
			default: "3efb56fdbac1cb21f3d4fea9b70036e04a34d068",
			describe: "The client secret required by the /access_token endpoint",
			type: "string",
		},
		codes: {
			default: "{}",
			describe: "The codes accepted by /access_token and their tokens",
			type: "string",
		},
		tokenMap: {
			describe: "A map from choices (e.g. roles) to a token for that choice",
			type: "string",
		},
	})
	.parseSync();

export const getAll = (): Configuration => currentConfiguration;

export const initialise = (overrides?: Partial<Configuration>): void => {
	const argv = getYargs();
	initialConfiguration = {
		callbackUrl: argv.callbackUrl,
		clientId: argv.clientId,
		clientSecret: argv.clientSecret,
		codes: JSON.parse(argv.codes),
		tokenMap: argv.tokenMap && JSON.parse(argv.tokenMap),
		...cloneDeep(overrides),
	};
	log("configured with %j", initialConfiguration);
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