import { ActorDefinitionIdentifier } from "bdsx/bds/actor";
import { Block } from "bdsx/bds/block";
import { BlockPos } from "bdsx/bds/blockpos";
import { ActorCommandSelector, Command, CommandItem, CommandMessage, CommandOutput, CommandPermissionLevel, CommandPosition, CommandPositionFloat, CommandRawEnum, CommandRawText, PlayerCommandSelector, SoftEnumUpdateType } from "bdsx/bds/command";
import { CommandOrigin, CommandOriginType, ServerCommandOrigin } from "bdsx/bds/commandorigin";
import { JsonValue } from "bdsx/bds/connreq";
import { MobEffectInstance } from "bdsx/bds/effects";
import { ServerLevel } from "bdsx/bds/level";
import { ServerPlayer } from "bdsx/bds/player";
import { serverInstance } from "bdsx/bds/server";
import { command } from "bdsx/command";
import { CommandParameterType } from "bdsx/commandparam";
import { StaticPointer } from "bdsx/core";
import { events } from "bdsx/event";
import { bedrockServer } from "bdsx/launcher";
import { bool_t, CxxString, float32_t, int32_t } from "bdsx/nativetype";
import { _tickCallback } from "bdsx/util";
import { IsInDebugMode, LockDebugModeForOnce } from "../debug";
import { logger, PrivateFields } from "./api_help";
import { FloatPos$newPos, IntPos$newPos } from "./base";
import { Block$newBlock } from "./block";
import { Entity$newEntity } from "./entity";
import { LXL_Events } from "./event";
import { Item$newItem } from "./item";
import { NbtCompound } from "./nbt";
import { LXL_Player, Player$newPlayer } from "./player";

export const OriginType = {
    Player: 0,
    CommandBlock: 1,
    MinecartCommandBlock: 2,
    DevConsole: 3,
    Test: 4,
    AutomationPlayer: 5,
    ClientAutomation: 6,
    Server: 7,
    Actor: 8,
    Virtual: 9,
    GameArgument: 10,
    EntityServer: 11,
    Precompiled: 12,
    GameDirectorEntity: 13,
    Script: 14,
    ExecuteContext: 15,
}

export const PermType = {
    Any: 0,
    GameMasters: 1,
    Op: 2,
}

export const ParamType = {
    Bool: 0,
    Int: 1,
    Float: 2,
    String: 3,
    Actor: 4,
    Player: 5,
    BlockPos: 6,
    Vec3: 7,
    RawText: 8,
    Message: 9,
    JsonValue: 10,
    Item: 11,
    Block: 12,
    Effect: 13,
    Enum: 14,
    SoftEnum: 15,
    ActorType: 16,
    Command: 17,
}

let CommandName: CommandRawEnum;
bedrockServer.afterOpen().then(() => CommandName = command.rawEnum("CommandName"));

function ParamType2CommandParam(type: number): CommandParameterType<any> {
    switch (type) {
        case ParamType.Bool: return bool_t;
        case ParamType.Int: return int32_t;
        case ParamType.Float: return float32_t;
        case ParamType.String: return CxxString;
        case ParamType.Actor: return ActorCommandSelector;
        case ParamType.Player: return PlayerCommandSelector;
        case ParamType.BlockPos: return CommandPosition;
        case ParamType.Vec3: return CommandPositionFloat;
        case ParamType.RawText: return CommandRawText;
        case ParamType.Message: return CommandMessage;
        case ParamType.JsonValue: return JsonValue;
        case ParamType.Item: return CommandItem;
        case ParamType.Block: return Command.Block;
        case ParamType.Effect: return Command.MobEffect;
        case ParamType.Enum: return "enum" as any;
        case ParamType.SoftEnum: return "softenum" as any;
        case ParamType.ActorType: return Command.ActorDefinitionIdentifier;
        case ParamType.Command: return CommandName;
        default: return void(0) as any;
    }
}

export enum ParamOption {
    None,
    EnumAutocompleteExpansion,
    HasSemanticConstraint,
}

export class LLSE_CommandOrigin {
    [PrivateFields]: CommandOrigin;

    get type() {
        return this[PrivateFields].getOriginType();
    }

    get typeName() {
        return CommandOriginType[this[PrivateFields].getOriginType()];
    }

