// Password hashing + token generation using Web Crypto (available in Workers).

const PBKDF2_ITERATIONS = 100_000;
const PBKDF2_KEYLEN_BITS = 256;

function bufferToHex(buf) {
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

function hexToBuffer(hex) {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
  }
  return bytes.buffer;
}

export function generateSalt(bytes = 16) {
  const arr = new Uint8Array(bytes);
  crypto.getRandomValues(arr);
  return bufferToHex(arr.buffer);
}

export function generateToken(bytes = 32) {
  const arr = new Uint8Array(bytes);
  crypto.getRandomValues(arr);
  return bufferToHex(arr.buffer);
}

export async function hashPassword(password, saltHex) {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    enc.encode(password),
    { name: 'PBKDF2' },
    false,
    ['deriveBits'],
  );
  const bits = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt: new Uint8Array(hexToBuffer(saltHex)),
      iterations: PBKDF2_ITERATIONS,
      hash: 'SHA-256',
    },
    key,
    PBKDF2_KEYLEN_BITS,
  );
  return bufferToHex(bits);
}

export async function verifyPassword(password, saltHex, expectedHashHex) {
  const got = await hashPassword(password, saltHex);
  // Constant-time-ish compare
  if (got.length !== expectedHashHex.length) return false;
  let diff = 0;
  for (let i = 0; i < got.length; i++) {
    diff |= got.charCodeAt(i) ^ expectedHashHex.charCodeAt(i);
  }
  return diff === 0;
}
