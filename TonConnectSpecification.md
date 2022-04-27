# TON Connect

* [Overview](#overview)
* [Definitions](#definitions)
* [Web protocol](#web-protocol)

## Overview

TON Connect allows users sign into services and apps with their wallet, using their secret key as a password.

This is not the protocol for signing on-chain transactions. See [TON Auth](ton-auth.md) for the transaction confirmation protocol.

### Scenarios

TON Connect covers the following scenarios:

1. Log into desktop app or website using mobile wallet.
2. Log into website on mobile and authorize on the same device.
3. Log into the widget inside the mobile wallet.
4. Log into a serverless app via browser extension.

### Features

* Unique identifiers for each service to prevent cross-service tracking.
* Explicit control over data shared with the service (wallet address, email etc.)
* Repeated authentication for confirming operations on the service (off-chain).
* Protocol does not permit accidental signing of blockchain transactions.

### TON wallet address

Important: the TON address should not be used as an identifier of the client. The only authenticated client identifier is [Client ID](#client-id), that is unique to each service and stable across sessions.

The client may provide a TON address that they do not directly control (e.g. multisignature wallet), 
or the one with a different recovery phrase.

### Cryptography

For simplicity and ease of integration in multitude of platforms and programming languages, we use the following:

* HMAC-SHA256 as a  KDF;
* Ed25519 and X25519 through [NaCl](https://nacl.cr.yp.to/box.html) APIs for key derivation and authentication protocols.



## Definitions

### Encoding

All string literals are encoded in UTF-8 without length prefixes or null-terminators.

### Wallet Seed

Secret 24-word recovery phrase that is a root secret to all the keys.

See [tonweb-mnemonic](https://github.com/toncenter/tonweb-mnemonic) for definition.

### Root Login Key

256-bit secret key used for authentication purposes. This key may be stored separately from the [Wallet Seed](#wallet-seed) with more convenient protection mode.

```
RootLoginKey = HMAC-SHA256(key: "TonLogin.Root", data: WalletSeed)
```

### Service Login Key

256-bit secret key specific to a given service derived from [Root Login Key](#root-login-key).

The service is defined by two strings: `realm` and `name`. Each login key is mapped one-to-one to such pair of strings.

All web-based services set `realm="web"`. Telegram channels and bots may use `realm="telegram"`, but one should note that [Client ID](#client-id) would be different when logging into the same service through the web.

```
ServiceLoginKey = HMAC-SHA256(key: realm + ":" + name , data: RootLoginKey)
```

### Client Keypair

Per-service keypair used to authenticate the client. 

The keypair remains _the same for all sessions_ for the given service. Client public key is the [Client ID](#client-id).

Public and private 32-byte keys generated using Crypto Box API in NaCl.

```
(ClientPk, ClientSk) = crypto_box_seed_keypair(ServiceLoginKey)
```

### Client ID

The public key part of the [Client Keypair](#client-keypair) used as a stable identifier of the client.

### Session Keypair

Session keypair is generated from random by the service (not the client) and unique to each login session (including repeated sessions).

Public and private 32-byte keys generated using Crypto Box API in NaCl.

```
(SessionPk, SessionSk) = crypto_box_keypair()
```

### Session Nonce

Nonce is 24-byte string generated from random _by the client_.

```
SessionNonce = crypto_box_random_nonce()
```

### Session Authenticator

Authenticator is a binary string that proves to the Service that the current session (represented by the [Session Keypair](#session-keypair)) is correctly authenticated by the [Client ID](#client-id).

Authenticator contains [Auth Payload](#auth-payload) provided to the crypto_box as a binary string.

```
SessionAuthenticator = crypto_box(payload, SessionNonce, SessionPk, ClientSk)
```

Session Authenticator is verified using the [Client Public key](#client-keypair) and the nonce.
The successful verification returns the [Auth Payload](#auth-payload) object.

```
AuthPayload = crypto_box_open(SessionAuthenticator, SessionNonce, ClientPk, SessionSk)
```


### Auth Request

A JSON-encoded object with the following structure for each version of the login request:

```
{
    "protocol": "ton-auth",
    "v1": {
       (fields)
    }
}
```

Fields in the v1 object:

`session`: Base64-encoded [Session Public Key](#session-keypair).

`session_payload`: Base64-encoded arbitrary [session payload](#session-payload) that **must** be returned by the client back to the server.

`action` (optional): localized string describing the action on the service. For a regular login this should be left empty.

`image_url` (optional): URL of the image to display to the user.

`return_url` (optional): URL that user opens on their device after successful login. This will include the [Auth Response](#auth-response) in a query string under the key `tonlogin`.

`return_serverless` (optional): boolean value indicating that `tonlogin` parameter must be provided as a URL anchor (via `#`). Example: `https://example.com/...#tonlogin=`. 

`callback_url` (optional): URL that user opens on their device after successful login. [Auth Response](#auth-response) will be included in a query string under the key `tonlogin`.

`items` (optional): array of requested [data items](#auth-request-items) to be shared by the user. 

Items are declared as objects with `type` and `required` fields. 

Unknown fields are ignored.

`required` flag is merely for user’s convenience to indicate that it does not make sense to login without providing such data, but the service should check all the received data themselves and react accordingly.

Example:

```
{
    "protocol": "ton-auth",
    "v1": {
        "session": Base64(SessionPk),
        "session_payload": "...",
        "action": "Confirm adding the @username to the list of admins",
        "image_url": "https://example.com/logo.png",
        "return_url": "https://example.com/myprofile",
        "callback_url": "https://example.com/tonlogin",
        "items": [
            {
                "type": "ton-address",
                "required": true,
            }
        ],
    }
}
```

### Auth Request Items

#### ton-address

Note: this item does not provide **proof of ownership** of the address. Thus, it permits using any TON address just like a "contact item", such as email or phone number.

If your dapp has read-only access to blockchain, it is sufficient to ask for this type of item, since user will be explicitly authorizing transactions from that address; if the user cheated and provided someone else's address, then they won't be able to do anything on blockchain with that address.

If you store some user-specific data in the DB, then make sure to use [client ID](#client-id) as a reliable identifier.

Request:

```
{
    "type": "ton-address",
    "required": true | false,
}
```

Response:

```
{
    "type": "ton-address",
    "address": "EQrt...s7Ui",
}
```

#### ton-ownership

Similar to [`ton-address`](#ton-address), but comes with a proof of ownership.

This is restricted to simple individual wallets: multisig/lockup and smart contract wallets are not supported.

Use this item when you actually need a proof of ownership of some on-chain data. Say, when you want to attach a picture from the user’s NFT to your centralized system.

Request:

```
{
    "type": "ton-ownership",
    "required": true | false,
}
```

Response:

```
{
    "type": "ton-ownership",
    "address": "EQrt...s7Ui",    
    "pubkey": "Pub6...2k3y", // base64-encoded Ed25519 public key
    "signature": "Gt562...g5s8D=", // base64-encoded ed25519 signature
    "wallet_id": null | integer, // should be omitted in usual cases
    "wallet_version": "v4R2", // supported values: "v3R1", "v3R2", "v4R1", "v4R2"
}
```

To create/verify the signature, construct the following message for Ed25519 algorithm:

```
"tonlogin/ownership/" || <wallet_version> || "/" || <address> || "/" || <client_id>
```

where:

* `wallet_version` is encoded in ASCII, verification fails for unsupported values,
* `address` is encoded in ASCII (standard user-readable, as provided in the request params),
* `client_id` is a 32-byte binary [Client ID](#client-id).

The resulting signature is bound to the user's public key, the service (via Client ID) and the concrete wallet version.

**Note:** the proof is bound to the [Client ID](#client-id) and can be replayed across multiple sessions authenticating with the same client ID. This is by design, since the supported addresses do not support key rotation: if the user were able to demonstrate ownership once, they would normally be able to do it going forward.

Validation rules:

1. Construct wallet contract using the `pubkey`, `wallet_id` and `wallet_version` (`wc` could be read from the `address`).
2. Check that the wallet contract address is equal to `address`.
3. Verify the `signature` using the `pubkey`.
4. Return `address` as TON address with verified ownership.


### Auth Response

Response is an envelope around the authenticator object.

Client copies value `session_payload` from the [Auth Request](#auth-request) into the response object as-is.

```
{
    "version": "v1", // version corresponding to the request version
    "nonce": Base64(SessionNonce),
    "clientid": Base64(ClientID),
    "authenticator": Base64(SessionAuthenticator),
    "session_payload": SessionPayload,
}
```

### Session Payload

Session payload is an opaque data object that the service sends over to the client and receives back. This could be used to implement [stateless](#stateless-session-payload) storage for the [session key](#session-keypair).


### Auth Payload

Payload inside the [authenticator](#session-authenticator) contains the shared data items and is encoded in JSON.
Any item may be missing if the user chose not to share it or it is not supported by the client.

```
{
    "items": [
        {
            "type": "ton-address",
            "value": "EQrt...s7Ui",
        }
    ]
}
```

### Response encoding in the URLs

Upon user’s confirmation, `return_url` and `callback_url` have `tonlogin` query string parameter `tonlogin` added with UrlSafeBase64-encoded [Auth Response](#auth-response).

Examples:

```
https://example.com/auth/?tonlogin=...
https://example.com/auth/?foo=bar&tonlogin=...
```

Serverless example of `return_url`:

```
https://example.com/auth/#tonlogin=...
```


## Web protocol 

**Service** generates [Session Keypair](#session-keypair) and forms the [Auth Request](#auth-request).

**Service** uses `session_payload` to store encrypted [Session secret key](#session-keypair) and the expiration timestamp on the client’s side. See one possible format for this below: [Stateless Session Payload ](#stateless-session-payload).

The request object is encoded in Base64 and could be wrapped in the link in the following flavors.

(1) Link with custom schema that can be handled by any wallet app:

```
ton-login://<scheme-less-url>
```

(2) Universal link aka deeplink for the Tonkeeper (similarly for other wallets):

```
https://app.tonkeeper.com/ton-login/<scheme-less-url>
```

Examples:

```
ton-login://example.com/...
https://app.tonkeeper.com/ton-login/example.com/...
```

Clients should use HTTPS (TLS) scheme to download the request object.

(3) QR code shall encode the direct link to the downloadable request object.

```
https://example.com/...
```

**Client** downloads the [Auth Request](#auth-request), verifies TLS certificate.

**Client** derives [Client Keypair](#client-keypair) `realm="web"` and `name` set to the hostname.

**Client** verifies the existence of `"v1"` key in the request object and presence of either `return_url` or `callback_url` (both fields are also allowed).

**Client** displays confirmation panel to the user.

**Client** forms the [Auth Response](#auth-response).

Client places [Session Payload](#session-payload) from the request into the response.

If the `callback_url` is present: **client** sends the callback with the `tonlogin` parameter containing.

Upon successful response (HTTP 200), shows either a confirmation checkmark or a button to go back via `return_url` (also, with `tonlogin` appended).

If the `callback_url` is missing, then **client** shows the button with `return_url` (with `tonlogin` appended).

When **server** receives the [Auth Response](#auth-response), opens up [Auth Payload](#auth-payload) and marks [Client ID](#client-id) as logged-in.



## Stateless Session Payload

One way the server may keep track of the session liveliness is to store encrypted session secret key on the client side in-between requests via [Session Payload](#session-payload).

**Note:** this is not part of the core specification since it does not affect communication protocol between the client and the server. Each server may have a different strategy to handle this data.

Session Payload is a binary string produced by NaCl "secretbox" that encrypts **Session Data** via a static pre-generated symmetric encryption key.

```
SessionPayload = nonce || nacl.secretbox(SessionData, nonce, key)
```

**SessionData** format:

```
{
  "tonconnect": {
    "exp": <UTC timestamp in sec>,
    "sk": SessionSecret, // session secret key
  },
  "data": ... 
}
```

where: 

* `tonconnect.exp` — expiration timestamp (UTC, in seconds).
* `tonconnect.sk` — session secret key,
* `data` — application-specific data that the server wishes to remember during the authentication session.

Example of the API (draft):

```js
tonconnect.createRequest(..., sessionData: {...})
```




