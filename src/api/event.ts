import { Actor, ActorDamageCause, ActorDamageSource, ActorDefinitionIdentifier, ActorFlags, ActorUniqueID, Mob } from "bdsx/bds/actor";
import { AttributeId } from "bdsx/bds/attribute";
import { Block, BlockActor, BlockLegacy, BlockSource } from "bdsx/bds/block";
import { BlockPos, Vec3 } from "bdsx/bds/blockpos";
import { CommandOrigin, CommandOriginType } from "bdsx/bds/commandorigin";
import { ProjectileComponent } from "bdsx/bds/components";
import { ConnectionRequest } from "bdsx/bds/connreq";
import { MobEffectInstance } from "bdsx/bds/effects";
import { GameMode } from "bdsx/bds/gamemode";
import { ArmorSlot, Container, ItemStack } from "bdsx/bds/inventory";
import { Level, Spawner } from "bdsx/bds/level";
import { NetworkIdentifier, ServerNetworkHandler } from "bdsx/bds/networkidentifier";
import { MinecraftPacketIds } from "bdsx/bds/packetids";
import { PlayerActionPacket, TextPacket } from "bdsx/bds/packets";
import { Player, ServerPlayer } from "bdsx/bds/player";
import { Objective, Scoreboard, ScoreboardId } from "bdsx/bds/scoreboard";
import { bin } from "bdsx/bin";
import { capi } from "bdsx/capi";
import { CANCEL } from "bdsx/common";
import { StaticPointer } from "bdsx/core";
import { events } from "bdsx/event";
import { bedrockServer } from "bdsx/launcher";
import { bool_t, CxxString, float32_t, int32_t, uint16_t, uint32_t, uint8_t, void_t } from "bdsx/nativetype";
import { Wrapper } from "bdsx/pointer";
import { _tickCallback } from "bdsx/util";
import { daccess, LlAPI, MCAPI, symhook } from "../dep/native";
import { logger } from "./api_help";
import { FloatPos, FloatPos$newPos, IntPos, IntPos$newPos } from "./base";
import { Block$newBlock, LLSE_Block } from "./block";
import { Entity$newEntity, LLSE_Entity } from "./entity";
import { Item$newItem, LLSE_Item } from "./item";
import { LLSE_Player, Player$newPlayer } from "./player";

class LLSE_Event<CB extends (...args: any[]) => void | false> {
    name!: string;
    listeners: CB[] = [];

    listened() {
        return !!this.name;
    }

    fire(...params: Parameters<CB>): boolean {
        let cancelled = false;
        for (const listener of this.listeners) {
            try {
                if (listener(...params) === false) {
                    cancelled = true;
                }
            } catch (err) {
                logger.error(err);
            }
        }
        return cancelled;
    }
}

export const LLSE_Events = {
    /** Valid 30-04-2022 13:14:21 */
    onPreJoin: new LLSE_Event<(player: LLSE_Player) => void | false>(),
    /** Valid 30-04-2022 13:14:37 */
    onJoin: new LLSE_Event<(player: LLSE_Player) => void>(),
    onLeft: new LLSE_Event<(player: LLSE_Player) => void>(),
    onRespawn: new LLSE_Event<(player: LLSE_Player) => void>(),
    onChat: new LLSE_Event<(player: LLSE_Player, msg: string) => void | false>(),
    onChangeDim: new LLSE_Event<(player: LLSE_Player, dimid: number) => void>(),
    onJump: new LLSE_Event<(player: LLSE_Player) => void>(),
    onEntityTransformation: new LLSE_Event<(uniqueId: string, entity: LLSE_Entity) => void>(),
    onSneak: new LLSE_Event<(player: LLSE_Player, isSneaking: boolean) => void>(),
    onAttackEntity: new LLSE_Event<(player: LLSE_Player, entity: LLSE_Entity) => void | false>(),
    onAttackBlock: new LLSE_Event<(player: LLSE_Player, block: LLSE_Block, item: LLSE_Item | null) => void | false>(),
    /** Always valid */
    onTakeItem: new LLSE_Event<(player: LLSE_Player, entity: LLSE_Entity, item: LLSE_Item | null) => void | false>(),
    /** Always valid */
    onDropItem: new LLSE_Event<(player: LLSE_Player, item: LLSE_Item) => void | false>(),
    onEat: new LLSE_Event<(player: LLSE_Player, item: LLSE_Item) => void | false>(),
    onConsumeTotem: new LLSE_Event<(player: LLSE_Player) => void | false>(),
    onEffectAdded: new LLSE_Event<(player: LLSE_Player, effectName: string) => void | false>(),
    onEffectRemoved: new LLSE_Event<(player: LLSE_Player, effectName: string) => void | false>(),
    onEffectUpdated: new LLSE_Event<(player: LLSE_Player, effectName: string) => void | false>(),
    onStartDestroyBlock: new LLSE_Event<(player: LLSE_Player, block: LLSE_Block) => void>(),
    onPlaceBlock: new LLSE_Event<(player: LLSE_Player, block: LLSE_Block) => void | false>(),
    onOpenContainer: new LLSE_Event<(player: LLSE_Player, block: LLSE_Block) => void | false>(),
    onCloseContainer: new LLSE_Event<(player: LLSE_Player, block: LLSE_Block) => void>(),
    onInventoryChange: new LLSE_Event<(player: LLSE_Player, slotNum: number, oldItem: LLSE_Item, newItem: LLSE_Item) => void>(),
    onMove: new LLSE_Event<(player: LLSE_Player, pos: FloatPos) => void>(),
    onChangeSprinting: new LLSE_Event<(player: LLSE_Player, sprinting: boolean) => void>(),
    onSetArmor: new LLSE_Event<(player: LLSE_Player, slotNum: number, item: LLSE_Item) => void>(),
    onUseRespawnAnchor: new LLSE_Event<(player: LLSE_Player, pos: IntPos) => void | false>(),
    onOpenContainerScreen: new LLSE_Event<(player: LLSE_Player) => void | false>(),
    onPlayerCmd: new LLSE_Event<(player: LLSE_Player, cmd: string) => void | false>(),
    onConsoleCmd: new LLSE_Event<(cmd: string) => void | false>(),
    onCmdBlockExecute: new LLSE_Event<(cmd: string, pos: IntPos, isMinecart: boolean) => void | false>(),
    onBlockInteracted: new LLSE_Event<(player: LLSE_Player, block: LLSE_Block) => void | false>(),
    onBlockChanged: new LLSE_Event<(beforeBlock: LLSE_Block, afterBlock: LLSE_Block) => void | false>(),
    onBlockExploded: new LLSE_Event<(block: LLSE_Block, source: LLSE_Entity) => void>(),
    onFireSpread: new LLSE_Event<(pos: IntPos) => void | false>(),
    onContainerChange: new LLSE_Event<(player: LLSE_Player, container: LLSE_Block, slotNum: number, oldItem: LLSE_Item, newItem: LLSE_Item) => void>(),
    onProjectileHitBlock: new LLSE_Event<(block: LLSE_Block, source: LLSE_Entity) => void>(),
    onRedStoneUpdate: new LLSE_Event<(block: LLSE_Block, level: number, isActive: boolean) => void | false>(),
    onHopperSearchItem: new LLSE_Event<(pos: FloatPos, isMinecart: boolean) => void | false>(),
    onHopperPushOut: new LLSE_Event<(pos: FloatPos) => void | false>(),
    onPistonTryPush: new LLSE_Event<(pistonPos: IntPos, block: LLSE_Block) => void | false>(),
    onPistonPush: new LLSE_Event<(pistonPos: IntPos, block: LLSE_Block) => void>(),
    /** Always valid */
    onFarmLandDecay: new LLSE_Event<(pos: IntPos, entity: LLSE_Entity) => void | false>(),
    onUseFrameBlock: new LLSE_Event<(player: LLSE_Player, block: LLSE_Block) => void | false>(),
    onLiquidFlow: new LLSE_Event<(from: LLSE_Block, to: IntPos) => void | false>(),
    onPlayerDie: new LLSE_Event<(player: LLSE_Player, source: LLSE_Entity | null) => void>(),
    onDestroyBlock: new LLSE_Event<(player: LLSE_Player, block: LLSE_Block) => void | false>(),
    onUseItemOn: new LLSE_Event<(player: LLSE_Player, item: LLSE_Item, block: LLSE_Block, side: number) => void | false>(),
    onMobHurt: new LLSE_Event<(mob: LLSE_Entity, source: LLSE_Entity | null, damage: number, cause: number) => void | false>(),
    onUseItem: new LLSE_Event<(player: LLSE_Player, item: LLSE_Item) => void | false>(),
    /** Always valid */
    onMobDie: new LLSE_Event<(mob: LLSE_Entity, source: LLSE_Entity | null, cause: number) => void>(),
    onEntityExplode: new LLSE_Event<(source: LLSE_Entity, pos: FloatPos, radius: number, maxResistance: number, isDestroy: boolean, isFire: boolean) => void | false>(),
    onBlockExplode: new LLSE_Event<(source: LLSE_Block, pos: IntPos, radius: number, maxResistance: number, isDestroy: boolean, isFire: boolean) => void | false>(),
    onProjectileHitEntity: new LLSE_Event<(entity: LLSE_Entity, source: LLSE_Entity) => void>(),
    onWitherBossDestroy: new LLSE_Event<(witherBoss: LLSE_Entity, AAbb: IntPos, aaBB: IntPos) => void | false>(),
    onRide: new LLSE_Event<(entity1: LLSE_Entity, entity2: LLSE_Entity) => void | false>(),
    onStepOnPressurePlate: new LLSE_Event<(entity: LLSE_Entity, pressurePlate: LLSE_Block) => void | false>(),
    onSpawnProjectile: new LLSE_Event<(shooter: LLSE_Entity, type: string) => void | false>(),
    onProjectileCreated: new LLSE_Event<(shooter: LLSE_Entity, entity: LLSE_Entity) => void>(),
    onNpcCmd: new LLSE_Event<(npc: LLSE_Entity, pl: LLSE_Player, cmd: string) => void | false>(),
    onChangeArmorStand: new LLSE_Event<(as: LLSE_Entity, pl: LLSE_Player, slot: number) => void | false>(),
    onScoreChanged: new LLSE_Event<(player: LLSE_Player, num: number, name: string, disName: string) => void>(),
    /** Always valid */
    onServerStarted: new LLSE_Event<() => void>(),
    /** Always valid */
    onConsoleOutput: new LLSE_Event<(cmd: string) => void | false>(),
    onMobSpawn: new LLSE_Event<(typeName: string, pos: FloatPos) => void | false>(),
    /** Always valid */
    onTick: new LLSE_Event<() => void>(),

    onMoneyAdd: new LLSE_Event<(xuid: string, money: number) => void | false>(),
    onMoneyReduce: new LLSE_Event<(xuid: string, money: number) => void | false>(),
    onMoneyTrans: new LLSE_Event<(from: string, to: string, money: number) => void | false>(),
    onMoneySet: new LLSE_Event<(xuid: string, money: number) => void | false>(),

    onFireworkShootWithCrossbow: new LLSE_Event<(player: LLSE_Player) => void | false>(),
    onRespawnAnchorExplode: new LLSE_Event<(pos: IntPos) => void | false>(),
    onBedExplode: new LLSE_Event<(pos: IntPos) => void | false>(),
};
(LLSE_Events as any).onAttack = LLSE_Events.onAttackEntity;
(LLSE_Events as any).onExplode = LLSE_Events.onEntityExplode;
(LLSE_Events as any).onFormSelected = new LLSE_Event();

