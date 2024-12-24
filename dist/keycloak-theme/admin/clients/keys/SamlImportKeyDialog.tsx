/* eslint-disable */

// @ts-nocheck

import { AlertVariant } from "@patternfly/react-core";
import { FormProvider, useFormContext } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useAdminClient } from "../../admin-client";
import { useAlerts } from "../../../shared/keycloak-ui-shared";
import { ConfirmDialogModal } from "../../components/confirm-dialog/ConfirmDialog";
import { KeyForm } from "./GenerateKeyDialog";
import type { KeyTypes } from "./SamlKeys";
import { SamlKeysDialogForm, submitForm } from "./SamlKeysDialog";

type SamlImportKeyDialogProps = {
  id: string;
  attr: KeyTypes;
  onClose: () => void;
};

export const SamlImportKeyDialog = ({
  id,
  attr,
  onClose,
}: SamlImportKeyDialogProps) => {
  const { adminClient } = useAdminClient();

  const { t } = useTranslation();
  const form = useFormContext<SamlKeysDialogForm>();
  const { handleSubmit } = form;

  const { addAlert, addError } = useAlerts();

  const submit = (form: SamlKeysDialogForm) => {
    submitForm(adminClient, form, id, attr, (error) => {
      if (error) {
        addError("importError", error);
      } else {
        addAlert(t("importSuccess"), AlertVariant.success);
      }
    });
  };

  return (
    <ConfirmDialogModal
      open={true}
      toggleDialog={onClose}
      continueButtonLabel="import"
      titleKey="importKey"
      onConfirm={() => {
        handleSubmit(submit)();
        onClose();
      }}
    >
      <FormProvider {...form}>
        <KeyForm useFile hasPem />
      </FormProvider>
    </ConfirmDialogModal>
  );
};
