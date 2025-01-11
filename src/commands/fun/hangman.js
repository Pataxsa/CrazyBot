const Command = require("@base/command");
const {
    ChatInputCommandInteraction,
    EmbedBuilder,
    Colors,
    InteractionContextType,
    PermissionFlagsBits
} = require("discord.js");

class Hangman extends Command {
    constructor(client) {
        super(client, {
            name: "hangman",
            description: "Play hangman with your friends.",
            dirname: __dirname,
            enabled: true,
            cooldown: 3000,
            contexts: [InteractionContextType.Guild],
            restricted: false,
            NSFW: false,
            memberPermissions: null,
            botPermissions: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.ManageMessages]
        });

        this.config.data.addStringOption(option =>
            option
                .setName("expression")
                .setDescription("Enter a word or phrase to guess for the game.")
                .setRequired(true)
        );
    }

    /**
     * Execute the command
     * @param {ChatInputCommandInteraction} interaction
     * @returns {Promise<void>}
     */
    async execute(interaction) {
        const word = this.#handleSpaces(interaction.options.getString("expression"));
        const maxAttempts = 8;
        const attempts = { count: 0 };
        const guessedLetters = [];
        const displayWord = this.#initializeDisplayWord(word);

        const embed = this.#createEmbed(interaction, displayWord, guessedLetters, maxAttempts, attempts.count);
        const reply = await interaction.reply({ embeds: [embed], fetchReply: true });

        const collector = this.#createMessageCollector(interaction.channel);

        collector.on("collect", async message => {
            if (message.author.bot) return;

            const input = message.content.trim().toLowerCase().replace(/\s+/g, "-");

            if (input === word) {
                await this.#handleWin(interaction, embed, collector, word);
                await message.delete();
                return;
            }

            if (!this.#isValidInput(input)) {
                await this.#handleInvalidInput(interaction, message);
                return;
            }

            const letter = input[0];
            if (this.#isDuplicateGuess(letter, guessedLetters)) {
                await this.#handleDuplicateGuess(interaction, message);
                return;
            }

            await message.delete();

            await this.#processGuess({
                interaction,
                letter,
                word,
                guessedLetters,
                displayWord,
                attempts,
                embed,
                reply,
                collector,
                maxAttempts
            });
        });

        collector.on("end", async (_, reason) => {
            await this.#handleGameEnd(interaction, embed, word, reason);
        });
    }

    #handleSpaces(expression) {
        return expression.toLowerCase().replace(/\s+/g, "-");
    }

    #initializeDisplayWord(word) {
        return word.split("").map(char => (char === "-" ? "- " : "\\_ "));
    }

    #createEmbed(interaction, displayWord, guessedLetters, maxAttempts, attempts) {
        return new EmbedBuilder()
            .setColor(Colors.Blue)
            .setTitle(interaction.t("fun/hangman:GAME_TITLE"))
            .setDescription(this.#generateEmbedContent(interaction, displayWord, guessedLetters, maxAttempts, attempts))
            .setFooter({ text: interaction.t("fun/hangman:FOOTER") });
    }

    #createMessageCollector(channel) {
        return channel.createMessageCollector({ time: 600_000 }); // 10 minutes
    }

    #isValidInput(content) {
        return /^[a-zA-Z-]+$/.test(content);
    }

    async #handleInvalidInput(interaction, message) {
        await message.reply(interaction.t("fun/hangman:INVALID_INPUT")).then(msg => {
            setTimeout(() => msg.delete(), 5000);
        });
        await message.delete();
    }

    #isDuplicateGuess(letter, guessedLetters) {
        return guessedLetters.includes(letter);
    }

    async #handleDuplicateGuess(interaction, message) {
        await message.reply(interaction.t("fun/hangman:DUPLICATE_GUESS")).then(msg => {
            setTimeout(() => msg.delete(), 5000);
        });
        await message.delete();
    }

    async #processGuess({
        interaction,
        letter,
        word,
        guessedLetters,
        displayWord,
        attempts,
        embed,
        reply,
        collector,
        maxAttempts
    }) {
        guessedLetters.push(letter);

        if (word.includes(letter)) {
            this.#revealLetterInWord(letter, word, displayWord);
        } else {
            attempts.count++;
        }

        embed.setDescription(
            this.#generateEmbedContent(interaction, displayWord, guessedLetters, maxAttempts, attempts.count)
        );

        if (this.#isWin(displayWord)) {
            this.#handleWin(interaction, embed, collector, word);
        } else if (this.#isLoss(attempts.count, maxAttempts)) {
            this.#handleLoss(interaction, embed, word, collector);
        }

        await reply.edit({ embeds: [embed] });
    }

    #revealLetterInWord(letter, word, displayWord) {
        for (let i = 0; i < word.length; i++) {
            if (word[i] === letter) displayWord[i] = letter;
        }
    }

    #isWin(displayWord) {
        return !displayWord.includes("\\_ ");
    }

    #isLoss(attempts, maxAttempts) {
        return attempts >= maxAttempts;
    }

    async #handleWin(interaction, embed, collector, word) {
        embed
            .setTitle(interaction.t("fun/hangman:YOU_WIN"))
            .setColor(Colors.Green)
            .setDescription(interaction.t("fun/hangman:WIN_DESCRIPTION", { word: word.replace(/-/g, " ") }));
        collector.stop("win");
    }

    async #handleLoss(interaction, embed, word, collector) {
        embed
            .setTitle(interaction.t("fun/hangman:YOU_LOST"))
            .setDescription(interaction.t("fun/hangman:LOSS_DESCRIPTION", { word: word.replace(/-/g, " ") }))
            .setColor(Colors.Red);
        collector.stop("loss");
    }

    async #handleGameEnd(interaction, embed, word, reason) {
        if (reason === "time") {
            embed
                .setTitle(interaction.t("fun/hangman:TIME_UP"))
                .setDescription(interaction.t("fun/hangman:TIME_UP_DESCRIPTION", { word: word.replace(/-/g, " ") }))
                .setColor(Colors.Orange);
        }
        await interaction.editReply({ embeds: [embed], components: [] }).catch(() => {});
    }

    #generateEmbedContent(interaction, displayWord, guessedLetters, maxAttempts, attempts) {
        return (
            `${interaction.t("fun/hangman:WORD_TO_GUESS")}: **${displayWord.join(" ")}**\n` +
            `${interaction.t("fun/hangman:GUESS_LETTERS")}: ${guessedLetters.length > 0 ? guessedLetters.join(", ") : interaction.t("fun/hangman:NO_GUESSES")}\n` +
            `${interaction.t("fun/hangman:REMAINING_ATTEMPTS")}: ${maxAttempts - attempts}`
        );
    }
}

module.exports = Hangman;
