import { CommandFilePath, CommandPermissionLevel } from "bdsx/bds/command";
import { command } from "bdsx/command";
import { CxxString } from "bdsx/nativetype";
import { logger, pluginList, TODO } from "./api/api_help";
import { LXL_SCRIPT_LANG_TYPE, LXL_VERSION_MAJOR, LXL_VERSION_MINOR, LXL_VERSION_REVISION } from "./constants";
import { LXLPlugin } from "./plugin";
import fs = require("fs");
import path = require("path");

export function RegisterBuiltinCommands() {
    command.register("lxl", "LXL Hot Manager", CommandPermissionLevel.Admin, 0, 0x80)
    .overload((params, origin, output) => {
        logger.info(`LiteXLoader-${LXL_SCRIPT_LANG_TYPE} v${LXL_VERSION_MAJOR}.${LXL_VERSION_MINOR}.${LXL_VERSION_REVISION}`);
        output.success();
    }, { operation: command.enum("lxl.version", "version") })
    .overload((params, origin, output) => {
        logger.info(`=== LiteXLoader-${LXL_SCRIPT_LANG_TYPE} Plugins ===`);
        for (const {pluginName} of pluginList) {
            logger.info(`${pluginName}`);
        }
        output.success();
    }, { operation: command.enum("lxl.list", "list") })
    .overload((params, origin, output) => {
        if (params.flags === "force") {
            TODO("lxlcommand_update_force")();
        }
        TODO("lxlcommand_update")();
    }, { operation: command.enum("lxl.update", "update"), flags: [CxxString, true] })
    .overload((params, origin, output) => {
        const filepath = path.join(process.cwd(), params.name.text);
        if (fs.existsSync(filepath)) {
            const code = fs.readFileSync(filepath, "utf8");
            const name = path.basename(filepath);
            const plugin = new LXLPlugin(name);
            plugin.load();
            plugin.isHot = true;
            if (plugin.run(code).success) {
                logger.info(`${name} loaded.`);
                return;
            }
        } else {
            logger.error(`Plugin no found! Check the path you input again.`);
        }
        logger.error(`Fail to load any plugin named <${params.name.text}> !`);
    }, { operation: command.enum("lxl.load", "load"), name: CommandFilePath })
    .overload((params, origin, output) => {
        for (const plugin of pluginList) {
            if (plugin.pluginName === params.name.text) {
                plugin.unload();
                logger.info(`${plugin.pluginName} unloaded.`);
                return;
            }
        }
        logger.error(`Fail to unload any plugin at <${params.name.text}>!`);
        logger.error(`Use command "lxl list" to show plugins loaded currently.`);
    }, { operation: command.enum("lxl.unload", "unload"), name: CommandFilePath })
    .overload((params, origin, output) => {
        if (params.name) {
            for (const plugin of pluginList) {
                if (plugin.pluginName === params.name.text) {
                    plugin.unload(true);
                    logger.info(`${plugin.pluginName} unloaded.`);
                    plugin.load(true);
                    if (plugin.run(plugin.lastCode).success) {
                        logger.info(`${plugin.pluginName} loaded.`);
                    } else {
                        logger.error(`Fail to reload plugin <${params.name.text}>!`);
                    }
                    return;
                }
            }
            logger.error(`Fail to reload any plugin named <${params.name.text}> !`);
        } else {
            for (const plugin of pluginList) {
                plugin.unload(true);
                logger.info(`${plugin.pluginName} unloaded.`);
                plugin.load(true);
                if (plugin.run(plugin.lastCode).success) {
                    logger.info(`${plugin.pluginName} loaded.`);
                }
            }
            logger.info(`All plugins reloaded.`);
            logger.info(`All plugins reloaded.`); // yeah say it twice
        }
    }, { operation: command.enum("lxl.reload", "reload"), name: [CommandFilePath, true] });
    logger.info("Builtin Cmds Registered.");
}