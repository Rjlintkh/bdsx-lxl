import { events } from "bdsx/event";
import { logger } from "./api/api_help";
import { log } from "./api/script";
import { LXLPlugin } from "./plugin";

let jsdebug = false;
let locked = false;
const env = new LXLPlugin();
env.load();
export function IsInDebugMode() {
    return jsdebug;
}
export function LockDebugModeForOnce() {
    if (jsdebug) {
        locked = true;
    }
}
events.command.on((cmd, origin, ctx) => {
    if (ctx.origin.isServerCommandOrigin()) {
        if (cmd === "/jsdebug") {
            jsdebug = !jsdebug;
            locked = false;
            logger.info(`Debug mode ${jsdebug ? "begins" : "ended"}`);
            return 0;
        }
        if (jsdebug) {
            if (locked) {
                locked = false;
            } else {
                const output = env.run(cmd.substring(1));
                if (output.success) {
                    log(output.output);
                }
                return 0;
            }
        }
    }
});