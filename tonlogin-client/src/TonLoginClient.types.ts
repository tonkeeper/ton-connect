type MaybePromise<T> = T | Promise<T>;

export enum AuthRequestTypes {
  ADDRESS = 'ton-address',
  OWNERSHIP = 'ton-ownership'
}

export type AuthRequestPayload = {
  type: AuthRequestTypes;
  required: boolean;
}

export type AuthResponsePayload = {
  type: AuthRequestTypes.ADDRESS;
  address: string;
} | {
  type: AuthRequestTypes.OWNERSHIP;
  pubkey: Uint8Array;
  wallet_id: number | null;
  wallet_version: string;
  address: string;
  signature: string;
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
}

export type AuthRequest =  {
  protocol: string;
} & {
  [key: string]: AuthRequestBody;
}

export type AuthResponse = {
  version: string;
  nonce: string;
  client_id: string;
  authenticator: string;
}

export type CreateResponseOptions = {
  payload: PayloadExtractors;
  service: string;
  seed: string;
  realm: string;
}

export type CreateTonOwnershipSignatureOptions = {
  walletVersion: string; 
  address: string;
  clientId: string;
  secretKey: Uint8Array;
}

export type PayloadExtractorOptions = {
  clientId: string;
}

export type PayloadExtractors = {
  tonAddress?: (opts: PayloadExtractorOptions) => MaybePromise<{
    address: string;
  }>;
  tonOwnership?: (opts: PayloadExtractorOptions) => MaybePromise<{
    pubkey: Uint8Array;
    wallet_id: number | null;
    wallet_version: string;
    address: string;
    signature: string;
  }>;
}

export const PayloadExtractorNames = {
  [AuthRequestTypes.ADDRESS]: 'tonAddress',
  [AuthRequestTypes.OWNERSHIP]: 'tonOwnership'
}

export type СonstructPayloadOptions = {
  request: AuthRequestPayload[];
  extractors: PayloadExtractors;
  extractorOptions: PayloadExtractorOptions;
}
