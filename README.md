# TON Connect

⚠️ THIS IS AN EXPERIMENTAL CRYPTOGRAPHIC PROTOCOL. USE AT YOUR OWN RISK.

This library contains necessary functionality to implement TON Connect on the client and the server.

[📄 Specification](TonConnectSpecification.md)

## How to run the demo

```
cd server-example
yarn install
yarn start
```
## Install TonLoginServer
```
yarn add @tonapps/tonlogin-server
```
## How to use the server API

TODO: bring this up to date.

```js
// Generate static secret with generateServerSecret();
// and put static secret to env vars or config
import { generateServerSecret } from '@tonapps/tonlogin-server';
console.log(generateServerSecret());


// Create a TonLogin object configured with a static secret.
const tonlogin = new TonLoginServer({ staticSecret: "%fsa$tgs..." });

// When we need to authenticate the user, create an authentication request:
const request = tonlogin.generateAuthRequest({
    image_url: '<logo-url>',
    return_url: '<endpoint-url>',
    items: [{
        type: 'ton-address', 
        require: true
    }],
})

res.send(request);
 
// Example: Tonkeeper deeplink:
// Provide the user with the URL to download that request.
const requestURL = `example.com/myrequest`;
const deeplinkURL = `https://app.tonkeeper.com/ton-login/${requestURL}`;
```

Decode Auth Response

```js
const decodedResponse = tonlogin.decodeAuthResponse(encodedResponse);

console.log(decodedResponse.client_id, decodedResponse.payload);
```

[AuthPayload specification](TonConnectSpecification.md#auth-payload)





