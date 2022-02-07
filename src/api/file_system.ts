import { ArrayBuffer2Buffer, Buffer2ArrayBuffer, logger, PrivateFields } from "./api_help";
import fs = require("fs");
import path = require("path");
import rl = require("readline");

export class File {
    private [PrivateFields]: {
        fd: number;
        isBinary: boolean;
        pos: number;
        errno?: number;
    }

    path!: string;

    absolutePath!: string

    constructor(filepath: string, mode: 0|1|2, isBinary = false) {
        Object.defineProperty(this, "path", { value: filepath });
        filepath = path.join(process.cwd(), filepath);
        Object.defineProperty(this, "absolutePath", { value: filepath });
        fs.mkdirSync(path.dirname(filepath), { recursive: true });

        let newMode = "";
        if (mode === File.ReadMode) {
            newMode += "r";
        }
        if (mode === File.WriteMode) {
            newMode += "w";
        }
        if (mode === File.AppendMode) {
            newMode += "a";
        }
        this[PrivateFields].fd = fs.openSync(filepath, newMode);

        if (this[PrivateFields].fd === undefined) {
            logger.error(`Fail to Open File ${this.path}!`);
        }
        this[PrivateFields].isBinary = isBinary;
        this[PrivateFields].pos = 0;
    }

    get size() {
        try {
            return fs.fstatSync(this[PrivateFields].fd).size;
        } catch {
            return 0;
        }
    }

    readSync(cnt: number) {
        const buf = Buffer.alloc(cnt);
        let len = 0;
        try {
            len = fs.readSync(this[PrivateFields].fd, buf, 0, cnt, this[PrivateFields].pos);
        } catch { }
        this[PrivateFields].pos += len;
        if (this[PrivateFields].isBinary) {
            return Buffer2ArrayBuffer(buf.slice(0, len));
        } else {
            return buf.slice(0, len).toString();
        }
    }

    readLineSync() {
        const buf = Buffer.alloc(1024);
        let pos = 0;
        let len = 0;
        try {
            while (true) {
                len = fs.readSync(this[PrivateFields].fd, buf, pos, 1, this[PrivateFields].pos);
                if (len === 0 || buf[pos] === 10) {
                    break;
                }
                pos++;
            }
        } catch { }
        this[PrivateFields].pos += len;
        if (this[PrivateFields].isBinary) {
            return Buffer2ArrayBuffer(buf.slice(0, pos));
        } else {
            return buf.slice(0, pos).toString();
        }
    }

    readAllSync() {
        const buf = Buffer.alloc(this.size);
        let len = 0;
        try {
            len = fs.readSync(this[PrivateFields].fd, buf, 0, this.size, this[PrivateFields].pos);
        } catch { }
        this[PrivateFields].pos += len;
        if (this[PrivateFields].isBinary) {
            return Buffer2ArrayBuffer(buf.slice(0, len));
        } else {
            return buf.slice(0, len).toString();
        }
    }

    writeSync(str: string | ArrayBuffer) {
        if (str instanceof ArrayBuffer) {
            try {
                fs.writeSync(this[PrivateFields].fd, ArrayBuffer2Buffer(str), 0, str.byteLength, this[PrivateFields].pos);
                return true;
            } catch { }
        } else if (typeof str === "string") {
            try {
                fs.writeSync(this[PrivateFields].fd, Buffer.from(str), 0, Buffer.byteLength(str), this[PrivateFields].pos);
                return true;
            } catch { }
        } else {
            logger.error("Wrong type of argument in writeSync!");
        }
        return false;
    }

    writeLineSync(str: string) {
        str += "\n";
        try {
            fs.writeSync(this[PrivateFields].fd, Buffer.from(str), 0, Buffer.byteLength(str), this[PrivateFields].pos);
            return true;
        } catch { }
        return false;
    }

