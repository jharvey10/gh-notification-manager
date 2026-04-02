import js from '@eslint/js';
import globals from 'globals';

export default [
  js.configs.recommended,

  { ignores: ['dist/**', 'release/**'] },

  {
    files: ['**/*.{js,jsx,mjs}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.browser,
        ...globals.node,
      },
      parserOptions: {
        ecmaFeatures: { jsx: true },
      },
    },
    rules: {
      curly: 'error',
      eqeqeq: ['error', 'always'],
      'no-var': 'error',
      'prefer-const': 'error',
      'no-self-compare': 'error',
      'no-template-curly-in-string': 'warn',
      'no-throw-literal': 'error',
      'no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
      'no-constant-binary-expression': 'error',
      'no-constructor-return': 'error',
      'no-duplicate-imports': 'warn',
      'no-promise-executor-return': 'error',
      'no-unmodified-loop-condition': 'warn',
      'no-unreachable-loop': 'warn',
      'no-use-before-define': ['error', { functions: false }],
    },
  },
];
