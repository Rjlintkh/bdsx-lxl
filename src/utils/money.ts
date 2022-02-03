import { events } from "bdsx/event";
import { bedrockServer } from "bdsx/launcher";
import { LXL_Events } from "../api/event";
import fs = require("fs");
import path = require("path");

const sqlite = new (require("sqlite-sync").constructor);

fs.mkdirSync("./plugins/LLMoney/", { recursive: true });
const db = sqlite.connect(path.join(process.cwd(), "./plugins/LLMoney/economy.db"));

db.exec = function (sql: string, params?: string[]) {
    const res = db.run(sql, params);
    if (res.error) {
        throw res.error;
    }
    return res;
};

bedrockServer.afterOpen().then(() => {
    db.exec(
        `CREATE TABLE IF NOT EXISTS money (
            XUID  TEXT PRIMARY KEY
            UNIQUE NOT NULL,
            Money NUMERIC NOT NULL
        ) WITHOUT ROWID;
    `);
    db.exec(
        `CREATE TABLE IF NOT EXISTS mtrans (
            tFrom TEXT  NOT NULL,
            tTo   TEXT  NOT NULL,
            Money NUMERIC  NOT NULL,
            Time  NUMERIC NOT NULL
            DEFAULT(strftime('%s', 'now')),
            Note  TEXT
        )
    `);
    db.exec(
        `CREATE INDEX IF NOT EXISTS idx ON mtrans (
            Time COLLATE BINARY COLLATE BINARY DESC
        )
    `);
    db.write();
});

events.serverLeave.on(() => {
    db.close();
});

let isRealTrans = true;

export namespace LLMoney {
    export function Get(xuid: string) {
        const res = db.exec(`SELECT Money FROM money WHERE XUID = ?`, [xuid]);
        if (res.length) {
            return res[0].Money;
        }
        db.exec(`INSERT INTO money VALUES (?, ?)`, [xuid, 0]);
        return 0;
    }
    export function Trans(from: string, to: string, val: number, note: string) {
        val = ~~val;
        const _isRealTrans = isRealTrans;
        isRealTrans = true;
        if (_isRealTrans) {
            const cancelled = LXL_Events.onMoneyTrans.fire(from, to, val);
            if (cancelled) {
                return false;
            }
        }
        if (val < 0 || from === to) {
            return false;
        }
        db.db.run("BEGIN TRANSACTION");
        if (from !== "") {
            let fmoney = Get(from);
            if (fmoney < val) {
                db.db.run("ROLLBACK TRANSACTION");
                db.write();
                return false;
            }
            fmoney -= val;
            const set = db.db.prepare(`UPDATE money SET Money = ? WHERE XUID = ?`);
            set.run([fmoney, from]);
        }
        if (to !== "") {
            let tmoney = Get(to);
            tmoney += val;
            if (tmoney < 0) {
                db.db.run("ROLLBACK TRANSACTION");
                db.write();
                return false
            }
            const set = db.db.prepare(`UPDATE money SET Money = ? WHERE XUID = ?`);
            set.run([tmoney, to]);
        }
        const addTrans = db.db.prepare(`INSERT INTO mtrans (tFrom, tTo, Money, Note) VALUES (?, ?, ?, ?)`);
        addTrans.run([from, to, val, note]);
        db.db.run("COMMIT TRANSACTION");
        db.write();
        return true;
    }
    export function Add(xuid: string, money: number) {
        money = ~~money;
        const cancelled = LXL_Events.onMoneyAdd.fire(xuid, money);
        if (cancelled) {
            return false;
        }
        isRealTrans = false;
        const res = Trans("", xuid, money, `add ${money}`);
        return res;
    }
    export function Reduce(xuid: string, money: number) {
        money = ~~money;
        const cancelled = LXL_Events.onMoneyReduce.fire(xuid, money);
        if (cancelled) {
            return false;
        }
        isRealTrans = false;
        const res = Trans(xuid, "", money, `reduce ${money}`);
        return res;
    }
    export function Set(xuid: string, money: number) {
        money = ~~money;
        const cancelled = LXL_Events.onMoneySet.fire(xuid, money);
        if (cancelled) {
            return false;
        }
        let now = Get(xuid), diff: number;
        let from: string, to: string;
        if (money >= now) {
            from = "";
            to = xuid;
            diff = money - now;
        } else {
            from = xuid;
            to = "";
            diff = now - money;
        }
        isRealTrans = false;
        const res = Trans(from, to, diff, `set to ${money}`);
        return res;
    }
    export function GetHist(xuid: string, timediff: number) {
        timediff = ~~timediff;
        const res = db.exec(`SELECT tFrom, tTo, Money, datetime(Time,'unixepoch', 'localtime'), Note FROM mtrans WHERE strftime('%s','now') - time < ? and (tFrom=? OR tTo=?) ORDER BY Time DESC`, [timediff, xuid, xuid]);
        const records = [] as { from: string, to: string, money: number, time: number, note: string }[];
        for (const e of res) {
            records.push({
                from: e.tFrom || "System",
                to: e.tTo || "System",
                money: e.Money,
                time: e["datetime(Time,'unixepoch', 'localtime')"],
                note: e.Note,
            });
        }
        return records;
    }
    export function ClearHist(difftime: number) {
        difftime = ~~difftime;
        db.exec(`DELETE FROM mtrans WHERE strftime('%s','now')-time>${difftime}`);
    }
}