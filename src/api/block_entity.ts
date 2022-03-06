import { DimensionId } from "bdsx/bds/actor";
import { BlockActor } from "bdsx/bds/block";
import { PrivateFields } from "./api_help";
import { IntPos, IntPos$newPos } from "./base";
import { Block$newBlock } from "./block";
import { NbtCompound } from "./nbt";

export class LXL_BlockEntity {
    [PrivateFields]: BlockActor;

    getRawPtr() {
        return parseInt(this[PrivateFields].toString());
    }

    pos: IntPos;
    type: string;

    getNbt() {
        const tag = new NbtCompound();
        this[PrivateFields].save(tag[PrivateFields]);
        return tag;
    }

    setNbt(nbt: NbtCompound) {
        this[PrivateFields].load(nbt[PrivateFields]);
        return true;
    }

    getBlock() {
        return Block$newBlock(this[PrivateFields].getPosition(), this.pos.dimid);
    }
}

export function BlockEntity$newBlockEntity(be: BlockActor, dim: DimensionId): LXL_BlockEntity {
    const newp = new LXL_BlockEntity();
    newp[PrivateFields] = be;
    Object.defineProperty(newp, "type", { value: be.getType() });
    Object.defineProperty(newp, "pos", { value: IntPos$newPos(be.getPosition(), dim) });
    return newp;
}