    get name() {
        const name = this[PrivateFields].getName();
        Object.defineProperty(this, "name", {
            get() {
                return name;
            },
        });
        return name;
    }

    get pos() {
        const dim = this[PrivateFields].getDimension();
        return FloatPos$newPos(this[PrivateFields].getWorldPosition(), dim ? dim.getDimensionId() : 0);
    }

    get blockPos() {
        const dim = this[PrivateFields].getDimension();
        return IntPos$newPos(this[PrivateFields].getBlockPosition(), dim ? dim.getDimensionId() : 0);
    }

    get entity() {
        const entity = this[PrivateFields].getEntity();
        if (!entity) {
            return null;
        }
        return Entity$newEntity(entity);
    }

    get player() {
        const player = this[PrivateFields].getEntity();
        if (!player?.isPlayer()) {
            return null;
        }
        return Player$newPlayer(player);
    }

    getNbt() {
        const tag = new NbtCompound();
        this[PrivateFields].save(tag[PrivateFields]);
        return tag;
    }

    toString() {
        return "<CommandOrigin>";
    }
}

function CommandOriginClass$newCommandOrigin(p: CommandOrigin) {
    const newp = new LLSE_CommandOrigin();
    newp[PrivateFields] = p;
    return newp;
}

export class LLSE_CommandOutput {
    [PrivateFields]: CommandOutput;

    get empty() {
        return this[PrivateFields].empty();
    }

    // get type() {
    //     return this[PrivateFields].getType();
    // }

    get successCount() {
        return this[PrivateFields].getSuccessCount();
    }

    success(msg?: string) {
        this[PrivateFields].success(msg);
        return true;
    }

    addMessage(msg: string) {
        this[PrivateFields].addMessage(msg);
        return true;
    }

    error(msg: string) {
        this[PrivateFields].error(msg);
        return true;
    }

    toString() {
        return "<CommandOutput>";
    }
}

function CommandOutputClass$newCommandOutput(p: CommandOutput) {
    const newp = new LLSE_CommandOutput();
    newp[PrivateFields] = p;
    return newp;
}

function convertResults(value: any, origin: CommandOrigin) {
    if (value == null) {
        return null;
    }
    if (value instanceof ActorCommandSelector) {
        const arr = value.newResults(origin);
        return arr.map(i => Entity$newEntity(i));
    }
    if (value instanceof PlayerCommandSelector) {
        const arr = value.newResults(origin, ServerPlayer);
        return arr.map(i => Player$newPlayer(i));
    }
    if (value instanceof CommandPosition) {
        return IntPos$newPos(BlockPos.create(value.getPosition(origin)), origin.getDimension().getDimensionId() ?? -1);
    }
    if (value instanceof CommandPositionFloat) {
        return FloatPos$newPos(value.getPosition(origin), origin.getDimension().getDimensionId() ?? -1);
    }
    if (value instanceof CommandMessage) {
        return value.getMessage(origin);
    }
    if (value instanceof CommandRawText) {
        return value.text;
    }
    if (value instanceof JsonValue) {
        return value.value();
    }
    if (value instanceof CommandItem) {
        return Item$newItem(value.createInstance(1));
    }
    if (value instanceof Block) {
        return Block$newBlock(value, BlockPos.create(0,0,0), -1);
    }
    if (value instanceof MobEffectInstance) {
        return value.getComponentName();
    }
    if (value instanceof ActorDefinitionIdentifier) {
        return value.canonicalName;
    }
    return value;
}

export class LLSE_Command {
    [PrivateFields]: {
        hasRegistered: boolean;
        name: string;
        description: string;
        permission: number;
        flag: number;
        alias: string;
        parameterDatas: Map<string, {
            name: string,
            type: number;
            optional: boolean;
            options: ParamOption;
        }>;
        enums: Map<string, Set<string>>;
        softEnums: Map<string, Set<string>>;
        overloads: string[][];
        callback: (cmd: string, origin: LLSE_CommandOrigin, output: LLSE_CommandOutput, results: Record<string, any>) => void;
    };

    get name() {
        return this[PrivateFields].name;
    }

    get registered() {
        return this[PrivateFields].hasRegistered;
    }

