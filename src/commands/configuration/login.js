const Command = require("@base/command");
const {
    ChatInputCommandInteraction,
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    ComponentType,
    Colors,
    InteractionContextType
} = require("discord.js");

class Login extends Command {
    constructor(client) {
        super(client, {
            name: "login",
            description: "Associate your login with your Discord account.",
            dirname: __dirname,
            cooldown: 3000,
            enabled: true,
            contexts: [InteractionContextType.Guild, InteractionContextType.BotDM],
            restricted: false,
            NSFW: false,
            memberPermissions: null
        });

        this.config.data.addStringOption(option =>
            option.setName("login").setDescription("Enter your login.").setMaxLength(40).setRequired(true)
        );
    }

    /**
     * Execute the command
     * @param {ChatInputCommandInteraction} interaction
     * @param {Command} _
     * @param {{user: {id: string, login: string}}} data
     * @returns {Promise<void>}
     */
    async execute(interaction, _, data) {
        const embedConfig = this.client.config.embed;
        const login = interaction.options.getString("login");

        const embed = new EmbedBuilder()
            .setColor(embedConfig.color.success)
            .setTitle(interaction.t("configuration/login:EMBED_SUCCESS_TITLE"))
            .setDescription(interaction.t("configuration/login:EMBED_SUCCESS_DESC", { login }));

        if (!data.user.login) {
            data.user.login = login;
            await this.client.db.users.update(data.user.id, data.user);

            interaction.reply({ embeds: [embed], ephemeral: true });
            return;
        }

        if (data.user.login === login) {
            interaction.success("configuration/login:SAME", { login }, { ephemeral: true });
            return;
        }

        embed
            .setColor(embedConfig.color.error)
            .setTitle(interaction.t("configuration/login:EMBED_REGISTERED_TITLE"))
            .setDescription(interaction.t("configuration/login:EMBED_REGISTERED_DESC", { login: data.user.login }));

        const yes_button = new ButtonBuilder().setCustomId("yes_button").setLabel("✅").setStyle(ButtonStyle.Secondary);
        const no_button = new ButtonBuilder().setCustomId("no_button").setLabel("❌").setStyle(ButtonStyle.Secondary);

        const buttons = new ActionRowBuilder().addComponents(yes_button, no_button);

        const reply = await interaction.reply({
            embeds: [embed],
            components: [buttons],
            ephemeral: true,
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

            if (i.customId === yes_button.data.custom_id) {
                data.user.login = login;
                await this.client.db.users.update(data.user.id, data.user);

                interaction.success("configuration/login:UPDATED", { login }, { edit: true, components: [] });
            }

            if (i.customId === no_button.data.custom_id)
                interaction.error("configuration/login:NOT_UPDATED", null, { edit: true, components: [] });

            collector.stop();
        });

        collector.on("end", async (_, reason) => {
            if (reason !== "time") return;
            embed.setColor(Colors.Yellow).setTitle(null).setDescription(interaction.t("configuration/login:EXPIRED"));

            interaction.editReplyCatch({ embeds: [embed], components: [] });
        });
    }
}

module.exports = Login;