export function listen<E extends keyof typeof LLSE_Events>(event: E, callback: (typeof LLSE_Events[E])["listeners"][number]) {
    if (!LLSE_Events[event]) {
        logger.warn(`Event ${event} not found`);
        return;
    }
    LLSE_Events[event].listeners.push(callback as any);
    LLSE_Events[event].name ??= event;
}

export function unlisten<E extends keyof typeof LLSE_Events>(event: E, callback: (typeof LLSE_Events[E])["listeners"][number]) {
    const index = LLSE_Events[event].listeners.findIndex(cb => cb.toString() === callback.toString());
    index !== -1 && LLSE_Events[event].listeners.splice(index, 1);
}

/////////////////// PreJoin ///////////////////
{
    const original = symhook("?sendLoginMessageLocal@ServerNetworkHandler@@QEAAXAEBVNetworkIdentifier@@AEBVConnectionRequest@@AEAVServerPlayer@@@Z",
    void_t, null, ServerNetworkHandler, NetworkIdentifier, ConnectionRequest, ServerPlayer)
    ((thiz, source, connectionRequest, player) => {
        const cancelled = LLSE_Events.onPreJoin.fire(Player$newPlayer(player));
        _tickCallback();
        if (cancelled) {
            return;
        }
        return original(thiz, source, connectionRequest, player);
    });
}

/////////////////// PlayerJoin ///////////////////
{
    const original = symhook("?setLocalPlayerAsInitialized@ServerPlayer@@QEAAXXZ",
    bool_t, null, ServerPlayer)
    ((thiz) => {
        const cancelled = LLSE_Events.onJoin.fire(Player$newPlayer(thiz));
        _tickCallback();
        if (cancelled) {
            return false;
        }
        return original(thiz);
    });
}

/////////////////// PlayerLeft ///////////////////
{
    const original = symhook("?_onPlayerLeft@ServerNetworkHandler@@AEAAXPEAVServerPlayer@@_N@Z",
    void_t, null, ServerNetworkHandler, ServerPlayer, bool_t)
    ((thiz, player, skipMessage) => {
        const cancelled = LLSE_Events.onLeft.fire(Player$newPlayer(player));
        _tickCallback();
        return original(thiz, player, skipMessage);
    });
}

/////////////////// PlayerRespawn ///////////////////
{
    events.packetSend(MinecraftPacketIds.PlayerAction).on((pk, ni) => {
        if (pk.action === PlayerActionPacket.Actions.Respawn) {
            LLSE_Events.onRespawn.fire(Player$newPlayer(ni.getActor()!));
            _tickCallback();
        }
    });
}

/////////////////// PlayerChat ///////////////////
{
    const original = symhook("?handle@ServerNetworkHandler@@UEAAXAEBVNetworkIdentifier@@AEBVTextPacket@@@Z",
    void_t, null, ServerNetworkHandler, NetworkIdentifier.ref(), TextPacket.ref())
    ((thiz, source, packet) => {
        const cancelled = LLSE_Events.onChat.fire(Player$newPlayer(source.getActor()!), packet.message);
        _tickCallback();
        if (cancelled) {
            return;
        }
        return original(thiz, source, packet);
    });
}

/////////////////// PlayerChangeDim ///////////////////
{
    const original = symhook("?_playerChangeDimension@Level@@AEAA_NPEAVPlayer@@AEAVChangeDimensionRequest@@@Z",
    bool_t, null, Level, Player, StaticPointer)
    ((thiz, player, changeRequest) => {
        const toDimID = daccess(changeRequest, int32_t, 8);
        if (toDimID === player.getDimensionId()) {
            return original(thiz, player, changeRequest);
        }
        const cancelled = LLSE_Events.onChangeDim.fire(Player$newPlayer(<ServerPlayer>player), toDimID);
        _tickCallback();
        if (cancelled) {
            return false;
        }
        return original(thiz, player, changeRequest);
    });
}

/////////////////// PlayerJump ///////////////////
{
    const original = symhook("?jumpFromGround@Player@@UEAAXXZ",
    void_t, null, Player)
    ((thiz) => {
        const cancelled = LLSE_Events.onJump.fire(Player$newPlayer(<ServerPlayer>thiz));
        _tickCallback();
        return original(thiz);
    });
}

