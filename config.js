const { ActivityType, PresenceUpdateStatus, Colors } = require("discord.js");

module.exports = {
    token: process.env.TOKEN,
    postgresql: process.env.POSTGRESQL_DB,
    rediscache: process.env.REDIS_CACHE,
    ollama: {
        host: "0.0.0.0:11434", // Ollama host
        model: "llama3.2-vision:11b" // AI Model
    },
    apis: {
        weather_api: process.env.WEATHER_API
    },
    dashboard: {
        enabled: true,
        port: 2748
    },
    default_lang: "en-US",
    owners: ["992847036632268880", "391517248386236440", "775654147763601408", "548462018508881920"], // Owners id
    guilds: ["1164550021497241630"], // Guilds id for restricted commands
    presencestatus: {
        presence: [
            {
                activity: {
                    name: "{users} users !",
                    type: ActivityType.Watching
                },
                status: PresenceUpdateStatus.Online
            },
            {
                activity: {
                    name: "{servers} servers !",
                    type: ActivityType.Watching
                },
                status: PresenceUpdateStatus.Online
            }
        ],
        duration: 10_000
    },
    embed: {
        color: {
            error: Colors.Red,
            success: Colors.Green,
            load: Colors.Blue,
            default: "#262136"
        },
        footer: "Les Crazy"
    },
    cache: {
        ttl: 3 * 24 * 60 * 60 // 3 days
    },
    support: {
        link: "https://discord.gg/QKzRefhY4e",
        github: "https://gitlab.univ-lr.fr/projets-l2-2024/les-crazy/CrazyBot",
        logs: "1301173553730818089" // Id of the log channel (leave blank if you don't want this option)
    }
};
