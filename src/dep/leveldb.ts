import { spawnSync } from "child_process";
import { Logger } from "../utils/logger";
import path = require("path");
import fs = require("fs");

// https://github.com/cions/leveldb-cli
const BIN_PATH = __dirname;
const levelDBLogger = new Logger("LevelDB");

export class LevelDB {
    path: string;
    valid = false;

    constructor(dir: string) {
        this.path = path.join(process.cwd(), dir);
        fs.mkdirSync(this.path, { recursive: true });
        if (fs.existsSync(this.path)) {
            this.init();
        } else {
            levelDBLogger.error(`Fail to create KVDB <${this.path}>`);
        }
    }

    init() {
        const child = spawnSync(`leveldb`, ["-d", this.path, "i"], { cwd: BIN_PATH, timeout: 3000 });
        const out = child.stdout.toString().replace(/\n$/, "");
        const err = child.stderr.toString().replace(/\n$/, "");
        if (child.status === 0 || err === "leveldb: error: file already exists") {
            this.valid = true;
        } else {
            levelDBLogger.error(`Fail to load KVDB <${this.path}>`);
            levelDBLogger.error(err);
        }
        return this.valid;
    }

    get(key: string) {
        const keyEncoded = Buffer.from(key).toString("base64");
        const child = spawnSync(`leveldb`, ["-d", this.path, "g", "-b", keyEncoded], { cwd: BIN_PATH, timeout: 3000 });
        const out = child.stdout.toString().replace(/\n$/, "");
        const err = child.stderr.toString().replace(/\n$/, "");
        if (child.status === 0) {
            return JSON.parse(out);
        } else if (err === "leveldb: error: leveldb: not found") {
            return null;
        } else {
            levelDBLogger.error(`[DB Error]get ${this.path} ${err}`);
        }
        return null;
    }

    put(key: string, value: any) {
        const keyEncoded = Buffer.from(key).toString("base64");
        const valueEncoded = Buffer.from(JSON.stringify(value)).toString("base64");
        const child = spawnSync(`leveldb`, ["-d", this.path, "p", "-b", keyEncoded, valueEncoded], { cwd: BIN_PATH, timeout: 3000 });
        const out = child.stdout.toString().replace(/\n$/, "");
        const err = child.stderr.toString().replace(/\n$/, "");
        if (child.status === 0) {
            return true;
        } else {
            levelDBLogger.error(`[DB Error]put ${this.path} ${err}`);
        }
        return false;
    }

    delete(key: string) {
        const child = spawnSync(`leveldb`, ["-d", this.path, "d", key], { cwd: BIN_PATH, timeout: 3000 });
        const out = child.stdout.toString().replace(/\n$/, "");
        const err = child.stderr.toString().replace(/\n$/, "");
        if (child.status === 0) {
            return true;
        } else {
            levelDBLogger.error(`del ${this.path} ${err}`);
        }
        return false;
    }

    keys() {
        const child = spawnSync(`leveldb`, ["-d", this.path, "k"], { cwd: BIN_PATH, timeout: 3000 });
        const out = child.stdout.toString().replace(/\n$/, "");
        const err = child.stderr.toString().replace(/\n$/, "");
        if (child.status === 0) {
            return out.split("\n").filter(e => e !== "");
        } else {
            levelDBLogger.error(`Fail to load KVDB <${this.path}>`);
            levelDBLogger.error(err);
        }
    }
}