////////////////// EntityTransform //////////////////
{
    const original = symhook("?maintainOldData@TransformationComponent@@QEAAXAEAVActor@@0AEBUTransformationDescription@@AEBUActorUniqueID@@AEBVLevel@@@Z",
    void_t, null, StaticPointer, Actor, Actor, StaticPointer, ActorUniqueID.ref(), Level)
    ((thiz, originalActor, transformed, transformation, ownerID, level) => {
        const cancelled = LLSE_Events.onEntityTransformation.fire(bin.toString(originalActor.getUniqueIdBin()), Entity$newEntity(transformed));
        _tickCallback();
        return original(thiz, originalActor, transformed, transformation, ownerID, level);
    });
}


/////////////////// PlayerSneak ///////////////////
{
    const original = symhook("?sendActorSneakChanged@ActorEventCoordinator@@QEAAXAEAVActor@@_N@Z",
    void_t, null, StaticPointer, Actor, bool_t)
    ((thiz, actor, isSneaking) => {
        const cancelled = LLSE_Events.onSneak.fire(Player$newPlayer(<ServerPlayer>actor), isSneaking);
        _tickCallback();
        return original(thiz, actor, isSneaking);
    });
}

/////////////////// PlayerAttackEntity ///////////////////
{
    const original = symhook("?attack@Player@@UEAA_NAEAVActor@@AEBW4ActorDamageCause@@@Z",
    bool_t, null, Player, Actor, Wrapper.make(int32_t))
    ((thiz, actor, cause: Wrapper<ActorDamageCause>) => {
        if (actor) {
            const cancelled = LLSE_Events.onAttackEntity.fire(Player$newPlayer(<ServerPlayer>thiz), Entity$newEntity(actor));
            _tickCallback();
            if (cancelled) {
                return false;
            }
        }
        return original(thiz, actor, cause);
    });
}

/////////////////// PlayerAttackBlock ///////////////////
{
    const original = symhook("?attack@Block@@QEBA_NPEAVPlayer@@AEBVBlockPos@@@Z",
    bool_t, null, Block, Player, BlockPos)
    ((thiz, player, pos) => {
        const itemStack = player.getMainhandSlot();
        const cancelled = LLSE_Events.onAttackBlock.fire(Player$newPlayer(<ServerPlayer>player), Block$newBlock(thiz, pos, player.getDimensionId()), !itemStack.isNull() ? Item$newItem(itemStack) : null);
        _tickCallback();
        if (cancelled) {
            return false;
        }
        return original(thiz, player, pos);
    });
}

/////////////////// PlayerTakeItem ///////////////////
events.playerPickupItem.on(event => {
    const cancelled = LLSE_Events.onTakeItem.fire(Player$newPlayer(<ServerPlayer>event.player), Entity$newEntity(event.itemActor), event.itemActor.itemStack ? Item$newItem(event.itemActor.itemStack) : null);
    _tickCallback();
    if (cancelled) {
        return CANCEL;
    }
});

/////////////////// PlayerDropItem ///////////////////
events.playerDropItem.on(event => {
    const cancelled = LLSE_Events.onDropItem.fire(Player$newPlayer(<ServerPlayer>event.player), Item$newItem(event.itemStack));
    _tickCallback();
    if (cancelled) {
        return CANCEL;
    }
});

/////////////////// PlayerConsumeTotem ///////////////////
{
    const original = symhook("?consumeTotem@Player@@UEAA_NXZ",
    bool_t, null, Player)
    ((thiz) => {
        const cancelled = LLSE_Events.onConsumeTotem.fire(Player$newPlayer(<ServerPlayer>thiz));
        _tickCallback();
        if (cancelled) {
            return false;
        }
        return original(thiz);
    });
}

/////////////////// PlayerEffectChanged ///////////////////
// add
{
    const original = symhook("?onEffectAdded@ServerPlayer@@MEAAXAEAVMobEffectInstance@@@Z",
    bool_t, null, ServerPlayer, MobEffectInstance)
    ((thiz, effect) => {
        const cancelled = LLSE_Events.onEffectAdded.fire(Player$newPlayer(thiz), effect.getComponentName());
        _tickCallback();
        if (cancelled) {
            return false;
        }
        return original(thiz, effect);
    });
}
// remove
{
    const original = symhook("?onEffectRemoved@ServerPlayer@@MEAAXAEAVMobEffectInstance@@@Z",
    bool_t, null, ServerPlayer, MobEffectInstance)
    ((thiz, effect) => {
        const cancelled = LLSE_Events.onEffectRemoved.fire(Player$newPlayer(thiz), effect.getComponentName());
        _tickCallback();
        if (cancelled) {
            return false;
        }
        return original(thiz, effect);
    });
}
// update
{
    const original = symhook("?onEffectUpdated@ServerPlayer@@MEAAXAEAVMobEffectInstance@@@Z",
    bool_t, null, ServerPlayer, MobEffectInstance)
    ((thiz, effect) => {
        const cancelled = LLSE_Events.onEffectUpdated.fire(Player$newPlayer(thiz), effect.getComponentName());
        _tickCallback();
        if (cancelled) {
            return false;
        }
        return original(thiz, effect);
    });
}

/////////////////// PlayerStartDestroyBlock ///////////////////
{
    const original = symhook("?sendBlockDestructionStarted@BlockEventCoordinator@@QEAAXAEAVPlayer@@AEBVBlockPos@@@Z",
    void_t, null, StaticPointer, Player, BlockPos)
    ((thiz, player, blockPos) => {
        const cancelled = LLSE_Events.onStartDestroyBlock.fire(Player$newPlayer(<ServerPlayer>player), Block$newBlock(blockPos, player.getDimensionId()));
        _tickCallback();
        return original(thiz, player, blockPos);
    });
}

