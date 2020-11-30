/* eslint-disable @typescript-eslint/no-explicit-any */
declare module "jiff" {
  export function patchInPlace(patch: any, a: any, options?: any): void;
  export function patch<T>(patch: any, a: T, options?: any): T;
}
