import { type ReactElement } from "react";
export type KcContextLike = KcContextLike.Keycloak25AndUp | KcContextLike.Keycloak20To24 | KcContextLike.Keycloak19;
export declare namespace KcContextLike {
    type Common = {
        realm: {
            name: string;
            registrationEmailAsUsername: boolean;
            editUsernameAllowed: boolean;
            isInternationalizationEnabled: boolean;
            identityFederationEnabled: boolean;
            userManagedAccessAllowed: boolean;
        };
        resourceUrl: string;
        baseUrl: {
            rawSchemeSpecificPart: string;
            scheme: string;
            authority: string;
            path: string;
        };
        locale: string;
        isAuthorizationEnabled: boolean;
        deleteAccountAllowed: boolean;
        updateEmailFeatureEnabled: boolean;
        updateEmailActionEnabled: boolean;
        isViewOrganizationsEnabled?: boolean;
        properties: Record<string, string | undefined>;
        /**
         * Misleading name: this value does not indicate whether the app should render in dark or light mode.
         *
         * - If `darkMode === false`, the theme is NOT ALLOWED to render in dark mode under any circumstances.
         *   (Configured in the Admin Console.)
         * - If `darkMode === true`, dark mode is permitted.
         * - If `darkMode === undefined` (older Keycloak versions), assume `true`
         *   — meaning dark mode is allowed, since the restriction option didn’t exist yet.
         */
        darkMode?: boolean;
        referrerName?: string;
    };
    type I18nApi = {
        msgJSON: string;
        supportedLocales?: Record<string, string>;
    };
    type Keycloak25AndUp = Common & {
        serverBaseUrl: string;
        authUrl: string;
        clientId: string;
        authServerUrl: string;
        isOid4VciEnabled: boolean;
        isViewGroupsEnabled: boolean;
    };
    type Keycloak20To24 = Common & I18nApi & {
        authUrl: {
            rawSchemeSpecificPart: string;
            scheme: string;
        };
        isViewGroupsEnabled: boolean;
    };
    type Keycloak19 = Common & I18nApi & {
        authUrl: {
            rawSchemeSpecificPart: string;
            scheme: string;
        };
    };
}
export declare function createGetKcContext<KcContext extends KcContextLike>(): {
    getKcContext: () => {
        kcContext: KcContext;
    };
};
type LazyExoticComponentLike = {
    _result: unknown;
};
export type KcAccountUiLoaderProps = {
    kcContext: KcContextLike;
    KcAccountUi: LazyExoticComponentLike;
    loadingFallback?: ReactElement<any, any>;
};
export declare function KcAccountUiLoader(props: KcAccountUiLoaderProps): import("react/jsx-runtime").JSX.Element;
export {};
