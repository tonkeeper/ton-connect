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

  // @return {string} LXgeNOLpvLFtgjeyY=...
  const response = tonlogin.createResponse({
    service: '...',
    seed: '...',
    realm: 'web',
    payload: {
      tonAddress: () => ({ address }),
      tonOwnership: ({ clientId }) => {        
        const signature = tonlogin.createTonOwnershipSignature({
          secretKey: privateKey,
          walletId: 12345,
          address: '...',
          clientId
        })

        return {
          wallet_version: 'v3R4',
          wallet_id: 12345,
          pubkey: publicKey, 
          address: '...',
          signature,
        }
      }
    }
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
