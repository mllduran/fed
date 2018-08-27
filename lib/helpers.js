const crypto = require('crypto');
const config = require('./config');

const helpers = {};

helpers.hash = (str) => {
  if (typeof(str) === 'string' && str.length > 0) {
    let hash = crypto.createHmac('sha256', config.hashingSecret).update(str).digest('hex');
    return hash;
  } else {
    return false;
  }
};

helpers.parseJsonToObject = (str) => {
  try {
    let obj = JSON.parse(str);
    return obj;
  } catch(e) {
    return {};
  }
};

helpers.createRandomString = (strLength) => {
  strLength = typeof(strLength) === 'number' && strLength > 0 ? strLength : false;

  if (strLength) {
    let possibleCharacters = 'abcdefghijklmnopqrstuvwxyz0123456789';

    let str = '';

    for (i = 1; i <= strLength; i++) {
      let randomCharacter = possibleCharacters.charAt(Math.floor(Math.random() * possibleCharacters.length));

      str += randomCharacter;
    }
    return str;
  } else {
    return false;
  }
}
module.exports = helpers;