/* eslint-disable */

// @ts-nocheck

import type { MenuItem } from "../root/PageNav";

export const content: MenuItem[] = [
  { "label": "personalInfo", "path": "" },
  {
    "label": "accountSecurity",
    "children": [
      { "label": "signingIn", "path": "account-security/signing-in" },
      { "label": "deviceActivity", "path": "account-security/device-activity" },
      {
        "label": "linkedAccounts",
        "path": "account-security/linked-accounts",
        "isVisible": "isLinkedAccountsEnabled"
      }
    ]
  },
  { "label": "applications", "path": "applications" },
  {
    "label": "groups",
    "path": "groups",
    "isVisible": "isViewGroupsEnabled"
  },
  {
    "label": "organizations",
    "path": "organizations",
    "isVisible": "isViewOrganizationsEnabled"
  },
  {
    "label": "resources",
    "path": "resources",
    "isVisible": "isMyResourcesEnabled"
  },
  {
    "label": "oid4vci",
    "path": "oid4vci",
    "isVisible":"isOid4VciEnabled"
  }
]
;