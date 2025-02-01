const mongoose = require("mongoose");
const { cache } = require("@base/database");

const modelName = "User";

const Schema = new mongoose.Schema(
    {
        id: { type: String, unique: true, required: true },
        login: String,
        reminders: Array
    },
    { versionKey: false }
);

Schema.pre("save", function (next) {
    cache.set(`${modelName}:${this.id}`, JSON.stringify(this.toJSON()));

    next();
});

const Model = mongoose.model(modelName, Schema);

/**
 * Get user data
 * @param {string} id
 * @returns {*}
 */
const getUser = async id => {
    let userData = JSON.parse(await cache.get(`${Model.modelName}:${id}`));
    if (userData) return Model.hydrate(userData);

    userData = await Model.findOne({ id });
    if (!userData) userData = await Model.create({ id });

    cache.set(`${Model.modelName}:${id}`, JSON.stringify(userData.toJSON()));

    return userData;
};

/**
 * Get all users data
 * @param {*} query
 * @param {{size?: number, lean?: boolean}} options
 * @yields {string}
 * @returns {Promise<AsyncGenerator>}
 */
const getAllUsers = async function* (query, options = { size: 1000 }) {
    let lastId = null;

    while (true) {
        const newQuery = lastId ? { ...query, _id: { $gt: lastId } } : query;

        const documents = options?.lean
            ? await Model.find(newQuery).sort({ _id: 1 }).limit(options.size).lean()
            : await Model.find(newQuery).sort({ _id: 1 }).limit(options.size);

        if (documents.length === 0) return [];

        lastId = documents[documents.length - 1]._id;

        yield documents;
    }
};

module.exports = { getUser, getAllUsers };
