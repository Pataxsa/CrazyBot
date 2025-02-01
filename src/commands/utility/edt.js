const Command = require("@base/command");
const ical = require("node-ical");
const { getUser } = require("@schemas/User");
const { getStartOfWeek, getEndOfWeek } = require("@utils/functions");
const {
    EmbedBuilder,
    ButtonBuilder,
    ActionRowBuilder,
    InteractionContextType,
    ChatInputCommandInteraction,
    ComponentType,
    ButtonStyle
} = require("discord.js");

class Edt extends Command {
    constructor(client) {
        super(client, {
            name: "edt",
            description: "Shows the lessons for a given student.",
            dirname: __dirname,
            enabled: true,
            cooldown: 3000,
            contexts: [InteractionContextType.Guild, InteractionContextType.BotDM],
            restricted: false,
            NSFW: false,
            memberPermissions: null,
            botPermissions: null
        });

        this.config.data.addStringOption(option =>
            option.setName("identifier").setDescription("🔑 Enter your ENT login.").setRequired(false)
        );
    }

    /**
     * Execute the command
     * @param {ChatInputCommandInteraction} interaction
     * @returns {Promise<void>}
     */
    async execute(interaction) {
        const login = interaction.options.getString("identifier") || (await getUser(interaction.user.id)).login;
        const currentDate = new Date().toLocaleDateString(interaction.locale);

        const data = { page: 0, login, courses: null };

        if (!login) {
            interaction.error("utility/edt:LOGIN_NOTFOUND", null, { ephemeral: true });
            return;
        }

        const embed = new EmbedBuilder();

        const left_button = new ButtonBuilder()
            .setCustomId("left_button")
            .setDisabled(true)
            .setStyle(ButtonStyle.Secondary)
            .setLabel("◀️");

        const close_button = new ButtonBuilder()
            .setCustomId("close_button")
            .setStyle(ButtonStyle.Secondary)
            .setLabel("❌");

        const right_button = new ButtonBuilder()
            .setCustomId("right_button")
            .setStyle(ButtonStyle.Secondary)
            .setLabel("▶️");

        const buttons = new ActionRowBuilder().addComponents(left_button, close_button, right_button);

        const reply = await interaction.load("utility/edt:LOADING", null, { fetchReply: true });

        const weekCourses = await this.#getCourses(login, interaction.locale);
        data.courses = weekCourses;

        if (!weekCourses) {
            interaction.error("utility/edt:NOT_FOUND", null, { edit: true });
            return;
        }

        if (weekCourses.denied) {
            interaction.error("utility/edt:DENIED", { login }, { edit: true });
            return;
        }

        if (weekCourses.length === 0) {
            interaction.error("utility/edt:NO_COURSES", { login }, { edit: true });
            return;
        }

        const today_course = data.courses.find(v => v.date === currentDate);
        data.page = today_course ? data.courses.indexOf(today_course) : data.page;

        left_button.setDisabled(data.page === 0);
        right_button.setDisabled(weekCourses.length <= 1 || data.page === weekCourses.length - 1);
        this.#edit_embed(interaction, embed, buttons, data);

        const time = 300_000;
        const filter = i => i.user.id === interaction.user.id;
        const collector = reply.createMessageComponentCollector({
            filter,
            componentType: ComponentType.Button,
            time
        });

        collector.on("collect", async i => {
            await i.deferUpdate();

            if (i.customId === close_button.data.custom_id) {
                await interaction.deleteReply();
                collector.stop();
                return;
            }

            const increment = i.customId === right_button.data.custom_id ? 1 : -1;
            data.page = Math.max(0, Math.min(data.page + increment, data.courses.length - 1));

            left_button.setDisabled(data.page === 0);
            right_button.setDisabled(data.page >= data.courses.length - 1);

            this.#edit_embed(interaction, embed, buttons, data);
        });

        collector.on("end", () => {
            for (const button of buttons.components) {
                button.setDisabled(true);
            }

            interaction.editReplyCatch({ components: [buttons] });
        });
    }

    /**
     * Get courses of the week
     * @param {string} login
     * @param {string} locale
     * @returns {Promise<Array<{list: Array<string>, date: string}> | {denied: boolean}>}
     */
    async #getCourses(login, locale) {
        const url = `https://apps.univ-lr.fr/cgi-bin/WebObjects/ServeurPlanning.woa/wa/ics?login=${login}`;
        const startOfWeek = getStartOfWeek();
        const endOfWeek = getEndOfWeek();

        const response = await fetch(url).catch(() => {});
        if (!response.ok) return null;

        const icsData = await response.text();

        const data = await ical.async.parseICS(icsData);
        if (data.vcalendar["WR-CALNAME"].includes("privé")) return { denied: true };

        const events = Object.values(data)
            .filter(event => event.type === "VEVENT" && event.start >= startOfWeek && event.start <= endOfWeek)
            .sort((a, b) => a.start - b.end);

        const groupedEvents = events.reduce((acc, event) => {
            const startDate = new Date(event.start);
            const eventDate = startDate.toLocaleDateString(locale);
            if (!acc[eventDate]) {
                acc[eventDate] = { date: eventDate, list: [] };
            }

            const summary = event.summary.split(";").map(part => part.replace(/\s*\[EDT\]/g, "").trim());
            const startTime = startDate.toLocaleTimeString(locale, { hour: "2-digit", minute: "2-digit" });
            const endTime = new Date(event.end).toLocaleTimeString(locale, { hour: "2-digit", minute: "2-digit" });
            summary.push(`${startTime} - ${endTime}`);

            acc[eventDate].list.push(summary);

            return acc;
        }, {});

        return Object.values(groupedEvents);
    }

    /**
     * Edit the embed reply
     * @param {ChatInputCommandInteraction} interaction
     * @param {EmbedBuilder} embed
     * @param {ActionRowBuilder} buttons
     * @param {{page: number, login: string, courses: Array<{list: Array<string>, date: string}>}} data
     * @returns {void}
     */
    #edit_embed(interaction, embed, buttons, data) {
        const date = data.courses[data.page].date;
        const courses = data.courses[data.page].list
            .map(([type, room, subject, teacher, hour]) => {
                return interaction.t("utility/edt:EMBED", { type, room, subject, teacher, hour });
            })
            .join("\n\n");

        embed.setTitle(interaction.t("utility/edt:EMBED_TITLE", { login: data.login, date }));
        embed.setDescription(courses);
        embed.setFooter({ text: `🗓️ Page ${data.page + 1}/${data.courses.length}` });

        interaction.editReplyCatch({ embeds: [embed], components: [buttons] });
    }
}

module.exports = Edt;