    read(cnt: number, callback: (result: string | ArrayBuffer| null) => void) {
        const buf = Buffer.alloc(cnt);
        fs.read(this[PrivateFields].fd, buf, 0, cnt, this[PrivateFields].pos,
            (err, bytesRead, buffer) => {
                if (err) {
                    this[PrivateFields].errno = err.errno;
                    callback(null);
                } else {
                    this[PrivateFields].pos += bytesRead;
                    if (this[PrivateFields].isBinary) {
                        callback(Buffer2ArrayBuffer(buffer.slice(0, bytesRead)));
                    } else {
                        callback(buffer.slice(0, bytesRead).toString());
                    }
                }
            });
        return true;
    }

    readLine(callback: (result: string | ArrayBuffer| null) => void) {
        const buf = Buffer.alloc(1024);
        let pos = 0;
        let len = 0;
        const readByte = () => {
            fs.read(this[PrivateFields].fd, buf, pos, 1, this[PrivateFields].pos,
                (err, bytesRead, buffer) => {
                    if (err) {
                        this[PrivateFields].errno = err.errno;
                        callback(null);
                    } else {
                        len += bytesRead;
                        if (bytesRead === 0 || buf[pos] === 10) {
                            this[PrivateFields].pos += len;
                            if (this[PrivateFields].isBinary) {
                                callback(Buffer2ArrayBuffer(buffer.slice(0, bytesRead)));
                            } else {
                                callback(buffer.slice(0, bytesRead).toString());
                            }
                        } else {
                            pos++;
                            setImmediate(() => readByte());
                        }
                    }
                });
        }
        readByte();
        return true;
    }

    readAll(callback: (result: string | ArrayBuffer| null) => void) {
        const buf = Buffer.alloc(this.size);
        fs.read(this[PrivateFields].fd, buf, 0, this.size, this[PrivateFields].pos,
            (err, bytesRead, buffer) => {
                if (err) {
                    this[PrivateFields].errno = err.errno;
                    callback(null);
                } else {
                    this[PrivateFields].pos += bytesRead;
                    if (this[PrivateFields].isBinary) {
                        callback(Buffer2ArrayBuffer(buffer.slice(0, bytesRead)));
                    } else {
                        callback(buffer.slice(0, bytesRead).toString());
                    }
                }
            });
        return true;
    }

    write(str: string | ArrayBuffer, callback: (result: boolean) => void = () => { }) {
        let buf: Buffer;
        if (str instanceof ArrayBuffer) {
            buf = ArrayBuffer2Buffer(str);
        } else if (typeof str === "string") {
            buf = Buffer.from(str);
        } else {
            logger.error("Wrong type of argument in write!");
            callback(true);
            return null;
        }

        fs.write(this[PrivateFields].fd, buf, 0, buf.byteLength, this[PrivateFields].pos,
            (err, bytesWritten) => {
                if (err) {
                    this[PrivateFields].errno = err.errno;
                    callback(false);
                } else {
                    this[PrivateFields].pos += bytesWritten;
                    callback(true);
                }
            });
        return true;
    }

    writeLine(str: string, callback: (result: boolean) => void = () => { }) {
        str += "\n";
        fs.write(this[PrivateFields].fd, Buffer.from(str), 0, Buffer.byteLength(str), this[PrivateFields].pos,
            (err, bytesWritten) => {
                if (err) {
                    this[PrivateFields].errno = err.errno;
                    callback(false);
                } else {
                    this[PrivateFields].pos += bytesWritten;
                    callback(true);
                }
            });
    }

    isEOF() {
        return this[PrivateFields].pos === this.size;
    }

    seekTo(pos: number, isRelative: boolean) {
        if (isRelative) {
            this[PrivateFields].pos += pos;
        } else {
            if (pos >= 0) {
                this[PrivateFields].pos = pos;
            } else {
                this[PrivateFields].pos = this.size + pos;
            }
        }
        return true;
    }

    setSize(size: number) {
        try {
            fs.ftruncateSync(this[PrivateFields].fd, size);
            return true;
        } catch { }
        return false;
    }

    close() {
        try {
            fs.closeSync(this[PrivateFields].fd);
            return true;
        } catch { }
        return false;
    }

