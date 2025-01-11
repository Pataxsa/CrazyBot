const Event = require("@base/event");
const { Events, Guild } = require("discord.js");

class GuildCreate extends Event {
    constructor(client) {
        super(client, {
            eventName: Events.GuildDelete
        });
    }

    /**
     * Execute the event
     * @param {Guild} guild
     * @returns {Promise<void>}
     */
    async execute(guild) {
        this.client.sendLog(`😢 A user removed me from **${guild.name}** (${guild.id})`, "error");
    }
}

module.exports = GuildCreate;
