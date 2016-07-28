##How to use
Create an **environment.json** file in this directory. This file will automatically be ignored by git. This file is used to store your configuration data used to access August's restful api, and to authenticate with your lock.

Example **environment.json**
```json
{
	"api": {
  		"jwt": "<token>",
  		"email": "example@example.com",
  		"password": "IHaveBadPasswords",
  		"phone": "+15551231234",
  		"installId": "E629CCCC-A9E0-40F1-8BB8-43A24830346B",
  		"keaseApiKey": "14445b6a2dba"
	},
	"locks": [
		{
			"preferedKeyId": "0f00",
			"id": "A40E1354A7B95D0C6D26FD319E23E350",
			"offlineKeys": [
				{ "keySlot": 0, "key": "1A6CDDA5B89F322FC3D9B1F28E6B4137" }
			]
		}
	]
}
```

Once you have your environment set up you can run any of the included applications.

```bash
# build project
npm run build

# run one of the apps in project
# for example
node dst/get_firmware_keys.js
```
