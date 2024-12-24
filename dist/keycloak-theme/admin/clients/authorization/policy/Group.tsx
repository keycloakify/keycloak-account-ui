/* eslint-disable */

// @ts-nocheck

import type GroupRepresentation from "@keycloak/keycloak-admin-client/lib/defs/groupRepresentation";
import {
  FormErrorText,
  HelpItem,
  TextControl,
  useFetch,
} from "../../../../shared/keycloak-ui-shared";
import { Button, Checkbox, FormGroup } from "@patternfly/react-core";
import { MinusCircleIcon } from "@patternfly/react-icons";
import { Table, Tbody, Td, Th, Thead, Tr } from "@patternfly/react-table";
import { useState } from "react";
import { Controller, useFormContext } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useAdminClient } from "../../../admin-client";
import { GroupPickerDialog } from "../../../components/group/GroupPickerDialog";

type GroupForm = {
  groups?: GroupValue[];
  groupsClaim: string;
};

export type GroupValue = {
  id: string;
  extendChildren: boolean;
};

export const Group = () => {
  const { adminClient } = useAdminClient();

  const { t } = useTranslation();
  const {
    control,
    getValues,
    setValue,
    formState: { errors },
  } = useFormContext<GroupForm>();
  const values = getValues("groups");

  const [open, setOpen] = useState(false);
  const [selectedGroups, setSelectedGroups] = useState<GroupRepresentation[]>(
    [],
  );

  useFetch(
    () => {
      if (values && values.length > 0)
        return Promise.all(
          values.map((g) => adminClient.groups.findOne({ id: g.id })),
        );
      return Promise.resolve([]);
    },
    (groups) => {
      const filteredGroup = groups.filter((g) => g) as GroupRepresentation[];
      setSelectedGroups(filteredGroup);
    },
    [],
  );

  return (
    <>
      <TextControl
        name="groupsClaim"
        label={t("groupsClaim")}
        labelIcon={t("groupsClaimHelp")}
      />
      <FormGroup
        label={t("groups")}
        labelIcon={
          <HelpItem helpText={t("policyGroupsHelp")} fieldLabelId="groups" />
        }
        fieldId="groups"
        isRequired
      >
        <Controller
          name="groups"
          control={control}
          defaultValue={[]}
          rules={{
            validate: (value?: GroupValue[]) =>
              value && value.filter(({ id }) => id).length > 0,
          }}
          render={({ field }) => (
            <>
              {open && (
                <GroupPickerDialog
                  type="selectMany"
                  text={{
                    title: "addGroupsToGroupPolicy",
                    ok: "add",
                  }}
                  onConfirm={(groups) => {
                    field.onChange([
                      ...(field.value || []),
                      ...(groups || []).map(({ id }) => ({ id })),
                    ]);
                    setSelectedGroups([...selectedGroups, ...(groups || [])]);
                    setOpen(false);
                  }}
                  onClose={() => {
                    setOpen(false);
                  }}
                  filterGroups={selectedGroups}
                />
              )}
              <Button
                data-testid="select-group-button"
                variant="secondary"
                onClick={() => {
                  setOpen(true);
                }}
              >
                {t("addGroups")}
              </Button>
            </>
          )}
        />
        {selectedGroups.length > 0 && (
          <Table variant="compact">
            <Thead>
              <Tr>
                <Th>{t("groups")}</Th>
                <Th>{t("extendToChildren")}</Th>
                <Th aria-hidden="true" />
              </Tr>
            </Thead>
            <Tbody>
              {selectedGroups.map((group, index) => (
                <Tr key={group.id}>
                  <Td>{group.path}</Td>
                  <Td>
                    <Controller
                      name={`groups.${index}.extendChildren`}
                      defaultValue={false}
                      control={control}
                      render={({ field }) => (
                        <Checkbox
                          id="extendChildren"
                          data-testid="standard"
                          name="extendChildren"
                          isChecked={field.value}
                          onChange={field.onChange}
                          isDisabled={group.subGroupCount === 0}
                        />
                      )}
                    />
                  </Td>
                  <Td>
                    <Button
                      variant="link"
                      className="keycloak__client-authorization__policy-row-remove"
                      icon={<MinusCircleIcon />}
                      onClick={() => {
                        setValue("groups", [
                          ...(values || []).filter(({ id }) => id !== group.id),
                        ]);
                        setSelectedGroups([
                          ...selectedGroups.filter(({ id }) => id !== group.id),
                        ]);
                      }}
                    />
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        )}
        {errors.groups && <FormErrorText message={t("requiredGroups")} />}
      </FormGroup>
    </>
  );
};
