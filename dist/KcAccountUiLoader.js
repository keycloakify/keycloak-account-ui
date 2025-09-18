import { jsx as _jsx } from "react/jsx-runtime";
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-namespace */
import { Suspense, useMemo } from "react";
import { assert, is } from "tsafe/assert";
import { getI18n } from "react-i18next";
assert;
function getIsKeycloak25AndUp(kcContext) {
    return "serverBaseUrl" in kcContext;
}
export function KcAccountUiLoader(props) {
    const { kcContext, KcAccountUi, loadingFallback, enableDarkModeIfPreferred, darkModePolicy } = props;
    assert(is(KcAccountUi));
    useMemo(() => init({
        kcContext,
        darkModePolicy: (() => {
            if (darkModePolicy !== undefined) {
                assert(enableDarkModeIfPreferred === undefined, `Can't use both enableDarkModeIfPreferred and darkModePolicy, enableDarkModeIfPreferred is deprecated.`);
                return darkModePolicy;
            }
            if (enableDarkModeIfPreferred !== undefined) {
                return enableDarkModeIfPreferred ? "auto" : "never dark mode";
            }
            return "auto";
        })()
    }), []);
    return (_jsx(Suspense, { fallback: loadingFallback, children: (() => {
            const node = _jsx(KcAccountUi, {});
            if (node === null) {
                return loadingFallback;
            }
            return node;
        })() }));
}
let previousRunParamsFingerprint = undefined;
function init(params) {
    var _a, _b;
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
    const { kcContext, darkModePolicy } = params;
    light_dark_mode_management: {
        if (darkModePolicy === "never dark mode") {
            break light_dark_mode_management;
        }
        assert;
        if (kcContext.darkMode === false) {
            break light_dark_mode_management;
        }
        const setIsDarkModeEnabled = (params) => {
            const { isDarkModeEnabled } = params;
            const { classList } = document.documentElement;
            const DARK_MODE_CLASS = "pf-v5-theme-dark";
            if (isDarkModeEnabled) {
                classList.add(DARK_MODE_CLASS);
            }
            else {
                classList.remove(DARK_MODE_CLASS);
            }
        };
        const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
        if (mediaQuery.matches) {
            setIsDarkModeEnabled({ isDarkModeEnabled: true });
        }
        mediaQuery.addEventListener("change", event => setIsDarkModeEnabled({ isDarkModeEnabled: event.matches }));
    }
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
        referrerName: (_a = readQueryParamOrRestoreFromSessionStorage({ name: "referrer" })) !== null && _a !== void 0 ? _a : "",
        referrerUrl: referrerUrl !== null && referrerUrl !== void 0 ? referrerUrl : "",
        features: {
            isRegistrationEmailAsUsername: kcContext.realm.registrationEmailAsUsername,
            isEditUserNameAllowed: kcContext.realm.editUsernameAllowed,
            isInternationalizationEnabled: kcContext.realm.isInternationalizationEnabled,
            isLinkedAccountsEnabled: kcContext.realm.identityFederationEnabled,
            isMyResourcesEnabled: kcContext.realm.userManagedAccessAllowed && kcContext.isAuthorizationEnabled,
            deleteAccountAllowed: kcContext.deleteAccountAllowed,
            updateEmailFeatureEnabled: kcContext.updateEmailFeatureEnabled,
            updateEmailActionEnabled: kcContext.updateEmailActionEnabled,
            isViewGroupsEnabled: "isViewGroupsEnabled" in kcContext ? kcContext.isViewGroupsEnabled : false,
            isOid4VciEnabled: getIsKeycloak25AndUp(kcContext) ? kcContext.isOid4VciEnabled : false,
            isViewOrganizationsEnabled: (_b = kcContext.isViewOrganizationsEnabled) !== null && _b !== void 0 ? _b : false
        }
    };
    assert();
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
        const buildJsonResponse = (json) => {
            const response = {
                headers: new Headers({ "Content-Type": "application/json" }),
                ok: true,
                json: () => Promise.resolve(json),
                text: () => Promise.resolve(JSON.stringify(json)),
                status: 200
            };
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
            var _a, _b, _c, _d, _e, _f, _g;
            var _h;
            const [url, fetchOptions] = args;
            polyfill_i18n_api: {
                if (getIsKeycloak25AndUp(kcContext)) {
                    break polyfill_i18n_api;
                }
                //assert(is<KcContextLike.Keycloak20To24>(kcContext));
                const langs = kcContext.supportedLocales === undefined
                    ? ["en"]
                    : Object.keys(kcContext.supportedLocales);
                if (`${url}`.endsWith("/supportedLocales")) {
                    return buildJsonResponse(langs);
                }
                for (const lang of langs) {
                    if (!`${url}`.endsWith(`/${lang}`)) {
                        continue;
                    }
                    const data = Object.entries(JSON.parse(kcContext.msgJSON)).map(([key, value]) => {
                        try {
                            value = decodeURIComponent(escape(value));
                        }
                        catch (_a) {
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
                const urlObj = new URL((() => {
                    const urlStr = `${url}`;
                    return urlStr.startsWith("/") ? `${window.location.origin}${urlStr}` : urlStr;
                })());
                add_locale_attribute: {
                    if (!environment.features.isInternationalizationEnabled) {
                        break add_locale_attribute;
                    }
                    if (((_b = (_a = fetchOptions === null || fetchOptions === void 0 ? void 0 : fetchOptions.method) === null || _a === void 0 ? void 0 : _a.toLocaleLowerCase()) !== null && _b !== void 0 ? _b : "get") !== "get") {
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
                    (_c = data.attributes) !== null && _c !== void 0 ? _c : (data.attributes = {});
                    data.attributes.locale = [kcContext.locale];
                    (_d = data.userProfileMetadata) !== null && _d !== void 0 ? _d : (data.userProfileMetadata = {});
                    (_e = (_h = data.userProfileMetadata).attributes) !== null && _e !== void 0 ? _e : (_h.attributes = []);
                    if (!data.userProfileMetadata.attributes.find((attribute) => attribute.name === "locale")) {
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
                    if (((_g = (_f = fetchOptions === null || fetchOptions === void 0 ? void 0 : fetchOptions.method) === null || _f === void 0 ? void 0 : _f.toLocaleLowerCase()) !== null && _g !== void 0 ? _g : "get") !== "post") {
                        break remove_locale_attribute_from_req;
                    }
                    if (!urlObj.pathname.replace(/\/$/, "").endsWith("/account")) {
                        break remove_locale_attribute_from_req;
                    }
                    if ((fetchOptions === null || fetchOptions === void 0 ? void 0 : fetchOptions.body) === undefined) {
                        break remove_locale_attribute_from_req;
                    }
                    let reqPayload;
                    try {
                        reqPayload = JSON.parse(fetchOptions.body);
                    }
                    catch (_j) {
                        break remove_locale_attribute_from_req;
                    }
                    if (reqPayload.userProfileMetadata === undefined) {
                        break remove_locale_attribute_from_req;
                    }
                    reqPayload.userProfileMetadata.attributes =
                        reqPayload.userProfileMetadata.attributes.filter((attr) => attr.name !== "locale");
                    fetchOptions.body = JSON.stringify(reqPayload);
                    args[1] = fetchOptions;
                    return realFetch(...args);
                }
            }
            return realFetch(...args);
        };
    }
    custom_styles: {
        const { styles } = kcContext.properties;
        if (!styles) {
            break custom_styles;
        }
        const relativeUrls = styles.split(" ").map(s => s.trim());
        if (relativeUrls.length === 0) {
            break custom_styles;
        }
        const { appendLinksToHead, removeLinksFromHead } = (() => {
            const CUSTOM_ATTRIBUTE_NAME = "data-properties-styles";
            const links = relativeUrls.map(relativeUrl => {
                const url = `${kcContext.baseUrl.scheme}://${kcContext.baseUrl.authority}${kcContext.resourceUrl}/${relativeUrl}`;
                const link = document.createElement("link");
                link.rel = "stylesheet";
                link.href = url;
                link.setAttribute(CUSTOM_ATTRIBUTE_NAME, "true");
                return link;
            });
            function appendLinksToHead() {
                links.forEach(link => {
                    document.head.appendChild(link);
                });
            }
            function removeLinksFromHead() {
                document.querySelectorAll(`link[${CUSTOM_ATTRIBUTE_NAME}="true"]`).forEach(link => {
                    link.remove();
                });
            }
            return { appendLinksToHead, removeLinksFromHead };
        })();
        appendLinksToHead();
        (function callee() {
            const observer = new MutationObserver(mutations => {
                const hasAddedNodes = (() => {
                    for (const mutation of mutations) {
                        if (mutation.addedNodes.length !== 0) {
                            return true;
                        }
                    }
                    return false;
                })();
                if (!hasAddedNodes) {
                    return;
                }
                observer.disconnect();
                removeLinksFromHead();
                appendLinksToHead();
                callee();
            });
            observer.observe(document.head, {
                childList: true,
                subtree: false
            });
        })();
    }
}
function readQueryParamOrRestoreFromSessionStorage(params) {
    var _a;
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
    return (_a = sessionStorage.getItem(`${PREFIX}${name}`)) !== null && _a !== void 0 ? _a : undefined;
}
//# sourceMappingURL=KcAccountUiLoader.js.map