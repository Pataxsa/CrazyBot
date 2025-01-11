const { ChatInputCommandInteraction, EmbedBuilder, Message, TextChannel } = require("discord.js");
const embedConfig = require("@root/config").embed;

// Modify default embed values
class CustomEmbedBuilder extends EmbedBuilder {
    constructor(data = {}) {
        super(data);
        if (!data.color) this.setColor(embedConfig.color.default);
    }
}

/**
 * Translate the message
 * @param {string} key
 * @param {*} args
 * @returns {string}
 */
ChatInputCommandInteraction.prototype.t = function (key, args) {
    return this.translate(key, args);
};

/**
 * Reply and translate the message
 * @param {string} key
 * @param {*} args
 * @param {{edit: boolean}} options
 * @returns {Message}
 */
ChatInputCommandInteraction.prototype.replyT = function (key, args, options = {}) {
    if (options.edit)
        return this.editReply({
            content: this.translate(key, args),
            ...options
        }).catch(() => {});

    return this.reply({ content: this.translate(key, args), ...options });
};

/**
 * Reply with a error message
 * @param {string} key
 * @param {*} args
 * @param {{edit: boolean}} options
 * @returns {Message}
 */
ChatInputCommandInteraction.prototype.error = function (key, args, options = {}) {
    const embed = new EmbedBuilder().setColor(embedConfig.color.error).setDescription(this.translate(key, args));

    options.embeds = [embed];
    return this.replyT(null, args, options);
};

/**
 * Reply with a success message
 * @param {string} key
 * @param {*} args
 * @param {{edit: boolean}} options
 * @returns {Message}
 */
ChatInputCommandInteraction.prototype.success = function (key, args, options = {}) {
    const embed = new EmbedBuilder().setColor(embedConfig.color.success).setDescription(this.translate(key, args));

    options.embeds = [embed];
    return this.replyT(null, args, options);
};

/**
 * Reply with a loading message
 * @param {string} key
 * @param {*} args
 * @param {{edit: boolean}} options
 * @returns {Message}
 */
ChatInputCommandInteraction.prototype.load = function (key, args, options = {}) {
    const embed = new EmbedBuilder().setColor(embedConfig.color.load).setDescription(this.translate(key, args));

    options.embeds = [embed];
    return this.replyT(null, args, options);
};

/**
 * Edit a reply message and catch errors
 * @param {*} params
 * @returns {Message}
 */
ChatInputCommandInteraction.prototype.editReplyCatch = function (params) {
    return this.editReply(params).catch(() => {});
};

/**
 * Edit a message and catch errors
 * @param {*} params
 * @returns {Message}
 */
Message.prototype.editCatch = function (params) {
    return this.edit(params).catch(() => {});
};

/**
 * Send a error message
 * @param {string} message
 * @returns {Message}
 */
TextChannel.prototype.error = function (message) {
    const embed = new EmbedBuilder().setColor(embedConfig.color.error).setDescription(message);

    return this.send({ embeds: [embed] });
};

/**
 * Send a success message
 * @param {string} message
 * @returns {Message}
 */
TextChannel.prototype.success = function (message) {
    const embed = new EmbedBuilder().setColor(embedConfig.color.success).setDescription(message);

    return this.send({ embeds: [embed] });
};

/**
 * Send a loading message
 * @param {string} message
 * @returns {Message}
 */
TextChannel.prototype.load = function (message) {
    const embed = new EmbedBuilder().setColor(embedConfig.color.load).setDescription(message);

    return this.send({ embeds: [embed] });
};

Object.assign(require("discord.js"), { EmbedBuilder: CustomEmbedBuilder });
