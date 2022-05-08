import nacl from 'tweetnacl';
import { AuthRequest, CreateResponseOptions, CreateTonOwnershipSignatureOptions } from './TonLoginClient.types';
import { Base64, hmacSHA256, stringToBytes, validateObject } from './utils';
import { TonLoginClientBase } from './TonLoginClientBase';

export class TonLoginClientV1 extends TonLoginClientBase {
  public version = 'v1';

  constructor(request: AuthRequest) {
    super(request);

    validateObject(request[this.version], [
      'session', 
      'session_payload', 
      'image_url', 
      'items'
    ]);

    this.request = request;
  } 

  public createTonOwnershipSignature(options: CreateTonOwnershipSignatureOptions) {
    const { walletVersion, address, clientId, secretKey } = options;
    const message = `tonlogin/ownership/${walletVersion}/${address}/${clientId}`;
    const signature = nacl.sign.detached(stringToBytes(message), secretKey);

    return Base64.encodeBytes(signature);
  }

  public async createResponse(options: CreateResponseOptions) {
    const request = this.getRequestBody();
    const sessionPk = Base64.decodeToBytes(request.session);
    const rootLoginKey = await hmacSHA256('TonLogin.Root', options.seed);
    const serviceLoginKey = await hmacSHA256(
      `${options.realm}:${options.service}`, 
      rootLoginKey.toString()
    );

    const client = nacl.box.keyPair.fromSecretKey(serviceLoginKey);
    const clientId = Base64.encodeBytes(client.publicKey);

    const payload = await this.constructPayload({
      extractorOptions: { clientId },
      extractors: options.payload,
      request: request.items,
    });

    const sessionNonce = nacl.randomBytes(24);
    const sessionAuthenticator = nacl.box(
      stringToBytes(JSON.stringify(payload)),
      sessionNonce,
      sessionPk, 
      client.secretKey
    );

    this.response = Base64.encodeUrlSafeObj({
      client_id: clientId,
      version: this.version,
      nonce: Base64.encodeBytes(sessionNonce),
      authenticator: Base64.encodeBytes(sessionAuthenticator),
      session_payload: request.session_payload
    });

    return this.response;
  }
}