/////////////////// PlayerPlaceBlock ///////////////////
{
    const original = symhook("?mayPlace@BlockSource@@QEAA_NAEBVBlock@@AEBVBlockPos@@EPEAVActor@@_N@Z",
    bool_t, null, BlockSource, Block, BlockPos, uint8_t, Actor, bool_t)
    ((thiz, block, pos, face, placer, ignoreEntities) => {
        const rtn = original(thiz, block, pos, face, placer, ignoreEntities);
        if (!rtn) {
            return rtn;
        }
        if (placer?.isPlayer()) {
            const cancelled = LLSE_Events.onPlaceBlock.fire(Player$newPlayer(placer), Block$newBlock(block, pos, placer.getDimensionId()));
            _tickCallback();
            if (cancelled) {
                return false;
            }
        }
        return rtn;
    });
}
{
    const original = symhook("?_tryUseOn@BedItem@@AEBA_NAEAVItemStackBase@@AEAVActor@@VBlockPos@@EAEBVVec3@@@Z",
    bool_t, null, StaticPointer, ItemStack, Actor, BlockPos, uint8_t, Vec3)
    ((thiz, instance, entity, pos, face, clickPos) => {
        if (entity.isPlayer()) {
            const cancelled = LLSE_Events.onPlaceBlock.fire(Player$newPlayer(entity), Block$newBlock(pos, entity.getDimensionId()));
            _tickCallback();
            if (cancelled) {
                return false;
            }
        }
        return original(thiz, instance, entity, pos, face, clickPos);
    });
}
{
    const original = symhook("?_useOn@DyePowderItem@@EEBA_NAEAVItemStack@@AEAVActor@@VBlockPos@@EAEBVVec3@@@Z",
    bool_t, null, StaticPointer, ItemStack, Actor, BlockPos, uint8_t, Vec3)
    ((thiz, instance, entity, pos, face, clickPos) => {
        if (entity.isPlayer()) {
            const cancelled = LLSE_Events.onPlaceBlock.fire(Player$newPlayer(entity), Block$newBlock(pos, entity.getDimensionId()));
            _tickCallback();
            if (cancelled) {
                return false;
            }
        }
        return original(thiz, instance, entity, pos, face, clickPos);
    });
}
{
    let doors: Block[];
    bedrockServer.afterOpen().then(()=> {
        doors = [
            daccess(MCAPI.VanillaBlocks.mWoodenDoor, Block.ref()),
            daccess(MCAPI.VanillaBlocks.mWoodenDoorSpruce, Block.ref()),
            daccess(MCAPI.VanillaBlocks.mWoodenDoorBirch, Block.ref()),
            daccess(MCAPI.VanillaBlocks.mWoodenDoorJungle, Block.ref()),
            daccess(MCAPI.VanillaBlocks.mWoodenDoorAcacia, Block.ref()),
            daccess(MCAPI.VanillaBlocks.mWoodenDoorDarkOak, Block.ref()),
            daccess(MCAPI.VanillaBlocks.mIronDoor, Block.ref()),
            daccess(MCAPI.VanillaBlocks.mCrimsonDoor, Block.ref()),
            daccess(MCAPI.VanillaBlocks.mWarpedDoor, Block.ref()),
        ];
    });

    const original = symhook("?_useOn@DoorItem@@EEBA_NAEAVItemStack@@AEAVActor@@VBlockPos@@EAEBVVec3@@@Z",
    bool_t, null, StaticPointer, ItemStack, Actor, BlockPos, uint8_t, Vec3)
    ((thiz, instance, entity, pos, face, clickPos) => {
        if (entity.isPlayer()) {
            const block = doors[daccess(thiz, int32_t, 552)];
            if (!block) {
                return false;
            }
            const cancelled = LLSE_Events.onPlaceBlock.fire(Player$newPlayer(entity), Block$newBlock(block, pos, entity.getDimensionId()));
            _tickCallback();
            if (cancelled) {
                return false;
            }
        }
        return original(thiz, instance, entity, pos, face, clickPos);
    });
}
{
    const original = symhook("?_useOn@RedStoneDustItem@@EEBA_NAEAVItemStack@@AEAVActor@@VBlockPos@@EAEBVVec3@@@Z",
    bool_t, null, StaticPointer, ItemStack, Actor, BlockPos, uint8_t, Vec3)
    ((thiz, instance, entity, pos, face, clickPos) => {
        if (entity.isPlayer()) {
            const cancelled = LLSE_Events.onPlaceBlock.fire(Player$newPlayer(entity), Block$newBlock(pos, entity.getDimensionId()));
            _tickCallback();
            if (cancelled) {
                return false;
            }
        }
        return original(thiz, instance, entity, pos, face, clickPos);
    });
}
{
    let blockMap: Map<MCAPI.SignBlockActor.SignType, [Block, Block]>;
    bedrockServer.afterOpen().then(()=> {
        blockMap = new Map<MCAPI.SignBlockActor.SignType, [Block, Block]>(
            [
                [MCAPI.SignBlockActor.SignType.Oak, [daccess(MCAPI.VanillaBlocks.mSign, Block.ref()), daccess(MCAPI.VanillaBlocks.mWallSign, Block.ref())]],
                [MCAPI.SignBlockActor.SignType.Spruce, [daccess(MCAPI.VanillaBlocks.mSpruceSign, Block.ref()), daccess(MCAPI.VanillaBlocks.mSpruceWallSign, Block.ref())]],
                [MCAPI.SignBlockActor.SignType.Birch, [daccess(MCAPI.VanillaBlocks.mBirchSign, Block.ref()), daccess(MCAPI.VanillaBlocks.mBirchWallSign, Block.ref())]],
                [MCAPI.SignBlockActor.SignType.Jungle, [daccess(MCAPI.VanillaBlocks.mJungleSign, Block.ref()), daccess(MCAPI.VanillaBlocks.mJungleWallSign, Block.ref())]],
                [MCAPI.SignBlockActor.SignType.Acacia, [daccess(MCAPI.VanillaBlocks.mAcaciaSign, Block.ref()), daccess(MCAPI.VanillaBlocks.mAcaciaWallSign, Block.ref())]],
                [MCAPI.SignBlockActor.SignType.DarkOak, [daccess(MCAPI.VanillaBlocks.mDarkOakSign, Block.ref()), daccess(MCAPI.VanillaBlocks.mDarkOakWallSign, Block.ref())]],
                [MCAPI.SignBlockActor.SignType.Crimson, [daccess(MCAPI.VanillaBlocks.mCrimsonStandingSign, Block.ref()), daccess(MCAPI.VanillaBlocks.mCrimsonWallSign, Block.ref())]],
                [MCAPI.SignBlockActor.SignType.Warped, [daccess(MCAPI.VanillaBlocks.mWarpedStandingSign, Block.ref()), daccess(MCAPI.VanillaBlocks.mWarpedWallSign, Block.ref())]]
            ]
        );
    });

    const original = symhook("?_calculatePlacePos@SignItem@@EEBA_NAEAVItemStackBase@@AEAVActor@@AEAEAEAVBlockPos@@@Z",
    bool_t, null, StaticPointer, ItemStack, Actor, uint8_t.ref(), BlockPos)
    ((thiz, instance, entity, face, pos) => {
        if (entity.isPlayer()) {
            const signType = daccess(thiz, int32_t, 568);
            const block = face === 1 ? blockMap.get(signType)![0] : blockMap.get(signType)![1];
            const cancelled = LLSE_Events.onPlaceBlock.fire(Player$newPlayer(entity), Block$newBlock(block, pos, entity.getDimensionId()));
            _tickCallback();
            if (cancelled) {
                return false;
            }
        }
        return original(thiz, instance, entity, face, pos);
    });
}
{
    const original = symhook("?useOn@SeedItemComponentLegacy@@QEAA_NAEAVItemStack@@AEAVActor@@AEBVBlockPos@@EAEBVVec3@@@Z",
    bool_t, null, StaticPointer, ItemStack, Actor, BlockPos, uint8_t, float32_t, float32_t, float32_t)
    ((thiz, instance, entity, pos, face, clickX, clickY, clickZ) => {
        if (entity.isPlayer()) {
            const growDirection = daccess(thiz, int32_t, 42);
            const blockPos = pos.relative(growDirection, 1);
            const block = daccess(thiz, Block.ref(), 8);
            const cancelled = LLSE_Events.onPlaceBlock.fire(Player$newPlayer(entity), Block$newBlock(block, blockPos, entity.getDimensionId()));
            _tickCallback();
            if (cancelled) {
                return false;
            }
        }
        return original(thiz, instance, entity, pos, face, clickX, clickY, clickZ);
    });
}

/////////////////// PlayerOpenContainer ///////////////////
{
    const original = symhook("?onEvent@VanillaServerGameplayEventListener@@UEAA?AW4EventResult@@AEBUPlayerOpenContainerEvent@@@Z",
    uint16_t, null, StaticPointer, StaticPointer)
    ((thiz, event) => {
        const blockPos = daccess(event, BlockPos, 28);
        const pl = MCAPI.WeakEntityRef.tryUnwrap(event)!;
        const cancelled = LLSE_Events.onOpenContainer.fire(Player$newPlayer(<ServerPlayer>pl), Block$newBlock(blockPos, pl.getDimensionId()));
        _tickCallback();
        if (cancelled) {
            return 0;
        }
        return original(thiz, event);
    });
}

/////////////////// PlayerCloseContainer ///////////////////
{
    const original = symhook("?stopOpen@ChestBlockActor@@UEAAXAEAVPlayer@@@Z",
    bool_t, null, BlockActor, Player)
    ((thiz, player) => {
        const bp = thiz.getPosition();
        const cancelled = LLSE_Events.onCloseContainer.fire(Player$newPlayer(<ServerPlayer>player), Block$newBlock(bp, player.getDimensionId()));
        _tickCallback();
        return original(thiz, player);
    });
}
{
    const original = symhook("?stopOpen@BarrelBlockActor@@UEAAXAEAVPlayer@@@Z",
    bool_t, null, BlockActor, Player)
    ((thiz, player) => {
        const bp = thiz.getPosition();
        const cancelled = LLSE_Events.onCloseContainer.fire(Player$newPlayer(<ServerPlayer>player), Block$newBlock(bp, player.getDimensionId()));
        _tickCallback();
        return original(thiz, player);
    });
}

