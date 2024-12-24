/* eslint-disable */

// @ts-nocheck

import { Banner, Flex, FlexItem } from "@patternfly/react-core";
import { ExclamationTriangleIcon } from "@patternfly/react-icons";
import { useWhoAmI } from "./context/whoami/WhoAmI";
import { useTranslation } from "react-i18next";

type WarnBannerProps = {
  msg: string;
};

const WarnBanner = ({ msg }: WarnBannerProps) => {
  const { t } = useTranslation();

  return (
    <Banner screenReaderText={t(msg)} variant="gold" isSticky>
      <Flex
        spaceItems={{ default: "spaceItemsSm" }}
        flexWrap={{ default: "wrap" }}
      >
        <FlexItem style={{ whiteSpace: "normal" }}>
          <ExclamationTriangleIcon style={{ marginRight: "0.3rem" }} />
          {t(msg)}
        </FlexItem>
      </Flex>
    </Banner>
  );
};

export const Banners = () => {
  const { whoAmI } = useWhoAmI();

  if (whoAmI.isTemporary()) return <WarnBanner msg="loggedInAsTempAdminUser" />;
};
