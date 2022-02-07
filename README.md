
## BDSX-LXL: Load LiteXLoader JS plugins in BDSX!

#### Background
Both LiteXLoader (LXL) and Bedrock Dedicated Server eXtended (BDSX) are popular options of loading different kinds of plugins currently. However, JS plugins designed for LXL cannot be loaded in BDSX and they need a lot of extra work to port to BDSX. This plugin aims to reduce the work and allow users to load some of the LXL JS plugins with BDSX.

#### Features
We aim to be consistent with the features of LXL, even with the bugs it has. However, there are some features that we could not implement at the time.

- Supported APIs:
    - Scripting
        - [x] [💼 Helpers](https://lxl.litebds.com/#/zh_CN/Development/ScriptAPI/ScriptHelp)
        - [x] [📅 Logger](https://lxl.litebds.com/#/zh_CN/Development/ScriptAPI/Logger)
        - [x] [💡 LXL](https://lxl.litebds.com/#/zh_CN/Development/ScriptAPI/Lxl)
        - [ ] [💡 I18n](https://lxl.litebds.com/#/zh_CN/Development/ScriptAPI/i18n)
    - Game
        - [x] [🎨 Basic](https://lxl.litebds.com/#/zh_CN/Development/GameAPI/Basic)
        - [x] [🎯 Command](https://lxl.litebds.com/#/zh_CN/Development/GameAPI/Command)
        - [x] [🏃‍♂️ Player](https://lxl.litebds.com/#/zh_CN/Development/GameAPI/Player)
        - [x] [📦 Block](https://lxl.litebds.com/#/zh_CN/Development/GameAPI/Block)
        - [x] [🎈 Entity](https://lxl.litebds.com/#/zh_CN/Development/GameAPI/Entity)
        - [x] [🧰 Item](https://lxl.litebds.com/#/zh_CN/Development/GameAPI/Item)
        - [x] [📮 Block Entity](https://lxl.litebds.com/#/zh_CN/Development/GameAPI/BlockEntity)
        - [x] [👜 Container](https://lxl.litebds.com/#/zh_CN/Development/GameAPI/Container)
        - [x] [📝 Scoreboard](https://lxl.litebds.com/#/zh_CN/Development/GameAPI/ScoreBoard)
        - [x] [📱 Device Info](https://lxl.litebds.com/#/zh_CN/Development/GameAPI/Device)
        - [x] [💻 Server](https://lxl.litebds.com/#/zh_CN/Development/GameAPI/Server)
        - [x] [🎮 Game Utils](https://lxl.litebds.com/#/zh_CN/Development/GameAPI/GameUtils)
    - Events
        - [x] [🏃‍♂️ Player](https://lxl.litebds.com/#/zh_CN/Development/EventAPI/PlayerEvents)
        - [x] [🎈 Entity](https://lxl.litebds.com/#/zh_CN/Development/EventAPI/EntityEvents)
        - [x] [📦 Block](https://lxl.litebds.com/#/zh_CN/Development/EventAPI/BlockEvents)
        - [x] [💰 Economy](https://lxl.litebds.com/#/zh_CN/Development/EventAPI/EconomicEvents)
        - [x] [🔊 Misc](https://lxl.litebds.com/#/zh_CN/Development/EventAPI/OtherEvents)
    - NBT
        - [x] [🥽 Common](https://lxl.litebds.com/#/zh_CN/Development/NbtAPI/NBT)
        - [x] [📋 Primitives](https://lxl.litebds.com/#/zh_CN/Development/NbtAPI/NBTValue)
        - [x] [📚 List](https://lxl.litebds.com/#/zh_CN/Development/NbtAPI/NBTList)
        - [ ] [📒 Compound](https://lxl.litebds.com/#/zh_CN/Development/NbtAPI/NBTCompound)
            - `NBT.parseBinaryNBT` and
            - `NbtCompound.prototype.toBinaryNBT` will not be implemented
    - GUI
        - [x] [📊 Forms](https://lxl.litebds.com/#/zh_CN/Development/GuiAPI/Form)
        - [x] [📰 Form Builder](https://lxl.litebds.com/#/zh_CN/Development/GuiAPI/FormBuilder)
    - Data
        - [x] [🔨 Config](https://lxl.litebds.com/#/zh_CN/Development/DataAPI/ConfigFile)
        - [x] [📦 Database](https://lxl.litebds.com/#/zh_CN/Development/DataAPI/DataBase)
        - [x] [💰 Economy](https://lxl.litebds.com/#/zh_CN/Development/DataAPI/Economy)
        - [x] [🏃‍♂️ Player Data](https://lxl.litebds.com/#/zh_CN/Development/DataAPI/PlayerData)
        - [x] [🧰 Misc](https://lxl.litebds.com/#/zh_CN/Development/DataAPI/OtherData)
    - System
        - [x] [📝 File](https://lxl.litebds.com/#/zh_CN/Development/SystemAPI/File)
        - [x] [📂 File System](https://lxl.litebds.com/#/zh_CN/Development/SystemAPI/FileSystem)
        - [x] [🌏 Network](https://lxl.litebds.com/#/zh_CN/Development/SystemAPI/Network)
        - [x] [📡 Shell](https://lxl.litebds.com/#/zh_CN/Development/SystemAPI/SystemCall)
            - `system.cmd` and `system.newProcess` perform differently here
            - They use PowerShell to execute commands to avoid issues from forwardslashes
            - They also capture echo messages which LXL does not
        - [x] [📜 Info](https://lxl.litebds.com/#/zh_CN/Development/SystemAPI/SystemInfo)
                  
- In-game commands:
    - [x] LXL Hot Manage: `/lxl`
    - [x] Debug: `/jsdebug`
    - [ ] Economy: `/money`

- Remarks:
    - BDSX only supports `ES2017`, all codes loaded will be transpiled through `TSC` to support `ESNext` syntaxes and a polyfill script from `core-js` is appended. However, `BigInt` and `RegExp Lookbehind` will not be supported.
    - Scripts that pass through `TSC` may throw errors with different position rather than the position of the original code.
    - Logging to file is not yet implemented and some colors and formats are not same as LXL's.
    - This plugin does not load any plugins written in Lua, the closet approach we tried was using `glua`, but it does not support `GOTO` syntax yet.
    - There is no auto-update system currently, but you can run `npm i` to update it if this project got onto it.

- Tested Plugins:
    - [x] [BDSLM - 基岩版卫星地图](https://www.minebbs.com/resources/bdslm.3484/)
    - [x] [Boss条血量显示-更直观的看到伤害和血量](https://www.minebbs.com/resources/boss.2958/)
    - [x] [ChainGather - 连锁采集](https://www.minebbs.com/resources/chaingather.3413/)
    - [x] [downcastCreeper - 苦力怕痿了](https://www.minebbs.com/resources/downcastcreeper.3163/)
    - [x] [EditSign - 告示牌文字编辑](https://www.minebbs.com/resources/editsign.2919/)
    - [x] [Gtrans！！超级强大的聊天实时翻译软件](https://www.minebbs.com/resources/gtrans.2929/)
    - [x] [JoinTips - 进服提示](https://www.minebbs.com/resources/jointips.2985/)
    - [x] [LockYourChest--密码箱【新增版本自检】](https://www.minebbs.com/resources/lxlcheckbag.2908/)
    - [x] [LxlCheckBag - 游戏内查包插件](https://www.minebbs.com/resources/lockyourchest.2989/)
    - [x] [NbtDbg - 游戏内输出NBT调试信息的小玩意儿](https://www.minebbs.com/resources/nbtdbg-nbt.2754/)
    - [x] [Origin-多功能拓展插件](https://www.minebbs.com/resources/origin.3315/)
    - [x] [ServerStopper - 游戏内停服插件](https://www.minebbs.com/resources/serverstopper.2729/)
    - [x] [Wooden_axe-创世神简易版](https://www.minebbs.com/resources/wooden_axe.2720/)
    - [x] [WSClient-Syn —— 可跨主机的背包同步+玩家消息同步+进服欢迎（没卵用）](https://www.minebbs.com/resources/wsclient-syn.3334/)
    - [x] [多功能命令木牌-可以多行命令](https://www.minebbs.com/resources/2944/)
    - [x] [服务器状态查询](https://www.minebbs.com/resources/3509/)
    - [x] [锁箱子-全UI界面,高性能数据库,多类型](https://www.minebbs.com/resources/ui.2935/)
    - [x] [一个领地系统](https://www.minebbs.com/resources/2937/)
    - [ ] [gui商店、领地、经济、箱子商店、菜单、传送六合一](https://www.minebbs.com/resources/gui-_-_-_-_-_.2881/)
        - Too expensive to afford
    - [ ] [iLand - 多经济|全GUI操作|多国语言|50余种权限控制|圈地粒子|大量API导出](https://www.minebbs.com/resources/iland-gui-50-api.2162/)
        - Written in Lua
    - [ ] [Moisture -- 更精致的口渴值？](https://www.minebbs.com/resources/moisture.2734/)
        - Written in Lua

#### Usage
1. Download `bdsx-lxl.zip` from the [latest release](https://github.com/Rjlintkh/bdsx-lxl/releases/latest) and extract it to `your_bdsx_folder/plugins` so that there is a folder named `your_bdsx_folder/plugins/bdsx-lxl`.
2. Create a folder `your_bdsx_folder/bedrock_server/plugins` and put all the LXL `.js` plugins inside.
OR
Copy all content or create a junction from `your_lxl_folder/plugins` to `your_bdsx_folder/bedrock_server/plugins` if you have previously worked on LXL.
1. Start the server from `your_bdsx_folder/bdsx.bat`.

#### Disclaimers
- In order to use this project, you must follow the terms of EULA and LXL.
- This project is not affiliated to LXL, but it imitates the functionalities of LXL. No code is directly copied, but the logic of codes are kept for the purpose of loading plugins.
- We do not offer guarantee of successfully loading any LXL plugins.
- The project is experimental, it may contain bugs, bugs found in loading the plugins using this loader should not be reported to their according developers.
- We will not hold any responsibiliy for any corruptions of server. Use it at your own risk.

#### Links
[LiteXLoader](https://github.com/LiteLDev/LiteXLoader)
[MineBBS](https://www.minebbs.com/resources/?prefix_id=67)