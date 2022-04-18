type MaybePromise<T> = T | Promise<T>;

export enum AuthPayloadType {
  ADDRESS = 'ton-address',
  OWNERSHIP = 'ton-ownership'
}

export type AuthRequestPayload = {
  type: AuthPayloadType;
  required: boolean;
}

export type AuthResponsePayload = {
  type: AuthPayloadType.ADDRESS;
  address: string;
} | {
  type: AuthPayloadType.OWNERSHIP;
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
  walletId: number; 
  address: string;
  clientId: string;
  secretKey: Uint8Array;
}

export type PayloadExtractorsOptions = {
  clientId: string;
}

export type PayloadExtractors = {
  tonAddress?: (opts: PayloadExtractorsOptions) => MaybePromise<{
    address: string;
  }>;
  tonOwnership?: (opts: PayloadExtractorsOptions) => MaybePromise<{
    pubkey: Uint8Array;
    wallet_id: number | null;
    wallet_version: string;
    address: string;
    signature: string;
  }>;
}

export const PayloadExtractorNames = {
  [AuthPayloadType.ADDRESS]: 'tonAddress',
  [AuthPayloadType.OWNERSHIP]: 'tonOwnership'
};
