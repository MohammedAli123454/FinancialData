import nextEslintConfig from "next/eslint";

const eslintConfig = [
  ...nextEslintConfig,
  {
    // Optional: Add custom rules here
    rules: {
      // Example: "@typescript-eslint/no-explicit-any": "warn"
    },
  },
];

export default eslintConfig;
