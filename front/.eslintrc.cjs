module.exports = {
  root: true,
  env: { browser: true, es2020: true },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react-hooks/recommended',
    'plugin:prettier/recommended',
  ],
  ignorePatterns: ['dist', '.eslintrc.cjs'],
  parser: '@typescript-eslint/parser',
  plugins: ['react-refresh'],
  rules: {
    'react-refresh/only-export-components': [
      'warn',
      { allowConstantExport: true },
    ],
    'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
    'react/react-in-jsx-scope': 'off',
    'react/no-unescaped-entities': 'off',
    'prettier/prettier': ['error', { endOfLine: 'auto' }],
    'prettier/prettier': 'off',
    'no-unused-vars': 'off',
    '@typescript-eslint/no-unused-vars': 'off', // Turn off TypeScript-specific no-unused-vars
    '@typescript-eslint/no-empty-interface': 'off',
    'react-refresh/only-export-components': 'off',
    'react-hooks/exhaustive-deps': 'off',
    'react-hooks/rules-of-hooks': 'off',
    '@typescript-eslint/ban-ts-comment': 'off',
  },
}