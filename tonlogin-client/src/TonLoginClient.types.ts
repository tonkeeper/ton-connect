export enum AuthPayloadType {
  ADDRESS = 'ton-address',
  OWNERSHIP = 'ton-ownership'
}

export type AuthRequestPayload = {
  type: AuthPayloadType;
  required: boolean;
}

export type AuthResponsePayload = {
  type: Extract<AuthPayloadType, 'ton-address'>;
  address: string;
}

export type AuthRequestBody = {
  session: string;
  session_payload: string;
  action: string;
  image_url: string;
  return_url?: string;
  callback_url?: string;
  return_serverless?: boolean;
  items: AuthRequestPayload[];
};

export type AuthRequest =  {
  protocol: string;
} & {
  [key: string]: AuthRequestBody;
};

export type AuthResponse = {
  version: string;
  nonce: string;
  client_id: string;
  authenticator: string;
}

export type ExtractPayloadFunc = (
  type: AuthPayloadType,
  required: boolean
) => Omit<AuthResponsePayload, 'type'> | undefined;

export type CreateResponseArgs = {
  extractPayload: ExtractPayloadFunc;
  serviceName: string;
  walletSeed: string;
  realm: string;
}