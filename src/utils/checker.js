const fs = require("fs");

class Checker {
    /**
     * Check if the config is valid
     * @param {import("@root/config")} config
     * @returns {void}
     */
    static checkConfig(config) {
        if (!/^postgres(?:ql)?:\/\//.test(config.postgresql)) throw Error("Postgresql link is not valid");
        if (!/^rediss?:\/\//.test(config.rediscache)) throw Error("Redis link is not valid");

        if (!config.token) throw Error("Bot token is not valid");

        for (const key in config.apis) {
            if (!config.apis[key]) throw Error(`the api key "${key}" is not defined`);
        }
    }

    /**
     * Check if the path is a directory
     * @param {string} path
     * @returns {boolean}
     */
    static IsDirectory(path) {
        const file = fs.lstatSync(path);
        return file.isDirectory();
    }

    /**
     * Check if the path is a file
     * @param {string} path
     * @returns {boolean}
     */
    static IsFile(path) {
        const file = fs.lstatSync(path);
        return file.isFile();
    }
}

module.exports = Checker;