/////////////////// PlayerInventoryChange ///////////////////
{
    const original = symhook("?inventoryChanged@Player@@UEAAXAEAVContainer@@HAEBVItemStack@@1_N@Z",
    void_t, null, Player, Container, int32_t, ItemStack, ItemStack)
    ((thiz, container, slot, oldItem, newItem) => {
        if (thiz.isPlayer()) {
        const cancelled = LLSE_Events.onInventoryChange.fire(Player$newPlayer(<ServerPlayer>thiz), slot, Item$newItem(oldItem), Item$newItem(newItem));
        _tickCallback();
        }
        return original(thiz, container, slot, oldItem, newItem);
    });
}

/////////////////// PlayerMove ///////////////////
{
    const original = symhook("?sendPlayerMove@PlayerEventCoordinator@@QEAAXAEAVPlayer@@@Z",
    void_t, null, StaticPointer, Player)
    ((thiz, player) => {
        if (player.getStatusFlag(ActorFlags.Moving)) {
            const cancelled = LLSE_Events.onMove.fire(Player$newPlayer(<ServerPlayer>player), FloatPos$newPos(player.getPosition(), player.getDimensionId()));
            _tickCallback();
        }
        return original(thiz, player);
    });
}

/////////////////// PlayerSprint ///////////////////
{
    const original = symhook("?setSprinting@Mob@@UEAAX_N@Z",
    void_t, null, Actor, bool_t)
    ((thiz, shouldSprint) => {
        if (thiz.isPlayer() && thiz.isSprinting() !== shouldSprint) {
            const cancelled = LLSE_Events.onChangeSprinting.fire(Player$newPlayer(thiz), shouldSprint);
            _tickCallback();
        }
        return original(thiz, shouldSprint);
    });
}

/////////////////// PlayerSetArmor ///////////////////
{
    const original = symhook("?setArmor@Player@@UEAAXW4ArmorSlot@@AEBVItemStack@@@Z",
    void_t, null, Player, uint32_t, ItemStack)
    ((thiz, slot: ArmorSlot, item) => {
        if (thiz.isPlayer()) {
            const cancelled = LLSE_Events.onSetArmor.fire(Player$newPlayer(thiz), slot, Item$newItem(item));
            _tickCallback();
        }
        return original(thiz, slot, item);
    });
}

/////////////////// PlayerUseRespawnAnchor ///////////////////
{
    const original = symhook("?trySetSpawn@RespawnAnchorBlock@@CA_NAEAVPlayer@@AEBVBlockPos@@AEAVBlockSource@@AEAVLevel@@@Z",
    bool_t, null, Player, BlockPos, BlockSource, Level)
    ((player, blockPos, region, level) => {
        const cancelled = LLSE_Events.onUseRespawnAnchor.fire(Player$newPlayer(<ServerPlayer>player), IntPos$newPos(blockPos, region.getDimensionId()));
        _tickCallback();
        if (cancelled) {
            return false;
        }
        return original(player, blockPos, region, level);
    });
}

/////////////////// PlayerOpenContainerScreen ///////////////////
{
    const original = symhook("?canOpenContainerScreen@Player@@UEAA_NXZ",
    bool_t, null, Player)
    ((thiz) => {
        const cancelled = LLSE_Events.onOpenContainerScreen.fire(Player$newPlayer(<ServerPlayer>thiz));
        _tickCallback();
        if (cancelled) {
            return false;
        }
        return original(thiz);
    });
}

/////////////////// PlayerCmdEvent & ConsoleCmd ///////////////////

/////////////////// CmdBlockExecute ///////////////////
{
    const original = symhook("?_performCommand@BaseCommandBlock@@AEAA_NAEAVBlockSource@@AEBVCommandOrigin@@AEA_N@Z",
    bool_t, null, StaticPointer, BlockSource, CommandOrigin.ref(), bool_t.ref())
    ((thiz, region, origin, markForSaving) => {
        const command = MCAPI.BaseCommandBlock.getCommand(thiz);
        console.log(origin.getOriginType());
        const isMinecart = origin.getOriginType() === CommandOriginType.MinecartCommandBlock;
        const pos = isMinecart ? origin.getEntity()!.getPosition() : LlAPI.BlockPos.toVec3(origin.getBlockPosition());
        const cancelled = LLSE_Events.onCmdBlockExecute.fire(command, FloatPos$newPos(pos, origin.getDimension().getDimensionId()), isMinecart);
        _tickCallback();
        if (cancelled) {
            return false;
        }
        return original(thiz, region, origin, markForSaving);
    });
}

/////////////////// BlockInteracted ///////////////////
{
    const original = symhook("?onBlockInteractedWith@VanillaServerGameplayEventListener@@UEAA?AW4EventResult@@AEAVPlayer@@AEBVBlockPos@@@Z",
    uint16_t, null, StaticPointer, Player, BlockPos)
    ((thiz, player, blockPos) => {
        const cancelled = LLSE_Events.onBlockInteracted.fire(Player$newPlayer(<ServerPlayer>player), Block$newBlock(blockPos, player.getDimensionId()));
        _tickCallback();
        if (cancelled) {
            return 0;
        }
        return original(thiz, player, blockPos);
    });
}

/////////////////// BlockChanged ///////////////////
{
    const original = symhook("?_blockChanged@BlockSource@@IEAAXAEBVBlockPos@@IAEBVBlock@@1HPEBUActorBlockSyncMessage@@PEAVActor@@@Z",
    void_t, null, BlockSource, BlockPos, uint32_t, Block, Block, int32_t, StaticPointer, Actor)
    ((thiz, pos, layer, block, previousBlock, updateFlags, syncMsg, actor) => {
        const dimId = thiz.getDimensionId();
        const cancelled = LLSE_Events.onBlockChanged.fire(Block$newBlock(previousBlock, pos, dimId), Block$newBlock(block, pos, dimId));
        _tickCallback();
        if (cancelled) {
            return;
        }
        return original(thiz, pos, layer, block, previousBlock, updateFlags, syncMsg, actor);
    });
}

/////////////////// BlockExploded ///////////////////
{
    const original = symhook("?onExploded@Block@@QEBAXAEAVBlockSource@@AEBVBlockPos@@PEAVActor@@@Z",
    void_t, null, Block, BlockSource, BlockPos, Actor)
    ((thiz, region, pos, entitySource) => {
        if (entitySource) {
            const cancelled = LLSE_Events.onBlockExploded.fire(Block$newBlock(pos, entitySource.getDimensionId()), Entity$newEntity(entitySource));
            _tickCallback();
        }
        return original(thiz, region, pos, entitySource);
    });
}

/////////////////// FireSpread ///////////////////
let onFireSpread_OnPlace = false;
{
    const original = symhook("?onPlace@FireBlock@@UEBAXAEAVBlockSource@@AEBVBlockPos@@@Z",
    void_t, null, BlockLegacy, BlockSource, BlockPos)
    ((thiz, region, pos) => {
        onFireSpread_OnPlace = true;
        original(thiz, region, pos);
        onFireSpread_OnPlace = false;
    });
}
{
    const original = symhook("?mayPlace@FireBlock@@UEBA_NAEAVBlockSource@@AEBVBlockPos@@@Z",
    bool_t, null, BlockLegacy, BlockSource, BlockPos)
    ((thiz, region, pos) => {
        let rtn = original(thiz, region, pos);
        if (!onFireSpread_OnPlace || !rtn) {
            return rtn;
        }

        const cancelled = LLSE_Events.onFireSpread.fire(IntPos$newPos(pos, region.getDimensionId()));
        _tickCallback();
        if (cancelled) {
            return false;
        }
        return rtn;
    });
}

