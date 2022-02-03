import { createHash } from "crypto";
import { LLMoney } from "../utils/money";
import { playerDB } from "../utils/playerDB";
import { ArrayBuffer2Buffer, Buffer2ArrayBuffer, CreateSection, GetSection, JsonToValue, logger, PrivateFields, TODO, ValueToJson } from "./api_help";
import fs = require("fs");
import path = require("path");
import INI = require("ini");

export const data = {
    xuid2name(xuid: string) {
        const res = playerDB.run(`SELECT NAME FROM player WHERE XUID = ?`, [xuid]);
        if (res.length) {
            return res[0].NAME;
        }
        return null;
    },
    name2xuid(name: string) {
        const res = playerDB.run(`SELECT XUID FROM player WHERE NAME = ?`, [name]);
        if (res.length) {
            return res[0].XUID;
        }
        return null;
   },
    parseJson(json: string) {
        return JsonToValue(json);
    },
    toJson(v: any, space?: number) {
        return ValueToJson(v, space);
    },
    toMD5(str: string | ArrayBuffer) {
        if (typeof str !== "string") {
            str = ArrayBuffer2Buffer(str).toString();
        }
        const hash = createHash("md5");
        return hash.update(str).digest("hex");
    },
    toSHA1(str: string | ArrayBuffer) {
        if (typeof str !== "string") {
            str = ArrayBuffer2Buffer(str).toString();
        }
        const hash = createHash("sha1");
        return hash.update(str).digest("hex");
    },
    toBase64(str: string | ArrayBuffer) {
        if (typeof str !== "string") {
            return ArrayBuffer2Buffer(str).toString("base64");
        }
        return Buffer.from(str).toString("base64");
    },
    fromBase64(str: string) {
        return Buffer2ArrayBuffer(Buffer.from(str, "base64"));
    },
    /** @deprecated */
    openDB(dir: string) {
        return new KVDatabase(dir);
    },
    /** @deprecated */
    openConfig(filepath: string, confType: "ini" | "json" = "ini", defaultValue: string = "") {
        if (confType === "json") {
            return new JsonConfigFile(filepath, defaultValue);
        } else {
            return new IniConfigFile(filepath, defaultValue);
        }
    }
}

export const money = {
    set(xuid: string, money: number) {
        return LLMoney.Set(xuid, money);
    },
    get(xuid: string) {
        return LLMoney.Get(xuid);
    },
    add(xuid: string, money: number) {
        return LLMoney.Add(xuid, money);
    },
    reduce(xuid: string, money: number) {
        return LLMoney.Reduce(xuid, money);
    },
    trans(xuid1: string, xuid2: string, money: number, note = "") {
        return LLMoney.Trans(xuid1, xuid2, money, note);
    },
    getHistory(xuid: string, time: number) {
        return LLMoney.GetHist(xuid, time);
    },
    clearHistory(time: number) {
        return LLMoney.ClearHist(time);
    }
}

export class KVDatabase {
    constructor(dir: string) {
        TODO("KVDatabase")();
    }
}

abstract class ConfigFile {
    [PrivateFields]: {
        confPath: string;
    };
    constructor(filepath: string, defaultValue = "") {
        this[PrivateFields] = {
            confPath: filepath
        };
    }

    getPath() {
        return this[PrivateFields].confPath;
    }

    abstract reload(): boolean;

    close() {
        return true;
    }

    read() {
        try {
            const confPath = path.join(process.cwd(), this[PrivateFields].confPath);
            const content = fs.readFileSync(confPath, "utf8");
            if (content) {
                return content;
            } else {
                return null;
            }
        } catch { }
    }

    write(content: string) {
        try {
            const confPath = path.join(process.cwd(), this[PrivateFields].confPath);
            fs.writeFileSync(confPath, content);
            this.reload();
            return true;
        } catch { }
        return false;
    }
}

export class JsonConfigFile extends ConfigFile {
    [PrivateFields]: {
        confPath: string;
        jsonConf: Record<string, any>;
    };
    constructor(filepath: string, defaultValue = "") {
        super(filepath);
        const confPath = path.join(process.cwd(), filepath);
        if (confPath === "") {
            throw new Error(`Error: can't create class ${this.constructor.name}`);
        }
        try {
            fs.mkdirSync(path.dirname(confPath), { recursive: true });
            try {
                fs.writeFileSync(confPath, defaultValue, { flag: "wx"});
                const jsonConf = defaultValue;
                try {
                    this[PrivateFields].jsonConf = JSON.parse(jsonConf || "{}");
                    return;
                } catch {
                    logger.error("Fail to parse default json content!")
                }
            } catch {
                try {
                    const jsonConf = fs.readFileSync(confPath, "utf8");
                    try {
                        this[PrivateFields].jsonConf = JSON.parse(jsonConf || "{}");
                        return;
                    } catch {
                        logger.error("Fail to parse json content in file!");
                    }
                } catch { }
            }
        } catch { }
        this[PrivateFields].jsonConf = {};
    }

    init(name: string, defaultValue: any) {
        try {
            const jsonConf = this[PrivateFields].jsonConf;
            if (jsonConf.hasOwnProperty(name)) {
                return jsonConf[name];
            } else {
                jsonConf[name] = defaultValue;
                const confPath = path.join(process.cwd(), this[PrivateFields].confPath);
                fs.writeFileSync(confPath, ValueToJson(jsonConf, 4));
            }
        } catch { }
        return defaultValue;
    }

