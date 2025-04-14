/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-namespace */
import { Suspense, useMemo, type LazyExoticComponent, type ReactElement } from "react";
import { assert, is, type Equals } from "tsafe/assert";
import { getI18n } from "react-i18next";
//import { logValidationResult } from "./zKcContextLike";

import type { AccountEnvironment as Environment_target } from "@keycloak/keycloak-account-ui";

type Environment = {
    /**
     * The URL to the root of the Keycloak server, including the path if present, this is **NOT** always equivalent to the URL of the Admin Console.
     * For example, the Keycloak server could be hosted on `auth.example.com` and Admin Console may be hosted on `admin.example.com/some/path`.
     *
     * Note that this URL is normalized not to include a trailing slash, so take this into account when constructing URLs.
     *
     * @see {@link https://www.keycloak.org/server/hostname#_administration_console}
     */
    serverBaseUrl: string;
    /** The identifier of the realm used to authenticate the user. */
    realm: string;
    /** The identifier of the client used to authenticate the user. */
    clientId: string;
    /** The base URL of the resources. */
    resourceUrl: string;
    /** The source URL for the the logo image. */
    logo: string;
    /** The URL to be followed when the logo is clicked. */
    logoUrl: string;
    /** The scopes to be requested when sending authorization requests*/
    scope?: string;

    /** The URL to the root of the account console. */
    baseUrl: string;
    /** The locale of the user */
    locale: string;
    /** Name of the referrer application in the back link */
    referrerName?: string;
    /** UR to the referrer application in the back link */
    referrerUrl?: string;
    /** Feature flags */
    features: {
        isRegistrationEmailAsUsername: boolean;
        isEditUserNameAllowed: boolean;
        isLinkedAccountsEnabled: boolean;
        isMyResourcesEnabled: boolean;
        deleteAccountAllowed: boolean;
        updateEmailFeatureEnabled: boolean;
        updateEmailActionEnabled: boolean;
        isViewGroupsEnabled: boolean;
        isViewOrganizationsEnabled: boolean;
        isOid4VciEnabled: boolean;
    };
};

assert<Equals<Environment, Environment_target>>;

export type KcContextLike =
    | KcContextLike.Keycloak25AndUp
    | KcContextLike.Keycloak20To24
    | KcContextLike.Keycloak19;

