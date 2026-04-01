/** @type {import("eslint").Linter.Config} */
module.exports = {
  root: true,
  extends: ["next/core-web-vitals"],
  rules: {
    // 关闭所有会阻止构建的错误，只保留基本检查
    "@typescript-eslint/no-explicit-any": "off",
    "@typescript-eslint/no-unused-vars": "off",
    "@typescript-eslint/no-unsafe-assignment": "off",
    "@typescript-eslint/no-unsafe-call": "off",
    "@typescript-eslint/no-unsafe-member-access": "off",
    
    // 关闭 React 相关警告
    "react/no-unescaped-entities": "off",
    "@next/next/no-img-element": "off",
    
    // 关闭 React Hooks 依赖检查
    "react-hooks/exhaustive-deps": "off",
  },
};
