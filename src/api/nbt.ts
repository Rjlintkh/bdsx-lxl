import { ByteArrayTag, ByteTag, CompoundTag, DoubleTag, EndTag, FloatTag, Int64Tag, IntTag, ListTag, ShortTag, StringTag, Tag } from "bdsx/bds/nbt";
import { decay } from "bdsx/decay";
import { LlAPI } from "../dep/native";
import { SNBT } from "../dep/snbt";
import { logger, PrivateFields, Tag2Value, TODO } from "./api_help";

export class NBT {
    static parseSNBT(snbt: string) {
        const tag = SNBT.parse(snbt);
        if (tag.getId() === Tag.Type.Compound) {
            const nbt = new NbtCompound();
            nbt[PrivateFields] = <CompoundTag>tag;
            return nbt;
        }
        return null;
    }

    static parseBinaryNBT(nbt: string) {
        return TODO("NBT.parseBinaryNBT")() as NbtCompound;
    }

    static End = Tag.Type.End;
    static Byte = Tag.Type.Byte;
    static Short = Tag.Type.Short;
    static Int = Tag.Type.Int;
    static Long = Tag.Type.Int64;
    static Float = Tag.Type.Float;
    static Double = Tag.Type.Double;
    static ByteArray = Tag.Type.ByteArray;
    static String = Tag.Type.String;
    static List = Tag.Type.List;
    static Compound = Tag.Type.Compound;

    static createTag(type: number, data?: any) {
        switch (~~type) {
            case Tag.Type.End:
                return new NbtEnd();
            case Tag.Type.Byte:
                return new NbtByte(data ?? 0);
            case Tag.Type.Short:
                return new NbtShort(data ?? 0);
            case Tag.Type.Int:
                return new NbtInt(data ?? 0);
            case Tag.Type.Int64:
                return new NbtLong(data ?? 0);
            case Tag.Type.Float:
                return new NbtFloat(data ?? 0);
            case Tag.Type.Double:
                return new NbtDouble(data ?? 0);
            case Tag.Type.ByteArray:
                return new NbtByteArray(data ?? new Uint8Array());
            case Tag.Type.String:
                return new NbtString(data ?? "");
            case Tag.Type.List:
                return new NbtList(data ?? []);
            case Tag.Type.Compound:
                return new NbtCompound(data ?? {});
            default:
                return null;
        }
    }

    static newTag(type: number, data?: any) {
        return NBT.createTag(type, data);
    }
}

export class NbtEnd {
    [PrivateFields]: EndTag;

    constructor() {
        this[PrivateFields] = EndTag.allocate();
    }

    getType() {
        return Tag.Type.End;
    }

    toString(space = 0) {
        return LlAPI.Tag.toJson(this[PrivateFields], space);
    }

    set(data: any) {
        return true;
    }

    get() {
        return null;
    }
}

export class NbtByte {
    [PrivateFields]: ByteTag;

    constructor(data: number) {
        this[PrivateFields] = ByteTag.allocateWith(data);
    }

    getType() {
        return Tag.Type.Byte;
    }

    toString(space = 0) {
        return LlAPI.Tag.toJson(this[PrivateFields], space);
    }

    set(data: number) {
        this[PrivateFields].data = data;
        return true;
    }

    get() {
        return this[PrivateFields].data;
    }
}

export class NbtShort {
    [PrivateFields]: ShortTag;

    constructor(data: number) {
        this[PrivateFields] = ShortTag.allocateWith(data);
    }

    getType() {
        return Tag.Type.Short;
    }

    toString(space = 0) {
        return LlAPI.Tag.toJson(this[PrivateFields], space);
    }

    set(data: number) {
        this[PrivateFields].data = data;
        return true;
    }

    get() {
        return this[PrivateFields].data;
    }
}


export class NbtInt {
    [PrivateFields]: IntTag;

    constructor(data: number) {
        this[PrivateFields] = IntTag.allocateWith(data);
    }

    getType() {
        return Tag.Type.Int;
    }

    toString(space = 0) {
        return LlAPI.Tag.toJson(this[PrivateFields], space);
    }

    set(data: number) {
        this[PrivateFields].data = data;
        return true;
    }

    get() {
        return this[PrivateFields].data;
    }
}

export class NbtLong {
    [PrivateFields]: Int64Tag;

    constructor(data: number | string) {
        this[PrivateFields] = Int64Tag.allocateWith(SNBT.Utils.makeBin64fromNumbericString(data.toString()));
    }

    getType() {
        return Tag.Type.Int64;
    }

