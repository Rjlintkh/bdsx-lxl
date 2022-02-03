import { spawn } from "child_process";
import { DateNow, logger, TimeNow } from "./api_help";

export const system = {
    getTimeStr() {
        return `${DateNow()} ${TimeNow()}`;
    },
    getTimeObj() {
        const date = new Date();
        return {
            Y: date.getFullYear(),
            M: date.getMonth() + 1,
            D: date.getDate(),
            h: date.getHours(),
            m: date.getMinutes(),
            s: date.getSeconds(),
            ms: date.getMilliseconds(),
        }
    },
    randomGuid() {
        return "00041000".replace(/\d/g, (s: any) => ((Math.random() + ~~s) * 0x10000 >> s).toString(16).padStart(4, "0"));
    },
    cmd(cmd: string, callback: (exitcode: number, output: string) => any, timeLimit = 0) {
        let output = "";
        let exitcode = 0;
        const child = spawn("cmd /c" + cmd, [], { shell: "powershell.exe", timeout: timeLimit });
        child.stdout.setEncoding("utf8");
        child.stdout.on("data", data => {
            data = data.toString();
            output += data;
        });
        child.stderr.setEncoding("utf8");
        child.stderr.on("data", data => {
            data = data.toString();
            output += data;
        });
        child.on("exit", code => {
            exitcode = code!;
        });
        child.on("close", () => {
            try {
                callback(exitcode, output);
            } catch (err) {
                logger.error(err);
            }
        });
        return true;
    },
    newProcess(process: string, callback: (exitcode: number, output: string) => any, timeLimit = 0) {
        let output = "";
        let exitcode = 0;
        const child = spawn(process, [], { shell: "powershell.exe", timeout: timeLimit });
        child.stdout.setEncoding("utf8");
        child.stdout.on("data", data => {
            data = data.toString();
            output += data;
        });
        child.stderr.setEncoding("utf8");
        child.stderr.on("data", data => {
            data = data.toString();
            output += data;
        });
        child.on("exit", code => {
            exitcode = code!;
        });
        child.on("close", () => {
            try {
                callback(exitcode, output);
            } catch (err) {
                logger.error(err);
            }
        });
        return true;
    }
}