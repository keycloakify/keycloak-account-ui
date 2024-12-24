/* eslint-disable */

// @ts-nocheck

import type RealmRepresentation from "@keycloak/keycloak-admin-client/lib/defs/realmRepresentation";
import { SelectControl, SwitchControl } from "../../../shared/keycloak-ui-shared";
import {
  ActionGroup,
  Button,
  Tab,
  TabTitleText,
  Tabs,
} from "@patternfly/react-core";
import { useEffect, useMemo, useState } from "react";
import { FormProvider, useForm, useWatch } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { FormAccess } from "../../components/form/FormAccess";
import { useServerInfo } from "../../context/server-info/ServerInfoProvider";
import { useWhoAmI } from "../../context/whoami/WhoAmI";
import { DEFAULT_LOCALE } from "../../i18n/i18n";
import { convertToFormValues, localeToDisplayName } from "../../util";
import { EffectiveMessageBundles } from "./EffectiveMessageBundles";
import { RealmOverrides } from "./RealmOverrides";

type LocalizationTabProps = {
  save: (realm: RealmRepresentation) => void;
  realm: RealmRepresentation;
  tableData: Record<string, string>[] | undefined;
};

export const LocalizationTab = ({
  save,
  realm,
  tableData,
}: LocalizationTabProps) => {
  const { t } = useTranslation();
  const { whoAmI } = useWhoAmI();

  const [activeTab, setActiveTab] = useState(0);
  const form = useForm();
  const { setValue, control, handleSubmit, formState } = form;

  const defaultSupportedLocales = realm.supportedLocales?.length
    ? realm.supportedLocales
    : [DEFAULT_LOCALE];

  const themeTypes = useServerInfo().themes!;
  const allLocales = useMemo(() => {
    const locales = Object.values(themeTypes).flatMap((theme) =>
      theme.flatMap(({ locales }) => (locales ? locales : [])),
    );
    return Array.from(new Set(locales));
  }, [themeTypes]);

  const setupForm = () => {
    convertToFormValues(realm, setValue);
    setValue("supportedLocales", defaultSupportedLocales);
  };

  useEffect(setupForm, []);

  const watchSupportedLocales: string[] = useWatch({
    control,
    name: "supportedLocales",
    defaultValue: defaultSupportedLocales,
  });

  const internationalizationEnabled = useWatch({
    control,
    name: "internationalizationEnabled",
    defaultValue: realm.internationalizationEnabled,
  });

  const defaultLocales = useWatch({
    name: "defaultLocale",
    control,
    defaultValue: realm.defaultLocale ? [realm.defaultLocale] : [],
  });

  return (
    <Tabs
      activeKey={activeTab}
      onSelect={(_, key) => setActiveTab(key as number)}
    >
      <Tab
        id="locales"
        eventKey={0}
        title={<TabTitleText>{t("locales")}</TabTitleText>}
        data-testid="rs-localization-locales-tab"
      >
        <FormAccess
          isHorizontal
          role="manage-realm"
          className="pf-v5-u-mt-lg pf-v5-u-ml-md"
          onSubmit={handleSubmit(save)}
        >
          <FormProvider {...form}>
            <SwitchControl
              name="internationalizationEnabled"
              label={t("internationalization")}
              labelIcon={t("internationalizationHelp")}
              labelOn={t("enabled")}
              labelOff={t("disabled")}
              aria-label={t("internationalization")}
            />
            {internationalizationEnabled && (
              <>
                <SelectControl
                  name="supportedLocales"
                  isScrollable
                  label={t("supportedLocales")}
                  controller={{
                    defaultValue: defaultSupportedLocales,
                  }}
                  variant="typeaheadMulti"
                  placeholderText={t("selectLocales")}
                  options={allLocales.map((l) => ({
                    key: l,
                    value: localeToDisplayName(l, whoAmI.getLocale()) || l,
                  }))}
                />
                <SelectControl
                  name="defaultLocale"
                  label={t("defaultLocale")}
                  controller={{
                    defaultValue: DEFAULT_LOCALE,
                  }}
                  data-testid="select-default-locale"
                  options={watchSupportedLocales.map((l) => ({
                    key: l,
                    value: localeToDisplayName(l, whoAmI.getLocale()) || l,
                  }))}
                />
              </>
            )}
          </FormProvider>
          <ActionGroup>
            <Button
              variant="primary"
              isDisabled={!formState.isDirty}
              type="submit"
              data-testid="localization-tab-save"
            >
              {t("save")}
            </Button>
            <Button variant="link" onClick={setupForm}>
              {t("revert")}
            </Button>
          </ActionGroup>
        </FormAccess>
      </Tab>
      <Tab
        id="realm-overrides"
        eventKey={1}
        title={<TabTitleText>{t("realmOverrides")} </TabTitleText>}
        data-testid="rs-localization-realm-overrides-tab"
      >
        <RealmOverrides
          internationalizationEnabled={internationalizationEnabled}
          watchSupportedLocales={watchSupportedLocales}
          realm={realm}
          tableData={tableData}
        />
      </Tab>
      <Tab
        id="effective-message-bundles"
        eventKey={2}
        title={<TabTitleText>{t("effectiveMessageBundles")}</TabTitleText>}
        data-testid="rs-localization-effective-message-bundles-tab"
      >
        <EffectiveMessageBundles
          defaultSupportedLocales={defaultSupportedLocales}
          defaultLocales={defaultLocales}
        />
      </Tab>
    </Tabs>
  );
};
