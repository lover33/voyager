"use strict"

module.exports = {
  root: true,
  extends: ["eslint:recommended", "plugin:vue/recommended"],
  parserOptions: {
    ecmaVersion: 2017,
    sourceType: "module",
    parser: "babel-eslint"
  },
  env: {
    browser: true,
    es6: true,
    node: true
  },
  plugins: ["vue"],
  rules: {
    // allow debugger during development
    "no-debugger": process.env.NODE_ENV === "production" ? 2 : 0,
    "no-undef": "error",
    "no-unused-vars": "error",
    quotes: ["error", "backtick"],
    "no-var": "error",
    "no-multiple-empty-lines": ["error", {"max": 1}],
    "prefer-const": [
      "error",
      {
        destructuring: "all",
        ignoreReadBeforeAssign: false
      }
    ],
    "vue/max-attributes-per-line": [
      "error",
      {
        singleline: 3,
        multiline: {
          max: 1,
          allowFirstLine: false
        }
      }
    ],
    "vue/html-closing-bracket-newline": [
      "error",
      {
        singleline: "never",
        multiline: "always"
      }
    ],
    "vue/multiline-html-element-content-newline": [
      "error",
      {
        ignores: ["pre", "textarea"]
      }
    ],
    "quote-props": ["error", "as-needed", { "unnecessary": true }],
    "object-curly-spacing": ["error", "always"],
    "array-bracket-spacing": ["error", "never"],
    "indent": ["error", 2, { "SwitchCase": 1 }],
    "no-console": "off",
    "brace-style": ["error", "1tbs"],
    "semi": ["error", "never"],
    "no-tabs": ["error"],
    "max-len": ["error", { "code": 80, "ignoreStrings": true, "ignoreComments": true, "ignoreTemplateLiterals": true }],
    "no-trailing-spaces": ["error", { "skipBlankLines": false }]
  }
}
