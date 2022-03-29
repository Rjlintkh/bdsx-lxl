import { CommandParameterOption, CommandPermissionLevel, CommandRawText } from "bdsx/bds/command";
import { SemVersion } from "bdsx/bds/server";
import { proc } from "bdsx/bds/symbols";
import { command } from "bdsx/command";
import { CxxString } from "bdsx/nativetype";
import { logger, pluginList, TODO } from "./api/api_help";
import { LL_VERSION_MAJOR, LL_VERSION_MINOR, LL_VERSION_REVISION } from "./constants";
import { LLSEPlugin } from "./plugin";
import fs = require("fs");
import path = require("path");

export function RegisterBuiltinCommands() {
    command.register("ll", "LiteLoaderBDS plugin operations", CommandPermissionLevel.Admin, 0, 0x80)

    .overload((params, origin, output) => {
        if (params.Operation === "help") {
            logger.info("[Introduction]");
            logger.info("");
            logger.info("[Github]");
            logger.info("--> https://github.com/Rjlintkh/bdsx-llse <--");
        } else {
            logger.info(`Bedrock Dedicated Server v${proc["SharedConstants::CurrentGameSemVersion"].as(SemVersion).fullVersionString}`);
            logger.info(`- with LiteLoaderBDS ${LL_VERSION_MAJOR}.${LL_VERSION_MINOR}.${LL_VERSION_REVISION}`);
            logger.info(`- Network Protocol: ${proc["SharedConstants::NetworkProtocolVersion"].getInt32()}`);
        }
        output.success();
    }, { Operation: [command.enum("ll.help", "help", "version"), {options: CommandParameterOption.EnumAutocompleteExpansion}] })

    .overload((params, origin, output) => {
        if (params.Operation === "reload") {
            if (params.PluginName) {
                for (const plugin of pluginList) {
                    if (plugin.pluginName === params.PluginName) {
                        plugin.unload(true);
                        logger.info(`${plugin.pluginName} unloaded.`);
                        plugin.load(true);
                        if (plugin.run(plugin.lastCode).success) {
                            logger.info(`${plugin.pluginName} loaded.`);
                        } else {
                            logger.error(`Fail to reload plugin <${params.PluginName}>!`);
                        }
                        return;
                    }
                }
            } else {
                let count = 0;
                for (const plugin of pluginList) {
                    plugin.unload(true);
                    logger.info(`${plugin.pluginName} unloaded.`);
                    plugin.load(true);
                    if (plugin.run(plugin.lastCode).success) {
                        logger.info(`${plugin.pluginName} loaded.`);
                        count++;
                    }
                }
                logger.info(`${count} plugins reloaded successfully.`);
            }
        } else {
            if (params.PluginName != null) {
                const plugin = pluginList.find(p => p.pluginName === params.PluginName);
                if (plugin) {
                    logger.info(`Plugin <${plugin.pluginName}>`);
                    logger.info(``);
                    logger.info(`- Name:  ${plugin.pluginName}8232${plugin.pluginFilePath})`);
                    logger.info(`- Introduction:  ${plugin.pluginIntroduction}`);
                    logger.info(`- Version:  v${plugin.pluginVersion[0]}.${plugin.pluginVersion[1]}.${plugin.pluginVersion[2]}`);
                    logger.info(`- Type:  Script Plugin`);
                    logger.info(`- File Path:  plugins\\${plugin.pluginFilePath}`);
                    for (const [k, v] of Object.entries(plugin.pluginOtherInformation)) {
                        logger.info(`- ${k}:  ${v}`);
                    }
                } else {
                    logger.info(`Plugin <${params.PluginName}> is not found!`);
                }
            } else {
                logger.info(`Plugin Lists [${pluginList.length}]`);
                for (const plugin of pluginList) {
                    logger.info(`- ${plugin.pluginName.cyan} ${`v${plugin.pluginVersion[0]}.${plugin.pluginVersion[1]}.${plugin.pluginVersion[2]}`.green} ${`(${plugin.pluginFilePath})`.grey}`);
                    logger.info(`  ${plugin.pluginIntroduction}`);
                }
            }
        }
        output.success();
    }, { Operation: [command.enum("ll.list", "list", "reload", "plugins"), {options: CommandParameterOption.EnumAutocompleteExpansion}], PluginName: [CxxString, true] })

    .overload((params, origin, output) => {
        if (params.Force === "force") {
            TODO("llcommand_upgrade_force")();
        }
        TODO("llcommand_upgrade")();
    }, { Operation: command.enum("ll.upgrade", "upgrade"), Force: [command.enum("ll.force", "force"), {optional: true, options: CommandParameterOption.EnumAutocompleteExpansion}] })

    .overload((params, origin, output) => {
        const filepath = path.join(process.cwd(), params.PluginPath.text);
        if (fs.existsSync(filepath)) {
            const code = fs.readFileSync(filepath, "utf8");
            const name = path.basename(filepath);
            const plugin = new LLSEPlugin(name);
            plugin.load();
            plugin.isHot = true;
            if (plugin.run(code).success) {
                logger.info(`${name} loaded.`);
                return;
            }
        }
        logger.error(`Fail to load plugin ${params.PluginPath.text}`);
    }, { operation: command.enum("ll.load", "load"), PluginPath: CommandRawText })

    .overload((params, origin, output) => {
        for (const plugin of pluginList) {
            if (plugin.pluginName === params.PluginName) {
                plugin.unload();
                logger.info(`${plugin.pluginName} unloaded.`);
                logger.info(`Plugin <${plugin.pluginName}> unloaded successfully.`);
                return;
            }
        }
        logger.error(`Fail to unload plugin ${params.PluginName}`);
    }, { operation: command.enum("ll.unload", "unload"), PluginName: CxxString })
    logger.info("Builtin Cmds Registered.");
}