import nacl from 'tweetnacl';
import TonWeb from 'tonweb';
import { CreateRequestOptions, DecodedResponse, SessionData, TonOwnershipPayload } from './TonConnectServer.types';
import { Base64, bytesToString, getTimeSec, concatBytes, extractBytes, stringToBytes } from './utils';
import { TonConnectError } from './TonConnectError';

type TonConnectServerOptions = {
  staticSecret: string;
}

export class TonConnectServerV1 {
  public protocol = 'ton-auth';
  public version = 'v1';

  private sessionExpirationSec = 5 * 60;
  private staticSk: Uint8Array;

  constructor(options: TonConnectServerOptions) {
    this.staticSk = Base64.decodeBytes(options.staticSecret);
  }

  public createRequest(options: CreateRequestOptions, sessionData: SessionData = {}) {
    const session = nacl.box.keyPair();
    const sessionPayload = this.packSessionPayload(session.secretKey, sessionData);

    return {
      protocol: this.protocol,
      [this.version]: {
        session: Base64.encodeBytes(session.publicKey),
        session_payload: sessionPayload,
        ...options
      }
    };
  }

  public static async verifyTonOwnership(payload: TonOwnershipPayload, client_id: string) {
    const TonWallet = TonWeb.Wallets.all[payload.wallet_version];
    if (TonWallet) {
      // Construct wallet contract 
      const publicKey = Base64.decodeBytes(payload.pubkey)
      const wc = new TonWeb.Address(payload.address).wc;
      const wallet = new TonWallet({}, { publicKey, wc });
      const contractAddress = await wallet.getAddress();
      const friendlyAddress = contractAddress.toString(true, true, true);
      const isAddressMatched = friendlyAddress === payload.address;

      // Verify the signature
      const message = `tonlogin/ownership/${payload.wallet_version}/${payload.address}/${client_id}`;
      const signature = Base64.decodeBytes(payload.signature);
      const isSignatureVerified = nacl.sign.detached.verify(
        stringToBytes(message), 
        signature, 
        publicKey
      );
  
      if (isAddressMatched && isSignatureVerified) {
        return true;
      }
    }

    return false;
  }

  public async verifyTonOwnership(payload: TonOwnershipPayload, client_id: string) {
    return TonConnectServerV1.verifyTonOwnership(payload, client_id);
  }

  public decodeResponse(base64: string): DecodedResponse {
    const response = Base64.decodeUrlSafeObj(base64);
    const authenticator = Base64.decodeBytes(response.authenticator);
    const clientId = Base64.decodeBytes(response.client_id);
    const nonce = Base64.decodeBytes(response.nonce);
    const session = this.unpackSessionPayload(response.session_payload);
     
    const payloadBytes = nacl.box.open(authenticator, nonce, clientId, session.sk);

    if (!payloadBytes) {
      throw new TonConnectError('Payload decoding failed');
    }

    const payload = JSON.parse(bytesToString(payloadBytes));

    return { 
      client_id: response.client_id,
      sessionData: session.data,
      payload,
    };
  }

  private packSessionPayload(sessionSk: Uint8Array, data: SessionData) {
    const exp = Math.floor(getTimeSec() + this.sessionExpirationSec);
    const nonce = nacl.randomBytes(nacl.secretbox.nonceLength);
    const sk = Base64.encodeBytes(sessionSk);

    const payload = JSON.stringify({
      tonconnect: { exp, sk },
      data
    });

    const box = nacl.secretbox(stringToBytes(payload), nonce, this.staticSk);
    
    return Base64.encodeBytes(concatBytes([nonce, box]));
  } 

  private unpackSessionPayload(base64: string) {
    const bytes = Base64.decodeBytes(base64);
    const nonceLength = nacl.secretbox.nonceLength;

    const nonce = extractBytes(bytes, 0, nonceLength);
    const box = extractBytes(bytes, nonceLength);

    const payloadBytes = nacl.secretbox.open(box, nonce, this.staticSk);

    if (!payloadBytes) {
      throw new TonConnectError('Failed unpack session payload');
    }

    const payload = JSON.parse(bytesToString(payloadBytes));

    if (!payload.tonconnect) {
      throw new TonConnectError('Invalid session payload');
    }

    if (payload.tonconnect.exp < getTimeSec()) {
      throw new TonConnectError('Session expired');
    }

    return { 
      sk: Base64.decodeBytes(payload.tonconnect.sk),  
      data: payload.data
    };
  }
}
