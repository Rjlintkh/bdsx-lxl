import { Actor, ActorDefinitionIdentifier, DimensionId, ItemActor, Mob } from "bdsx/bds/actor";
import { Vec3 } from "bdsx/bds/blockpos";
import { ServerPlayer } from "bdsx/bds/player";
import { bin } from "bdsx/bin";
import { StaticPointer } from "bdsx/core";
import { bedrockServer } from "bdsx/launcher";
import { LlAPI, MCAPI } from "../dep/native";
import { PrivateFields } from "./api_help";
import { DirectionAngle$newAngle, FloatPos, FloatPos$newPos, IntPos, IntPos$newPos } from "./base";
import { Block$newBlock } from "./block";
import { Container$newContainer } from "./container";
import { Item$newItem } from "./item";
import { NbtCompound } from "./nbt";
import { Player$newPlayer } from "./player";

export class LLSE_Entity {
    private [PrivateFields]?: Actor;

    getRawPtr() {
        return parseInt(this[PrivateFields]!.toString());
    }

    get name() {
        const entity = this[PrivateFields];
        if (!entity) {
            return null;
        }

        return entity.getName();
    }

    get type() {
        const entity = this[PrivateFields];
        if (!entity) {
            return null;
        }

        return LlAPI.Actor.getTypeName(entity);
    }

    get id() {
        const entity = this[PrivateFields];
        if (!entity) {
            return null;
        }

        return entity.getEntityTypeId();
    }

    get pos() {
        const entity = this[PrivateFields];
        if (!entity) {
            return null;
        }

        return FloatPos$newPos(LlAPI.Actor.getPosition(entity), entity.getDimensionId());
    }

    get blockPos() {
        const entity = this[PrivateFields];
        if (!entity) {
            return null;
        }

        return IntPos$newPos(LlAPI.Actor.getBlockPos(entity), entity.getDimensionId());
    }

    get maxHealth() {
        const entity = this[PrivateFields];
        if (!entity) {
            return null;
        }

        return entity.getMaxHealth();
    }

    get health() {
        const entity = this[PrivateFields];
        if (!entity) {
            return null;
        }

        return entity.getHealth();
    }

    get inAir() {
        const entity = this[PrivateFields];
        if (!entity) {
            return null;
        }

        return !LlAPI.Actor.isOnGround(entity) && !entity.isInWater();
    }

    get inWater() {
        const entity = this[PrivateFields];
        if (!entity) {
            return null;
        }

        return entity.isInWater();
    }

    get speed() {
        const entity = <Mob>this[PrivateFields];
        if (!entity) {
            return null;
        }

        return entity.getSpeed();
    }

    get direction() {
        const entity = this[PrivateFields];
        if (!entity) {
            return null;
        }

        const rot = entity.getRotation();
        return DirectionAngle$newAngle(rot.x, rot.y);
    }

    get uniqueId() {
        const entity = this[PrivateFields];
        if (!entity) {
            return null;
        }

        const id = entity.getUniqueIdBin();
        return bin.toString(id);
    }

    teleport(pos: IntPos | FloatPos): boolean;
    teleport(x: number, y: number, z: number, dimid: number): boolean;
    teleport(a0: any, a1?: any, a2?: any, a3?: any) {
        const entity = this[PrivateFields];
        if (!entity) {
            return null;
        }

        if (a0 instanceof IntPos || a0 instanceof FloatPos) {
            entity.teleport(Vec3.create(a0.x, a0.y, a0.z), a0.dimid);
            return true;
        } else if (typeof a0 === "number" && typeof a1 === "number" && typeof a2 === "number" && typeof a3 === "number") {
            entity.teleport(Vec3.create(a0, a1, a2), a3);
            return true;
        }
        return false;
    }

    kill() {
        const entity = this[PrivateFields];
        if (!entity) {
            return null;
        }

        entity.kill();
        return true;
    }

    isPlayer() {
        const entity = this[PrivateFields];
        if (!entity) {
            return null;
        }

        return entity.isPlayer();
    }

    toPlayer() {
        const entity = this[PrivateFields];
        if (!entity) {
            return null;
        }

        if (entity.isPlayer()) {
            return Player$newPlayer(<ServerPlayer>this[PrivateFields]);
        } else {
            return null;
        }
    }

    isItemEntity() {
        const entity = this[PrivateFields];
        if (!entity) {
            return null;
        }

        return entity.isItem();
    }

    toItem() {
        const entity = this[PrivateFields];
        if (!entity) {
            return null;
        }

        if (entity.isItem()) {
            return Item$newItem((<ItemActor>this[PrivateFields]).itemStack);
        } else {
            return null;
        }
    }

    getBlockStandingOn() {
        const entity = this[PrivateFields];
        if (!entity) {
            return null;
        }

        return Block$newBlock(MCAPI.Actor.getBlockPosCurrentlyStandingOn(entity), entity.getDimensionId());
    }

    getArmor() {
        const entity = this[PrivateFields];
        if (!entity) {
            return null;
        }

        return Container$newContainer(entity.getArmorContainer());
    }