    flush() {
        try {
            fs.fdatasyncSync(this[PrivateFields].fd);
            return true;
        } catch { }
        return false;
    }

    errorCode() {
        return this[PrivateFields].errno ?? 0;
    }

    clear() {
        return true;
    }

    static ReadMode = 0;
    static WriteMode = 1;
    static AppendMode = 2;

    static readFrom(filepath: string) {
        try {
            filepath = path.join(process.cwd(), filepath);
            return fs.readFileSync(filepath, "utf8").replace(/\r\n/g, "\n");
        } catch {
            return null;
        }
    }

    static writeTo(filepath: string, text: string) {
        try {
            filepath = path.join(process.cwd(), filepath);
            fs.mkdirSync(path.dirname(filepath), { recursive: true });
            fs.writeFileSync(filepath, text);
            return true;
        } catch {
            return false;
        }
    }

    static writeLine(filepath: string, text: string) {
        try {
            filepath = path.join(process.cwd(), filepath);
            fs.mkdirSync(path.dirname(filepath), { recursive: true });
            fs.appendFileSync(filepath, text);
            return true;
        } catch {
            return false;
        }
    }

    static createDir(dir: string) {
        try {
            dir = path.join(process.cwd(), dir);
            fs.mkdirSync(dir, { recursive: true });
            return true;
        } catch {
            logger.error(`Fail to Create Dir ${dir}!`);
            return false;
        }
    }

    static mkdir = File.createDir;

    static copy(from: string, to: string) {
        try {
            from = path.join(process.cwd(), from);
            to = path.join(process.cwd(), to);
            fs.copyFileSync(from, to);
            return true;
        } catch {
            logger.error(`Fail to Copy ${from}!`);
            return false;
        }
    }

    static move(from: string, to: string) {
        try {
            from = path.join(process.cwd(), from);
            to = path.join(process.cwd(), to);
            fs.renameSync(from, to);
            return true;
        } catch {
            logger.error(`Fail to Move ${from}!`);
            return false;
        }
    }

    static rename(from: string, to: string) {
        try {
            from = path.join(process.cwd(), from);
            to = path.join(process.cwd(), to);
            fs.renameSync(from, to);
            return true;
        } catch {
            logger.error(`Fail to Rename ${from}!`);
            return false;
        }
    }

    static delete(filepath: string) {
        try {
            filepath = path.join(process.cwd(), filepath);
            if (fs.existsSync(filepath)) {
                if (fs.statSync(filepath).isFile()) {
                    fs.unlinkSync(filepath);
                } else {
                    fs.rmdirSync(filepath, { recursive: true });
                }
            }
            return true;
        } catch {
            logger.error(`Fail to Delete ${filepath}!`);
            return false;
        }
    }

    static exists(filepath: string) {
        try {
            filepath = path.join(process.cwd(), filepath);
            return fs.existsSync(filepath);
        } catch {
            logger.error(`Fail to Check ${filepath}!`);
            return false;
        }
    }

    static getFileSize(filepath: string) {
        try {
            filepath = path.join(process.cwd(), filepath);
            if (fs.existsSync(filepath)) {
                const stat = fs.statSync(filepath);
                if (stat.isFile()) {
                    return stat.size;
                }
            }
            return 0;
        } catch {
            logger.error(`Fail to Get Size of ${filepath}!`);
            return null;
        }
    }

    static checkIsDir(filepath: string) {
        try {
            filepath = path.join(process.cwd(), filepath);
            return fs.existsSync(filepath) && fs.statSync(filepath).isDirectory();
        } catch {
            logger.error(`Fail to Get Type of ${filepath}!`);
            return false;
        }
    }

    static getFilesList(dir: string) {
        try {
            dir = path.join(process.cwd(), dir);
            if (fs.existsSync(dir)) {
                return fs.readdirSync(dir);
            }
            return [];
        } catch {
            return null;
        }
    }

    static open(filepath: string, mode: 0|1|2, isBinary = false) {
        return new File(filepath, mode, isBinary);
    }
}