    get(name: string, defaultValue: any = null) {
        try {
            const jsonConf = this[PrivateFields].jsonConf;
            return jsonConf[name];
        } catch { }
        return defaultValue;
    }

    set(name: string, data: any) {
        try {
            const jsonConf = this[PrivateFields].jsonConf;
            jsonConf[name] = data;
            const confPath = path.join(process.cwd(), this[PrivateFields].confPath);
            fs.writeFileSync(confPath, ValueToJson(jsonConf, 4));
            return true;
        } catch { }
        return false;
    }

    delete(name: string) {
        try {
            const jsonConf = this[PrivateFields].jsonConf;
            if (jsonConf.hasOwnProperty(name)) {
                delete jsonConf[name];
                const confPath = path.join(process.cwd(), this[PrivateFields].confPath);
                fs.writeFileSync(confPath, ValueToJson(jsonConf, 4));
                return true;
            }
        } catch { }
        return false;
    }

    reload() {
        try {
            const confPath = path.join(process.cwd(), this[PrivateFields].confPath);
            const jsonConf = fs.readFileSync(confPath, "utf8");
            try {
                this[PrivateFields].jsonConf = JSON.parse(jsonConf || "{}");
                return true;
            } catch {
                logger.error("Fail to parse json content in file!");
            }
        } catch { }
        return false;
    }
}

export class IniConfigFile extends ConfigFile {
    [PrivateFields]: {
        confPath: string;
        iniConf: Record<string, any>;
    };
    constructor(filepath: string, defaultValue = "") {
        super(filepath);
        const confPath = path.join(process.cwd(), filepath);
        if (confPath === "") {
            throw new Error(`Error: can't create class ${this.constructor.name}`);
        }
        try {
            fs.mkdirSync(path.dirname(confPath), { recursive: true });
            try {
                fs.writeFileSync(confPath, defaultValue, { flag: "wx"});
                const iniConf = defaultValue;
                try {
                    this[PrivateFields].iniConf = INI.parse(iniConf);
                    return;
                } catch {
                    logger.error("Fail to parse default ini content!")
                }
            } catch {
                try {
                    const iniConf = fs.readFileSync(confPath, "utf8");
                    try {
                        this[PrivateFields].iniConf = INI.parse(iniConf);
                        return;
                    } catch {
                        logger.error("Fail to parse ini content in file!");
                    }
                } catch { }
            }
        } catch { }
        this[PrivateFields].iniConf = {};
    }

    init(section: string, name: string, defaultValue: any) {
        try {
            const iniConf = this[PrivateFields].iniConf;
            CreateSection(iniConf, section);
            const sectionConf = GetSection(iniConf, section);
            if (sectionConf.hasOwnProperty(name)) {
                return sectionConf[name];
            } else {
                sectionConf[name] = defaultValue;
                const confPath = path.join(process.cwd(), this[PrivateFields].confPath);
                fs.writeFileSync(confPath, INI.stringify(iniConf));
            }
        } catch { }
        return defaultValue;
    }

    getStr(section: string, name: string, defaultValue = "") {
        try {
            const iniConf = this[PrivateFields].iniConf;
            const sectionConf = GetSection(iniConf, section);
            return ""+sectionConf[name];
        } catch { }
        return defaultValue;
    }

    getInt(section: string, name: string, defaultValue = 0) {
        try {
            const iniConf = this[PrivateFields].iniConf;
            const sectionConf = GetSection(iniConf, section);
            return ~~sectionConf[name];
        } catch { }
        return defaultValue;
    }

    getFloat(section: string, name: string, defaultValue = 0) {
        try {
            const iniConf = this[PrivateFields].iniConf;
            const sectionConf = GetSection(iniConf, section);
            return +sectionConf[name];
        } catch { }
        return defaultValue;
    }

    getBool(section: string, name: string, defaultValue = false) {
        try {
            const iniConf = this[PrivateFields].iniConf;
            const sectionConf = GetSection(iniConf, section);
            return !!sectionConf[name];
        } catch { }
        return defaultValue;
    }

    set(section: string, name: string, data: any) {
        try {
            const iniConf = this[PrivateFields].iniConf;
            CreateSection(iniConf, section);
            const sectionConf = GetSection(iniConf, section);
            sectionConf[name] = data;
            const confPath = path.join(process.cwd(), this[PrivateFields].confPath);
            fs.writeFileSync(confPath, INI.stringify(iniConf));
            return true;
        } catch { }
        return false;
    }

    delete(section: string, name: string) {
        try {
            const iniConf = this[PrivateFields].iniConf;
            const sectionConf = GetSection(iniConf, section);
            if (sectionConf.hasOwnProperty(name)) {
                delete sectionConf[name];
                const confPath = path.join(process.cwd(), this[PrivateFields].confPath);
                fs.writeFileSync(confPath, INI.stringify(iniConf));
                return true;
            }
        } catch { }
        return false;
    }

    reload() {
        try {
            const confPath = path.join(process.cwd(), this[PrivateFields].confPath);
            const iniConf = fs.readFileSync(confPath, "utf8");
            try {
                this[PrivateFields].iniConf = INI.parse(iniConf);
                return true;
            } catch {
                logger.error("Fail to parse ini content in file!");
            }
        } catch { }
        return false;
    }
}