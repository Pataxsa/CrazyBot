const { ChatInputCommandInteraction, EmbedBuilder, Colors, InteractionContextType } = require("discord.js");
const Command = require("@base/command");

class Library extends Command {
    constructor(client) {
        super(client, {
            name: "library",
            description: "Search for a book in the university library and check its availability.",
            dirname: __dirname,
            enabled: true,
            cooldown: 3000,
            contexts: [InteractionContextType.Guild, InteractionContextType.BotDM],
            restricted: false,
            NSFW: false,
            memberPermissions: null,
            botPermissions: null
        });

        // Configure command options for user input
        this.config.data.addStringOption(option =>
            option
                .setName("title")
                .setDescription("Enter the title of the book that you are looking for")
                .setRequired(true)
        );
    }

    /**
     * Execute the command
     * @param {ChatInputCommandInteraction} interaction
     * @returns {Promise<void>}
     */
    async execute(interaction) {
        const query = interaction.options.getString("title"); // Retrieve the search title input
        const searchApiUrl = `https://bib.univ-lr.fr/primaws/rest/pub/pnxs?acTriggered=false&blendFacetsSeparately=false&citationTrailFilterByAvailability=true&disableCache=false&getMore=0&inst=33ULR_INST&isCDSearch=false&lang=fr&limit=10&newspapersActive=false&newspapersSearch=false&offset=0&otbRanking=false&pcAvailability=true&q=any,contains,${encodeURIComponent(query)}&qExclude=&qInclude=&rapido=false&refEntryActive=false&rtaLinks=true&scope=Library_Catalog&searchInFulltextUserSelection=true&skipDelivery=Y&sort=rank&tab=Everything&vid=33ULR_INST:ULR`;

        let searchData;
        try {
            // Fetch search results from the library catalog API
            const searchResponse = await fetch(searchApiUrl);
            if (!searchResponse.ok) throw new Error("Search API error");
            searchData = await searchResponse.json();
        } catch {
            // Handle API errors gracefully and notify the user
            return interaction.error("utility/library:SEARCH_ERROR", null, { ephemeral: true });
        }

        if (!searchData.docs || searchData.docs.length === 0) {
            // Inform the user if no books are found
            return interaction.error("utility/library:NO_BOOKS_FOUND", { query }, { ephemeral: true });
        }

        // Extract relevant details from the first search result
        const doc = searchData.docs[0];
        const title = doc.pnx.display.title?.[0] || interaction.t("utility/library:UNKNOWN_TITLE");
        const author = doc.pnx.sort.author?.[0] || interaction.t("utility/library:UNKNOWN_AUTHOR");
        const publisher = doc.pnx.display.publisher?.[0] || interaction.t("utility/library:UNKNOWN_PUBLISHER");
        const year = doc.pnx.display.creationdate?.[0] || interaction.t("utility/library:UNKNOWN_YEAR");
        const summary = doc.pnx.display.description?.[0] || interaction.t("utility/library:NO_SUMMARY");
        const mms = doc.pnx.display.mms?.[0];
        const isbn = doc.pnx.addata.isbn?.[0]?.replace(/-/g, "");
        let image = "https://static-01.daraz.pk/p/3fe9c8a1dbfb5b3910e306183ec5d669.jpg"; // Default image
        if (isbn) image = `https://pictures.abebooks.com/isbn/${isbn}-fr.jpg`; // Use ISBN-based image if available

        if (!mms) {
            // Notify the user if the MMS ID is missing, as availability cannot be checked
            return interaction.error("utility/library:MISSING_MMS", null, { ephemeral: true });
        }

        const availabilityApiUrl = `https://bib.univ-lr.fr/primaws/rest/priv/ILSServices/titleServices/${mms}?lang=fr&hideResourceSharing=false&isRapido=false&lang=fr&record-institution=33ULR_INST`;

        let availabilityData;
        try {
            // Fetch availability data for the book
            const availabilityResponse = await fetch(availabilityApiUrl);
            if (!availabilityResponse.ok) throw new Error("Availability API error");
            availabilityData = await availabilityResponse.json();
        } catch {
            // Handle errors related to the availability API
            return interaction.error("utility/library:SEARCH_ERROR", null, { ephemeral: true });
        }

        // Extract location and availability details
        const location = availabilityData.data.itemInfo.locations?.[0] || {};
        const subLocation = location["sub-location"] || interaction.t("utility/library:UNKNOWN_LOCATION");
        const callNumber = location["call-number"] || interaction.t("utility/library:UNKNOWN_CALL_NUMBER");
        const availability = location.availabilityStatement || interaction.t("utility/library:NO_AVAILABILITY");

        // Construct an embed with all retrieved information
        const embed = new EmbedBuilder()
            .setColor(Colors.Blue)
            .setTitle(`📘 ${title}`)
            .setDescription(summary)
            .addFields(
                { name: interaction.t("utility/library:AUTHOR"), value: author, inline: true },
                { name: interaction.t("utility/library:PUBLISHER"), value: publisher, inline: true },
                { name: interaction.t("utility/library:YEAR"), value: year, inline: true },
                { name: interaction.t("utility/library:LOCATION"), value: subLocation, inline: false },
                { name: interaction.t("utility/library:CALL_NUMBER"), value: callNumber, inline: true },
                { name: interaction.t("utility/library:AVAILABILITY"), value: availability, inline: true }
            )
            .setFooter({ text: interaction.t("utility/library:FOOTER") })
            .setThumbnail(image);

        // Send the embed as a response
        await interaction.reply({ embeds: [embed] });
    }
}

module.exports = Library;
