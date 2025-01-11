const Command = require("@base/command");
const {
    ChatInputCommandInteraction,
    InteractionContextType,
    ChannelType,
    EmbedBuilder,
    PermissionFlagsBits
} = require("discord.js");
const { Mention } = require("@utils/functions");

class Lock extends Command {
    constructor(client) {
        super(client, {
            name: "lock",
            description: "Lock/unlock a channel.",
            dirname: __dirname,
            cooldown: 3000,
            enabled: true,
            contexts: [InteractionContextType.Guild],
            restricted: false,
            NSFW: false,
            memberPermissions: PermissionFlagsBits.ManageChannels,
            botPermissions: [PermissionFlagsBits.ManageChannels, PermissionFlagsBits.ManageRoles]
        });

        this.config.data
            .addBooleanOption(option =>
                option.setName("lock").setDescription("Lock or unlock channel.").setRequired(true)
            )
            .addChannelOption(option =>
                option
                    .setName("channel")
                    .setDescription("Channel to lock/unlock.")
                    .addChannelTypes(ChannelType.GuildText)
                    .setRequired(false)
            )
            .addStringOption(option =>
                option
                    .setName("reason")
                    .setDescription("Set a reason to lock/unlock the channel.")
                    .setMaxLength(1900)
                    .setRequired(false)
            );
    }

    /**
     * Execute the command
     * @param {ChatInputCommandInteraction} interaction
     * @returns {Promise<void>}
     */
    async execute(interaction) {
        const embedConfig = this.client.config.embed;
        const isLocked = interaction.options.getBoolean("lock");
        const channel = interaction.options.getChannel("channel") || interaction.channel;
        const reason = interaction.options.getString("reason");
        const lock = isLocked ? false : null;

        channel.permissionOverwrites.edit(
            interaction.guildId,
            {
                SendMessages: lock,
                SendMessagesInThreads: lock,
                CreatePublicThreads: lock,
                CreatePrivateThreads: lock
            },
            { reason }
        );

        const fields = [{ name: interaction.t("moderation/lock:CHANNEL"), value: Mention(channel.id, "channel") }];

        if (reason) {
            fields.push({ name: interaction.t("moderation/lock:REASON"), value: reason });
        }

        const embed = new EmbedBuilder()
            .setTitle(isLocked ? interaction.t("moderation/lock:LOCKED") : interaction.t("moderation/lock:UNLOCKED"))
            .setColor(isLocked ? embedConfig.color.error : embedConfig.color.success)
            .setFields(fields);

        interaction.reply({
            embeds: [embed]
        });
    }
}

module.exports = Lock;
