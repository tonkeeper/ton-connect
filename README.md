# TON Login (⚠️ EXPERIMENTAL)

This library contains necessary functionality to implement Ton Login on the client and the server.

[📄 Specification](TonLoginSpecification.md)

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

TODO: this is outdated.

```js
// Create a TonLogin object configured with a static secret.
// ...

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

res.send(request)

// Example: Tonkeeper deeplink:

// 1. Save the encodedRequest in the DB
// 2. Provide the user with the URL to download that request.
const requestURL = `example.com/myrequest`;
const deeplinkURL = `https://app.tonkeeper.com/ton-login/${requestURL}`;


// The user may respond in different ways (URL parameter, URL anchor, via the callback etc.)

```



