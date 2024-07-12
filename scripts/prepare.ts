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
import fetch from "make-fetch-happen";
import * as fs from "fs";
import chalk from "chalk";
import * as child_process from "child_process";

const KEYCLOAK_VERSION = "25.0.1";

(async () => {
  const fetchOptions = getProxyFetchOptions({
    npmConfigGetCwd: getThisCodebaseRootDirPath(),
  });

  const { extractedDirPath } = await downloadAndExtractArchive({
    url: `https://github.com/keycloak/keycloak/archive/refs/tags/${KEYCLOAK_VERSION}.zip`,
    cacheDirPath: pathJoin(
      getThisCodebaseRootDirPath(),
      "node_modules",
      ".cache",
      "scripts",
    ),
    fetchOptions,
    uniqueIdOfOnArchiveFile: "download_keycloak-account-ui-sources",
    onArchiveFile: async ({ fileRelativePath, readFile, writeFile }) => {
      fileRelativePath = fileRelativePath.split(pathSep).slice(1).join(pathSep);

      if (/\.test\.[a-z0-9]{2,3}/.test(fileRelativePath)) {
        return;
      }

      account_ui: {
        {
          const dirPath = pathJoin("js", "apps", "account-ui");

          if (
            !isInside({
              filePath: fileRelativePath,
              dirPath,
            })
          ) {
            break account_ui;
          }

          fileRelativePath = pathRelative(dirPath, fileRelativePath);
        }

        if (fileRelativePath === "package.json") {
          await writeFile({
            fileRelativePath: pathJoin("account-ui", "package.json"),
          });

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

        if (fileRelativePath === "index.ts") {
          return;
        }

        if (fileRelativePath === "vite-env.d.ts") {
          return;
        }

        const sourceCode = (await readFile()).toString("utf8");

        let modifiedSourceCode: string | undefined = undefined;

        if (
          fileRelativePath.endsWith(".ts") ||
          fileRelativePath.endsWith(".tsx")
        ) {
          modifiedSourceCode = sourceCode
            .replaceAll(
              /((?:from )|(?:import\())"(\.[./]*\/)/g,
              (_, p1, p2) =>
                `${p1}"@keycloakify/keycloak-account-ui/${pathJoin(
                  pathDirname(fileRelativePath),
                  p2.replace("/", pathSep),
                )
                  .replaceAll(pathSep, "/")
                  .replace(/^\.\//, "")}`,
            )
            .replaceAll(
              `"@keycloak/keycloak-ui-shared"`,
              `"@keycloakify/keycloak-account-ui/ui-shared"`,
            );
        }

        await writeFile({
          fileRelativePath: pathJoin("account-ui", fileRelativePath),
          modifiedData:
            modifiedSourceCode === undefined
              ? undefined
              : Buffer.from(modifiedSourceCode, "utf8"),
        });
      }

      ui_shared: {
        {
          const dirPath = pathJoin("js", "libs", "ui-shared");

          if (
            !isInside({
              filePath: fileRelativePath,
              dirPath,
            })
          ) {
            break ui_shared;
          }

          fileRelativePath = pathRelative(dirPath, fileRelativePath);
        }

        if (fileRelativePath === "package.json") {
          await writeFile({
            fileRelativePath: pathJoin("ui-shared", "package.json"),
          });

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

        if (fileRelativePath === "vite-env.d.ts") {
          return;
        }

        const sourceCode = (await readFile()).toString("utf8");

        const modifiedSourceCode = sourceCode.replaceAll(
          /((?:from )|(?:import\())"(\.[./]*\/)/g,
          (_, p1, p2) =>
            `${p1}"@keycloakify/keycloak-account-ui/ui-shared/${pathJoin(
              pathDirname(fileRelativePath),
              p2.replace("/", pathSep),
            )
              .replaceAll(pathSep, "/")
              .replace(/^\.\//, "")}`,
        );

        await writeFile({
          fileRelativePath: pathJoin("ui-shared", fileRelativePath),
          modifiedData: Buffer.from(modifiedSourceCode, "utf8"),
        });

        if (fileRelativePath === "main.ts") {
          await writeFile({
            fileRelativePath: pathJoin("ui-shared", "index.ts"),
            modifiedData: Buffer.from(
              ["export * from './main';", ""].join("\n"),
              "utf8",
            ),
          });
        }
      }
    },
  });

  let keycloakAccountUiVersion: string | undefined;

  transformCodebase({
    srcDirPath: pathJoin(extractedDirPath, "account-ui"),
    destDirPath: pathJoin(getThisCodebaseRootDirPath(), "src"),
    transformSourceCode: ({ fileRelativePath, sourceCode }) => {
      if (fileRelativePath === "package.json") {
        keycloakAccountUiVersion = JSON.parse(sourceCode.toString("utf8"))[
          "version"
        ];

        return;
      }

      return { modifiedSourceCode: sourceCode };
    },
  });

  let keycloakUiSharedVersion: string | undefined;

  transformCodebase({
    srcDirPath: pathJoin(extractedDirPath, "ui-shared"),
    destDirPath: pathJoin(getThisCodebaseRootDirPath(), "src", "ui-shared"),
    transformSourceCode: ({ fileRelativePath, sourceCode }) => {
      if (fileRelativePath === "package.json") {
        keycloakUiSharedVersion = JSON.parse(sourceCode.toString("utf8"))[
          "version"
        ];

        return;
      }

      return { modifiedSourceCode: sourceCode };
    },
  });

  assert(typeof keycloakAccountUiVersion === "string");

  const parsedAccountUiPackageJson = await fetch(
    `https://unpkg.com/@keycloak/keycloak-account-ui@${keycloakAccountUiVersion}/package.json`,
    fetchOptions,
  ).then((response) => response.json());

  const thisParsedPackageJson = JSON.parse(
    fs
      .readFileSync(pathJoin(getThisCodebaseRootDirPath(), "package.json"))
      .toString("utf8"),
  );

  {
    const thisVersion: string = thisParsedPackageJson["version"];

    if (!thisVersion.startsWith(keycloakAccountUiVersion)) {
      console.log(
        chalk.red(
          [
            `Error: The version of this package should match the targeted @keycloak/keycloak-account-ui version.`,
            `Expected ${keycloakAccountUiVersion} but got ${thisVersion}`,
            `If you're not ready to release yet you can use ${keycloakAccountUiVersion}-rc.0 (1, 2, 3, ...)`,
          ].join(" "),
        ),
      );
      process.exit(1);
    }
  }

  let devDependenciesToInstall: Record<string, string> | undefined = undefined;

  {
    for (const name of Object.keys(thisParsedPackageJson["peerDependencies"])) {
      delete thisParsedPackageJson["devDependencies"][name];
    }

    const parsedSharedUiPackageJson = await fetch(
      `https://unpkg.com/@keycloak/keycloak-ui-shared@${keycloakUiSharedVersion}/package.json`,
      fetchOptions,
    ).then((response) => response.json());

    thisParsedPackageJson["peerDependencies"] = Object.fromEntries(
      Object.entries({
        ...parsedAccountUiPackageJson["dependencies"],
        ...parsedSharedUiPackageJson["dependencies"],
      }).filter(
        ([name]) =>
          name !== "react" &&
          name !== "react-dom" &&
          name !== parsedSharedUiPackageJson["name"],
      ),
    );

    devDependenciesToInstall = {};

    for (const name of Object.keys(thisParsedPackageJson["peerDependencies"])) {
      const typeName = name.startsWith("@")
        ? `@types/${name.substring(1).replace("/", "__")}`
        : `@types/${name}`;

      const versionRange = {
        ...parsedAccountUiPackageJson["devDependencies"],
        ...parsedSharedUiPackageJson["devDependencies"],
      }[typeName];

      if (versionRange === undefined) {
        continue;
      }

      devDependenciesToInstall[typeName] = versionRange;
    }

    Object.assign(thisParsedPackageJson["devDependencies"], {
      ...thisParsedPackageJson["peerDependencies"],
      ...devDependenciesToInstall,
    });
  }

  fs.writeFileSync(
    pathJoin(getThisCodebaseRootDirPath(), "package.json"),
    JSON.stringify(thisParsedPackageJson, undefined, 2),
  );

  child_process.execSync("yarn install --ignore-scripts", {
    cwd: getThisCodebaseRootDirPath(),
    stdio: "ignore",
  });

  child_process.execSync("yarn format", {
    cwd: getThisCodebaseRootDirPath(),
    stdio: "ignore",
  });

  const readme = fs
    .readFileSync(pathJoin(__dirname, "README-template.md"))
    .toString("utf8")
    .replaceAll("{{VERSION}}", keycloakAccountUiVersion)
    .replaceAll("{{KEYCLOAK_VERSION}}", KEYCLOAK_VERSION)
    .replaceAll(
      "{{DEPENDENCIES}}",
      JSON.stringify(
        {
          dependencies: {
            [thisParsedPackageJson["name"]]: thisParsedPackageJson["version"],
            ...thisParsedPackageJson["peerDependencies"],
          },
          devDependencies: devDependenciesToInstall,
        },
        undefined,
        2,
      ),
    );

  fs.writeFileSync(
    pathJoin(getThisCodebaseRootDirPath(), "README.md"),
    Buffer.from(readme, "utf8"),
  );

  console.log(
    chalk.green(
      `\n\nPulled @keycloak/keycloak-account-ui@${keycloakAccountUiVersion} from keycloak version ${KEYCLOAK_VERSION}`,
    ),
  );
})();
