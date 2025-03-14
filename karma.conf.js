process.env.CHROME_BIN = require("puppeteer").executablePath();

module.exports = function (config) {
    config.set({
        browsers: ["ChromeHeadlessNoSandbox"],

        frameworks: ["mocha", "chai"],

        files: ["tests/spec/*.test.js"],

        singleRun: true,

        client: {
            mocha: {
                require: [require.resolve("./dist/js/emojify-browser.min.js")],
            },
        },

        listenAddress: "::",
        customLaunchers: {
            ChromeHeadlessNoSandbox: {
                base: "ChromeHeadless",
                flags: ["--no-sandbox"],
            },
        },
    });
};
