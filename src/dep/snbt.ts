import { ByteArrayTag, ByteTag, CompoundTag, DoubleTag, EndTag, FloatTag, Int64Tag, IntArrayTag, IntTag, ListTag, ShortTag, StringTag, Tag } from "bdsx/bds/nbt";
import { bin } from "bdsx/bin";
import { decay } from "bdsx/decay";
import { bin64_t } from "bdsx/nativetype";
import util = require("util");

export namespace SNBT {

    /** Converts a Stringified Named Binary Tag (SNBT) string into a Named Binary Tag (NBT) tag. */
    export function parse(text: string):Tag {
        const stream = new Stream(text);
        return stream.parse();
    }

    /** Converts a Named Binary Tag (NBT) tag to a Stringified Named Binary Tag (SNBT) string. */
    export function stringify(tag: Tag, indent?: number | string, destruct = true):string {
        let out = "";
        if (typeof indent === "number") {
            indent = " ".repeat(indent);
        }
        if (indent === "") {
            indent = undefined;
        }
        switch (tag.getId()) {
            case Tag.Type.Byte:
                out += `${(tag as ByteTag).data ?? 0}b`;
                break;
            case Tag.Type.Short:
                out += `${(tag as ShortTag).data ?? 0}s`;
                break;
            case Tag.Type.Int:
                out += `${(tag as IntTag).data ?? 0}`;
                break;
            case Tag.Type.Int64:
                let n = bin.toString((tag as Int64Tag).data)
                if (n === "\u0000") {
                    n = "0";
                }
                out += `${n}L`;
                break;
            case Tag.Type.Float:
                out += `${(tag as FloatTag).data}f`;
                break;
            case Tag.Type.Double:
                out += `${(tag as DoubleTag).data}d`;
                break;
            case Tag.Type.ByteArray:{
                out += `[B;`;
                let needEndIndent = false;
                for (const e of (tag as ByteArrayTag).toUint8Array()) {
                    indent && (out += "\n" + indent);
                    out += `${e}b,`;
                    needEndIndent = true;
                }
                out = out.replace(/,$/, "");
                indent && needEndIndent && (out += "\n");
                out += `]`;
                break;
            }
            case Tag.Type.String:
                out += `${util.inspect((tag as StringTag).data)}`;
                break;
            case Tag.Type.List:{
                out += `[`;
                let needEndIndent = false;
                for (const e of (tag as ListTag).data) {
                    indent && (out += "\n" + indent);
                    const id = e.getId();
                    let nested = SNBT.stringify(e, indent, false);
                    if (indent) {
                        if (id === Tag.Type.ByteArray || id === Tag.Type.List || id === Tag.Type.Compound || id === Tag.Type.IntArray) {
                            nested = nested.replace(/^./gm, (m, o) => {
                                if (o === 0) {
                                    return m;
                                }
                                return indent + m;
                            });
                        }
                    }
                    out += `${nested},`;
                    needEndIndent = true;
                }
                out = out.replace(/,$/, "");
                indent && needEndIndent && (out += "\n");
                out += `]`;
                break;
            }
            case Tag.Type.Compound:{
                out += `{`;
                let needEndIndent = false;
                for (const [k, _v] of (tag as CompoundTag).data.entries()) {
                    const v = _v.get();
                    const id = v.getId();
                    indent && (out += "\n" + indent);
                    let nested = SNBT.stringify(v, indent, false);
                    if (indent) {
                        if (id === Tag.Type.ByteArray || id === Tag.Type.List || id === Tag.Type.Compound || id === Tag.Type.IntArray) {
                            nested = nested.replace(/^./gm, (m, o) => {
                                if (o === 0) {
                                    return m;
                                }
                                return indent + m;
                            });
                        }
                    }
                    out += `${util.inspect(k)}:${indent ? " " : ""}${nested},`;
                    needEndIndent = true;
                }
                out = out.replace(/,$/, "");
                indent && needEndIndent && (out += "\n");
                out += `}`;
                break;
            }
            case Tag.Type.IntArray:{
                out += `[I;`;
                let needEndIndent = false;
                for (const e of (tag as IntArrayTag).toInt32Array()) {
                    indent && (out += "\n" + indent);
                    out += `${e},`;
                    needEndIndent = true;
                }
                out = out.replace(/,$/, "");
                indent && needEndIndent && (out += "\n");
                out += `]`;
            }
        }
        let parsed = parse(out);
        if (!Utils.findDiff(tag, parsed)) {
            console.warn("SNBT is not equal to the original NBT, please report the inconsistency.".red);
        }
        parsed.dispose();
        destruct && tag.dispose();
        destruct && decay(tag);
        return out;
    }

