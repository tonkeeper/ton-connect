import { TonConnectError } from "../TonConnectError";

export function validateObject(obj: Record<string, any>, fields: string[]) {
  try {
    const bodyKeys = Object.keys(obj);
    for (let field of fields) {
      if (!bodyKeys.includes(field)) {
        throw `Field '${field}' does not exist in protocol`
      }
    }
  } catch (err) {
    const message = err === 'string' ? err : err.message;
    throw new TonConnectError(`[ValidationSchemeError]: ${message}`);
  }
}