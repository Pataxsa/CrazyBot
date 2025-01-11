const Command = require("@base/command");
const {
    ChatInputCommandInteraction,
    InteractionContextType,
    PermissionFlagsBits,
    EmbedBuilder
} = require("discord.js");
const { Mention } = require("@utils/functions");

class Nuke extends Command {
    constructor(client) {
        super(client, {
            name: "nuke",
            description: "Clear the current channel.",
            dirname: __dirname,
            cooldown: 3000,
            enabled: true,
            contexts: [InteractionContextType.Guild],
            restricted: false,
            NSFW: false,
            memberPermissions: PermissionFlagsBits.ManageChannels,
            botPermissions: [PermissionFlagsBits.Administrator]
        });
    }

    /**
     * Execute the command
     * @param {ChatInputCommandInteraction} interaction
     * @returns {Promise<void>}
     */
    async execute(interaction) {
        const embedConfig = this.client.config.embed;
        const userId = interaction.user.id;
        const { channel } = interaction;

        let newChannel;
        try {
            newChannel = await channel.clone();
        } catch {
            interaction.error("moderation/nuke:NOT_SUPPORTED");
            return;
        }

        channel.delete().catch(() => {});

        const embed = new EmbedBuilder()
            .setColor(embedConfig.color.success)
            .setDescription(interaction.t("moderation/nuke:SUCCESS", { user: Mention(userId, "user") }))
            .setImage("https://media1.tenor.com/m/niC6wk8TvlkAAAAC/kozhi-nuclear-bomb.gif");

        const msg = await newChannel.send({ embeds: [embed] });
        setTimeout(() => msg.delete().catch(() => {}), 5000);
    }
}

module.exports = Nuke;
