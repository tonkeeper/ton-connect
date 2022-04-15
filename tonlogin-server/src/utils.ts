import nacl from 'tweetnacl';
import naclUtils from 'tweetnacl-util';
import createHmac from 'create-hmac';

export function bytesToBase64(bytes: Uint8Array) {
  return naclUtils.encodeBase64(bytes);
}

export function base64ToBytes(str: string) {
  return naclUtils.decodeBase64(str);
}

/**
 * intToByteArray
 *
 * Converts a number to Uint8Array
 *
 * @param {number} num
 * @param {number} size
 *
 * @returns {Uint8Array}
 */
export function intToBytes(n: number, size?: number): Uint8Array {
  const arr: number[] = [];
  n = Math.floor(n);
  if (n < 0) n *= -1;
  while (n > 0) {
    arr.unshift(n & 255);
    n = n >> 8;
  }

  if (size !== undefined) {
    const pad = size - arr.length;
    for (let i = 0; i < pad; i++) {
      arr.unshift(0);
    }
  }

  return new Uint8Array(arr);
}

export function bytesToIntLE(src: Uint8Array): number {
  const view = new DataView(src.buffer);
  return view.getUint32(0, true);
}

export function bytesToString(bytes: Uint8Array) {
  return String.fromCharCode.apply(null, bytes);
}




/**
 * Get the current UNIX time.
 * 
 * @param offset The amount of time to add to the
 *  timestamp (in seconds).
 * @returns The current time.
 */
 export function getTimestamp(offset = 0): number {
  return Math.floor((Date.now() / 1000) + offset);
}

/**
 * Turn the timestamp into bytes.
 * 
 * @param size The amount of time to add to the
 *  timestamp (in seconds).
 * @param timeOffset The amount of time to add to the
 *  timestamp (in seconds).
 * @returns The current time in a byte array.
 */
export function getTimestampBytes(size?: number, timeOffset?: number): Uint8Array {
  return intToBytes(getTimestamp(timeOffset), size);
}

/**
 * Extract bytes from a Uint8Array.
 * 
 * @param src The Uint8Array to extract bytes from.
 * @param offset The amount position to start extracting
 *  bytes from.
 * @param length The amount of bytes to extract.
 * @returns The extracted bytes in a Uint8Array.
 */
export function extractBytes(src: Uint8Array, offset = 0, length?: number) {
  return src.subarray(offset, offset + (length ?? src.length - offset));
}


/**
 * Returns a new Uint8Array created by concatenating the passed ArrayLikes
 *
 * @param {Array<ArrayLike<number>>} arrays
 * @param {number} [length]
 */
 export function concatBytes(arrays: Uint8Array[], length?: number) {
  if (!length) {
    length = arrays.reduce((acc, curr) => acc + curr.length, 0);
  }

  const output = new Uint8Array(length);
  let offset = 0;

  for (const arr of arrays) {
    output.set(arr, offset)
    offset += arr.length
  }

  return output
}

export function generateServerSecret() {
  return naclUtils.encodeBase64(nacl.randomBytes(32));
}

export function hmacSHA256(phrase: string, password: string) {
  const phraseBuffer = Buffer.from(phrase);
  const passwordBuffer = password.length 
    ? Buffer.from(password) 
    : new Uint8Array(new ArrayBuffer(0));

  return createHmac('sha256', phraseBuffer).update(passwordBuffer).digest();
}


const ENC = {
  '+': '-',
  '/': '_',
  '=': '.'
}
const DEC = {
  '-': '+',
  '_': '/',
  '.': '='
}

/**
 * encode base64 string url safe
 * @param {String} base64 - base64 encoded string
 * @return {String} url-safe-base64 encoded
 */
export function encodeSafeBase64(base64: string) {
  return base64.replace(/[+/=]/g, (m) => ENC[m]);
}

/**
 * decode url-safe-base64 string to base64
 * @param {String} safe - url-safe-base64 string
 * @return {String} base64 encoded
 */
export function decodeSafeBase64(safe: string) {
  const d = safe.replace(/[-_.]/g, (m) => DEC[m]);
  return decodeBase64(d);
}

function decodeBase64(scheme: string) {
  const buff = Buffer.from(scheme, 'base64');
  const decoded = buff.toString('ascii');
  return JSON.parse(decoded);
}