    setEnum(name: string, values: string[]) {
        if (this[PrivateFields].hasRegistered) return null;
        if (values.length === 0 || typeof values[0] !== "string") return null;
        this[PrivateFields].enums.set(name, new Set(values));
        return name;
    }

    setAlias(alias: string) {
        if (this[PrivateFields].hasRegistered) return true;
        this[PrivateFields].alias = alias;
        return true;
    }

    mandatory(name: string, type: number, enumName = "", identifier = name, enumOptions = ParamOption.None) {
        if (this[PrivateFields].hasRegistered) return true;
        if (enumName) name = enumName;
        this[PrivateFields].parameterDatas.set(identifier, {
            name,
            type,
            optional: false,
            options: enumOptions,
        });
        return true; // They actually return a number
    }

    optional(name: string, type: number, enumName = "", identifier = name, enumOptions = ParamOption.None) {
        if (this[PrivateFields].hasRegistered) return true;
        if (enumName) name = enumName;
        this[PrivateFields].parameterDatas.set(identifier, {
            name,
            type,
            optional: true,
            options: enumOptions,
        });
        return true; // They actually return a number
    }

    setSoftEnum(name: string, values: string[]) {
        if (!this[PrivateFields].hasRegistered) {
            this[PrivateFields].softEnums.set(name, new Set(values));
        } else {
            if (!bedrockServer.isLaunched()) return "";
            const registry = serverInstance.minecraft.getCommands().getRegistry();
            if (!registry.hasSoftEnum(name)) {
                registry.addSoftEnum(name, values);
                return name;
            }
            registry.updateSoftEnum(SoftEnumUpdateType.Replace, name, values);
        }
        return name;
    }

    addSoftEnumValues(name: string, values: string[]) {
        if (!this[PrivateFields].hasRegistered) {
            const softEnum = this[PrivateFields].softEnums.get(name);
            if (softEnum) {
                for (const value of values) {
                    softEnum.add(value);
                }
            } else {
                this[PrivateFields].softEnums.set(name, new Set(values));
            }
        } else {
            if (!bedrockServer.isLaunched()) return false;
            const registry = serverInstance.minecraft.getCommands().getRegistry();
            if (!registry.hasSoftEnum(name)) {
                registry.addSoftEnum(name, values);
                return true;
            }
            registry.updateSoftEnum(SoftEnumUpdateType.Add, name, values);
        }
        return true;
    }

    removeSoftEnumValues(name: string, values: string[]) {
        if (!this[PrivateFields].hasRegistered) {
            const softEnum = this[PrivateFields].softEnums.get(name);
            if (softEnum) {
                for (const value of values) {
                    softEnum.delete(value);
                }
                return true;
            }
            return false;
        } else {
            if (bedrockServer.isLaunched()) {
                const registry = serverInstance.minecraft.getCommands().getRegistry();
                registry.updateSoftEnum(SoftEnumUpdateType.Remove, name, values);
            }
        }
        return true;
    }

    getSoftEnumValues(name: string) {
        if (bedrockServer.isLaunched()) {
            const registry = serverInstance.minecraft.getCommands().getRegistry();
            return registry.getSoftEnumValues(name);
        }
        return [];
    }

    getSoftEnumNames() {
        if (bedrockServer.isLaunched()) {
            const registry = serverInstance.minecraft.getCommands().getRegistry();
            const softEnumNames = [];
            for (const softEnumName of registry.softEnumLookup.keys()) {
                softEnumNames.push(softEnumName);
            }
            return softEnumNames;
        }
        return [];
    }

    overload(params: string[]) {
        if (this[PrivateFields].hasRegistered) return true; //TODO
        this[PrivateFields].overloads.push(params);
        return true;
    }

    setCallback(callback: (cmd: string, origin: LLSE_CommandOrigin, output: LLSE_CommandOutput, results: Record<string, any>) => void) {
        if (this[PrivateFields].hasRegistered) return true;
        this[PrivateFields].callback = callback;
        return true;
    }