/////////////////// ContainerChange ///////////////////
{
    const original = symhook("?_onItemChanged@LevelContainerModel@@MEAAXHAEBVItemStack@@0@Z",
    void_t, null, StaticPointer, int32_t, ItemStack, ItemStack)
    ((thiz, slot, oldItem, newItem) => {
        const pl = daccess(thiz, Player.ref(), 208);
        if (pl.hasOpenContainer()) {
            const bp = daccess(thiz, BlockPos, 216);
            const cancelled = LLSE_Events.onContainerChange.fire(Player$newPlayer(<ServerPlayer>pl), Block$newBlock(bp, pl.getDimensionId()), slot, Item$newItem(oldItem), Item$newItem(newItem));
            _tickCallback();
        }
        return original(thiz, slot, oldItem, newItem);
    });
}

/////////////////// ProjectileHitBlock ///////////////////
{
    const original = symhook("?onProjectileHit@Block@@QEBAXAEAVBlockSource@@AEBVBlockPos@@AEBVActor@@@Z",
    void_t, null, Block, BlockSource, BlockPos, Actor)
    ((thiz, region, pos, projectile) => {
        if (pos.x === 0 && pos.y === 0 && pos.z === 0) {
            return original(thiz, region, pos, projectile);
        }
        if (thiz.getName() !== "minecraft:air") {
            const cancelled = LLSE_Events.onProjectileHitBlock.fire(Block$newBlock(pos, region.getDimensionId()), Entity$newEntity(projectile));
            _tickCallback();
        }
        return original(thiz, region, pos, projectile);
    });
}

/////////////////// RedStoneUpdate ///////////////////
{
    const original = symhook("?onRedstoneUpdate@RedStoneWireBlock@@UEBAXAEAVBlockSource@@AEBVBlockPos@@H_N@Z",
    void_t, null, BlockLegacy, BlockSource, BlockPos, int32_t, bool_t)
    ((thiz, region, pos, strength, isFirstTime) => {
        const cancelled = LLSE_Events.onRedStoneUpdate.fire(Block$newBlock(pos, region.getDimensionId()), strength, isFirstTime);
        _tickCallback();
        if (cancelled) {
            return;
        }
        return original(thiz, region, pos, strength, isFirstTime);
    });
}
{
    const original = symhook("?onRedstoneUpdate@RedstoneTorchBlock@@UEBAXAEAVBlockSource@@AEBVBlockPos@@H_N@Z",
    void_t, null, BlockLegacy, BlockSource, BlockPos, int32_t, bool_t)
    ((thiz, region, pos, strength, isFirstTime) => {
        const cancelled = LLSE_Events.onRedStoneUpdate.fire(Block$newBlock(pos, region.getDimensionId()), strength, isFirstTime);
        _tickCallback();
        if (cancelled) {
            return;
        }
        return original(thiz, region, pos, strength, isFirstTime);
    });
}
{
    const original = symhook("?onRedstoneUpdate@DiodeBlock@@UEBAXAEAVBlockSource@@AEBVBlockPos@@H_N@Z",
    void_t, null, BlockLegacy, BlockSource, BlockPos, int32_t, bool_t)
    ((thiz, region, pos, strength, isFirstTime) => {
        const cancelled = LLSE_Events.onRedStoneUpdate.fire(Block$newBlock(pos, region.getDimensionId()), strength, isFirstTime);
        _tickCallback();
        if (cancelled) {
            return;
        }
        return original(thiz, region, pos, strength, isFirstTime);
    });
}
{
    const original = symhook("?onRedstoneUpdate@ComparatorBlock@@UEBAXAEAVBlockSource@@AEBVBlockPos@@H_N@Z",
    void_t, null, BlockLegacy, BlockSource, BlockPos, int32_t, bool_t)
    ((thiz, region, pos, strength, isFirstTime) => {
        const cancelled = LLSE_Events.onRedStoneUpdate.fire(Block$newBlock(pos, region.getDimensionId()), strength, isFirstTime);
        _tickCallback();
        if (cancelled) {
            return;
        }
        return original(thiz, region, pos, strength, isFirstTime);
    });
}

/////////////////// HopperSearchItem ///////////////////
{
    const original = symhook("?_tryPullInItemsFromAboveContainer@Hopper@@IEAA_NAEAVBlockSource@@AEAVContainer@@AEBVVec3@@@Z",
    bool_t, null, StaticPointer, BlockSource, Container, Vec3)
    ((thiz, region, toContainer, pos) => {
        const isMinecart = daccess(thiz, bool_t, 5);
        const cancelled = LLSE_Events.onHopperSearchItem.fire(FloatPos$newPos(isMinecart ? pos : LlAPI.Vec3.toBlockPos(pos), region.getDimensionId()), isMinecart);
        _tickCallback();
        if (cancelled) {
            return false;
        }
        return original(thiz, region, toContainer, pos);
    });
}

/////////////////// HopperPushOut ///////////////////
{
    const original = symhook("?_pushOutItems@Hopper@@IEAA_NAEAVBlockSource@@AEAVContainer@@AEBVVec3@@H@Z",
    bool_t, null, StaticPointer, BlockSource, Container, Vec3, int32_t)
    ((thiz, region, fromContainer, position, attachedFace) => {
        const cancelled = LLSE_Events.onHopperPushOut.fire(FloatPos$newPos(position, region.getDimensionId()));
        _tickCallback();
        if (cancelled) {
            return false;
        }
        return original(thiz, region, fromContainer, position, attachedFace);
    });
}

/////////////////// PistonTryPushEvent & PistonPushEvent ///////////////////
{
    const original = symhook("?_attachedBlockWalker@PistonBlockActor@@AEAA_NAEAVBlockSource@@AEBVBlockPos@@EE@Z",
    bool_t, null, BlockActor, BlockSource, BlockPos, uint8_t, uint8_t)
    ((thiz, region, curPos, curBranchFacing, pistonMoveFacing) => {
        {
            const targetBlock = region.getBlock(curPos);
            if (targetBlock.getName() === "minecraft:air") {
                return original(thiz, region, curPos, curBranchFacing, pistonMoveFacing);
            }
            const cancelled = LLSE_Events.onPistonTryPush.fire(IntPos$newPos(curPos, region.getDimensionId()), Block$newBlock(thiz.getPosition(), region.getDimensionId()));
            _tickCallback();
            if (cancelled) {
                return false;
            }
        }
        const res = original(thiz, region, curPos, curBranchFacing, pistonMoveFacing);
        if (!res) {
            return false;
        }
        {
            const targetBlock = region.getBlock(curPos);
            if (targetBlock.getName() === "minecraft:air") {
                return true;
            }
            const cancelled = LLSE_Events.onPistonPush.fire(IntPos$newPos(curPos, region.getDimensionId()), Block$newBlock(thiz.getPosition(), region.getDimensionId()));
        }
        return true;
    });
}

/////////////////// FarmLandDecay ///////////////////
events.farmlandDecay.on(event => {
    const cancelled = LLSE_Events.onFarmLandDecay.fire(IntPos$newPos(event.blockPos, event.blockSource.getDimensionId()), Entity$newEntity(event.culprit));
    _tickCallback();
    if (cancelled) {
        return CANCEL;
    }
});

/////////////////// PlayerUseFrameBlockEvent  ///////////////////
{
    const original = symhook("?use@ItemFrameBlock@@UEBA_NAEAVPlayer@@AEBVBlockPos@@E@Z",
    bool_t, null, BlockLegacy, Player, BlockPos)
    ((thiz, player, pos) => {
        const cancelled = LLSE_Events.onUseFrameBlock.fire(Player$newPlayer(<ServerPlayer>player), Block$newBlock(pos, player.getDimensionId()));
        _tickCallback();
        if (cancelled) {
            return false;
        }
        return original(thiz, player, pos);
    });
}
{
    const original = symhook("?attack@ItemFrameBlock@@UEBA_NPEAVPlayer@@AEBVBlockPos@@@Z",
    bool_t, null, BlockLegacy, Player, BlockPos)
    ((thiz, player, pos) => {
        const cancelled = LLSE_Events.onUseFrameBlock.fire(Player$newPlayer(<ServerPlayer>player), Block$newBlock(pos, player.getDimensionId()));
        _tickCallback();
        if (cancelled) {
            return false;
        }
        return original(thiz, player, pos);
    });
}

