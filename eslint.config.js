import { defineConfig, globalIgnores } from 'eslint/config'
import globals from 'globals'
import js from '@eslint/js'
import pluginVue from 'eslint-plugin-vue'
import pluginVitest from '@vitest/eslint-plugin'
import pluginOxlint from 'eslint-plugin-oxlint'
import pluginPlaywright from 'eslint-plugin-playwright'
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
    // e2e/** already matches the top-level files-to-lint glob above; this
    // block layers one Playwright-aware rule on top rather than widening what
    // gets linted. An un-awaited `expect(locator).toHaveCount(...)` resolves
    // to a floating promise and passes vacuously -- the exact failure class
    // this e2e suite exists to catch -- so it is an error, not a warning.
    name: 'e2e/playwright',
    files: ['e2e/**'],
    plugins: { playwright: pluginPlaywright },
    rules: {
      'playwright/missing-playwright-await': 'error',
    },
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