    export namespace Utils {
        /** Same functionality as bin.parse but covers more values */
        export function makeBin64fromNumbericString(number:string):bin64_t {
            if (!/^\d{1,20}$/.test(number) || number.length === 20 && number > "18446744073709551615") {
                return bin.make(Number(number), 8);
            }
            let dhi = 0, dlo;
            if (number.length > 14) {
                dhi =+ number.slice(0,number.length - 14);
                number = number.slice(number.length-14);
            }
            dlo =+ number;
            dlo += dhi * 0x107a4000;
            return bin.make64(dlo >>> 0, dhi * 0x5af3 + ~~(dlo / 0x100000000))
        }

        /** Logs the difference between two tags. */
        export function findDiff(primary: Tag, secondary: Tag, slient = true, path = "root"): boolean {
            let consistent = true;
            if (primary.getId() === secondary.getId()) {
                switch (secondary.getId()) {
                    case Tag.Type.List:
                        if ((<ListTag>primary).size() === (<ListTag>secondary).size()) {
                            for (let i = 0; i < (<ListTag>primary).size(); i++) {
                                consistent = findDiff((<ListTag>primary).get(i), (<ListTag>secondary).get(i), slient, `${path}[${i}]`) && consistent;
                            }
                        } else {
                            slient || console.info(`${path}: List size mismatch`);
                            consistent = false;
                        }
                        break;
                    case Tag.Type.Compound:
                        for (const [k, v] of (<CompoundTag>primary).data.entries()) {
                            const val1 = v.get();
                            const val2 = (<CompoundTag>secondary).get(k);
                            if (val2) {
                                consistent = findDiff(val1, val2, slient, `${path}->${k}`) && consistent;
                            } else {
                                slient || console.info(`${path}: Missing member "${k}".`);
                                consistent = false;
                            }
                        }
                        for (const k of (<CompoundTag>secondary).data.keys()) {
                            if (!((<CompoundTag>primary).data.has(k))) {
                                slient || console.info(`${path}: Unexpected member "${k}".`);
                                consistent = false;
                            }
                        }
                        break;
                    case Tag.Type.End:
                        break;
                    case Tag.Type.ByteArray:
                    case Tag.Type.IntArray:
                        if ((<ByteArrayTag>primary).size() === (<ByteArrayTag>secondary).size()) {
                            for (let i = 0; i < (<ByteArrayTag>primary).size(); i++) {
                                const val1 = (<ByteArrayTag>primary).value()[i];
                                const val2 = (<ByteArrayTag>secondary).value()[i];
                                if (val1 !== val2) {
                                    slient || console.info(`${path}: Mismatch at index ${i}, expected ${val1}, got ${val2}`);
                                    consistent = false;
                                }
                            }
                        } else {
                            slient || console.info(`${path}: Array size mismatch`);
                            consistent = false;
                        }
                        break;
                    case Tag.Type.Int64: {
                        const val1 = (<Int64Tag>primary).dataAsString;
                        const val2 = (<Int64Tag>secondary).dataAsString;
                        if (val1 !== val2) {
                            slient || console.info(`${path}: Data mismatch, expected ${val1}, got ${val2}`);
                            consistent = false;
                        }
                    }
                        break;
                    default: {
                        const val1 = (<ByteTag>primary).data;
                        const val2 = (<ByteTag>secondary).data;
                        if (val1 !== val2) {
                            slient || console.info(`${path}: Data mismatch, expected ${val1}, got ${val2}`);
                            consistent = false;
                        }
                    }
                }
            } else {
                slient || console.info(`${path}: Type mismatch, expected ${primary.getId()}, got ${secondary.getId()}`);
            }
            slient || consistent && path === "root" && console.info("Consistent!");
            return consistent;
        }
    }