    setup(callback?: Parameters<this["setCallback"]>[0]) {
        if (callback) {
            this.setCallback(callback);
        }

        if (this[PrivateFields].hasRegistered) return true;

        const registry = serverInstance.minecraft.getCommands().getRegistry();

        const factory = command.register(this[PrivateFields].name, this[PrivateFields].description, this[PrivateFields].permission, this[PrivateFields].flag);

        for (const [name, values] of this[PrivateFields].enums) {
            if (registry.hasEnum(name)) registry.addEnumValues("_" + name, [...values]);
            else registry.addEnumValues(name, [...values]);
        }

        for (const [name, values] of this[PrivateFields].softEnums) {
            if (registry.hasSoftEnum(name)) registry.addSoftEnum("_" + name, [...values]);
            else registry.addSoftEnum(name, [...values]);
        }

        if (this[PrivateFields].alias) registry.registerAlias(this[PrivateFields].name, this[PrivateFields].alias);

        for (const overload of this[PrivateFields].overloads) {
            const params: Record<string, [CommandParameterType<any>, any]> = {};
            for (const name of overload) {
                const param = this[PrivateFields].parameterDatas.get(name);
                if (!param) {
                    throw new Error(`Unknown parameter ${name}`);
                }
                if (param.type === ParamType.Enum) {
                    params[name] = [command.rawEnum(param.name), {
                        optional: param.optional,
                        options: param.options,
                    }];
                } else if (param.type === ParamType.SoftEnum) {
                    params[name] = [command.softEnum(param.name), {
                        optional: param.optional,
                        options: param.options,
                    }];
                } else {
                    params[name] = [ParamType2CommandParam(param.type), {
                        optional: param.optional,
                        options: param.options,
                    }];
                }
            }
            factory.overload((params, origin, output) => {
                const result: Record<string, any> = {};
                for (const [name, value] of Object.entries(params)) {
                    result[name] = convertResults(value, origin);
                }
                this[PrivateFields].callback(this[PrivateFields].name, CommandOriginClass$newCommandOrigin(origin), CommandOutputClass$newCommandOutput(output), result);
            }, params);
        }
        this[PrivateFields].hasRegistered = true;

        serverInstance.updateCommandList();
        return true;
    }

    toString() {
        return `<Command(${this[PrivateFields].name})>`;
    }
}

export function newCommand(cmd: string, description: string, permission = PermType.Any, flag = 0x80, alias = "") {
    const newp = new LLSE_Command();
    newp[PrivateFields] = {
        hasRegistered: false,
        name: cmd,
        description,
        permission,
        flag,
        alias,
        parameterDatas: new Map(),
        enums: new Map(),
        softEnums: new Map(),
        overloads: [],
        callback: () => {},
    };
    return newp;
}

export function runcmd(cmd: string): boolean {
    if (bedrockServer.isLaunched()) {
        LockDebugModeForOnce();
        const res = bedrockServer.executeCommand(cmd, false) as unknown as StaticPointer;
        return res.getBoolean(0);
    } else {
        return false;
    }
}

let lastOutput: string;
events.commandOutput.on(log => {
    lastOutput = log;
});
export function runcmdEx(cmd: string): { success: boolean, output: string } {
    if (bedrockServer.isLaunched()) {
        lastOutput = "";
        LockDebugModeForOnce();
        const res = bedrockServer.executeCommand(cmd, true) as unknown as StaticPointer;
        return { success: res.getBoolean(0), output: lastOutput };
    } else {
        return { success: false, output: "" };
    }
}

const playerCmdCallbacks = new Map<string, (player: LXL_Player, args: string[]) => void>();
const consoleCmdCallbacks = new Map<string, (args: string[]) => void>();

function LxlRegisterNewCmd(isPlayerCmd: boolean, cmd: string, description: string, level: number, func: Function) {
    if (cmd[0] == "/") {
        cmd = cmd.substring(1);
    }
    if (isPlayerCmd) {
        playerCmdCallbacks.set(cmd, func as any);
    } else {
        consoleCmdCallbacks.set(cmd, func as any);
    }
    bedrockServer.afterOpen().then(() => {
        const reg = serverInstance.minecraft.getCommands().getRegistry();
        const sign = reg.findCommand(cmd);
        if (sign) {
            sign.description = description;
            sign.permissionLevel = level;
            sign.flags = 0x80;
        } else {
            reg.registerCommand(cmd, description, level, 0, 0x80);
        }
        serverInstance.updateCommandList();
    });
    return true;
}

