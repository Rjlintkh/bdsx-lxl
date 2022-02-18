import { ServerPlayer as _ServerPlayer } from "bdsx/bds/player";
import { LlAPI } from "../dep/native";
import { PrivateFields } from "./api_help";

export class LXL_Device {
    [PrivateFields]: _ServerPlayer;

    get ip() {
        return LlAPI.NetworkIdentifier.getIP(this[PrivateFields].getNetworkIdentifier());
    }

    get avgPing() {
        return LlAPI.Player.getAvgPing(this[PrivateFields]);
    }

    get avgPacketLoss() {
        return 0;
    }

    get os() {
        return LlAPI.Player.getDeviceName(this[PrivateFields]);
    }

    get clientId()  {
        return this[PrivateFields].deviceId;
    }
}

export function Device$newDevice(p: _ServerPlayer): LXL_Device {
    const newp = new LXL_Device();
    newp[PrivateFields] = p;
    return newp;
}