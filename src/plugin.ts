
import { bedrockServer } from "bdsx/launcher";
import { context } from "./api";
import { logger, pluginList } from "./api/api_help";
import { regConsoleCmd, regPlayerCmd, unregConsoleCmd, unregPlayerCmd } from "./api/command";
import { listen } from "./api/event";
import { Player$newPlayer } from "./api/player";
import { LL_DEPENDS_DIR } from "./constants";
import { LevelDB } from "./dep/leveldb";
import { requestSync } from "./dep/sync";
import { iniConf } from "./loader";
import fs = require("fs");
import path = require("path");
import vm = require("vm");
import ts = require("typescript");

export class LLSEPlugin {
    isLoaded = false;
    isHot = false;

    protected sessionId = 0;

    lastCode = "";

    private ctx: typeof context;

    private listeners: Record<string, Function[]> = {};
    private commands = {
        player: new Array<string>(),
        console: new Array<string>(),
    }

    constructor(public pluginFilePath = "", public lang = "js") {}

    pluginName = this.pluginFilePath;
    pluginIntroduction = this.pluginFilePath;
    pluginVersion = [1, 0, 0];
    pluginOtherInformation = {};

    load(virtual = false) {
        if (!this.isLoaded) {
            const sessionId = (Math.random() * Number.MAX_SAFE_INTEGER) << 0
            this.sessionId = sessionId;
            this.ctx = vm.createContext({...context}) as typeof context;
            {
                this.ctx.ll.require = (filepath: string, remotePath?: string) => {
                    let existing = false;
                    const thisName = this.pluginFilePath;

                    for (const { pluginFilePath: pluginName } of pluginList) {
                        if (pluginName === filepath) {
                            existing = true;
                            break;
                        }
                    }
                    if (existing) {
                        logger.info(`${thisName} - 插件依赖包加载成功。已加载：${filepath}`);
                        return true;
                    }
                    existing = false;
                    try {
                        const list = fs.readdirSync(path.join(process.cwd(), iniConf.Main.PluginsDir));
                        for (const fileName of list) {
                            if (fileName === filepath) {
                                existing = true;
                                break;
                            }
                        }
                        if (existing) {
                            const plugin = new LLSEPlugin(filepath);
                            plugin.load();
                            const res = plugin.run(fs.readFileSync(path.join(process.cwd(), iniConf.Main.PluginsDir, filepath), "utf-8"));
                            if (res.success) {
                                logger.info(`${thisName} - 插件依赖包加载成功。已加载：${filepath}`);
                                return true;
                            } else {
                                logger.error(`${thisName} - 插件依赖包加载失败！`);
                                return false;
                            }
                        }
                    } catch { }
                    existing = false;
                    try {
                        const list = fs.readdirSync(path.join(process.cwd(), LL_DEPENDS_DIR));
                        for (const fileName of list) {
                            if (fileName === filepath) {
                                existing = true;
                                break;
                            }
                        }
                        if (existing) {
                            const plugin = new LLSEPlugin(filepath);
                            plugin.load();
                            const res = plugin.run(fs.readFileSync(path.join(process.cwd(), LL_DEPENDS_DIR, filepath), "utf-8"));
                            if (res.success) {
                                logger.info(`${thisName} - 插件依赖包加载成功。已加载：${filepath}`);
                                return true;
                            } else {
                                logger.error(`${thisName} - 插件依赖包加载失败！`);
                                return false;
                            }
                        }
                    } catch { }
                    existing = false;

                    if (!remotePath) {
                        logger.error(`${thisName} - 插件依赖包加载失败！`);
                        return false;
                    }

                    let status = 0;
                    const result = requestSync(remotePath);
                    if (result.statusCode !== 200) {
                        logger.error(`${thisName} - 插件依赖包拉取网络请求失败！错误码：${result.statusCode}`);
                        return false;
                    }
                    try {
                        const downloadPath = path.join(process.cwd(), LL_DEPENDS_DIR, filepath);
                        fs.writeFileSync(downloadPath, result.data);

                        const plugin = new LLSEPlugin(filepath);
                        plugin.load();
                        const res = plugin.run(fs.readFileSync(downloadPath, "utf-8"));
                        if (res.success) {
                            logger.info(`${thisName} - 插件依赖包加载成功。已加载：${filepath}`);
                            return true;
                        } else {
                            logger.error(`${thisName} - 插件依赖包加载失败！`);
                            return false;
                        }
                    } catch { }
                    logger.error(`${thisName} - 插件依赖包加载失败！`);
                    return false;
                }
            }
            {
                this.ctx.ll.registerPlugin = (name: string, Introduction = "", version: [number, number, number] = [1, 0, 0], otherInfomation: Record<string, string> = {}) => {
                    this.pluginName = name;
                    this.pluginIntroduction = Introduction;
                    this.pluginVersion = version;
                    this.pluginOtherInformation = {...otherInfomation};
                    return true;
                }
            }
            {
                const original = listen;
                this.ctx.mc.listen = (...args: Parameters<typeof original>) => {
                    let _cb = (..._args: any[]) => {
                        if (this.sessionId === sessionId) {
                            return args[1].apply(null, _args);
                        }
                    };
                    if (!this.listeners[args[0]]) {
                        this.listeners[args[0]] = [];
                    }
                    this.listeners[args[0]].push(_cb);
                    return original(args[0], _cb);
                };
            }
            {
                const original = regPlayerCmd;
                this.ctx.mc.regPlayerCmd = (...args: Parameters<typeof original>) => {
                    this.commands.player.push(args[0]);
                    return original(...args);
                };
            }
            {
                const original = regConsoleCmd;
                this.ctx.mc.regConsoleCmd = (...args: Parameters<typeof original>) => {
                    this.commands.console.push(args[0]);
                    return original(...args);
                };
            }
            (this.ctx as any).console = console;
            (this.ctx as any).requestSync = requestSync;
            (this.ctx as any).LevelDB = LevelDB;
            vm.runInContext(fs.readFileSync(path.join(__dirname, "./dep/polyfill.js"), "utf8"), this.ctx);
            this.isLoaded = true;
            if (this.pluginFilePath !== "" && !virtual) {
                pluginList.push(this);
            }
        }
    }