    toString(space = 0) {
        return LlAPI.Tag.toJson(this[PrivateFields], space);
    }

    set(data: number | string) {
        this[PrivateFields].dataAsString = data.toString();
        return true;
    }

    get() {
        return parseInt(this[PrivateFields].dataAsString);
    }
}

export class NbtFloat {
    [PrivateFields]: FloatTag;

    constructor(data: number) {
        this[PrivateFields] = FloatTag.allocateWith(data);
    }

    getType() {
        return Tag.Type.Float;
    }

    toString(space = 0) {
        return LlAPI.Tag.toJson(this[PrivateFields], space);
    }

    set(data: number) {
        return this[PrivateFields].data = data;
    }

    get() {
        return this[PrivateFields].data;
    }
}


export class NbtDouble {
    [PrivateFields]: DoubleTag;

    constructor(data: number) {
        this[PrivateFields] = DoubleTag.allocateWith(data);
    }

    getType() {
        return Tag.Type.Double;
    }

    toString(space = 0) {
        return LlAPI.Tag.toJson(this[PrivateFields], space);
    }

    set(data: number) {
        return this[PrivateFields].data = data;
    }

    get() {
        return this[PrivateFields].data;
    }
}

export class NbtByteArray {
    [PrivateFields]: ByteArrayTag;

    constructor(data: ArrayBufferView) {
        this[PrivateFields] = ByteArrayTag.allocate();
        if (data.byteLength) {
            this[PrivateFields].set(data as any);
        }
    }

    getType() {
        return Tag.Type.ByteArray;
    }

    toString(space = 0) {
        return LlAPI.Tag.toJson(this[PrivateFields], space);
    }

    set(data: ArrayBufferView) {
        if (data.byteLength) {
            this[PrivateFields].set(data as any);
        }
    }

    get() {
        return this[PrivateFields].toUint8Array();
    }
}

export class NbtString {
    [PrivateFields]: StringTag;

    constructor(data: string) {
        this[PrivateFields] = StringTag.allocateWith(data);
    }

    getType() {
        return Tag.Type.String;
    }

    toString(space = 0) {
        return LlAPI.Tag.toJson(this[PrivateFields], space);
    }

    set(data: string) {
        return this[PrivateFields].data = data;
    }

    get() {
        return this[PrivateFields].data;
    }
}

export function NbtList$setTag(thiz: NbtList, index: number, tag: NbtTag) {
    index = ~~index;
    if (index >= thiz[PrivateFields].size() || index < 0) {
        logger.error("Bad Index of NBT List!");
    } else if (thiz[PrivateFields].type !== tag.getType()) {
        logger.error("Set wrong type of element into NBT List!");
    } else {
        thiz[PrivateFields].set(index, (tag as NbtEnd)[PrivateFields]);
    }
    return thiz;
}
export class NbtList {
    [PrivateFields]: ListTag<Tag>;

    constructor(data: NbtTag[] = []) {
        this[PrivateFields] = ListTag.allocateWith(data.map(e => (e as NbtEnd)[PrivateFields]));
    }

    getType() {
        return Tag.Type.List;
    }

    toString(space = 0) {
        return LlAPI.Tag.toJson(this[PrivateFields], space);
    }

    getSize() {
        return this[PrivateFields].size();
    }

    getTypeOf(index: number) {
        index = parseInt(index.toString());
        if (index >= this[PrivateFields].size() || index < 0) {
            return null;
        }
        return this[PrivateFields].get(index).getId();
    }

    setEnd(index: number) {
        NbtList$setTag(this, index, new NbtEnd());
    }

    setByte(index: number, data: number) {
        NbtList$setTag(this, index, new NbtByte(data));
    }

    setShort(index: number, data: number) {
        NbtList$setTag(this, index, new NbtShort(data));
    }

    setInt(index: number, data: number) {
        NbtList$setTag(this, index, new NbtInt(data));
    }

    setLong(index: number, data: number | string) {
        NbtList$setTag(this, index, new NbtLong(data));
    }

    setFloat(index: number, data: number) {
        NbtList$setTag(this, index, new NbtFloat(data));
    }

    setDouble(index: number, data: number) {
        NbtList$setTag(this, index, new NbtDouble(data));
    }

    setByteArray(index: number, data: ArrayBufferView) {
        NbtList$setTag(this, index, new NbtByteArray(data));
    }

    setString(index: number, data: string) {
        NbtList$setTag(this, index, new NbtString(data));
    }

