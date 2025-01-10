module.exports = {
  preset: "ts-jest",
  testEnvironment: "jsdom",
  setupFiles: ["<rootDir>/jest.setup.js"],
  setupFilesAfterEnv: ["@testing-library/jest-dom/extend-expect"],
  transform: {
    "^.+\\.tsx?$": [
      "ts-jest",
      {
        tsconfig: "tsconfig.json",
      },
    ],
  },
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
  },
  transformIgnorePatterns: [
    "/node_modules/(?!(@radix-ui|@testing-library|lucide-react)/)",
  ],
  testPathIgnorePatterns: ["/testUtils\\.ts$"],
  // Remove or correct the testEnvironmentOptions
  // testEnvironmentOptions: {
  //   customExportConditions: [""],
  // },
};
