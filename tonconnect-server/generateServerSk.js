#!/usr/bin/env node

'use strict';

const nacl = require('tweetnacl');
const naclUtils = require('tweetnacl-util');

function generateServerSecret() {
  return naclUtils.encodeBase64(nacl.randomBytes(32));
}

console.log(generateServerSecret());