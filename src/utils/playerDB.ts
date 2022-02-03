import { MinecraftPacketIds } from "bdsx/bds/packetids";
import { events } from "bdsx/event";
import path = require("path");

const sqlite = new (require("sqlite-sync").constructor);

export const playerDB = sqlite.connect(path.join(process.cwd(), "./plugins/LiteLoader/PlayerDB.db"));
playerDB.run(
    `CREATE TABLE IF NOT EXISTS player (
        NAME TEXT PRIMARY KEY NOT NULL,
        XUID TEXT NOT NULL,
        UUID TEXT NOT NULL
    ) WITHOUT ROWID;
`);

events.packetAfter(MinecraftPacketIds.Login).on((pkt, ni) => {
    if (pkt.connreq) {
        const cert = pkt.connreq.cert;
        const NAME = cert.getIdentityName();
        const XUID = cert.getXuid();
        const UUID = cert.getIdentityString();
        playerDB.run(`INSERT INTO player (NAME, XUID, UUID) VALUES (?, ?, ?)`, [NAME, XUID, UUID]);
    }
});

events.serverLeave.on(() => {
    playerDB.close();
});