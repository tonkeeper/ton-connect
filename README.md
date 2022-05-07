# TON Connect

**Important:** this is an alpha version intended for review and experiments. Do not use in production until the spec is finalized.

This library contains necessary functionality to implement TON Connect on the client and the server.

[📄 TON Connect Specification](TonConnectSpecification.md)

## How to run the demo

```
cd server-example
yarn install
yarn start
```
## Install Ton Connect Server

```
$ yarn add @tonapps/tonconnect-server
```

## Generate Static Secret

```
$ npx tonconnect-generate-secret
```
Put generated static secret to env vars or config


## How to use the server API

```js
import { TonConnectServer, AuthRequestTypes } from '@tonapps/tonconnect-server';

// Create a TonConnectServer instance configured with a static secret.
const tonconnect = new TonConnectServer({ 
    staticSecret: process.env.TONCONNECT_SECRET 
});

// When we need to authenticate the user, create an authentication request:
const request = tonconnect.createRequest({
    image_url: 'https://ddejfvww7sqtk.cloudfront.net/images/landing/ton-nft-tegro-dog/avatar/image_d0315e1461.jpg',
    callback_url: `${hostname}/tonconnect`,
    items: [{
        type: AuthRequestTypes.ADDRESS,
        required: true
    }, {
        type: AuthRequestTypes.OWNERSHIP,
        required: true
    }],
});


res.send(request);
 
// Example: Tonkeeper deeplink:
// Provide the user with the URL to download that request.
const requestURL = `example.com/myrequest`;
const deeplinkURL = `https://app.tonkeeper.com/ton-login/${requestURL}`;
```

Decode Auth Response

```js
try {
    const response = tonconnect.decodeResponse(req.query.tonlogin);
    
    console.log('response', response);
    
    for (let payload of response.payload) {
        switch (payload.type) {
            case AuthRequestTypes.OWNERSHIP: 
                const isVerified = await tonconnect.verifyTonOwnership(payload, response.client_id);

                if (isVerified) {
                    console.log(`ton-ownership is verified for ${payload.address}`);
                } else {
                    console.log(`ton-ownership is NOT verified`);
                }

                break;
            case AuthRequestTypes.ADDRESS: 
                console.log(`ton-address ${payload.address}`);
                break;
        }
    }
} catch (err) {
    console.log(err);
}
```

[AuthPayload specification](TonConnectSpecification.md#auth-payload)





