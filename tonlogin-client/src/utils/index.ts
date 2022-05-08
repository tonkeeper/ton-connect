import naclUtils from 'tweetnacl-util';
import createHmac from 'create-hmac';

export async function hmacSHA256(phrase: string, password: string) {
  const phraseBuffer = Buffer.from(phrase);
  const passwordBuffer = password.length ? Buffer.from(password) : (new Uint8Array(new ArrayBuffer(0)));
  return createHmac('sha256', phraseBuffer).update(passwordBuffer).digest();
}

export function stringToBytes(str: string) {
  return naclUtils.decodeUTF8(str);
}

export * from './base64';
export * from './validateObject';