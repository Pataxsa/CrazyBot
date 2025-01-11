const { Client, Collection, GatewayIntentBits, REST, Routes } = require("discord.js");
const languages = require("@utils/i18n");
const { Ollama } = require("ollama");
const { green, red, yellow } = require("chalk");

class Bot extends Client {
    constructor() {
        super({
            intents: [
                GatewayIntentBits.Guilds,
                GatewayIntentBits.GuildMembers,
                GatewayIntentBits.GuildMessages,
                GatewayIntentBits.GuildMessageReactions,
                GatewayIntentBits.GuildVoiceStates,
                GatewayIntentBits.DirectMessages,
                GatewayIntentBits.MessageContent
            ]
        });

        this.config = require("@root/config");
        this.rest = new REST().setToken(this.config.token);
        /**
         * Language module
         */
        this.languages = languages(this);
        /**
         * DB models using prisma and redis
         * @type {{guilds: import("@models/guildModel"), users: import("@models/userModel")}}
         */
        this.db = null;
        /**
         * Dashboard
         */
        this.dashboard = require("@dashboard/app");
        /**
         * Commands list
         * @type {Collection<string, import("./command")>}
         */
        this.commands = new Collection();
        /**
         * AI module using Ollama
         */
        this.ai = new Ollama({ host: this.config.ollama.host });
    }

    /**
     * Load a command
     * @param {string} commandPath
     * @param {string} commandName
     * @returns {void}
     */
    loadCommand(commandPath, commandName) {
        try {
            const cmd = new (require(`.${commandPath}/${commandName}`))(this);
            console.log(green(`✅ Loaded the command ${yellow(cmd.infos.name)}.`));
            this.commands.set(cmd.infos.name, cmd);
            delete require.cache[require.resolve(`.${commandPath}/${commandName}`)]; // Delete require cache
        } catch (error) {
            console.log(red(`❌ An error occurred while loading the "${yellow(commandName)}" command:`), error);
        }
    }

    /**
     * Load a event
     * @param {string} eventPath
     * @param {string} eventName
     * @returns {void}
     */
    loadEvent(eventPath, eventName) {
        try {
            const event = new (require(`.${eventPath}/${eventName}`))(this);
            console.log(green(`✅ Loaded the event ${yellow(eventName)}.`));
            event.once
                ? this.once(event.eventName, (...args) =>
                      event.execute(...args).catch(err => {
                          if (this.isReady()) this.sendLog(`❌ Event error (${event.eventName}): ${err}`, "error");
                          console.log(red(`❌ Event error (${event.eventName}):`), err);
                      })
                  )
                : this.on(event.eventName, (...args) =>
                      event.execute(...args).catch(err => {
                          if (this.isReady()) this.sendLog(`❌ Event error (${event.eventName}): ${err}`, "error");
                          console.log(red(`❌ Event error (${event.eventName}):`), err);
                      })
                  );
            delete require.cache[require.resolve(`.${eventPath}/${eventName}`)]; // Delete require cache
        } catch (error) {
            console.log(red(`❌ An error occurred while loading the "${yellow(eventName)}" event:`), error);
        }
    }

    /**
     * Register private commands into the selected guild
     * @param {string} guildId
     * @returns {void}
     */
    registerPrivateCommands(guildId) {
        this.rest.put(Routes.applicationGuildCommands(this.user.id, guildId), {
            body: this.commands.filter(cmd => cmd.config.restricted).map(cmd => cmd.config.data)
        });
    }

    /**
     * Register public commands into the bot
     * @returns {void}
     */
    registerPublicCommands() {
        this.rest.put(Routes.applicationCommands(this.user.id), {
            body: this.commands.filter(cmd => !cmd.config.restricted).map(cmd => cmd.config.data)
        });
    }

    /**
     * Initialize the reminder system
     * @returns {void}
     */
    initReminders() {
        setInterval(async () => {
            const usersData = await this.db.users.readAll();

            const updatePromises = usersData.map(async userData => {
                const currentTimestamp = Date.now();

                const expiredReminders = userData.reminders.filter(
                    reminder => currentTimestamp >= reminder.endTimestamp
                );

                if (expiredReminders.length === 0) return;

                const fetchPromises = expiredReminders.map(async reminder => {
                    let channel;
                    if (!reminder.inGuild) {
                        channel = await this.users.fetch(reminder.channelId, { cache: true }).catch(() => {});
                    } else {
                        channel = await this.channels.fetch(reminder.channelId, { cache: true }).catch(() => {});
                    }
                    if (channel) channel.send(reminder.message).catch(() => {});
                });

                userData.reminders = userData.reminders.filter(reminder => currentTimestamp < reminder.endTimestamp);

                await Promise.all(fetchPromises);
                return this.db.users.update(userData.id, userData);
            });

            await Promise.all(updatePromises);
        }, 30_000);
    }

    /**
     * Send a log message to log channel
     * @param {string} message
     * @param {"error" | "success" | "load"} type
     * @returns {Promise<void>}
     */
    async sendLog(message, type) {
        const logChannelId = this.config.support.logs;
        if (!logChannelId) return;

        const logChannel = await this.channels.fetch(logChannelId, { cache: true });

        switch (type) {
            case "error":
                logChannel.error(message);
                break;
            case "success":
                logChannel.success(message);
                break;
            case "load":
                logChannel.load(message);
        }
    }
}

module.exports = Bot;
