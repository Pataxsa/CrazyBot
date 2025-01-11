const Command = require("@base/command");
const { Mention } = require("@root/src/utils/functions");
const {
    ChatInputCommandInteraction,
    InteractionContextType,
    PermissionFlagsBits,
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    ComponentType
} = require("discord.js");

class Ticket extends Command {
    constructor(client) {
        super(client, {
            name: "ticket",
            description: "Open a ticket on the server.",
            dirname: __dirname,
            cooldown: 3000,
            enabled: false,
            contexts: [InteractionContextType.Guild],
            restricted: false,
            NSFW: false,
            memberPermissions: null,
            botPermissions: [PermissionFlagsBits.Administrator]
        });

        this.config.data.addStringOption(option =>
            option
                .setName("reason")
                .setDescription("The reason you want to create a ticket.")
                .setMinLength(6)
                .setMaxLength(1800)
                .setRequired(false)
        );
    }

    /**
     * Execute the command
     * @param {ChatInputCommandInteraction} interaction
     * @returns {Promise<void>}
     */
    async execute(interaction) {
        const reason = interaction.options.getString("reason");
        const permissions = [
            "ViewChannel",
            "SendMessages",
            "AddReactions",
            "AttachFiles",
            "EmbedLinks",
            "ReadMessageHistory"
        ];

        await interaction.load("experimental/ticket:LOAD", null, { ephemeral: true });

        const channel = await interaction.guild.channels.create({
            name: `${interaction.user.displayName}-ticket`,
            permissionOverwrites: [
                {
                    id: interaction.user,
                    allow: permissions
                },
                {
                    id: interaction.guild.roles.everyone,
                    deny: permissions
                }
            ]
        });

        const embed = new EmbedBuilder();
        embed
            .setDescription(reason ? reason : interaction.t("experimental/ticket:NO_REASON"))
            .setFooter({ text: interaction.t("experimental/ticket:FOOTER") });

        const close_button = new ButtonBuilder()
            .setCustomId("close_button")
            .setStyle(ButtonStyle.Danger)
            .setLabel(interaction.t("experimental/ticket:CLOSE_BUTTON"));

        const buttons = new ActionRowBuilder().addComponents(close_button);

        const reply = await channel.send({
            content: interaction.t("experimental/ticket:TICKET_MESSAGE", {
                user: Mention(interaction.user.id, "user")
            }),
            embeds: [embed],
            components: [buttons]
        });

        const time = 3 * 24 * 60 * 60; // 3 days
        const collector = reply.createMessageComponentCollector({
            componentType: ComponentType.Button,
            time
        });

        collector.on("collect", () => {
            channel.delete().catch(() => {});

            collector.stop();
        });

        collector.on("end", () => {
            for (const button of buttons.components) {
                button.setDisabled(true);
            }

            reply.editCatch({ components: [buttons] });
        });

        interaction.success("experimental/ticket:SUCCESS", { channel: Mention(channel.id, "channel") }, { edit: true });
    }
}

module.exports = Ticket;
