const config = require("@root/config");

class Model {
    #db;
    #model;

    /**
     * Model constructor
     * @param {import("./database")} db
     * @param {string} model
     */
    constructor(db, model) {
        this.#db = db;
        this.#model = model;
    }

    /**
     * Create data from model
     * @param {string} id
     * @param {*} [options={}]
     * @returns {Promise<*>}
     */
    async create(id, options = {}) {
        const modelData = await this.#db[this.#model].create({
            data: { id },
            ...options
        });

        await this.#db.cache.set(`${this.#model}-${id}`, JSON.stringify(modelData), { EX: config.cache.ttl });

        return modelData;
    }

    /**
     * Read data from model
     * @param {string} id
     * @param {*} [options={}]
     * @returns {Promise<*>}
     */
    async read(id, options = {}) {
        let modelData = JSON.parse(await this.#db.cache.get(`${this.#model}-${id}`));
        if (modelData) return modelData;

        modelData = await this.#db[this.#model].findUnique({
            where: { id },
            ...options
        });

        await this.#db.cache.set(`${this.#model}-${id}`, JSON.stringify(modelData), { EX: config.cache.ttl });

        return modelData;
    }

    /**
     * Read all the data from model
     * @param {*} [options={}]
     * @returns {Promise<Array<*>>}
     */
    async readAll(options = {}) {
        let modelDatas;

        const [keys, count] = await Promise.all([
            this.#db.cache.keys(`${this.#model}-*`),
            this.#db[this.#model].count()
        ]);

        if (keys.length !== count) {
            modelDatas = await this.#db[this.#model].findMany();

            const cachePromises = modelDatas.map(modelData => {
                const cacheKey = `${this.#model}-${modelData.id}`;
                return this.#db.cache.exists(cacheKey).then(exists => {
                    if (!exists) {
                        return this.#db.cache.set(cacheKey, JSON.stringify(modelData), {
                            EX: config.cache.ttl
                        });
                    }
                });
            });

            await Promise.all(cachePromises);
            return modelDatas;
        }

        const readPromises = keys.map(key => {
            const id = key.split("-")[1];
            return this.read(id, options);
        });

        modelDatas = await Promise.all(readPromises);
        return modelDatas;
    }

    /**
     * Update data from model
     * @param {string} id
     * @param {*} data
     * @returns {Promise<void>}
     */
    async update(id, data) {
        await this.#db.cache.set(`${this.#model}-${id}`, JSON.stringify(data), { EX: config.cache.ttl });

        await this.#db[this.#model]
            .update({
                data,
                where: { id }
            })
            .catch(() => {});
    }

    /**
     * Delete data from model
     * @param {string} id
     * @returns {Promise<void>}
     */
    async delete(id) {
        await this.#db.cache.del(`${this.#model}-${id}`);

        await this.#db[this.#model]
            .delete({
                where: { id }
            })
            .catch(() => {});
    }
}

module.exports = Model;