    unload(virtual = false) {
        if (this.isLoaded) {
            this.sessionId = 0;
            const players = bedrockServer.serverInstance.getPlayers();
            if (this.listeners["onLeft"]) {
                for (const pl of players) {
                    for (const cb of this.listeners["onLeft"]) {
                        try {
                            cb(Player$newPlayer(pl));
                        } catch (err) {
                            logger.error(err);
                        }
                    }
                }
            }
            // for (const [k, v] of Object.entries(this.listeners)) {
            //     for (const cb of v) {
            //         unlisten(k as any, cb as any);
            //     }
            // }
            this.listeners = {};
            for (const e of this.commands.player) {
                unregPlayerCmd(e);
            }
            for (const e of this.commands.console) {
                unregConsoleCmd(e);
            }
            this.isLoaded = false;
            if (this.pluginFilePath !== "" && !virtual) {
                const index = pluginList.findIndex(e => e.pluginFilePath === this.pluginFilePath);
                if (index !== -1) {
                    pluginList.splice(index, 1);
                }
            }
            this.isHot = true;
        }
    }

    run(code: string) {
        this.lastCode = code;
        const result = {
            success: false,
            output: void 0 as any,
        }
        if (this.isLoaded) {
            if (this.lang === "js") {
                const { outputText } = ts.transpileModule(code, {
                    compilerOptions: {
                        target: ts.ScriptTarget.ES2017,
                        strict: false,
                        allowJs: true,
                    }
                });
                try {
                    result.output = vm.runInContext(outputText, this.ctx, { filename: this.pluginFilePath });
                    result.success = true;
                } catch (err) {
                    logger.error(err);
                }
            }
            if (this.isHot) {
                if (this.listeners["onServerStarted"]) {
                    for (const cb of this.listeners["onServerStarted"]) {
                        try {
                            cb();
                        } catch (err) {
                            logger.error(err);
                        }
                    }
                }
                const players = bedrockServer.serverInstance.getPlayers();
                if (this.listeners["onPreJoin"]) {
                    for (const pl of players) {
                        for (const cb of this.listeners["onPreJoin"]) {
                            try {
                                cb(Player$newPlayer(pl));
                            } catch (err) {
                                logger.error(err);
                            }
                        }
                    }
                }
                if (this.listeners["onJoin"]) {
                    for (const pl of players) {
                        for (const cb of this.listeners["onJoin"]) {
                            try {
                                cb(Player$newPlayer(pl));
                            } catch (err) {
                                logger.error(err);
                            }
                        }
                    }
                }
            }
        }
        return result;
    }
}