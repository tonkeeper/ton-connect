import { AuthRequest, CreateResponseOptions, CreateTonOwnershipSignatureOptions } from './TonLoginClient.types';
import { TonLoginClientBase } from './TonLoginClientBase';
import { TonLoginClientError } from './TonLoginClientError';
import { TonLoginClientV1 } from './TonLoginClientV1';

const versions = {
  'v1': TonLoginClientV1,
};

export class TonLoginClient extends TonLoginClientBase {
  public version = 'unknown';
  static versions = versions;

  constructor(scheme: AuthRequest) {
    super(scheme);

    const availableVersions = Object.keys(versions);
    if (!scheme['protocol']) {
      throw new TonLoginClientError('Wrong protocol')
    }

    const { protocol, ...other } = scheme;
    const version = Object.keys(other)[0] ?? ''; 
    if (!availableVersions.includes(version)) {
      throw new TonLoginClientError('Wrong protocol version');
    }

    if (!version) {
      throw new TonLoginClientError(
        `Wrong protocol version, available versions: ${availableVersions.join(',')}`
      );
    } 
    
    return new versions[version](scheme);
  } 

  public async createResponse(options: CreateResponseOptions): Promise<string> {
    throw new TonLoginClientError('Not implemented');
  }

  public createTonOwnershipSignature(options: CreateTonOwnershipSignatureOptions): string {
    throw new TonLoginClientError('Not implemented');
  }
}

export * from './TonLoginClient.types';
export { TonLoginClientError } from './TonLoginClientError';
