
import nacl from 'tweetnacl';
import * as utils from './utils';

export type AuthRequest = {
  image_url: string;
  return_url: string;
};

export type AuthResponse = {
  version: string;
  nonce: string;
  client_id: string;
  authenticator: string;
}

type TonLoginClientOptions = {
  walletSeed: string;
}

export class TonLoginClientV1 {
  public version = 'v1';

  private walletSeed: string;

  constructor(opts: TonLoginClientOptions) {
    this.walletSeed = opts.walletSeed;
  } 

  public async encodeAuthResponse({ request, serviceName, realm, payload }: {
    request: any;
    realm: string;
    serviceName: string;
    payload: any
  }) {
    const data = request[this.version];
    const sessionPk = utils.base64ToBytes(data.session);

    const rootLoginKey = await utils.hmacSHA256('TonLogin.Root', this.walletSeed);
    const serviceLoginKey = await utils.hmacSHA256(realm + ":" + serviceName, rootLoginKey.toString());

    const client = nacl.box.keyPair.fromSecretKey(serviceLoginKey);

    const sessionNonce = nacl.randomBytes(24);
    const sessionAuthenticator = nacl.box(
      Buffer.from(payload), 
      sessionNonce, 
      sessionPk, 
      client.secretKey
    );

    const response = {
      version: this.version,
      nonce: utils.bytesToBase64(sessionNonce),
      client_id: utils.bytesToBase64(client.publicKey),
      authenticator: utils.bytesToBase64(sessionAuthenticator),
      session_payload: data.session_payload
    };

    return utils.objToSafeBase64(response);
  }
}