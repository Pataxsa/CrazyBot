const Command = require("@base/command");
const { parseTime, Mention } = require("@utils/functions");
const {
    ChatInputCommandInteraction,
    InteractionContextType,
    PermissionFlagsBits,
    EmbedBuilder,
    ChannelType
} = require("discord.js");

class Remind extends Command {
    constructor(client) {
        super(client, {
            name: "remind",
            description: "Send a remind for a event.",
            dirname: __dirname,
            cooldown: 3000,
            enabled: true,
            contexts: [InteractionContextType.Guild, InteractionContextType.BotDM],
            restricted: false,
            NSFW: false,
            memberPermissions: PermissionFlagsBits.ManageChannels | PermissionFlagsBits.MentionEveryone,
            botPermissions: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages]
        });

        this.config.data
            .addSubcommand(options =>
                options
                    .setName("add")
                    .setDescription("Add a reminder.")
                    .addStringOption(option =>
                        option
                            .setName("time")
                            .setDescription("Format : xd xh xm or MM/DD/YYYY HH:MM:SS")
                            .setRequired(true)
                    )
                    .addStringOption(option =>
                        option
                            .setName("message")
                            .setDescription("The message to send.")
                            .setMaxLength(1800)
                            .setRequired(true)
                    )
                    .addStringOption(option =>
                        option.setName("name").setDescription("The reminder name.").setMaxLength(50).setRequired(true)
                    )
                    .addChannelOption(option =>
                        option
                            .setName("channel")
                            .setDescription("The channel to send.")
                            .addChannelTypes(ChannelType.GuildText)
                            .setRequired(false)
                    )
            )
            .addSubcommand(options =>
                options
                    .setName("remove")
                    .setDescription("Remove a reminder.")
                    .addStringOption(option =>
                        option
                            .setName("name")
                            .setDescription("Name of the reminder to remove.")
                            .setMaxLength(50)
                            .setRequired(true)
                    )
            )
            .addSubcommand(options => options.setName("list").setDescription("Get the list of reminders."));
    }

    /**
     * Execute the command
     * @param {ChatInputCommandInteraction} interaction
     * @param {Command} _
     * @param {{user: {id: string, reminds: Array<*>}}} data
     * @returns {Promise<void>}
     */
    async execute(interaction, _, data) {
        const command = interaction.options.getSubcommand();
        const name = interaction.options.getString("name");

        switch (command) {
            case "add":
                this.#add(interaction, name, data.user);
                break;
            case "remove":
                this.#remove(interaction, name, data.user);
                break;
            default:
                this.#list(interaction, data.user);
        }
    }

    /**
     * Add a reminder
     * @param {ChatInputCommandInteraction} interaction
     * @param {string} name
     * @param {{id: string, reminders: Array<*>}} userData
     * @returns {Promise<void>}
     */
    async #add(interaction, name, userData) {
        const time = interaction.options.getString("time");
        const message = interaction.options.getString("message");
        const duration = parseTime(time);
        const endTimestamp = Math.round(Date.now() + duration);
        const inGuild = interaction.inGuild();
        const channelId =
            interaction.options.getChannel("channel")?.id || (inGuild ? interaction.channel.id : interaction.user.id);

        if (userData.reminders.length >= 20) {
            interaction.error("utility/remind:TOO_MANY", { reminders: userData.reminders.length }, { ephemeral: true });
            return;
        }

        if (duration < 300_000) {
            interaction.error("utility/remind:TOO_SHORT", null, { ephemeral: true });
            return;
        }

        if (userData.reminders.some(reminder => reminder.name === name)) {
            interaction.error("utility/remind:EXISTS", { name }, { ephemeral: true });
            return;
        }

        userData.reminders.push({ name, message, channelId, inGuild, endTimestamp });
        await this.client.db.users.update(userData.id, userData);

        interaction.success(
            "utility/remind:RECORDED",
            { message, timestamp: Math.round(endTimestamp / 1000) },
            { ephemeral: true }
        );
    }

    /**
     * Remove a reminder
     * @param {ChatInputCommandInteraction} interaction
     * @param {string} name
     * @param {{id: string, reminders: Array<*>}} userData
     * @returns {Promise<void>}
     */
    async #remove(interaction, name, userData) {
        const reminder = userData.reminders.find(remind => remind.name === name);

        if (!reminder) {
            interaction.error("utility/remind:NOT_FOUND", { name }, { ephemeral: true });
            return;
        }

        userData.reminders = userData.reminders.filter(remind => remind !== reminder);
        await this.client.db.users.update(userData.id, userData);

        interaction.success("utility/remind:REMOVED", { name }, { ephemeral: true });
    }

    /**
     * Send reminder list
     * @param {ChatInputCommandInteraction} interaction
     * @param {{id: string, reminders: Array<*>}} userData
     * @returns {void}
     */
    #list(interaction, userData) {
        const reminders = userData.reminders.map(({ name, message, inGuild, channelId, endTimestamp }) => ({
            name,
            value: interaction.t("utility/remind:FIELD_EMBED", {
                message,
                channel: inGuild
                    ? `${interaction.t("utility/remind:CHANNEL")}: ${Mention(channelId, "channel")}, `
                    : "",
                time: Math.round(endTimestamp / 1000)
            })
        }));

        const embed = new EmbedBuilder()
            .setTitle(interaction.t("utility/remind:EMBED_TITLE"))
            .setDescription(reminders.length === 0 ? interaction.t("utility/remind:EMBED_DESC") : null)
            .setFields(reminders);

        interaction.reply({ embeds: [embed], ephemeral: true });
    }
}

module.exports = Remind;
