# MTLS Verify

This is an Apigee Edge Microgateway Plugin that:

  - Compares the client certificate CN against an API Key
  - Rejects a transaction if these values don't match

## Installation

This plugin [Apigee Edge Microgateway](https://docs.apigee.com/release/notes/edge-microgateway-release-notes-0) v2.5.30 or higher to run.

Drop the `./mtls-verify` directory into the Microgateway plugins directory `[prefix]/lib/node_modules/edgemicro/node_modules/microgateway-plugins`. More info [here](https://docs.apigee.com/api-platform/microgateway/2.5.x/develop-custom-plugins#wheretoputcustomplugincode). 

Configure the `mtls-verify` plugin to be executed after the `oauth` plugin in the Microgateway config YAML file.
```
...
  plugins:
    sequence:
      - oauth
      - mtls-verify
...
```
Make sure that you've enabled MTLS between the API Consumers and Microgateway in the config YAML file.
```
...
  ssl:
    key: key.pem
    cert: cert.pem
    passphrase: mysuperduperpassphrase
    requestCert: true
    ca: client_cert.pem
...
```

License
----
MIT
**Free Software, Hell Yeah!**