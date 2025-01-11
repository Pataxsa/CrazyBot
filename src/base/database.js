const { PrismaClient } = require("@prisma/client");
const config = require("@root/config");
const { createClient } = require("redis");
const GuildModel = require("@models/guildModel");
const UserModel = require("@models/userModel");
const { greenBright, blue, red, reset } = require("chalk");

class Database extends PrismaClient {
    constructor() {
        super();

        this.cache = null;
        this.models = { guilds: new GuildModel(this), users: new UserModel(this) };
    }

    /**
     * Connect to database and redis server
     * @returns {Promise<void>}
     */
    async connect() {
        this.cache = await createClient({ url: config.rediscache })
            .connect()
            .catch(error => {
                console.log(red("❌ Redis error:"), error);
                process.exit(1);
            });
        console.log(greenBright("📦 Connected to redis server."));

        await this.$connect().catch(error => {
            console.log(red("❌ Database error:"), error);
            process.exit(1);
        });
        console.log(blue("💾 Connected to postgresql database."));
    }
}

module.exports = Database;
