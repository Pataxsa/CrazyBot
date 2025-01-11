<h1 align="center">
  <br>
  <a href="https://github.com/Pataxsa/CrazyBot"><img src="https://cdn.discordapp.com/app-icons/1288906275349987348/1281ce7a67d52c81b57c5118e87eec6e.png" width="200" alt="CrazyBot"></a>
  <br>
  CrazyBot
  <br>
</h1>

<p align="center">A multipurpose discord bot to help students.</p>

<p align="center">
  <a href="#🏗️-build-with">Build with</a> •
  <a href="#🚀-getting-started">Getting started</a> •
  <a href="#💡-features">Features</a> •
  <a href="#🛤️-roadmap">Roadmap</a> •
  <a href="#📎-resources">Resources</a> •
  <a href="#🤝-contributors">Contributors</a>
</p>

[![Version][version-shield]][version-url]
[![Contributors][contributors-shield]][contributors-url]
[![Forks][forks-shield]][forks-url]
[![Stargazers][stars-shield]][stars-url]
[![Issues][issues-shield]][issues-url]
[![MIT License][license-shield]][license-url]

# 🏗️ Build with

-   <a href="https://discord.js.org" target="_blank"><img src="https://img.shields.io/badge/discord.js-5765F2?style=for-the-badge&logo=discord&logoColor=white" /></a>
-   <a href="https://www.prisma.io" target="_blank"><img src="https://img.shields.io/badge/Prisma-3982CE?style=for-the-badge&logo=Prisma&logoColor=white" /></a>
-   <a href="https://vite.dev" target="_blank"><img src="https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=Vite&logoColor=white" /></a>
-   <a href="https://react.dev" target="_blank"><img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" /></a>
-   <a href="https://tailwindcss.com" target="_blank"><img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" /></a>

# 🚀 Getting started

-   ## 📦 Prerequisites

    -   🖥️ [NodeJS](https://nodejs.org/) (>= 20.17.0)
    -   💾 [Redis](https://redis.io/) (>= 7.4.1)
    -   🗄️ [PostgreSQL](https://www.postgresql.org/) (>= 14.0.0)
    -   🐙 [Git](https://git-scm.com/) (\*)

-   ## ⚙️ Installation

    -   First **clone** the project

        ```bash
        git clone https://gitlab.univ-lr.fr/projets-l2-2024/les-crazy/CrazyBot.git
        cd CrazyBot
        ```

    -   Then **install** the dependencies required to run the project

        ```bash
        npm install
        ```

    -   **Import** the sql file **[DB.sql](./DB.sql)** into your Postgres database

    -   And finally **launch** the project with the command below ! (configure the `.env` file before !)

        ```bash
        npm start
        ```

-   ## 🔧 Configuration

    -   **Rename** the `.env.example` file to `.env`, then **adjust** the following environment variables to match your configuration

        ```bash
        # Bot token
        TOKEN=
        # Postgresql link (example: postgresql://root:root@localhost/db)
        # For Docker use "postgresql://root:root@bot-db/crazybot"
        POSTGRESQL_DB=
        # Redis server link (example: redis://default:default@127.0.0.1:6379)
        REDIS_CACHE=
        # OpenWeatherMap Api Key (link: https://openweathermap.org/api)
        WEATHER_API=
        ```

    -   You can also modify the rest of the bot configuration in the **[config.js](./config.js)** file

        ```js
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
        ...
        ```

# 💡 Features

-   ### 🌐 Website

    -   A website linked to the bot
    -   A website containing complete documentation

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
    -   Use generative AI thanks to a prompt

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

<a href="https://github.com/Pataxsa/CrazyBot/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=Pataxsa/CrazyBot" alt="contrib.rocks image" />
</a>

[version-shield]: https://img.shields.io/github/package-json/v/Pataxsa/CrazyBot?style=for-the-badge
[version-url]: https://github.com/Pataxsa/CrazyBot/releases/latest
[contributors-shield]: https://img.shields.io/github/contributors/Pataxsa/CrazyBot.svg?style=for-the-badge
[contributors-url]: https://github.com/Pataxsa/CrazyBot/graphs/contributors
[forks-shield]: https://img.shields.io/github/forks/Pataxsa/CrazyBot.svg?style=for-the-badge
[forks-url]: https://github.com/Pataxsa/CrazyBot/network/members
[stars-shield]: https://img.shields.io/github/stars/Pataxsa/CrazyBot.svg?style=for-the-badge
[stars-url]: https://github.com/Pataxsa/CrazyBot/stargazers
[issues-shield]: https://img.shields.io/github/issues/Pataxsa/CrazyBot.svg?style=for-the-badge
[issues-url]: https://github.com/Pataxsa/CrazyBot/issues
[license-shield]: https://img.shields.io/github/license/Pataxsa/CrazyBot.svg?style=for-the-badge
[license-url]: https://github.com/Pataxsa/CrazyBot/blob/main/LICENSE.txt
