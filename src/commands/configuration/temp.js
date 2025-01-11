const Command = require("@base/command");
const { Mention } = require("@utils/functions");
const {
    ChatInputCommandInteraction,
    InteractionContextType,
    PermissionFlagsBits,
    ChannelType,
    EmbedBuilder
} = require("discord.js");

class Temp extends Command {
    constructor(client) {
        super(client, {
            name: "temp",
            description: "Add/remove a temporary voice channel.",
            dirname: __dirname,
            cooldown: 3000,
            enabled: true,
            contexts: [InteractionContextType.Guild],
            restricted: false,
            NSFW: false,
            memberPermissions: PermissionFlagsBits.ManageGuild | PermissionFlagsBits.ManageChannels,
            botPermissions: [PermissionFlagsBits.ManageChannels]
        });

        this.config.data
            .addSubcommand(options =>
                options
                    .setName("add")
                    .setDescription("add a voice channel.")
                    .addChannelOption(option =>
                        option
                            .setName("channel")
                            .setDescription("voiceChannel to set.")
                            .addChannelTypes(ChannelType.GuildVoice)
                            .setRequired(true)
                    )
            )
            .addSubcommand(options =>
                options
                    .setName("remove")
                    .setDescription("remove a voice channel.")
                    .addChannelOption(option =>
                        option
                            .setName("channel")
                            .setDescription("voiceChannel to set.")
                            .addChannelTypes(ChannelType.GuildVoice)
                            .setRequired(true)
                    )
            )
            .addSubcommand(options => options.setName("list").setDescription("Get the list of temporary channels."));
    }

    /**
     * Execute the command
     * @param {ChatInputCommandInteraction} interaction
     * @param {Command} _
     * @param {{guild: {id: string, temp_channels: Array<string>}}} data
     * @returns {Promise<void>}
     */
    async execute(interaction, _, data) {
        const action = interaction.options.getSubcommand();
        const temp_channel_id = interaction.options.getChannel("channel")?.id;

        switch (action) {
            case "add":
                this.#add(interaction, temp_channel_id, data.guild);
                break;
            case "remove":
                this.#remove(interaction, temp_channel_id, data.guild);
                break;
            default:
                this.#list(interaction, data.guild);
        }
    }

    /**
     * Add a temp channel
     * @param {ChatInputCommandInteraction} interaction
     * @param {string} temp_channel_id
     * @param {{id: string, temp_channels: Array<string>}} data
     * @returns {Promise<void>}
     */
    async #add(interaction, temp_channel_id, data) {
        if (!data.temp_channels.some(id => id === temp_channel_id)) {
            data.temp_channels.push(temp_channel_id);

            await this.client.db.guilds.update(data.id, data);
        }

        interaction.success("configuration/temp:ADD", {
            channel: Mention(temp_channel_id, "channel")
        });
    }

    /**
     * Remove a temp channel
     * @param {ChatInputCommandInteraction} interaction
     * @param {string} temp_channel_id
     * @param {{id: string, temp_channels: Array<string>}} data
     * @returns {Promise<void>}
     */
    async #remove(interaction, temp_channel_id, data) {
        if (data.temp_channels.some(id => id === temp_channel_id)) {
            data.temp_channels = data.temp_channels.filter(id => id !== temp_channel_id);

            await this.client.db.guilds.update(data.id, data);
        }

        interaction.error("configuration/temp:REMOVE", {
            channel: Mention(temp_channel_id, "channel")
        });
    }

    /**
     * List temp channels
     * @param {ChatInputCommandInteraction} interaction
     * @param {{id: string, temp_channels: Array<string>}} data
     * @returns {Promise<void>}
     */
    async #list(interaction, data) {
        const temp_channels = data.temp_channels.map(channelId => Mention(channelId, "channel")).join(", ");

        const embed = new EmbedBuilder();
        embed
            .setTitle(interaction.t("configuration/temp:LIST_TITLE"))
            .setDescription(temp_channels || interaction.t("configuration/temp:NO_CHANNELS"));

        interaction.reply({ embeds: [embed] });
    }
}

module.exports = Temp;
