const {
    SlashCommandBuilder,
    ChatInputCommandInteraction,
    AutocompleteInteraction,
    InteractionContextType,
    ApplicationIntegrationType
} = require("discord.js");
const path = require("path");

class Command {
    /**
     * Command constructor
     * @param {import("./bot")} client
     */
    constructor(
        client,
        {
            name = null,
            description = null,
            dirname = false,
            enabled = true,
            cooldown = 0,
            contexts = [InteractionContextType.Guild, InteractionContextType.BotDM],
            integrations = [ApplicationIntegrationType.GuildInstall],
            restricted = false,
            NSFW = false,
            memberPermissions = null,
            botPermissions = null,
            data = new SlashCommandBuilder()
                .setName(name)
                .setDescription(description)
                .setNSFW(NSFW)
                .setContexts(contexts)
                .setIntegrationTypes(integrations)
        }
    ) {
        if (memberPermissions) {
            data.setDefaultMemberPermissions(memberPermissions);
        }

        const category = dirname ? dirname.split(path.sep)[parseInt(dirname.split(path.sep).length - 1, 10)] : "Other";
        const baseKey = `${category}/${name}`;

        for (const [language, translate] of client.languages) {
            const translationName = translate(`${baseKey}:NAME`);
            const translationDesc = translate(`${baseKey}:DESCRIPTION`);

            data.setNameLocalization(language, translationName !== "NAME" ? translationName : name);
            data.setDescriptionLocalization(
                language,
                translationDesc !== "DESCRIPTION" ? translationDesc : description
            );
        }

        this.client = client;
        this.infos = { name, description, category };
        this.config = {
            data,
            contexts,
            integrations,
            memberPermissions,
            botPermissions,
            cooldown,
            restricted,
            enabled
        };
    }

    /**
     * Execute the command
     * @param {ChatInputCommandInteraction} interaction
     * @param {Command} cmd
     * @returns {Promise<void>}
     */
    async execute(interaction, cmd) {
        throw Error("Not implemented");
    }

    /**
     * Execute the autocompletion
     * @param {AutocompleteInteraction} interaction
     * @param {Command} cmd
     * @returns {Promise<void>}
     */
    async autocomplete(interaction, cmd) {
        throw Error("Not implemented");
    }
}

module.exports = Command;
