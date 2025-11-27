import { createDefaultPreset } from "ts-jest";

const tsJestTransformCfg = createDefaultPreset().transform;

/** @type {import("jest").Config} **/
export default {
  testEnvironment: "node",
  transform: {
    ...tsJestTransformCfg,
  },
  moduleNameMapper: {
    "^@popup/(.*)$": "<rootDir>/src/popup/$1",
    "^@shared/(.*)$": "<rootDir>/src/shared/$1",
    "^@background/(.*)$": "<rootDir>/src/background/$1",
  },
};