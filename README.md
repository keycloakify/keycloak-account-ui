<p align="center">
    <img src="https://github.com/user-attachments/assets/e31c4910-7205-441c-9a35-e134b806b3a8">  
</p>
<p align="center">
    <i>Repackaged Keycloak Account UI</i>
    <br>
    <br>
    <a href="https://github.com/keycloakify/keycloak-account-ui/actions">
      <img src="https://github.com/keycloakify/keycloak-account-ui/actions/workflows/ci.yaml/badge.svg?branch=main">
    </a>
    <a href="https://www.npmjs.com/package/@keycloakify/keycloak-account-ui/v/26.0.6-rc.1">
      <img src="https://img.shields.io/npm/dm/@keycloakify/keycloak-account-ui">
    </a>
    <p align="center">
      Check out our discord server!<br/>
      <a href="https://discord.gg/mJdYJSdcm4">
        <img src="https://dcbadge.limes.pink/api/server/kYFZG7fQmn"/>
      </a>
    </p>
</p>

This project re-packages [`@keycloak/keycloak-account-ui`](https://www.npmjs.com/package/@keycloak/keycloak-account-ui).  
All credits goes to the keycloak team for the original work. Mainly [@jonkoops](https://github.com/jonkoops) and [@edewit](https://github.com/edewit).

This re-packaged distribution serves two key purposes:

1. **Ensuring retro-compatibility with Keycloak**:  
   It allows the Account UI to work seamlessly with older versions of Keycloak (down to version 19) and future major versions. This enables you to create a custom Account UI with minimal maintenance, without worrying about which Keycloak version it will be deployed on.

2. **Enabling partial customization of the Account UI**:  
   You can take ownership of specific parts of the Account UI by simply copying and modifying [source files](https://unpkg.com/browse/@keycloakify/keycloak-account-ui@26.0.6-rc.1/src/) as needed. The rest of the UI can remain in the original module, so your codebase will only include the files you've customized.

> **Note:** This package's GitHub repository does not contain any code as it is automatically generated at build time by [scripts/prepare.ts](/scripts/prepare.ts).  
> You can browse the sources includes int the NPM package [here](https://unpkg.com/browse/@keycloakify/keycloak-account-ui@26.0.6-rc.1/src/).

## Installation

This package is meant to be used via Keycloakify. Learn how to use this module on [the Keycloakify documentation website](https://keycloakify.dev).

> **Note:** This README file is automatically generated at build so the information above are guaranteed to be up to date.  
> You are currently viewing the README of [`@keycloakify/keycloak-account-ui@26.0.6-rc.1`](https://www.npmjs.com/package/@keycloakify/keycloak-account-ui/v/26.0.6-rc.1) that
> mirrors [`@keycloak/keycloak-account-ui@26.0.6`](https://www.npmjs.com/package/@keycloak/keycloak-account-ui/v/26.0.6).  
> It is the version of the Account UI that ships with [**Keycloak 26.0.6**](https://github.com/keycloak/keycloak/tree/26.0.6/js/apps/account-ui).

Here are all the dependencies that are required to use the Account UI in your project.  
It's important to respect the exact version range listed here to avoid any compatibility issues.

`package.json`

```json
{
  "dependencies": {
    "@keycloakify/keycloak-account-ui": "26.0.6-rc.1",
    "@patternfly/patternfly": "^5.4.0",
    "@patternfly/react-core": "^5.4.1",
    "@patternfly/react-icons": "^5.4.0",
    "@patternfly/react-table": "^5.4.1",
    "i18next": "^23.15.1",
    "i18next-http-backend": "^2.6.1",
    "lodash-es": "^4.17.21",
    "react-hook-form": "7.53.0",
    "react-i18next": "^15.0.2",
    "react-router-dom": "^6.26.2",
    "keycloak-js": "26.0.6",
    "@patternfly/react-styles": "^5.4.0",
    "@keycloak/keycloak-admin-client": "26.0.6"
  },
  "devDependencies": {
    "@types/lodash-es": "^4.17.12"
  }
}
```
