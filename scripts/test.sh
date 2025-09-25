#!/bin/bash

rm -rf dist node_modules
yarn
yarn build


rm -rf keycloakify-starter
git clone https://github.com/keycloakify/keycloakify-starter
cd keycloakify-starter
yarn

npx keycloakify initialize-account-theme

rm -r node_modules/@keycloakify/keycloak-account-ui
cp -r ../dist node_modules/@keycloakify/keycloak-account-ui
rm -r node_modules/.cache
node -e "\
    const fs = require('fs');\
    const pj_path= './node_modules/@keycloakify/keycloak-account-ui/package.json';
    const pj = JSON.parse(fs.readFileSync(pj_path, 'utf8'));\
    pj.version = JSON.parse(fs.readFileSync('package.json', 'utf8')).dependencies['@keycloakify/keycloak-account-ui'].slice(1);\
    fs.writeFileSync(pj_path, Buffer.from(JSON.stringify(pj, null, 2), 'utf8'));\
"

yarn postinstall

npx keycloakify start-keycloak