    class Stream {
        protected stream: string;
        protected position: number = 0;
        constructor(text: string) {
            this.stream = text;
        }
        protected getCurrentString():string {
            const text = this.stream.slice(this.position);
            if (text[0] === " " || text[0] === "\n" || text[0] === "\r" || text[0] === "\t") {
                this.position += 1;
                return this.getCurrentString();
            }
            return text;
        }
        parse(allowTrailing = false):Tag {
            let out;
            switch (this.inferType()) {
                case Tag.Type.Byte:
                    out = this.readByte();
                    break;
                case Tag.Type.Short:
                    out = this.readShort();
                    break;
                case Tag.Type.String:
                    out = this.readString();
                    break;
                case Tag.Type.Int:
                    out = this.readInt();
                    break;
                case Tag.Type.Int64:
                    out = this.readInt64();
                    break;
                case Tag.Type.Float:
                    out = this.readFloat();
                    break;
                case Tag.Type.Double:
                    out = this.readDouble();
                    break;
                case Tag.Type.ByteArray:
                    out = this.readByteArray();
                    break;
                case Tag.Type.List:
                    out = this.readList();
                    break;
                case Tag.Type.Compound:
                    out = this.readCompound();
                    break;
                case Tag.Type.IntArray:
                    out = this.readIntArray();
                    break;
                default:
                    return EndTag.construct();
            }
            const trail = this.getCurrentString();
            if (trail !== "" && !allowTrailing) {
                throw new SyntaxError(`Unexpected end of input ${trail}`);
            }
            return out;
        }
        inferType():Tag.Type {
            switch (this.getCurrentString()[0]) {
                case "\"":
                case "\'":
                    return Tag.Type.String;
                case "[":
                    switch (this.getCurrentString()[1]) {
                        case "B":
                            return Tag.Type.ByteArray;
                        case "I":
                            return Tag.Type.IntArray;
                        }
                        return Tag.Type.List;
                case "{":
                    return Tag.Type.Compound;
            }
            const text = this.getCurrentString();
            if (text.startsWith("true") || text.startsWith("false") || /^[-+]?\d+(b|B)/.test(text)) {
                return Tag.Type.Byte;
            } else if (/^[-+]?\d+(s|S)/.test(text)) {
                return Tag.Type.Short;
            } else if (/^[-+]?[\d\\u]+(l|L)/.test(text)) {
                return Tag.Type.Int64;
            } else if (/^[-+]?\d*\.?[\de+]+(f|F)/.test(text)) {
                return Tag.Type.Float;
            } else if (/^[-+]?\d*\.?[\de+]+(d|D)/.test(text)) {
                return Tag.Type.Double;
            } else if (/^[-+]?\d*\.[\de+]+(?![bBsSlLfF])/.test(text)) {
                return Tag.Type.Double;
            } else if (/^[-+]?\d+(?![bBsSlLfF])/.test(text)) {
                return Tag.Type.Int;
            }
            return Tag.Type.End;
        }
        readByte():ByteTag {
            const text = this.getCurrentString();
            if (text.startsWith("true")) {
                this.position += 4;
                return ByteTag.allocateWith(1);
            } else if (text.startsWith("false")) {
                this.position += 5;
                return ByteTag.allocateWith(0);
            }
            const match = text.match(/^[-+]?\d+(b|B)/);
            if (match) {
                this.position += match[0].length;
                return ByteTag.allocateWith(Number(match[0].replace(/(b|B)$/, "")));
            } else {
                throw new SyntaxError(`Unexpected tokens in SNBT, stopped at ${this.position}`);
            }
        }
        readShort():ShortTag {
            const text = this.getCurrentString();
            const match = text.match(/^[-+]?\d+(s|S)/);
            if (match) {
                this.position += match[0].length;
                return ShortTag.allocateWith(Number(match[0].replace(/(s|S)$/, "")));
            } else {
                throw new SyntaxError(`Unexpected tokens in SNBT, stopped at ${this.position}`);
            }
        }
        readInt():IntTag {
            const text = this.getCurrentString();
            const match = text.match(/^[-+]?\d+(?![bBsSlLfF])/);
            if (match) {
                this.position += match[0].length;
                return IntTag.allocateWith(Number(match[0]));
            } else {
                throw new SyntaxError(`Unexpected tokens in SNBT, stopped at ${this.position}`);
            }
        }
        readInt64():Int64Tag {
            const text = this.getCurrentString();
            const match = text.match(/^[-+]?\d+(l|L)/);
            if (match) {
                this.position += match[0].length;
                return Int64Tag.allocateWith(Utils.makeBin64fromNumbericString(match[0].replace(/(l|L)$/, "")));
            } else {
                throw new SyntaxError(`Unexpected tokens in SNBT, stopped at ${this.position}`);
            }
        }
        readFloat():FloatTag {
            const text = this.getCurrentString();
            const match = text.match(/^[-+]?\d*\.?[\de+]+(f|F)/);
            if (match) {
                this.position += match[0].length;
                return FloatTag.allocateWith(Number(match[0].replace(/(f|F)$/, "")));
            } else {
                throw new SyntaxError(`Unexpected tokens in SNBT, stopped at ${this.position}`);
            }
        }
        readDouble():DoubleTag {
            const text = this.getCurrentString();
            const match = text.match(/^[-+]?\d*\.?[\de+]+(d|D)|^[-+]?\d*\.[\de+]+(?![bBsSlLfF])/);
            if (match) {
                this.position += match[0].length;
                return DoubleTag.allocateWith(Number(match[0].replace(/(d|D)$/, "")));
            } else {
                throw new SyntaxError(`Unexpected tokens in SNBT, stopped at ${this.position}`);
            }
        }
        readByteArray():ByteArrayTag {
            const text = this.getCurrentString();
            const match = text.match(/\[B;[\s]*(([-+]?\d+(b|B),?)*[\s]*)*]/);
            if (match) {
                const arr = [];
                for (const e of match[0].replace(/\s/g, "").replace(/^(.)+;|(.)$/g, "").split(",")) {
                    if (e !== "") {
                        try {
                            arr.push(Number(e.match(/^[-+]?\d+(?=b|B)/)![0]));
                        } catch {
                            throw new SyntaxError(`Unexpected tokens in SNBT, stopped at ${this.position}`);
                        }
                    }
                }
                this.position += match[0].length;
                const tag = ByteArrayTag.allocate();
                if (arr.length) {
                    tag.set(arr);
                }
                return tag;
            } else {
                throw new SyntaxError(`Unexpected tokens in SNBT, stopped at ${this.position}`);
            }
        }
        readString():StringTag {
            const text = this.getCurrentString();
            const match = text.match(/^"[^"\\]*(?:\\[\s\S][^"\\]*)*"|'[^'\\]*(?:\\[\s\S][^'\\]*)*'/);
            if (match) {
                this.position += match[0].length;
                return StringTag.allocateWith(match[0].replace(/^(.)|(.)$|\\/g, ""));
            } else {
                throw new SyntaxError(`Unexpected tokens in SNBT, stopped at ${this.position}`);
            }
        }
        readList():ListTag {
            const text = this.getCurrentString();
            if (text[0] === "[") {
                const arr = [];
                this.position += 1;
                while (this.getCurrentString()[0] !== "]") {
                    arr.push(this.parse(true));
                    if (this.getCurrentString()[0] === ",") {
                        this.position += 1;
                    }
                }
                this.position += 1;
                const tag = ListTag.allocate();
                for (const e of arr) {
                    tag.pushAllocated(e);
                }
                return tag;
            } else {
                throw new SyntaxError(`Unexpected tokens in SNBT, stopped at ${this.position}`);
            }
        }
        readCompoundKey():string {
            const text = this.getCurrentString();
            const match = text.match(/(^"[^"\\]*(?:\\[\s\S][^"\\]*)*"|'[^'\\]*(?:\\[\s\S][^'\\]*)*'|^[^:]+)(?=:)/);
            if (match) {
                this.position += match[0].length;
                let str = match[0].trimRight();
                if ((str.startsWith("\"") && str.endsWith("\"")) || (str.startsWith("'") && str.endsWith("'"))) {
                    str = str.replace(/^(.)|(.)$/g, "");
                }
                return str.replace(/\\/g, "");
            } else {
                throw new SyntaxError(`Unexpected tokens in SNBT, stopped at ${this.position}`);
            }
        }
        readCompound():CompoundTag {
            const text = this.getCurrentString();
            if (text[0] === "{") {
                const obj: Record<string, Tag> = {};
                this.position += 1;
                while (this.getCurrentString()[0] !== "}") {
                    const key = this.readCompoundKey();
                    if (this.getCurrentString()[0] === ":") {
                        this.position += 1;
                    } else {
                        throw new SyntaxError(`Unexpected tokens in SNBT, stopped at ${this.position}`);
                    }
                    obj[key] = this.parse(true);
                    if (this.getCurrentString()[0] === ",") {
                        this.position += 1;
                    }
                }
                this.position += 1;
                const tag = CompoundTag.allocate();
                for (const [k, v] of Object.entries(obj)) {
                    tag.setAllocated(k, v);
                }
                return tag;
            } else {
                throw new SyntaxError(`Unexpected tokens in SNBT, stopped at ${this.position}`);
            }
        }
        readIntArray():IntArrayTag {
            const text = this.getCurrentString();
            const match = text.match(/\[I;[\s]*(([-+]?\d+(?![bBsSlLfF]),?)*[\s]*)*]/);
            if (match) {
                const arr = [];
                for (const e of match[0].replace(/\s/g, "").replace(/^(.)+;|(.)$/g, "").split(",")) {
                    if (e !== "") {
                        try {
                            arr.push(Number(e.match(/^[-+]?\d+(?![bBsSlLfF])/)![0]));
                        } catch {
                            throw new SyntaxError(`Unexpected tokens in SNBT, stopped at ${this.position}`);
                        }
                    }
                }
                this.position += match[0].length;
                const tag = IntArrayTag.allocate();
                if (arr.length) {
                    tag.set(arr);
                }
                return tag;
            } else {
                throw new SyntaxError(`Unexpected tokens in SNBT, stopped at ${this.position}`);
            }
        }
    }
}