const Command = require("@base/command");
const { ChatInputCommandInteraction, InteractionContextType, PermissionFlagsBits } = require("discord.js");
const { Mention } = require("@utils/functions");

class Clear extends Command {
    constructor(client) {
        super(client, {
            name: "clear",
            description: "Clear some messages.",
            dirname: __dirname,
            cooldown: 3000,
            enabled: true,
            contexts: [InteractionContextType.Guild],
            restricted: false,
            NSFW: false,
            memberPermissions: PermissionFlagsBits.ManageMessages,
            botPermissions: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.ManageMessages]
        });

        this.config.data.addIntegerOption(option =>
            option
                .setName("messages")
                .setDescription("Messages to delete.")
                .setMinValue(0)
                .setMaxValue(100)
                .setRequired(true)
        );
    }

    /**
     * Execute the command
     * @param {ChatInputCommandInteraction} interaction
     * @returns {Promise<void>}
     */
    async execute(interaction) {
        const message_num = interaction.options.getInteger("messages");

        const reply = await interaction.load(
            "moderation/clear:DELETION",
            { count: message_num },
            {
                fetchReply: true
            }
        );

        const messages = (
            await interaction.channel.messages.fetch({
                limit: Math.min(message_num + 1, 100)
            })
        ).filter(msg => !msg.pinned && msg.id !== reply.id);

        const deleted = await interaction.channel.bulkDelete(messages, true).catch(() => {
            return { size: -1 };
        });

        interaction
            .success(
                "moderation/clear:SUCCESS",
                { user: Mention(interaction.user.id, "user"), count: deleted.size },
                { edit: true }
            )
            .then(() => {
                setTimeout(() => interaction.deleteReply().catch(() => {}), 5000);
            });
    }
}

module.exports = Clear;
