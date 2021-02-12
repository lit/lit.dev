export {}; // Force module.

declare global {
  interface Element {
    scrollIntoViewIfNeeded?: (center?: boolean) => void;
  }
}
