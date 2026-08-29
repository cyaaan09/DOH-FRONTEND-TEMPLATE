import { defineConfig, globalIgnores } from 'eslint/config'
import globals from 'globals'
import js from '@eslint/js'
import pluginVue from 'eslint-plugin-vue'
import pluginVitest from '@vitest/eslint-plugin'
import pluginOxlint from 'eslint-plugin-oxlint'
import skipFormatting from 'eslint-config-prettier/flat'

export default defineConfig([
  {
    name: 'app/files-to-lint',
    files: ['**/*.{vue,js,mjs,jsx}'],
  },

  globalIgnores(['**/dist/**', '**/dist-ssr/**', '**/coverage/**']),

  {
    languageOptions: {
      globals: {
        ...globals.browser,
      },
    },
  },

  {
    files: ['scripts/**', '*.config.js'],
    languageOptions: { globals: globals.node },
  },

  js.configs.recommended,
  ...pluginVue.configs['flat/essential'],

  {
    ...pluginVitest.configs.recommended,
    files: ['src/**/__tests__/*'],
  },

  {
    // Route/page and layout components are file-name based and are often single-word.
    name: 'app/pages-and-layouts',
    files: ['src/pages/**/*.vue', 'src/layouts/**/*.vue'],
    rules: {
      'vue/multi-word-component-names': 'off',
    },
  },

  {
    // Design-system components are single-word primitives consumed through a namespaced barrel import
    // (e.g. import { Button, Card, Notice } from '@/design-system'), which is the textbook exemption
    // for this rule. Single-word names are correct here and will scale to ~15 components in this phase.
    name: 'design-system/components',
    files: ['src/design-system/components/**/*.vue'],
    rules: {
      'vue/multi-word-component-names': 'off',
    },
  },

  ...pluginOxlint.buildFromOxlintConfigFile('.oxlintrc.json'),

  skipFormatting,
])
