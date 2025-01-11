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

class Theater extends Command {
    constructor(client) {
        super(client, {
            name: "theater",
            description: "Shows cinema screenings for CGR Les Minimes and CGR Dragon.",
            dirname: __dirname,
            enabled: true,
            cooldown: 3000,
            contexts: [InteractionContextType.Guild, InteractionContextType.BotDM],
            restricted: false,
            NSFW: false,
            memberPermissions: null,
            botPermissions: null
        });

        this.choices = [
            {
                name: "Minimes",
                value: "https://www.allocine.fr/_/showtimes/theater-P0134/"
            },
            {
                name: "Dragon",
                value: "https://www.allocine.fr/_/showtimes/theater-P0194/"
            }
        ];

        this.config.data.addStringOption(option =>
            option
                .setName("cinema")
                .setDescription("Choose the theater you want !")
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
        const url = interaction.options.getString("cinema");
        const cinema = this.choices.find(choice => choice.value === url).name;

        const data = { page: 0, films: null, cinemaName: cinema };

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

        const reply = await interaction.load("utility/theater:LOAD", null, { fetchReply: true });

        const films = await this.#getFilms(url, interaction.locale);
        data.films = films;

        if (!films) {
            interaction.error("utility/theater:NOT_FOUND", { cinema }, { edit: true });
            return;
        }

        right_button.setDisabled(films.length <= 1);
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
            data.page = Math.max(0, Math.min(data.page + increment, data.films.length - 1));

            left_button.setDisabled(data.page === 0);
            right_button.setDisabled(data.page >= data.films.length - 1);

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
     * Get informations about films
     * @param {string} url
     * @param {string} locale
     * @returns {Promise<any[]>}
     */
    async #getFilms(url, locale) {
        const response = await fetch(url).catch(() => {});
        if (!response.ok) return null;

        const jsonData = await response.json();
        if (jsonData.error) return null;

        const moviesData = jsonData.results.map(movieData => {
            const movie = movieData.movie;

            const schedules =
                movieData.showtimes.local.map(showtime => {
                    const startTime = new Date(showtime.startsAt).toLocaleTimeString(locale, {
                        hour: "2-digit",
                        minute: "2-digit"
                    });
                    const ticketingUrls = showtime.data.ticketing.map(ticket => ticket.urls);

                    return {
                        time: startTime,
                        links: ticketingUrls
                    };
                }) || [];

            return {
                title: movie.title,
                idFilm: movie.internalId,
                posterUrl: movie.poster.url || null,
                runtime: movie.runtime || null,
                genres: movie.genres.map(genre => genre.translate),
                userRating: movie.stats.userRating?.score || 0,
                userReviewCount: movie.stats.userReview?.count || 0,
                schedules
            };
        });

        moviesData.forEach(movie => {
            movie.schedules = movie.schedules.map(schedule => {
                return {
                    time: `[${schedule.time}](${schedule.links[0][0].split(" ")[0]})`
                };
            });
        });

        return moviesData;
    }

    /**
     * Edit the embed reply
     * @param {ChatInputCommandInteraction} interaction
     * @param {EmbedBuilder} embed
     * @param {ActionRowBuilder} buttons
     * @param {{page: number, films: any[], cinemaName: string}} data
     * @returns {void}
     */
    #edit_embed(interaction, embed, buttons, data) {
        const index = data.page;
        const totalPages = data.films.length;
        const film = data.films[index];

        embed
            .setTitle(`🎬 ${film.title}`)
            .setURL(`https://www.allocine.fr/film/fichefilm_gen_cfilm=${film.idFilm}.html`)
            .setDescription(
                interaction.t("utility/theater:EMBED", {
                    runtime: film.runtime,
                    genres: film.genres.join(", "),
                    userRating: film.userRating,
                    userReviewCount: film.userReviewCount,
                    schedules:
                        film.schedules.map(schedule => schedule.time).join(", ") ||
                        interaction.t("utility/theater:NO_SHEDULES")
                })
            )
            .setImage(film.posterUrl)
            .setFooter({ text: `Film ${index + 1}/${totalPages} - ${data.cinemaName}` });

        interaction.editReplyCatch({
            content: null,
            embeds: [embed],
            components: [buttons]
        });
    }
}

module.exports = Theater;