/////////////////// LiquidSpreadEvent ///////////////////
{
    const original = symhook("?_canSpreadTo@LiquidBlockDynamic@@AEBA_NAEAVBlockSource@@AEBVBlockPos@@1E@Z",
    bool_t, null, BlockLegacy, BlockSource, BlockPos, BlockPos, uint8_t)
    ((thiz, region, pos, flowFromPos, flowFromDirection) => {
        const rtn = original(thiz, region, pos, flowFromPos, flowFromDirection);
        if (!rtn) {
            return rtn;
        }
        const cancelled = LLSE_Events.onLiquidFlow.fire(Block$newBlock(thiz.getRenderBlock(), pos, region.getDimensionId()), IntPos$newPos(pos, region.getDimensionId()));
        _tickCallback();
        if (cancelled) {
            return false;
        }
        return original(thiz, region, pos, flowFromPos, flowFromDirection);
    });
}

/////////////////// PlayerDeath ///////////////////
{
    const original = symhook("?die@Player@@UEAAXAEBVActorDamageSource@@@Z",
    bool_t, null, Player, ActorDamageSource)
    ((thiz, source) => {
        const src = bedrockServer.level.fetchEntity(source.getDamagingEntityUniqueID(), true);
        const cancelled = LLSE_Events.onPlayerDie.fire(Player$newPlayer(<ServerPlayer>thiz), src ? Entity$newEntity(src) : null);
        _tickCallback();
        return original(thiz, source);
    });
}

/////////////////// PlayerDestroy ///////////////////
{
    const original = symhook("?checkBlockDestroyPermissions@BlockSource@@QEAA_NAEAVActor@@AEBVBlockPos@@AEBVItemStackBase@@_N@Z",
    bool_t, null, BlockSource, Actor, BlockPos, ItemStack, bool_t)
    ((thiz, entity, pos, item, generateParticle) => {
        if (entity.isPlayer()) {
            const cancelled = LLSE_Events.onDestroyBlock.fire(Player$newPlayer(entity), Block$newBlock(pos, entity.getDimensionId()));
            _tickCallback();
            if (cancelled) {
                return false;
            }
        }
        return original(thiz, entity, pos, item, generateParticle);
    });
}

/////////////////// PlayerUseItemOn ///////////////////
{
    const original = symhook("?useItemOn@GameMode@@UEAA_NAEAVItemStack@@AEBVBlockPos@@EAEBVVec3@@PEBVBlock@@@Z",
    bool_t, null, GameMode, ItemStack, BlockPos, uint8_t, Vec3, Block)
    ((thiz, item, at, face, hit, targetBlock) => {
        const player = thiz.actor;
        const cancelled = LLSE_Events.onUseItemOn.fire(Player$newPlayer(<ServerPlayer>player), Item$newItem(item), Block$newBlock(at, player.getDimensionId()), face);
        _tickCallback();
        if (cancelled) {
            return false;
        }
        return original(thiz, item, at, face, hit, targetBlock);
    });
}

/////////////////// MobHurt ///////////////////
{
    const original = symhook("?_hurt@Mob@@MEAA_NAEBVActorDamageSource@@M_N1@Z",
    bool_t, null, Actor, ActorDamageSource, int32_t, bool_t, bool_t)
    ((thiz, source, dmg, knock, ignite) => {
        const src = bedrockServer.level.fetchEntity(source.getDamagingEntityUniqueID(), true);
        const cancelled = LLSE_Events.onMobHurt.fire(Entity$newEntity(thiz), src ? Entity$newEntity(src) : null, dmg, source.cause);
        _tickCallback();
        if (cancelled) {
            return false;
        }
        return original(thiz, source, dmg, knock, ignite);
    });
}

//////////////// PlayerUseItem & PlayerEat ////////////////
{
    const original = symhook("?baseUseItem@GameMode@@QEAA_NAEAVItemStack@@@Z",
    bool_t, null, GameMode, ItemStack)
    ((thiz, item) => {
        const player = <Player>thiz.actor;
        {
            const cancelled = LLSE_Events.onUseItem.fire(Player$newPlayer(<ServerPlayer>player), Item$newItem(item));
            _tickCallback();
            if (cancelled) {
                return false;
            }
        }
        {
            if (item.item.isFood() && (player.isHungry() || player.forceAllowEating())) {
                const cancelled = LLSE_Events.onEat.fire(Player$newPlayer(<ServerPlayer>player), Item$newItem(item));
                _tickCallback();
                if (cancelled) {
                    player.setAttribute(AttributeId.PlayerHunger, player.getAttribute(AttributeId.PlayerHunger));
                    return false;
                }
            }
        }
        return original(thiz, item);
    });
}

/////////////////// MobDie ///////////////////
events.entityDie.on(event => {
    const src = event.damageSource.getDamagingEntity();
    LLSE_Events.onMobDie.fire(Entity$newEntity(event.entity), src ? Entity$newEntity(src) : null, event.damageSource.cause);
});

///////////////////  Entity & Block Explosion ///////////////////
{
    const original = symhook("?explode@Explosion@@QEAAXXZ",
    void_t, null, MCAPI.Explosion)
    ((thiz) => {
        const actor = Actor.fromUniqueIdBin(thiz.mSourceID, true);
        const pos = thiz.mPos;
        const radius = thiz.mRadius;
        const bs = thiz.mRegion;
        const maxResistance = thiz.mMaxResistance;
        const genFire = thiz.mFire;
        const canBreaking = thiz.mBreaking;
        if (actor) {
            const cancelled = LLSE_Events.onEntityExplode.fire(Entity$newEntity(actor), FloatPos$newPos(pos, actor.getDimensionId()), maxResistance, radius, canBreaking, genFire);
            _tickCallback();
            if (cancelled) {
                return;
            }
        } else {
            let cancelled = false;
            const bp = LlAPI.Vec3.toBlockPos(pos);
            const block = bs.getBlock(bp);
            if (block.getName() === "minecraft:respawn_anchor") {
                cancelled ||= LLSE_Events.onRespawnAnchorExplode.fire(IntPos$newPos(bp, bs.getDimensionId()));
                _tickCallback();
            } else {
                cancelled ||= LLSE_Events.onBedExplode.fire(IntPos$newPos(bp, bs.getDimensionId()));
                _tickCallback();
            }
            cancelled ||= LLSE_Events.onBlockExplode.fire(Block$newBlock(bp, bs.getDimensionId()), IntPos$newPos(bp, bs.getDimensionId()), maxResistance, radius, canBreaking, genFire);
            _tickCallback();
            if (cancelled) {
                return;
            }
        }
        return original(thiz);
    });
}

/////////////////// ProjectileHitEntity ///////////////////
{
    const original = symhook("?onHit@ProjectileComponent@@QEAAXAEAVActor@@AEBVHitResult@@@Z",
    void_t, null, ProjectileComponent, Actor, StaticPointer)
    ((thiz, owner, res) => {
        const to = MCAPI.HitResult.getEntity(res);
        if (to) {
            const cancelled = LLSE_Events.onProjectileHitEntity.fire(Entity$newEntity(to), Entity$newEntity(owner));
            _tickCallback();
        }
        return original(thiz, owner, res);
    });
}

