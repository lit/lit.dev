declare module 'tarts' {
  const Tar: (files: Array<{name: string; content: string}>) => Uint8Array;
  export default Tar;
}
