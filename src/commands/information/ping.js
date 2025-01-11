const Command = require("@base/command");
const { ChatInputCommandInteraction, InteractionContextType } = require("discord.js");

class Ping extends Command {
    constructor(client) {
        super(client, {
            name: "ping",
            description: "Ping command.",
            dirname: __dirname,
            cooldown: 3000,
            enabled: true,
            contexts: [InteractionContextType.Guild, InteractionContextType.BotDM],
            restricted: false,
            NSFW: false,
            memberPermissions: null,
            botPermissions: null
        });
    }

    /**
     * Execute the command
     * @param {ChatInputCommandInteraction} interaction
     * @returns {Promise<void>}
     */
    async execute(interaction) {
        const reply = await interaction.load("information/ping:LOAD", null, { ephemeral: true, fetchReply: true });

        const botLatency = reply.createdTimestamp - interaction.createdTimestamp;
        const apiLatency = Math.round(this.client.ws.ping) < 0 ? "???" : Math.round(this.client.ws.ping);

        interaction.success("information/ping:REPLY", { botLatency, apiLatency }, { edit: true, ephemeral: true });
    }
}

module.exports = Ping;