export namespace KcContextLike {
    export type Common = {
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

    export type I18nApi = {
        msgJSON: string;
        supportedLocales?: Record<string, string>;
    };

    export type Keycloak25AndUp = Common & {
        serverBaseUrl: string;
        authUrl: string;
        clientId: string;
        authServerUrl: string;
        isOid4VciEnabled: boolean;
        isViewGroupsEnabled: boolean;
    };

    export type Keycloak20To24 = Common &
        I18nApi & {
            authUrl: {
                rawSchemeSpecificPart: string;
                scheme: string;
            };
            isViewGroupsEnabled: boolean;
        };

    export type Keycloak19 = Common &
        I18nApi & {
            authUrl: {
                rawSchemeSpecificPart: string;
                scheme: string;
            };
        };
}

function getIsKeycloak25AndUp(kcContext: KcContextLike): kcContext is KcContextLike.Keycloak25AndUp {
    return "serverBaseUrl" in kcContext;
}

type LazyExoticComponentLike = {
    _result: unknown;
};

export type KcAccountUiLoaderProps = {
    kcContext: KcContextLike;
    KcAccountUi: LazyExoticComponentLike;
    loadingFallback?: ReactElement<any, any>;
};

export function KcAccountUiLoader(props: KcAccountUiLoaderProps) {
    const { KcAccountUi, loadingFallback, ...paramsOfInit } = props;

    assert(is<LazyExoticComponent<() => ReactElement<any, any> | null>>(KcAccountUi));

    useMemo(() => init(paramsOfInit), []);

    return (
        <Suspense fallback={loadingFallback}>
            {(() => {
                const node = <KcAccountUi />;

                if (node === null) {
                    return loadingFallback;
                }

                return node;
            })()}
        </Suspense>
    );
}

let previousRunParamsFingerprint: string | undefined = undefined;

function init(params: { kcContext: KcContextLike }) {
    exit_condition: {
        const paramsFingerprint = JSON.stringify(params);

        if (previousRunParamsFingerprint === undefined) {
            previousRunParamsFingerprint = paramsFingerprint;
            break exit_condition;
        }

        if (paramsFingerprint !== previousRunParamsFingerprint) {
            window.location.reload();
            return;
        }

        return;
    }

    const { kcContext } = params;

    //logValidationResult(kcContext);

    const resourceUrl = kcContext.resourceUrl;

    const serverBaseUrl = (() => {
        if ("serverBaseUrl" in kcContext) {
            return kcContext.serverBaseUrl;
        }

        const { authUrl } = kcContext;

        if (typeof authUrl === "string") {
            return authUrl;
        }

        return `${authUrl.scheme}:${authUrl.rawSchemeSpecificPart.replace(/\$/, "")}`;
    })();

    const authUrl = (() => {
        const { authUrl } = kcContext;

        if (typeof authUrl === "string") {
            return authUrl;
        }

        return `${authUrl.scheme}:${authUrl.rawSchemeSpecificPart}`;
    })();

    const clientId = (() => {
        if ("clientId" in kcContext) {
            return kcContext.clientId;
        }

        return "account-console";
    })();

    const authServerUrl = (() => {
        if ("authServerUrl" in kcContext) {
            return kcContext.authServerUrl;
        }

        return authUrl;
    })();

    const referrerUrl = readQueryParamOrRestoreFromSessionStorage({
        name: "referrer_uri"
    });

    const environment = {
        serverBaseUrl,
        authUrl,
        authServerUrl,
        realm: kcContext.realm.name,
        clientId,
        resourceUrl,
        logo: "",
        logoUrl: referrerUrl === undefined ? "/" : referrerUrl.replace("_hash_", "#"),
        baseUrl: `${kcContext.baseUrl.scheme}:${kcContext.baseUrl.rawSchemeSpecificPart}`,
        locale: kcContext.locale,
        referrerName: readQueryParamOrRestoreFromSessionStorage({ name: "referrer" }) ?? "",
        referrerUrl: referrerUrl ?? "",
        features: {
            isRegistrationEmailAsUsername: kcContext.realm.registrationEmailAsUsername,
            isEditUserNameAllowed: kcContext.realm.editUsernameAllowed,
            isInternationalizationEnabled: kcContext.realm.isInternationalizationEnabled,
            isLinkedAccountsEnabled: kcContext.realm.identityFederationEnabled,
            isMyResourcesEnabled:
                kcContext.realm.userManagedAccessAllowed && kcContext.isAuthorizationEnabled,
            deleteAccountAllowed: kcContext.deleteAccountAllowed,
            updateEmailFeatureEnabled: kcContext.updateEmailFeatureEnabled,
            updateEmailActionEnabled: kcContext.updateEmailActionEnabled,
            isViewGroupsEnabled:
                "isViewGroupsEnabled" in kcContext ? kcContext.isViewGroupsEnabled : false,
            isOid4VciEnabled: getIsKeycloak25AndUp(kcContext) ? kcContext.isOid4VciEnabled : false,
            isViewOrganizationsEnabled: kcContext.isViewOrganizationsEnabled ?? false
        }
    };

    assert<typeof environment extends Environment ? true : false>;

    {
        const undefinedKeys = Object.entries(environment)
            .filter(([key]) => key !== "features")
            .filter(([, value]) => value === undefined)
            .map(([key]) => key);

        if (undefinedKeys.length > 0) {
            console.error("Need KcContext polyfill for ", undefinedKeys.join(", "));
        }
    }

    {
        const undefinedKeys = Object.entries(environment.features)
            .filter(([, value]) => value === undefined)
            .map(([key]) => key);

        if (undefinedKeys.length > 0) {
            console.error("Need KcContext polyfill for features", undefinedKeys.join(", "));
        }
    }

    {
        const script = document.createElement("script");
        script.id = "environment";
        script.type = "application/json";
        script.textContent = JSON.stringify(environment, null, 1);

        document.body.appendChild(script);
    }

    {
        const realFetch = window.fetch;

        const buildJsonResponse = (json: unknown): Response => {
            const response = {
                headers: new Headers({ "Content-Type": "application/json" }),
                ok: true,
                json: () => Promise.resolve(json),
                text: () => Promise.resolve(JSON.stringify(json)),
                status: 200
            } as Response;

            /*
            return new Proxy(response, {
              get(target, prop, receiver) {
                console.log(`GET ${String(prop)}`);
                return Reflect.get(target, prop, receiver);
              },
            });
            */

            return response;
        };

        let isLanguageChangeEventListened = false;
        let wasLocaleAttributeManuallyAdded = false;

        window.fetch = async function fetch(...args) {
            const [url, fetchOptions] = args;

            polyfill_i18n_api: {
                if (getIsKeycloak25AndUp(kcContext)) {
                    break polyfill_i18n_api;
                }
                //assert(is<KcContextLike.Keycloak20To24>(kcContext));

                const langs =
                    kcContext.supportedLocales === undefined
                        ? ["en"]
                        : Object.keys(kcContext.supportedLocales);

                if (`${url}`.endsWith("/supportedLocales")) {
                    return buildJsonResponse(langs);
                }

                for (const lang of langs) {
                    if (!`${url}`.endsWith(`/${lang}`)) {
                        continue;
                    }

                    const data = Object.entries(
                        JSON.parse(kcContext.msgJSON) as Record<string, string>
                    ).map(([key, value]) => {
                        try {
                            value = decodeURIComponent(escape(value));
                        } catch {
                            // ignore
                        }

                        return { key, value };
                    });

                    track_language_change: {
                        if (isLanguageChangeEventListened) {
                            break track_language_change;
                        }
                        isLanguageChangeEventListened = true;

                        getI18n().on("languageChanged", lang => {
                            if (lang !== kcContext.locale) {
                                window.location.reload();
                            }
                        });
                    }

                    return buildJsonResponse(data);
                }

                const urlObj = new URL(
                    (() => {
                        const urlStr = `${url}`;

                        return urlStr.startsWith("/") ? `${window.location.origin}${urlStr}` : urlStr;
                    })()
                );

                add_locale_attribute: {
                    if (!environment.features.isInternationalizationEnabled) {
                        break add_locale_attribute;
                    }

                    if ((fetchOptions?.method?.toLocaleLowerCase() ?? "get") !== "get") {
                        break add_locale_attribute;
                    }

                    if (!urlObj.pathname.replace(/\/$/, "").endsWith("/account")) {
                        break add_locale_attribute;
                    }

                    if (urlObj.searchParams.get("userProfileMetadata") !== "true") {
                        break add_locale_attribute;
                    }

                    const response = await realFetch(...args);

                    if (!response.ok) {
                        return response;
                    }

                    const data = await response.json();

                    data.attributes ??= {};

                    data.attributes.locale = [kcContext.locale];

                    data.userProfileMetadata ??= {};
                    data.userProfileMetadata.attributes ??= [];

                    if (
                        !data.userProfileMetadata.attributes.find(
                            (attribute: any) => attribute.name === "locale"
                        )
                    ) {
                        wasLocaleAttributeManuallyAdded = true;
                        data.userProfileMetadata.attributes.unshift({
                            name: "locale",
                            displayName: "locale",
                            required: false,
                            readOnly: false,
                            validators: {},
                            multivalued: false
                        });
                    }
                    return buildJsonResponse(data);
                }

                remove_locale_attribute_from_req: {
                    if (!wasLocaleAttributeManuallyAdded) {
                        break remove_locale_attribute_from_req;
                    }

                    if ((fetchOptions?.method?.toLocaleLowerCase() ?? "get") !== "post") {
                        break remove_locale_attribute_from_req;
                    }

                    if (!urlObj.pathname.replace(/\/$/, "").endsWith("/account")) {
                        break remove_locale_attribute_from_req;
                    }

                    if (fetchOptions?.body === undefined) {
                        break remove_locale_attribute_from_req;
                    }

                    let reqPayload: any;

                    try {
                        reqPayload = JSON.parse(fetchOptions.body as string);
                    } catch {
                        break remove_locale_attribute_from_req;
                    }

                    if (reqPayload.userProfileMetadata === undefined) {
                        break remove_locale_attribute_from_req;
                    }

                    reqPayload.userProfileMetadata.attributes =
                        reqPayload.userProfileMetadata.attributes.filter(
                            (attr: any) => attr.name !== "locale"
                        );

                    fetchOptions.body = JSON.stringify(reqPayload);

                    args[1] = fetchOptions;

                    return realFetch(...args);
                }
            }

            return realFetch(...args);
        };
    }
}

function readQueryParamOrRestoreFromSessionStorage(params: { name: string }): string | undefined {
    const { name } = params;

    const url = new URL(window.location.href);

    const value = url.searchParams.get(name);

    const PREFIX = "keycloakify:";

    if (value !== null) {
        sessionStorage.setItem(`${PREFIX}${name}`, value);
        url.searchParams.delete(name);
        window.history.replaceState({}, "", url.toString());
        return value;
    }

    return sessionStorage.getItem(`${PREFIX}${name}`) ?? undefined;
}
