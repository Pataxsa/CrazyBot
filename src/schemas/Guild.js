const mongoose = require("mongoose");
const { cache } = require("@base/database");

const modelName = "Guild";

const Schema = new mongoose.Schema(
    {
        id: { type: String, unique: true, required: true },
        temp_channels: Array
    },
    { versionKey: false }
);

Schema.pre("save", function (next) {
    cache.set(`${modelName}:${this.id}`, JSON.stringify(this.toJSON()));

    next();
});

const Model = mongoose.model(modelName, Schema);

/**
 * Get guild data
 * @param {string} id
 * @returns {*}
 */
const getGuild = async id => {
    let guildData = JSON.parse(await cache.get(`${Model.modelName}:${id}`));
    if (guildData) return Model.hydrate(guildData);

    guildData = await Model.findOne({ id });
    if (!guildData) guildData = await Model.create({ id });

    cache.set(`${Model.modelName}:${id}`, JSON.stringify(guildData.toJSON()));

    return guildData;
};

module.exports = { getGuild };
