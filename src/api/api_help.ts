import { ByteArrayTag, ByteTag, CompoundTag, Int64Tag, ListTag, Tag } from "bdsx/bds/nbt";
import { bin } from "bdsx/bin";
import { LLSEPlugin } from "../plugin";
import { Logger } from "../utils/logger";
import { NbtCompound, NbtList } from "./nbt";

export function DimId2Name(dimid: number): string {
    switch (dimid) {
        case 0:
            return "主世界";
        case 1:
            return "下界";
        case 2:
            return "末地";
        default:
            return "其他维度";
    }
}

export function Tag2Value(nbt: Tag, autoExpansion = false) {
    switch (nbt.getId()) {
        case Tag.Type.End:
            return 0;
        case Tag.Type.Byte:
        case Tag.Type.Short:
        case Tag.Type.Int:
        case Tag.Type.Float:
        case Tag.Type.Double:
        case Tag.Type.String:
            return (<ByteTag>nbt).data;
        case Tag.Type.Int64:
            return bin.toNumber((nbt as Int64Tag).data);
        case Tag.Type.ByteArray:
            return (<ByteArrayTag>nbt).toUint8Array().byteLength;
        case Tag.Type.List:
            if (!autoExpansion) {
                const value = new NbtList();
                value[PrivateFields] = <ListTag>nbt;
                return value;
            } else {
                return Tag2Value_ListHelper(<ListTag>nbt, autoExpansion);
            }
        case Tag.Type.Compound:
            if (!autoExpansion) {
                const value = new NbtCompound();
                value[PrivateFields] = <CompoundTag>nbt;
                return value;
            } else {
                return Tag2Value_CompoundHelper(<CompoundTag>nbt, autoExpansion);
            }
        default:
            return null;
    }
}

export function Tag2Value_ListHelper(nbt: ListTag, autoExpansion = false) {
    const res: any[] = [];
    for (const tag of nbt.data) {
        if (tag.getId() === Tag.Type.End) {Array
            res.push(null);
        } else {
            res.push(Tag2Value(tag, autoExpansion));
        }
    }
    return res;
}

export function Tag2Value_CompoundHelper(nbt: CompoundTag, autoExpansion = false) {
    const res: Record<string, any> = {};
    for (const [key, vari] of nbt.data.entries()) {
        const tag = vari.get();
        if (tag.getId() === Tag.Type.End) {
            res[key] = null;
        } else {
            res[key] = Tag2Value(tag, autoExpansion);
        }
    }
    return res;
}

export function Buffer2ArrayBuffer(buf: Buffer) {
    const ab = new ArrayBuffer(buf.length);
    const view = new Uint8Array(ab);
    for (let i = 0; i < buf.length; ++i) {
        view[i] = buf[i];
    }
    return ab;
}

export function ArrayBuffer2Buffer(ab: ArrayBuffer) {
    const buf = Buffer.alloc(ab.byteLength);
    const view = new Uint8Array(ab);
    for (let i = 0; i < buf.length; ++i) {
        buf[i] = view[i];
    }
    return buf;
}

export function JsonToValue(json: string): any {
    try {
        return JSON.parse(json);
    } catch {
        if (json.startsWith("{") && json.endsWith("}")) {
            logger.error("Failed to parse from Json.")
            return void 0;
        } else {
            logger.warn("Json解析发生错误！")
            return json;
        }
    }
}

export function ValueToJson(v: any, formatIndent?: number) {
    const res = JSON.stringify(v, (key, value) => {
        switch (typeof value) {
            case "string":
            case "boolean":
                return value;
            case "number":
                if (Number.isNaN(value)) {
                    return -9223372036854775808;
                }
                if (value === Infinity) {
                    return "inf";
                }
                if (value === -Infinity) {
                    return "-inf";
                }
                if (!Number.isInteger(value)) {
                    if (value.toString().split(".")[1].length >= 6) {
                        return value.toPrecision(6)
                    }
                }
                if (value >= 10000000000000000000) {
                    return value.toExponential(4);
                }
                return value.toString();
            case "function":
                return null;
            case "object":
                if (value === null || value === undefined) {
                    return null;
                }
                if (Array.isArray(value) || value.constructor.name === "Object") {
                    return value;
                }
                return "{}";
            default:
                return null;
        }
    }, formatIndent) ?? "";
    if (typeof res === "boolean") {
        return res ? "1" : "0";
    }
    return res;
}

