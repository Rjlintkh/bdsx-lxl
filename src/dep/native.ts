import { Actor, Actor as _Actor, ActorDamageCause, ActorDamageSource, DimensionId } from "bdsx/bds/actor";
import { Block as _Block, BlockActor as _BlockActor, BlockLegacy as _BlockLegacy, BlockSource, BlockSource as _BlockSource } from "bdsx/bds/block";
import { BlockPos as _BlockPos, Facing, Vec3, Vec3 as _Vec3 } from "bdsx/bds/blockpos";
import { Command, CommandPermissionLevel } from "bdsx/bds/command";
import { CommandOrigin as _CommandOrigin, ServerCommandOrigin as _ServerCommandOrigin } from "bdsx/bds/commandorigin";
import { Dimension } from "bdsx/bds/dimension";
import { MobEffectInstance as _MobEffectInstance } from "bdsx/bds/effects";
import { HashedString } from "bdsx/bds/hashedstring";
import { ArmorSlot, Container as _Container, FillingContainer, Item as _Item, ItemStack, ItemStack as _ItemStack, SimpleContainer } from "bdsx/bds/inventory";
import { Level as _Level, ServerLevel } from "bdsx/bds/level";
import { ByteArrayTag, ByteTag, CompoundTag as _CompoundTag, FloatTag, Int64Tag, ListTag, StringTag, Tag as _Tag } from "bdsx/bds/nbt";
import { NetworkIdentifier as _NetworkIdentifier, ServerNetworkHandler as _ServerNetworkHandler } from "bdsx/bds/networkidentifier";
import { CommandRequestPacket, LevelChunkPacket, ScorePacketInfo, SetDisplayObjectivePacket, SetScorePacket, TextPacket, TransferPacket } from "bdsx/bds/packets";
import { Player as _Player, ServerPlayer, ServerPlayer as _ServerPlayer } from "bdsx/bds/player";
import { DisplaySlot, Objective, ObjectiveSortOrder, Scoreboard as _Scoreboard, ScoreboardId as _ScoreboardId } from "bdsx/bds/scoreboard";
import { serverInstance } from "bdsx/bds/server";
import { pdb, StaticPointer, VoidPointer } from "bdsx/core";
import { CxxVector } from "bdsx/cxxvector";
import { makefunc, ParamType } from "bdsx/makefunc";
import { nativeClass, NativeClass, nativeField } from "bdsx/nativeclass";
import { bool_t, CxxString, float32_t, int16_t, int32_t, NativeType, uint16_t, uint32_t, uint64_as_float_t, uint8_t, void_t } from "bdsx/nativetype";
import { ProcHacker } from "bdsx/prochacker";
import { logger, TODO } from "../api/api_help";
import path = require("path");

