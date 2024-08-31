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
    <a href="https://www.npmjs.com/package/@keycloakify/keycloak-account-ui/v/25.0.4-rc.4">
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
All credits goes to the keycloak team for the original work. Mainly [@jonkoops
](https://github.com/jonkoops) and [@edewit](https://github.com/edewit).

This re-packaged distribution exists to make it possible to take ownership of
some specific part of the Account UI to create your own custom version of it.  
In straight forward therms it make the Account UI ejectable, you can copy
past [the source files](https://unpkg.com/browse/@keycloakify/keycloak-account-ui@25.0.4-rc.4/src/) that you want to modify into your codebase.

For more details on integrating this package into your project, refer to the [Keycloakify documentation](https://keycloakify.dev).

> **Note:** This package's GitHub repository does not contain any code as it is automatically generated at build time by [scripts/prepare.ts](/scripts/prepare.ts).  
> You can browse the sources includes int the NPM package [here](https://unpkg.com/browse/@keycloakify/keycloak-account-ui@25.0.4-rc.4/src/).

## Installation

> **Note:** This README file is automatically generated at build so the information above are guaranteed to be up to date.  
> You are currently viewing the README of [`@keycloakify/keycloak-account-ui@25.0.4-rc.4`](https://www.npmjs.com/package/@keycloakify/keycloak-account-ui/v/25.0.4-rc.4) that
> mirrors [`@keycloak/keycloak-account-ui@25.0.4`](https://www.npmjs.com/package/@keycloak/keycloak-account-ui/v/25.0.4).  
> It is the version of the Account UI that ships with [**Keycloak 25.0.4**](https://github.com/keycloak/keycloak/tree/25.0.4/js/apps/account-ui).

Here are all the dependencies that are required to use the Account UI in your project.  
It's important to respect the exact version range listed here to avoid any compatibility issues.

`package.json`

```json
{
  "dependencies": {
    "@keycloakify/keycloak-account-ui": "25.0.4-rc.4",
    "@patternfly/patternfly": "^5.3.1",
    "@patternfly/react-core": "^5.3.3",
    "@patternfly/react-icons": "^5.3.2",
    "@patternfly/react-table": "^5.3.3",
    "i18next": "^23.11.5",
    "i18next-http-backend": "^2.5.2",
    "lodash-es": "^4.17.21",
    "react-hook-form": "7.51.5",
    "react-i18next": "^14.1.2",
    "react-router-dom": "^6.23.1",
    "keycloak-js": "25.0.4",
    "@patternfly/react-styles": "^5.3.1",
    "@keycloak/keycloak-admin-client": "25.0.4"
  },
  "devDependencies": {
    "@types/lodash-es": "^4.17.12"
  }
}
```

## Ejecting

You can take partial ownership of some parts of the Account UI by copy pasting the sources files you want to modify into your codebase.  
You can browse the sources files **[here](https://unpkg.com/browse/@keycloakify/keycloak-account-ui@25.0.4-rc.4/src/)**.
