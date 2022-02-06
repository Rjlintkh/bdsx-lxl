import { request as httpRequest } from "http";
import { request as httpsRequest } from "https";
import { URL } from "url";
import { requestSync } from "../dep/sync";
import { Buffer2ArrayBuffer, logger, PrivateFields } from "./api_help";
import WebSocket = require("ws");

export const network = {
    httpGet: (url: string, callback: (status: number, result: string) => any) => {
        const newUrl = new URL(url);
        const request = url.startsWith("https") ? httpsRequest : httpRequest;
        const req = request({
            port: newUrl.port,
            host: newUrl.host,
            path: newUrl.pathname + newUrl.hash + newUrl.search,
            method: "GET",
            headers: {
                "Accept": "*/*",
                "Content-Length": 0,
                "User-Agent": "cpp-httplib/0.7",
            }
        }, res => {
            let data = "";
            res.setEncoding("utf8");
            res.on("data", chunk => {
                data += chunk;
            });
            res.on("end", () => {
                try {
                    callback(res.statusCode!, data);
                } catch (err) {
                    logger.error(err);
                }
            });
        });
        req.on("error", () => {
            callback(-1, "");
        });
        req.end();
        return true;
    },
    httpPost: (url: string, data: string, type: string, callback: (status: number, result: string) => any) => {
        const newUrl = new URL(url);
        const request = url.startsWith("https") ? httpsRequest : httpRequest;
        const req = request({
            port: newUrl.port,
            host: newUrl.host,
            path: newUrl.pathname + newUrl.hash + newUrl.search,
            method: "POST",
            headers: {
                "Accept": "*/*",
                "Content-Type": type,
                "Content-Length": data.length,
                "User-Agent": "cpp-httplib/0.7",
            }
        }, res => {
            let data = "";
            res.setEncoding("utf8");
            res.on("data", chunk => {
                data += chunk;
            });
            res.on("end", () => {
                try {
                    callback(res.statusCode!, data);
                } catch (err) {
                    logger.error(err);
                }
            });
        });
        req.on("error", () => {
            callback(-1, "");
        });
        req.write(data);
        req.end();
        return true;
    },
    /** @deprecated */
    httpGetSync(url: string) {
        return requestSync(url);
    },
    /** @deprecated */
    newWebSocket() {
        return new WSClient();
    }
}

export class WSClient {
    static Open = 0;
    static Closing = 1;
    static Closed = 2;

    [PrivateFields]: {
        ws: WebSocket | null;
        listeners: {
            "onTextReceived": ((msg: string) => any)[];
            "onBinaryReceived": ((data: ArrayBuffer) => any)[];
            "onError": ((msg: string) => any)[];
            "onLostConnection": ((code: number) => any)[];
        }
    }

    constructor() {
        this[PrivateFields] = {
            ws: null,
            listeners: {
                "onTextReceived": [],
                "onBinaryReceived": [],
                "onError": [],
                "onLostConnection": [],
            }
        }
    }

    connect(target: string) {
        if (this[PrivateFields].ws) {
            this[PrivateFields].ws!.close();
        }

        this[PrivateFields].ws = new WebSocket(target);
        this[PrivateFields].ws!.on("message", (data: Buffer, isBinary: boolean) => {
            if (isBinary) {
                for (const listener of this[PrivateFields].listeners.onBinaryReceived) {
                    try {
                        listener(Buffer2ArrayBuffer(data as Buffer));
                    } catch (err) {
                        logger.error(err);
                    }
                }
            } else {
                for (const listener of this[PrivateFields].listeners.onTextReceived) {
                    try {
                        listener(data.toString());
                    } catch (err) {
                        logger.error(err);
                    }
                }
            }
        });
        this[PrivateFields].ws!.on("error", (err: Error) => {
            for (const listener of this[PrivateFields].listeners.onError) {
                try {
                    listener(err.message);
                } catch (err) {
                    logger.error(err);
                }
            }
        });
        this[PrivateFields].ws!.on("close", (code: number) => {
            for (const listener of this[PrivateFields].listeners.onLostConnection) {
                try {
                    listener(code);
                } catch (err) {
                    logger.error(err);
                }
            }
        });
        return true;
    }

    send(data: string) {
        if (!this[PrivateFields].ws) {
            return false;
        }

        this[PrivateFields].ws!.send(data);
        return true;
    }

    listen(event: string, callback: (...args: any[]) => any) {
        (this[PrivateFields].listeners as any)[event].push(callback);
    }

    close() {
        if (!this[PrivateFields].ws) {
            return false;
        }

        this[PrivateFields].ws!.close();
        return true;
    }

    shutdown() {
        if (!this[PrivateFields].ws) {
            return false;
        }

        this[PrivateFields].ws!.terminate();
        return true;
    }

    errorCode() {
        return 0;
    }
}