const Model = require("@base/model");

class UserModel extends Model {
    constructor(db) {
        super(db, "users");
    }

    /**
     * Find or create a user in the database
     * @param {string} id
     * @returns {Promise<{id: string, login: string}>}
     */
    async findOrCreate(id) {
        let userData = await this.read(id);
        if (!userData) userData = await this.create(id);

        return userData;
    }
}

module.exports = UserModel;
