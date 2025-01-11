const Model = require("@base/model");

class GuildModel extends Model {
    constructor(db) {
        super(db, "guilds");
    }

    /**
     * Find or create a guild in database
     * @param {string} id
     * @returns {Promise<{id: string, temp_channels: Array<string>}>}
     */
    async findOrCreate(id) {
        let guildData = await this.read(id);
        if (!guildData) guildData = await this.create(id);

        return guildData;
    }
}

module.exports = GuildModel;
