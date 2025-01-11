const Command = require("@base/command");
const { EmbedBuilder, ChatInputCommandInteraction, InteractionContextType } = require("discord.js");
const { Capitalize } = require("@utils/functions");
const { XMLParser } = require("fast-xml-parser");

class Menu extends Command {
    constructor(client) {
        super(client, {
            name: "menu",
            description: "Show menu of the day.",
            dirname: __dirname,
            cooldown: 3000,
            enabled: true,
            contexts: [InteractionContextType.Guild, InteractionContextType.BotDM],
            restricted: false,
            NSFW: false,
            memberPermissions: null,
            botPermissions: null
        });

        this.choices = [
            {
                name: "Ru Republique",
                value: "r766"
            },
            {
                name: "Ru Vespucci",
                value: "r769"
            }
        ];

        this.config.data.addStringOption(option =>
            option
                .setName("restaurant")
                .setDescription("Choose a restaurant.")
                .setRequired(true)
                .addChoices(...this.choices)
        );
    }

    /**
     * Execute the command
     * @param {ChatInputCommandInteraction} interaction
     * @returns {Promise<void>}
     */
    async execute(interaction) {
        const restaurantId = interaction.options.getString("restaurant");
        const restaurant = this.choices.find(choice => choice.value === restaurantId).name;

        const embed = new EmbedBuilder();

        await interaction.load("utility/menu:LOAD");

        const startTime = Date.now();
        const data = await this.#getMenu(restaurantId, restaurant);

        if (!data) {
            interaction.error("utility/menu:NOT_FOUND", { resto: restaurant }, { edit: true });
            return;
        }

        if (data.menu.length === 0) {
            interaction.error("utility/menu:CLOSED", { resto: restaurant }, { edit: true });
            return;
        }

        const endTime = Date.now();
        data.time = endTime - startTime;

        this.#editEmbed(interaction, embed, data);
    }

    /**
     * Get menu information by a restaurant
     * @param {string} restaurantId
     * @param {string} restaurant
     * @returns {Promise<{date: string, resto: string, menu: Array<{name: string, value: string}>}>}
     */
    async #getMenu(restaurantId, restaurant) {
        const url = "http://webservices-v2.crous-mobile.fr:8080/feed/poitiers/externe/menu.xml";
        const response = await fetch(url).catch(() => {});
        if (!response.ok) return null;

        const data = await response.text();

        const parser = new XMLParser({
            ignoreAttributes: false,
            attributeNamePrefix: "@_",
            processEntities: true,
            htmlEntities: true,
            parseTagValue: false
        });
        const jsonData = parser.parse(data);
        const restaurants = jsonData.root.resto;

        if (!Array.isArray(restaurants)) return null;

        const resto = restaurants.find(r => r["@_id"] === restaurantId);

        if (!resto) return null;

        // Get menu of the day or menu of Monday
        const today = new Date();
        const dayOfWeek = today.getDay();
        const menuDate = resto.menu.find(menu => {
            const date = new Date(menu["@_date"]);

            if (dayOfWeek === 0) {
                return date.getDay() === 1; // 1 = Monday
            }
            return date.toDateString() === today.toDateString();
        });

        if (!menuDate) return null;

        const html = parser.parse(menuDate["#text"]);
        const infos = { date: menuDate["@_date"], resto: restaurant, menu: [] };
        if (!Array.isArray(html.h4)) return infos;

        for (const [index, type] of html.h4.entries()) {
            let foods = html.ul[index].li;
            if (!Array.isArray(foods)) foods = [foods];
            foods = foods.filter(str => str !== "");

            infos.menu.push({ name: Capitalize(type.toLowerCase()), value: foods.join(", ") });
        }

        return infos;
    }

    /**
     * Edit embed
     * @param {ChatInputCommandInteraction} interaction
     * @param {EmbedBuilder} embed
     * @param {{date: string, resto: string, menu: Array<{name: string, value: string}>}} data
     * @returns {void}
     */
    #editEmbed(interaction, embed, data) {
        embed
            .setTitle(
                interaction.t("utility/menu:EMBED_TITLE", {
                    resto: data.resto
                })
            )
            .setDescription(`**Date :** ${data.date}`)
            .setThumbnail(
                "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/Logo_Crous_vectoris%C3%A9.svg/1349px-Logo_Crous_vectoris%C3%A9.svg.png"
            )
            .setFields(data.menu)
            .setFooter({ text: interaction.t("utility/menu:EMBED_FOOTER", { time: data.time }) })
            .setTimestamp();

        interaction.editReplyCatch({
            content: null,
            embeds: [embed]
        });
    }
}

module.exports = Menu;
