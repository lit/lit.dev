import {until} from 'lit/directives/until.js';

// From https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto/digest
async function sha256(message: string) {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => ('00' + b.toString(16)).slice(-2)).join('');
  // Add some artificial delay for demo purposes...
  await new Promise<void>((r) => setTimeout(() => r(), 1000));
  return hashHex;
}

export const calculateSHA = (value: string) => {
  return until(sha256(value), 'Calculating sha...');
}
