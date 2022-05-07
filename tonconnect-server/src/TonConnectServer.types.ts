export enum AuthRequestTypes {
  ADDRESS = 'ton-address',
  OWNERSHIP = 'ton-ownership'
}

export type AuthRequestPayload = {
  type:`${AuthRequestTypes}`;
  required: boolean;
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

export type AuthRequest = {
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

// export type AuthResponseItems

export type SessionData = Record<string, any>;

export type CreateRequestOptions = {
  image_url: string;
  return_url?: string;
  callback_url?: string;
  return_serverless?: boolean;
  items: AuthRequestPayload[];
}

export type TonAddressPayload = {
  type: AuthRequestTypes.ADDRESS;
  address: string;
}

export type TonOwnershipPayload = {
  type: AuthRequestTypes.OWNERSHIP;
  address: string;
  pubkey: string;
  signature: string;
  wallet_id: number | null;
  wallet_version: string;
}

export type AuthResponsePayload = (
  | TonAddressPayload 
  | TonOwnershipPayload
)[];

export type DecodedResponse = {
  client_id: string;
  sessionData: SessionData;
  payload: AuthResponsePayload;
}