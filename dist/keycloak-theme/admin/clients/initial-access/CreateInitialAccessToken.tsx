/* eslint-disable */

// @ts-nocheck

import type ClientInitialAccessPresentation from "@keycloak/keycloak-admin-client/lib/defs/clientInitialAccessPresentation";
import {
  ActionGroup,
  AlertVariant,
  Button,
  PageSection,
} from "@patternfly/react-core";
import { useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router-dom";
import { NumberControl } from "../../../shared/keycloak-ui-shared";
import { useAdminClient } from "../../admin-client";
import { useAlerts } from "../../../shared/keycloak-ui-shared";
import { FormAccess } from "../../components/form/FormAccess";
import { TimeSelectorControl } from "../../components/time-selector/TimeSelectorControl";
import { ViewHeader } from "../../components/view-header/ViewHeader";
import { useRealm } from "../../context/realm-context/RealmContext";
import { toClients } from "../routes/Clients";
import { AccessTokenDialog } from "./AccessTokenDialog";

export default function CreateInitialAccessToken() {
  const { adminClient } = useAdminClient();

  const { t } = useTranslation();
  const form = useForm({ mode: "onChange" });
  const {
    handleSubmit,
    formState: { isValid },
  } = form;

  const { realm } = useRealm();
  const { addAlert, addError } = useAlerts();

  const navigate = useNavigate();
  const [token, setToken] = useState("");

  const save = async (clientToken: ClientInitialAccessPresentation) => {
    try {
      const access = await adminClient.realms.createClientsInitialAccess(
        { realm },
        clientToken,
      );
      setToken(access.token!);
    } catch (error) {
      addError("tokenSaveError", error);
    }
  };

  return (
    <FormProvider {...form}>
      {token && (
        <AccessTokenDialog
          token={token}
          toggleDialog={() => {
            setToken("");
            addAlert(t("tokenSaveSuccess"), AlertVariant.success);
            navigate(toClients({ realm, tab: "initial-access-token" }));
          }}
        />
      )}
      <ViewHeader titleKey="createToken" subKey="createTokenHelp" />
      <PageSection variant="light">
        <FormAccess
          isHorizontal
          role="create-client"
          onSubmit={handleSubmit(save)}
        >
          <TimeSelectorControl
            name="expiration"
            label={t("expiration")}
            labelIcon={t("tokenExpirationHelp")}
            controller={{
              defaultValue: 86400,
              rules: {
                min: {
                  value: 1,
                  message: t("expirationValueNotValid"),
                },
              },
            }}
          />
          <NumberControl
            name="count"
            label={t("count")}
            labelIcon={t("countHelp")}
            controller={{
              rules: {
                min: 1,
              },
              defaultValue: 1,
            }}
          />
          <ActionGroup>
            <Button
              variant="primary"
              type="submit"
              data-testid="save"
              isDisabled={!isValid}
            >
              {t("save")}
            </Button>
            <Button
              data-testid="cancel"
              variant="link"
              component={(props) => (
                <Link
                  {...props}
                  to={toClients({ realm, tab: "initial-access-token" })}
                />
              )}
            >
              {t("cancel")}
            </Button>
          </ActionGroup>
        </FormAccess>
      </PageSection>
    </FormProvider>
  );
}
