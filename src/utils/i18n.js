const { join } = require("path");
const { IsDirectory, IsFile } = require("@utils/checker");
const { readdirSync } = require("fs");
const i18next = require("i18next");
const Backend = require("i18next-fs-backend");
const { Collection, Locale } = require("discord.js");

/**
 * Load all languages and namespaces
 * @param {string} dir
 * @returns {{languages: string[], namespaces: string[]}}
 */
const loadLanguages = dir => {
    const languages = [];
    const namespaces = new Set();

    for (const lang of readdirSync(dir)) {
        const language_path = join(dir, lang);
        if (!IsDirectory(language_path) || !Object.values(Locale).includes(lang)) continue;

        languages.push(lang);

        for (const category of readdirSync(language_path)) {
            const category_path = join(language_path, category);
            if (!IsDirectory(category_path)) {
                const file = category.split(".")[0];
                namespaces.add(file);
                continue;
            }

            for (let file of readdirSync(category_path)) {
                const filepath = join(category_path, file);
                if (!IsFile(filepath)) continue;

                file = file.split(".")[0];
                const namespace = `${category}/${file}`;

                namespaces.add(namespace);
            }
        }
    }

    return { languages, namespaces: [...namespaces] };
};

/**
 * Language module
 * @param {import("@base/bot")} client
 * @returns {Collection<Locale, i18next.TFunction>}
 */
module.exports = client => {
    const languages_path = join(__dirname, "../../languages");
    const { languages, namespaces } = loadLanguages(languages_path);

    i18next.use(Backend);

    i18next.init({
        initImmediate: false,
        backend: {
            jsonIdent: 2,
            loadPath: join(languages_path, "{{lng}}/{{ns}}.json")
        },
        fallbackLng: client.config.language,
        load: "all",
        interpolation: { escapeValue: false },
        ns: namespaces,
        preload: languages
    });

    return new Collection(languages.map(lang => [lang, i18next.getFixedT(lang)]));
};
