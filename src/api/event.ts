import { Actor, ActorDamageCause, ActorDamageSource, ActorDefinitionIdentifier, ActorFlags } from "bdsx/bds/actor";
import { Block, BlockActor, BlockLegacy, BlockSource } from "bdsx/bds/block";
import { BlockPos, Vec3 } from "bdsx/bds/blockpos";
import { CommandOrigin } from "bdsx/bds/commandorigin";
import { ProjectileComponent } from "bdsx/bds/components";
import { ConnectionRequest } from "bdsx/bds/connreq";
import { MobEffectInstance } from "bdsx/bds/effects";
import { GameMode } from "bdsx/bds/gamemode";
import { ArmorSlot, Container, ItemStack } from "bdsx/bds/inventory";
import { Level, Spawner } from "bdsx/bds/level";
import { NetworkIdentifier, ServerNetworkHandler } from "bdsx/bds/networkidentifier";
import { RespawnPacket, TextPacket } from "bdsx/bds/packets";
import { Player, ServerPlayer } from "bdsx/bds/player";
import { Objective, Scoreboard, ScoreboardId } from "bdsx/bds/scoreboard";
import { serverInstance } from "bdsx/bds/server";
import { CANCEL } from "bdsx/common";
import { StaticPointer } from "bdsx/core";
import { events } from "bdsx/event";
import { bedrockServer } from "bdsx/launcher";
import { bool_t, float32_t, int32_t, uint16_t, uint32_t, uint8_t, void_t } from "bdsx/nativetype";
import { Wrapper } from "bdsx/pointer";
import { _tickCallback } from "bdsx/util";
import { daccess, LIAPI, MCAPI, symhook } from "../dep/native";
import { logger } from "./api_help";
import { FloatPos, FloatPos$newPos, IntPos, IntPos$newPos } from "./base";
import { Block$newBlock, LXL_Block } from "./block";
import { Entity$newEntity, LXL_Entity } from "./entity";
import { Item$newItem, LXL_Item } from "./item";
import { LXL_Player, Player$newPlayer } from "./player";

