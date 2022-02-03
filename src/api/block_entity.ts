import { DimensionId } from "bdsx/bds/actor";
import { BlockActor } from "bdsx/bds/block";
import { MCAPI } from "../dep/native";
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
        return Block$newBlock(MCAPI.BlockActor.getPosition(this[PrivateFields]), this.pos.dimid);
    }
}

export function BlockEntity$newBlockEntity(be: BlockActor, dim: DimensionId): LXL_BlockEntity {
    const newp = new LXL_BlockEntity();
    newp[PrivateFields] = be;
    Object.defineProperty(newp, "type", { value: MCAPI.BlockActor.getType(be) });
    Object.defineProperty(newp, "pos", { value: IntPos$newPos(MCAPI.BlockActor.getPosition(be), dim) });
    return newp;
}