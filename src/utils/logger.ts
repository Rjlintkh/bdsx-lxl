
export class Logger {
    constructor(private readonly prefix: string) {}

    time() {
        // return TimeNow();
        const date = new Date();
        const yyyy = date.getFullYear();
        const MM = String(date.getMonth() + 1).padStart(2, "0");
        const dd = String(date.getDate()).padStart(2, "0");
        const HH = String(date.getHours()).padStart(2, "0");
        const mm = String(date.getMinutes()).padStart(2, "0");
        const ss = String(date.getSeconds()).padStart(2, "0");
        const SSS = String(date.getMilliseconds()).padStart(3, "0");
        return `${yyyy}-${MM}-${dd} ${HH}:${mm}:${ss}:${SSS}`;
    }

    info(message: string) {
        console.info(`\x1b[97m[${this.time()} Info][${this.prefix}] ${message}\x1b[0m`);
    }
    debug(message: string) {
        console.info(`\x1b[3m${this.time()} Warn][${this.prefix}] ${message}\x1b[0m`);
    }
    warn(message: string) {
        console.info(`\x1b[93m[${this.time()} Warn][${this.prefix}] ${message}\x1b[0m`);
    }
    error(message: string | unknown) {
        if((message as any).stack) {
            console.error(`[${this.time()} Error][${this.prefix}] Uncaught ${
                (message as any).stack
                .replace(/\s+at Script.prototype.runInContext \(vm.js:.+\)[\s\S]+|\s+at Script \(vm.js:.+\)[\s\S]+/, "")
                .slice((message as any).stack.indexOf(message))
            }`.red);
        } else {
            console.error(`[${this.time()} Error][${this.prefix}] ${message}`.red);
        }
    }
}

export namespace Logger {
    export enum Level {
        Silent,
        Fatal,
        Error,
        Warn,
        Info,
        Debug
    }
    export enum Color {
        Silent = "",
        Fatal = "\x1b[31m",
        Error = "\x1b[91m",
        Warn = "\x1b[93m",
        Info = "",
        Debug = "\x1b[3m",
    }
    export enum ColorCode {
        Silent = "",
        Fatal = "§l§4",
        Error = "§l§c",
        Warn = "§l§e",
        Info = "",
        Debug = "§o",
    }
}