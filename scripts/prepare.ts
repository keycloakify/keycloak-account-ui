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
        await writeFile({
          fileRelativePath,
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

  let keycloakAccountUiVersion: string | undefined;

  transformCodebase({
    srcDirPath: extractedDirPath,
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

  assert(typeof keycloakAccountUiVersion === "string");

  const parsedTargetPackageJson = await fetch(
    `https://unpkg.com/@keycloak/keycloak-account-ui@${keycloakAccountUiVersion}/package.json`,
    fetchOptions,
  ).then((response) => response.json());

  const thisParsedPackageJson = JSON.parse(
    fs
      .readFileSync(pathJoin(getThisCodebaseRootDirPath(), "package.json"))
      .toString("utf8"),
  );

  const targetPackageVersion: string = parsedTargetPackageJson["version"];

  {
    const thisVersion: string = thisParsedPackageJson["version"];

    if (!thisVersion.startsWith(targetPackageVersion)) {
      console.log(
        chalk.red(
          [
            `Error: The version of this package should match the targeted @keycloak/keycloak-account-ui version.`,
            `Expected ${targetPackageVersion} but got ${thisVersion}`,
            `If you're not ready to release yet you can use ${targetPackageVersion}-rc.0 (1, 2, 3, ...)`,
          ].join(" "),
        ),
      );
      process.exit(1);
    }
  }

  for (const name of Object.keys(thisParsedPackageJson["peerDependencies"])) {
    delete thisParsedPackageJson["devDependencies"][name];
  }

  {
    const {
      react,
      "react-dom": _,
      ...targetDependencies
    } = parsedTargetPackageJson["dependencies"];

    // TODO: Omit react
    thisParsedPackageJson["peerDependencies"] = targetDependencies;

    Object.assign(thisParsedPackageJson["devDependencies"], targetDependencies);
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
    .replaceAll("{{VERSION}}", targetPackageVersion)
    .replaceAll(
      "{{DEPENDENCIES}}",
      JSON.stringify(
        {
          dependencies: {
            [thisParsedPackageJson["name"]]: thisParsedPackageJson["version"],
            ...thisParsedPackageJson["peerDependencies"],
          },
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
