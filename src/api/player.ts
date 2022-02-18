import { Vec3 } from "bdsx/bds/blockpos";
import { Form, FormButton, ModalForm, SimpleForm as _SimpleForm } from "bdsx/bds/form";
import { CompoundTag, ListTag } from "bdsx/bds/nbt";
import { BossEventPacket } from "bdsx/bds/packets";
import { ServerPlayer } from "bdsx/bds/player";
import { ObjectiveSortOrder } from "bdsx/bds/scoreboard";
import { serverInstance } from "bdsx/bds/server";
import { bin } from "bdsx/bin";
import { bedrockServer } from "bdsx/launcher";
import { LlAPI, MCAPI } from "../dep/native";
import { logger, playerDataDB, PrivateFields, Tag2Value } from "./api_help";
import { DirectionAngle$newAngle, FloatPos, FloatPos$newPos, IntPos, IntPos$newPos } from "./base";
import { Block$newBlock } from "./block";
import { Container$newContainer } from "./container";
import { Device$newDevice } from "./device";
import { LXL_CustomForm, LXL_SimpleForm } from "./gui";
import { Item$newItem, LXL_Item } from "./item";
import { NbtCompound } from "./nbt";

export class LXL_Player {
    private [PrivateFields]?: ServerPlayer;

    getRawPtr() {
        return parseInt(this[PrivateFields]!.toString());
    }

    get name() {
        const player = this[PrivateFields];
        if (!player) {
            return null;
        }

        return player.getName();
    }

    get pos() {
        const player = this[PrivateFields];
        if (!player) {
            return null;
        }

        return FloatPos$newPos(LlAPI.Actor.getPosition(player), player.getDimensionId());
    }

    get blockPos() {
        const player = this[PrivateFields];
        if (!player) {
            return null;
        }

        return IntPos$newPos(LlAPI.Actor.getBlockPos(player), player.getDimensionId());
    }

    get realName() {
        const player = this[PrivateFields];
        if (!player) {
            return null;
        }

        return LlAPI.Player.getRealName(player);
    }

    get xuid() {
        const player = this[PrivateFields];
        if (!player) {
            return null;
        }

        return MCAPI.Player.getXuid(player);
    }

    get uuid() {
        const player = this[PrivateFields];
        if (!player) {
            return null;
        }

        if (LlAPI.Actor.isSimulatedPlayer(player)) {
            // const id = player.getUniqueIdBin();
            // return bin.toString(id).replace(/(.{8})(.{4})(.{4})(.{4})(.{12})/, "$1-$2-$3-$4-$5");
            return "";
        }

        return player.getCertificate().getIdentityString();
    }

    get permLevel() {
        const player = this[PrivateFields];
        if (!player) {
            return null;
        }

        return player.getCommandPermissionLevel();
    }

    get gameMode() {
        const player = this[PrivateFields];
        if (!player) {
            return null;
        }

        return player.getGameType();
    }

    get maxHealth() {
        const player = this[PrivateFields];
        if (!player) {
            return null;
        }

        return player.getMaxHealth();
    }

    get health() {
        const player = this[PrivateFields];
        if (!player) {
            return null;
        }

        return player.getHealth();
    }

    get inAir() {
        const player = this[PrivateFields];
        if (!player) {
            return null;
        }

        return !LlAPI.Actor.isOnGround(player) && !MCAPI.Actor.isInWater(player);
    }

    get inWater() {
        const player = this[PrivateFields];
        if (!player) {
            return null;
        }

        return MCAPI.Actor.isInWater(player);
    }

    get sneaking() {
        const player = this[PrivateFields];
        if (!player) {
            return null;
        }

        return player.isSneaking();
    }

    get speed() {
        const player = this[PrivateFields];
        if (!player) {
            return null;
        }

        return MCAPI.Player.getSpeed(player);
    }

    get direction() {
        const player = this[PrivateFields];
        if (!player) {
            return null;
        }

        const rot = player.getRotation();
        return DirectionAngle$newAngle(rot.x, rot.y);
    }

    get uniqueId() {
        const player = this[PrivateFields];
        if (!player) {
            return null;
        }

        const id = player.getUniqueIdBin();
        return bin.toString(id);
    }

    isOP() {
        const player = this[PrivateFields];
        if (!player) {
            return null;
        }

        return LlAPI.Player.isOP(player);
    }

