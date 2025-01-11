const Command = require("@base/command");
const {
    ChatInputCommandInteraction,
    InteractionContextType,
    EmbedBuilder,
    PermissionFlagsBits,
    ChannelType
} = require("discord.js");

class Announce extends Command {
    constructor(client) {
        super(client, {
            name: "announce",
            description: "Makes an announcement.",
            dirname: __dirname,
            cooldown: 3000,
            enabled: true,
            contexts: [InteractionContextType.Guild],
            restricted: false,
            NSFW: false,
            memberPermissions: PermissionFlagsBits.ManageMessages | PermissionFlagsBits.ManageChannels,
            botPermissions: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages]
        });

        this.config.data
            .addStringOption(option =>
                option.setName("title").setDescription("The title of the announce.").setMaxLength(100).setRequired(true)
            )
            .addStringOption(option =>
                option
                    .setName("message")
                    .setDescription("The message of the announce.")
                    .setMaxLength(1900)
                    .setRequired(true)
            )
            .addChannelOption(option =>
                option
                    .setName("channel")
                    .addChannelTypes(ChannelType.GuildText)
                    .setDescription("The channel where you want to send the announce.")
                    .setRequired(false)
            );
    }

    /**
     * Execute the command
     * @param {ChatInputCommandInteraction} interaction
     * @returns {Promise<void>}
     */
    async execute(interaction) {
        const title = interaction.options.getString("title");
        const message = interaction.options.getString("message");
        const channel = interaction.options.getChannel("channel") || interaction.channel;

        const embed = new EmbedBuilder()
            .setTitle(title)
            .setDescription(message)
            .setFooter({
                text: interaction.t("general/announce:EMBED_FOOTER", {
                    user: interaction.user.username
                })
            });

        await channel.send({
            embeds: [embed]
        });

        interaction.success("general/announce:SUCCESS", null, { ephemeral: true });
    }
}

module.exports = Announce;
