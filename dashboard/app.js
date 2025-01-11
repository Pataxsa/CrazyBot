// TODO: IN BETA

const fs = require("fs/promises");
const express = require("express");
const { blue } = require("chalk");

/**
 * Load the dashboard
 * @param {import("@base/bot")} client
 * @returns {Promise<void>}
 */
const load = async client => {
    // Constants
    const isProduction = process.env.NODE_ENV === "production";
    const port = 2748;
    const base = process.env.BASE || "/";

    // Cached production assets
    const templateHtml = isProduction ? await fs.readFile("./dist/client/index.html", "utf-8") : "";

    // Create http server
    const app = express();

    // Add Vite or respective production middlewares
    /** @type {import('vite').ViteDevServer | undefined} */
    let vite;
    if (!isProduction) {
        const { createServer } = await import("vite");
        vite = await createServer({
            configFile: "./dashboard/vite.config.mjs",
            server: { middlewareMode: true },
            appType: "custom",
            base
        });
        app.use((req, res, next) => {
            req.client = client;

            vite.middlewares(req, res, next);
        });
    } else {
        const compression = (await import("compression")).default;
        const sirv = (await import("sirv")).default;
        app.use(compression());
        app.use(base, sirv("./dist/client", { extensions: [] }));
    }

    // Serve HTML
    app.use("*", async (req, res) => {
        try {
            const url = req.originalUrl.replace(base, "");

            /** @type {string} */
            let template,
                /** @type {import('./src/entry-server.js').render} */
                render;
            if (!isProduction) {
                // Always read fresh template in development
                template = await fs.readFile("./dashboard/index.html", "utf-8");
                template = await vite.transformIndexHtml(url, template);
                render = (await vite.ssrLoadModule("./dashboard/src/entry-server.jsx")).render;
            } else {
                template = templateHtml;
                render = (await import("./dist/server/entry-server.mjs")).render;
            }

            const rendered = await render(url);

            const html = template
                .replace(`<!--app-head-->`, rendered.head ?? "")
                .replace(`<!--app-html-->`, rendered.html ?? "");

            res.status(200).set({ "Content-Type": "text/html" }).send(html);
        } catch (e) {
            vite?.ssrFixStacktrace(e);
            console.log(e.stack);
            res.status(500).end(e.stack);
        }
    });

    // Start http server
    app.listen(port, () => {
        console.log(blue(`🚀 Dashboard launched on http://localhost:${port}`));
    });
};

module.exports = { load };
