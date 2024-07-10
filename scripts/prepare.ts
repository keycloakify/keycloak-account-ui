import { downloadAndExtractArchive } from "./tools/downloadAndExtractArchive";
import {
  join as pathJoin,
  relative as pathRelative,
  sep as pathSep,
  dirname as pathDirname,
} from "path";
import { getThisCodebaseRootDirPath } from "./tools/getThisCodebaseRootDirPath";
import { getProxyFetchOptions } from "./tools/fetchProxyOptions";
import { transformCodebase } from "./tools/transformCodebase";
import { isInside } from "./tools/isInside";
import { assert } from "tsafe/assert";

const KEYCLOAK_VERSION = "25.0.1";

(async () => {
  let keycloakAccountUiVersion: string | undefined;

  const { extractedDirPath } = await downloadAndExtractArchive({
    url: `https://github.com/keycloak/keycloak/archive/refs/tags/${KEYCLOAK_VERSION}.zip`,
    cacheDirPath: pathJoin(
      getThisCodebaseRootDirPath(),
      "node_modules",
      ".cache",
      "scripts",
    ),
    fetchOptions: getProxyFetchOptions({
      npmConfigGetCwd: getThisCodebaseRootDirPath(),
    }),
    uniqueIdOfOnArchiveFile: "download_keycloak-account-ui-sources",
    onArchiveFile: async ({ fileRelativePath, readFile, writeFile }) => {
      fileRelativePath = fileRelativePath.split(pathSep).slice(1).join(pathSep);

      {
        const dirPath = pathJoin("js", "apps", "account-ui");

        if (
          !isInside({
            filePath: fileRelativePath,
            dirPath,
          })
        ) {
          return;
        }

        fileRelativePath = pathRelative(dirPath, fileRelativePath);
      }

      if (fileRelativePath === "package.json") {
        keycloakAccountUiVersion = JSON.parse(
          (await readFile()).toString("utf8"),
        )["version"];

        return;
      }

      {
        const dirPath = "src";

        if (
          !isInside({
            filePath: fileRelativePath,
            dirPath,
          })
        ) {
          return;
        }

        fileRelativePath = pathRelative(dirPath, fileRelativePath);
      }

      if (fileRelativePath === "main.tsx") {
        return;
      }

      if (fileRelativePath === "index.tsx") {
        return;
      }

      const sourceCode = (await readFile()).toString("utf8");

      const modifiedSourceCode = sourceCode.replaceAll(
        /((?:from )|(?:import\())"(\.[./]*\/)/g,
        (_, p1, p2) =>
          `${p1}"@keycloakify/keycloak-account-ui/${pathJoin(
            pathDirname(fileRelativePath),
            p2.replace("/", pathSep),
          )
            .replaceAll(pathSep, "/")
            .replace(/^\.\//, "")}`,
      );

      await writeFile({
        fileRelativePath,
        modifiedData: Buffer.from(modifiedSourceCode, "utf8"),
      });
    },
  });

  assert(typeof keycloakAccountUiVersion === "string");

  transformCodebase({
    srcDirPath: extractedDirPath,
    destDirPath: pathJoin(getThisCodebaseRootDirPath(), "src"),
  });

  console.log(
    `Pulled @keycloak/keycloak-account-ui@${keycloakAccountUiVersion} from keycloak version ${KEYCLOAK_VERSION}`,
  );
})();
