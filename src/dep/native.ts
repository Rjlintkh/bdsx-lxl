import { Actor, Actor as _Actor, ActorDamageCause, ActorDamageSource, ActorUniqueID, Mob as _Mob } from "bdsx/bds/actor";
import { Block as _Block, BlockLegacy as _BlockLegacy, BlockSource as _BlockSource } from "bdsx/bds/block";
import { BlockPos as _BlockPos, Vec3, Vec3 as _Vec3 } from "bdsx/bds/blockpos";
import { Command } from "bdsx/bds/command";
import { ArmorSlot, Container as _Container, FillingContainer, ItemStack, ItemStack as _ItemStack } from "bdsx/bds/inventory";
import { Level as _Level } from "bdsx/bds/level";
import { ByteArrayTag, ByteTag, CompoundTag as _CompoundTag, FloatTag, Int64Tag, ListTag, StringTag, Tag as _Tag } from "bdsx/bds/nbt";
import { NetworkIdentifier as _NetworkIdentifier, ServerNetworkHandler as _ServerNetworkHandler } from "bdsx/bds/networkidentifier";
import { CommandRequestPacket, LevelChunkPacket, ScorePacketInfo, SetDisplayObjectivePacket, SetScorePacket, TextPacket, TransferPacket } from "bdsx/bds/packets";
import { Player as _Player, ServerPlayer } from "bdsx/bds/player";
import { ObjectiveSortOrder, Scoreboard as _Scoreboard, ScoreboardId as _ScoreboardId } from "bdsx/bds/scoreboard";
import { proc } from "bdsx/bds/symbols";
import { StaticPointer, VoidPointer } from "bdsx/core";
import { CxxVector } from "bdsx/cxxvector";
import { bedrockServer } from "bdsx/launcher";
import { ParamType } from "bdsx/makefunc";
import { nativeClass, NativeClass, nativeField } from "bdsx/nativeclass";
import { bool_t, CxxString, float32_t, int32_t, NativeType, uint64_as_float_t, uint8_t, void_t } from "bdsx/nativetype";
import { procHacker } from "bdsx/prochacker";
import { logger, TODO } from "../api/api_help";
import path = require("path");

export const symcall = ((...args: any[]) => {
    if (!(symcall as any).cache) {
        (symcall as any).cache = new Map();
    }
    if ((symcall as any).cache.has(args[0])) {
        return (symcall as any).cache.get(args[0]);
    }
    const func = (procHacker.js as any)(...args);
    (symcall as any).cache.set(args[0], func);
    return func;
}) as typeof procHacker.js;
export const symhook = ((...args: any[]) => {
    const hook = (procHacker.hooking as any)(...args);
    const func = (cb: any) => {
        return hook((...args: any[]) => {
            try {
                return cb(...args);
            } catch (e) {
                console.error(e);
            }
        });
    }
    return func;
}) as typeof procHacker.hooking;
export const dlsym = (name: keyof typeof proc) => proc[name];
export const daccess = <T extends ParamType>(ptr: VoidPointer, type: T, offset = 0) => <T extends {prototype:infer V} ? V : never>type[NativeType.getter](ptr as any, offset);

