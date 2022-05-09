import { engine } from 'express-handlebars';
import express from 'express';
import path from 'path';
import cors from 'cors';
import { TonConnectServer, AuthRequestTypes } from '@tonapps/tonconnect-server';
import { getLocalIPAddress } from './utils';

// use generateServerSecret();
const staticSecret = 'C0n0Tm4x4ACU9f0mQNEs0LPYMXIpwkKaRQYQsrc9Hx8=';
const port = 8080;

function init() {
  const host = getLocalIPAddress();
  const hostname = `${host}:${port}`;
  const app = express();
  
  app.use(cors());
  app.engine("handlebars", engine());
  app.set("view engine", "handlebars");
  app.set("views", path.resolve(__dirname, "./views"));

  const tonconnect = new TonConnectServer({ staticSecret });

  app.get('/authRequest', (req, res) => {
    const request = tonconnect.createRequest({
      image_url: 'https://ddejfvww7sqtk.cloudfront.net/images/landing/ton-nft-tegro-dog/avatar/image_d0315e1461.jpg',
      return_url: `${hostname}/tonconnect`,
      items: [{
        type: AuthRequestTypes.ADDRESS,
        required: true
      }, {
        type: AuthRequestTypes.OWNERSHIP,
        required: true
      }],
    }, {
      customField: 'some data...'
    });

    res.send(request);
  });

  app.get('/tonconnect', async (req, res) => {
    try {
      const encodedResponse = req.query.tonlogin as string;
      const response = tonconnect.decodeResponse(encodedResponse);

      const print: any = { response };

      for (let payload of response.payload) {
        switch (payload.type) {
          case AuthRequestTypes.OWNERSHIP: 
            const isVerified = await tonconnect.verifyTonOwnership(payload, response.client_id);

            print.message = isVerified 
              ? `ton-ownership is verified for ${payload.address}`
              : `ton-ownership is NOT verified`

            break;
          case AuthRequestTypes.ADDRESS: 
            print.message = `ton-address ${payload.address}`
            break;
        }
      }

      res.send(print);
    } catch (error) {
      console.log(error);
      res.status(400).send({ error });
    }
  });

  app.get('/', (req, res) => {
    res.render('home', { 
      layout: false,
      requestEndpoint: `${hostname}/authRequest` 
    });
  });

  app.listen(port, host, () => {
    console.log(`Server running at http://${hostname}/`);
  });
}

init();