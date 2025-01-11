const Command = require("@base/command");
const {
    ChatInputCommandInteraction,
    EmbedBuilder,
    ButtonBuilder,
    ButtonStyle,
    ActionRowBuilder,
    ComponentType,
    InteractionContextType
} = require("discord.js");
const { getCommands } = require("@utils/functions");

class Help extends Command {
    constructor(client) {
        super(client, {
            name: "help",
            description: "Help command.",
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
        const config = this.client.config;
        const categories = [
            ...new Set(
                this.client.commands
                    .map(cmd => {
                        if (cmd.config.restricted && !config.guilds.some(guild => guild === interaction.guildId))
                            return null;

                        return cmd.infos.category;
                    })
                    .filter(cmd => cmd !== null)
            )
        ];
        const category = categories[0];
        const commands = getCommands(interaction, this.client.commands, category);

        const data = { page: 0, categories };

        const embed = new EmbedBuilder()
            .setTitle(interaction.t(`${category}/category:NAME`))
            .setDescription(interaction.t(`${category}/category:DESCRIPTION`))
            .setThumbnail(this.client.user.avatarURL())
            .setFields(commands)
            .setFooter({ text: `Page ${data.page + 1}/${categories.length} - ${config.embed.footer}` });

        const left_button = new ButtonBuilder()
            .setCustomId("left_button")
            .setDisabled(true)
            .setStyle(ButtonStyle.Secondary)
            .setLabel("◀️");

        const close_button = new ButtonBuilder()
            .setCustomId("close_button")
            .setStyle(ButtonStyle.Secondary)
            .setLabel("❌");

        const right_button = new ButtonBuilder()
            .setCustomId("right_button")
            .setDisabled(categories.length <= 1)
            .setStyle(ButtonStyle.Secondary)
            .setLabel("▶️");

        const buttons = new ActionRowBuilder().addComponents(left_button, close_button, right_button);

        const reply = await interaction.reply({
            embeds: [embed],
            components: [buttons],
            fetchReply: true
        });

        const time = 300_000;
        const filter = i => i.user.id === interaction.user.id;
        const collector = reply.createMessageComponentCollector({
            filter,
            componentType: ComponentType.Button,
            time
        });

        collector.on("collect", async i => {
            await i.deferUpdate();

            if (i.customId === close_button.data.custom_id) {
                await interaction.deleteReply();
                collector.stop();
                return;
            }

            const increment = i.customId === right_button.data.custom_id ? 1 : -1;
            data.page = Math.max(0, Math.min(data.page + increment, data.categories.length - 1));

            left_button.setDisabled(data.page === 0);
            right_button.setDisabled(data.page >= data.categories.length - 1);

            this.#edit_embed(interaction, embed, buttons, data);
        });

        collector.on("end", () => {
            for (const button of buttons.components) {
                button.setDisabled(true);
            }

            interaction.editReplyCatch({ components: [buttons] });
        });
    }

    /**
     * Edit the embed reply
     * @param {ChatInputCommandInteraction} interaction
     * @param {EmbedBuilder} embed
     * @param {ActionRowBuilder} buttons
     * @param {{page: number, categories: Array<string>}} data
     * @returns {void}
     */
    #edit_embed(interaction, embed, buttons, data) {
        const embedConfig = this.client.config.embed;
        const category = data.categories[data.page];
        const commands = getCommands(interaction, this.client.commands, category);

        embed
            .setTitle(interaction.t(`${category}/category:NAME`))
            .setDescription(interaction.t(`${category}/category:DESCRIPTION`))
            .setFields(commands)
            .setFooter({
                text: `Page ${data.page + 1}/${data.categories.length} - ${embedConfig.footer}`
            });

        interaction.editReplyCatch({ embeds: [embed], components: [buttons] });
    }
}

module.exports = Help;