class LXL_Event<CB extends (...args: any[]) => void | false> {
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

export const LXL_Events = {
    /** Valid 03-02-2022 19:21:40 */
    onPreJoin: new LXL_Event<(player: LXL_Player) => void | false>(),
    /** Valid 03-02-2022 19:21:45 */
    onJoin: new LXL_Event<(player: LXL_Player) => void>(),
    /** Valid 03-02-2022 19:21:53 */
    onLeft: new LXL_Event<(player: LXL_Player) => void>(),
    /** Valid 03-02-2022 19:22:14 */
    onRespawn: new LXL_Event<(player: LXL_Player) => void>(),
    /** Valid 03-02-2022 19:22:08 */
    onChat: new LXL_Event<(player: LXL_Player, msg: string) => void | false>(),
    /** Valid 03-02-2022 19:22:27 */
    onChangeDim: new LXL_Event<(player: LXL_Player, dimid: number) => void>(),
    /** Valid 03-02-2022 19:22:22 */
    onJump: new LXL_Event<(player: LXL_Player) => void>(),
    onSneak: new LXL_Event<(player: LXL_Player, isSneaking: boolean) => void>(),
    onAttackEntity: new LXL_Event<(player: LXL_Player, entity: LXL_Entity) => void | false>(),
    onAttackBlock: new LXL_Event<(player: LXL_Player, block: LXL_Block, item: LXL_Item | null) => void | false>(),
    onTakeItem: new LXL_Event<(player: LXL_Player, entity: LXL_Entity, item: LXL_Item) => void | false>(),
    onDropItem: new LXL_Event<(player: LXL_Player, item: LXL_Item) => void | false>(),
    onEat: new LXL_Event<(player: LXL_Player, item: LXL_Item) => void | false>(),
    onConsumeTotem: new LXL_Event<(player: LXL_Player) => void | false>(),
    onEffectAdded: new LXL_Event<(player: LXL_Player, effectName: string) => void | false>(),
    onEffectRemoved: new LXL_Event<(player: LXL_Player, effectName: string) => void | false>(),
    onEffectUpdated: new LXL_Event<(player: LXL_Player, effectName: string) => void | false>(),
    onStartDestroyBlock: new LXL_Event<(player: LXL_Player, block: LXL_Block) => void>(),
    onPlaceBlock: new LXL_Event<(player: LXL_Player, block: LXL_Block) => void | false>(),
    /** Valid 03-02-2022 19:21:02 */
    onOpenContainer: new LXL_Event<(player: LXL_Player, block: LXL_Block) => void | false>(),
    onCloseContainer: new LXL_Event<(player: LXL_Player, block: LXL_Block) => void>(),
    onInventoryChange: new LXL_Event<(player: LXL_Player, slotNum: number, oldItem: LXL_Item, newItem: LXL_Item) => void>(),
    /** Valid 03-02-2022 19:21:18 */
    onMove: new LXL_Event<(player: LXL_Player, pos: FloatPos) => void>(),
    onChangeSprinting: new LXL_Event<(player: LXL_Player, sprinting: boolean) => void>(),
    onSetArmor: new LXL_Event<(player: LXL_Player, slotNum: number, item: LXL_Item) => void>(),
    onUseRespawnAnchor: new LXL_Event<(player: LXL_Player, pos: IntPos) => void | false>(),
    onOpenContainerScreen: new LXL_Event<(player: LXL_Player) => void | false>(),
    /** Valid 03-02-2022 19:22:45 */
    onPlayerCmd: new LXL_Event<(player: LXL_Player, cmd: string) => void | false>(),
    /** Valid 03-02-2022 19:22:50 */
    onConsoleCmd: new LXL_Event<(cmd: string) => void | false>(),
    /** Valid 06-02-2022 14:24:59 */
    onCmdBlockExecute: new LXL_Event<(cmd: string, pos: IntPos, isMinecart: boolean) => void | false>(),
    onBlockInteracted: new LXL_Event<(player: LXL_Player, block: LXL_Block) => void | false>(),
    onBlockChanged: new LXL_Event<(beforeBlock: LXL_Block, afterBlock: LXL_Block) => void | false>(),
    onBlockExploded: new LXL_Event<(block: LXL_Block, source: LXL_Entity) => void>(),
    onFireSpread: new LXL_Event<(pos: IntPos) => void | false>(),
    onContainerChange: new LXL_Event<(player: LXL_Player, container: LXL_Block, slotNum: number, oldItem: LXL_Item, newItem: LXL_Item) => void>(),
    onProjectileHitBlock: new LXL_Event<(block: LXL_Block, source: LXL_Entity) => void>(),
    onRedStoneUpdate: new LXL_Event<(block: LXL_Block, level: number, isActive: boolean) => void | false>(),
    onHopperSearchItem: new LXL_Event<(pos: FloatPos, isMinecart: boolean) => void | false>(),
    onHopperPushOut: new LXL_Event<(pos: FloatPos) => void | false>(),
    onPistonTryPush: new LXL_Event<(pistonPos: IntPos, block: LXL_Block) => void | false>(),
    onPistonPush: new LXL_Event<(pistonPos: IntPos, block: LXL_Block) => void>(),
    /** Valid 03-02-2022 19:24:55 */
    onFarmLandDecay: new LXL_Event<(pos: IntPos, entity: LXL_Entity) => void | false>(),
    onUseFrameBlock: new LXL_Event<(player: LXL_Player, block: LXL_Block) => void | false>(),
    onLiquidFlow: new LXL_Event<(from: LXL_Block, to: IntPos) => void | false>(),
    onPlayerDie: new LXL_Event<(player: LXL_Player, source: LXL_Entity | null) => void>(),
    onDestroyBlock: new LXL_Event<(player: LXL_Player, block: LXL_Block) => void | false>(),
    onUseItemOn: new LXL_Event<(player: LXL_Player, item: LXL_Item, block: LXL_Block, side: number) => void | false>(),
    onMobHurt: new LXL_Event<(mob: LXL_Entity, source: LXL_Entity | null, damage: number) => void | false>(),
    onUseItem: new LXL_Event<(player: LXL_Player, item: LXL_Item) => void | false>(),
    onMobDie: new LXL_Event<(mob: LXL_Entity, source: LXL_Entity | null) => void>(),
    onEntityExplode: new LXL_Event<(source: LXL_Entity, pos: FloatPos, radius: number, maxResistance: number, isDestroy: boolean, isFire: boolean) => void | false>(),
    onBlockExplode: new LXL_Event<(source: LXL_Block, pos: FloatPos, radius: number, maxResistance: number, isDestroy: boolean, isFire: boolean) => void | false>(),
    /** Valid 03-02-2022 18:54:11 */
    onProjectileHitEntity: new LXL_Event<(entity: LXL_Entity, source: LXL_Entity) => void>(),
    onWitherBossDestroy: new LXL_Event<(witherBoss: LXL_Entity, AAbb: IntPos, aaBB: IntPos) => void | false>(),
    onRide: new LXL_Event<(entity1: LXL_Entity, entity2: LXL_Entity) => void | false>(),
    onStepOnPressurePlate: new LXL_Event<(entity: LXL_Entity, pressurePlate: LXL_Block) => void | false>(),
    onSpawnProjectile: new LXL_Event<(shooter: LXL_Entity, type: string) => void | false>(),
    onNpcCmd: new LXL_Event<(npc: LXL_Entity, pl: LXL_Player, cmd: string) => void | false>(),
    /** Valid 06-02-2022 14:37:44 */
    onChangeArmorStand: new LXL_Event<(as: LXL_Entity, pl: LXL_Player, slot: number) => void | false>(),
    onScoreChanged: new LXL_Event<(player: LXL_Player, num: number, name: string, disName: string) => void>(),
    /** 03-02-2022 19:23:42 */
    onServerStarted: new LXL_Event<() => void>(),
    /** 03-02-2022 19:23:49 */
    onConsoleOutput: new LXL_Event<(cmd: string) => void | false>(),
    /** Valid 03-02-2022 19:21:26 */
    onTick: new LXL_Event<() => void>(),

    onMoneyAdd: new LXL_Event<(xuid: string, money: number) => void | false>(),
    onMoneyReduce: new LXL_Event<(xuid: string, money: number) => void | false>(),
    onMoneyTrans: new LXL_Event<(from: string, to: string, money: number) => void | false>(),
    onMoneySet: new LXL_Event<(xuid: string, money: number) => void | false>(),

    onFireworkShootWithCrossbow: new LXL_Event<(player: LXL_Player) => void | false>(),
};
(LXL_Events as any).onAttack = LXL_Events.onAttackEntity;
(LXL_Events as any).onExplode = LXL_Events.onEntityExplode;
(LXL_Events as any).onRespawnAnchorExplode = new LXL_Event<() => void | false>();
(LXL_Events as any).onBedExplode = new LXL_Event<() => void | false>();

export function listen<E extends keyof typeof LXL_Events>(event: E, callback: (typeof LXL_Events[E])["listeners"][number]) {
    if (!LXL_Events[event]) {
        logger.warn(`Event ${event} not found`);
        return;
    }
    LXL_Events[event].listeners.push(callback as any);
    LXL_Events[event].name ??= event;
}

export function unlisten<E extends keyof typeof LXL_Events>(event: E, callback: (typeof LXL_Events[E])["listeners"][number]) {
    const index = LXL_Events[event].listeners.findIndex(cb => cb.toString() === callback.toString());
    index !== -1 && LXL_Events[event].listeners.splice(index, 1);
}

/////////////////// PreJoin ///////////////////
{
    const original = symhook("?sendLoginMessageLocal@ServerNetworkHandler@@QEAAXAEBVNetworkIdentifier@@AEBVConnectionRequest@@AEAVServerPlayer@@@Z",
    void_t, null, ServerNetworkHandler, NetworkIdentifier, ConnectionRequest, ServerPlayer)
    ((thiz, source, connectionRequest, player) => {
        const cancelled = LXL_Events.onPreJoin.fire(Player$newPlayer(player));
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
        const cancelled = LXL_Events.onJoin.fire(Player$newPlayer(thiz));
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
        const cancelled = LXL_Events.onLeft.fire(Player$newPlayer(player));
        _tickCallback();
        return original(thiz, player, skipMessage);
    });
}

/////////////////// PlayerRespawn ///////////////////
{
    const original = symhook("?handle@?$PacketHandlerDispatcherInstance@VRespawnPacket@@$0A@@@UEBAXAEBVNetworkIdentifier@@AEAVNetEventCallback@@AEAV?$shared_ptr@VPacket@@@std@@@Z",
    void_t, null, StaticPointer, NetworkIdentifier.ref(), StaticPointer, RespawnPacket.ref())
    ((thiz, source, callback, packet) => {
        const cancelled = LXL_Events.onRespawn.fire(Player$newPlayer(source.getActor()!));
        _tickCallback();
        return original(thiz, source, callback, packet);
    });
}

/////////////////// PlayerChat ///////////////////
{
    const original = symhook("?handle@ServerNetworkHandler@@UEAAXAEBVNetworkIdentifier@@AEBVTextPacket@@@Z",
    void_t, null, ServerNetworkHandler, NetworkIdentifier.ref(), TextPacket.ref())
    ((thiz, source, packet) => {
        const cancelled = LXL_Events.onChat.fire(Player$newPlayer(source.getActor()!), packet.message);
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
        const cancelled = LXL_Events.onChangeDim.fire(Player$newPlayer(<ServerPlayer>player), toDimID);
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
        const cancelled = LXL_Events.onJump.fire(Player$newPlayer(<ServerPlayer>thiz));
        _tickCallback();
        return original(thiz);
    });
}

/////////////////// PlayerSneak ///////////////////
{
    const original = symhook("?sendActorSneakChanged@ActorEventCoordinator@@QEAAXAEAVActor@@_N@Z",
    void_t, null, StaticPointer, Actor, bool_t)
    ((thiz, actor, isSneaking) => {
        const cancelled = LXL_Events.onSneak.fire(Player$newPlayer(<ServerPlayer>actor), isSneaking);
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
            const cancelled = LXL_Events.onAttackEntity.fire(Player$newPlayer(<ServerPlayer>thiz), Entity$newEntity(actor));
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
        const cancelled = LXL_Events.onAttackBlock.fire(Player$newPlayer(<ServerPlayer>player), Block$newBlock(thiz, pos, player.getDimensionId()), !itemStack.isNull() ? Item$newItem(itemStack) : null);
        _tickCallback();
        if (cancelled) {
            return false;
        }
        return original(thiz, player, pos);
    });
}

/////////////////// PlayerTakeItem ///////////////////
events.playerPickupItem.on(event => {
    const cancelled = LXL_Events.onTakeItem.fire(Player$newPlayer(<ServerPlayer>event.player), Entity$newEntity(event.itemActor), Item$newItem(event.itemActor.itemStack));
    _tickCallback();
    if (cancelled) {
        return CANCEL;
    }
});

/////////////////// PlayerDropItem ///////////////////
events.playerDropItem.on(event => {
    const cancelled = LXL_Events.onDropItem.fire(Player$newPlayer(<ServerPlayer>event.player), Item$newItem(event.itemStack));
    _tickCallback();
    if (cancelled) {
        return CANCEL;
    }
});

/////////////////// PlayerEat ///////////////////
// Food Item Component Legacy
{
    const original = symhook("?useTimeDepleted@FoodItemComponentLegacy@@UEAAPEBVItem@@AEAVItemStack@@AEAVPlayer@@AEAVLevel@@@Z",
    int32_t, null, StaticPointer, ItemStack, Player, Level)
    ((thiz, instance, player, level): MCAPI.ItemUseMethod => {
        if (LIAPI.ItemStack.getTypeName(instance) !== "minecraft:suspicious_stew") {
            const cancelled = LXL_Events.onEat.fire(Player$newPlayer(<ServerPlayer>player), Item$newItem(instance));
            _tickCallback();
            if (cancelled) {
                return MCAPI.ItemUseMethod.Unknown;
            }
        }
        return original(thiz, instance, player, level);
    });
}
// Food Item Component
{
    const original = symhook("?useTimeDepleted@FoodItemComponent@@UEAAPEBVItem@@AEAVItemStack@@AEAVPlayer@@AEAVLevel@@@Z",
    int32_t, null, StaticPointer, ItemStack, Player, Level)
    ((thiz, inoutInstance, player, level): MCAPI.ItemUseMethod => {
        const cancelled = LXL_Events.onEat.fire(Player$newPlayer(<ServerPlayer>player), Item$newItem(inoutInstance));
        _tickCallback();
        if (cancelled) {
            return MCAPI.ItemUseMethod.Unknown;
        }
        return original(thiz, inoutInstance, player, level);
    });
}
// SuspiciousStew
{
    const original = symhook("?useTimeDepleted@SuspiciousStewItem@@UEBA?AW4ItemUseMethod@@AEAVItemStack@@PEAVLevel@@PEAVPlayer@@@Z",
    int32_t, null, StaticPointer, ItemStack, Level, Player)
    ((thiz, inoutInstance, level, player): MCAPI.ItemUseMethod => {
        const cancelled = LXL_Events.onEat.fire(Player$newPlayer(<ServerPlayer>player), Item$newItem(inoutInstance));
        _tickCallback();
        if (cancelled) {
            return MCAPI.ItemUseMethod.Unknown;
        }
        return original(thiz, inoutInstance, level, player);
    });
}
// Potion
{
    const original = symhook("?useTimeDepleted@PotionItem@@UEBA?AW4ItemUseMethod@@AEAVItemStack@@PEAVLevel@@PEAVPlayer@@@Z",
    int32_t, null, StaticPointer, ItemStack, Level, Player)
    ((thiz, inoutInstance, level, player): MCAPI.ItemUseMethod => {
        const cancelled = LXL_Events.onEat.fire(Player$newPlayer(<ServerPlayer>player), Item$newItem(inoutInstance));
        _tickCallback();
        if (cancelled) {
            return MCAPI.ItemUseMethod.Unknown;
        }
        return original(thiz, inoutInstance, level, player);
    });
}
// Medicine
{
    const original = symhook("?useTimeDepleted@MedicineItem@@UEBA?AW4ItemUseMethod@@AEAVItemStack@@PEAVLevel@@PEAVPlayer@@@Z",
    int32_t, null, StaticPointer, ItemStack, Level, Player)
    ((thiz, inoutInstance, level, player): MCAPI.ItemUseMethod => {
        const cancelled = LXL_Events.onEat.fire(Player$newPlayer(<ServerPlayer>player), Item$newItem(inoutInstance));
        _tickCallback();
        if (cancelled) {
            return MCAPI.ItemUseMethod.Unknown;
        }
        return original(thiz, inoutInstance, level, player);
    });
}
// milk
{
    const original = symhook("?useTimeDepleted@BucketItem@@UEBA?AW4ItemUseMethod@@AEAVItemStack@@PEAVLevel@@PEAVPlayer@@@Z",
    int32_t, null, StaticPointer, ItemStack, Level, Player)
    ((thiz, inoutInstance, level, player): MCAPI.ItemUseMethod => {
        const cancelled = LXL_Events.onEat.fire(Player$newPlayer(<ServerPlayer>player), Item$newItem(inoutInstance));
        _tickCallback();
        if (cancelled) {
            return MCAPI.ItemUseMethod.Unknown;
        }
        return original(thiz, inoutInstance, level, player);
    });
}

/////////////////// PlayerConsumeTotem ///////////////////
{
    const original = symhook("?consumeTotem@Player@@UEAA_NXZ",
    bool_t, null, Player)
    ((thiz) => {
        const cancelled = LXL_Events.onConsumeTotem.fire(Player$newPlayer(<ServerPlayer>thiz));
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
        const cancelled = LXL_Events.onEffectAdded.fire(Player$newPlayer(thiz), MCAPI.MobEffectInstance.getComponentName(effect).str);
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
        const cancelled = LXL_Events.onEffectRemoved.fire(Player$newPlayer(thiz), MCAPI.MobEffectInstance.getComponentName(effect).str);
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
        const cancelled = LXL_Events.onEffectUpdated.fire(Player$newPlayer(thiz), MCAPI.MobEffectInstance.getComponentName(effect).str);
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
        const cancelled = LXL_Events.onStartDestroyBlock.fire(Player$newPlayer(<ServerPlayer>player), Block$newBlock(blockPos, player.getDimensionId()));
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
            const cancelled = LXL_Events.onPlaceBlock.fire(Player$newPlayer(placer), Block$newBlock(block, pos, placer.getDimensionId()));
            _tickCallback();
            if (cancelled) {
                return false;
            }
        }
        return rtn;
    });
}
{
    const original = symhook("?_tryUseOn@BedItem@@AEBA_NAEAVItemStackBase@@AEAVActor@@VBlockPos@@EMMM@Z",
    bool_t, null, StaticPointer, ItemStack, Actor, BlockPos, uint8_t, float32_t, float32_t, float32_t)
    ((thiz, instance, entity, pos, face, clickX, clickY, clickZ) => {
        if (entity.isPlayer()) {
            const cancelled = LXL_Events.onPlaceBlock.fire(Player$newPlayer(entity), Block$newBlock(pos, entity.getDimensionId()));
            _tickCallback();
            if (cancelled) {
                return false;
            }
        }
        return original(thiz, instance, entity, pos, face, clickX, clickY, clickZ);
    });
}
{
    const original = symhook("?_useOn@DyePowderItem@@EEBA_NAEAVItemStack@@AEAVActor@@VBlockPos@@EMMM@Z",
    bool_t, null, StaticPointer, ItemStack, Actor, BlockPos, uint8_t, float32_t, float32_t, float32_t)
    ((thiz, instance, entity, pos, face, clickX, clickY, clickZ) => {
        if (entity.isPlayer()) {
            const cancelled = LXL_Events.onPlaceBlock.fire(Player$newPlayer(entity), Block$newBlock(pos, entity.getDimensionId()));
            _tickCallback();
            if (cancelled) {
                return false;
            }
        }
        return original(thiz, instance, entity, pos, face, clickX, clickY, clickZ);
    });
}
{
    const original = symhook("?_useOn@DoorItem@@EEBA_NAEAVItemStack@@AEAVActor@@VBlockPos@@EMMM@Z",
    bool_t, null, StaticPointer, ItemStack, Actor, BlockPos, uint8_t, float32_t, float32_t, float32_t)
    ((thiz, instance, entity, pos, face, clickX, clickY, clickZ) => {
        if (entity.isPlayer()) {
            let block!: Block;
            switch (daccess(thiz, int32_t, 552)) {
                case 0:
                    block = Block.constructWith("minecraft:wooden_door")!;
                    break;
                case 1:
                    block = Block.constructWith("minecraft:spruce_door")!;
                    break;
                case 2:
                    block = Block.constructWith("minecraft:birch_door")!;
                    break;
                case 3:
                    block = Block.constructWith("minecraft:jungle_door")!;
                    break;
                case 4:
                    block = Block.constructWith("minecraft:acacia_door")!;
                    break;
                case 5:
                    block = Block.constructWith("minecraft:dark_oak_door")!;
                    break;
                case 6:
                    block = Block.constructWith("minecraft:iron_door")!;
                    break;
                case 7:
                    block = Block.constructWith("minecraft:crimson_door")!;
                    break;
                case 8:
                    block = Block.constructWith("minecraft:warped_door")!;
            }
            if (!block) {
                return false;
            }
            const cancelled = LXL_Events.onPlaceBlock.fire(Player$newPlayer(entity), Block$newBlock(block, pos, entity.getDimensionId()));
            _tickCallback();
            if (cancelled) {
                return false;
            }
        }
        return original(thiz, instance, entity, pos, face, clickX, clickY, clickZ);
    });
}
{
    const original = symhook("?_useOn@RedStoneDustItem@@EEBA_NAEAVItemStack@@AEAVActor@@VBlockPos@@EMMM@Z",
    bool_t, null, StaticPointer, ItemStack, Actor, BlockPos, uint8_t, float32_t, float32_t, float32_t)
    ((thiz, instance, entity, pos, face, clickX, clickY, clickZ) => {
        if (entity.isPlayer()) {
            const cancelled = LXL_Events.onPlaceBlock.fire(Player$newPlayer(entity), Block$newBlock(pos, entity.getDimensionId()));
            _tickCallback();
            if (cancelled) {
                return false;
            }
        }
        return original(thiz, instance, entity, pos, face, clickX, clickY, clickZ);
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
            const cancelled = LXL_Events.onPlaceBlock.fire(Player$newPlayer(entity), Block$newBlock(block, pos, entity.getDimensionId()));
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
            const blockPos = MCAPI.BlockPos.relative(pos, growDirection, 1);
            const block = daccess(thiz, Block.ref(), 8);
            const cancelled = LXL_Events.onPlaceBlock.fire(Player$newPlayer(entity), Block$newBlock(block, blockPos, entity.getDimensionId()));
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
    const original = symhook("?onPlayerOpenContainer@VanillaServerGameplayEventListener@@UEAA?AW4EventResult@@AEBUPlayerOpenContainerEvent@@@Z",
    uint16_t, null, StaticPointer, StaticPointer)
    ((thiz, event) => {
        const blockPos = daccess(event, BlockPos, 28);
        const pl = MCAPI.WeakEntityRef.tryUnwrap(event)!;
        const cancelled = LXL_Events.onOpenContainer.fire(Player$newPlayer(<ServerPlayer>pl), Block$newBlock(blockPos, pl.getDimensionId()));
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
        const bp = MCAPI.BlockActor.getPosition(thiz);
        const cancelled = LXL_Events.onCloseContainer.fire(Player$newPlayer(<ServerPlayer>player), Block$newBlock(bp, player.getDimensionId()));
        _tickCallback();
        return original(thiz, player);
    });
}
{
    const original = symhook("?stopOpen@BarrelBlockActor@@UEAAXAEAVPlayer@@@Z",
    bool_t, null, BlockActor, Player)
    ((thiz, player) => {
        const bp = MCAPI.BlockActor.getPosition(thiz);
        const cancelled = LXL_Events.onCloseContainer.fire(Player$newPlayer(<ServerPlayer>player), Block$newBlock(bp, player.getDimensionId()));
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
        const cancelled = LXL_Events.onInventoryChange.fire(Player$newPlayer(<ServerPlayer>thiz), slot, Item$newItem(oldItem), Item$newItem(newItem));
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
            const cancelled = LXL_Events.onMove.fire(Player$newPlayer(<ServerPlayer>player), FloatPos$newPos(player.getPosition(), player.getDimensionId()));
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
        if (thiz.isPlayer() && MCAPI.Mob.isSprinting(thiz) !== shouldSprint) {
            const cancelled = LXL_Events.onChangeSprinting.fire(Player$newPlayer(thiz), shouldSprint);
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
            const cancelled = LXL_Events.onSetArmor.fire(Player$newPlayer(thiz), slot, Item$newItem(item));
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
        const cancelled = LXL_Events.onUseRespawnAnchor.fire(Player$newPlayer(<ServerPlayer>player), IntPos$newPos(blockPos, MCAPI.BlockSource.getDimensionId(region)));
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
        const cancelled = LXL_Events.onOpenContainerScreen.fire(Player$newPlayer(<ServerPlayer>thiz));
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
        const isMinecart = MCAPI.CommandOrigin.getOriginType(origin) === MCAPI.CommandOriginType.MinecartCommandBlock;
        const pos = isMinecart ? origin.getEntity()!.getPosition() : LIAPI.BlockPos.toVec3(origin.getBlockPosition());
        const cancelled = LXL_Events.onCmdBlockExecute.fire(command, FloatPos$newPos(pos, origin.getDimension().getDimensionId()), isMinecart);
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
        const cancelled = LXL_Events.onBlockInteracted.fire(Player$newPlayer(<ServerPlayer>player), Block$newBlock(blockPos, player.getDimensionId()));
        _tickCallback();
        if (cancelled) {
            return 0;
        }
        return original(thiz, player, blockPos);
    });
}

/////////////////// BlockChanged ///////////////////
{
    const original = symhook("?_blockChanged@BlockSource@@IEAAXAEBVBlockPos@@IAEBVBlock@@1HPEBUActorBlockSyncMessage@@@Z",
    void_t, null, BlockSource, BlockPos, uint32_t, Block, Block, int32_t, StaticPointer)
    ((thiz, pos, layer, block, previousBlock, updateFlags, syncMsg) => {
        const dimId = MCAPI.BlockSource.getDimensionId(thiz);
        const cancelled = LXL_Events.onBlockChanged.fire(Block$newBlock(previousBlock, pos, dimId), Block$newBlock(block, pos, dimId));
        _tickCallback();
        if (cancelled) {
            return;
        }
        return original(thiz, pos, layer, block, previousBlock, updateFlags, syncMsg);
    });
}

/////////////////// BlockExploded ///////////////////
{
    const original = symhook("?onExploded@Block@@QEBAXAEAVBlockSource@@AEBVBlockPos@@PEAVActor@@@Z",
    void_t, null, Block, BlockSource, BlockPos, Actor)
    ((thiz, region, pos, entitySource) => {
        const cancelled = LXL_Events.onBlockExploded.fire(Block$newBlock(pos, entitySource.getDimensionId()), Entity$newEntity(entitySource));
        _tickCallback();
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

        const cancelled = LXL_Events.onFireSpread.fire(IntPos$newPos(pos, MCAPI.BlockSource.getDimensionId(region)));
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
        if (MCAPI.Player.hasOpenContainer(pl)) {
            const bp = daccess(thiz, BlockPos, 216);
            const cancelled = LXL_Events.onContainerChange.fire(Player$newPlayer(<ServerPlayer>pl), Block$newBlock(bp, pl.getDimensionId()), slot, Item$newItem(oldItem), Item$newItem(newItem));
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
            const cancelled = LXL_Events.onProjectileHitBlock.fire(Block$newBlock(pos, MCAPI.BlockSource.getDimensionId(region)), Entity$newEntity(projectile));
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
        const cancelled = LXL_Events.onRedStoneUpdate.fire(Block$newBlock(pos, MCAPI.BlockSource.getDimensionId(region)), strength, isFirstTime);
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
        const cancelled = LXL_Events.onRedStoneUpdate.fire(Block$newBlock(pos, MCAPI.BlockSource.getDimensionId(region)), strength, isFirstTime);
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
        const cancelled = LXL_Events.onRedStoneUpdate.fire(Block$newBlock(pos, MCAPI.BlockSource.getDimensionId(region)), strength, isFirstTime);
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
        const cancelled = LXL_Events.onRedStoneUpdate.fire(Block$newBlock(pos, MCAPI.BlockSource.getDimensionId(region)), strength, isFirstTime);
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
        const cancelled = LXL_Events.onHopperSearchItem.fire(FloatPos$newPos(isMinecart ? pos : LIAPI.Vec3.toBlockPos(pos), MCAPI.BlockSource.getDimensionId(region)), isMinecart);
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
        const cancelled = LXL_Events.onHopperPushOut.fire(FloatPos$newPos(position, MCAPI.BlockSource.getDimensionId(region)));
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
            const cancelled = LXL_Events.onPistonTryPush.fire(IntPos$newPos(curPos, MCAPI.BlockSource.getDimensionId(region)), Block$newBlock(MCAPI.BlockActor.getPosition(thiz), MCAPI.BlockSource.getDimensionId(region)));
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
            const cancelled = LXL_Events.onPistonPush.fire(IntPos$newPos(curPos, MCAPI.BlockSource.getDimensionId(region)), Block$newBlock(MCAPI.BlockActor.getPosition(thiz), MCAPI.BlockSource.getDimensionId(region)));
        }
        return true;
    });
}

/////////////////// FarmLandDecay ///////////////////
events.farmlandDecay.on(event => {
    const cancelled = LXL_Events.onFarmLandDecay.fire(IntPos$newPos(event.blockPos, MCAPI.BlockSource.getDimensionId(event.blockSource)), Entity$newEntity(event.culprit));
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
        const cancelled = LXL_Events.onUseFrameBlock.fire(Player$newPlayer(<ServerPlayer>player), Block$newBlock(pos, player.getDimensionId()));
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
        const cancelled = LXL_Events.onUseFrameBlock.fire(Player$newPlayer(<ServerPlayer>player), Block$newBlock(pos, player.getDimensionId()));
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
        const cancelled = LXL_Events.onLiquidFlow.fire(Block$newBlock(thiz.getRenderBlock(), pos, MCAPI.BlockSource.getDimensionId(region)), IntPos$newPos(pos, MCAPI.BlockSource.getDimensionId(region)));
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
        const src = serverInstance.minecraft.getLevel().fetchEntity(source.getDamagingEntityUniqueID(), true);
        const cancelled = LXL_Events.onPlayerDie.fire(Player$newPlayer(<ServerPlayer>thiz), src ? Entity$newEntity(src) : null);
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
            const cancelled = LXL_Events.onDestroyBlock.fire(Player$newPlayer(entity), Block$newBlock(pos, entity.getDimensionId()));
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
        const cancelled = LXL_Events.onUseItemOn.fire(Player$newPlayer(<ServerPlayer>player), Item$newItem(item), Block$newBlock(at, player.getDimensionId()), face);
        _tickCallback();
        if (cancelled) {
            return false;
        }
        return original(thiz, item, at, face, hit, targetBlock);
    });
}

/////////////////// MobHurt ///////////////////
{
    const original = symhook("?_hurt@Mob@@MEAA_NAEBVActorDamageSource@@H_N1@Z",
    bool_t, null, Actor, ActorDamageSource, int32_t, bool_t, bool_t)
    ((thiz, source, dmg, knock, ignite) => {
        const src = serverInstance.minecraft.getLevel().fetchEntity(source.getDamagingEntityUniqueID(), true);
        const cancelled = LXL_Events.onMobHurt.fire(Entity$newEntity(thiz), src ? Entity$newEntity(src) : null, dmg);
        _tickCallback();
        if (cancelled) {
            return false;
        }
        return original(thiz, source, dmg, knock, ignite);
    });
}

/////////////////// PlayerUseItem ///////////////////
{
    const original = symhook("?baseUseItem@GameMode@@QEAA_NAEAVItemStack@@@Z",
    bool_t, null, GameMode, ItemStack)
    ((thiz, item) => {
        const player = thiz.actor;
        const cancelled = LXL_Events.onUseItem.fire(Player$newPlayer(<ServerPlayer>player), Item$newItem(item));
        _tickCallback();
        if (cancelled) {
            return false;
        }
        return original(thiz, item);
    });
}

/////////////////// MobDie ///////////////////
events.entityDie.on(event => {
    const src = event.damageSource.getDamagingEntity();
    const cancelled = LXL_Events.onMobDie.fire(Entity$newEntity(event.entity), src ? Entity$newEntity(src) : null);
    _tickCallback();
    if (cancelled) {
        return CANCEL;
    }
});

///////////////////  Entity & Block Explosion ///////////////////
{
    const original = symhook("?explode@Explosion@@QEAAXXZ",
    void_t, null, MCAPI.Explosion)
    ((thiz) => {
        const actor = thiz.mSource;
        const pos = thiz.mPos;
        const radius = thiz.mRadius;
        const bs = thiz.mRegion;
        const maxResistance = thiz.mMaxResistance;
        const genFire = thiz.mFire;
        const canBreaking = thiz.mBreaking;
        if (actor.isNotNull()) {
            const cancelled = LXL_Events.onEntityExplode.fire(Entity$newEntity(actor), FloatPos$newPos(pos, actor.getDimensionId()), maxResistance, radius, canBreaking, genFire);
            _tickCallback();
            if (cancelled) {
                return;
            }
        } else {
            const bp = LIAPI.Vec3.toBlockPos(pos);
            const cancelled = LXL_Events.onBlockExplode.fire(Block$newBlock(bp, MCAPI.BlockSource.getDimensionId(bs)), FloatPos$newPos(pos, MCAPI.BlockSource.getDimensionId(bs)), maxResistance, radius, canBreaking, genFire);
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
        if (to?.isNotNull()) {
            const cancelled = LXL_Events.onProjectileHitEntity.fire(Entity$newEntity(to), Entity$newEntity(owner));
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
        const cancelled = LXL_Events.onWitherBossDestroy.fire(Entity$newEntity(thiz), IntPos$newPos(LIAPI.Vec3.toBlockPos(areaofeffect.min), thiz.getDimensionId()), IntPos$newPos(LIAPI.Vec3.toBlockPos(areaofeffect.max), thiz.getDimensionId()));
        _tickCallback();
        if (cancelled) {
            return;
        }
        return original(thiz, level, areaofeffect, region, a5);
    });
}

////////////// EntityRide //////////////
{
    const original = symhook("?_destroyBlocks@WitherBoss@@AEAAXAEAVLevel@@AEBVAABB@@AEAVBlockSource@@H@Z",
    bool_t, null, Actor, Actor)
    ((thiz, passenger) => {
        const rtn = original(thiz, passenger);
        if (!rtn) {
            return false;
        }
        const cancelled = LXL_Events.onRide.fire(Entity$newEntity(thiz), Entity$newEntity(passenger));
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
        const cancelled = LXL_Events.onStepOnPressurePlate.fire(Entity$newEntity(entity), Block$newBlock(pos, entity.getDimensionId()));
        _tickCallback();
        return original(thiz, region, pos, entity);
    });
}

////////////// ProjectileSpawn //////////////
{
    const original = symhook("?spawnProjectile@Spawner@@QEAAPEAVActor@@AEAVBlockSource@@AEBUActorDefinitionIdentifier@@PEAV2@AEBVVec3@@3@Z",
    void_t, null, Spawner, BlockSource, ActorDefinitionIdentifier, Actor, Vec3, Vec3)
    ((thiz, region, id, spawner, position, direction) => {
        let fullName = id.fullName;
        if (fullName.endsWith("<>")) {
            fullName = fullName.substring(0, fullName.length - 2);
        }
        const cancelled = LXL_Events.onSpawnProjectile.fire(Entity$newEntity(spawner), fullName);
        _tickCallback();
        if (cancelled) {
            return;
        }
        return original(thiz, region, id, spawner, position, direction);
    });
}

////////////// NpcCmd //////////////
// {
//     const original = symhook("?executeCommandAction@NpcComponent@@QEAAXAEAVActor@@AEBVPlayer@@HAEBV?$basic_string@DU?$char_traits@D@std@@V?$allocator@D@2@@std@@@Z",
//     void_t, null, StaticPointer, Actor, Player, int32_t, CxxString)
//     ((thiz, npc, owner, actionIndex, data) => {
//         const container = MCAPI.NpcSceneDialogueData.getActionsContainer(MCAPI.NpcSceneDialogueData.NpcSceneDialogueData())
//         const cancelled = LXLEvents.onNpcCmd.fire(Entity$newEntity(entity), Block$newBlock(pos, entity.getDimensionId()));
//         _tickCallback();
//         return original(thiz, region, pos, entity);
//     });
// }

////////////// ArmorStandChange //////////////
{
    const original = symhook("?_trySwapItem@ArmorStand@@AEAA_NAEAVPlayer@@W4EquipmentSlot@@@Z",
    bool_t, null, Actor, Player, int32_t)
    ((thiz, player, slot) => {
        const cancelled = LXL_Events.onChangeArmorStand.fire(Entity$newEntity(thiz), Player$newPlayer(<ServerPlayer>player), slot);
        console.log(thiz, player, slot);
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
        const level = serverInstance.minecraft.getLevel();
        const sb = level.getScoreboard();
        const pls = level.getPlayers();
        for (const pl of pls) {
            if (sb.getPlayerScoreboardId(pl).id === _id) {
                player = pl;
                break;
            }
        }
        if (player.isPlayer()) {
            const cancelled = LXL_Events.onScoreChanged.fire(Player$newPlayer(player), obj.getPlayerScore(id).value, obj.name, obj.displayName);
            _tickCallback();
        }
        return original(thiz, id, obj);
    });
}

////////////// ServerStarted //////////////
events.serverOpen.on(() => {
    LXL_Events.onServerStarted.fire();
    _tickCallback();
});


////////////// ConsoleOutput //////////////
events.commandOutput.on(log => {
    const cancelled = LXL_Events.onConsoleOutput.fire(log);
    _tickCallback();
    if (cancelled) {
        return CANCEL;
    }
})

// 植入tick
events.levelTick.on(() => {
    LXL_Events.onTick.fire();
    _tickCallback();
})

// ===== onFireworkShootWithCrossbow =====
{
    const original = symhook("?_shootFirework@CrossbowItem@@AEBAXAEBVItemInstance@@AEAVPlayer@@@Z",
    void_t, null, StaticPointer, ItemStack, Player)
    ((thiz, projectileInstance, player) => {
        const cancelled = LXL_Events.onFireworkShootWithCrossbow.fire(Player$newPlayer(<ServerPlayer>player));
        _tickCallback();
        if (cancelled) {
            return;
        }
        return original(thiz, projectileInstance, player);
    });
}