    setPermLevel(level: number) {
        const player = this[PrivateFields];
        if (!player) {
            return null;
        }

        let res = false;
        const newPerm = ~~level;
        if (newPerm >= 0 && newPerm <= 4) {
            player.abilities.setCommandPermissionLevel(newPerm);
            player.syncAbilities();
            res = true;
        }
        return res;
    }

    setGameMode(mode: number) {
        const player = this[PrivateFields];
        if (!player) {
            return null;
        }

        let res = false;
        const newMode = ~~mode;
        if (newMode >= 0 && newMode <= 3) {
            player.setGameType(newMode);
            res = true;
        }
        return res;
    }

    runcmd(cmd: string) {
        const player = this[PrivateFields];
        if (!player) {
            return null;
        }

        return LlAPI.Player.runcmd(player, cmd);
    }

    teleport(pos: IntPos | FloatPos): boolean;
    teleport(x: number, y: number, z: number, dimid: number): boolean;
    teleport(a0: any, a1?: any, a2?: any, a3?: any) {
        const player = this[PrivateFields];
        if (!player) {
            return null;
        }

        if (a0 instanceof IntPos || a0 instanceof FloatPos) {
            player.teleport(Vec3.create(a0.x, a0.y, a0.z), a0.dimid);
            return true;
        } else if (typeof a0 === "number" && typeof a1 === "number" && typeof a2 === "number" && typeof a3 === "number") {
            player.teleport(Vec3.create(a0, a1, a2), a3);
            return true;
        }
        return false;
    }

    kill() {
        const player = this[PrivateFields];
        if (!player) {
            return null;
        }

        MCAPI.Mob.kill(player);
        return true;
    }

    kick(msg: string = "正在从服务器断开连接") {
        const player = this[PrivateFields];
        if (!player) {
            return null;
        }

        if (LlAPI.Actor.isSimulatedPlayer(player)) {
            return false;
        }

        return LlAPI.Player.kick(player, msg);
    }

    disconnect = this.kick;

    tell(msg: string, type = 0) {
        const player = this[PrivateFields];
        if (!player) {
            return null;
        }

        const newType = ~~type;
        if (newType >= 0 && newType <= 9) {
            type = newType;
        }
        LlAPI.Player.sendText(player, msg, type);
        return true;
    }

    talkAs(text: string) {
        const player = this[PrivateFields];
        if (!player) {
            return null;
        }

        return LlAPI.Player.talkAs(player, text);
    }

    sendText = this.tell;

    rename(newname: string) {
        const player = this[PrivateFields];
        if (!player) {
            return null;
        }

        player.setName(newname);
        return true;
    }

    setOnFire(time: number) {
        const player = this[PrivateFields];
        if (!player) {
            return null;
        }

        return LlAPI.Actor.setOnFire(player, time, true);
    }

    transServer(server: string, port: number) {
        const player = this[PrivateFields];
        if (!player) {
            return null;
        }

        if (LlAPI.Actor.isSimulatedPlayer(player)) {
            return false;
        }

        return LlAPI.Player.transferServer(player, server, port);
    }

    crash() {
        const player = this[PrivateFields];
        if (!player) {
            return null;
        }

        if (LlAPI.Actor.isSimulatedPlayer(player)) {
            return false;
        }

        return LlAPI.Player.crashClient(player);
    }

    hurt(damage: number) {
        const player = this[PrivateFields];
        if (!player) {
            return null;
        }

        return LlAPI.Actor.hurtEntity(player, damage);
    }

    refreshChunks() {
        const player = this[PrivateFields];
        if (!player) {
            return null;
        }

        return MCAPI.ServerPlayer.resendAllChunks(player);
    }

    giveItem(item: LXL_Item) {
        const player = this[PrivateFields];
        if (!player) {
            return null;
        }

        return LlAPI.Player.giveItem(player, item[PrivateFields]);
    }

    clearItem(type: string) {
        const player = this[PrivateFields];
        if (!player) {
            return null;
        }

        return LlAPI.Player.clearItem(player, type);
    }

    isSprinting() {
        const player = this[PrivateFields];
        if (!player) {
            return null;
        }

        return MCAPI.Mob.isSprinting(player);
    }