export namespace MCAPI {
    @nativeClass(0x1C)
    export class AABB extends NativeClass {
        @nativeField(Vec3)
        min: Vec3;
        @nativeField(Vec3)
        max: Vec3;
        @nativeField(bool_t)
        empty: bool_t;
    }
    export namespace Actor {
        export const _sendDirtyActorData: (thiz: _Actor) => void = symcall("?_sendDirtyActorData@Actor@@QEAAXXZ", void_t, null, _Actor);
        export const getBlockPosCurrentlyStandingOn = (thiz: _Actor) => symcall("?getBlockPosCurrentlyStandingOn@Actor@@QEBA?AVBlockPos@@PEAV1@@Z", _BlockPos, {this:_Actor, structureReturn:true}, _Actor).call(thiz, thiz);
    }
    export namespace BaseCommandBlock {
        export const getCommand: (thiz: StaticPointer) => string = symcall("?getCommand@BaseCommandBlock@@QEBAAEBV?$basic_string@DU?$char_traits@D@std@@V?$allocator@D@2@@std@@XZ", CxxString, null, StaticPointer);
    }
    export namespace DropperBlockActor {
        export const _getContainerAt: (thiz: StaticPointer, region: _BlockSource, pos: Vec3) => _Container = symcall("?_getContainerAt@DropperBlockActor@@AEAAPEAVContainer@@AEAVBlockSource@@AEBVVec3@@@Z", _Container, null, StaticPointer, _BlockSource, Vec3);
    }
    @nativeClass(null)
    export class Explosion extends NativeClass {
        @nativeField(Vec3)
        mPos: Vec3;
        @nativeField(float32_t)
        mRadius: float32_t;
        @nativeField(bool_t, 0x50)
        mFire: bool_t;
        @nativeField(bool_t)
        mBreaking: bool_t;
        @nativeField(bool_t)
        mAllowUnderwater: bool_t;
        @nativeField(ActorUniqueID, 0x58)
        mSourceID: ActorUniqueID;
        @nativeField(_BlockSource.ref())
        mRegion: _BlockSource;
        @nativeField(float32_t)
        mMaxResistance: float32_t;
        @nativeField(bool_t)
        mInOverrideWater: bool_t;
    }
    export namespace HitResult {
        export const getEntity: (thiz: StaticPointer) => _Actor = symcall("?getEntity@HitResult@@QEBAPEAVActor@@XZ", _Actor.ref(), null, StaticPointer);
    }
    export enum ItemUseMethod {
        EquipArmor,
        Eat,
        Attack,
        Consume,
        Throw,
        Shoot,
        Place,
        FillBottle,
        FillBucket,
        PourBucket,
        UseTool,
        Interact,
        Retrieved,
        Dyed,
        Traded,
        Unknown = -1,
    }
    export namespace Mob {
        export const _hurt: (thiz: _Actor, source: ActorDamageSource, damage: number, knock: boolean, ignite: boolean) => boolean = symcall("?_hurt@Mob@@MEAA_NAEBVActorDamageSource@@M_N1@Z", bool_t, null, _Actor, ActorDamageSource, float32_t, bool_t, bool_t);
    }
    @nativeClass(null)
    export class NpcAction extends NativeClass {
        @nativeField(VoidPointer)
        vftable: VoidPointer;
        @nativeField(uint8_t)
        mType: NpcActionType;
        @nativeField(uint8_t)
        mMode: NpcActionMode;
        @nativeField(CxxString)
        mButtonName: CxxString;
        @nativeField(CxxString)
        mEvaluatedButtonName: CxxString;
        @nativeField(CxxString)
        mText: CxxString;
        @nativeField(CxxString)
        mEvaluatedText: CxxString;
    }
    export enum NpcActionType {
        UrlAction,
        CommandAction,
        InvalidAction,
    }
    export enum NpcActionMode {
        Button,
        OnClose,
    }
    export namespace NpcActionsContainer {
        export const getActionAt: (thiz: StaticPointer, index: uint64_as_float_t) => NpcAction = symcall("?getActionAt@NpcActionsContainer@@QEAAPEAVNpcAction@@_K@Z", NpcAction, null, StaticPointer, uint64_as_float_t);
    }
    @nativeClass(0x30)
    class NpcCommandAction$SavedCommand extends NativeClass {
        @nativeField(CxxString)
        mCommandLine: CxxString;
        @nativeField(Command.ref())
        mCommand: Command;
        @nativeField(int32_t)
        mVersion: int32_t;
    }
    @nativeClass(null)
    export class NpcCommandAction extends NativeClass {
        @nativeField(CxxVector.make(NpcCommandAction$SavedCommand), 0x98)
        mCommands: CxxVector<NpcCommandAction.SavedCommand>;
    }
    export namespace NpcCommandAction {
        export const SavedCommand = NpcCommandAction$SavedCommand;
        export type SavedCommand = NpcCommandAction$SavedCommand;
    }
    @nativeClass(0x38)
    export class NpcSceneDialogueData extends NativeClass {
    }
    export namespace NpcSceneDialogueData {
        export const NpcSceneDialogueData: (thiz: NpcSceneDialogueData, component: StaticPointer, npc: Actor, data: string) => void = symcall("??0NpcSceneDialogueData@@QEAA@AEAVNpcComponent@@AEAVActor@@AEBV?$basic_string@DU?$char_traits@D@std@@V?$allocator@D@2@@std@@@Z", void_t, null, MCAPI.NpcSceneDialogueData, StaticPointer, _Actor, CxxString);
        export const getActionsContainer: (thiz: NpcSceneDialogueData) => StaticPointer = symcall("?getActionsContainer@NpcSceneDialogueData@@UEAAAEAUNpcActionsContainer@@XZ", StaticPointer, null, MCAPI.NpcSceneDialogueData);
    }
    export namespace ServerNetworkHandler {
        const $handle$CommandRequestPacket = symcall("?handle@ServerNetworkHandler@@UEAAXAEBVNetworkIdentifier@@AEBVCommandRequestPacket@@@Z", void_t, null, _ServerNetworkHandler, _NetworkIdentifier.ref(), CommandRequestPacket.ref());
        const $handle$TextPacket = symcall("?handle@ServerNetworkHandler@@UEAAXAEBVNetworkIdentifier@@AEBVTextPacket@@@Z", void_t, null, _ServerNetworkHandler, _NetworkIdentifier.ref(), TextPacket.ref());
        export const handle = (thiz: _ServerNetworkHandler, source: _NetworkIdentifier, packet: CommandRequestPacket | TextPacket) => {
            if (packet instanceof CommandRequestPacket) {
                return $handle$CommandRequestPacket(thiz, source, packet);
            } else if (packet instanceof TextPacket) {
                return $handle$TextPacket(thiz, source, packet);
            }
        }
    }
    export namespace SignBlockActor {
        export enum SignType {
            Oak,
            Spruce,
            Birch,
            Jungle,
            Acacia,
            DarkOak,
            Crimson,
            Warped,
        }
    }
    export namespace VanillaBlocks {
        export const mWoodenDoor = dlsym("?mWoodenDoor@VanillaBlocks@@3PEBVBlock@@EB");
        export const mWoodenDoorSpruce = dlsym("?mWoodenDoorSpruce@VanillaBlocks@@3PEBVBlock@@EB");
        export const mWoodenDoorBirch = dlsym("?mWoodenDoorBirch@VanillaBlocks@@3PEBVBlock@@EB");
        export const mWoodenDoorJungle = dlsym("?mWoodenDoorJungle@VanillaBlocks@@3PEBVBlock@@EB");
        export const mWoodenDoorAcacia = dlsym("?mWoodenDoorAcacia@VanillaBlocks@@3PEBVBlock@@EB");
        export const mWoodenDoorDarkOak = dlsym("?mWoodenDoorDarkOak@VanillaBlocks@@3PEBVBlock@@EB");
        export const mIronDoor = dlsym("?mIronDoor@VanillaBlocks@@3PEBVBlock@@EB");
        export const mCrimsonDoor = dlsym("?mCrimsonDoor@VanillaBlocks@@3PEBVBlock@@EB");
        export const mWarpedDoor = dlsym("?mWarpedDoor@VanillaBlocks@@3PEBVBlock@@EB");

