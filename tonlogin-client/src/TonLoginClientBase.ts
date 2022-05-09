import { AuthRequest, AuthRequestBody, AuthResponsePayload, CreateResponseOptions, CreateTonOwnershipSignatureOptions, PayloadExtractorNames, СonstructPayloadOptions } from "./TonLoginClient.types";
import { TonConnectError } from "./TonConnectError";

export abstract class TonLoginClientBase {
  public abstract version: string;
  protected request: AuthRequest;
  protected response: string | null = null;
  
  constructor(request: AuthRequest) {
    this.request = request;
  }

  public abstract createTonOwnershipSignature(options: CreateTonOwnershipSignatureOptions): string;
  public abstract createResponse(options: CreateResponseOptions): Promise<string>;

  public getResponse() {
    if (!this.response) {
      throw new TonConnectError('Response not created yet')
    }

    return this.response
  }

  public getRequestBody(): AuthRequestBody {
    return this.request[this.version];
  }

  protected async constructPayload(options: СonstructPayloadOptions) {
    const { request, extractors, extractorOptions } = options;
    const response: AuthResponsePayload[] = [];
    for (let item of request) {
      const extractorName = PayloadExtractorNames[item.type];
      const extractor = extractors[extractorName];
      const payload = await extractor?.(extractorOptions);

      if (payload) {
        response.push({ type: item.type, ...payload });
      }
    }

    return response;
  }
}