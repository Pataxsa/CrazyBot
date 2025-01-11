const Command = require("@base/command");
const {
    ChatInputCommandInteraction,
    InteractionContextType,
    EmbedBuilder,
    AutocompleteInteraction
} = require("discord.js");
const languages = require("@root/languages/languages.json");
const { translate } = require("@vitalets/google-translate-api");

class Translate extends Command {
    constructor(client) {
        super(client, {
            name: "translate",
            description: "Translates a message to the specified language (format fr, en, es)",
            dirname: __dirname,
            cooldown: 3000,
            enabled: true,
            contexts: [InteractionContextType.Guild, InteractionContextType.BotDM],
            restricted: false,
            NSFW: false,
            memberPermissions: null,
            botPermissions: null
        });

        this.config.data
            .addStringOption(option =>
                option
                    .setName("message")
                    .setDescription("The message to translate.")
                    .setMaxLength(1800)
                    .setRequired(true)
            )
            .addStringOption(option =>
                option
                    .setName("language")
                    .setDescription("Destination language.")
                    .setAutocomplete(true)
                    .setRequired(true)
            )
            .addStringOption(option =>
                option.setName("source").setDescription("Source language.").setAutocomplete(true).setRequired(false)
            );
    }

    /**
     * Execute the command
     * @param {ChatInputCommandInteraction} interaction
     * @returns {Promise<void>}
     */
    async execute(interaction) {
        const message = interaction.options.getString("message");
        const language = interaction.options.getString("language").toLowerCase();
        let srcLang = interaction.options.getString("source");

        await interaction.load("utility/translate:LOAD");

        let translation;
        try {
            translation = await translate(message, { from: srcLang, to: language });
            if (!srcLang) srcLang = translation.raw.ld_result.srclangs;
        } catch {
            interaction.error("utility/translate:UNAVAILABLE", null, { edit: true });
            return;
        }

        const embed = new EmbedBuilder()
            .setTitle(interaction.t("utility/translate:TITLE"))
            .setThumbnail(
                "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d7/Google_Translate_logo.svg/768px-Google_Translate_logo.svg.png"
            )
            .addFields(
                {
                    name: interaction.t("utility/translate:FIELD_1"),
                    value: `\`\`\`${message}\`\`\``,
                    inline: false
                },
                {
                    name: interaction.t("utility/translate:FIELD_2"),
                    value: `\`${srcLang}\``,
                    inline: true
                },
                {
                    name: interaction.t("utility/translate:FIELD_3"),
                    value: `\`${language}\``,
                    inline: true
                },
                {
                    name: interaction.t("utility/translate:FIELD_4"),
                    value: `\`\`\`${translation.text}\`\`\``,
                    inline: false
                }
            )
            .setFooter({
                text: interaction.t("utility/translate:FOOTER")
            })
            .setTimestamp();

        await interaction.editReplyCatch({
            embeds: [embed],
            ephemeral: false
        });
    }

    /**
     * Execute the autocompletion
     * @param {AutocompleteInteraction} interaction
     * @returns {Promise<void>}
     */
    async autocomplete(interaction) {
        const focusedValue = interaction.options.getFocused();
        const choices = Object.entries(languages)
            .filter(([, name]) => name.toLowerCase().startsWith(focusedValue.toLowerCase()))
            .slice(0, 25)
            .map(([code, name]) => ({
                name: `${name} (${code})`,
                value: code
            }));

        interaction.respond(choices);
    }
}

module.exports = Translate;
