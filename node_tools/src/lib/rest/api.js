const request = require('request');
var AugustApi = function AugustApi(config) {
  config = config || {};
  var getBaseRequest = function getBaseRequest() {
    return ({ method: null,
      url: 'https://api-production.august.com/',
      headers: {
         'x-august-access-token': config.jwt,
         'x-kease-api-key': config.keaseApiKey,
         'content-type': 'application/json'
       },
      json: true
    });
  }

  var makeRequest = async function makeRequest(option) {
    var response = await makeRawRequest(option);
    return response.body;
  }

  var makeRawRequest = function makeRawRequest(option) {
    return new Promise(function(resolve, reject) {
      request(option, function(error, response, body) {
        if(error){
          return reject(error);
        }
        if(response.statusCode < 200 || response.statusCode > 299){
          return reject(new Error('Http error: ' + response.statusCode, response, body));
        }
        resolve({response:response, body:body});
      });
    });
  }

  this.updateJwt = function updateJwt(newJwt) {
    config.jwt = newJwt;
  }

  this.sendCodeToPhone = function sendCodeToPhone(phoneNumber) {
    //
    var option = getBaseRequest();
    option.url += 'validation/phone';
    option.method = 'POST';
    option.body = {
      value: phoneNumber
    };
    return makeRawRequest(option);
  }

  this.validatePhone = function validatePhone(phoneNumber, code) {
    var option = getBaseRequest();
    option.url += 'validate/phone';
    option.method = 'POST';
    option.body = {
      code: code,
      phone: phoneNumber
    };
    return makeRawRequest(option);
  }
  this.sendCodeToEmail = function sendCodeToEmail(emailAddress) {
    //
    var option = getBaseRequest();
    option.url += 'validation/email';
    option.method = 'POST';
    option.body = {
      value: emailAddress
    };
    return makeRawRequest(option);
  }

  this.validateEmail = function validateEmail(emailAddress, code) {
    var option = getBaseRequest();
    option.url += 'validate/email';
    option.method = 'POST';
    option.body = {
      code: code,
      email: emailAddress
    };
    return makeRawRequest(option);
  }
  this.authenticate = function authenticate(userid, password) {
    // https://api-production.august.com/session
    var option = getBaseRequest();
    option.url += 'session';
    option.method = 'POST';
    option.body = {
      identifier:userid,
      installId:config.installId,
      password:password
    };
    return makeRawRequest(option);
  }

  this.getLocks = function getLocks() {
    // https://api-production.august.com/users/locks/mine
    var option = getBaseRequest();
    option.url += 'users/locks/mine';
    option.method = 'GET';
    return makeRequest(option);
  }

  this.getLock = function getLock(lockId) {
    // https://api-production.august.com/locks/{lockId}
    var option = getBaseRequest();
    option.url += 'locks/' + encodeURIComponent(lockId.toUpperCase());
    option.method = 'GET';
    return makeRequest(option);
  }

  this.getHouses = function getHouses() {
    // https://api-production.august.com/houses/mine
    var option = getBaseRequest();
    option.url += 'houses/mine';
    option.method = 'GET';
    return makeRequest(option);
  }

  this.getHouse = function getHouse(houseId) {
    // https://api-production.august.com/houses/00000000-1111-2222-3333-444444444444
    var option = getBaseRequest();
    option.url += 'houses/' + encodeURIComponent(houseId.toLowerCase());
    option.method = 'GET';

    return makeRequest(option);
  }

  this.getTiFirmware = function getTiFirmware(lockId, version) {
    // Returned firmware is gzipped
    // https://api-production.august.com/locks/{lockId}/firmware/ti/1.1.18
    var option = getBaseRequest();
    option.url += 'locks/' + encodeURIComponent(lockId.toUpperCase()) + '/firmware/ti/' + encodeURIComponent(version);
    option.method = 'GET';
    //Force request to return a buffer
    option.encoding = null;
    return makeRequest(option);
  }

  this.initComms = function initComms(lockId, halfKey) {
    var option = getBaseRequest();
    option.method = 'PUT';
    option.url += ('locks/initiatecomm/' + encodeURIComponent(lockId.toUpperCase()));
    option.body = { mRand1: halfKey.readInt32LE(0), mRand2: halfKey.readInt32LE(4) };
    // Example response
    // { "packet":"FFAADDCC112233" }
    return makeRequest(option);
  }

  this.getLockRands = function getLockRands(lockId, lockResponse) {
    // PUT https://api-production.august.com/locks/getlockrands/{lockId}
    var option = getBaseRequest();
    option.url += 'locks/getlockrands/' + encodeURIComponent(lockId.toUpperCase());
    option.method = 'PUT';
    option.body = { LockResponse: lockResponse.toString('hex') };

    // Example response:
    // { "lRand1": 123, "lRand2": 456}
    return makeRequest(option);
  }
}

module.exports = AugustApi;