        export const mWallSign = dlsym("?mWallSign@VanillaBlocks@@3PEBVBlock@@EB");
        export const mSign = dlsym("?mSign@VanillaBlocks@@3PEBVBlock@@EB");
        export const mSpruceWallSign = dlsym("?mSpruceWallSign@VanillaBlocks@@3PEBVBlock@@EB");
        export const mSpruceSign = dlsym("?mSpruceSign@VanillaBlocks@@3PEBVBlock@@EB");
        export const mBirchWallSign = dlsym("?mBirchWallSign@VanillaBlocks@@3PEBVBlock@@EB");
        export const mBirchSign = dlsym("?mBirchSign@VanillaBlocks@@3PEBVBlock@@EB");
        export const mJungleWallSign = dlsym("?mJungleWallSign@VanillaBlocks@@3PEBVBlock@@EB");
        export const mJungleSign = dlsym("?mJungleSign@VanillaBlocks@@3PEBVBlock@@EB");
        export const mAcaciaWallSign = dlsym("?mAcaciaWallSign@VanillaBlocks@@3PEBVBlock@@EB");
        export const mAcaciaSign = dlsym("?mAcaciaSign@VanillaBlocks@@3PEBVBlock@@EB");
        export const mDarkOakWallSign = dlsym("?mDarkOakWallSign@VanillaBlocks@@3PEBVBlock@@EB");
        export const mDarkOakSign = dlsym("?mDarkOakSign@VanillaBlocks@@3PEBVBlock@@EB");
        export const mCrimsonWallSign = dlsym("?mCrimsonWallSign@VanillaBlocks@@3PEBVBlock@@EB");
        export const mCrimsonStandingSign = dlsym("?mCrimsonStandingSign@VanillaBlocks@@3PEBVBlock@@EB");
        export const mWarpedWallSign = dlsym("?mWarpedWallSign@VanillaBlocks@@3PEBVBlock@@EB");
        export const mWarpedStandingSign = dlsym("?mWarpedStandingSign@VanillaBlocks@@3PEBVBlock@@EB");
    }
    export namespace WeakEntityRef {
        export const tryUnwrap: (thiz: StaticPointer) => _Player | null = symcall("??$tryUnwrap@VPlayer@@$$V@WeakEntityRef@@QEBAPEAVPlayer@@XZ", _Player, null, StaticPointer);
    }
}

