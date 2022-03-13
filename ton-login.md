# TON Login

* [Overview](#overview)
* [Definitions](#definitions)
* [Protocol](#protocol)

## Overview

TON Login allows users sign into services and apps with their wallet, using their secret key as a password.

This is not the protocol for signing on-chain transactions. See [TON Auth](ton-auth.md) for the transaction confirmation protocol.

### Scenarios

TON Login covers the following scenarios:

1. Log into desktop app or website using mobile wallet.
2. Log into website on mobile and authorize on the same device.
3. Log into the widget inside the mobile wallet.
4. Log into a serverless app via browser extension.

### Features

* Unique identifiers for each service to prevent cross-service tracking.
* Explicit control over data shared with the service (wallet address, email etc.)
* Repeated authentication for confirming operations on the service (off-chain).

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

Authenticator contains arbitrary [session payload](#session-payload).

```
SessionAuthenticator = crypto_box(payload, nonce, SessionPk, ClientSk)
```

### Session Payload






## Protocol 

**Service** generates [Session Keypair](#session-keypair) and provides a link to authenticate with a TON wallet.




