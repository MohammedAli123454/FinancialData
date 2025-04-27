// eslint.config.mjs

// Change this:
import nextEslintConfig from "next/eslint";

// To this:
import nextEslintConfig from "eslint-config-next";

const eslintConfig = [
  // Spread in the Next.js shareable config
  nextEslintConfig,
  {
    // Your custom overrides go here
    rules: {
      // Example:
      // "@typescript-eslint/no-explicit-any": "warn",
    },
  },
];

export default eslintConfig;
