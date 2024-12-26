import * as crypto from "crypto";

export function getHash(data: string | Buffer): string {
    return crypto
        .createHash("sha256")
        .update(typeof data === "string" ? data : data.toString("utf8"))
        .digest("hex");
}
