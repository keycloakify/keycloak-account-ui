/* eslint-disable */

// @ts-nocheck

import { CodeEditor, Language } from "@patternfly/react-code-editor";
import { FormGroup } from "@patternfly/react-core";
import { Controller, useFormContext } from "react-hook-form";
import { useTranslation } from "react-i18next";

import { HelpItem } from "../../../shared/keycloak-ui-shared";
import type { ComponentProps } from "./components";
import { convertToName } from "./DynamicComponents";

export const ScriptComponent = ({
  name,
  label,
  helpText,
  defaultValue,
  required,
  isDisabled = false,
}: ComponentProps) => {
  const { t } = useTranslation();
  const { control } = useFormContext();

  return (
    <FormGroup
      label={t(label!)}
      labelIcon={
        <HelpItem
          helpText={<span style={{ whiteSpace: "pre-wrap" }}>{helpText}</span>}
          fieldLabelId={`${label}`}
        />
      }
      fieldId={name!}
      isRequired={required}
    >
      <Controller
        name={convertToName(name!)}
        defaultValue={defaultValue}
        control={control}
        render={({ field }) => (
          <CodeEditor
            id={name!}
            data-testid={name}
            isReadOnly={isDisabled}
            type="text"
            onChange={field.onChange}
            code={Array.isArray(field.value) ? field.value[0] : field.value}
            height="600px"
            language={Language.javascript}
          />
        )}
      />
    </FormGroup>
  );
};
