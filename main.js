require("dotenv").config({ override: true }); // Import .env file
require("module-alias/register"); // Register aliases from package.json
require("@utils/extenders"); // Register extenders

const Bot = require("@base/bot");
const Database = require("@base/database");
const { checkConfig, IsDirectory, IsFile } = require("@utils/checker");
const fs = require("fs/promises");
const { blue, cyan, red } = require("chalk");

const client = new Bot();

const init = async () => {
    checkConfig(); // Verify config

    // ======================
    //      COMMANDS
    // ======================
    const commandsdir = await fs.readdir("./src/commands/");
    console.log(cyan(`⏳ Loaded ${blue(commandsdir.length)} categories.`));
    for (const categorydir of commandsdir) {
        if (!IsDirectory(`./src/commands/${categorydir}`)) continue;
        const commands = (await fs.readdir(`./src/commands/${categorydir}/`))
            .filter(cmd => cmd.endsWith(".js"))
            .map(cmd => cmd.split(".")[0]);
        for (const commandName of commands) {
            if (!IsFile(`./src/commands/${categorydir}/${commandName}.js`)) continue;
            client.loadCommand(`./commands/${categorydir}`, commandName);
        }
    }

    // ======================
    //       EVENTS
    // ======================
    const eventsFiles = (await fs.readdir("./src/events/"))
        .filter(event => event.endsWith(".js"))
        .map(event => event.split(".")[0]);
    console.log(cyan(`⏳ Loaded ${blue(eventsFiles.length)} events.`));
    for (const eventName of eventsFiles) {
        if (!IsFile(`./src/events/${eventName}.js`)) continue;
        client.loadEvent(`./events`, eventName);
    }

    // ======================
    //      DATABASE
    // ======================
    await Database.connect(); // Connection to database + redis server

    // Login the bot
    client.login(client.config.token);
};

init();

process.on("unhandledRejection", err => {
    if (client.isReady()) client.sendLog(`❌ An unexpected error occured. \`\`\`js\n${err.stack}\`\`\``, "error");
    console.log(red("❌ Unexpected error:"), err);
}); // Handle any errors
