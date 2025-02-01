import globals from "globals";
import pluginJs from "@eslint/js";
import eslintPluginPrettierRecommended from "eslint-plugin-prettier/recommended";
import jsdoc from "eslint-plugin-jsdoc";

export default [
    { files: ["**/*.js"], languageOptions: { sourceType: "commonjs" } },
    { languageOptions: { globals: globals.node } },
    pluginJs.configs.recommended,
    jsdoc.configs["flat/recommended"],
    eslintPluginPrettierRecommended,
    {
        rules: {
            "no-unused-vars": [
                "error",
                {
                    vars: "all",
                    args: "after-used",
                    ignoreRestSiblings: false,
                    caughtErrorsIgnorePattern: "^_$",
                    destructuredArrayIgnorePattern: "^_$",
                    argsIgnorePattern: "^_$",
                    varsIgnorePattern: "^_$"
                }
            ],
            "no-var": "error",
            eqeqeq: "error",
            "no-duplicate-imports": "error",
            "one-var": [
                "error",
                {
                    let: "consecutive",
                    const: "never"
                }
            ],
            "no-useless-assignment": "error",
            "prefer-const": "error",
            "capitalized-comments": "warn",
            "object-shorthand": "error",
            "no-implicit-coercion": "error",
            "no-const-assign": "error",
            "getter-return": "error",
            "no-unreachable-loop": [
                "error",
                {
                    ignore: ["WhileStatement", "DoWhileStatement"]
                }
            ],
            "max-params": [
                "error",
                {
                    max: 5
                }
            ],
            "max-lines": [
                "error",
                {
                    max: 350
                }
            ],
            "max-depth": [
                "error",
                {
                    max: 4
                }
            ],
            "no-nested-ternary": ["error"],
            "prettier/prettier": [
                "error",
                {
                    endOfLine: "crlf"
                }
            ],
            "jsdoc/require-jsdoc": [
                "warn",
                {
                    checkConstructors: false,
                    require: { MethodDefinition: true, FunctionExpression: true }
                }
            ],
            "jsdoc/require-description": "error",
            "jsdoc/require-param": [
                "error",
                {
                    checkDestructuredRoots: false
                }
            ],
            "jsdoc/require-returns": [
                "error",
                {
                    forceRequireReturn: true
                }
            ],
            "jsdoc/require-param-description": "off",
            "jsdoc/require-returns-description": "off",
            "jsdoc/no-undefined-types": [
                "error",
                {
                    definedTypes: ["NodeJS", "AsyncGenerator"]
                }
            ],
            "jsdoc/no-defaults": "off"
        }
    },
    {
        files: ["src/base/*.js"],
        rules: {
            "no-unused-vars": "off"
        }
    },
    {
        files: ["src/commands/**/*.js"],
        rules: {
            "no-console": "error"
        }
    }
];
