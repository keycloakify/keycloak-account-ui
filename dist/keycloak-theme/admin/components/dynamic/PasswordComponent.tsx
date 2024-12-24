/* eslint-disable */

// @ts-nocheck

import { useTranslation } from "react-i18next";
import { PasswordControl } from "../../../shared/keycloak-ui-shared";
import { convertToName } from "./DynamicComponents";
import type { ComponentProps } from "./components";

export const PasswordComponent = ({
  name,
  label,
  helpText,
  defaultValue,
  required,
  isDisabled = false,
}: ComponentProps) => {
  const { t } = useTranslation();

  return (
    <PasswordControl
      name={convertToName(name!)}
      label={t(label!)}
      labelIcon={t(helpText!)}
      isDisabled={isDisabled}
      defaultValue={defaultValue?.toString()}
      rules={{
        required: { value: !!required, message: t("required") },
      }}
    />
  );
};
