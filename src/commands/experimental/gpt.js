const Command = require("@base/command");
const { ImageToBase64 } = require("@root/src/utils/functions");
const { ChatInputCommandInteraction, InteractionContextType, PermissionFlagsBits } = require("discord.js");

class Gpt extends Command {
    constructor(client) {
        super(client, {
            name: "gpt",
            description: "Ask AI with your prompt.",
            dirname: __dirname,
            cooldown: 3000,
            enabled: true,
            contexts: [InteractionContextType.Guild, InteractionContextType.BotDM],
            restricted: false,
            NSFW: false,
            memberPermissions: null,
            botPermissions: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages]
        });

        this.config.data
            .addStringOption(option =>
                option
                    .setName("prompt")
                    .setDescription("The prompt.")
                    .setMinLength(5)
                    .setMaxLength(1000)
                    .setRequired(true)
            )
            .addAttachmentOption(option =>
                option
                    .setName("image")
                    .setDescription("The image you want to send to the AI. (jpg or png)")
                    .setRequired(false)
            );
    }

    /**
     * Execute the command
     * @param {ChatInputCommandInteraction} interaction
     * @returns {Promise<void>}
     */
    async execute(interaction) {
        const config = this.client.config;
        const message = interaction.options.getString("prompt");
        const image = interaction.options.getAttachment("image");

        if (image && !/^image\/(png|jpeg)$/.test(image.contentType)) {
            await interaction.error("experimental/gpt:INVALID_FORMAT");
            return;
        }

        await interaction.load("experimental/gpt:LOAD");

        let response;
        try {
            response = await this.client.ai.chat({
                model: config.ollama.model,
                messages: [{ role: "user", content: message, images: image ? [await ImageToBase64(image.url)] : [] }]
            });
        } catch {
            interaction.error("experimental/gpt:UNAVAILABLE", null, { edit: true });
            return;
        }

        const segments = response.message.content.match(/.{1,2000}/gs);

        await interaction.editReplyCatch({ content: segments[0], embeds: [] });
        segments.shift();

        for (const segment of segments) {
            await interaction.channel.send(segment);
        }
    }
}

module.exports = Gpt;