export function StringifyValue(value: any): string {
    switch (typeof value) {
        case "string":
            return value;
        case "number":
            if (Number.isNaN(value)) {
                return "-9223372036854775808";
            }
            if (value === Infinity) {
                return "inf";
            }
            if (value === -Infinity) {
                return "-inf";
            }
            if (!Number.isInteger(value)) {
                if (value.toString().split(".")[1].length >= 6) {
                    return value.toPrecision(6)
                }
            }
            if (value >= 10000000000000000000) {
                return value.toExponential(4);
            }
            return value.toString();
        case "boolean":
                return value ? "1" : "0";
        case "function":
            return `<Function>`;
        case "object":
            if (value === null || value === undefined) {
                return `<Null>`;
            }
            if (ArrayBuffer.isView(value)) {
                return value.byteLength.toString();
            }
            if (value[PrivateFields] instanceof Tag) {
                return "<NbtClass>";
            }
            switch (value.constructor.name) {
                case "Array":
                    return `[${value.map(StringifyValue).join(", ")}]`;
                case "Object":
                    return `{${Object.entries(value).map(([k, v]) => `${k}:${StringifyValue(v)}`).join(",")}}`;
                case "IntPos":
                    return `${DimId2Name(value.dimid)}(${value.x},${value.y},${value.z})`;
                case "FloatPos":
                    return `${DimId2Name(value.dimid)}(${value.x.toPrecision(2)},${value.y.toPrecision(2)},${value.z.toPrecision(2)})`;
                case "LXL_Block":
                    return "<Block>";
                case "KVDatabase":
                    return "<Database>";
                case "JsonConfigFile":
                    return "<ConfJson>";
                case "IniConfigFile":
                    return "<ConfIni>";
                case "LXL_Device":
                    return "<DeviceInfo>";
                case "LXL_Container":
                    return "<Container>";
                case "LXL_Entity":
                    return "<Entity>";
                case "LXL_SimpleForm":
                    return "<SimpleForm>";
                case "LXL_CustomForm":
                    return "<CustomForm>";
                case "LXL_Item":
                    return "<Item>";
                case "LXL_Player":
                    return "<Player>";
            }
            return "{}";
        default:
            return `<Unknown>`;
        }
}

export function DateNow() {
    const date = new Date();
    const yyyy = date.getFullYear();
    const MM = String(date.getMonth() + 1).padStart(2, "0");
    const dd = String(date.getDate()).padStart(2, "0");
    return `${yyyy}-${MM}-${dd}`;
}

export function TimeNow() {
    const date = new Date();
    const HH = String(date.getHours()).padStart(2, "0");
    const mm = String(date.getMinutes()).padStart(2, "0");
    const ss = String(date.getSeconds()).padStart(2, "0");
    return `${HH}:${mm}:${ss}`;
}

export function GetSection(obj: Record<string, any>, section: string): any | undefined {
    if (section !== "") {
        const path = section.split(".");
        const p = path.shift()!;
        return GetSection(obj[p], path.join("."));
    }
    return obj;
}

export function CreateSection(obj: Record<string, any>, section: string): boolean {
    const path = section.split(".");
    if (section !== "") {
        const p = path.shift()!;
        if (!obj[p]) {
            obj[p] = {};
        }
        return CreateSection(obj[p], path.join("."));
    }
    return true;
}

const timeoutList = new Array<NodeJS.Timeout | null>();

export function SetTimeout(func: Function, msec: number): number | null;
export function SetTimeout(code: string, msec: number): number | null;
export function SetTimeout(a0: any, msec: number) {
    const timeout = setTimeout(() => {
        try {
            if (typeof a0 === "function") {
                a0();
            } else {
                eval(a0);
            }
        } catch (err) {
            logger.error(err);
        }
    }, msec).unref();
    timeoutList.push(timeout);
    return timeoutList.length;
}

export function SetInterval(func: Function, msec: number): number | null;
export function SetInterval(code: string, msec: number): number | null;
export function SetInterval(a0: any, msec: number) {
    const timeout = setInterval(() => {
        try {
            if (typeof a0 === "function") {
                a0();
            } else {
                eval(a0);
            }
        } catch (err) {
            logger.error(err);
        }
    }, msec).unref();
    timeoutList.push(timeout);
    return timeoutList.length;
}

export function ClearInterval(taskid: number) {
    const timeout = timeoutList[taskid - 1];
    if (timeout) {
        clearInterval(timeout);
    }
    return true;
}

export const playerDataDB = new Map<string, any>();

export const logger = new Logger("LiteXLoader");

export const pluginList = new Array<LLSEPlugin>();

export const PrivateFields = Symbol();

export function TODO(label: string = "The function"): any {
    return function(...args: any) {
        throw new ReferenceError(`TODO: ${label} is not implemented`);
    };
}