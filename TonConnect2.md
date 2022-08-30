# TON Connect 2

* [Overview](#Overview)
* [Workflows](#Workflows)
* [Compatibility](#Compatibility)
* [Definitions](#Definitions)
* [Requests and Responses](#Requests-and-Responses)

## Overview

TON blockchain enables creation of trust-minimized applications and services.

TON apps control various assets (coins, tokens, NFTs etc.) according to the publicly auditable and immutable logic performed by the blockchain. This way users do not have to place trust in closed private systems to not censor or steal their money.

Access to TON apps is controlled by the wallets: regular applications that keep users’ cryptographic keys on their devices. Wallets enable users to sign into applications and authorize blockchain transactions.

The goal of Ton Connect is to enable smooth and safe interaction between _wallets_, _services_ and _apps_.

### Features of Ton Connect

**Transaction authorization**: apps and services use Ton Connect to request transaction signature from the user’s wallet. Ton Connect offers convenient and secure protocol to approve transaction in one click.

**Sign-in without passwords**: users may register and sign into a service with just their TON wallet without having to create and memorize additional passwords.

**Apps identification**: Ton Connect uses TON DNS to securely identify apps and services to the users without relying on centralized 3rd parties.


### Apps vs services

In this specification we use the following terminology:

**App** is a software that runs on behalf of the user and does not rely on a dedicated backend server for accessing users’ data.

**Service** is a software that runs on behalf of its operator, stores users’ data and regulates access to the data.

For TON Connect the distinction lies in the fact that service has its own offchain identity and may request [identification of the user](#user-identification). Apps run on behalf of the user, so identifying the user does not make much sense, while app’s own identity is defined by its smart contract address.

### Decentralized vs centralized apps

In the above definitions apps are considered decentralized and services considered centralized. 
In reality, there is a spectrum of trust-minimization and each specific app or service may rely on some centralized infrastructure.

Both apps and services are often non-custodial for the security reasons. Instead of managing cryptographic keys that hold users’ funds they rely on wallet apps to approve and sign transactions on behalf of the users. Wallet apps themselves are often non-custodial too: they store secret keys securely on their users’ devices and never communicate them to other computers on the network.


### User authentication

Decentralized apps (dapps) authenticate users within smart contracts using origin wallet address (also known as `sender`). Centralized services run on the servers, may store user’s data and rely on “sign in” functionality of Ton Connect to authenticate the user with a cryptographic key derived from the wallet secret seed. 

Both apps and services have a similar UX of “Connect Wallet” flow to establish a communication channel between the app and the wallet for sending transaction signing requests.

### App authentication

Apps are authenticated using [TON DNS](https://ton.org/docs/#/web3/dns) protocol.

Decentralized apps may use `sha256("wallet")` key for the smart contract address. 
When the wallet receives request to sign a message to a smart contract with a given **.ton** name, a valid and up-to-date DNS record would be used to authenticate that contract address with that name.

Centralized services may also use `sha256("tonconnect.app-pk")` key to specify 32-byte [app public key](#app-keypair) used to initiate authentication requests to the wallet. The key should be stored on the online server and can be frequently rotated via TON.DNS record update.


## Workflows

### Connect workflow

1. [App](#app) or [service](#service) prepares [ConnectRequest](#ConnectRequest) and displays a QR code and a button to let the [wallet](#wallet) connect.
2. User scans the QR or clicks the button.
3. Wallet shows confirmation dialog that shows the wallet address communicated to the app.
4. Wallet stores app’s web address (if provided) in the list of connected services.
5. Wallet sends/redirects the user back to the app with the reply: [ConnectResponse](#ConnectResponse) containing its address and optional push URL.
6. App initializes its UI using the provided address.

### Service authorization

This is for “offchain” operations: where the wallet responds with authorization to a service directly instead of signing a transaction.

1. User presses a button in the [service](#service).
2. Service requests authorization of some action by the user.
3. Wallet shows confirmation dialog with the details of the authorization.
4. User confirms.
5. Wallet sends/redirects the user back to the app with the reply.
6. Service performs the requested action (updates its database, makes blockchain transactions of its own etc.).

### Transaction authorization

This is for the “onchain” operations: transactions signed by the wallet and sent by the user directly from their wallet.

1. User presses a button in the [app](#app).
2. App/service requests authorization of some action by the user.
3. Wallet shows confirmation dialog with the details of the authorization.
4. User confirms.
5. Wallet publishes the transaction.
6. Wallet sends/redirects the user back to the app/service with the reply.
7. App/service publishes the transaction.


## Compatibility

Workflow of TON Connect 2.0 is similar to the original 1.0 and should be easy to adopt by the apps and services.

To keep compatibility with Connect 1.0 the [ConnectRequest](#ConnectRequest) can be merged together with the request object from 1.0: the wallet will see both keys `v1` and `v2`: the older wallet will follow up with v1 version, the newer wallets will use v2.

In the future v1 could be completely phased out as users update to newer versions of their wallets.


## API

### URL formats


`ton-connect://`
`https://<wallet-url>/ton-connect/<base64url(Request)>`
`https://<wallet-url>/ton-connect-url/<url>`



## Protocol specification

### Cryptographic primitives

We use conservative and widely available cryptographic primitives: NaCl for signatures and encryption (Curve25519, Salsa20+Poly130), SHA2-256 and SHA2-512 for key drivation.

### Serialization format

For serialization we use TL-B serialization format. TL-B is expressive, extensible, already used by TON apps and offers necessary precision for cryptographic uses.

### App

**App** is a software that runs on behalf of the user and does not rely on a dedicated backend server for accessing users’ data.


### Service

**Service** is a software that runs on behalf of its operator, stores users’ data and regulates access to the data.


### Wallet

Application that keeps user’s keys and authorizes access to the [app](#app) and signs blockchain transactions.


### App keypair

App keypair is used to sign requests from the app or service. 

Decentralized apps may generate a random keypair per installation or session.

Services generate it infrequently and store the public key in the DNS record to authenticate the service.

Public and private 32-byte keys generated using Crypto Box API in NaCl.

```
(AppPk, AppSk) = crypto_box_keypair()
```


### Wallet Seed

Secret 24-word recovery phrase that is a root secret to all the keys.

See [tonweb-mnemonic](https://github.com/toncenter/tonweb-mnemonic) for definition.


### Root Connect Key

256-bit secret key used for authentication purposes. This key may be stored separately from the [Wallet Seed](#wallet-seed) with more convenient protection mode.

```
RootConnectKey = HMAC-SHA256(key: "TonConnect.Root", data: WalletSeed)
```

### Client Keypair

Per-service keypair used to authenticate the user. 

The keypair remains _the same for all sessions_ for the given service. Client public key is the [Client ID](#client-id).

First, a 256-bit _client secret_ is derived from the [Root Connect Key](#root-connect-key) and [App Public Key](#app-keypair)

```
ClientSecret = HMAC-SHA256(key: AppPk, data: RootConnectKey)
```

Then, the public and private 32-byte keys are generated using Crypto Box API in NaCl.

```
(ClientPk, ClientSk) = crypto_box_seed_keypair(ClientSecret)
```

### Client ID

The public key part of the [Client Keypair](#client-keypair) used as a stable identifier of the client.




## Requests and Responses

* [ConnectRequest](#ConnectRequest)
* [ConnectResponse](#ConnectResponse)
* [AuthRequest](#AuthRequest)
* [AuthResponse](#AuthResponse)
* [TxRequest](#TxRequest)
* [TxResponse ](#TxResponse)


### Reply Options

App or service may receive replies in various forms. To tell the wallet how the reply should be delivered use one or several options:

* `reply.payload`: (optional) arbitrary data that **must** be returned by the client back to the service.
* `reply.return`: (optional) URL that user opens on their device after successful connect. This will include the [ConnectResponse](#ConnectResponse) in a query string under the key `tonconnect`.
* `reply.serverless` (optional): boolean value indicating that `tonconnect` parameter must be provided as a URL anchor (via `#`). Example: `https://example.com/...#tonconnect=`. 
* `reply.callback` (optional): URL that user opens on their device after successful login. [ConnectResponse](#ConnectResponse) will be included in a query string under the key `tonconnect`.


### ConnectRequest

A JSON-encoded object with the following structure for each version of the login request:

```
{
    "protocol": "ton-auth",
    "v2": {
       "body": (base64-encoded signed ConnectRequestBody),
       "pk": (base64-encoded public key),
       "dns": "example.ton",
    }
}
```

`body` is encoded through `NaCl.crypto_sign` using `pk`’s corresponding private key and JSON encoding of the [ConnectRequestBody](#ConnectRequestBody). Wallet unpacks body and checks signature using the `NaCl.crypto_sign_open` function.

TON.DNS name is optional (`dns` key) and when provided MAY link to the `pk` public key in its record `sha256("tonconnect.app-pk")`.

Standalone apps may provide this name, but would generate public key randomly. In such case the wallet will test that the `reply` structure links to the URLs blessed by the domain name.

If `dns` is not provided, the app is considered unknown.

### ConnectRequestBody

A JSON-encoded object with the following layout:

```
{
    "type": "v2-connect-req",
    "info": {...},
    "items": [...],
    "reply": {...},
}
```

Fields:

`info`: struct `{dns:..., app:..., about:...}` where:
* `info.dns`: TON.DNS name ending with `.ton`.
* `info.app`: optional URL of the app that could be opened within the wallet as a widget;
* `info.about`: optional URL that leads to the documentation or landing page of the app/service;

Note: the image data or URL is provided within the DNS per the [TON Token data standard](https://github.com/ton-blockchain/TIPs/issues/64). Maybe the app/about links should be offered 

`items`: array of requested [data items](#ConnectRequestItem) to be shared by the user.

`reply`: see [Reply Options](#Reply-Options).


### ConnectRequestItem

One of the following strings:

* `{"type": "ton-addr"}`: address of the TON wallet. Provided with a cryptographic proof.

Unknown items should be ignored by the wallet for backwards compatibility. Newer versions may introduct different types and provide old ones for compatibility (e.g. hypothetical `ton-addr-v3`); in such case the wallet will ignore the older one and reply with the newer item instead.



### ConnectResponse

ConnectResponse contains [response body](#ConnectResponseBody) encrypted towards [App Public Key](#app-keypair) using `NaCl.crypto_box`:

```
nonce = random(24 bytes)
body = NaCl.crypto_box(ConnectResponseBody, nonce, AppPk, ClientSk)
```

ConnectResponse layout:

```
{
    "type": "v2-connect-resp",
    "nonce": Base64(nonce),
    "body": Base64(ConnectResponseAuthenticator),
}
```

### ConnectResponseBody

Connect response returns the requested data items, optional `"push"` description for delivering further requests and the user’s locale.

```
{
    "type": "v2-connect-resp",
    "items": [
        {
            "type": "ton-addr",
            "value": "EQrt...s7Ui",
            "pubkey": "Pub6...2k3y", // base64-encoded Ed25519 public key
            "signature": "Gt562...g5s8D=", // base64-encoded ed25519 signature
            "wallet_id": null | integer, // should be omitted in most cases
            "wallet_version": "v4R2", // supported values: "v3R1", "v3R2", "v4R1", "v4R2"
        }
    ],
    "push": {
        "url": "https://api.example.com/...",
        "headers": {
            "X-Push-ID": "f8a90d7edad893...",
        },
    },
    "lang-iso639-1": "en" | "zh" | ... 
}
```

### ton-addr

User provides the address with the proof of ownership.

If you store some user-specific data in the DB, then make sure to use [client ID](#client-id) as a reliable identifier.

This feature is limited to the simple individual wallets: multisig/lockup and smart contract wallets are not supported.

Request:

```
{
    "type": "ton-addr",
}
```

Response:

```
{
    "type": "ton-addr",
    "address": "EQrt...s7Ui",    
    "pubkey": "Pub6...2k3y", // base64-encoded Ed25519 public key
    "signature": "Gt562...g5s8D=", // base64-encoded ed25519 signature
    "wallet_id": null | integer, // should be omitted in usual cases
    "wallet_version": "v4R2", // supported values: "v3R1", "v3R2", "v4R1", "v4R2"
}
```

To create/verify the signature, construct the following message for Ed25519 algorithm:

```
"tonconnect/ton-addr/" || <wallet_version> || "/" || <address> || "/" || <client_id>
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



### AuthRequest

AuthRequest is suitable for centralized services to confirm offchain actions via the wallet.

A JSON-encoded object with the following layout:

```
{
    "protocol": "ton-auth",
    "v2": {
       "body": (base64-encoded signed AuthRequestBody),
       "pk": (base64-encoded public key),
       "dns": "example.ton",
    }
}
```


### AuthRequestBody

A JSON-encoded object with the following layout:

```
{
    "type": "v2-auth-req",
    "info": {...},
    "payload": ..., // arbitrary data (string/object) for signing by the user.
    "details": "...", // human-readable description of the action
    "reply": {...},
}
```

### AuthResponse

AuthResponse contains [response body](#AuthResponseBody) encrypted towards [App Public Key](#app-keypair) using `NaCl.crypto_box`:

```
nonce = random(24 bytes)
body = NaCl.crypto_box(AuthResponseBody, nonce, AppPk, ClientSk)
```

AuthResponse layout:

```
{
    "type": "v2-auth-resp",
    "nonce": Base64(nonce),
    "body": Base64(AuthResponseAuthenticator),
}
```

### AuthResponseBody

```
{
    "type": "v2-auth-resp",
    "payload": ... // arbitrary data as specified in the AuthRequestBody
}
```






### TxRequest

TxRequest is suitable for all apps and services to confirm onchain transactions.

A JSON-encoded object with the following layout:

```
{
    "type": "v2-tx",
    "tx": {
       "body": (base64-encoded signed TxRequestBody),
       "pk": (base64-encoded public key),
    }
}
```


### TxRequestBody

A JSON-encoded object with the following layout:

```
{
    "type": "tx",
    "tx": {
        "info": {...},
        "reply": {...},
        "source": ...,
        "valid_until": ...,
        "messages": [...]
    }
}
```

Parameters:

* `source` (string, optional): sender address. Provided in case the source of transaction is important to the dapp. Wallet application must select the appropriate wallet contract to send the message from, or post an error if it does not have the keys to that specific address.
* `valid_until` (integer, optional): unix timestamp. after th moment transaction will be invalid.
* `messages` (array of messages): 1-4 outgoing messages from the wallet contract to other accounts. All messages are sent out in order, however **the wallet cannot guarantee that messages will be delivered and executed in same order**.

Message structure:
* `address` (string): message destination
* `amount` (decimal string): number of nanocoins to send.
* `payload` (string base64, optional): raw one-cell BoC encoded in Base64.
* `stateInit` (string base64, optional): raw once-cell BoC encoded in Base64.

Wallet simulates the execution of the message and present to the user summary of operations: "jetton XYZ will be transferred, N toncoins will be sent" etc.

Common cases:

1. No `payload`, no `stateInit`: simple transfer without a message.
2. `payload` is prefixed with 32 zero bits, no `stateInit`: simple transfer with a text message.
3. No `payload` or prefixed with 32 zero bits; `stateInit` is present: deployment of the contract.

Example:

```json5
{
  "source": "0:E8FA2634A24AEF18ECB5FD4FC71A21B9E95F05768F8D9733C44ED598DB106C4C",
  "valid_until": 1658253458,
  "messages": [
    {
      "address": "0:412410771DA82CBA306A55FA9E0D43C9D245E38133CB58F1457DFB8D5CD8892F",
      "amount": "20000000",
      "initState": "base64bocblahblahblah==" //deploy contract
    },{
      "address": "0:E69F10CC84877ABF539F83F879291E5CA169451BA7BCE91A37A5CED3AB8080D3",
      "amount": "60000000",
      "payload": "base64bocblahblahblah==" //transfer nft to new deployed account 0:412410771DA82CBA306A55FA9E0D43C9D245E38133CB58F1457DFB8D5CD8892F
    }
  ]
}
```

### TxResponse

TxResponse contains [response body](#TxResponseBody) encrypted towards [App Public Key](#app-keypair) using `NaCl.crypto_box`:

```
nonce = random(24 bytes)
body = NaCl.crypto_box(TxResponseBody, nonce, AppPk, ClientSk)
```

TxResponse layout:

```
{
    "type": "v2-tx-resp",
    "nonce": Base64(nonce),
    "body": Base64(TxResponseAuthenticator),
}
```

### TxResponseBody

Response body contains the bag-of-cells serialization of the signed message.

```
{
    "type": "v2-tx-resp",
    "tx-boc": Base64(Tx-BoC)
}
```