    setSprinting(sprinting: boolean) {
        const player = this[PrivateFields];
        if (!player) {
            return null;
        }

        MCAPI.Mob.setSprinting(player, sprinting);
        return true;
    }

    getBlockStandingOn() {
        const player = this[PrivateFields];
        if (!player) {
            return null;
        }

        return Block$newBlock(MCAPI.Actor.getBlockPosCurrentlyStandingOn(player), player.getDimensionId());
    }

    getDevice() {
        const player = this[PrivateFields];
        if (!player) {
            return null;
        }

        return Device$newDevice(player);
    }

    getHand() {
        const player = this[PrivateFields];
        if (!player) {
            return null;
        }

        return Item$newItem(player.getMainhandSlot());
    }

    getOffHand() {
        const player = this[PrivateFields];
        if (!player) {
            return null;
        }

        return Item$newItem(player.getOffhandSlot());
    }

    getInventory() {
        const player = this[PrivateFields];
        if (!player) {
            return null;
        }

        return Container$newContainer(player.getInventory().container);
    }

    getArmor() {
        const player = this[PrivateFields];
        if (!player) {
            return null;
        }

        return Container$newContainer(MCAPI.Actor.getArmorContainer(player));
    }

    getEnderChest() {
        const player = this[PrivateFields];
        if (!player) {
            return null;
        }

        return Container$newContainer(LlAPI.Player.getEnderChestContainer(player));
    }

    getRespawnPosition() {
        const player = this[PrivateFields];
        if (!player) {
            return null;
        }

        return IntPos$newPos(player.getSpawnPosition(), player.getSpawnDimension());
    }

    refreshItems() {
        const player = this[PrivateFields];
        if (!player) {
            return null;
        }

        return LlAPI.Player.refreshInventory(player);
    }

    addLevel(count: number) {
        const player = this[PrivateFields];
        if (!player) {
            return null;
        }

        MCAPI.Player.addLevels(player, count);
        return true;
    }

    getLevel() {
        const player = this[PrivateFields];
        if (!player) {
            return null;
        }

        return player.getExperienceLevel();
    }

    resetLevel() {
        const player = this[PrivateFields];
        if (!player) {
            return null;
        }

        return MCAPI.Player.resetPlayerLevel(player);
    }

    getXpNeededForNextLevel() {
        const player = this[PrivateFields];
        if (!player) {
            return null;
        }

        return player.getXpNeededForNextLevel();
    }

    addExperience(count: number) {
        const player = this[PrivateFields];
        if (!player) {
            return null;
        }

        player.addExperience(~~count);
        return true;
    }

    getScore(obj: string) {
        const player = this[PrivateFields];
        if (!player) {
            return null;
        }

        return LlAPI.Scoreboard.getScore(serverInstance.minecraft.getLevel().getScoreboard(), player, obj);
    }

    setScore(obj: string, score: number) {
        const player = this[PrivateFields];
        if (!player) {
            return null;
        }

        return LlAPI.Scoreboard.setScore(serverInstance.minecraft.getLevel().getScoreboard(), player, obj, score);
    }

    addScore(obj: string, score: number) {
        const player = this[PrivateFields];
        if (!player) {
            return null;
        }

        return LlAPI.Scoreboard.addScore(serverInstance.minecraft.getLevel().getScoreboard(), player, obj, score);
    }

    reduceScore(obj: string, score: number) {
        const player = this[PrivateFields];
        if (!player) {
            return null;
        }

        return LlAPI.Scoreboard.reduceScore(serverInstance.minecraft.getLevel().getScoreboard(), player, obj, score);
    }

    deleteScore(obj: string) {
        const player = this[PrivateFields];
        if (!player) {
            return null;
        }

        return LlAPI.Scoreboard.deleteScore(serverInstance.minecraft.getLevel().getScoreboard(), player, obj);
    }

    setSidebar(title: string, data: Record<string, number>, sortOrder: ObjectiveSortOrder = 1) {
        const player = this[PrivateFields];
        if (!player) {
            return null;
        }

        return LlAPI.Player.setSidebar(player, title, Object.entries(data), sortOrder);
    }

    removeSidebar() {
        const player = this[PrivateFields];
        if (!player) {
            return null;
        }

        return LlAPI.Player.removeSidebar(player);
    }

