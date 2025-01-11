const Command = require("@base/command");
const { ChatInputCommandInteraction, InteractionContextType } = require("discord.js");

class Support extends Command {
    constructor(client) {
        super(client, {
            name: "support",
            description: "Get the invitation link for support.",
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
        const link = this.client.config.support.link;

        interaction.replyT("general/support:INVITE", { link });
    }
}

module.exports = Support;
