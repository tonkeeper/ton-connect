import createHmac from 'create-hmac';
import naclUtils from 'tweetnacl-util';

export function stringToBytes(str: string) {
  return naclUtils.decodeUTF8(str);
}

export function bytesToString(bytes: Uint8Array) {
  return naclUtils.encodeBase64(bytes);
}

export function getTimeSec() {
  return Math.floor((Date.now() / 1000));
}

export function extractBytes(src: Uint8Array, offset = 0, length?: number) {
  return src.subarray(offset, offset + (length ?? src.length - offset));
}

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

export function hmacSHA256(phrase: string, password: string) {
  const phraseBuffer = Buffer.from(phrase);
  const passwordBuffer = password.length 
    ? Buffer.from(password) 
    : new Uint8Array(new ArrayBuffer(0));

  return createHmac('sha256', phraseBuffer).update(passwordBuffer).digest();
}

export { Base64 } from './base64';