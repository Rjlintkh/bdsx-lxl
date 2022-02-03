import { logger, StringifyValue } from "./api_help";

export function log(...data: any[]) {
    console.info(data.map(StringifyValue).join(""));
}

const colors = {
    "dk_blue": "\x1b[34m",
    "dk_green": "\x1b[32m",
    "bt_blue": "\x1b[36m",
    "dk_red": "\x1b[31m",
    "purple": "\x1b[35m",
    "dk_yellow": "\x1b[33m",
    "grey": "\x1b[37m",
    "sky_blue": "\x1b[94m",
    "blue": "\x1b[94m",
    "green": "\x1b[92m",
    "cyan": "\x1b[36m",
    "red": "\x1b[91m",
    "pink": "\x1b[95m",
    "yellow": "\x1b[93m",
    "white": "\x1b[97m",
}

export function colorLog(color: keyof typeof colors = "white", ...data: any[]) {
    const prefix = colors[color];
    if (prefix) {
        console.info(prefix, data.map(StringifyValue).join(""), "\x1b[0m");
    } else {
        logger.error("Invalid color!");
    }
}
export function fastLog(...data: any[]) {
    setImmediate(() => {
        console.info(data.map(StringifyValue).join(""));
    }).unref();
}