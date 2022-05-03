export function computeSHA(string: string) {
  const utf8array = new TextEncoder().encode(string);
  return crypto.subtle.digest('SHA-256', utf8array).then((outBuffer) => {
    return Array.from(new Uint8Array(outBuffer))
      .map((bytes) => bytes.toString(16).padStart(2, '0'))
      .join('');
  });
}
