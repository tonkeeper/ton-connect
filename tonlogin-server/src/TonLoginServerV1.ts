import nacl from 'tweetnacl';
import * as utils from './utils';

export type AuthRequest = {
  image_url: string;
  return_url: string;
  items: any;
};

export type AuthResponse = {
  version: string;
  nonce: string;
  client_id: string;
  authenticator: string;
}

type TonLoginServerOptions = {
  staticSecret: string;
}

export class TonLoginServerV1 {
  public version = 'v1';
  public protocol = 'ton-auth';

  private staticSk: Uint8Array;

  private lengths = {
    timestamp: 4,
    sessionKey: nacl.secretbox.keyLength + nacl.secretbox.overheadLength,
    nonce: nacl.secretbox.nonceLength
  }

  constructor(options: TonLoginServerOptions) {
    this.staticSk = utils.base64ToBytes(options.staticSecret);
  }

  public generateAuthRequest({ image_url, return_url, items }) {
    const session = nacl.box.keyPair();
    const sessionPayload = this.packSessionPayload(session.secretKey, 1);

    const scheme = {
      protocol: this.protocol,
      [this.version]: {
        session: utils.bytesToBase64(session.publicKey),
        session_payload: sessionPayload,
        image_url,
        return_url,
        items,
      }
    };

    return scheme;
  }

  public decodeAuthResponse(responseStr: string) {
    const response = utils.decodeSafeBase64(responseStr);
    const authenticator = utils.base64ToBytes(response.authenticator);
    const nonce = utils.base64ToBytes(response.nonce);
    const clientId = utils.base64ToBytes(response.client_id);
    const sessionSk = this.unpackSessionSk(response.session_payload);
    
    const decodedPayload = nacl.box.open(
      authenticator, 
      nonce, 
      clientId, 
      sessionSk
    );

    if (decodedPayload) {
      const payload = JSON.parse(utils.bytesToString(decodedPayload));
      return { client_id: response.client_id, payload };
    }
    
    throw new Error('Decode error');
  }
  
  private encryptSessionSk(sessionSk: Uint8Array) {
    const nonce = nacl.randomBytes(24);
    const key = nacl.secretbox(sessionSk, nonce, this.staticSk);
    
    return { key, nonce };
  }

  private decryptSessionSk(key: Uint8Array, nonce: Uint8Array) {
    return nacl.secretbox.open(key, nonce, this.staticSk);
  }
4
  private packSessionPayload(sessionSk: Uint8Array, offsetSec: number) {
    const box = this.encryptSessionSk(sessionSk);   
    const timestamp = utils.getTimestampBytes(this.lengths.timestamp, offsetSec);

    return utils.bytesToBase64(utils.concatBytes([timestamp, box.key, box.nonce]));
  } 

  private unpackSessionSk(payloadStr: string) {
    const payloadBytes = utils.base64ToBytes(payloadStr);
    const l = this.lengths;

    const timestamp = utils.bytesToIntLE(utils.extractBytes(payloadBytes, 0, l.timestamp));
    const key = utils.extractBytes(payloadBytes, l.timestamp, l.sessionKey);
    const nonce = utils.extractBytes(payloadBytes, l.timestamp + l.sessionKey, l.nonce);

    const sessionSk = this.decryptSessionSk(key, nonce);

    if (timestamp > Date.now()) {
      throw Error('Exp');
    }

    return sessionSk;
  }
}