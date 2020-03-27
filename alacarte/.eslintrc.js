module.exports = {
  env: {
    "browser": true,
    "commonjs": true,
    "es6": true,
    "jquery": true
  },
  extends: [
    'airbnb-base',
  ],
  globals: {
    Atomics: 'readonly',
    SharedArrayBuffer: 'readonly',
  },
  parserOptions: {
    ecmaVersion: 2018,
    sourceType: 'module',
  },
  rules: {
      'linebreak-style': ["error", "windows"],
      'no-plusplus': ["error", { "allowForLoopAfterthoughts": true }],
      'no-underscore-dangle': 'off',
      'no-unused-expressions': ['error', { "allowTernary": true }]
  },
};
