const Command = require("@base/command");
const { InteractionContextType, EmbedBuilder, ChatInputCommandInteraction } = require("discord.js");

class Wiki extends Command {
    constructor(client) {
        super(client, {
            name: "wiki",
            description: "Search for an article on Wikipedia.",
            dirname: __dirname,
            cooldown: 3000,
            enabled: true,
            contexts: [InteractionContextType.Guild, InteractionContextType.BotDM],
            restricted: false,
            NSFW: false,
            memberPermissions: null
        });

        this.config.data.addStringOption(option =>
            option.setName("term").setDescription("The term or phrase to search on Wikipedia").setRequired(true)
        );
        this.config.data.addStringOption(option =>
            option
                .setName("length")
                .setDescription("Choose the length of the summary: short, medium, or full")
                .setRequired(true)
                .addChoices(
                    { name: "Short", value: "short" },
                    { name: "Medium", value: "medium" },
                    { name: "Full", value: "full" }
                )
        );
    }

    /**
     * Execute the command
     * @param {ChatInputCommandInteraction} interaction
     * @returns {Promise<void>}
     */
    async execute(interaction) {
        const term = interaction.options.getString("term");
        const length = interaction.options.getString("length");
        const lang = interaction.locale.split("-")[0];

        const searchURL = `https://${lang}.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(term)}&format=json`;

        const response = await fetch(searchURL);
        const data = await response.json();
        const lengthDescriptions = {
            short: interaction.t("experimental/wiki:SHORT_LENGTH"),
            medium: interaction.t("experimental/wiki:MEDIUM_LENGTH"),
            full: interaction.t("experimental/wiki:FULL_LENGTH")
        };

        if (!data.query.search.length) {
            return interaction.reply({
                content: interaction.t("experimental/wiki:NO_RESULTS", { term }),
                ephemeral: true
            });
        }

        const firstResult = data.query.search[0];
        const title = firstResult.title;

        const extractURL = `https://${lang}.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(title)}&prop=extracts|pageimages&exintro&explaintext&format=json`;

        const extractResponse = await fetch(extractURL);
        const extractData = await extractResponse.json();

        const page = Object.values(extractData.query.pages)[0];
        const summary = page.extract;
        let image = page.thumbnail ? page.thumbnail.source : null;

        if (image) {
            image = image.replace(/(\d+)px/, "300px"); // Resize the image to 300px
        }

        const chunks = [];
        let currentChunk = "";

        // Split the text based on the chosen length
        if (length === "short") {
            const sentences = summary.split(".");
            currentChunk = sentences.slice(0, 3).join(".") + (sentences.length > 3 ? "." : "");
            chunks.push(currentChunk);
        } else if (length === "medium") {
            currentChunk = summary.slice(0, 2000);
            const lastPeriodIndex = currentChunk.lastIndexOf(".");
            currentChunk = lastPeriodIndex !== -1 ? currentChunk.slice(0, lastPeriodIndex + 1) : currentChunk;
            chunks.push(currentChunk);
        } else {
            for (let i = 0; i < summary.length; i++) {
                currentChunk += summary[i];
                if (currentChunk.length >= 2000) {
                    let splitIndex = currentChunk.lastIndexOf(".", currentChunk.length - 1);
                    if (splitIndex === -1) splitIndex = 2000;
                    chunks.push(currentChunk.slice(0, splitIndex + 1));
                    currentChunk = currentChunk.slice(splitIndex + 1);
                }
            }
            if (currentChunk.length > 0) {
                chunks.push(currentChunk);
            }
        }

        const firstEmbed = new EmbedBuilder()
            .setColor(0x0099ff)
            .setTitle(`${title}, ${interaction.t("experimental/wiki:ARTICLE")} ${lengthDescriptions[length]}`)
            .setDescription(chunks[0])
            .setFooter({ text: interaction.t("experimental/wiki:SOURCE_FOOTER") });

        if (length === "short" || length === "medium" || chunks.length === 1) {
            firstEmbed.setImage(image);

            return interaction.reply({
                embeds: [firstEmbed],
                ephemeral: false
            });
        }

        await interaction.reply({
            embeds: [firstEmbed],
            ephemeral: false
        });

        if (chunks.length > 1) {
            for (let i = 1; i < chunks.length - 1; i++) {
                const followUpEmbed = new EmbedBuilder()
                    .setColor(0x0099ff)
                    .setDescription(chunks[i])
                    .setFooter({ text: interaction.t("experimental/wiki:SOURCE_FOOTER") });
                if (i === chunks.length - 1) {
                    followUpEmbed.setImage(image);
                }

                await interaction.followUp({
                    embeds: [followUpEmbed],
                    ephemeral: false
                });
            }
        }
    }
}

module.exports = Wiki;
