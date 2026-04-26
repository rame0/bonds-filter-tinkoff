import { includeIgnoreFile } from "@eslint/compat";
import skipFormatting from "@vue/eslint-config-prettier/skip-formatting";
import { defineConfigWithVueTs, vueTsConfigs } from "@vue/eslint-config-typescript";
import pluginVue from "eslint-plugin-vue";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfigWithVueTs(
  includeIgnoreFile(path.join(__dirname, ".gitignore"), "Imported .gitignore patterns"),
  pluginVue.configs["flat/essential"],
  vueTsConfigs.recommended,
  {
    languageOptions: {
      parserOptions: {
        ecmaVersion: "latest",
      },
    },
    rules: {
      verba: "off",
      "no-fallthrough": "off",
    },
  },
  skipFormatting,
);