    refreshItems() {
        const entity = <Mob>this[PrivateFields];
        if (!entity) {
            return null;
        }

        return LlAPI.Mob.refreshInventory(entity);
    }

    hasContainer() {
        const entity = this[PrivateFields];
        if (!entity) {
            return null;
        }

        const region = entity.getDimension().getBlockSource();
        const container = MCAPI.DropperBlockActor._getContainerAt(new StaticPointer(), region, entity.getPosition());
        return container !== null;
    }

    getContainer() {
        const entity = this[PrivateFields];
        if (!entity) {
            return null;
        }

        const region = entity.getDimension().getBlockSource();
        const container = MCAPI.DropperBlockActor._getContainerAt(new StaticPointer(), region, entity.getPosition());
        return container;
    }

    hurt(damage: number) {
        const entity = this[PrivateFields];
        if (!entity) {
            return null;
        }

        return LlAPI.Actor.hurtEntity(entity, damage);
    }

    setOnFire(time: number) {
        const entity = this[PrivateFields];
        if (!entity) {
            return null;
        }

        return LlAPI.Actor.setOnFire(entity, time, true);
    }

    getNbt() {
        const entity = this[PrivateFields];
        if (!entity) {
            return null;
        }

        const tag = new NbtCompound();
        tag[PrivateFields] = entity.allocateAndSave();
        return tag;
    }

    setNbt(nbt: NbtCompound) {
        const entity = this[PrivateFields];
        if (!entity) {
            return null;
        }

        const res = entity.load(nbt[PrivateFields]);
        entity.readAdditionalSaveData(nbt[PrivateFields]);
        MCAPI.Actor._sendDirtyActorData(entity);
        return res;
    }

    addTag(tag: string) {
        const entity = this[PrivateFields];
        if (!entity) {
            return null;
        }

        return entity.addTag(tag);
    }

    removeTag(tag: string) {
        const entity = this[PrivateFields];
        if (!entity) {
            return null;
        }

        return entity.removeTag(tag);
    }

    hasTag(tag: string) {
        const entity = this[PrivateFields];
        if (!entity) {
            return null;
        }

        return entity.hasTag(tag);
    }

    getAllTags(tag: string) {
        const entity = this[PrivateFields];
        if (!entity) {
            return null;
        }

        return LlAPI.Actor.getAllTags(entity);
    }

    /** @deprecated */
    setTag = this.setNbt;

    /** @deprecated */
    getTag = this.getNbt;
}

export function Entity$newEntity(p: Actor): LLSE_Entity {
    const newp = new LLSE_Entity();
    newp[PrivateFields] = p;
    return newp;
}

export function getAllEntities() {
    const entityList = bedrockServer.level.getEntities();
    const arr = new Array<LLSE_Entity>();
    for (const i of entityList) {
        arr.push(Entity$newEntity(i));
    }
    return arr;
}
export function spawnMob(name: string, pos: IntPos | FloatPos): LLSE_Entity;
export function spawnMob(name: string, x: number, y: number, z: number, dimid: DimensionId): LLSE_Entity;
export function spawnMob(name: string, a1: any, a2?: any, a3?: any, a4?: any) {
    let pos: Vec3;
    let dimId: DimensionId;
    if (a1 instanceof IntPos || a1 instanceof FloatPos) {
        pos = Vec3.create(a1.x, a1.y, a1.z);
        dimId = a1.dimid;
    } else {
        pos = Vec3.create(a1, a2, a3);
        dimId = a4;
    }
    const level = bedrockServer.level;
    const ad = ActorDefinitionIdentifier.constructWith(name);
    const entity = level.getSpawner().spawnMob(level.getDimension(dimId)!.getBlockSource(), ad, pos);
    if (entity !== null) {
        return Entity$newEntity(entity);
    } else {
        return null;
    }
}


export function explode(pos: IntPos | FloatPos, source: LLSE_Entity | null, power: number, range: number, isDestroy: number, isFire: number): boolean;
export function explode(x: number, y: number, z: number, dimid: DimensionId, source: LLSE_Entity | null, power: number, range: number, isDestroy: number, isFire: number): boolean;
export function explode(a0: any, a1?: any, a2?: any, a3?: any, a4?: any, a5?: any, a6?: any, a7?: any, a8?: any) {
    let pos: Vec3;
    let dimId: DimensionId;
    let source: LLSE_Entity | null,
        power: number,
        range: number,
        isDestroy: boolean,
        isFire: boolean;
    if (a0 instanceof IntPos || a0 instanceof FloatPos) {
        pos = Vec3.create(a0.x, a0.y, a0.z);
        dimId = a0.dimid;
        source = a1;
        power = a2;
        range = a3;
        isDestroy = a4;
        isFire = a5;
    } else {
        pos = Vec3.create(a0, a1, a2);
        dimId = a3;
        source = a4;
        power = a5;
        range = a6;
        isDestroy = a7;
        isFire = a8;
    }
    const level = bedrockServer.level;
    const region = level.getDimension(dimId)!.getBlockSource();
    level.explode(region, source?.[PrivateFields] ? source[PrivateFields]! : null, pos, range, isDestroy, isFire, power, false);
    return true;
}