const RVAs = pdb.getList(path.join(__dirname, "pdb.ini"), {}, [
    // Actor
    "?_sendDirtyActorData@Actor@@QEAAXXZ",
    "?canAddPassenger@Actor@@UEBA_NAEAV1@@Z",
    "?getArmorContainer@Actor@@QEAAAEAVSimpleContainer@@XZ",
    "?getBlockPosCurrentlyStandingOn@Actor@@QEBA?AVBlockPos@@PEAV1@@Z",
    "?isInWater@Actor@@UEBA_NXZ",
    // ActorEventCoordinator
    "?sendActorSneakChanged@ActorEventCoordinator@@QEAAXAEAVActor@@_N@Z",
    // BarrelBlockActor
    "?stopOpen@BarrelBlockActor@@UEAAXAEAVPlayer@@@Z",
    // BaseCommandBlock
    "?_performCommand@BaseCommandBlock@@AEAA_NAEAVBlockSource@@AEBVCommandOrigin@@AEA_N@Z",
    "?getCommand@BaseCommandBlock@@QEBAAEBV?$basic_string@DU?$char_traits@D@std@@V?$allocator@D@2@@std@@XZ",
    // BasePressurePlateBlock
    "?entityInside@BasePressurePlateBlock@@UEBAXAEAVBlockSource@@AEBVBlockPos@@AEAVActor@@@Z",
    // BedItem
    "?_tryUseOn@BedItem@@AEBA_NAEAVItemStackBase@@AEAVActor@@VBlockPos@@EMMM@Z",
    // Block
    "?attack@Block@@QEBA_NPEAVPlayer@@AEBVBlockPos@@@Z",
    "?hasBlockEntity@Block@@QEBA_NXZ",
    "?onExploded@Block@@QEBAXAEAVBlockSource@@AEBVBlockPos@@PEAVActor@@@Z",
    "?onProjectileHit@Block@@QEBAXAEAVBlockSource@@AEBVBlockPos@@AEBVActor@@@Z",
    // BlockActor
    "?getPosition@BlockActor@@QEBAAEBVBlockPos@@XZ",
    "?getType@BlockActor@@QEBAAEBW4BlockActorType@@XZ",
    // BlockEventCoordinator
    "?sendBlockDestructionStarted@BlockEventCoordinator@@QEAAXAEAVPlayer@@AEBVBlockPos@@@Z",
    // BlockLegacy
    "?getBlockItemId@BlockLegacy@@QEBAFXZ",
    "?getStateFromLegacyData@BlockLegacy@@UEBAAEBVBlock@@G@Z",
    // BlockPos
    "?relative@BlockPos@@QEBA?AV1@EH@Z",
    // BlockSource
    "?_blockChanged@BlockSource@@IEAAXAEBVBlockPos@@IAEBVBlock@@1HPEBUActorBlockSyncMessage@@@Z",
    "?checkBlockDestroyPermissions@BlockSource@@QEAA_NAEAVActor@@AEBVBlockPos@@AEBVItemStackBase@@_N@Z",
    "?getDimensionId@BlockSource@@UEBA?AV?$AutomaticID@VDimension@@H@@XZ",
    "?mayPlace@BlockSource@@QEAA_NAEBVBlock@@AEBVBlockPos@@EPEAVActor@@_N@Z",
    "?removeBlockEntity@BlockSource@@QEAA?AV?$shared_ptr@VBlockActor@@@std@@AEBVBlockPos@@@Z",
    // BucketItem
    "?useTimeDepleted@BucketItem@@UEBA?AW4ItemUseMethod@@AEAVItemStack@@PEAVLevel@@PEAVPlayer@@@Z",
    // ChestBlockActor
    "?stopOpen@ChestBlockActor@@UEAAXAEAVPlayer@@@Z",
    // ComparatorBlock
    "?onRedstoneUpdate@ComparatorBlock@@UEBAXAEAVBlockSource@@AEBVBlockPos@@H_N@Z",
    // CommandUtils
    "?getFeetPos@CommandUtils@@YA?AVVec3@@PEBVActor@@@Z",
    // Container
    "?addItem@Container@@UEAAXAEAVItemStack@@@Z",
    "?addItemToFirstEmptySlot@Container@@UEAA_NAEBVItemStack@@@Z",
    "?hasRoomForItem@Container@@UEAA_NAEBVItemStack@@@Z",
    "?isEmpty@Container@@UEBA_NXZ",
    "?removeAllItems@Container@@UEAAXXZ",
    "?removeItem@Container@@UEAAXHH@Z",
    // CrossbowItem
    "?_shootFirework@CrossbowItem@@AEBAXAEBVItemInstance@@AEAVPlayer@@@Z",
    // DiodeBlock
    "?onRedstoneUpdate@DiodeBlock@@UEBAXAEAVBlockSource@@AEBVBlockPos@@H_N@Z",
    // DoorItem
    "?_useOn@DoorItem@@EEBA_NAEAVItemStack@@AEAVActor@@VBlockPos@@EMMM@Z",
    // DropperBlockActor
    "?_getContainerAt@DropperBlockActor@@AEAAPEAVContainer@@AEAVBlockSource@@AEBVVec3@@@Z",
    // DyePowderItem
    "?_useOn@DyePowderItem@@EEBA_NAEAVItemStack@@AEAVActor@@VBlockPos@@EMMM@Z",
    // Explosion
    "?explode@Explosion@@QEAAXXZ",
    // Facing
    "?convertYRotationToFacingDirection@Facing@@SAEM@Z",
    // FireBlock
    "?mayPlace@FireBlock@@UEBA_NAEAVBlockSource@@AEBVBlockPos@@@Z",
    "?onPlace@FireBlock@@UEBAXAEAVBlockSource@@AEBVBlockPos@@@Z",
    // FoodItemComponent
    "?useTimeDepleted@FoodItemComponent@@UEAAPEBVItem@@AEAVItemStack@@AEAVPlayer@@AEAVLevel@@@Z",
    // FoodItemComponentLegacy
    "?useTimeDepleted@FoodItemComponentLegacy@@UEAAPEBVItem@@AEAVItemStack@@AEAVPlayer@@AEAVLevel@@@Z",
    // GameMode
    "?baseUseItem@GameMode@@QEAA_NAEAVItemStack@@@Z",
    "?useItemOn@GameMode@@UEAA_NAEAVItemStack@@AEBVBlockPos@@EAEBVVec3@@PEBVBlock@@@Z",
    // HitResult
    "?getEntity@HitResult@@QEBAPEAVActor@@XZ",
    // Hopper
    "?_pushOutItems@Hopper@@IEAA_NAEAVBlockSource@@AEAVContainer@@AEBVVec3@@H@Z",
    "?_tryPullInItemsFromAboveContainer@Hopper@@IEAA_NAEAVBlockSource@@AEAVContainer@@AEBVVec3@@@Z",
    // Item
    "?getSerializedName@Item@@QEBA?AV?$basic_string@DU?$char_traits@D@std@@V?$allocator@D@2@@std@@XZ",
    // ItemFrameBlock
    "?attack@ItemFrameBlock@@UEBA_NPEAVPlayer@@AEBVBlockPos@@@Z",
    "?use@ItemFrameBlock@@UEBA_NAEAVPlayer@@AEBVBlockPos@@E@Z",
    // ItemStackBase
    "?setNull@ItemStackBase@@UEAAXXZ",
    // Level
    "?explode@Level@@UEAAXAEAVBlockSource@@PEAVActor@@AEBVVec3@@M_N3M3@Z",
    "?spawnParticleEffect@Level@@UEAAXAEBV?$basic_string@DU?$char_traits@D@std@@V?$allocator@D@2@@std@@AEBVVec3@@PEAVDimension@@@Z",
    // LevelContainerModel
    "?_onItemChanged@LevelContainerModel@@MEAAXHAEBVItemStack@@0@Z",
    "?_playerChangeDimension@Level@@AEAA_NPEAVPlayer@@AEAVChangeDimensionRequest@@@Z",
    // LiquidBlockDynamic
    "?_canSpreadTo@LiquidBlockDynamic@@AEBA_NAEAVBlockSource@@AEBVBlockPos@@1E@Z",
    // MedicineItem
    "?useTimeDepleted@MedicineItem@@UEBA?AW4ItemUseMethod@@AEAVItemStack@@PEAVLevel@@PEAVPlayer@@@Z",
    // Mob
    "?_hurt@Mob@@MEAA_NAEBVActorDamageSource@@H_N1@Z",
    "?getSpeed@Mob@@UEBAMXZ",
    "?isSprinting@Mob@@QEBA_NXZ",
    "?sendArmorSlot@Mob@@QEAAXW4ArmorSlot@@@Z",
    "?sendInventory@Mob@@UEAAX_N@Z",
    "?setSprinting@Mob@@UEAAX_N@Z",
    "?kill@Mob@@UEAAXXZ",
    // MobEffectInstance
    "?getComponentName@MobEffectInstance@@QEBAAEBVHashedString@@XZ",
    // NpcActionsContainer
    "?getActionAt@NpcActionsContainer@@QEAAPEAVNpcAction@@_K@Z",
    // NpcComponent
    "?executeCommandAction@NpcComponent@@QEAAXAEAVActor@@AEBVPlayer@@HAEBV?$basic_string@DU?$char_traits@D@std@@V?$allocator@D@2@@std@@@Z",
    // NpcSceneDialogueData
    "??0NpcSceneDialogueData@@QEAA@AEAVNpcComponent@@AEAVActor@@AEBV?$basic_string@DU?$char_traits@D@std@@V?$allocator@D@2@@std@@@Z",
    "?getActionsContainer@NpcSceneDialogueData@@UEAAAEAUNpcActionsContainer@@XZ",
    // OnFireSystem
    "?setOnFire@OnFireSystem@@SAXAEAVActor@@H@Z",
    "?setOnFireNoEffects@OnFireSystem@@SAXAEAVActor@@H@Z",
    // PacketHandlerDispatcherInstance
    "?handle@?$PacketHandlerDispatcherInstance@VRespawnPacket@@$0A@@@UEBAXAEBVNetworkIdentifier@@AEAVNetEventCallback@@AEAV?$shared_ptr@VPacket@@@std@@@Z",
    // PistonBlockActor
    "?_attachedBlockWalker@PistonBlockActor@@AEAA_NAEAVBlockSource@@AEBVBlockPos@@EE@Z",
    // Player
    "?_trySwapItem@ArmorStand@@AEAA_NAEAVPlayer@@W4EquipmentSlot@@@Z",
    "?addExperience@Player@@UEAAXH@Z",
    "?addLevels@Player@@UEAAXH@Z",
    "?attack@Player@@UEAA_NAEAVActor@@AEBW4ActorDamageCause@@@Z",
    "?canOpenContainerScreen@Player@@UEAA_NXZ",
    "?consumeTotem@Player@@UEAA_NXZ",
    "?die@Player@@UEAAXAEBVActorDamageSource@@@Z",
    "?drop@Player@@UEAA_NAEBVItemStack@@_N@Z",
    "?getPlatform@Player@@QEBA?AW4BuildPlatform@@XZ",
    "?getSpeed@Player@@UEBAMXZ",
    "?getXuid@Player@@UEBA?AV?$basic_string@DU?$char_traits@D@std@@V?$allocator@D@2@@std@@XZ",
    "?hasOpenContainer@Player@@QEBA_NXZ",
    "?inventoryChanged@Player@@UEAAXAEAVContainer@@HAEBVItemStack@@1_N@Z",
    "?jumpFromGround@Player@@UEAAXXZ",
    "?setArmor@Player@@UEAAXW4ArmorSlot@@AEBVItemStack@@@Z",
    "?take@Player@@QEAA_NAEAVActor@@HH@Z",
    // PlayerEventCoordinator
    "?sendPlayerMove@PlayerEventCoordinator@@QEAAXAEAVPlayer@@@Z",
    // PotionItem
    "?useTimeDepleted@PotionItem@@UEBA?AW4ItemUseMethod@@AEAVItemStack@@PEAVLevel@@PEAVPlayer@@@Z",
    // ProjectileComponent
    "?onHit@ProjectileComponent@@QEAAXAEAVActor@@AEBVHitResult@@@Z",
    // RedStoneDustItem
    "?_useOn@RedStoneDustItem@@EEBA_NAEAVItemStack@@AEAVActor@@VBlockPos@@EMMM@Z",
    // RedstoneTorchBlock
    "?onRedstoneUpdate@RedstoneTorchBlock@@UEBAXAEAVBlockSource@@AEBVBlockPos@@H_N@Z",
    // RedstoneWireBlock
    "?onRedstoneUpdate@RedStoneWireBlock@@UEBAXAEAVBlockSource@@AEBVBlockPos@@H_N@Z",
    // RespawnAnchorBlock
    "?trySetSpawn@RespawnAnchorBlock@@CA_NAEAVPlayer@@AEBVBlockPos@@AEAVBlockSource@@AEAVLevel@@@Z",
    // ScoreboardId
    "?isValid@ScoreboardId@@QEBA_NXZ",
    // SeedItemComponentLegacy
    "?useOn@SeedItemComponentLegacy@@QEAA_NAEAVItemStack@@AEAVActor@@AEBVBlockPos@@EAEBVVec3@@@Z",
    // ServerCommandOrigin
    "??0ServerCommandOrigin@@QEAA@AEBV?$basic_string@DU?$char_traits@D@std@@V?$allocator@D@2@@std@@AEAVServerLevel@@W4CommandPermissionLevel@@V?$AutomaticID@VDimension@@H@@@Z",
    // ServerNetworkHandler
    "?_onPlayerLeft@ServerNetworkHandler@@AEAAXPEAVServerPlayer@@_N@Z",
    "?handle@ServerNetworkHandler@@UEAAXAEBVNetworkIdentifier@@AEBVCommandRequestPacket@@@Z",
    "?handle@ServerNetworkHandler@@UEAAXAEBVNetworkIdentifier@@AEBVTextPacket@@@Z",
    "?sendLoginMessageLocal@ServerNetworkHandler@@QEAAXAEBVNetworkIdentifier@@AEBVConnectionRequest@@AEAVServerPlayer@@@Z",
    // ServerPlayer
    "?onEffectAdded@ServerPlayer@@MEAAXAEAVMobEffectInstance@@@Z",
    "?onEffectRemoved@ServerPlayer@@MEAAXAEAVMobEffectInstance@@@Z",
    "?onEffectUpdated@ServerPlayer@@MEAAXAEAVMobEffectInstance@@@Z",
    "?setLocalPlayerAsInitialized@ServerPlayer@@QEAAXXZ",
    "?resendAllChunks@ServerPlayer@@UEAAXXZ",
    // ServerScoreboard
    "?clearDisplayObjective@ServerScoreboard@@UEAAPEAVObjective@@AEBV?$basic_string@DU?$char_traits@D@std@@V?$allocator@D@2@@std@@@Z",
    "?createScoreboardId@ServerScoreboard@@UEAAAEBUScoreboardId@@AEBV?$basic_string@DU?$char_traits@D@std@@V?$allocator@D@2@@std@@@Z",
    "?onScoreChanged@ServerScoreboard@@UEAAXAEBUScoreboardId@@AEBVObjective@@@Z",
    // SignItem
    "?_calculatePlacePos@SignItem@@EEBA_NAEAVItemStackBase@@AEAVActor@@AEAEAEAVBlockPos@@@Z",
    // SimulatedPlayer
    "??_7SimulatedPlayer@@6B@",
    // SimpleContainer
    "?getItem@SimpleContainer@@UEBAAEBVItemStack@@H@Z",
    // Spawner
    "?spawnProjectile@Spawner@@QEAAPEAVActor@@AEAVBlockSource@@AEBUActorDefinitionIdentifier@@PEAV2@AEBVVec3@@3@Z",
    // SuspiciousStewItem
    "?useTimeDepleted@SuspiciousStewItem@@UEBA?AW4ItemUseMethod@@AEAVItemStack@@PEAVLevel@@PEAVPlayer@@@Z",
    // VanillaBlocks
    "?mWallSign@VanillaBlocks@@3PEBVBlock@@EB",
    "?mSign@VanillaBlocks@@3PEBVBlock@@EB",
    "?mSpruceWallSign@VanillaBlocks@@3PEBVBlock@@EB",
    "?mSpruceSign@VanillaBlocks@@3PEBVBlock@@EB",
    "?mBirchWallSign@VanillaBlocks@@3PEBVBlock@@EB",
    "?mBirchSign@VanillaBlocks@@3PEBVBlock@@EB",
    "?mJungleWallSign@VanillaBlocks@@3PEBVBlock@@EB",
    "?mJungleSign@VanillaBlocks@@3PEBVBlock@@EB",
    "?mAcaciaWallSign@VanillaBlocks@@3PEBVBlock@@EB",
    "?mAcaciaSign@VanillaBlocks@@3PEBVBlock@@EB",
    "?mDarkOakWallSign@VanillaBlocks@@3PEBVBlock@@EB",
    "?mDarkOakSign@VanillaBlocks@@3PEBVBlock@@EB",
    "?mCrimsonWallSign@VanillaBlocks@@3PEBVBlock@@EB",
    "?mCrimsonStandingSign@VanillaBlocks@@3PEBVBlock@@EB",
    "?mWarpedWallSign@VanillaBlocks@@3PEBVBlock@@EB",
    "?mWarpedStandingSign@VanillaBlocks@@3PEBVBlock@@EB",
    // VanillaServerGameplayEventListener
    "?onBlockInteractedWith@VanillaServerGameplayEventListener@@UEAA?AW4EventResult@@AEAVPlayer@@AEBVBlockPos@@@Z",
    "?onPlayerOpenContainer@VanillaServerGameplayEventListener@@UEAA?AW4EventResult@@AEBUPlayerOpenContainerEvent@@@Z",
    // WeakEntityRef
    "??$tryUnwrap@VPlayer@@$$V@WeakEntityRef@@QEBAPEAVPlayer@@XZ",
    // WitherBoss
    "?_destroyBlocks@WitherBoss@@AEAAXAEAVLevel@@AEBVAABB@@AEAVBlockSource@@H@Z",
], false);

