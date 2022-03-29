import { LL_VERSION_MAJOR, LL_VERSION_MINOR, LL_VERSION_REVISION, LL_VERSION_STATUS } from "../constants";
import { logger, pluginList, TODO } from "./api_help";

const modules = new Map<string, Function>();

export const ll = {
    version() {
        return {
            major: LL_VERSION_MAJOR,
            minor: LL_VERSION_MINOR,
            revision: LL_VERSION_REVISION,
            isBeta: LL_VERSION_STATUS === "Beta",
        }
    },
    requireVersion(major: number, minor: number = 0, revision: number = 0) {
        return (LL_VERSION_MAJOR >= major && LL_VERSION_MINOR >= minor && LL_VERSION_REVISION >= revision);
    },
    listPlugins() {
        return pluginList.map(p => p.pluginFilePath);
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
    registerPlugin(name: string, Introduction = "", version: [number, number, number] = [1, 0, 0], otherInfomation: Record<string, string> = {}) {
        return true;
    },
    /** @deprecated */
    checkVersion(major: number, minor: number = 0, revision: number = 0) {
        return (LL_VERSION_MAJOR >= major && LL_VERSION_MINOR >= minor && LL_VERSION_REVISION >= revision);
    }
}