/////////////////// WitherBoss ///////////////////
{
    const original = symhook("?_destroyBlocks@WitherBoss@@AEAAXAEAVLevel@@AEBVAABB@@AEAVBlockSource@@H@Z",
    void_t, null, Actor, Level, MCAPI.AABB, BlockSource, int32_t)
    ((thiz, level, areaofeffect, region, a5) => {
        const cancelled = LLSE_Events.onWitherBossDestroy.fire(Entity$newEntity(thiz), IntPos$newPos(LlAPI.Vec3.toBlockPos(areaofeffect.min), thiz.getDimensionId()), IntPos$newPos(LlAPI.Vec3.toBlockPos(areaofeffect.max), thiz.getDimensionId()));
        _tickCallback();
        if (cancelled) {
            return;
        }
        return original(thiz, level, areaofeffect, region, a5);
    });
}

////////////// EntityRide //////////////
{
    const original = symhook("?canAddPassenger@Actor@@UEBA_NAEAV1@@Z",
    bool_t, null, Actor, Actor)
    ((thiz, passenger) => {
        const rtn = original(thiz, passenger);
        if (!rtn) {
            return false;
        }
        const cancelled = LLSE_Events.onRide.fire(Entity$newEntity(thiz), Entity$newEntity(passenger));
        _tickCallback();
        if (cancelled) {
            return false;
        }
        return rtn;
    });
}

////////////// EntityStepOnPressurePlate //////////////
{
    const original = symhook("?entityInside@BasePressurePlateBlock@@UEBAXAEAVBlockSource@@AEBVBlockPos@@AEAVActor@@@Z",
    void_t, null, BlockLegacy, BlockSource, BlockPos, Actor)
    ((thiz, region, pos, entity) => {
        const cancelled = LLSE_Events.onStepOnPressurePlate.fire(Entity$newEntity(entity), Block$newBlock(pos, entity.getDimensionId()));
        _tickCallback();
        return original(thiz, region, pos, entity);
    });
}

////////////// ProjectileSpawn //////////////
{
    const original = symhook("?spawnProjectile@Spawner@@QEAAPEAVActor@@AEAVBlockSource@@AEBUActorDefinitionIdentifier@@PEAV2@AEBVVec3@@3@Z",
    Actor, null, Spawner, BlockSource, ActorDefinitionIdentifier, Actor, Vec3, Vec3)
    ((thiz, region, id, spawner, position, direction) => {
        {
            let fullName = id.fullName;
            if (fullName.endsWith("<>")) {
                fullName = fullName.substring(0, fullName.length - 2);
            }
            const cancelled = LLSE_Events.onSpawnProjectile.fire(Entity$newEntity(spawner), fullName);
            _tickCallback();
            if (cancelled) {
                return null as any;
            }
        }
        const projectile = original(thiz, region, id, spawner, position, direction);
        const cancelled = LLSE_Events.onProjectileCreated.fire(Entity$newEntity(spawner), Entity$newEntity(projectile));
        return projectile;
    });
}
{
    const original = symhook("?_shootFirework@CrossbowItem@@AEBAXAEBVItemInstance@@AEAVPlayer@@@Z",
    void_t, null, StaticPointer, ItemStack, Player)
    ((thiz, projectileInstance, player) => {
        const cancelled = LLSE_Events.onSpawnProjectile.fire(Entity$newEntity(player), "minecraft:fireworks_rocket");
        _tickCallback();
        if (cancelled) {
            return;
        }
        return original(thiz, projectileInstance, player);
    });
}
{
    const original = symhook("?releaseUsing@TridentItem@@UEBAXAEAVItemStack@@PEAVPlayer@@H@Z",
    void_t, null, StaticPointer, ItemStack, Player, int32_t)
    ((thiz, itemStack, player, durationLeft) => {
        const cancelled = LLSE_Events.onSpawnProjectile.fire(Entity$newEntity(player), LlAPI.ItemStack.getTypeName(itemStack));
        _tickCallback();
        if (cancelled) {
            return;
        }
        return original(thiz, itemStack, player, durationLeft);
    });
}

////////////// NpcCmd //////////////
{
    const original = symhook("?executeCommandAction@NpcComponent@@QEAAXAEAVActor@@AEAVPlayer@@HAEBV?$basic_string@DU?$char_traits@D@std@@V?$allocator@D@2@@std@@@Z",
    void_t, null, StaticPointer, Actor, Player, int32_t, CxxString)
    ((thiz, owner, player, actionIndex, sceneName) => {
        let data = MCAPI.NpcSceneDialogueData.allocate();
        MCAPI.NpcSceneDialogueData.NpcSceneDialogueData(data, thiz, owner, sceneName);
        const container = MCAPI.NpcSceneDialogueData.getActionsContainer(data);
        const actionAt = MCAPI.NpcActionsContainer.getActionAt(container, actionIndex);
        if (actionAt && actionAt.mType === MCAPI.NpcActionType.CommandAction) {
            const str = actionAt.as(MCAPI.NpcCommandAction).mCommands.get(0)?.mCommandLine;
            if (str) {
                const cancelled = LLSE_Events.onNpcCmd.fire(Entity$newEntity(owner), Player$newPlayer(<ServerPlayer>player), str);
                _tickCallback();
                if (cancelled) {
                    return;
                }
            }
        }
        data.destruct();
        capi.free(data);
        return original(thiz, owner, player, actionIndex, sceneName);
    });
}

////////////// ArmorStandChange //////////////
{
    const original = symhook("?_trySwapItem@ArmorStand@@AEAA_NAEAVPlayer@@W4EquipmentSlot@@@Z",
    bool_t, null, Actor, Player, int32_t)
    ((thiz, player, slot) => {
        const cancelled = LLSE_Events.onChangeArmorStand.fire(Entity$newEntity(thiz), Player$newPlayer(<ServerPlayer>player), slot);
        _tickCallback();
        if (cancelled) {
            return false;
        }
        return original(thiz, player, slot);
    });
}

////////////// PlayerScoreChangedEvent  //////////////
{
    const original = symhook("?onScoreChanged@ServerScoreboard@@UEAAXAEBUScoreboardId@@AEBVObjective@@@Z",
    void_t, null, Scoreboard, ScoreboardId, Objective)
    ((thiz, id, obj) => {
        const _id = id.id;
        let player!: ServerPlayer;
        const level = bedrockServer.level;
        const sb = level.getScoreboard();
        const pls = level.getPlayers();
        for (const pl of pls) {
            if (sb.getPlayerScoreboardId(pl).id === _id) {
                player = pl;
                break;
            }
        }
        if (player?.isPlayer()) {
            const cancelled = LLSE_Events.onScoreChanged.fire(Player$newPlayer(player), obj.getPlayerScore(id).value, obj.name, obj.displayName);
            _tickCallback();
        }
        return original(thiz, id, obj);
    });
}

////////////// ServerStarted //////////////
events.serverOpen.on(() => {
    LLSE_Events.onServerStarted.fire();
    _tickCallback();
});


////////////// ConsoleOutput //////////////
events.commandOutput.on(log => {
    const cancelled = LLSE_Events.onConsoleOutput.fire(log);
    _tickCallback();
    if (cancelled) {
        return CANCEL;
    }
});

////////////// MobSpawn //////////////
{
    const original = symhook("?spawnMob@Spawner@@QEAAPEAVMob@@AEAVBlockSource@@AEBUActorDefinitionIdentifier@@PEAVActor@@AEBVVec3@@_N44@Z",
    Mob, null, Spawner, BlockSource, ActorDefinitionIdentifier, Actor, Vec3, bool_t, bool_t, bool_t)
    ((thiz, region, id, spawner, pos, naturalSpawn, surface, fromSpawner) => {
        const cancelled = LLSE_Events.onMobSpawn.fire(id.canonicalName.str, FloatPos$newPos(pos, region.getDimensionId()));
        _tickCallback();
        if (cancelled) {
            return null;
        }
        return original(thiz, region, id, spawner, pos, naturalSpawn, surface, fromSpawner);
    });
}

// 植入tick
events.levelTick.on(() => {
    LLSE_Events.onTick.fire();
    _tickCallback();
});