export namespace LlAPI {
    export namespace Actor {
        export function getAllTags(thiz: _Actor) {
            let nbt = thiz.allocateAndSave();
            const res = [];
            for (const tag of (<ListTag<StringTag>>nbt.get("Tags")).data) {
                res.push(tag.data);
            }
            nbt.dispose();
            return res;
        }
        export function getBlockPos(thiz: _Actor) {
            const pos = thiz.getPosition();
            pos.y = pos.y + 0.5;
            return Vec3.toBlockPos(pos);
        }
        export function getPosition(thiz: _Actor) {
            return thiz.getFeetPos();
        }
        export function getTypeName(thiz: _Actor) {
            if (thiz.isPlayer()) {
                return "minecraft:player";
            } else {
                const hash = thiz.getActorIdentifier().canonicalName;
                return hash.str;
            }
        }
        export function hurtEntity(thiz: _Actor, damage: number) {
            let ad = ActorDamageSource.create(ActorDamageCause.Void);
            return MCAPI.Mob._hurt(thiz, ad, damage, true, false);
        }
        export function isOnGround(thiz: _Actor) {
            return daccess(thiz, bool_t, 472);
        }
        export function isSimulatedPlayer(thiz: _Actor) {
            return thiz.vftable.equals(dlsym("??_7SimulatedPlayer@@6B@"));
        }
        export function refreshActorData(thiz: _Actor) {
            MCAPI.Actor._sendDirtyActorData(thiz);
            return true;
        }
        export function rename(thiz: _Actor, name: string) {
            thiz.setNameTag(name);
            Actor.refreshActorData(thiz);
        }
        export function setOnFire(thiz: _Actor, num: number, isEffect: boolean) {
            if (isEffect) {
                thiz.setOnFire(num);
            } else {
                thiz.setOnFireNoEffects(num);
            }
            return true;
        }
    }
    export namespace Block {
        export function getTileData(thiz: _Block) {
            const tileData = thiz.data;
            const blk = thiz.blockLegacy;

            if (BlockLegacy.toBlock(blk, tileData).equals(thiz)) {
                return tileData;
            }

            for (let i = 0; i < 16; i++) {
                if (i === tileData) {
                    continue;
                }
                if (BlockLegacy.toBlock(blk, tileData).equals(thiz)) {
                    return i;
                }
            }

            logger.error("Error in GetTileData");
            return 0;
        }
    }
    export namespace BlockLegacy {
        export function toBlock(thiz: _BlockLegacy, tileData: number) {
            const bl = thiz.getStateFromLegacyData(tileData);
            if (bl && bl.blockLegacy.equals(thiz)) {
                return bl;
            }
            return thiz.getRenderBlock();
        }
    }
    export namespace BlockPos {
        export function bottomCenter(thiz: _BlockPos) {
            return _BlockPos.create(thiz.x + 0.5, thiz.y, thiz.z + 0.5);
        }
        export function center(thiz: _BlockPos) {
            return _BlockPos.create(thiz.x + 0.5, thiz.y + 0.5, thiz.z + 0.5);
        }
        export function toVec3(thiz: _BlockPos) {
            return _Vec3.create(thiz.x, thiz.y, thiz.z);
        }
    }
    export namespace CompoundTag {
        export function toBinaryNBT(thiz: _CompoundTag, isLittleEndian = false) {
            return TODO("CompoundTag.prototype.toBinaryNBT")() as string;
        }
    }
    export namespace Container {
        export function addItemSafe(thiz: _Container, item: _ItemStack) {
            if (!thiz.hasRoomForItem(item)) {
                return false;
            }
            thiz.addItem(item.clone());
            return true;
        }
        export function addItemToFirstEmptySlotSafe(thiz: _Container, item: _ItemStack) {
            return thiz.addItemToFirstEmptySlot(item.clone());
        }
        export function getSize(thiz: _Container) {
            let slots = thiz.getSlots();
            const res = slots.size();
            slots.destruct();
            return res;
        }
        export function getTypeName(thiz: _Container) {
            return thiz.getContainerType();
        }
    }
    export namespace ItemStack {
        export function getAux(thiz: _ItemStack) {
            if (thiz.isNull()) {
                return 0;
            }
            return thiz.getAuxValue();
        }
        export function getCount(thiz: _ItemStack) {
            if (thiz.isNull()) {
                return 0;
            }
            return thiz.getAmount();
        }
        export function getTypeName(thiz: _ItemStack) {
            if (thiz.isNull()) {
                return "";
            }
            return thiz.getItem()!.getSerializedName();
        }
        export function setItem(thiz: _ItemStack, newItem: ItemStack) {
            let nbt = newItem.allocateAndSave();
            thiz.load(nbt);
            nbt.dispose();
            return true;
        }
        export function setLore(thiz: _ItemStack, lores: string[]) {
            if (thiz.isNull()) {
                return false;
            }
            thiz.setCustomLore(lores);
            return true;
        }
    }
    export namespace Level {
        export function broadcastText(thiz: _Level, a1: string, ty: TextPacket.Types) {
            const players = bedrockServer.level.getPlayers();
            for (const sp of players) {
                Player.sendText(sp, a1, ty);
            }
        }
    }
    export namespace Mob {
        export function refreshInventory(thiz: _Mob) {
            thiz.sendInventory(true);
            thiz.sendArmorSlot(ArmorSlot.Head);
            thiz.sendArmorSlot(ArmorSlot.Torso);
            thiz.sendArmorSlot(ArmorSlot.Legs);
            thiz.sendArmorSlot(ArmorSlot.Feet);
            return true;
        }
    }
    export namespace NetworkIdentifier {
        export function getIP(thiz: _NetworkIdentifier) {
            return thiz.toString().split("|")[0];
        }
    }
    export namespace Player {
        export function clearItem(thiz: _Player, typeName: string) {
            let res = 0;
            {
                const item = thiz.getMainhandSlot();
                if (ItemStack.getTypeName(item) === typeName) {
                    item.setNull();
                    res++;
                }
            }
            {
                const item = thiz.getOffhandSlot();
                if (ItemStack.getTypeName(item) === typeName) {
                    item.setNull();
                    res++;
                }
            }
            {
                const container = thiz.getInventory().container;
                let items = container.getSlots();
                for (let i = 0; i < items.size(); i++) {
                    if (ItemStack.getTypeName(items.get(i)) === typeName) {
                        const cnt = ItemStack.getCount(items.get(i));
                        container.removeItem(i, cnt);
                        res += cnt;
                    }
                }
                items.destruct();
            }
            {
                const armor = thiz.getArmorContainer();
                let items = armor.getSlots();
                for (let i = 0; i < items.size(); i++) {
                    if (ItemStack.getTypeName(items.get(i)) === typeName) {
                        const cnt = ItemStack.getCount(items.get(i));
                        armor.removeItem(i, cnt);
                        res += cnt;
                    }
                }
                items.destruct();
            }
            refreshInventory(thiz);
            return res;
        }
        export function crashClient(thiz: _Player) {
            let pkt = LevelChunkPacket.allocate();
            pkt.cacheEnabled = true;
            thiz.sendPacket(pkt);
            pkt.dispose();
            return true;
        }
        export function getAvgPing(thiz: _Player) {
            return bedrockServer.rakPeer.GetAveragePing(thiz.getNetworkIdentifier().address);
        }
        export function getDeviceName(thiz: _Player) {
            switch (thiz.getPlatform()) {
                case -1:
                    return "Unknown";
                case 1:
                    return "Android";
                case 2:
                    return "iOS";
                case 3:
                    return "OSX";
                case 4:
                    return "Amazon";
                case 5:
                    return "GearVR";
                case 6:
                    return "Hologens";
                case 7:
                    return "Win10";
                case 8:
                    return "WIN32";
                case 9:
                    return "Dedicated";
                case 10:
                    return "TVOS";
                case 11:
                    return "PlayStation";
                case 12:
                    return "Nintendo";
                case 13:
                    return "Xbox";
                case 14:
                    return "WindowsPhone";
                default:
                    return "Unknown";
            }
        }
        export function getEnderChestContainer(thiz: _Player) {
            return daccess(thiz, FillingContainer.ref(), 4192);
        }
        export function getRealName(thiz: _Player) {
            if (Actor.isSimulatedPlayer(thiz)) {
                return thiz.getName();
            } else {
                return thiz.getCertificate().getIdentityName();
            }
        }
        export function giveItem(thiz: _Player, item: ItemStack) {
            if (!thiz.addItem(item)) {
                return false;
            }
            refreshInventory(thiz);
            return true;
        }
        export function isOP(thiz: _Player) {
            return thiz.getPermissionLevel() >=2;
        }
        export function kick(thiz: _Player, msg: string) {
            bedrockServer.serverInstance.disconnectClient(thiz.getNetworkIdentifier(), msg, false);
            return true;
        }
        export function runcmd(thiz: _Player, cmd: string) {
            let pkt = CommandRequestPacket.allocate();
            pkt.command = cmd;
            MCAPI.ServerNetworkHandler.handle(bedrockServer.serverNetworkHandler, thiz.getNetworkIdentifier(), pkt);
            return true;
        }
        export function refreshInventory(thiz: _Player) {
            (<ServerPlayer>thiz).sendInventory();
            return true;
        }
        export function removeSidebar(thiz: _Player) {
            let pkt = SetDisplayObjectivePacket.allocate();
            pkt.displaySlot = "sidebar";
            pkt.objectiveName = "";
            pkt.displayName = "";
            pkt.criteriaName = "dummy";
            pkt.sortOrder = 0;
            thiz.sendPacket(pkt);
            pkt.dispose();
            return true;
        }
        export function sendText(thiz: _Player, text: string, type: TextPacket.Types) {
            let pkt = TextPacket.allocate();
            pkt.type = type;
            pkt.needsTranslation = true;
            pkt.message = text;
            switch (type) {
                case TextPacket.Types.Chat:
                case TextPacket.Types.Whisper:
                case TextPacket.Types.Announcement:
                    pkt.name = "Server";
                case TextPacket.Types.Raw:
                case TextPacket.Types.Tip:
                case TextPacket.Types.SystemMessage:
                case TextPacket.Types.TextObject:
                    pkt.message = text;
                    break;
                case TextPacket.Types.Translate:
                case TextPacket.Types.Popup:
                case TextPacket.Types.JukeboxPopup:
                    pkt.message = text;
                    // pkt.params.setFromArray([]);
                    break;
            }
            thiz.sendPacket(pkt);
            pkt.dispose();
            return true;
        }
        export function setSidebar(thiz: _Player, title: string, data: [string, number][], sortOrder: ObjectiveSortOrder) {
            {
                let pkt = SetDisplayObjectivePacket.allocate();
                pkt.displaySlot = "sidebar";
                pkt.objectiveName = "FakeScoreObj";
                pkt.displayName = title;
                pkt.criteriaName = "dummy";
                pkt.sortOrder = sortOrder;
                thiz.sendPacket(pkt);
                pkt.dispose();
            }
            {
                let pkt = SetScorePacket.allocate();
                pkt.type = 0;
                const info = <ScorePacketInfo[]>[];
                for (const [str, i] of data) {
                    let entry = ScorePacketInfo.construct();
                    entry.objectiveName = "FakeScoreObj";
                    entry.scoreboardId.idAsNumber = i || Number.MAX_VALUE;
                    entry.type = ScorePacketInfo.Type.FAKE_PLAYER;
                    entry.score = i;
                    entry.customName = str;
                    pkt.entries.push(entry);
                    info.push;
                }
                thiz.sendPacket(pkt);
                pkt.dispose();
                for (let entry of info) {
                    entry.destruct();
                }
            }
            return true;
        }
        export function talkAs(thiz: _Player, msg: string) {
            let pkt = TextPacket.allocate();
            pkt.type = TextPacket.Types.Chat;
            pkt.name = "";
            pkt.message = msg;
            MCAPI.ServerNetworkHandler.handle(bedrockServer.serverNetworkHandler, thiz.getNetworkIdentifier(), pkt);
            return true;
        }
        export function transferServer(thiz: _Player, server: string, port: number) {
            let pkt = TransferPacket.allocate();
            pkt.address = server;
            pkt.port = port;
            thiz.sendPacket(pkt);
            pkt.dispose();
            return true;
        }
    }
    export namespace Scoreboard {
        export function addScore(thiz: _Scoreboard, id: string, key: string, value: number): boolean;
        export function addScore(thiz: _Scoreboard, player: _Player, key: string, value: number): boolean;
        export function addScore(thiz: _Scoreboard, player: string | _Player, key: string, value: number) {
            const obj = thiz.getObjective(key);
            if (!obj) {
                return false;
            }
            const identity = typeof player === "string" ? getOrCreateScoreboardId(thiz, player) : thiz.getPlayerScoreboardId(player);
            thiz.addPlayerScore(identity, obj, value);
            return true;
        }
        export function deleteScore(thiz: _Scoreboard, id: string, key: string): boolean;
        export function deleteScore(thiz: _Scoreboard, player: _Player, key: string): boolean;
        export function deleteScore(thiz: _Scoreboard, player: string | _Player, key: string) {
            const obj = thiz.getObjective(key);
            if (!obj) {
                return false;
            }
            const identity = typeof player === "string" ? getOrCreateScoreboardId(thiz, player) : thiz.getPlayerScoreboardId(player);
            thiz.resetPlayerScore(identity, obj);
            return true;
        }
        export function getOrCreateScoreboardId(thiz: _Scoreboard, id: string) {
            let identity = thiz.getFakePlayerScoreboardId(id);
            if (!scoreboardIdIsValid(thiz, identity)) {
                identity = thiz.createScoreboardId(id);
            }
            return identity;
        }
        export function getScore(thiz: _Scoreboard, id: string, key: string): number;
        export function getScore(thiz: _Scoreboard, player: _Player, key: string): number;
        export function getScore(thiz: _Scoreboard, player: string | _Player, key: string) {
            const obj = thiz.getObjective(key);
            if (!obj) {
                return 0;
            }
            const identity = typeof player === "string" ? getOrCreateScoreboardId(thiz, player) : thiz.getPlayerScoreboardId(player);
            if (scoreboardIdIsValid(thiz, identity)) {
                return 0;
            }
            const score = obj.getPlayerScore(identity);
            return score.value;
        }
        export function reduceScore(thiz: _Scoreboard, id: string, key: string, value: number): boolean;
        export function reduceScore(thiz: _Scoreboard, player: _Player, key: string, value: number): boolean;
        export function reduceScore(thiz: _Scoreboard, player: string | _Player, key: string, value: number) {
            const obj = thiz.getObjective(key);
            if (!obj) {
                return false;
            }
            const identity = typeof player === "string" ? getOrCreateScoreboardId(thiz, player) : thiz.getPlayerScoreboardId(player);
            thiz.removePlayerScore(identity, obj, value);
            return true;
        }
        export function scoreboardIdIsValid(thiz: _Scoreboard, identity: _ScoreboardId) {
            return identity.isValid();
        }
        export function setScore(thiz: _Scoreboard, player: _Player, key: string, value: number) {
            const obj = thiz.getObjective(key);
            if (!obj) {
                return false;
            }
            const identity = thiz.getPlayerScoreboardId(player);
            thiz.setPlayerScore(identity, obj, value);
            return true;
        }
    }
    export namespace Tag {
        export function toJson(thiz: _Tag, formatIndent: number): string {
            switch (thiz.getId()) {
                case _Tag.Type.End:
                    return "";
                case _Tag.Type.Byte:
                case _Tag.Type.Short:
                case _Tag.Type.Int:
                    return (<ByteTag>thiz).data.toString();
                case _Tag.Type.Int64:
                        return (<Int64Tag>thiz).dataAsString;
                case _Tag.Type.Float:
                case _Tag.Type.Double:
                    return (<FloatTag>thiz).data.toFixed(6);
                case _Tag.Type.ByteArray:
                    return Buffer.from(String.fromCharCode(...(<ByteArrayTag>thiz).toUint8Array())).toString("base64");
                case _Tag.Type.String:
                    return (<StringTag>thiz).data;
                case _Tag.Type.List:
                {
                    const result: any[] = [];
                    for (const tag of (<ListTag<_Tag>>thiz).data) {
                        if (tag.getId() === _Tag.Type.End) {
                            result.push(null);
                        } else {
                            result.push(toJson(tag, formatIndent));
                        }
                    }
                    return JSON.stringify(result, null, formatIndent);
                }
                case _Tag.Type.Compound:
                {
                    const result: Record<string, any> = {};
                    for (const [key, vari] of (<_CompoundTag>thiz).data.entries()) {
                        const tag = vari.get();
                        if (tag.getId() === _Tag.Type.End) {
                            result[key] = null;
                        } else {
                            result[key](toJson(tag, formatIndent));
                        }
                    }
                    return JSON.stringify(result, null, formatIndent);
                }
                default:
                    return "";
            }
        }
    }
    export namespace Vec3 {
        export function length(thiz: _Vec3) {
            return Math.sqrt(thiz.x * thiz.x + thiz.y * thiz.y + thiz.z * thiz.z);
        }
        export function toBlockPos(thiz: _Vec3) {
            let px = ~~thiz.x;
            let py = ~~thiz.y;
            let pz = ~~thiz.z;
            if (px < 0 && px !== thiz.x) {
                px -= 1;
            }
            if (py < 0 && py !== thiz.y) {
                py -= 1;
            }
            if (pz < 0 && pz !== thiz.z) {
                pz -= 1;
            }
            return _BlockPos.create(px, py, pz);
        }
    }
}