import naclUtils from 'tweetnacl-util';
import createHmac from 'create-hmac';

export async function hmacSHA256(phrase: string, password: string) {
  const phraseBuffer = Buffer.from(phrase);
  const passwordBuffer = password.length ? Buffer.from(password) : (new Uint8Array(new ArrayBuffer(0)));
  return createHmac('sha256', phraseBuffer).update(passwordBuffer).digest();
}

export function bytesToBase64(bytes: Uint8Array) {
  return naclUtils.encodeBase64(bytes);
}

export function base64ToBytes(str: string) {
  return naclUtils.decodeBase64(str);
}

const ENC = { '+': '-', '/': '_', '=': '.'};
const DEC = { '-': '+', '_': '/', '.': '=' };

export function objToSafeBase64(obj: Object): string {
  const base64 = objToBase64(obj)
  return base64.replace(/[+/=]/g, (m) => ENC[m]);
}

export function decodeSafeBase64(safe: string) {
  const base64 = safe.replace(/[-_.]/g, (m) => DEC[m]);
  return base64ToObj(base64);
}

export function objToBase64(obj: Object) {
  const jsonStr = JSON.stringify(obj);
  const buff = Buffer.from(jsonStr);
  return buff.toString('base64');
}

export function base64ToObj(str: string) {
  const buff = Buffer.from(str, 'base64');
  const decoded = buff.toString('ascii');
  return JSON.parse(decoded);
}

