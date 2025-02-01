const config = require("@root/config");
const { createClient } = require("redis");
const mongoose = require("mongoose");
const { greenBright, blue, red } = require("chalk");

class Database {
    static cache = createClient({ url: config.redis });

    /**
     * Connect to database and redis server
     * @returns {Promise<void>}
     */
    static async connect() {
        this.cache.connect().catch(error => {
            console.log(red("❌ Redis error:"), error);
            process.exit(1);
        });
        console.log(greenBright("📦 Connected to redis server."));

        await mongoose.connect(config.mongodb).catch(error => {
            console.log(red("❌ Database error:"), error);
            process.exit(1);
        });
        console.log(blue("💾 Connected to mongodb database."));
    }
}

module.exports = Database;
