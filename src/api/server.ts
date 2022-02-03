import { serverInstance } from "bdsx/bds/server";
import { capi } from "bdsx/capi";
import { StaticPointer } from "bdsx/core";
import { bedrockServer } from "bdsx/launcher";

export function setMotd(motd: string) {
    bedrockServer.afterOpen().then(() => {
        serverInstance.setMotd(motd);
    });
    return true;
}

export function crashBDS() {
    const ptr = new StaticPointer();
    capi.free(ptr);
    capi.free(ptr);
    return true;
}