    setTag(index: number, tag: NbtTag) {
        index = ~~index;
        if (index >= this[PrivateFields].size() || index < 0) {
            logger.error("Bad Index of NBT List!");
            return null;
        }
        this[PrivateFields].set(index, (tag as NbtEnd)[PrivateFields]);
        return this;
    }

    addTag(tag: NbtTag) {
        this[PrivateFields].push((tag as NbtEnd)[PrivateFields]);
        return this;
    }

    removeTag(index: number) {
        index = ~~index;
        if (index >= this[PrivateFields].size() || index < 0) {
            logger.error("Bad Index of NBT List!");
            return null;
        }
        this[PrivateFields].data.splice(index, 1);
        return this;
    }

    getData(index: number) {
        index = ~~index;
        if (index >= this[PrivateFields].size() || index < 0) {
            return null;
        }
        return Tag2Value(this[PrivateFields].get(index));
    }

    getTag(index: number) {
        index = ~~index;
        if (index >= this[PrivateFields].size() || index < 0) {
            return null;
        }
        const tag = this[PrivateFields].get(index);
        if (tag) {
            const res = NBT.createTag(tag.getId());
            (res as NbtEnd)[PrivateFields] = tag;
            return res;
        }
        return null;
    }

    toArray() {
        const arr = [];
        for (const tag of this[PrivateFields].data) {
            arr.push(Tag2Value(tag, true));
        }
        return arr;
    }
}

export class NbtCompound {
    [PrivateFields]: CompoundTag;

    constructor(data: Record<string, NbtTag> = {}) {
        this[PrivateFields] = CompoundTag.allocate();
        for (const [key, tag] of Object.entries(data)) {
            this[PrivateFields].set(key, (tag as NbtEnd)[PrivateFields]);
        }
    }

    getType() {
        return Tag.Type.Compound;
    }

    toString(space = 0) {
        return LlAPI.Tag.toJson(this[PrivateFields], space);
    }

    getKeys() {
        const arr = [];
        for (const key of this[PrivateFields].data.keys()) {
            arr.push(key);
        }
        return arr;
    }

    getTypeOf(key: string) {
        const tag = this[PrivateFields].get(key);
        if (tag) {
            return tag.getId();
        }
        return null;
    }

    setEnd(key: string) {
        return this.setTag(key, new NbtEnd());
    }

    setByte(key: string, data: number) {
        return this.setTag(key, new NbtByte(data));
    }

    setShort(key: string, data: number) {
        return this.setTag(key, new NbtShort(data));
    }

    setInt(key: string, data: number) {
        return this.setTag(key, new NbtInt(data));
    }

    setLong(key: string, data: number | string) {
        return this.setTag(key, new NbtLong(data));
    }

    setFloat(key: string, data: number) {
        return this.setTag(key, new NbtFloat(data));
    }

    setDouble(key: string, data: number) {
        return this.setTag(key, new NbtDouble(data));
    }

    setByteArray(key: string, data: ArrayBufferView) {
        return this.setTag(key, new NbtByteArray(data));
    }

    setString(key: string, data: string) {
        return this.setTag(key, new NbtString(data));
    }

    setTag(key: string, tag: NbtTag) {
        this[PrivateFields].set(key, (tag as NbtEnd)[PrivateFields]);
        return this;
    }

    removeTag(key: string) {
        if (this[PrivateFields].data.has(key)) {
            this[PrivateFields].delete(key);
            return this;
        }
        logger.error("Key not found in NBT Compound!")
        return null;
    }

    getData(key: string) {
        const tag = this[PrivateFields].get(key);
        if (tag) {
            return Tag2Value(tag);
        }
        return null;
    }

    getTag(key: string) {
        const tag = this[PrivateFields].get(key);
        if (tag) {
            const res = NBT.createTag(tag.getId());
            (res as NbtEnd)[PrivateFields] = tag;
            return res;
        }
        return null;
    }

    toObject() {
        const obj: Record<string, any> = {};
        for (const [key, tag] of this[PrivateFields].data.entries()) {
            obj[key] = Tag2Value(tag.get());
        }
        return obj;
    }

    toSNBT() {
        return SNBT.stringify(this[PrivateFields]);
    }

    toBinaryNBT() {
        return LlAPI.CompoundTag.toBinaryNBT(this[PrivateFields]);
    }

    destroy() {
        this[PrivateFields].dispose();
        decay(this[PrivateFields]);
    }
}

export type NbtTag = NbtEnd | NbtByte | NbtShort | NbtInt | NbtLong | NbtFloat | NbtDouble | NbtByteArray | NbtString | NbtList | NbtCompound;