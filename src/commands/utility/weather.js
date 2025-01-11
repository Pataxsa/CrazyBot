const Command = require("@base/command");
const {
    ActionRowBuilder,
    EmbedBuilder,
    ButtonBuilder,
    ButtonStyle,
    InteractionContextType,
    ChatInputCommandInteraction,
    ComponentType
} = require("discord.js");

class Weather extends Command {
    constructor(client) {
        super(client, {
            name: "weather",
            description: "Show the weather in the selected city.",
            dirname: __dirname,
            enabled: true,
            cooldown: 3000,
            contexts: [InteractionContextType.Guild],
            restricted: false,
            NSFW: false,
            memberPermissions: null,
            botPermissions: null
        });

        this.cities_loc = {
            "La Rochelle": [46.1667, -1.15]
        };

        this.config.data.addStringOption(option =>
            option
                .setName("city")
                .setDescription("Choose the city.")
                .addChoices(
                    Object.keys(this.cities_loc).map(city => ({
                        name: city,
                        value: city
                    }))
                )
                .setRequired(true)
        );
    }

    /**
     * Execute the command
     * @param {ChatInputCommandInteraction} interaction
     * @returns {Promise<void>}
     */
    async execute(interaction) {
        const data = { city: interaction.options.getString("city"), weather: null };

        const embed = new EmbedBuilder();

        const close_button = new ButtonBuilder()
            .setCustomId("close_button")
            .setStyle(ButtonStyle.Secondary)
            .setLabel(interaction.t("utility/weather:CLOSE_BUTTON"));

        const buttons = new ActionRowBuilder().addComponents(close_button);

        const reply = await interaction.load("utility/weather:LOAD", null, { fetchReply: true });

        const weather = await this.#getWeather(interaction.locale, data.city);
        data.weather = weather;

        const error = await this.#editEmbed(interaction, embed, buttons, data);
        if (error) return;

        const time = 300_000;
        const filter = i => i.user.id === interaction.user.id;
        const collector = reply.createMessageComponentCollector({
            filter,
            componentType: ComponentType.Button,
            time
        });

        collector.on("collect", async i => {
            await i.deferUpdate();

            interaction.deleteReply();
            collector.stop();
        });

        collector.on("end", () => {
            for (const button of buttons.components) {
                button.setDisabled(true);
            }

            interaction.editReplyCatch({ components: [buttons] });
        });
    }

    /**
     * Get weather of the day
     * @param {string} locale
     * @param {string} city
     * @returns {Promise<any> | null}
     */
    async #getWeather(locale, city) {
        const coords = this.cities_loc[city];
        if (!coords) return null;

        const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${coords[0]}&lon=${coords[1]}&units=metric&lang=${locale}&appid=${this.client.config.apis.weather_api}`;
        const response = await fetch(url).catch(() => {});
        if (!response.ok) return null;

        const data = await response.json();
        const hourlyForecast = data.list.slice(0, 5).map(entry => ({
            time: new Date(entry.dt * 1000).toLocaleTimeString(locale, {
                hour: "2-digit",
                minute: "2-digit"
            }),
            temp: entry.main.temp,
            icon: entry.weather[0].icon,
            description: entry.weather[0].description
        }));
        const today = new Date().toLocaleString(locale);
        const cloudiness = data.list.reduce((acc, entry) => acc + entry.clouds.all, 0) / data.list.length;

        return {
            temp: data.list[0].main.temp,
            humidity: data.list[0].main.humidity,
            windSpeed: data.list[0].wind.speed,
            date: today,
            hourly: hourlyForecast,
            cloudiness: Math.round(cloudiness),
            icon: data.list[0].weather[0].icon
        };
    }

    /**
     * Edit the embed reply
     * @param {ChatInputCommandInteraction} interaction
     * @param {EmbedBuilder} embed
     * @param {ActionRowBuilder} buttons
     * @param {{city: string, weather: any}} data
     * @returns {Promise<void> | true}
     */
    async #editEmbed(interaction, embed, buttons, data) {
        if (!data.weather) {
            interaction.error("utility/weather:NOT_FOUND", { city: data.city }, { edit: true });
            return true;
        }

        const hourlyForecast = data.weather.hourly
            .map(entry => `**${entry.time}**: ${entry.temp}°C - ${entry.description}`)
            .join("\n");

        embed
            .setTitle(
                interaction.t("utility/weather:EMBED_TITLE", {
                    city: data.city
                })
            )
            .setDescription(
                interaction.t("utility/weather:EMBED", {
                    temp: data.weather.temp,
                    humidity: data.weather.humidity,
                    windSpeed: data.weather.windSpeed,
                    hourlyForecast,
                    cloudiness: data.weather.cloudiness
                })
            )
            .setThumbnail(`https://openweathermap.org/img/wn/${data.weather.icon}.png`);

        interaction.editReplyCatch({
            embeds: [embed],
            components: [buttons]
        });
    }
}

module.exports = Weather;
