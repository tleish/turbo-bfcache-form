module.exports = {
  root: true,
  env: {
    browser: true,
    node: true,
    es6: true,
  },
  extends: ['plugin:prettier/recommended', 'eslint:recommended', 'prettier'],
  parser: 'babel-eslint',
  parserOptions: {
    ecmaVersion: 7,
    // sourceType: 'module',
    // ecmaFeatures: {
    //   jsx: true,
    // },
  },
  rules: {
    'prettier/prettier': ['error', { singleQuote: true }],
    'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
  },
  ignorePatterns: [
    'app/javascript/lib/@stimulus/**/*.js',
    'app/javascript/lib/elements/**/*.js',
    'app/javascript/lib/stimulus/**/*.js',
    'app/javascript/lib/turbo/**/*.js',
  ],
  overrides: [
    {
      files: ['**/*.spec.js'],
      env: {
        jest: true,
      },
    },
  ],
};