const hacker = new ProcHacker(RVAs);
export const symcall = ((...args: any[]) => {
    if (!(symcall as any).cache) {
        (symcall as any).cache = new Map();
    }
    if ((symcall as any).cache.has(args[0])) {
        return (symcall as any).cache.get(args[0]);
    }
    const func = (hacker.js as any)(...args);
    (symcall as any).cache.set(args[0], func);
    return func;
}) as typeof hacker.js;
export const symhook = hacker.hooking.bind(hacker) as typeof hacker.hooking;
export const dlsym = (name: keyof typeof RVAs) => RVAs[name];
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
        export const getArmorContainer: (thiz: _Actor) => SimpleContainer = symcall("?getArmorContainer@Actor@@QEAAAEAVSimpleContainer@@XZ", SimpleContainer, null, _Actor);
        export const getBlockPosCurrentlyStandingOn = (thiz: _Actor) => symcall("?getBlockPosCurrentlyStandingOn@Actor@@QEBA?AVBlockPos@@PEAV1@@Z", _BlockPos, {this:_Actor, structureReturn:true}, _Actor).call(thiz, thiz);
        export const isInWater: (thiz: _Actor) => boolean = symcall("?isInWater@Actor@@UEBA_NXZ", bool_t, null, _Actor);
    }
    export namespace BaseCommandBlock {
        export const getCommand: (thiz: StaticPointer) => string = symcall("?getCommand@BaseCommandBlock@@QEBAAEBV?$basic_string@DU?$char_traits@D@std@@V?$allocator@D@2@@std@@XZ", CxxString, null, StaticPointer);
    }
    export namespace Block {
        export const hasBlockEntity: (thiz: _Block) => boolean = symcall("?hasBlockEntity@Block@@QEBA_NXZ", bool_t, null, _Block);
    }
    export namespace BlockActor {
        export const getPosition: (thiz: _BlockActor) => _BlockPos = symcall("?getPosition@BlockActor@@QEBAAEBVBlockPos@@XZ", _BlockPos, null, _BlockActor);
        export const getType: (thiz: _BlockActor) => number = symcall("?getType@BlockActor@@QEBAAEBW4BlockActorType@@XZ", uint32_t, null, _BlockActor);
    }
    export namespace BlockLegacy {
        export const getBlockItemId: (thiz: _BlockLegacy) => number = symcall("?getBlockItemId@BlockLegacy@@QEBAFXZ", int16_t, null, _BlockLegacy);
        export const getStateFromLegacyData: (thiz: _BlockLegacy, data: number) => _Block = symcall("?getStateFromLegacyData@BlockLegacy@@UEBAAEBVBlock@@G@Z", _Block.ref(), null, _BlockLegacy, uint16_t);
    }
    export namespace BlockPos {
        const $relative = symcall("?relative@BlockPos@@QEBA?AV1@EH@Z", _BlockPos, {this:_BlockPos, structureReturn:true}, uint8_t, int32_t);
        export const relative = (thiz: _BlockPos, facing: Facing, steps: number): _BlockPos => $relative.call(thiz, facing, steps);
    }
    export namespace BlockSource {
        export const getDimensionId = (thiz: _BlockSource): DimensionId => symcall("?getDimensionId@BlockSource@@UEBA?AV?$AutomaticID@VDimension@@H@@XZ", int32_t, {this: _BlockSource, structureReturn: true,}).call(thiz);
        export const removeBlockEntity: (thiz: _BlockSource, blockPos: _BlockPos) => StaticPointer = symcall("?removeBlockEntity@BlockSource@@QEAA?AV?$shared_ptr@VBlockActor@@@std@@AEBVBlockPos@@@Z", StaticPointer, null, _BlockSource, _BlockPos);
    }
    export namespace CommandOrigin {
        const $getOriginType = makefunc.js([0xB0], uint8_t, {this: _CommandOrigin});
        export const getOriginType = (thiz: _CommandOrigin): CommandOriginType => $getOriginType.call(thiz);
    }
    export enum CommandOriginType {
        Player,
        CommandBlock,
        MinecartCommandBlock,
        DevConsole,
        Test,
        AutomationPlayer,
        ClientAutomation,
        Server,
        Entity,
        Virtual,
        GameArgument,
        EntityServer,
        Precompiled,
        GameMasterEntityServer,
        Scripting,
    }
    export namespace CommandUtils {
        export const getFeetPos: (entity: _Actor) => _Vec3 = symcall("?getFeetPos@CommandUtils@@YA?AVVec3@@PEBVActor@@@Z", _Vec3, {structureReturn: true}, _Actor);
    }
    export namespace Container {
        export const addItem: (thiz: _Container, item: _ItemStack) => void = symcall("?addItem@Container@@UEAAXAEAVItemStack@@@Z", void_t, null, _Container, _ItemStack);
        export const addItemToFirstEmptySlot: (thiz: _Container, item: _ItemStack) => boolean = symcall("?addItemToFirstEmptySlot@Container@@UEAA_NAEBVItemStack@@@Z", bool_t, null, _Container, _ItemStack);
        export const getItem: (thiz: _Container, slot: number) => _ItemStack = symcall("?getItem@SimpleContainer@@UEBAAEBVItemStack@@H@Z", _ItemStack, null, _Container, uint8_t);
        export const hasRoomForItem: (thiz: _Container, item: _ItemStack) => boolean = symcall("?hasRoomForItem@Container@@UEAA_NAEBVItemStack@@@Z", bool_t, null, _Container, _ItemStack);
        export const isEmpty: (thiz: _Container) => boolean = symcall("?isEmpty@Container@@UEBA_NXZ", bool_t, null, _Container);
        export const removeAllItems: (thiz: _Container) => void = symcall("?removeAllItems@Container@@UEAAXXZ", void_t, null, _Container);
        export const removeItem: (thiz: _Container, slot: number, count: number) => void = symcall("?removeItem@Container@@UEAAXHH@Z", void_t, null, _Container, int32_t, int32_t);
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
        @nativeField(_Actor.ref(), 0x58)
        mSource: _Actor;
        @nativeField(_BlockSource.ref())
        mRegion: _BlockSource;
        @nativeField(float32_t)
        mMaxResistance: float32_t;
        @nativeField(bool_t)
        mOverrideInWater: bool_t;
    }
    export namespace Facing {
        export const convertYRotationToFacingDirection: (yRotation: number) => number = symcall("?convertYRotationToFacingDirection@Facing@@SAEM@Z", uint8_t, null, float32_t);
    }
    export namespace HitResult {
        export const getEntity: (thiz: StaticPointer) => _Actor = symcall("?getEntity@HitResult@@QEBAPEAVActor@@XZ", _Actor.ref(), null, StaticPointer);
    }
    export namespace Item {
        export const getSerializedName = (thiz: _Item) => symcall("?getSerializedName@Item@@QEBA?AV?$basic_string@DU?$char_traits@D@std@@V?$allocator@D@2@@std@@XZ", CxxString, {this:_Item, structureReturn:true}).call(thiz);
    }
    export namespace ItemStackBase {
        export const setNull: (thiz: _ItemStack) => void = symcall("?setNull@ItemStackBase@@UEAAXXZ", void_t, null, _ItemStack);
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
    export namespace Level {
        export const explode: (thiz: _Level, region: BlockSource, source: _Actor | VoidPointer, pos: Vec3, explosionRadius: number, fire: boolean, breaksBlocks: boolean, maxResistance: number, allowUnderwater: boolean) => void = symcall("?explode@Level@@UEAAXAEAVBlockSource@@PEAVActor@@AEBVVec3@@M_N3M3@Z", void_t, null, _Level, _BlockSource, VoidPointer, Vec3, float32_t, bool_t, bool_t, float32_t, bool_t);
        export const spawnParticleEffect: (thiz: _Level, effectName: string, spawnLocation: Vec3, dimension: Dimension) => void = symcall("?spawnParticleEffect@Level@@UEAAXAEBV?$basic_string@DU?$char_traits@D@std@@V?$allocator@D@2@@std@@AEBVVec3@@PEAVDimension@@@Z", void_t, null, _Level, CxxString, Vec3, Dimension);
    }
    export namespace Mob {
        export const _hurt: (thiz: _Actor, source: ActorDamageSource, damage: number, knock: boolean, ignite: boolean) => boolean = symcall("?_hurt@Mob@@MEAA_NAEBVActorDamageSource@@H_N1@Z", bool_t, null, _Actor, ActorDamageSource, int32_t, bool_t, bool_t);
        export const getSpeed: (thiz: _Actor) => number = symcall("?getSpeed@Mob@@UEBAMXZ", float32_t, null, _Actor);
        export const isSprinting: (thiz: _Actor) => boolean = symcall("?isSprinting@Mob@@QEBA_NXZ", bool_t, null, _Actor);
        export const sendArmorSlot: (thiz: _Actor, slot: ArmorSlot) => void = symcall("?sendArmorSlot@Mob@@QEAAXW4ArmorSlot@@@Z", void_t, null, _Actor, uint32_t);
        export const sendInventory: (thiz: _Actor, shouldSelectSlow: bool_t) => void = symcall("?sendInventory@Mob@@UEAAX_N@Z", void_t, null, _Actor, bool_t);
        export const setSprinting: (thiz: _Actor, shouldSprint: boolean) => void = symcall("?setSprinting@Mob@@UEAAX_N@Z", void_t, null, _Actor, bool_t);
        export const kill: (thiz: _Actor) => void = symcall("?kill@Mob@@UEAAXXZ", void_t, null, _Actor);
    }
    export namespace MobEffectInstance {
        export const getComponentName: (thiz: _MobEffectInstance) => HashedString = symcall("?getComponentName@MobEffectInstance@@QEBAAEBVHashedString@@XZ", HashedString, null, _MobEffectInstance);
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
    export namespace OnFireSystem {
        export const setOnFire: (target: _Actor, seconds: number) => void = symcall("?setOnFire@OnFireSystem@@SAXAEAVActor@@H@Z", void_t, null, _Actor, int32_t);
        export const setOnFireNoEffects: (target: _Actor, seconds: number) => void = symcall("?setOnFireNoEffects@OnFireSystem@@SAXAEAVActor@@H@Z", void_t, null, _Actor, int32_t);
    }
    export namespace Player {
        export const addLevels: (thiz: _Player, levels: number) => void = symcall("?addLevels@Player@@UEAAXH@Z", void_t, null, _Player, int32_t);
        export const getPlatform: (thiz: _Player) => number = symcall("?getPlatform@Player@@QEBA?AW4BuildPlatform@@XZ", int32_t, null, _Player);
        export const getSpeed: (thiz: _Player) => number = symcall("?getSpeed@Player@@UEBAMXZ", float32_t, null, _Player);
        const $getXuid = symcall("?getXuid@Player@@UEBA?AV?$basic_string@DU?$char_traits@D@std@@V?$allocator@D@2@@std@@XZ", CxxString, null, _Player, CxxString);
        export const getXuid = (thiz: _Player) => $getXuid(thiz, "");
        export const hasOpenContainer: (thiz: _Player) => boolean = symcall("?hasOpenContainer@Player@@QEBA_NXZ", bool_t, null, _Player);
    }
    export namespace ScoreboardId {
        export const isValid: (thiz: _ScoreboardId) => boolean = symcall("?isValid@ScoreboardId@@QEBA_NXZ", bool_t, null, _ScoreboardId);
    }
    export namespace ServerCommandOrigin {
        export const ServerCommandOrigin: (thiz: _ServerCommandOrigin, requestId: string, level: ServerLevel, permission: CommandPermissionLevel) => void = symcall("??0ServerCommandOrigin@@QEAA@AEBV?$basic_string@DU?$char_traits@D@std@@V?$allocator@D@2@@std@@AEAVServerLevel@@W4CommandPermissionLevel@@V?$AutomaticID@VDimension@@H@@@Z", void_t, null, _ServerCommandOrigin, CxxString, ServerLevel, int32_t);
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
    export namespace ServerPlayer {
        export const resendAllChunks: (thiz: _ServerPlayer) => void = symcall("?resendAllChunks@ServerPlayer@@UEAAXXZ", void_t, null, _ServerPlayer);
    }
    export namespace ServerScoreboard {
        export const clearDisplayObjective: (thiz: _Scoreboard, displaySlotName: DisplaySlot) => Objective | null = symcall("?clearDisplayObjective@ServerScoreboard@@UEAAPEAVObjective@@AEBV?$basic_string@DU?$char_traits@D@std@@V?$allocator@D@2@@std@@@Z", Objective, null, _Scoreboard, CxxString);
        export const createScoreboardId: (thiz: _Scoreboard, name: string) => _ScoreboardId = symcall("?createScoreboardId@ServerScoreboard@@UEAAAEBUScoreboardId@@AEBV?$basic_string@DU?$char_traits@D@std@@V?$allocator@D@2@@std@@@Z", _ScoreboardId, null, _Scoreboard, CxxString);
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

export namespace LIAPI {
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
            return MCAPI.CommandUtils.getFeetPos(thiz);
        }
        export function getTypeName(thiz: _Actor) {
            if (thiz.isPlayer()) {
                return "minecraft:player";
            } else {
                const hash = daccess(thiz, HashedString, 880);
                return hash.str;
            }
        }
        export function hurtEntity(thiz: _Actor, damage: number) {
            let ad = ActorDamageSource.constructWith(ActorDamageCause.Void);
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
                MCAPI.OnFireSystem.setOnFire(thiz, num);
            } else {
                MCAPI.OnFireSystem.setOnFireNoEffects(thiz, num);
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
            const bl = MCAPI.BlockLegacy.getStateFromLegacyData(thiz, tileData);
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
            if (!MCAPI.Container.hasRoomForItem(thiz, item)) {
                return false;
            }
            MCAPI.Container.addItem(thiz, item.cloneItem());
            return true;
        }
        export function addItemToFirstEmptySlotSafe(thiz: _Container, item: _ItemStack) {
            return MCAPI.Container.addItemToFirstEmptySlot(thiz, item.cloneItem());
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
            return MCAPI.Item.getSerializedName(thiz.getItem()!);
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
            const players = serverInstance.minecraft.getLevel().getPlayers();
            for (const sp of players) {
                Player.sendText(sp, a1, ty);
            }
        }
    }
    export namespace Mob {
        export function refreshInventory(thiz: _Actor) {
            MCAPI.Mob.sendInventory(thiz, true);
            MCAPI.Mob.sendArmorSlot(thiz, ArmorSlot.Head);
            MCAPI.Mob.sendArmorSlot(thiz, ArmorSlot.Torso);
            MCAPI.Mob.sendArmorSlot(thiz, ArmorSlot.Legs);
            MCAPI.Mob.sendArmorSlot(thiz, ArmorSlot.Feet);
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
                    MCAPI.ItemStackBase.setNull(item);
                    res++;
                }
            }
            {
                const item = thiz.getOffhandSlot();
                if (ItemStack.getTypeName(item) === typeName) {
                    MCAPI.ItemStackBase.setNull(item);
                    res++;
                }
            }
            {
                const container = thiz.getInventory().container;
                let items = container.getSlots();
                for (let i = 0; i < items.size(); i++) {
                    if (ItemStack.getTypeName(items.get(i)) === typeName) {
                        const cnt = ItemStack.getCount(items.get(i));
                        MCAPI.Container.removeItem(container, i, cnt);
                        res += cnt;
                    }
                }
                items.destruct();
            }
            {
                const armor = MCAPI.Actor.getArmorContainer(thiz);
                let items = armor.getSlots();
                for (let i = 0; i < items.size(); i++) {
                    if (ItemStack.getTypeName(items.get(i)) === typeName) {
                        const cnt = ItemStack.getCount(items.get(i));
                        MCAPI.Container.removeItem(armor, i, cnt);
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
            return serverInstance.minecraft.getNetworkHandler().instance.peer.GetAveragePing(thiz.getNetworkIdentifier().address);
        }
        export function getDeviceName(thiz: _Player) {
            switch (MCAPI.Player.getPlatform(thiz)) {
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
            return daccess(thiz, FillingContainer.ref(), 4200);
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
            serverInstance.disconnectClient(thiz.getNetworkIdentifier(), msg, false);
            return true;
        }
        export function runcmd(thiz: _Player, cmd: string) {
            let pkt = CommandRequestPacket.allocate();
            pkt.command = cmd;
            MCAPI.ServerNetworkHandler.handle(serverInstance.minecraft.getServerNetworkHandler(), thiz.getNetworkIdentifier(), pkt);
            return true;
        }
        export function refreshInventory(thiz: _Player) {
            (thiz as ServerPlayer).sendInventory();
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
            MCAPI.ServerNetworkHandler.handle(serverInstance.minecraft.getServerNetworkHandler(), thiz.getNetworkIdentifier(), pkt);
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
                identity = MCAPI.ServerScoreboard.createScoreboardId(thiz, id);
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
            return MCAPI.ScoreboardId.isValid(identity);
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
                    return (thiz as ByteTag).data.toString();
                case _Tag.Type.Int64:
                        return (thiz as Int64Tag).dataAsString;
                case _Tag.Type.Float:
                case _Tag.Type.Double:
                    return (thiz as FloatTag).data.toFixed(6);
                case _Tag.Type.ByteArray:
                    return Buffer.from(String.fromCharCode(...(<ByteArrayTag>thiz).toUint8Array())).toString("base64");
                case _Tag.Type.String:
                    return (thiz as StringTag).data;
                case _Tag.Type.List:
                {
                    const result: any[] = [];
                    for (const tag of (thiz as ListTag<_Tag>).data) {
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