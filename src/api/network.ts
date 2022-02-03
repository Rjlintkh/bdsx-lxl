import { request as httpRequest } from "http";
import { request as httpsRequest } from "https";
import { URL } from "url";
import { logger, TODO } from "./api_help";

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
    newWebSocket() {
        return new WSClient();
    }
}

export const WSClient = TODO("WSClient");