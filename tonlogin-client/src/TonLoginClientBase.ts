import { AuthRequest, AuthRequestBody, CreateResponseArgs } from "./TonLoginClient.types";
import { TonLoginClientError } from "./TonLoginClientError";

export abstract class TonLoginClientBase {
  public abstract version: string;
  protected request: AuthRequest;
  protected response: string | null = null;
  
  constructor(request: AuthRequest) {
    this.request = request;
  }

  public abstract createResponse(options: CreateResponseArgs): Promise<string>;

  public getResponse() {
    if (!this.response) {
      throw new TonLoginClientError('Response not created yet')
    }

    return this.response
  }

  public getRequestBody(): AuthRequestBody {
    return this.request[this.version];
  }
}