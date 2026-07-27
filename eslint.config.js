// For more info, see https://github.com/storybookjs/eslint-plugin-storybook#configuration-flat-config-format
import storybook from "eslint-plugin-storybook";

import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([globalIgnores(['dist', 'storybook-static']), {
  files: ['**/*.{ts,tsx}'],
  extends: [
    js.configs.recommended,
    tseslint.configs.recommended,
    reactHooks.configs.flat.recommended,
    reactRefresh.configs.vite,
  ],
  languageOptions: {
    globals: globals.browser,
  },
}, {
  // UI components intentionally export variant helpers (e.g. `buttonVariants`)
  // alongside the component, which is the shadcn/ui convention.
  files: ['src/components/ui/**/*.{ts,tsx}'],
  rules: {
    'react-refresh/only-export-components': 'off',
  },
}, {
  // Shift-left RTL guard: physical direction utilities don't mirror in RTL.
  // Flag them at build time (warn) so the CREATE task catches them before the
  // AUDIT task has to. Use logical utilities instead: text-start/text-end,
  // ms-/me-, ps-/pe-, start-/end-. See rules/RTL_I18N_RULES.md.
  files: ['src/components/ui/**/*.tsx'],
  ignores: ['src/components/ui/**/*.stories.tsx'],
  rules: {
    'no-restricted-syntax': ['warn',
      {
        selector: "Literal[value=/\\b(?:text-(?:left|right)|[mp][lr]-|(?:left|right)-[\\d.[])/]",
        message: 'Physical direction utility — use a logical one (text-start/text-end, ms-/me-, ps-/pe-, start-/end-) so RTL mirrors correctly (RTL_I18N_RULES).',
      },
      {
        selector: "TemplateElement[value.raw=/\\b(?:text-(?:left|right)|[mp][lr]-|(?:left|right)-[\\d.[])/]",
        message: 'Physical direction utility — use a logical one (text-start/text-end, ms-/me-, ps-/pe-, start-/end-) so RTL mirrors correctly (RTL_I18N_RULES).',
      },
    ],
  },
}, ...storybook.configs["flat/recommended"]])
