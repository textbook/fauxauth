import cyf from "@codeyourfuture/eslint-config-standard";
import jest from "eslint-plugin-jest";
import globals from "globals";
import ts from "typescript-eslint";

/** @type {import("eslint").Linter.Config[]} */
export default [
	cyf,
	...ts.configs.strict,
	...ts.configs.stylistic,
	{
		languageOptions: {
			globals: globals.node,
		},
		rules: {
			"@typescript-eslint/no-explicit-any": "error",
			"@typescript-eslint/no-non-null-assertion": "error",
			"@typescript-eslint/no-unused-vars": [
				"error",
				{
					"ignoreRestSiblings": true,
				},
			],
			"no-console": "error",
		},
	},
	{
		files: ["**/*.spec.[jt]s"],
		...jest.configs["flat/recommended"],
		rules: {
			...jest.configs["flat/recommended"].rules,
			"@typescript-eslint/no-explicit-any": "off",
			"@typescript-eslint/no-non-null-assertion": "off",
			"jest/expect-expect": [
				"error",
				{
					"assertFunctionNames": [
						"expect",
						"request.**.expect",
					],
				},
			],
			"jest/no-commented-out-tests": "error",
			"jest/no-disabled-tests": "error",
		},
	},
	{
		ignores: [
			"coverage/",
			"**/lib/",
			"**/node_modules/",
		],
	},
];
