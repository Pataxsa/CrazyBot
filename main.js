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
    const DB = new Database();
    await DB.connect(); // Connection to database + redis server
    client.db = DB.models; // Send all the models to the client

    // Login the bot
    client.login(client.config.token);
};

init();

process.on("unhandledRejection", error => {
    if (client.isReady()) client.sendLog(`❌ Unexpected error: ${error}`, "error");
    console.log(red("❌ Unexpected error:"), error);
}); // Handle any errors
