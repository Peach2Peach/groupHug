module.exports = {
  env: {
    browser: false,
    node: true,
    mocha: true,
    es2021: true,
  },
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "prettier",
  ],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaVersion: 12,
    sourceType: "module",
    project: "./tsconfig.json",
  },
  plugins: ["@typescript-eslint", "prettier"],
  ignorePatterns: [
    "regtest-server/**/*.js",
    "dist/**/*",
    "nyc.config.js",
    "coverage/**/*",
  ],
  rules: {
    "accessor-pairs": "error",
    "array-bracket-newline": "off",
    "array-callback-return": "error",
    "array-element-newline": "off",
    "arrow-body-style": "error",
    "arrow-parens": "off",
    "block-scoped-var": "error",
    "capitalized-comments": "off",
    "class-methods-use-this": "error",
    complexity: "error",
    "consistent-return": "off",
    "consistent-this": "error",
    curly: "off",
    "default-case": "error",
    "default-case-last": "error",
    "default-param-last": "error",
    "dot-notation": [
      "error",
      {
        allowKeywords: true,
      },
    ],
    eqeqeq: "error",
    "func-name-matching": "error",
    "func-names": "error",
    "function-paren-newline": "off",
    "grouped-accessor-pairs": "error",
    "guard-for-in": "error",
    "id-denylist": "error",
    "id-length": "off",
    "id-match": "error",
    "implicit-arrow-linebreak": "off",
    "init-declarations": "off",
    "line-comment-position": "off",
    "lines-between-class-members": "off",
    "max-classes-per-file": "error",
    "max-depth": "error",
    "max-nested-callbacks": "error",
    "max-params": ["error", 4],
    "multiline-comment-style": "off",
    "multiline-ternary": "off",
    "no-alert": "error",
    "no-array-constructor": "error",
    "no-sparse-arrays": "off",
    "no-await-in-loop": "error",
    "no-bitwise": "error",
    "no-caller": "error",
    "no-confusing-arrow": "off",
    "no-console": "error",
    "no-constructor-return": "error",
    "no-continue": "off",
    "no-div-regex": "error",
    "no-duplicate-imports": "error",
    "no-else-return": "error",
    "no-empty-function": "error",
    "no-eq-null": "error",
    "no-eval": "error",
    "no-extend-native": "error",
    "no-extra-bind": "error",
    "no-extra-label": "error",
    "no-extra-parens": "off",
    "no-implicit-coercion": "off",
    "no-implicit-globals": "error",
    "no-implied-eval": "error",
    "no-inline-comments": "off",
    "no-invalid-this": "error",
    "no-iterator": "error",
    "no-label-var": "error",
    "no-labels": "error",
    "no-lone-blocks": "error",
    "no-lonely-if": "error",
    "no-loop-func": "error",
    "no-loss-of-precision": "error",
    "no-magic-numbers": [
      "warn",
      { ignoreArrayIndexes: true, ignore: [-1, 0, 1, 2, 100, 200, 201, 422] },
    ],
    "no-mixed-operators": "off",
    "no-multi-assign": "error",
    "no-multi-str": "error",
    "no-negated-condition": "off",
    "no-nested-ternary": "off",
    "no-new": "error",
    "no-new-func": "error",
    "no-new-object": "error",
    "no-new-wrappers": "error",
    "no-nonoctal-decimal-escape": "error",
    "no-octal-escape": "error",
    "no-param-reassign": "error",
    "no-plusplus": "off",
    "no-promise-executor-return": "off",
    "no-proto": "error",
    "no-restricted-exports": "error",
    "no-restricted-globals": "error",
    "no-restricted-imports": "error",
    "no-restricted-properties": "error",
    "no-restricted-syntax": "error",
    "no-return-assign": "off",
    "no-return-await": "warn",
    "no-script-url": "error",
    "no-self-compare": "error",
    "no-sequences": "error",
    "no-shadow": "error",
    "no-template-curly-in-string": "error",
    "no-ternary": "off",
    "no-throw-literal": "error",
    "no-undef-init": "error",
    "no-undefined": "off",
    "no-underscore-dangle": "error",
    "no-unmodified-loop-condition": "error",
    "no-unneeded-ternary": "error",
    "no-unreachable-loop": "error",
    "no-unsafe-optional-chaining": "error",
    "no-unused-expressions": "error",
    "no-unused-vars": "off",
    "no-undef": "off",
    "no-use-before-define": ["error", { functions: false }],
    "no-useless-backreference": "error",
    "no-useless-call": "error",
    "no-useless-computed-key": "error",
    "no-useless-concat": "error",
    "no-useless-constructor": "error",
    "no-useless-rename": "error",
    "no-useless-return": "error",
    "no-var": "error",
    "no-void": ["error", { allowAsStatement: true }],
    "no-warning-comments": [
      "error",
      { terms: ["todo", "fixme"], location: "anywhere" },
    ],
    "object-property-newline": "off",
    "object-shorthand": "error",
    "one-var": "off",
    "operator-assignment": "error",
    "padded-blocks": "off",
    "padding-line-between-statements": "error",
    "prefer-arrow-callback": "error",
    "prefer-const": "error",
    "prefer-destructuring": "error",
    "prefer-exponentiation-operator": "error",
    "prefer-named-capture-group": "off",
    "prefer-numeric-literals": "error",
    "prefer-object-spread": "error",
    "prefer-promise-reject-errors": "error",
    "prefer-regex-literals": "error",
    "prefer-rest-params": "error",
    "prefer-spread": "error",
    "prefer-template": "off",
    "quote-props": "off",
    radix: "error",
    "require-atomic-updates": "error",
    "require-await": "error",
    "require-unicode-regexp": "error",
    "sort-keys": "off",
    "sort-vars": "error",
    "spaced-comment": ["error", "always"],
    strict: "error",
    "symbol-description": "error",
    "vars-on-top": "error",
    "wrap-regex": "off",
    yoda: "error",
    "@typescript-eslint/no-unused-vars": [
      "error",
      {
        argsIgnorePattern: "^_",
        varsIgnorePattern: "^_",
        destructuredArrayIgnorePattern: "^_",
      },
    ],
    "@typescript-eslint/no-non-null-assertion": "warn",
    "@typescript-eslint/ban-ts-comment": "warn",
    "@typescript-eslint/no-var-requires": "warn",
    "@typescript-eslint/no-floating-promises": "error",
    "@typescript-eslint/await-thenable": "error",
  },
  overrides: [
    {
      files: ["**/*.spec.ts", "test/**/*.ts", "**/*.cjs"],
      rules: {
        "no-magic-numbers": "off",
        "max-len": "off",
        "max-lines-per-function": ["error", 240],
        "max-statements": ["error", 30],
        "no-unused-expressions": "off",
      },
    },
  ],
};
