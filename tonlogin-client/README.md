# Implementation for the client side

## How to use 

```
$ yarn add @tonapps/tonlogin-client
```

```js
import { TonLoginClient, TonLoginClientError,  AuthPayloadType } from '@tonapps/tonlogin-client';

// This Auth Request received from @tonapps/tonlogin-server
const request = {
  "protocol": "ton-auth",
  "v1": {
    "session": "+tgaXx/...",
    "session_payload": "YlMIQkS...",
    "image_url": "...",
    "return_url": "...",
    "items": [
      {
        "type": "ton-address",
        "require": true
      }
    ]
  }
};

try {
  
  // If a validation error occurs, constructor throw exception.
  const tonlogin = new TonLoginClient(request);

  const extractPayload = (type: AuthPayloadType) => {
    if (type === AuthPayloadType.ADDRESS) {
      return { address: '...' };
    }
  }

  // @return {string} LXgeNOLpvLFtgjeyY=...
  const response = tonlogin.createResponse({
    extractPayload,
    serviceName: '...',
    walletSeed: '...',
    realm: 'web', 
  });
  

  // @return {string} LXgeNOLpvLFtgjeyY=...
  // Throws an exception if the response has not yet been created
  tonlogin.getResponse();
  
  // @return {Object} {
  //   "session": "+tgaXx/...",
  //   "session_payload": "YlMIQkS...",
  //   "items": [...]
  //   ...
  // }
  tonlogin.getRequestBody();

} catch (error) {
  if (error instanceof TonLoginClientError) {
    debugLog(error);
  }
}
```
