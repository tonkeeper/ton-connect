# TON Login (⚠️ EXPERIMENTAL)

This library contains necessary functionality to implement Ton Login on the client and the server.

[📄 Specification](TonLoginSpecification.md)

## How to run the demo

```
cd server-example
yarn install
yarn start
```


## How to use the server API

TODO: this is outdated.

```js
// Create a TonLogin object configured with a static secret.
// ...

const tonlogin = new TonLoginServer({staticSecret: "%fsa$tgs..."});

// When we need to authenticate the user, create an authentication request:

const request = tonlogin.generateAuthRequest({
    ...
})

// Display the request to the user:

const encodedRequest = request.encode(); // url-safe base64-encoded data

// Example: Tonkeeper deeplink:

// 1. Save the encodedRequest in the DB
// 2. Provide the user with the URL to download that request.
const requestURL = `example.com/myrequest`;
const deeplinkURL = `https://app.tonkeeper.com/ton-login/${requestURL}`;


// The user may respond in different ways (URL parameter, URL anchor, via the callback etc.)

```



