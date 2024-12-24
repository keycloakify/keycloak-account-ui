/* eslint-disable */

// @ts-nocheck

import { TextControl } from "../../../shared/keycloak-ui-shared";
import { useTranslation } from "react-i18next";
import { convertToName } from "./DynamicComponents";
import type { ComponentProps } from "./components";

export const StringComponent = ({
  name,
  label,
  helpText,
  ...props
}: ComponentProps) => {
  const { t } = useTranslation();

  return (
    <TextControl
      name={convertToName(name!)}
      label={t(label!)}
      labelIcon={t(helpText!)}
      data-testid={name}
      {...props}
    />
  );
};
