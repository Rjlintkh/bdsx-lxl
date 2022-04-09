import { DisplaySlot, Objective } from "bdsx/bds/scoreboard";
import { bedrockServer } from "bdsx/launcher";
import { LlAPI } from "../dep/native";
import { PrivateFields } from "./api_help";
import { LXL_Player } from "./player";

export class LXL_Objective {
    [PrivateFields]: Objective;

    getRawPtr() {
        return parseInt(this[PrivateFields].toString());
    }

    name: string;

    get displayName() {
        return this[PrivateFields].displayName;
    }

    setDisplay(slot: DisplaySlot, sortOrder = 0) {
        const sb = bedrockServer.level.getScoreboard();
        return !!sb.setDisplayObjective(slot, this[PrivateFields], sortOrder);
    }

    setScore(target: LXL_Player | string, value: number) {
        return LlAPI.Scoreboard.setScore(bedrockServer.level.getScoreboard(), typeof target === "string" ? target : target[PrivateFields] as any, this.name, value);
    }

    addScore(target: LXL_Player | string, value: number) {
        return LlAPI.Scoreboard.addScore(bedrockServer.level.getScoreboard(), typeof target === "string" ? target : target[PrivateFields] as any, this.name, value);
    }

    reduceScore(target: LXL_Player | string, value: number) {
        return LlAPI.Scoreboard.reduceScore(bedrockServer.level.getScoreboard(), typeof target === "string" ? target : target[PrivateFields] as any, this.name, value);
    }

    deleteScore(target: LXL_Player | string) {
        return LlAPI.Scoreboard.deleteScore(bedrockServer.level.getScoreboard(), typeof target === "string" ? target : target[PrivateFields] as any, this.name);
    }

    getScore(target: LXL_Player | string) {
        return LlAPI.Scoreboard.getScore(bedrockServer.level.getScoreboard(), typeof target === "string" ? target : target[PrivateFields] as any, this.name);
    }
}

export function Objective$Objective(p: Objective) {
    const newp = new LXL_Objective();
    newp[PrivateFields] = p;
    Object.defineProperty(newp, "name", { value: p.name });
    return newp;
}

export function getDisplayObjective(slot: DisplaySlot) {
    const sb = bedrockServer.level.getScoreboard();
    const res = sb.getDisplayObjective(slot);
    if (!res?.objective) return null;
    return Objective$Objective(res.objective);
}

export function clearDisplayObjective(slot: "sidebar"|"belowName"|"list") {
    const sb = bedrockServer.level.getScoreboard();
    const res = sb.clearDisplayObjective(slot);
    if (!res) return null;
    return Objective$Objective(res);
}

export function getScoreObjective(name: string) {
    const sb = bedrockServer.level.getScoreboard();
    const res = sb.getObjective(name);
    if (!res) return null;
    return Objective$Objective(res);
}

export function newScoreObjective(name: string,displayName: string) {
    const sb = bedrockServer.level.getScoreboard();
    const res = sb.addObjective(name, displayName, sb.getCriteria("dummy"));
    if (!res) return null;
    return Objective$Objective(res);
}

export function removeScoreObjective(name: string) {
    const sb = bedrockServer.level.getScoreboard();
    const obj = sb.getObjective(name);
    if (obj) {
        sb.removeObjective(obj);
        return true;
    }
    return false;
}

export function getAllScoreObjectives() {
    const sb = bedrockServer.level.getScoreboard();
    const objs = sb.getObjectives();
    const res = new Array<LXL_Objective>();
    for (const obj of objs) {
        if (obj) {
            res.push(Objective$Objective(obj));
        }
    }
    return res;
}