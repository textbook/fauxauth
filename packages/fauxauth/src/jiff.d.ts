declare module "jiff" {
	export function patchInPlace(patch: unknown, a: unknown, options?: unknown): void;
	export function patch<T>(patch: unknown, a: T, options?: unknown): T;
}
