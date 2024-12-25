import type { KcContextLike } from "./KcAccountUiLoader";
import { z } from "zod";
export declare const zKcContextLikeKeycloak25AndUp: z.ZodType<KcContextLike.Keycloak25AndUp, z.ZodTypeDef, KcContextLike.Keycloak25AndUp>;
export declare const zKcContextLikeKeycloak20To24: z.ZodType<KcContextLike.Keycloak20To24, z.ZodTypeDef, KcContextLike.Keycloak20To24>;
export declare const zKcContextLikeKeycloak19: z.ZodType<KcContextLike.Keycloak19, z.ZodTypeDef, KcContextLike.Keycloak19>;
export declare const zKcContextLike: z.ZodType<KcContextLike, z.ZodTypeDef, KcContextLike>;
export declare function logValidationResult(kcContext: any): void;
