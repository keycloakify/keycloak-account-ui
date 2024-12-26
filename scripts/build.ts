import { downloadAndExtractArchive } from "./tools/downloadAndExtractArchive";
import {
    join as pathJoin,
    relative as pathRelative,
    sep as pathSep,
    basename as pathBasename
} from "path";
import { getThisCodebaseRootDirPath } from "./tools/getThisCodebaseRootDirPath";
import { getProxyFetchOptions } from "./tools/fetchProxyOptions";
import { transformCodebase } from "./tools/transformCodebase";
import { isInside } from "./tools/isInside";
import { assert, is, type Equals } from "tsafe/assert";
import fetch from "make-fetch-happen";
import * as fs from "fs";
import chalk from "chalk";
import child_process from "child_process";
import { id } from "tsafe/id";
import { z } from "zod";
import { getHash } from "./tools/getHash";

(async () => {
    const { parsedPackageJson } = (() => {
        type ParsedPackageJson = {
            name: string;
            version: string;
            repository: Record<string, unknown>;
            license: string;
            author: string;
            homepage: string;
            keywords: string[];
            dependencies?: Record<string, string>;
        };

        const zParsedPackageJson = (() => {
            type TargetType = ParsedPackageJson;

            const zTargetType = z.object({
                name: z.string(),
                version: z.string(),
                repository: z.record(z.unknown()),
                license: z.string(),
                author: z.string(),
                homepage: z.string(),
                keywords: z.array(z.string()),
                dependencies: z.record(z.string()).optional()
            });

            type InferredType = z.infer<typeof zTargetType>;

            assert<Equals<ParsedPackageJson, InferredType>>;

            return id<z.ZodType<TargetType>>(zTargetType);
        })();

        assert<Equals<z.TypeOf<typeof zParsedPackageJson>, ParsedPackageJson>>;

        const parsedPackageJson = JSON.parse(
            fs.readFileSync(pathJoin(getThisCodebaseRootDirPath(), "package.json")).toString("utf8")
        );

        zParsedPackageJson.parse(parsedPackageJson);

        assert(is<ParsedPackageJson>(parsedPackageJson));

        return { parsedPackageJson };
    })();

    const keycloakVersion = (() => {
        const major = parsedPackageJson.version.split(".")[0];

        return `${parseInt(major[0] + major[1])}.${parseInt(major[2] + major[3])}.${parseInt(major[4] + major[5])}`;
    })();

    const fetchOptions = getProxyFetchOptions({
        npmConfigGetCwd: getThisCodebaseRootDirPath()
    });

    const cacheDirPath = pathJoin(getThisCodebaseRootDirPath(), "node_modules", ".cache", "scripts");

    const { extractedDirPath } = await downloadAndExtractArchive({
        url: `https://github.com/keycloak/keycloak/archive/refs/tags/${keycloakVersion}.zip`,
        cacheDirPath,
        fetchOptions,
        uniqueIdOfOnArchiveFile: "download_keycloak_account_ui_sources",
        onArchiveFile: async ({ fileRelativePath, readFile, writeFile }) => {
            fileRelativePath = fileRelativePath.split(pathSep).slice(1).join(pathSep);

            if (/\.test\.[a-z0-9]{2,3}/.test(fileRelativePath)) {
                return;
            }

            {
                const dirPath = pathJoin("js", "apps", "account-ui");

                if (
                    !isInside({
                        filePath: fileRelativePath,
                        dirPath
                    })
                ) {
                    return;
                }

                fileRelativePath = pathRelative(dirPath, fileRelativePath);
            }

            if (fileRelativePath === "package.json") {
                const version = JSON.parse((await readFile()).toString("utf8")).version as unknown;

                assert(typeof version === "string");

                await writeFile({
                    fileRelativePath: "package.json",
                    modifiedData: Buffer.from(JSON.stringify({ version }), "utf8")
                });

                return;
            }

            {
                const dirPath = "src";

                if (
                    !isInside({
                        filePath: fileRelativePath,
                        dirPath
                    })
                ) {
                    return;
                }

                fileRelativePath = pathRelative(dirPath, fileRelativePath);
            }

            if (fileRelativePath === "index.ts") {
                return;
            }

            if (fileRelativePath === "vite-env.d.ts") {
                return;
            }

            if (!fileRelativePath.endsWith(".ts") && !fileRelativePath.endsWith(".tsx")) {
                await writeFile({ fileRelativePath });
                return;
            }

            if (fileRelativePath === "main.tsx") {
                assert(
                    getHash(await readFile()) ===
                        "8fd7ba3c35cf88c902687e7bac408082f069485ba61e4d2cd41f05ffd96d84a6",
                    "KcAccountUi.tsx should be modified"
                );
                return;
            }

            let modifiedSourceCode = (await readFile()).toString("utf8");

            modifiedSourceCode = modifiedSourceCode.replaceAll(
                `"@keycloak/keycloak-ui-shared"`,
                `"${new Array(fileRelativePath.split(pathSep).length).fill("..").join("/") || ".."}/shared/keycloak-ui-shared"`
            );

            if (modifiedSourceCode.includes("environment.resourceUrl")) {
                switch (fileRelativePath) {
                    case pathJoin("root", "Header.tsx"):
                        for (const [search, replace] of [
                            [undefined, `import logoSvgUrl from "../assets/logo.svg";`],
                            [`const brandImage = environment.logo || "logo.svg";`, ""],
                            [`src: joinPath(environment.resourceUrl, brandImage)`, `src: logoSvgUrl,`]
                        ] as const) {
                            const sourceCode_before = modifiedSourceCode;

                            const sourceCode_after: string =
                                search === undefined
                                    ? [replace, modifiedSourceCode].join("\n")
                                    : modifiedSourceCode.replace(search, replace);

                            assert(sourceCode_before !== sourceCode_after);

                            modifiedSourceCode = sourceCode_after;
                        }
                        break;
                    case pathJoin("content", "fetchContent.ts"):
                        assert(
                            getHash(modifiedSourceCode) ===
                                "3382e093d23c6c68e0dd1e7e05d3c306e56813dc360cf4bd4e325f1f4d6b5b41",
                            "fetchContent has changed, make sure to update the code"
                        );

                        modifiedSourceCode = [
                            `import type { CallOptions } from "../api/methods";`,
                            `import type { MenuItem } from "../root/PageNav";`,
                            ``,
                            `export default async function fetchContentJson(`,
                            `  opts: CallOptions,`,
                            `): Promise<MenuItem[]> {`,
                            `  const { content } = await import("../assets/content");`,
                            `  return content;`,
                            `}`
                        ].join("\n");
                        break;
                }

                //assert(!modifiedSourceCode.includes("environment.resourceUrl"), `${fileRelativePath} contains reference to resourceUrl`);

                if (modifiedSourceCode.includes("environment.resourceUrl")) {
                    console.warn(`${fileRelativePath} contains reference to resourceUrl`);
                }
            }

            if (fileRelativePath === "i18n.ts") {
                await writeFile({
                    fileRelativePath: pathJoin("i18n", "index.ts"),
                    modifiedData: Buffer.from(withSpecialComments(`export * from "./i18n";`), "utf8")
                });

                fileRelativePath = pathJoin("i18n", "i18n.ts");

                modifiedSourceCode = modifiedSourceCode.replaceAll(` from "./`, ` from "../`);
            }

            await writeFile({
                fileRelativePath,
                modifiedData: Buffer.from(withSpecialComments(modifiedSourceCode), "utf8")
            });
        }
    });

    const distDirPath = pathJoin(getThisCodebaseRootDirPath(), "dist");

    if (fs.existsSync(distDirPath)) {
        fs.rmSync(distDirPath, { recursive: true });
    }

    child_process.execSync(`npx tsc`, { cwd: getThisCodebaseRootDirPath() });

    const keycloakThemeDirPath = pathJoin(distDirPath, "keycloak-theme");
    const accountDirPath = pathJoin(keycloakThemeDirPath, "account");

    let keycloakAccountUiVersion: string | undefined = undefined;

    transformCodebase({
        srcDirPath: extractedDirPath,
        destDirPath: accountDirPath,
        transformSourceCode: ({ fileRelativePath, sourceCode }) => {
            if (fileRelativePath === "package.json") {
                const version = JSON.parse(sourceCode.toString("utf8")).version as unknown;

                assert(typeof version === "string");

                keycloakAccountUiVersion = version;

                return;
            }

            return { modifiedSourceCode: sourceCode };
        }
    });

    assert(keycloakAccountUiVersion !== undefined);

    transformCodebase({
        srcDirPath: pathJoin(getThisCodebaseRootDirPath(), "keycloak-theme"),
        destDirPath: keycloakThemeDirPath
    });

    {
        const messagesDirBasename = "messages";
        const publicDirBasename = "public";

        const { extractedDirPath } = await downloadAndExtractArchive({
            url: `https://repo1.maven.org/maven2/org/keycloak/keycloak-account-ui/${keycloakVersion}/keycloak-account-ui-${keycloakAccountUiVersion}.jar`,
            cacheDirPath,
            fetchOptions,
            uniqueIdOfOnArchiveFile: "i18n_messages_and_public_assets",
            onArchiveFile: async ({ fileRelativePath, writeFile, readFile }) => {
                i18n_messages: {
                    const dirRelativePath = pathJoin("theme", "keycloak.v3", "account", "messages");

                    if (
                        !isInside({
                            dirPath: dirRelativePath,
                            filePath: fileRelativePath
                        })
                    ) {
                        break i18n_messages;
                    }

                    await writeFile({
                        fileRelativePath: pathJoin(
                            messagesDirBasename,
                            pathRelative(dirRelativePath, fileRelativePath)
                        )
                    });
                }

                public_assets: {
                    const dirRelativePath = pathJoin("theme", "keycloak.v3", "account", "resources");

                    if (
                        !isInside({
                            dirPath: dirRelativePath,
                            filePath: fileRelativePath
                        })
                    ) {
                        break public_assets;
                    }

                    if (
                        isInside({
                            dirPath: pathJoin(dirRelativePath, "assets"),
                            filePath: fileRelativePath
                        })
                    ) {
                        return;
                    }

                    if (
                        isInside({
                            dirPath: pathJoin(dirRelativePath, ".vite"),
                            filePath: fileRelativePath
                        })
                    ) {
                        return;
                    }

                    if (fileRelativePath === pathJoin(dirRelativePath, "robots.txt")) {
                        return;
                    }

                    let modifiedData: undefined | Buffer = undefined;

                    if (fileRelativePath === pathJoin(dirRelativePath, "content.json")) {
                        modifiedData = Buffer.from(
                            withSpecialComments(
                                [
                                    `import type { MenuItem } from "../root/PageNav";`,
                                    ``,
                                    `export const content: MenuItem[] = ${(await readFile()).toString("utf8")};`
                                ].join("\n")
                            ),
                            "utf8"
                        );
                        fileRelativePath = fileRelativePath.replace(/\.json$/, ".ts");
                    }

                    await writeFile({
                        modifiedData,
                        fileRelativePath: pathJoin(
                            publicDirBasename,
                            pathRelative(dirRelativePath, fileRelativePath)
                        )
                    });
                }
            }
        });

        {
            const destDirPath = pathJoin(accountDirPath, "i18n");

            transformCodebase({
                srcDirPath: pathJoin(extractedDirPath, messagesDirBasename),
                destDirPath,
                transformSourceCode: ({ filePath, sourceCode }) => {
                    const basename = pathBasename(filePath);

                    const match = basename.match(/^messages_([^.]+)\.properties$/);

                    assert(match !== null);

                    const locale = match[1];

                    return {
                        modifiedSourceCode: Buffer.from(
                            [
                                `# IMPORTANT: This file contains the base translation. Modifying it directly is not recommended.`,
                                `# To override or add custom messages, create a file named messages_${locale}_override.properties in the same directory.`,
                                `# This file will be automatically loaded and merged with the base translation.`,
                                `# If you're implementing theme variants, you can also create variant-specific \`.properties\` files.`,
                                `# For example let's say you have defined \`themeName: ["vanilla", "chocolate"]\` then you can create the following files:`,
                                `# messages_${locale}_override_vanilla.properties`,
                                `# messages_${locale}_override_chocolate.properties`,
                                "",
                                sourceCode.toString("utf8")
                            ].join("\n"),
                            "utf8"
                        )
                    };
                }
            });
        }

        transformCodebase({
            srcDirPath: pathJoin(extractedDirPath, publicDirBasename),
            destDirPath: pathJoin(accountDirPath, "assets")
        });
    }

    const parsedPackageJson_keycloakAccountUi = await (async () => {
        type ParsedPackageJson = {
            dependencies?: Record<string, string>;
            peerDependencies?: Record<string, string>;
            devDependencies?: Record<string, string>;
        };

        const zParsedPackageJson = (() => {
            type TargetType = ParsedPackageJson;

            const zTargetType = z.object({
                dependencies: z.record(z.string()).optional(),
                peerDependencies: z.record(z.string()).optional(),
                devDependencies: z.record(z.string()).optional()
            });

            type InferredType = z.infer<typeof zTargetType>;

            assert<Equals<ParsedPackageJson, InferredType>>;

            return id<z.ZodType<TargetType>>(zTargetType);
        })();

        assert<Equals<z.TypeOf<typeof zParsedPackageJson>, ParsedPackageJson>>;

        const parsedPackageJson = await fetch(
            `https://unpkg.com/@keycloak/keycloak-account-ui@${keycloakAccountUiVersion}/package.json`,
            fetchOptions
        ).then(response => response.json());

        zParsedPackageJson.parse(parsedPackageJson);

        assert(is<ParsedPackageJson>(parsedPackageJson));

        return parsedPackageJson;
    })();

    fs.writeFileSync(
        pathJoin(distDirPath, "package.json"),
        Buffer.from(
            JSON.stringify(
                {
                    name: parsedPackageJson.name,
                    main: "index.js",
                    types: "index.d.ts",
                    version: parsedPackageJson.version,
                    repository: parsedPackageJson.repository,
                    license: parsedPackageJson.license,
                    author: parsedPackageJson.author,
                    homepage: parsedPackageJson.homepage,
                    keywords: parsedPackageJson.keywords,
                    dependencies: parsedPackageJson.dependencies,
                    peerDependencies: await (async () => {
                        const peerDependencies = Object.fromEntries(
                            Object.entries({
                                ...parsedPackageJson_keycloakAccountUi.dependencies,
                                ...parsedPackageJson_keycloakAccountUi.peerDependencies
                            }).filter(([name]) => {
                                if (name === "react-dom") {
                                    return false;
                                }

                                return true;
                            })
                        );

                        {
                            const name = "@keycloak/keycloak-ui-shared";

                            assert(peerDependencies[name] === keycloakVersion);

                            const name_keycloakify = name.replace("@keycloak", "@keycloakify");

                            const version_keycloakify = (
                                JSON.parse(
                                    child_process
                                        .execSync(`npm show ${name_keycloakify} versions --json`)
                                        .toString("utf8")
                                        .trim()
                                ) as string[]
                            )
                                .reverse()
                                .find(version_keycloakify =>
                                    version_keycloakify.startsWith(
                                        keycloakVersion
                                            .split(".")
                                            .map(n => n.padStart(2, "0"))
                                            .join("")
                                    )
                                );

                            assert(version_keycloakify !== undefined);

                            delete peerDependencies[name];
                            peerDependencies[name_keycloakify] = `~${version_keycloakify}`;
                        }

                        for (const name of Object.keys(peerDependencies)) {
                            const typeName = name.startsWith("@")
                                ? `@types/${name.substring(1).replace("/", "__")}`
                                : `@types/${name}`;

                            const versionRange =
                                parsedPackageJson_keycloakAccountUi.devDependencies?.[typeName];

                            if (versionRange === undefined) {
                                continue;
                            }

                            peerDependencies[typeName] = versionRange;
                        }

                        return peerDependencies;
                    })()
                },
                null,
                2
            ),
            "utf8"
        )
    );

    for (const fileBasename of ["README.md", "LICENSE"] as const) {
        fs.cpSync(
            pathJoin(getThisCodebaseRootDirPath(), fileBasename),
            pathJoin(distDirPath, fileBasename)
        );
    }

    transformCodebase({
        srcDirPath: pathJoin(getThisCodebaseRootDirPath(), "src"),
        destDirPath: pathJoin(distDirPath, "src")
    });

    console.log(
        chalk.green(
            `\n\nPulled @keycloak/keycloak-account-ui@${keycloakAccountUiVersion} from keycloak version ${keycloakVersion}`
        )
    );
})();

function withSpecialComments(sourceCode: string) {
    return ["/* eslint-disable */", "", "// @ts-nocheck", "", sourceCode].join("\n");
}
