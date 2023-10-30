module.exports = {
  extends: ["next", "turbo", "prettier"],
  rules: {
    "@next/next/no-html-link-for-pages": "off",
    "react/jsx-key": "off",
    "react/no-unescaped-entities": "off",
    "@next/next/no-page-custom-font": "off",
  },
};
