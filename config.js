const { ActivityType, PresenceUpdateStatus, Colors, Locale } = require("discord.js");

module.exports = {
    token: process.env.TOKEN,
    mongodb: process.env.MONGODB,
    redis: process.env.REDIS,
    apis: {
        weather_api: process.env.WEATHER_API
    },
    language: Locale.EnglishUS, // Default language used
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
        github: "https://github.com/0BL1V10N1/CrazyBot",
        logs: "" // Id of the log channel (leave blank if you don't want this option)
    }
};