function LxlUnregisterOldCmd(isPlayerCmd: boolean, cmd: string) {
    if (cmd[0] == "/") {
        cmd = cmd.substring(1);
    }
    if (isPlayerCmd) {
        if (!playerCmdCallbacks.delete(cmd)) {
            return false;
        }
    } else {
        if (!consoleCmdCallbacks.delete(cmd)) {
            return false;
        }
    }
    bedrockServer.afterOpen().then(() => {
        const reg = serverInstance.minecraft.getCommands().getRegistry();
        const sign = reg.findCommand(cmd);
        if (sign) {
            sign.permissionLevel = CommandPermissionLevel.Internal;
        }
        serverInstance.updateCommandList();
    });
    return true;
}

events.command.on((cmd, _, ctx) => {
    if (!IsInDebugMode()) {
        if (cmd[0] == "/") {
            cmd = cmd.substring(1);
        }
        const player = ctx.origin.getEntity();
        if (player?.isPlayer()) {
            const cancelled = LXL_Events.onPlayerCmd.fire(Player$newPlayer(player), cmd);
            _tickCallback();
            if (cancelled) {
                return 0;
            }
            let matchedPrefix = "";
            let matchedCallback: Function | null = null;
            for (const [prefix, callback] of playerCmdCallbacks) {
                if (cmd === prefix || (cmd.indexOf(prefix) === 0 && cmd[prefix.length] === " ")) {
                    if (prefix.length > matchedPrefix.length) {
                        matchedPrefix = prefix;
                        matchedCallback = callback;
                    }
                }
            }
            if (matchedCallback) {
                const args = cmd.substring(matchedPrefix.length).match(/[^\s"]+|"[^"]+"/g, ) ?? [];
                for (let i = 0; i < args.length; i++) {
                    const m = /^"(.+)"$/.exec(args[i]);
                    if (m) {
                        args[i] = m[1];
                    }
                }
                try {
                    matchedCallback(Player$newPlayer(player), args);
                } catch (err) {
                    logger.error(err);
                }
                return 0;
            }
        } else {
            const cancelled = LXL_Events.onConsoleCmd.fire(cmd);
            _tickCallback();
            if (cancelled) {
                return 0;
            }
            let matchedPrefix = "";
            let matchedCallback: Function | null = null;
            for (const [prefix, callback] of consoleCmdCallbacks) {
                if (cmd === prefix || (cmd.indexOf(prefix) === 0 && cmd[prefix.length] === " ")) {
                    if (prefix.length > matchedPrefix.length) {
                        matchedPrefix = prefix;
                        matchedCallback = callback;
                    }
                }
            }
            if (matchedCallback) {
                const args = cmd.substring(matchedPrefix.length).match(/[^\s"]+|"[^"]+"/g, ) ?? [];
                for (let i = 0; i < args.length; i++) {
                    const m = /^"(.+)"$/.exec(args[i]);
                    if (m) {
                        args[i] = m[1];
                    }
                }
                try {
                    matchedCallback(args);
                } catch (err) {
                    logger.error(err);
                }
                return 0;
            }
        }
    }
});

/** @deprecated */
export function regPlayerCmd(cmd: string, description: string, callback: (player: LXL_Player, args: string[]) => void, level: number = 0) {
    return LxlRegisterNewCmd(true, cmd, description, level, callback);
}

/** @deprecated */
export function regConsoleCmd(cmd: string, description: string, callback: (args: string[]) => void, level: number = 0) {
    return LxlRegisterNewCmd(false, cmd, description, level, callback);
}

export function unregPlayerCmd(cmd: string) {
    return LxlUnregisterOldCmd(true, cmd);
}

export function unregConsoleCmd(cmd: string) {
    return LxlUnregisterOldCmd(false, cmd);
}

export function sendCmdOutput(output: string): boolean {
    bedrockServer.afterOpen().then(() => {
        let origin = ServerCommandOrigin.allocateWith("Server", <ServerLevel>serverInstance.minecraft.getLevel(), 5, null);
        let opt = CommandOutput.construct();
        opt.constructAs(3);
        opt.success(output);
        serverInstance.minecraft.getCommands().handleOutput(origin, opt);
        origin.destruct();
        opt.destruct();
    });
    return true;
}