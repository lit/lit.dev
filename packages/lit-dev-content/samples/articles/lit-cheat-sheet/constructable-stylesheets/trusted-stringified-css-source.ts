export const trustedStyles = `
  div {
    color: red;
  }
`;

// This may be needed for some older versions of TS
export type CSSStyleSheet = (typeof globalThis)['CSSStyleSheet'] & {
  replaceSync(cssText: string): void;
  replace(cssText: string): void;
};
