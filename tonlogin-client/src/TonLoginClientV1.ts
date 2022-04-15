import nacl from 'tweetnacl';
import { AuthRequest, CreateResponseArgs } from './TonLoginClient.types';
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

  public async createResponse(options: CreateResponseArgs) {
    const request = this.getRequestBody();
    const payload = request.items
      .map((item) => {
        const payload = options.extractPayload(item.type, item.required);
        if (payload) {
          return {
            type: item.type,
            ...payload
          }
        }
      })
      .filter((item) => item !== undefined);

    const sessionPk = utils.base64ToBytes(request.session);

    const rootLoginKey = await utils.hmacSHA256('TonLogin.Root', options.walletSeed);
    const serviceLoginKey = await utils.hmacSHA256(
      `${options.realm}:${options.serviceName}`, 
      rootLoginKey.toString()
    );

    const client = nacl.box.keyPair.fromSecretKey(serviceLoginKey);

    const sessionNonce = nacl.randomBytes(24);
    const sessionAuthenticator = nacl.box(
      Buffer.from(JSON.stringify(payload)),
      sessionNonce,
      sessionPk, 
      client.secretKey
    );

    const responseObj = {
      version: this.version,
      nonce: utils.bytesToBase64(sessionNonce),
      client_id: utils.bytesToBase64(client.publicKey),
      authenticator: utils.bytesToBase64(sessionAuthenticator),
      session_payload: request.session_payload
    };

    this.response = utils.objToSafeBase64(responseObj);

    return this.response;
  }
}
