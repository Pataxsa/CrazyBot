const Event = require("@base/event");
const { Events } = require("discord.js");
const { presencestatus } = require("@root/config");
const { bgYellow, magenta } = require("chalk");

class Ready extends Event {
    constructor(client) {
        super(client, {
            eventName: Events.ClientReady,
            once: true
        });
    }

    /**
     * Execute the event
     * @param {import("@base/bot")} client
     * @returns {Promise<void>}
     */
    async execute(client) {
        // Register public commands
        client.registerPublicCommands();

        // Register private commands
        client.config.guilds.forEach(guildId => {
            client.registerPrivateCommands(guildId);
        });

        // Initialize reminder system
        client.initReminders();

        // Load Dashboard
        // if (client.config.dashboard.enabled) {
        //     client.dashboard.load(client);
        // }

        // Update bot presence
        let i = 0;
        setInterval(() => {
            const { presence } = presencestatus;
            const toDisplay = presence[parseInt(i, 10)].activity.name
                .replace("{servers}", client.guilds.cache.size)
                .replace(
                    "{users}",
                    client.guilds.cache.reduce((acc, guild) => acc + guild.memberCount, 0)
                );

            client.user.setPresence({
                activities: [
                    {
                        name: toDisplay,
                        type: presence[parseInt(i, 10)].activity.type
                    }
                ],
                status: presence[parseInt(i, 10)].status
            });

            if (presence[parseInt(i + 1, 10)]) i++;
            else i = 0;
        }, presencestatus.duration);

        console.log(magenta(`${bgYellow(client.user.tag)} is now online ! 🚀`));
    }
}

module.exports = Ready;
