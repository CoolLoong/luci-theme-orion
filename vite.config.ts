import tailwindcss from "@tailwindcss/vite";
import { cpSync } from "fs";
import { mkdir, readFile, writeFile } from "fs/promises";
import { dirname, join, resolve } from "path";
import type { AtRule, Container } from "postcss";
import { minify as terserMinify } from "terser";
import { defineConfig, loadEnv, Plugin, ResolvedConfig } from "vite";

const CURRENT_DIR = process.cwd();
const BUILD_OUTPUT = resolve(CURRENT_DIR, "htdocs/luci-static");

function createLuciJsCompressPlugin(): Plugin {
  let outDir: string;

  return {
    name: "luci-js-compress",
    apply: "build",

    configResolved(config: ResolvedConfig) {
      outDir = config.build.outDir;
    },

    async closeBundle() {
      const jsFiles = [
        { src: "src/menu-orion.js", dest: "resources/menu-orion.js" },
        { src: "src/orion.js", dest: "orion/resources/js/orion.js" },
      ];

      for (const { src, dest } of jsFiles) {
        try {
          const filePath = resolve(CURRENT_DIR, src);
          const sourceCode = await readFile(filePath, "utf-8");
          const compressed = await terserMinify(sourceCode, {
            parse: { bare_returns: true },
            compress: false,
            mangle: false,
            format: { comments: false, beautify: false },
          });

          const outputPath = join(outDir, dest);
          await mkdir(dirname(outputPath), { recursive: true });
          await writeFile(outputPath, compressed.code || sourceCode, "utf-8");
        } catch (error: any) {
          console.error(`JS compress failed: ${src}`, error?.message);
        }
      }
    },
  };
}

function createStaticAssetsCopyPlugin(): Plugin {
  return {
    name: "copy-static-assets",
    apply: "build",

    async closeBundle() {
      const publicDir = resolve(CURRENT_DIR, "public");
      const targetDir = resolve(BUILD_OUTPUT, "orion/resources");

      try {
        cpSync(publicDir, targetDir, {
          recursive: true,
          force: true,
        });
        console.log(`✓ Copied static assets from public/ to htdocs/luci-static/orion/resources/`);
      } catch (error: any) {
        console.error(`Failed to copy static assets:`, error?.message);
      }
    },
  };
}

function createRedirectPlugin(): Plugin {
  return {
    name: "redirect-plugin",
    apply: "serve",

    configureServer(server) {
      // Watch menu-orion.js (LuCI module) and trigger full reload on change
      const menuOrionJs = resolve(CURRENT_DIR, "src/menu-orion.js");
      server.watcher.add(menuOrionJs);
      server.watcher.on("change", (file) => {
        if (file === menuOrionJs) {
          console.log(`[menu-orion.js] changed, reloading...`);
          server.ws.send({ type: "full-reload", path: "*" });
        }
      });

      // Intercept HMR updates and rewrite paths to match what browser actually loads
      server.ws.on("connection", (socket) => {
        const originalSend = socket.send.bind(socket);
        socket.send = function (data: any, ...args: any[]) {
          if (typeof data === "string") {
            try {
              const message = JSON.parse(data);
              if (message.type === "update") {
                message.updates = message.updates?.map((update: any) => {
                  // Rewrite CSS path: /src/main.css* -> /luci-static/orion/orion.css*
                  if (update.path && update.path.startsWith("/src/main.css")) {
                    const query = update.path.includes("?") ? update.path.split("?")[1] : "";
                    return {
                      ...update,
                      path: `/luci-static/orion/orion.css${query ? "?" + query : ""}`
                    };
                  }
                  return update;
                });
                data = JSON.stringify(message);
              }
            } catch (ignored) { }
          }
          return originalSend(data, ...args);
        };
      });

      server.middlewares.use(async (req, res, next) => {
        if (req.url === "/" || req.url === "/index.html") {
          res.writeHead(302, { Location: "/cgi-bin/luci" });
          res.end();
          return;
        }

        // Inject Vite client into HTML responses for HMR
        if (req.url?.startsWith("/cgi-bin/luci")) {
          const originalWrite = res.write.bind(res);
          const originalEnd = res.end.bind(res);
          const chunks: Buffer[] = [];
          res.write = function (chunk: any): boolean {
            chunks.push(Buffer.from(chunk));
            return true;
          };
          res.end = function (chunk?: any, ...args: any[]): any {
            if (chunk) chunks.push(Buffer.from(chunk));
            let html = Buffer.concat(chunks).toString("utf8");
            // Inject Vite client script before </head>
            if (html.includes("</head>")) {
              html = html.replace(
                "</head>",
                '<script type="module" src="/@vite/client"></script></head>'
              );
            }
            res.write = originalWrite;
            res.end = originalEnd;
            return originalEnd(html, ...args);
          };
        }

        // Serve LuCI JS files as raw files without transformation
        if (req.url === "/src/menu-orion.js") {
          const filePath = resolve(CURRENT_DIR, req.url.slice(1));
          try {
            const content = await readFile(filePath, "utf-8");
            res.setHeader("Content-Type", "application/javascript");
            res.setHeader("Cache-Control", "no-cache");
            res.end(content);
            return;
          } catch (ignored) {}
        }

        next();
      });
    },
  };
}

