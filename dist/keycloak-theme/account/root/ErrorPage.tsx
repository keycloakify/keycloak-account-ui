/* eslint-disable */

// @ts-nocheck

import {
  Button,
  Modal,
  ModalVariant,
  Page,
  Text,
  TextContent,
  TextVariants,
} from "../../shared/@patternfly/react-core";
import { useTranslation } from "react-i18next";
import { isRouteErrorResponse, useRouteError } from "react-router-dom";

type ErrorPageProps = {
  error?: unknown;
};

export const ErrorPage = (props: ErrorPageProps) => {
  const { t } = useTranslation();
  const error = useRouteError() ?? props.error;
  const errorMessage = getErrorMessage(error);

  function onRetry() {
    location.href = location.origin + location.pathname;
  }

  return (
    <Page>
      <Modal
        variant={ModalVariant.small}
        title={t("somethingWentWrong")}
        titleIconVariant="danger"
        showClose={false}
        isOpen
        actions={[
          <Button key="tryAgain" variant="primary" onClick={onRetry}>
            {t("tryAgain")}
          </Button>,
        ]}
      >
        <TextContent>
          <Text>{t("somethingWentWrongDescription")}</Text>
          {errorMessage && (
            <Text component={TextVariants.small}>{errorMessage}</Text>
          )}
        </TextContent>
      </Modal>
    </Page>
  );
};

function getErrorMessage(error: unknown): string | null {
  if (typeof error === "string") {
    return error;
  }

  if (isRouteErrorResponse(error)) {
    return error.statusText;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return null;
}
