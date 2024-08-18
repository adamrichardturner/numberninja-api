module.exports = {
    preset: "ts-jest",
    testEnvironment: "node",
    testMatch: ["**/src/__tests__/**/*.test.ts"],
    transform: {
        "^.+\\.ts$": "ts-jest",
    },
    moduleFileExtensions: ["ts", "js", "json", "node"],
    globals: {
        "ts-jest": {
            diagnostics: false,
        },
    },
};
