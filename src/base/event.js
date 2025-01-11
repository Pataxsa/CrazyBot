class Event {
    /**
     * Event constructor
     * @param {import("./bot")} client
     */
    constructor(client, { eventName = null, once = false }) {
        this.client = client;
        this.eventName = eventName;
        this.once = once;
    }

    /**
     * Execute the event
     * @param {...*} args
     * @returns {Promise<void>}
     */
    async execute(...args) {
        throw Error("Not implemented");
    }
}

module.exports = Event;
