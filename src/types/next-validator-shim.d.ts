// types/next-validator-shim.d.ts
// Fix for Next's generated .next/types/validator.ts when using src/app.
// It sometimes tries to import "../../app/**" during type checks.
// This shim tells TypeScript "those modules exist", so type-checking can proceed.

declare module "../../app/*" {
  const anyExport: any;
  export = anyExport;
}
