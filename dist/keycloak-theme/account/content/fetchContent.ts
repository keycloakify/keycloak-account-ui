/* eslint-disable */

// @ts-nocheck

import type { CallOptions } from "../api/methods";
import type { MenuItem } from "../root/PageNav";

export default async function fetchContentJson(
  opts: CallOptions,
): Promise<MenuItem[]> {
  const { content } = await import("../assets/content");
  return content;
}