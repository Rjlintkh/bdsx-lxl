import { DimensionId } from "bdsx/bds/actor";
import { Block, BlockSource } from "bdsx/bds/block";
import { BlockPos, Vec3 } from "bdsx/bds/blockpos";
import { CompoundTag } from "bdsx/bds/nbt";
import { serverInstance } from "bdsx/bds/server";
import { StaticPointer } from "bdsx/core";
import { NativeType } from "bdsx/nativetype";
import { daccess, LlAPI, MCAPI } from "../dep/native";
import { PrivateFields, Tag2Value } from "./api_help";
import { FloatPos, IntPos, IntPos$newPos } from "./base";
import { BlockEntity$newBlockEntity } from "./block_entity";
import { NbtCompound } from "./nbt";

export class LXL_Block {
    [PrivateFields]: Block;

    getRawPtr() {
        return parseInt(this[PrivateFields].toString());
    }

    name: string;
    type: string;
    id: string;
    pos: IntPos;

    get tileData() {
        return LlAPI.Block.getTileData(this[PrivateFields]);
    }

    setNbt(nbt: NbtCompound) {
        CompoundTag[NativeType.setter](this[PrivateFields], nbt[PrivateFields], 96);
        return true;
    }

    getNbt() {
        const tag = new NbtCompound();
        tag[PrivateFields].construct(daccess(this[PrivateFields], CompoundTag, 96));
        return tag;
    }

    getBlockState() {
        const tag = <CompoundTag>CompoundTag[NativeType.getter](this[PrivateFields] as any, 96);
        return Tag2Value(<CompoundTag>tag.get("states"), true);
    }

    hasContainer() {
        const region = serverInstance.minecraft.getLevel().getDimension(this.pos.dimid)!.getBlockSource();
        const container = MCAPI.DropperBlockActor._getContainerAt(new StaticPointer(), region, Vec3.create(this.pos.x, this.pos.y, this.pos.z));
        return container !== null;
    }

    getContainer() {
        const region = serverInstance.minecraft.getLevel().getDimension(this.pos.dimid)!.getBlockSource();
        const container = MCAPI.DropperBlockActor._getContainerAt(new StaticPointer(), region, Vec3.create(this.pos.x, this.pos.y, this.pos.z));
        return container;
    }

    hasBlockEntity() {
        return this[PrivateFields].hasBlockEntity();
    }

    getBlockEntity() {
        const region = serverInstance.minecraft.getLevel().getDimension(this.pos.dimid)!.getBlockSource();
        const be = region.getBlockEntity(BlockPos.create(this.pos.x, this.pos.y, this.pos.z));
        return be ? BlockEntity$newBlockEntity(be, this.pos.dimid) : null;
    }

    removeBlockEntity() {
        const region = serverInstance.minecraft.getLevel().getDimension(this.pos.dimid)!.getBlockSource();
        region.removeBlockEntity(BlockPos.create(this.pos.x, this.pos.y, this.pos.z));
        return true;
    }
}

export function Block$newBlock(p: Block, pos: BlockPos, dim: number): LXL_Block;
export function Block$newBlock(p: Block, pos: BlockPos, bs: BlockSource): LXL_Block;
export function Block$newBlock(pos: BlockPos, dim: number): LXL_Block;
// export function Block$newBlock(pos: IntVec4): Block;
export function Block$newBlock(a0: any, a1: any, a2?: any): LXL_Block {
    const newp = new LXL_Block();
    let p: Block | undefined = undefined!;
    let pos: BlockPos | undefined = void 0;
    let dim: number | undefined = undefined!;
    if (a0 instanceof Block) {
        p = a0;
        pos = a1;
        if (a2 instanceof BlockSource) {
            dim = a2.getDimensionId();
        } else {
            dim = ~~a2;
        }
    } else if (a0 instanceof BlockPos) {
        pos = a0;
        dim = ~~a1;
        const bs = serverInstance.minecraft.getLevel().getDimension(dim)!.getBlockSource();
        p = bs.getBlock(a0);
    }
    newp[PrivateFields] = p;
    Object.defineProperty(newp, "name", { value: p.getName() });
    Object.defineProperty(newp, "type", { value: p.getName() });
    Object.defineProperty(newp, "id", { value: p.blockLegacy.getBlockItemId() });
    Object.defineProperty(newp, "pos", { value: IntPos$newPos(pos!, dim) });
    return newp;
}

export function getBlock(pos: IntPos| FloatPos): LXL_Block;
export function getBlock(x: number, y: number, z: number, dimid: DimensionId): LXL_Block;
export function getBlock(a0: any, a1?: any, a2?: any, a3?: any) {
    let pos: BlockPos;
    let dimId: DimensionId;
    if (a0 instanceof IntPos || a0 instanceof FloatPos) {
        pos = BlockPos.create(a0.x, a0.y, a0.z);
        dimId = a0.dimid;
    } else {
        pos = BlockPos.create(a0, a1, a2);
        dimId = a3;
    }
    return Block$newBlock(pos, dimId);
}

export function setBlock(pos: IntPos| FloatPos, block: LXL_Block | string | NbtCompound, tiledata?: number): boolean;
export function setBlock(x: number, y: number, z: number, dimid: DimensionId, block: LXL_Block | string | NbtCompound, tiledata: number): boolean;
export function setBlock(a0: any, a1: any, a2?: any, a3?: any, a4?: any, a5?: any) {
    let pos: BlockPos;
    let dimId: DimensionId;
    let block: LXL_Block | string | NbtCompound;
    let tileData = 0;
    if (a0 instanceof IntPos || a0 instanceof FloatPos) {
        if (typeof a2 === "number") {
            tileData = a2;
        }
        pos = BlockPos.create(a0.x, a0.y, a0.z);
        dimId = a0.dimid;
        block = a1;
    } else {
        if (typeof a5 === "number") {
            tileData = a5;
        }
        pos = BlockPos.create(a0, a1, a2);
        dimId = a3;
        block = a4;
    }
    let newBlock!: Block;
    if (typeof block === "string") {
        newBlock = Block.constructWith(block)!;
        if (!newBlock) {
            return false;
        }
    } else if (block instanceof LXL_Block) {
        newBlock = block[PrivateFields];
    } else if (block instanceof NbtCompound) {
        newBlock = Block.constructWith("minecraft:stone")!;
        CompoundTag[NativeType.setter](newBlock, block[PrivateFields], 96);
    }
    const region = serverInstance.minecraft.getLevel().getDimension(dimId)!.getBlockSource();
    return region.setBlock(pos, LlAPI.BlockLegacy.toBlock(newBlock.blockLegacy, tileData));
}

export function spawnParticle(pos: IntPos | FloatPos, type: MinecraftParticleEffect): boolean;
export function spawnParticle(x: number, y: number, z: number, dimid: DimensionId, type: MinecraftParticleEffect): boolean;
export function spawnParticle(a0: any, a1: any, a2?: any, a3?: any, a4?: any) {
    let pos: Vec3;
    let dimId: DimensionId;
    let type: string;
    if (a0 instanceof IntPos || a0 instanceof FloatPos) {
        pos = Vec3.create(a0.x, a0.y, a0.z);
        dimId = a0.dimid;
        type = a1;
    } else {
        pos = Vec3.create(a0, a1, a2);
        dimId = a3;
        type = a4;
    }
    const level = serverInstance.minecraft.getLevel();
    level.spawnParticleEffect(type, pos, level.getDimension(dimId)!);
    return true;
}