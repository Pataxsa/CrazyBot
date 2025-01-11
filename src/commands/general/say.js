const Command = require("@base/command");
const { ChatInputCommandInteraction, InteractionContextType, ChannelType, PermissionFlagsBits } = require("discord.js");

class Say extends Command {
    constructor(client) {
        super(client, {
            name: "say",
            description: "Say command.",
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
                option.setName("message").setDescription("The message to send.").setMaxLength(1900).setRequired(true)
            )
            .addChannelOption(option =>
                option
                    .setName("channel")
                    .addChannelTypes(ChannelType.GuildText)
                    .setDescription("The channel where you want to send the message.")
                    .setRequired(false)
            );
    }

    /**
     * Execute the command
     * @param {ChatInputCommandInteraction} interaction
     * @returns {Promise<void>}
     */
    async execute(interaction) {
        const message = interaction.options.getString("message");
        const channel = interaction.options.getChannel("channel") || interaction.channel;

        await channel.send(message);

        interaction.success("general/say:SUCCESS", { message }, { ephemeral: true });
    }
}

module.exports = Say;
