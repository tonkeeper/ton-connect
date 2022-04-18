import nacl from 'tweetnacl';
import { AuthRequest, CreateResponseOptions, CreateTonOwnershipSignatureOptions } from './TonLoginClient.types';
import { TonLoginClientBase } from './TonLoginClientBase';
import * as utils from './utils';

export class TonLoginClientV1 extends TonLoginClientBase {
  public version = 'v1';

  constructor(request: AuthRequest) {
    super(request);

    utils.validateObject(request[this.version], [
      'session', 
      'session_payload', 
      'image_url', 
      'items'
    ]);

    this.request = request;
  } 

  public createTonOwnershipSignature(options: CreateTonOwnershipSignatureOptions) {
    const { walletId, address, clientId, secretKey } = options;
    const signature = `tonlogin/ownership/${walletId}/${address}/${clientId}`;
    
    return utils.bytesToBase64(nacl.sign(Buffer.from(signature), secretKey));
  }

  public async createResponse(options: CreateResponseOptions) {
    const request = this.getRequestBody();
    const sessionPk = utils.base64ToBytes(request.session);
    const rootLoginKey = await utils.hmacSHA256('TonLogin.Root', options.seed);
    const serviceLoginKey = await utils.hmacSHA256(
      `${options.realm}:${options.service}`, 
      rootLoginKey.toString()
    );

    const client = nacl.box.keyPair.fromSecretKey(serviceLoginKey);
    const clientId = utils.bytesToBase64(client.publicKey);

    const payload = await this.extractPayload(request.items, options.payload, { clientId });

    const sessionNonce = nacl.randomBytes(24);
    const sessionAuthenticator = nacl.box(
      Buffer.from(JSON.stringify(payload)),
      sessionNonce,
      sessionPk, 
      client.secretKey
    );

    const responseObj = {
      client_id: clientId,
      version: this.version,
      nonce: utils.bytesToBase64(sessionNonce),
      authenticator: utils.bytesToBase64(sessionAuthenticator),
      session_payload: request.session_payload
    };

    this.response = utils.objToSafeBase64(responseObj);

    return this.response;
  }
}
