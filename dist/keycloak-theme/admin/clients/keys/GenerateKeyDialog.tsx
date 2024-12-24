/* eslint-disable */

// @ts-nocheck

import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Controller,
  FormProvider,
  useForm,
  useFormContext,
} from "react-hook-form";
import {
  Button,
  ButtonVariant,
  Form,
  FormGroup,
  Modal,
  ModalVariant,
  Text,
  TextContent,
} from "@patternfly/react-core";

import type KeyStoreConfig from "@keycloak/keycloak-admin-client/lib/defs/keystoreConfig";
import { HelpItem, SelectControl } from "../../../shared/keycloak-ui-shared";
import { StoreSettings } from "./StoreSettings";
import { FileUpload } from "../../components/json-file-upload/patternfly/FileUpload";
import { useServerInfo } from "../../context/server-info/ServerInfoProvider";

type GenerateKeyDialogProps = {
  clientId: string;
  toggleDialog: () => void;
  save: (keyStoreConfig: KeyStoreConfig) => void;
};

type KeyFormProps = {
  useFile?: boolean;
  isSaml?: boolean;
  hasPem?: boolean;
};

const CERT_PEM = "Certificate PEM" as const;

const extensions = new Map([
  ["PKCS12", "p12"],
  ["JKS", "jks"],
  ["BCFKS", "bcfks"],
]);

type FormFields = KeyStoreConfig & {
  file: string | File;
};

export const getFileExtension = (format: string) => extensions.get(format);

export const KeyForm = ({
  isSaml = false,
  hasPem = false,
  useFile = false,
}: KeyFormProps) => {
  const { t } = useTranslation();

  const [filename, setFilename] = useState<string>();

  const { control, watch } = useFormContext<FormFields>();
  const format = watch("format");

  const { cryptoInfo } = useServerInfo();
  const supportedKeystoreTypes = [
    ...(cryptoInfo?.supportedKeystoreTypes ?? []),
    ...(hasPem ? [CERT_PEM] : []),
  ];

  return (
    <Form className="pf-v5-u-pt-lg">
      <SelectControl
        name="format"
        label={t("archiveFormat")}
        labelIcon={t("archiveFormatHelp")}
        controller={{
          defaultValue: supportedKeystoreTypes[0],
        }}
        menuAppendTo="parent"
        options={supportedKeystoreTypes}
      />
      {useFile && (
        <FormGroup
          label={t("importFile")}
          labelIcon={
            <HelpItem
              helpText={t("importFileHelp")}
              fieldLabelId="importFile"
            />
          }
          fieldId="importFile"
        >
          <Controller
            name="file"
            defaultValue=""
            control={control}
            render={({ field }) => (
              <FileUpload
                id="importFile"
                value={field.value}
                filename={filename}
                browseButtonText={t("browse")}
                onChange={(value, filename) => {
                  setFilename(filename);
                  field.onChange(value);
                }}
              />
            )}
          />
        </FormGroup>
      )}
      {format !== CERT_PEM && (
        <StoreSettings hidePassword={useFile} isSaml={isSaml} />
      )}
    </Form>
  );
};

export const GenerateKeyDialog = ({
  clientId,
  save,
  toggleDialog,
}: GenerateKeyDialogProps) => {
  const { t } = useTranslation();
  const form = useForm<KeyStoreConfig>({
    defaultValues: { keyAlias: clientId },
    mode: "onChange",
  });

  const {
    handleSubmit,
    formState: { isValid },
  } = form;

  return (
    <Modal
      variant={ModalVariant.medium}
      title={t("generateKeys")}
      isOpen
      onClose={toggleDialog}
      actions={[
        <Button
          id="modal-confirm"
          key="confirm"
          data-testid="confirm"
          isDisabled={!isValid}
          onClick={() => {
            handleSubmit((config) => {
              save(config);
              toggleDialog();
            })();
          }}
        >
          {t("generate")}
        </Button>,
        <Button
          id="modal-cancel"
          key="cancel"
          data-testid="cancel"
          variant={ButtonVariant.link}
          onClick={() => {
            toggleDialog();
          }}
        >
          {t("cancel")}
        </Button>,
      ]}
    >
      <TextContent>
        <Text>{t("generateKeysDescription")}</Text>
      </TextContent>
      <FormProvider {...form}>
        <KeyForm />
      </FormProvider>
    </Modal>
  );
};