    setBossBar(title: string, percent: number) {
        const player = this[PrivateFields];
        if (!player) {
            return null;
        }

        percent = Math.min(Math.max(~~percent, 0), 100);
        player.setBossBar(title, percent / 100, BossEventPacket.Colors.Red);
        return true;
    }

    removeBossBar() {
        const player = this[PrivateFields];
        if (!player) {
            return null;
        }

        player.removeBossBar();
        return true;
    }

    sendSimpleForm(title: string, content: string, buttons: string[], images: string[], callback: (player: LXL_Player, id: number | null) => any) {
        const player = this[PrivateFields];
        if (!player) {
            return null;
        }

        if (buttons.length === 0 || typeof buttons[0] !== "string") {
            return null;
        }
        if (images.length !== buttons.length || typeof images[0] !== "string") {
            return null;
        }
        const form = new _SimpleForm(title, content, []);
        for (let i = 0; i < buttons.length; i++) {
            form.addButton(new FormButton(buttons[i], images[i].startsWith("textures/") ? "path" : "url", images[i]));
        }
        form.sendTo(player.getNetworkIdentifier(), data => {
            try {
                callback(this, data.response);
            } catch (e) {
                logger.error(e);
            }
        });
        return 1;
    }

    sendModalForm(title: string, content: string, button1: string, button2: string, callback: (player: LXL_Player, result: boolean | null) => any) {
        const player = this[PrivateFields];
        if (!player) {
            return null;
        }

        const form = new ModalForm(title, content);
        form.setButtonConfirm(button1);
        form.setButtonCancel(button2);
        form.sendTo(player.getNetworkIdentifier(), data => {
            try {
                callback(this, data.response);
            } catch (e) {
                logger.error(e);
            }
        });
        return 2;
    }

    sendCustomForm(json: string, callback: (player: LXL_Player, result: any[] | null) => any) {
        const player = this[PrivateFields];
        if (!player) {
            return null;
        }

        try {
            const form = new Form(JSON.parse(json));
            form.sendTo(player.getNetworkIdentifier(), data => {
                try {
                    callback(this, data.response);
                } catch (e) {
                    logger.error(e);
                }
            });
            return 3;
        } catch (e) {
            logger.error("Fail to parse Json string in sendCustomForm!");
            return null;
        }
    }

    sendForm(fm: LXL_SimpleForm, callback: (player: LXL_Player, result: number | null) => any): boolean;
    sendForm(fm: LXL_CustomForm, callback: (player: LXL_Player, result: any[] | null) => any): boolean;
    sendForm(fm: LXL_SimpleForm | LXL_CustomForm, callback: (player: LXL_Player, result: any) => any) {
        const player = this[PrivateFields];
        if (!player) {
            return null as any;
        }

        const id = (fm as LXL_SimpleForm)[PrivateFields].sendTo(player.getNetworkIdentifier(), data => {
            try {
                callback(this, data.response);
            } catch (e) {
                logger.error(e);
            }
        });
        return true;
    }

    setExtraData(name: string, data: any) {
        const player = this[PrivateFields];
        if (!player) {
            return null;
        }

        if (name === "") {
            return false;
        }
        playerDataDB.set(`${LlAPI.Player.getRealName(player)}-${name}`, data);
        return true;
    }

    getExtraData(name: string) {
        const player = this[PrivateFields];
        if (!player) {
            return null;
        }

        if (name === "") {
            return null;
        }
        return playerDataDB.get(`${LlAPI.Player.getRealName(player)}-${name}`);
    }

    delExtraData(name: string, data: any) {
        const player = this[PrivateFields];
        if (!player) {
            return null;
        }

        if (name === "") {
            return false;
        }
        playerDataDB.delete(`${LlAPI.Player.getRealName(player)}-${name}`);
        return true;
    }

    setNbt(nbt: NbtCompound) {
        const player = this[PrivateFields];
        if (!player) {
            return null;
        }

        const res = player.load(nbt[PrivateFields]);
        player.readAdditionalSaveData(nbt[PrivateFields]);
        MCAPI.Actor._sendDirtyActorData(player);
        return true;
    }

    getNbt() {
        const player = this[PrivateFields];
        if (!player) {
            return null;
        }

        const tag = new NbtCompound();
        tag[PrivateFields] = player.allocateAndSave();
        return tag;
    }

