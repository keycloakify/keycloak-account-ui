/* eslint-disable @typescript-eslint/no-explicit-any */
import { z } from "zod";
import { id } from "tsafe/id";
import { assert, is } from "tsafe/assert";
const zKcContextLikeCommon = (() => {
    const zTargetType = z.object({
        realm: z.object({
            name: z.string(),
            registrationEmailAsUsername: z.boolean(),
            editUsernameAllowed: z.boolean(),
            isInternationalizationEnabled: z.boolean(),
            identityFederationEnabled: z.boolean(),
            userManagedAccessAllowed: z.boolean()
        }),
        resourceUrl: z.string(),
        baseUrl: z.object({
            rawSchemeSpecificPart: z.string(),
            scheme: z.string()
        }),
        locale: z.string(),
        isAuthorizationEnabled: z.boolean(),
        deleteAccountAllowed: z.boolean(),
        updateEmailFeatureEnabled: z.boolean(),
        updateEmailActionEnabled: z.boolean(),
        isViewOrganizationsEnabled: z.boolean().optional(),
    });
    assert();
    return id(zTargetType);
})();
const zI18nApi = (() => {
    const zTargetType = z.object({
        msgJSON: z.string(),
        supportedLocales: z.record(z.string()).optional(),
    });
    assert();
    return id(zTargetType);
})();
export const zKcContextLikeKeycloak25AndUp = (() => {
    const zTargetType = z.intersection(zKcContextLikeCommon, z.object({
        serverBaseUrl: z.string(),
        authUrl: z.string(),
        clientId: z.string(),
        authServerUrl: z.string(),
        isOid4VciEnabled: z.boolean(),
        isViewGroupsEnabled: z.boolean(),
    }));
    assert();
    return id(zTargetType);
})();
export const zKcContextLikeKeycloak20To24 = (() => {
    const zTargetType = z.intersection(z.intersection(zKcContextLikeCommon, zI18nApi), z.object({
        authUrl: z.object({
            rawSchemeSpecificPart: z.string(),
            scheme: z.string(),
        }),
        isViewGroupsEnabled: z.boolean(),
    }));
    assert();
    return id(zTargetType);
})();
export const zKcContextLikeKeycloak19 = (() => {
    const zTargetType = z.intersection(z.intersection(zKcContextLikeCommon, zI18nApi), z.object({
        authUrl: z.object({
            rawSchemeSpecificPart: z.string(),
            scheme: z.string(),
        }),
    }));
    assert();
    return id(zTargetType);
})();
export const zKcContextLike = (() => {
    const zTargetType = z.union([
        zKcContextLikeKeycloak25AndUp,
        zKcContextLikeKeycloak20To24,
        zKcContextLikeKeycloak19
    ]);
    assert();
    return id(zTargetType);
})();
export function logValidationResult(kcContext) {
    const errorCommon = (() => {
        try {
            zKcContextLikeCommon.parse(kcContext);
        }
        catch (error) {
            assert(is(error));
            return JSON.parse(error.message);
        }
        return undefined;
    })();
    const error = (() => {
        try {
            zKcContextLike.parse(kcContext);
        }
        catch (error) {
            assert(is(error));
            return JSON.parse(error.message);
        }
        return undefined;
    })();
    const error19 = (() => {
        try {
            zKcContextLikeKeycloak19.parse(kcContext);
        }
        catch (error) {
            assert(is(error));
            return JSON.parse(error.message);
        }
        return undefined;
    })();
    const error20to24 = (() => {
        try {
            zKcContextLikeKeycloak20To24.parse(kcContext);
        }
        catch (error) {
            assert(is(error));
            return JSON.parse(error.message);
        }
        return undefined;
    })();
    const error25andUp = (() => {
        try {
            zKcContextLikeKeycloak25AndUp.parse(kcContext);
        }
        catch (error) {
            assert(is(error));
            return JSON.parse(error.message);
        }
        return undefined;
    })();
    console.log({
        errorCommon,
        error,
        error19,
        error20to24,
        error25andUp
    });
}
//# sourceMappingURL=zKcContextLike.js.map