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
        };
        locale: string;
        isAuthorizationEnabled: boolean;
        deleteAccountAllowed: boolean;
        updateEmailFeatureEnabled: boolean;
        updateEmailActionEnabled: boolean;
        isViewOrganizationsEnabled?: boolean;
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
