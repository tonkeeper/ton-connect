import naclUtils from 'tweetnacl-util';

export function encodeBytes(bytes: Uint8Array) {
  return naclUtils.encodeBase64(bytes);
}

export function decodeToBytes(encoded: string) {
  return naclUtils.decodeBase64(encoded);
}

export function encodeStr(str: string) {
  if (typeof btoa === 'function') {
    return btoa(str);
  } else if (
    typeof Buffer !== 'undefined' &&
    Buffer !== null &&
    typeof Buffer.from === 'function'
  ) {
    const buff = Buffer.from(str, 'base64');
    return buff.toString('ascii');
  } else {
    throw new Error('Base64 is not supported in your environment');
  }
}

export function decodeToStr(encoded: string) {
  if (typeof atob === 'function') {
    return atob(encoded);
  } else if (
    typeof Buffer !== 'undefined' &&
    Buffer !== null &&
    typeof Buffer.from === 'function'
  ) {
    const buff = Buffer.from(encoded);
    return buff.toString('base64');
  } else {
    throw new Error('Base64 is not supported in your environment');
  }
}

export function encodeObj(obj: any) {
  const jsonStr = JSON.stringify(obj);
  return encodeStr(jsonStr);
}

export function decodeToObj(encoded: string) {
  const decoded = decodeToStr(encoded);

  try {
    return JSON.parse(decoded);
  } catch (e) {
    return null;
  }
}

const ENC = { '+': '-', '/': '_', '=': '.' };
const DEC = { '-': '+', '_': '/', '.': '=' };

export function toUrlSafe(str: string) {
  return str.replace(/[+/=]/g, (m) => ENC[m])
}

export function fromUrlSafe(str: string) {
  return str.replace(/[-_.]/g, (m) => DEC[m]);
}

export function encodeUrlSafeStr(str: string) {
  return toUrlSafe(encodeStr(str));
}

export function decodeToUrlSafeStr(encoded: string) {
  return fromUrlSafe(encodeStr(encoded));
} 

export function encodeUrlSafeObj(obj: any) {
  return toUrlSafe(encodeObj(obj));
}

export function decodeToUrlSafeObj(encoded: string) {
  return decodeToObj(fromUrlSafe(encoded));
} 

export const Base64 = {
  encodeBytes,
  decodeToBytes,
  encodeStr,
  decodeToStr,
  encodeObj,
  decodeToObj,
  toUrlSafe,
  fromUrlSafe,
  encodeUrlSafeStr,
  decodeToUrlSafeStr,
  encodeUrlSafeObj,
  decodeToUrlSafeObj
};