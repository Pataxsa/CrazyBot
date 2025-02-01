<h1 align="center">
  <br>
  <a href="https://github.com/0BL1V10N1/CrazyBot"><img src="https://cdn.discordapp.com/app-icons/1288906275349987348/1281ce7a67d52c81b57c5118e87eec6e.png" width="200" alt="CrazyBot"></a>
  <br>
  CrazyBot
  <br>
</h1>

<p align="center">A multipurpose discord bot to help students.</p>

<p align="center">
  <a href="#%EF%B8%8F-build-with">Build with</a> •
  <a href="#-getting-started">Getting started</a> •
  <a href="#-features">Features</a> •
  <a href="#%EF%B8%8F-roadmap">Roadmap</a> •
  <a href="#-resources">Resources</a> •
  <a href="#-contributors">Contributors</a>
</p>

[![Version][version-shield]][version-url]
[![Contributors][contributors-shield]][contributors-url]
[![Forks][forks-shield]][forks-url]
[![Stargazers][stars-shield]][stars-url]
[![Issues][issues-shield]][issues-url]
[![MIT License][license-shield]][license-url]

# 🏗️ Build with

-   [![Discord][Discord.js]][Discord-url]
-   [![Mongoose][Mongoose.com]][Mongoose-url]

# 🚀 Getting started

-   ## 📦 Prerequisites

    -   🖥️ [NodeJS](https://nodejs.org/) (>= 20.17.0)
    -   💾 [Redis](https://redis.io/) (>= 7.4.1)
    -   🗄️ [PostgreSQL](https://www.postgresql.org/) (>= 14.0.0)
    -   🐙 [Git](https://git-scm.com/) (\*)

-   ## ⚙️ Installation

    -   First **clone** the project

        ```bash
        git clone https://github.com/0BL1V10N1/CrazyBot.git
        cd CrazyBot
        ```

    -   Then **install** the dependencies required to run the project

        ```bash
        npm install
        ```

    -   And finally **launch** the project with the command below ! (configure the `.env` file before !)

        ```bash
        npm start
        ```

-   ## 🔧 Configuration

    -   **Rename** the `.env.example` file to `.env`, then **adjust** the following environment variables to match your configuration

        ```bash
        # Bot token
        TOKEN=
        # Mongodb link (example: mongodb://root:root@localhost/crazybot)
        MONGODB=
        # Redis server link (example: redis://default:default@localhost)
        REDIS=
        # OpenWeatherMap Api Key (link: https://openweathermap.org/api)
        WEATHER_API=
        ```

    -   You can also modify the rest of the bot configuration in the **[config.js](./config.js)** file

        ```js
        module.exports = {
          token: process.env.TOKEN,
          postgresql: process.env.POSTGRESQL_DB,
          rediscache: process.env.REDIS_CACHE,
          apis: {
              weather_api: process.env.WEATHER_API
          },
        ...
        ```

# 💡 Features

-   ### 🎓 Student Management

    -   Log in with your username
    -   Check your schedule
    -   Check the availability of a book
    -   View the university restaurant menu
    -   Create temporary voice rooms for group assignments
    -   Receive a reminder of an assignment due
    -   Get current showtimes in cinemas

-   ### 🛠️ Utility

    -   Send a message via the bot
    -   Send an announcement via the bot
    -   See the weather in real time
    -   Translate instantly
    -   Search for an article via Wikipedia
    -   Create tickets on your server

-   ### 🎉 Fun

    -   Play hangman

-   ### 🛡️ Moderation

    -   Delete multiple messages
    -   Purge a channel
    -   Lock a channel

# 🛤️ Roadmap

-   [x] Project Base
    -   [x] Add eslint
    -   [x] Add prettier
    -   [x] Add docker
    -   [x] Add database
-   [x] Commands
    -   [x] Add student management commands
    -   [x] Add utility commands
    -   [x] Add moderation commands
-   [ ] Website
    -   [ ] Front-end
    -   [ ] Back-end
    -   [ ] Dashboard
-   [x] Add multi-language system

# 📎 Resources

-   🌐 [Website](https://crazy-bot.xyz)
-   🤖 [Bot](https://discord.com/oauth2/authorize?client_id=1288906275349987348)
-   ✨ [Support](https://discord.gg/QKzRefhY4e)
-   🐳 [Docker](https://hub.docker.com/r/cvjeticaxel122/crazybot)

# 🤝 Contributors

<a href="https://github.com/0BL1V10N1/CrazyBot/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=0BL1V10N1/CrazyBot" alt="contrib.rocks image" />
</a>

[version-shield]: https://img.shields.io/github/package-json/v/0BL1V10N1/CrazyBot?style=for-the-badge
[version-url]: https://github.com/0BL1V10N1/CrazyBot/releases/latest
[contributors-shield]: https://img.shields.io/github/contributors/0BL1V10N1/CrazyBot.svg?style=for-the-badge
[contributors-url]: https://github.com/0BL1V10N1/CrazyBot/graphs/contributors
[forks-shield]: https://img.shields.io/github/forks/0BL1V10N1/CrazyBot.svg?style=for-the-badge
[forks-url]: https://github.com/0BL1V10N1/CrazyBot/network/members
[stars-shield]: https://img.shields.io/github/stars/0BL1V10N1/CrazyBot.svg?style=for-the-badge
[stars-url]: https://github.com/0BL1V10N1/CrazyBot/stargazers
[issues-shield]: https://img.shields.io/github/issues/0BL1V10N1/CrazyBot.svg?style=for-the-badge
[issues-url]: https://github.com/0BL1V10N1/CrazyBot/issues
[license-shield]: https://img.shields.io/github/license/0BL1V10N1/CrazyBot.svg?style=for-the-badge
[license-url]: https://github.com/0BL1V10N1/CrazyBot/blob/main/LICENSE
[Discord.js]: https://img.shields.io/badge/discord.js-5765F2?style=for-the-badge&logo=discord&logoColor=white
[Discord-url]: https://discord.js.org
[Mongoose.com]: https://img.shields.io/badge/Mongoose-13aa52?style=for-the-badge&logo=Mongodb&logoColor=white
[Mongoose-url]: https://mongoosejs.com
