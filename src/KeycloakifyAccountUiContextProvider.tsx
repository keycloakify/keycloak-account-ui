import { Suspense, useMemo, type LazyExoticComponent } from "react";
import { assert } from "tsafe/assert";
import { is } from "tsafe/is";
import type { Environment } from "@keycloakify/keycloak-account-ui/environment";
import type { MenuItem } from "@keycloakify/keycloak-account-ui/root/PageNav";
import { joinPath } from "@keycloakify/keycloak-account-ui/utils/joinPath";
import defaultContent from "@keycloakify/keycloak-account-ui/public/content";
import defaultLogoSvgUrl from "@keycloakify/keycloak-account-ui/public/logo.svg";

export type KcContextLike = {
  serverBaseUrl: string;
  authUrl: string;
  authServerUrl: string;
  realm: {
    name: string;
    registrationEmailAsUsername: boolean;
    editUsernameAllowed: boolean;
    isInternationalizationEnabled: boolean;
    identityFederationEnabled: boolean;
    userManagedAccessAllowed: boolean;
  };
  clientId: string;
  resourceUrl: string;
  baseUrl: {
    rawSchemeSpecificPart: string;
    scheme: string;
  };
  locale: string;
  referrerName?: string;
  referrer_uri?: string;
  isAuthorizationEnabled: boolean;
  deleteAccountAllowed: boolean;
  updateEmailFeatureEnabled: boolean;
  updateEmailActionEnabled: boolean;
  isViewGroupsEnabled: boolean;
  isOid4VciEnabled: boolean;
};

type LazyExoticComponentLike = {
  _result: unknown;
};

export type KcAccountUiEnvProviderProps = {
  kcContext: KcContextLike;
  KcAccountUi: LazyExoticComponentLike;
  content?: MenuItem[];
  logoUrl?: string;
  loadingFallback?: JSX.Element;
};

export function KcAccountUiEnvProvider(props: KcAccountUiEnvProviderProps) {
  const { KcAccountUi, loadingFallback, ...paramsOfInit } = props;

  assert(is<LazyExoticComponent<() => JSX.Element | null>>(KcAccountUi));

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

function init(
  params: Pick<
    KcAccountUiEnvProviderProps,
    "kcContext" | "content" | "logoUrl"
  >,
) {
  exit_condition: {
    const paramsFingerprint = JSON.stringify(params);

    if (paramsFingerprint === undefined) {
      previousRunParamsFingerprint = paramsFingerprint;
      break exit_condition;
    }

    if (paramsFingerprint !== previousRunParamsFingerprint) {
      window.location.reload();
      return;
    }

    return;
  }

  const {
    content = defaultContent,
    kcContext,
    logoUrl = defaultLogoSvgUrl,
  } = params;

  {
    const url = new URL(window.location.href);

    url.searchParams.delete("referrer");
    url.searchParams.delete("referrer_uri");

    window.history.replaceState({}, "", url.toString());
  }

  const environment = {
    serverBaseUrl: kcContext.serverBaseUrl,
    authUrl: kcContext.authUrl,
    authServerUrl: kcContext.authServerUrl,
    realm: kcContext.realm.name,
    clientId: kcContext.clientId,
    resourceUrl: kcContext.resourceUrl,
    logo: "",
    logoUrl: logoUrl,
    baseUrl: `${kcContext.baseUrl.scheme}:${kcContext.baseUrl.rawSchemeSpecificPart}`,
    locale: kcContext.locale,
    referrerName: kcContext.referrerName ?? "",
    referrerUrl: kcContext.referrer_uri ?? "",
    features: {
      isRegistrationEmailAsUsername:
        kcContext.realm.registrationEmailAsUsername,
      isEditUserNameAllowed: kcContext.realm.editUsernameAllowed,
      isInternationalizationEnabled:
        kcContext.realm.isInternationalizationEnabled,
      isLinkedAccountsEnabled: kcContext.realm.identityFederationEnabled,
      isMyResourcesEnabled:
        kcContext.realm.userManagedAccessAllowed &&
        kcContext.isAuthorizationEnabled,
      deleteAccountAllowed: kcContext.deleteAccountAllowed,
      updateEmailFeatureEnabled: kcContext.updateEmailFeatureEnabled,
      updateEmailActionEnabled: kcContext.updateEmailActionEnabled,
      isViewGroupsEnabled: kcContext.isViewGroupsEnabled,
      isOid4VciEnabled: kcContext.isOid4VciEnabled,
    },
  };

  {
    assert<typeof environment extends Environment ? true : false>();

    const script = document.createElement("script");
    script.id = "environment";
    script.type = "application/json";
    script.textContent = JSON.stringify(environment, null, 1);

    document.body.appendChild(script);
  }

  const realFetch = window.fetch;

  window.fetch = async function fetch(...args) {
    const [url] = args;

    if (url === joinPath(environment.resourceUrl, "/content.json")) {
      window.fetch = realFetch;
      return {
        json: () => Promise.resolve(content),
      } as Response;
    }

    return realFetch(...args);
  };
}
