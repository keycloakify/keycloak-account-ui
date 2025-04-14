import "@patternfly/patternfly/patternfly-addons.css";
import "@patternfly/react-core/dist/styles/base.css";

import { useReducer, useEffect } from "react";
import { KeycloakProvider } from "../shared/keycloak-ui-shared";
import { environment } from "./environment";
import { i18n } from "./i18n/i18n";
import { Root } from "./root/Root";

const prI18nInitialized = i18n.init();

export default function KcAccountUi() {
    const [isI18nInitialized, setI18nInitialized] = useReducer(() => true, false);

    useEffect(() => {
        prI18nInitialized.then(() => setI18nInitialized());
    }, []);

    if (!isI18nInitialized) {
        return null;
    }

    return (
        <KeycloakProvider environment={environment}>
            <Root />
        </KeycloakProvider>
    );
}
