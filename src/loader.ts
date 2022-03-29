import { bedrockServer } from "bdsx/launcher";
import { logger } from "./api/api_help";
import { LL_CONFIG_PATH, LL_DIR, LL_MODULE_TYPE, LL_VERSION } from "./constants";
import "./debug";
import { RegisterBuiltinCommands } from "./hot_manage";
import { LLSEPlugin } from "./plugin";
import fs = require("fs");
import path = require("path");
import INI = require("ini");
// const { lua, lualib, lauxlib } = require("fengari");

logger.info(`LXL for ${LL_MODULE_TYPE} loaded`);
logger.info(`Version ${LL_VERSION}`);

logger.info(`Loading plugins...`);

export let iniConf = {
    Main: {
        Language: "zh_CN",
        LxlLogLevel: 4,
        PluginsDir: "./plugins",
        DependsDir: "./plugins/lib",
    },
    Modules: {
        BuiltInUnlockCmd: true,
    }
}

try {
    fs.mkdirSync(path.join(process.cwd(), LL_DIR), {recursive: true});
    iniConf = INI.parse(fs.readFileSync(path.join(process.cwd(), LL_CONFIG_PATH), "utf8")) as any;
} catch {
    fs.writeFileSync(path.join(process.cwd(), LL_CONFIG_PATH), INI.stringify(iniConf));
}

fs.readdir(path.join(process.cwd(), iniConf.Main.PluginsDir), {}, (err, files) => {
    let count = 0;
    for (const file of files as string[]) {
        if (path.extname(file) === ".js") {
            try {
                const code = fs.readFileSync(path.join(process.cwd(), iniConf.Main.PluginsDir, file), "utf8");
                const plugin = new LLSEPlugin(file, "js");
                plugin.load();
                if (plugin.run(code).success) {
                    logger.info(`${file} loaded.`);
                    count++;
                }
            } catch { }
        }
    }
    logger.info(`${count} ${LL_MODULE_TYPE} plugins loaded in all.`);
});

bedrockServer.afterOpen().then(() => {
    RegisterBuiltinCommands();
});