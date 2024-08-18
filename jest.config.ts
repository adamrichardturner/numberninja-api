import type { Config } from "jest";

const config: Config = {
    preset: "ts-jest",
    testEnvironment: "node",
    testMatch: ["**/src/__tests__/**/*.test.ts"],
    transform: {
        "^.+\\.ts$": [
            "ts-jest",
            {
                diagnostics: false,
            },
        ],
    },
    moduleFileExtensions: ["ts", "js", "json", "node"],
};

export default config;
