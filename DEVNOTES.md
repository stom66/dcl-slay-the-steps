# Devotes / Log

## New Branch: server-client-refactor

Implementing new authoritative server functionality.

```sh
sudo rm -rf node_modules
npm install "https://sdk-team-cdn.decentraland.org/@dcl/js-sdk-toolchain/branch/feat/authorative-server/dcl-sdk-7.20.1-21925407654.commit-3a8603e.tgz"
npm install
```

### Some time later

Couldn't get the examples sent over to launch. They randomly stopped working, presumably after Creator Hub auto-updated them.

So I followed the suggested commands here: <https://github.com/decentraland/js-sdk-toolchain/pull/1316#issuecomment-3894957112>

```sh
npm install "https://sdk-team-cdn.decentraland.org/@dcl/js-sdk-toolchain/branch/auth-server/dcl-sdk-7.21.1-22918727357.commit-24a15f6.tgz"
npm install "https://sdk-team-cdn.decentraland.org/@dcl/js-sdk-toolchain/branch/auth-server/@dcl/js-runtime/dcl-js-runtime-7.21.1-22918727357.commit-24a15f6.tgz"
```

This lets the server start.

### Some more time later

Advised by Nico to update dependencies by running:

```sh
npm i @dcl/sdk@auth-server @dcl/js-runtime@auth-server
```

Note: you'll need to re-run this later to get the current version as it installs a specific snapshot build rather than a branch.
