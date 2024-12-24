/* eslint-disable */

// @ts-nocheck

import { KeycloakProvider } from "../shared/keycloak-ui-shared";

import { App } from "./App";
import { environment } from "./environment";

export const Root = () => (
  <KeycloakProvider environment={environment}>
    <App />
  </KeycloakProvider>
);
