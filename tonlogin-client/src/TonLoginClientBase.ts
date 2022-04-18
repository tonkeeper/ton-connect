import { AuthRequest, AuthRequestBody, AuthRequestPayload, AuthResponsePayload, CreateResponseOptions, CreateTonOwnershipSignatureOptions, PayloadExtractorNames, PayloadExtractors, PayloadExtractorsOptions } from "./TonLoginClient.types";
import { TonLoginClientError } from "./TonLoginClientError";

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
      throw new TonLoginClientError('Response not created yet')
    }

    return this.response
  }

  public getRequestBody(): AuthRequestBody {
    return this.request[this.version];
  }

  protected async extractPayload(
    request: AuthRequestPayload[], 
    extractors: PayloadExtractors,
    extractorOptions: PayloadExtractorsOptions
  ) {
    const response: AuthResponsePayload[] = [];
    for(let item of request) {
      const extractorName = PayloadExtractorNames[item.type];
      const extractor = extractors[extractorName];

      const payload = await extractor?.(extractorOptions);

      if (payload) {
        response.push(payload);
      }
    }

    return response;
  }
}