function createSuppressWarningsPlugin(): Plugin {
  return {
    name: "suppress-resource-warnings",
    apply: "build",

    configResolved(config) {
      const originalWarn = config.logger.warn;
      config.logger.warnOnce = (msg, options) => {
        // Suppress warnings about resources that will be copied by our custom plugins
        if (
          typeof msg === "string" &&
          msg.includes("didn't resolve at build time") &&
          msg.includes("resources/")
        ) {
          return;
        }
        originalWarn(msg, options);
      };
    },
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, CURRENT_DIR, "");
  const OPENWRT_HOST = env.VITE_OPENWRT_HOST || "http://192.168.4.1";
  const DEV_HOST = env.VITE_DEV_HOST || "127.0.0.1";
  const DEV_PORT = Number(env.VITE_DEV_PORT) || 5173;

  const proxyConfig = {
    "/luci-static/orion/orion.css": {
      target: `http://localhost:${DEV_PORT}`,
      changeOrigin: true,
      rewrite: (_path: string) => "/src/main.css",
    },

    "/luci-static/resources/menu-orion.js": {
      target: `http://localhost:${DEV_PORT}`,
      changeOrigin: true,
      rewrite: (_path: string) => "/src/menu-orion.js",
    },

    "/luci-static/orion/resources/js/orion.js": {
      target: `http://localhost:${DEV_PORT}`,
      changeOrigin: true,
      rewrite: (_path: string) => "/src/orion.js",
    },

    "/luci-static/orion/resources": {
      target: `http://localhost:${DEV_PORT}`,
      changeOrigin: true,
      rewrite: (path: string) => {
        return path.replace("/luci-static/orion/resources", "/public");
      },
    },

    "/luci-static": {
      target: OPENWRT_HOST,
      changeOrigin: true,
      secure: false,
    },

    "/cgi-bin": {
      target: OPENWRT_HOST,
      changeOrigin: true,
      secure: false,
    },
  } as const;

  const aliasConfig = {
    "@": resolve(CURRENT_DIR, "src"),
  } as const;

  return {
    plugins: [
      tailwindcss(),
      createLuciJsCompressPlugin(),
      createStaticAssetsCopyPlugin(),
      createRedirectPlugin(),
      createSuppressWarningsPlugin(),
    ],

    css: {
      postcss: {
        plugins: [
          {
            postcssPlugin: "remove-layers",
            Once(root) {
              function removeLayers(node: Container) {
                node.walkAtRules("layer", (rule: AtRule) => {
                  removeLayers(rule);
                  rule.replaceWith(rule.nodes);
                });
              }
              removeLayers(root);
            },
          },
        ],
      },
      devSourcemap: true,
    },

    publicDir: false, // Disable default public directory copying to avoid duplication

    build: {
      outDir: BUILD_OUTPUT,
      emptyOutDir: false,
      cssMinify: "lightningcss",
      rollupOptions: {
        input: {
          main: resolve(CURRENT_DIR, "src/main.css"),
        },
        output: {
          assetFileNames: (assetInfo) => {
            const fileName = assetInfo.names?.[0] ?? "";
            if (fileName === "main.css") {
              return "orion/orion.css";
            }
            return "orion/[name].[ext]";
          },
        },
      },
    },

    server: {
      host: DEV_HOST,
      port: DEV_PORT,
      proxy: proxyConfig,
    },

    resolve: {
      alias: aliasConfig,
    },
  };
});
