import { bedrockServer } from "bdsx/launcher";
import { logger } from "./api/api_help";
import { LXL_CONFIG_PATH, LXL_DIR, LXL_MODULE_TYPE, LXL_VERSION } from "./constants";
import "./debug";
import { RegisterBuiltinCommands } from "./hot_manage";
import { LXLPlugin } from "./plugin";
import fs = require("fs");
import path = require("path");
import INI = require("ini");

logger.info(`LXL for ${LXL_MODULE_TYPE} loaded`);
logger.info(`Version ${LXL_VERSION}`);

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
    fs.mkdirSync(path.join(process.cwd(), LXL_DIR), {recursive: true});
    iniConf = INI.parse(fs.readFileSync(path.join(process.cwd(), LXL_CONFIG_PATH), "utf8")) as any;
} catch {
    fs.writeFileSync(path.join(process.cwd(), LXL_CONFIG_PATH), INI.stringify(iniConf));
}

fs.readdir(path.join(process.cwd(), iniConf.Main.PluginsDir), {}, (err, files) => {
    let count = 0;
    for (const file of files as string[]) {
        if (path.extname(file) === ".js") {
            try {
                const code = fs.readFileSync(path.join(process.cwd(), iniConf.Main.PluginsDir, file), "utf8");
                const plugin = new LXLPlugin(file, "js");
                plugin.load();
                if (plugin.run(code).success) {
                    logger.info(`${file} loaded.`);
                    count++;
                }
            } catch { }
        }
    }
    logger.info(`${count} ${LXL_MODULE_TYPE} plugins loaded in all.`);
});

bedrockServer.afterOpen().then(() => {
    RegisterBuiltinCommands();
});