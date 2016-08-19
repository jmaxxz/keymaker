const environmentConfig = require('../environment.json');
const Api = require('./lib/rest/api.js');
const readline = require('readline');
require('./lib/async_logging');
var api = new Api(environmentConfig.api);

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.question('What is your phone number (+15551114444): ', async (phoneNumber) => {
  rl.question('What is your email address (example@example.com): ', async(emailAddress) => {
    rl.question('Password: ', async (password) => {
      // Log in
      let result = await api.authenticate('phone:' + phoneNumber, password);
      api.updateJwt(result.response.headers['x-august-access-token']);

      // Validate phone
      console.log('Sending code to ' + phoneNumber + '.');
      await api.sendCodeToPhone(phoneNumber);
      rl.question('Please enter code: ', async (code) => {
        let result = await api.validatePhone(phoneNumber, code);
        api.updateJwt(result.response.headers['x-august-access-token']);
        // Validate email address
        console.log('Sending code to ' + emailAddress + '.');
        await api.sendCodeToEmail(emailAddress);
        rl.question('Please enter code: ', async (code) => {
          let result = await api.validateEmail(emailAddress, code);
          api.updateJwt(result.response.headers['x-august-access-token']);
          console.log("Use this jwt token in your environment.config:")
          console.log(result.response.headers['x-august-access-token'])
          rl.close();
        });
      });
    });
  });
});
