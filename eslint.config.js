const js =  require("@eslint/js");
const globals = require("globals");;
const defineConfig = require("eslint/config").defineConfig;
const dotenv = require("dotenv");

dotenv.config();

const isProd = process.env.NODE_ENV === "production";

module.exports = defineConfig([
  {
    files: ["**/*.js"],
    ignores: ["node_modules/**"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "commonjs",
      globals: globals.node,
    },
    ...js.configs.recommended,
    rules: {
      "no-console": isProd ? ["error", { allow: ["error"] }] : ["warn", { allow: ["error"] }]
    },
    overrides: [
    {
      "files": ["tests/*"],
      rules: {
        "no-console": "off"
      }
    }
  ]
  },
]);