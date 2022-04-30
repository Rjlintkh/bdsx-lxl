import { ClearInterval, SetInterval, SetTimeout } from "./api_help";
import { DirectionAngle, FloatPos, getBDSVersion, IntPos, newFloatPos, newIntPos } from "./base";
import { getBlock, LLSE_Block, setBlock, spawnParticle } from "./block";
import { LLSE_BlockEntity } from "./block_entity";
import { LLSE_Command, LLSE_CommandOrigin, LLSE_CommandOutput, newCommand, OriginType, ParamOption, ParamType, PermType, regConsoleCmd, regPlayerCmd, runcmd, runcmdEx, sendCmdOutput } from "./command";
import { LLSE_Container } from "./container";
import { data, IniConfigFile, JsonConfigFile, KVDatabase, money } from "./data";
import { LLSE_Device } from "./device";
import { explode, getAllEntities, LLSE_Entity, spawnMob } from "./entity";
import { listen } from "./event";
import { File } from "./file_system";
import { Format } from "./game_utils";
import { LLSE_CustomForm, LLSE_SimpleForm, newCustomForm, newSimpleForm } from "./gui";
import { LLSE_Item, newItem, spawnItem } from "./item";
import { ll } from "./ll";
import { logger } from "./logger";
import { NBT, NbtByte, NbtByteArray, NbtCompound, NbtDouble, NbtEnd, NbtFloat, NbtInt, NbtList, NbtLong, NbtShort, NbtString } from "./nbt";
import { network, WSClient } from "./network";
import { broadcast, getOnlinePlayers, getPlayer, LLSE_Player } from "./player";
import { clearDisplayObjective, getAllScoreObjectives, getDisplayObjective, getScoreObjective, LLSE_Objective, newScoreObjective, removeScoreObjective } from "./scoreboard";
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
    //////////////// 全局函数 ////////////////
    log,
    colorLog,
    fastLog,
    setTimeout: SetTimeout,
    setInterval: SetInterval,
    clearInterval: ClearInterval,
    //////////////// 静态类 ////////////////
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
        newCommand,

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
    ll,
    NBT,
    Format,
    PermType,
    ParamType,
    ParamOption,
    OriginType,
    //////////////// 实例类 ////////////////
    IntPos,
    FloatPos,
    DirectionAngle,
    LLSE_Block,
    KVDatabase,
    JsonConfigFile,
    IniConfigFile,
    LLSE_Device,
    LLSE_Container,
    LLSE_Entity,
    File,
    WSClient,
    LLSE_BlockEntity,
    LLSE_SimpleForm,
    LLSE_CustomForm,
    LLSE_Item,
    LLSE_Player,
    LLSE_Objective,
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
    LLSE_Command,
    LLSE_CommandOrigin,
    LLSE_CommandOutput,

    /** @deprecated */
    file: File,
};

export const context = vm.createContext(bindings) as typeof bindings;
vm.runInContext(`globalThis = this`, context);
vm.runInContext(fs.readFileSync(path.join(__dirname, "../dep/BaseLib.js"), "utf8"), context);