const Event = require("@base/event");
const { Events, Guild, EmbedBuilder, Colors } = require("discord.js");

class GuildCreate extends Event {
    constructor(client) {
        super(client, {
            eventName: Events.GuildCreate
        });
    }

    /**
     * Execute the event
     * @param {Guild} guild
     * @returns {Promise<void>}
     */
    async execute(guild) {
        this.client.sendLog(`🥳 A user added me to **${guild.name}** (${guild.id})`, "success");

        const translate =
            this.client.languages.find((_, lang) => lang === guild.preferredLocale) ||
            this.client.languages.get(this.client.config.default_lang);

        const channel = guild.systemChannel || (await guild.fetchOwner());

        const embed = new EmbedBuilder();
        embed.setTitle(translate("other:ADD_TITLE")).setDescription(translate("other:ADD_DESC")).setColor(Colors.Green);

        channel.send({ embeds: [embed] }).catch(() => {});
    }
}

module.exports = GuildCreate;