    addTag(tag: string) {
        const player = this[PrivateFields];
        if (!player) {
            return null;
        }

        return player.addTag(tag);
    }

    removeTag(tag: string) {
        const player = this[PrivateFields];
        if (!player) {
            return null;
        }

        return player.removeTag(tag);
    }

    hasTag(tag: string) {
        const player = this[PrivateFields];
        if (!player) {
            return null;
        }

        return player.hasTag(tag);
    }

    getAllTags(tag: string) {
        const player = this[PrivateFields];
        if (!player) {
            return null;
        }

        return LlAPI.Actor.getAllTags(player);
    }

    getAbilities() {
        const player = this[PrivateFields];
        if (!player) {
            return null;
        }

        let list = player.allocateAndSave();
        const res = Tag2Value((<CompoundTag>list.get("abilities")), true);
        list.destruct();
        return res;
    }

    getAttributes() {
        const player = this[PrivateFields];
        if (!player) {
            return null;
        }

        let list = player.allocateAndSave();
        const arr = [];
        for (const tag of (<ListTag>list.get("Attributes")).data) {
            arr.push(Tag2Value(tag, true));
        }
        list.destruct();
        return arr;
    }

    /** @deprecated */
    get ip() {
        const player = this[PrivateFields];
        if (!player) {
            return null;
        }

        return LlAPI.NetworkIdentifier.getIP(player.getNetworkIdentifier());
    }

    /** @deprecated */
    setTag = this.setNbt;

    /** @deprecated */
    getTag = this.getNbt;

    /** @deprecated */
    removeItem(index: number, count: number) {
        const player = this[PrivateFields];
        if (!player) {
            return null;
        }

        index = ~~index;
        const container = player.getInventory().container;
        if (index > LlAPI.Container.getSize(container)) {
            return false;
        }
        MCAPI.Container.removeItem(container, index, count);
        return true;
    }

    /** @deprecated */
    getAllItems() {
        const player = this[PrivateFields];
        if (!player) {
            return null;
        }

        const result = {} as any;

        const hand = player.getMainhandSlot();
        result.hand = Item$newItem(hand);

        const offHand = player.getOffhandSlot();
        result.offHand = Item$newItem(offHand);

        result.inventoryArr = [];
        const inventory = player.getInventory().container.getSlots();
        for (const item of inventory) {
            result.inventoryArr.push(Item$newItem(item));
        }

        result.armorArr = [];
        const armor = MCAPI.Actor.getArmorContainer(player).getSlots();
        for (const item of armor) {
            result.armorArr.push(Item$newItem(item));
        }

        result.endChestArr = [];
        const endChest = LlAPI.Player.getEnderChestContainer(player).getSlots();
        for (const item of endChest) {
            result.endChestArr.push(Item$newItem(item));
        }

        return result;
    }

    /** @deprecated */
    removeScore = this.deleteScore;
}

export function Player$newPlayer(p: ServerPlayer): LXL_Player {
    const newp = new LXL_Player();
    newp[PrivateFields] = p;
    return newp;
}

export function getPlayer(info: string): LXL_Player | null {
    if (bedrockServer.isLaunched() && info) {
        let target = info.toLowerCase();
        const playerList = serverInstance.minecraft.getLevel().getPlayers();

        let delta = 2147483647;
        let found: ServerPlayer | null = null;

        for (const p of playerList) {
            if (MCAPI.Player.getXuid(p) === target) {
                return Player$newPlayer(p);
            }

            const pName = p.getName().toLowerCase();
            if (pName.indexOf(target) === 0) {
                const curDelta = pName.length - target.length;
                if (curDelta === 0) {
                    return Player$newPlayer(p);
                }

                if (curDelta < delta) {
                    found = p;
                    delta = curDelta;
                }
            }
        }
        return found ? Player$newPlayer(found) : null;
    } else {
        return null;
    }
}

export function getOnlinePlayers() {
    const players = serverInstance.minecraft.getLevel().getPlayers();
    const list = new Array<LXL_Player>();
    for (const p of players) {
        list.push(Player$newPlayer(p));
    }
    return list;
}

export function broadcast(msg: string, type = 0) {
    const newType = ~~type;
    if (newType >= 0 && newType <= 9) {
        type = newType;
    }
    LlAPI.Level.broadcastText(serverInstance.minecraft.getLevel(), msg, type);
    return true;
}