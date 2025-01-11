const Event = require("@base/event");
const { isInCooldown } = require("@utils/functions");
const { Events, BaseInteraction, PermissionFlagsBits } = require("discord.js");
const { red } = require("chalk");

class InteractionCreate extends Event {
    constructor(client) {
        super(client, {
            eventName: Events.InteractionCreate
        });
    }

    /**
     * Execute the event
     * @param {BaseInteraction} interaction
     * @returns {Promise<void>}
     */
    async execute(interaction) {
        // Autocompletion
        if (interaction.isAutocomplete()) {
            const cmd = this.client.commands.get(interaction.commandName);

            cmd.autocomplete(interaction, cmd);
            return;
        }

        // Slash commands
        if (!interaction.isChatInputCommand()) return;

        const data = {};

        const translate =
            this.client.languages.find((_, lang) => lang === interaction.locale) ||
            this.client.languages.get(this.client.config.default_lang);
        interaction.translate = translate;

        const cmd = this.client.commands.get(interaction.commandName);

        // Verify bot permissions for the command
        if (cmd.config.botPermissions && interaction.guildId) {
            const permissions = Object.fromEntries(
                Object.entries(PermissionFlagsBits).map(([key, value]) => [value, key])
            );
            const missingPerm = [];

            for (const botPerm of cmd.config.botPermissions) {
                if (!interaction.channel.permissionsFor(this.client.user).has(botPerm))
                    missingPerm.push(permissions[botPerm]);
            }

            if (missingPerm.length > 0) {
                interaction.error("other:MISSING_PERM", { permissions: missingPerm.join(", ") }, { ephemeral: true });
                return;
            }
        }

        // Verify if the command is disabled
        if (!cmd.config.enabled && !this.client.config.owners.includes(interaction.user.id)) {
            interaction.error("other:DISABLED", null, { ephemeral: true });
            return;
        }

        // Verify cooldown
        const inCooldown = isInCooldown(interaction.user.id, cmd);
        if (inCooldown) {
            interaction.error("other:COOLDOWN", { seconds: inCooldown.seconds }, { ephemeral: true });
            return;
        }

        // Find data in db
        data.user = await this.client.db.users.findOrCreate(interaction.user.id);
        if (interaction.guildId) {
            data.guild = await this.client.db.guilds.findOrCreate(interaction.guildId);
        }

        try {
            await cmd.execute(interaction, cmd, data);
            console.log(
                `${interaction.guild?.name || "DM"} | ${interaction.user.displayName} executed the command ${cmd.infos.name} (${new Date().toLocaleString([], { hour12: false })}).`
            );
        } catch (error) {
            interaction.error("other:ERROR", null, { edit: interaction.replied, components: [] });
            this.client.sendLog(`❌ Command error (${cmd.infos.name}): ${error}`, "error");
            console.log(red(`❌ Command error (${cmd.infos.name}):`), error);
        }
    }
}

module.exports = InteractionCreate;
