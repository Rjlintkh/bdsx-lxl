import { CommandOutput, CommandPermissionLevel } from "bdsx/bds/command";
import { ServerCommandOrigin } from "bdsx/bds/commandorigin";
import { ServerLevel } from "bdsx/bds/level";
import { serverInstance } from "bdsx/bds/server";
import { StaticPointer } from "bdsx/core";
import { events } from "bdsx/event";
import { bedrockServer } from "bdsx/launcher";
import { _tickCallback } from "bdsx/util";
import { IsInDebugMode, LockDebugModeForOnce } from "../debug";
import { logger } from "./api_help";
import { LXL_Events } from "./event";
import { LXL_Player, Player$newPlayer } from "./player";

export function runcmd(cmd: string): boolean {
    if (bedrockServer.isLaunched()) {
        LockDebugModeForOnce();
        const res = bedrockServer.executeCommand(cmd, false) as unknown as StaticPointer;
        return res.getBoolean(0);
    } else {
        return false;
    }
}

let lastOutput: string;
events.commandOutput.on(log => {
    lastOutput = log;
});
export function runcmdEx(cmd: string): { success: boolean, output: string } {
    if (bedrockServer.isLaunched()) {
        lastOutput = "";
        LockDebugModeForOnce();
        const res = bedrockServer.executeCommand(cmd, true) as unknown as StaticPointer;
        return { success: res.getBoolean(0), output: lastOutput };
    } else {
        return { success: false, output: "" };
    }
}

const playerCmdCallbacks = new Map<string, (player: LXL_Player, args: string[]) => void>();
const consoleCmdCallbacks = new Map<string, (args: string[]) => void>();

function LxlRegisterNewCmd(isPlayerCmd: boolean, cmd: string, description: string, level: number, func: Function) {
    if (cmd[0] == "/") {
        cmd = cmd.substring(1);
    }
    if (isPlayerCmd) {
        playerCmdCallbacks.set(cmd, func as any);
    } else {
        consoleCmdCallbacks.set(cmd, func as any);
    }
    bedrockServer.afterOpen().then(() => {
        const reg = serverInstance.minecraft.getCommands().getRegistry();
        const sign = reg.findCommand(cmd);
        if (sign) {
            sign.description = description;
            sign.permissionLevel = level;
            sign.flags = 0x80;
        } else {
            reg.registerCommand(cmd, description, level, 0, 0x80);
        }
        serverInstance.updateCommandList();
    });
    return true;
}

function LxlUnregisterOldCmd(isPlayerCmd: boolean, cmd: string) {
    if (cmd[0] == "/") {
        cmd = cmd.substring(1);
    }
    if (isPlayerCmd) {
        if (!playerCmdCallbacks.delete(cmd)) {
            return false;
        }
    } else {
        if (!consoleCmdCallbacks.delete(cmd)) {
            return false;
        }
    }
    bedrockServer.afterOpen().then(() => {
        const reg = serverInstance.minecraft.getCommands().getRegistry();
        const sign = reg.findCommand(cmd);
        if (sign) {
            sign.permissionLevel = CommandPermissionLevel.Internal;
        }
        serverInstance.updateCommandList();
    });
    return true;
}

events.command.on((cmd, _, ctx) => {
    if (!IsInDebugMode()) {
        if (cmd[0] == "/") {
            cmd = cmd.substring(1);
        }
        const player = ctx.origin.getEntity();
        if (player?.isPlayer()) {
            const cancelled = LXL_Events.onPlayerCmd.fire(Player$newPlayer(player), cmd);
            _tickCallback();
            if (cancelled) {
                return 0;
            }
            let matchedPrefix = "";
            let matchedCallback: Function | null = null;
            for (const [prefix, callback] of playerCmdCallbacks) {
                if (cmd === prefix || (cmd.indexOf(prefix) === 0 && cmd[prefix.length] === " ")) {
                    if (prefix.length > matchedPrefix.length) {
                        matchedPrefix = prefix;
                        matchedCallback = callback;
                    }
                }
            }
            if (matchedCallback) {
                const args = cmd.substring(matchedPrefix.length).match(/[^\s"]+|"[^"]+"/g, ) ?? [];
                for (let i = 0; i < args.length; i++) {
                    const m = /^"(.+)"$/.exec(args[i]);
                    if (m) {
                        args[i] = m[1];
                    }
                }
                try {
                    matchedCallback(Player$newPlayer(player), args);
                } catch (err) {
                    logger.error(err);
                }
                return 0;
            }
        } else {
            const cancelled = LXL_Events.onConsoleCmd.fire(cmd);
            _tickCallback();
            if (cancelled) {
                return 0;
            }
            let matchedPrefix = "";
            let matchedCallback: Function | null = null;
            for (const [prefix, callback] of consoleCmdCallbacks) {
                if (cmd === prefix || (cmd.indexOf(prefix) === 0 && cmd[prefix.length] === " ")) {
                    if (prefix.length > matchedPrefix.length) {
                        matchedPrefix = prefix;
                        matchedCallback = callback;
                    }
                }
            }
            if (matchedCallback) {
                const args = cmd.substring(matchedPrefix.length).match(/[^\s"]+|"[^"]+"/g, ) ?? [];
                for (let i = 0; i < args.length; i++) {
                    const m = /^"(.+)"$/.exec(args[i]);
                    if (m) {
                        args[i] = m[1];
                    }
                }
                try {
                    matchedCallback(args);
                } catch (err) {
                    logger.error(err);
                }
                return 0;
            }
        }
    }
});

export function regPlayerCmd(cmd: string, description: string, callback: (player: LXL_Player, args: string[]) => void, level: number = 0) {
    return LxlRegisterNewCmd(true, cmd, description, level, callback);
}

export function regConsoleCmd(cmd: string, description: string, callback: (args: string[]) => void, level: number = 0) {
    return LxlRegisterNewCmd(false, cmd, description, level, callback);
}

export function unregPlayerCmd(cmd: string) {
    return LxlUnregisterOldCmd(true, cmd);
}

export function unregConsoleCmd(cmd: string) {
    return LxlUnregisterOldCmd(false, cmd);
}

export function sendCmdOutput(output: string): boolean {
    bedrockServer.afterOpen().then(() => {
        let origin = ServerCommandOrigin.allocateWith("Server", <ServerLevel>serverInstance.minecraft.getLevel(), 5, null);
        let opt = CommandOutput.construct();
        opt.constructAs(3);
        opt.success(output);
        serverInstance.minecraft.getCommands().handleOutput(origin, opt);
        origin.destruct();
        opt.destruct();
    });
    return true;
}