import { ClearInterval, SetInterval, SetTimeout } from "./api_help";
import { DirectionAngle, FloatPos, getBDSVersion, IntPos, newFloatPos, newIntPos } from "./base";
import { getBlock, LXL_Block, setBlock, spawnParticle } from "./block";
import { LXL_BlockEntity } from "./block_entity";
import { regConsoleCmd, regPlayerCmd, runcmd, runcmdEx, sendCmdOutput } from "./command";
import { LXL_Container } from "./container";
import { data, IniConfigFile, JsonConfigFile, KVDatabase, money } from "./data";
import { LXL_Device } from "./device";
import { explode, getAllEntities, LXL_Entity, spawnMob } from "./entity";
import { listen } from "./event";
import { File } from "./file_system";
import { Format } from "./game_utils";
import { LXL_CustomForm, LXL_SimpleForm, newCustomForm, newSimpleForm } from "./gui";
import { LXL_Item, newItem, spawnItem } from "./item";
import { logger } from "./logger";
import { lxl } from "./lxl";
import { NBT, NbtByte, NbtByteArray, NbtCompound, NbtDouble, NbtEnd, NbtFloat, NbtInt, NbtList, NbtLong, NbtShort, NbtString } from "./nbt";
import { network, WSClient } from "./network";
import { broadcast, getOnlinePlayers, getPlayer, LXL_Player } from "./player";
import { clearDisplayObjective, getAllScoreObjectives, getDisplayObjective, getScoreObjective, LXL_Objective, newScoreObjective, removeScoreObjective } from "./scoreboard";
import { colorLog, fastLog, log } from "./script";
import { crashBDS as crash, setMotd } from "./server";
import { system } from "./system";
import fs = require("fs");
import path = require("path");
import vm = require("vm");

const bindings = {
    // require: (id: string) => {
    //     return require(path.join(process.cwd(), "./plugins", id));
    // },
    log,
    colorLog,
    fastLog,
    setTimeout: SetTimeout,
    setInterval: SetInterval,
    clearInterval: ClearInterval,
    mc: {
        getBDSVersion,
        runcmd,
        runcmdEx,
        regPlayerCmd,
        broadcast,
        listen,
        getPlayer,
        getOnlinePlayers,
        getAllEntities,
        newItem,
        spawnMob,
        spawnItem,
        explode,
        getBlock,
        setBlock,
        spawnParticle,
        newSimpleForm,
        newCustomForm,
        regConsoleCmd,
        setMotd,
        sendCmdOutput,
        newIntPos,
        newFloatPos,
        getDisplayObjective,
        clearDisplayObjective,
        getScoreObjective,
        newScoreObjective,
        removeScoreObjective,
        getAllScoreObjectives,

        /** @deprecated */
        getAllScoreObjective: getAllScoreObjectives,
        /** @deprecated */
        getDisplayObjectives: getDisplayObjective,
        /** @deprecated */
        crash,
    },
    system,
    logger,
    data,
    money,
    network,
    lxl,
    NBT,
    Format,
    IntPos,
    FloatPos,
    DirectionAngle,
    LXL_Block,
    KVDatabase,
    JsonConfigFile,
    IniConfigFile,
    LXL_Device,
    LXL_Container,
    LXL_Entity,
    File,
    WSClient,
    LXL_BlockEntity,
    LXL_SimpleForm,
    LXL_CustomForm,
    LXL_Item,
    LXL_Player,
    LXL_Objective,
    NbtEnd,
    NbtByte,
    NbtShort,
    NbtInt,
    NbtLong,
    NbtFloat,
    NbtDouble,
    NbtString,
    NbtByteArray,
    NbtList,
    NbtCompound,

    /** @deprecated */
    file: File,
};

export const context = vm.createContext(bindings) as typeof bindings;
vm.runInContext(`globalThis = this`, context);
vm.runInContext(fs.readFileSync(path.join(__dirname, "../dep/BaseLib.js"), "utf8"), context);