import { LIAPI } from "../dep/native";
import { Logger } from "../utils/logger";
import { PrivateFields, StringifyValue, TimeNow } from "./api_help";
import { LXL_Player } from "./player";

export const logger = {
    [PrivateFields]: {
        toConsole: true,
        consoleLevel: 4,
        filepath: null! as string,
        fileLevel: 4,
        player: null! as LXL_Player,
        playerLevel: 4,
        title: "",
        log(mode: string, ...data: any[]) {
            const message = data.map(StringifyValue).join("");
            if (this.toConsole && this.consoleLevel >= (Logger.Level as any)[mode]) {
                console.info(`${(Logger.Color as any)[mode]}[${TimeNow()} ${mode.toUpperCase()}]${this.title ? "[" + this.title + "]" : ""} ${message}\x1b[0m`);
            }
            if (this.filepath && this.fileLevel >= (Logger.Level as any)[mode]) {
            }
            if (this.player && this.playerLevel >= (Logger.Level as any)[mode]) {
                const player = this.player[PrivateFields];
                if (player) {
                    LIAPI.Player.sendText(player, `${(Logger.ColorCode as any)[mode]}[${mode}]${this.title ? "[" + this.title + "]" : ""} ${message}`, 0);
                }
            }
            return true;
        }
    },
    log(...data: any) {
        return this[PrivateFields].log("Info", ...data);
    },
    debug(...data: any) {
        return this[PrivateFields].log("Debug", ...data);
    },
    info(...data: any) {
        return this[PrivateFields].log("Info", ...data);
    },
    warn(...data: any) {
        return this[PrivateFields].log("Warn", ...data);
    },
    warning(...data: any) {
        return this[PrivateFields].log("Warn", ...data);
    },
    error(...data: any) {
        return this[PrivateFields].log("Error", ...data);
    },
    fatal(...data: any) {
        return this[PrivateFields].log("Fatal", ...data);
    },
    setTitle(title: string) {
        this[PrivateFields].title = title;
        return true;
    },
    setConsole(isOpen: boolean, logLevel?: number) {
        this[PrivateFields].toConsole = isOpen;
        if (logLevel) {
            this[PrivateFields].consoleLevel = logLevel;
        }
        return true;
    },
    setFile(filepath: string | null, logLevel?: number) {
        if (filepath) {
            // TODO("logger.setFile")();
        }
        if (logLevel) {
            this[PrivateFields].fileLevel = logLevel;
        }
        return true;
    },
    setPlayer(player: LXL_Player | null, logLevel?: number) {
        if (player) {
            this[PrivateFields].player = player;
        }
        if (logLevel) {
            this[PrivateFields].playerLevel = logLevel;
        }
        return true;
    },
    setLogLevel(level: number) {
        this[PrivateFields].consoleLevel = level;
        this[PrivateFields].fileLevel = level;
        this[PrivateFields].playerLevel = level;
        return true;
    }
}