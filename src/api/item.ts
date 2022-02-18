import { DimensionId } from "bdsx/bds/actor";
import { Vec3 } from "bdsx/bds/blockpos";
import { ItemStack } from "bdsx/bds/inventory";
import { serverInstance } from "bdsx/bds/server";
import { LlAPI, MCAPI } from "../dep/native";
import { PrivateFields } from "./api_help";
import { FloatPos, IntPos } from "./base";
import { Entity$newEntity, LXL_Entity } from "./entity";
import { NbtCompound } from "./nbt";

export class LXL_Item {
    [PrivateFields]: ItemStack;

    getRawPtr() {
        return parseInt(this[PrivateFields].toString());
    }

    name: string;

    type: string;

    id: number;

    count: number;

    aux: number;

    set(item: LXL_Item) {
        const itemNew = item[PrivateFields];
        if (!itemNew) {
            return null;
        }
        return LlAPI.ItemStack.setItem(this[PrivateFields], itemNew);
    }

    clone() {
        return Item$newItem(this[PrivateFields].cloneItem());
    }

    isNull() {
        return this[PrivateFields].isNull();
    }

    setNull() {
        MCAPI.ItemStackBase.setNull(this[PrivateFields]);
        return true;
    }

    setAux(aux: number) {
        this[PrivateFields].setAuxValue(aux);
        return true;
    }

    setLore(names: string[]) {
        if (names.length === 0) {
            return false;
        }
        return this[PrivateFields].setCustomLore(names);
    }

    setNbt(nbt: NbtCompound) {
        this[PrivateFields].load(nbt[PrivateFields]);
        return true;
    }

    getNbt() {
        const tag = new NbtCompound();
        tag[PrivateFields] = this[PrivateFields].allocateAndSave();
        return tag;
    }

    /** @deprecated */
    setTag = this.setNbt;

    /** @deprecated */
    getTag = this.getNbt;
}

export function Item$newItem(p: ItemStack) {
    const newp = new LXL_Item();
    newp[PrivateFields] = p;
    Object.defineProperty(newp, "name", { value: p.getCustomName() });
    Object.defineProperty(newp, "type", { value: LlAPI.ItemStack.getTypeName(p) });
    Object.defineProperty(newp, "id", { value: p.getId() });
    Object.defineProperty(newp, "count", { value: LlAPI.ItemStack.getCount(p) });
    Object.defineProperty(newp, "aux", { value: LlAPI.ItemStack.getAux(p) });
    return newp;
}

export function newItem(name: string, count: number): LXL_Item | null;
export function newItem(nbt: NbtCompound): LXL_Item | null;
export function newItem(a0: any, a1?: any) {
    if (typeof a0 === "string") {
        const item = ItemStack.constructWith(a0, a1);
        if (item.valid) {
            return Item$newItem(item);
        } else {
            return null;
        }
    } else {
        const nbt = a0[PrivateFields];
        const item = ItemStack.constructWith("air", 1);
        item.load(nbt);
        if (item.valid) {
            return Item$newItem(item);
        } else {
            return null;
        }
    }
}

export function spawnItem(item: LXL_Item, pos: IntPos | FloatPos): LXL_Entity;
export function spawnItem(item: LXL_Item, x: number, y: number, z: number, dimid: DimensionId): LXL_Entity;
export function spawnItem(item: LXL_Item, a1: any, a2?: any, a3?: any, a4?: any) {
    let pos: Vec3;
    let dimId: DimensionId;
    if (a1 instanceof IntPos || a1 instanceof FloatPos) {
        pos = Vec3.create(a1.x, a1.y, a1.z);
        dimId = a1.dimid;
    } else {
        pos = Vec3.create(a1, a2, a3);
        dimId = a4;
    }
    const level = serverInstance.minecraft.getLevel();
    const actor = level.getSpawner().spawnItem(level.getDimension(dimId)!.getBlockSource(), item[PrivateFields], pos, 0);
    if (actor.isItem()) {
        return Entity$newEntity(actor);
    } else {
        return null;
    }
}