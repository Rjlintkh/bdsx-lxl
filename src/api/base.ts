import { BlockPos, Vec3 } from "bdsx/bds/blockpos";
import { SemVersion } from "bdsx/bds/server";
import { proc } from "bdsx/bds/symbols";
import { MCAPI } from "../dep/native";
import { DimId2Name, PrivateFields } from "./api_help";

export class IntPos {
    [PrivateFields]: {
        x: number;
        y: number;
        z: number;
        dimid: number;
    };

    constructor(x: number, y: number, z: number, dimid: number) {
        this[PrivateFields] = {
            x: ~~x,
            y: ~~y,
            z: ~~z,
            dimid: ~~dimid,
        }
    }

    get x(): number {
        return this[PrivateFields].x;
    }

    set x(x: number) {
        this[PrivateFields].x = ~~x;
    }

    get y(): number {
        return this[PrivateFields].y;
    }

    set y(y: number) {
        this[PrivateFields].y = ~~y;
    }

    get z(): number {
        return this[PrivateFields].z;
    }

    set z(z: number) {
        this[PrivateFields].z = ~~z;
    }

    get dimid() {
        return this[PrivateFields].dimid;
    }

    set dimid(dimid: number) {
        this[PrivateFields].dimid = ~~dimid;
    }

    get dim(): string {
        return DimId2Name(this[PrivateFields].dimid);
    }
}

export function IntPos$newPos(x: number, y: number, z: number, dimid: number): IntPos;
export function IntPos$newPos(b: BlockPos, dimid: number): IntPos;
export function IntPos$newPos(a0: any, a1: any, a2?: any, a3?: any): IntPos {
    if (typeof a0 === "number" && typeof a1 === "number" && typeof a2 === "number" && typeof a3 === "number") {
        return new IntPos(a0, a1, a2, a3);
    } else if (a0 instanceof BlockPos && typeof a1 === "number") {
        return new IntPos(a0.x, a0.y, a0.z, a1);
    }
    return void(0) as any;
}

export class FloatPos {
    [PrivateFields]: {
        x: number;
        y: number;
        z: number;
        dimid: number;
    };

    constructor(x: number, y: number, z: number, dimid: number) {
        this[PrivateFields] = {
            x: x,
            y: y,
            z: z,
            dimid: ~~dimid,
        }
    }

    get x(): number {
        return this[PrivateFields].x;
    }

    set x(x: number) {
        this[PrivateFields].x = x;
    }

    get y(): number {
        return this[PrivateFields].y;
    }

    set y(y: number) {
        this[PrivateFields].y = y;
    }

    get z(): number {
        return this[PrivateFields].z;
    }

    set z(z: number) {
        this[PrivateFields].z = z;
    }

    get dimid() {
        return this[PrivateFields].dimid;
    }

    set dimid(dimid: number) {
        this[PrivateFields].dimid = ~~dimid;
    }

    get dim(): string {
        return DimId2Name(this[PrivateFields].dimid);
    }
}

export function FloatPos$newPos(x: number, y: number, z: number, dimid: number): FloatPos;
export function FloatPos$newPos(v: Vec3, dimid: number): FloatPos;
export function FloatPos$newPos(a0: any, a1: any, a2?: any, a3?: any): FloatPos {
    if (typeof a0 === "number" && typeof a1 === "number" && typeof a2 === "number" && typeof a3 === "number") {
        return new FloatPos(a0, a1, a2, a3);
    } else if (a0 instanceof Vec3 && typeof a1 === "number") {
        return new FloatPos(a0.x, a0.y, a0.z, a1);
    }
    return void(0) as any;
}

export class DirectionAngle {
    pitch: number;
    yaw: number;

    constructor(pitch: number, yaw: number) {
        this.pitch = pitch;
        this.yaw = yaw;
    }

    toFacing(): number {
        let facing = -1;
        switch (MCAPI.Facing.convertYRotationToFacingDirection(this.yaw)) {
            case 2:
                facing = 0;
                break;
            case 3:
                facing = 2;
                break;
            case 4:
                facing = 3;
                break;
            case 5:
                facing = 1;
                break;
        }
        return facing;
    }

    valueOf() {
        return this.toFacing();
    }
}

export function DirectionAngle$newAngle(pitch: number, yaw: number): DirectionAngle {
    return new DirectionAngle(pitch, yaw);
}

export function newIntPos(x: number, y: number, z: number, dimid: number): IntPos {
    return IntPos$newPos(x, y, z, dimid);
}

export function newFloatPos(x: number, y: number, z: number, dimid: number): FloatPos {
    return FloatPos$newPos(x, y, z, dimid);
}

export function getBDSVersion(): string {
    return "v" + proc["SharedConstants::CurrentGameSemVersion"].as(SemVersion).fullVersionString;
}