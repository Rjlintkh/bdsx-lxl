import { LXL_VERSION_MAJOR, LXL_VERSION_MINOR, LXL_VERSION_REVISION, LXL_VERSION_STATUS } from "../constants";
import { logger, pluginList, TODO } from "./api_help";

const modules = new Map<string, Function>();

export const lxl = {
    version() {
        return {
            major: LXL_VERSION_MAJOR,
            minor: LXL_VERSION_MINOR,
            revision: LXL_VERSION_REVISION,
            isBeta: LXL_VERSION_STATUS === "Beta",
        }
    },
    requireVersion(major: number, minor: number = 0, revision: number = 0) {
        return (LXL_VERSION_MAJOR >= major && LXL_VERSION_MINOR >= minor && LXL_VERSION_REVISION >= revision);
    },
    listPlugins() {
        return pluginList.map(p => p.pluginName);
    },
    import(name: string) {
        const func = modules.get(name);
        if (func) {
            return func;
        } else {
            return () => {
                logger.error(`Fail to import! Function [${name}] has not been exported!`);
                return null;
            }
        }
    },
    export(func: Function, name: string) {
        modules.set(name, func);
        return true;
    },
    require(filepath: string, remotePath?: string) {
        return TODO("lxl.require")();
    },
    eval(str: string) {
        return eval(str);
    },
    loadLangPack(filepath: string) {
        return null;
    },
    /** @deprecated */
    checkVersion(major: number, minor: number = 0, revision: number = 0) {
        return (LXL_VERSION_MAJOR >= major && LXL_VERSION_MINOR >= minor && LXL_VERSION_REVISION >= revision);
    }
}