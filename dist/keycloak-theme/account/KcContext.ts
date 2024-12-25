import type { KcContextLike } from "@keycloakify/keycloak-account-ui";
import type { KcEnvName } from "../kc.gen";

export type KcContext = KcContextLike & {
    themeType: "account";
    themeName: string;
    properties: Record<KcEnvName, string>;
};
