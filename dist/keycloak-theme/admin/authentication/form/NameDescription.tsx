/* eslint-disable */

// @ts-nocheck

import { useTranslation } from "react-i18next";
import { TextControl } from "../../../shared/keycloak-ui-shared";

export const NameDescription = () => {
  const { t } = useTranslation();

  return (
    <>
      <TextControl
        name="alias"
        label={t("name")}
        labelIcon={t("flowNameHelp")}
        rules={{ required: { value: true, message: t("required") } }}
      />
      <TextControl
        name="description"
        label={t("description")}
        labelIcon={t("flowDescriptionHelp")}
        rules={{
          maxLength: {
            value: 255,
            message: t("maxLength", { length: 255 }),
          },
        }}
      />
    </>
  );
};
