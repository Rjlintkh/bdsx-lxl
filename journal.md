## 8/8/2021
The NBT branch was almost finished? Only destructors left and I published an SNBT plugin

Since NBT editing is now possible, I got an idea to implement a JSR in BDSX.

And I worked till 2 am today again.

## 13/8/2021
Only the events left to implement for the BDSX JSR. But I found that there are no many JSR plugins on MineBBS anymore.

## 14/8/2021
I was told that no one uses JSR anymore and they all switched to LXL. I was quite impressed by the amount of APIs LXL has. However it is really difficult to port them all to BDSX.

## 18/9/2021
Someone found the little JSR porting project from a screenshot I posted on 28/8/2021. Told him it was abandoned

## 24/12/2021
With the latest NBT branch, I needed to update SNBT again.

Dang I wasted like 4 hours since 1pm and turned out with LongTags, bin.toString does not turn the bin 0 to "0".

I needed to go shopping for X-mas gifts at 4 originally and it totally ruined my plan.

But at least, the SNBT is now 100% consistent with the original NBT, the tool is perfect.

## 27/12/2021
It's a boring holiday so I decided to start porting LXL to BDSX and see when I can finish it.

I have skipped dinner but done base APIs and the next is player APIs.

I need to cycle with friends the other day so I need to wake at 7, better sleep early.

## 29/12/2021
Player APIs are 1/3 done maybe, it involves a lot of other APIs and I need to implement them as well to implement Player APIs.

In the middle of Player APIs, I needed to implement Item APIS, which I need to implement NBT APIs. Luckily I updated SNBT a few days ago so it was not a problem.

I found quite a lot of typoes (mainly the error messages and some grammar) and minor errors LXL devs made actually, but whatever.

Well, exam is coming, I guess I need to stop for some time.

## 12/1/2022
Now I feel regret that I wasted my whole holiday period for that LXL thingy, I have 8 whole chapters of Biology to recite...

I started reciting it from 4 and now I finished reciting all the CE and DSE past paper marking schemes for those chapters, I am a genius. (Remarks: I got #4 in form so it wasn't really good)

## 14/1/2022
I just finished all my exams and now I can work on it again.

## 18/1/2022
Player APIs are done, so I guess the project is half-done, maybe I can get everything done before April?

## 25/1/2022
LLMoney and PlayerDB need to use sqlite3, which I have no experience with, but I guess I will try

The sqlite3 on NodeJS cannot be used directly on BDSX cuz of this stupid chakra-core and I need those functions to run in sync.

After a lot of tries, sqlite-sync, which wraps sql.js is the best one so far.

Weird bugs appeared like even when I deleted the db of LLMoney, the data still persists.

I found that was because sqlite-sync cannot open two db at once, all data is saved to PlayerDB and that's why. I reused the constructor to make two instances of it and solved the issue.

Except events, KVDatabase, Compound tag to binary, Websockets, everything is done maybe, but I won't implement those. Except events, cuz they are quite important. There are 52 events atm so I may need a long time...

## 26/1/2022
I totally forgot about the entity and mc APIS, but they are easy to implement maybe.

## 28/1/2022
Wow it's fast, I didn't expect this cuz now only the npc command event hasn't been added as idk how, now I just need to test it for some days

## 31/1/2022
I found some deprecated events like the explosion ones but I am too lazy to implement them.

## 1/2/2022
I just asked in the LXL discord server whether I can release this project, cuz I am super scared of copyright issues and something like that.

Meanwhile I am writing the readme and testing it on plugins I can find on MineBBS.

I started to implement the hot managing commands and struggled with reloading, I have no idea why the events do not unregister but the commands do. I mean, the logic is completely correct to me, but the silly thing does not follow it.

I wasted so much time from 9pm to 2am, I decided to suicide and try using a session ID check tmr.

## 2/2/2022
Yea the session ID check is great.

And I fixed various bugs when trying different plugins. Like some functions now correctly return, blah blah blah.

However, I can't fix the event for sign placing as bdsx does not support int32_t as the key of a CxxMap.

The biggest fix was about system.cmd and system.newProcess, LXL's one supports / but NodeJS uses cmd.exe which does not. I struggled till dinner and found that using PowerShell can fix that.

I didn't know that TSC does not polyfill for something like String.prototype.replaceAll so I have to download a polyfill bundle myself...

I found some popular plugins are using Lua, like the iLand one (I thought no one would use Lua actually), was trying to implement it using lua-in-js but can't execute the Lua code.

Then I tried glua but it does not support const and GOTO syntaxes so I have to give up eventually.

## 3/2/2022
The LXL devs have still did not reply me, maybe I don't care now.

I actually wrote this diary somewhere in BDSX discord server, but I guess no one discovered that lol, I am going to remove it and put that in this MarkDown file.

## 6/2/2022
I originally planned to finish some homework this afternoon, but idk why I suddenly wanted to implement KVDatabase.

I used 5 hours damn, LXL's KVDatabase methods are all sync, and there are none NodeJS libraries for that.

Which means I have to make my own, my way is to use child process to operate the DB in command line, that way it can be sync.

However there are only two cli I can find, and only one of them is usable.

But then when it came to saving a JSON, it saved as string, I tried to look into its source code and found some flags which were not in the documentation.

Again, it wasn't easy, I strived and strived to put a value using the base64 flag, but the flag did not apply at all.

Eventually I learnt something new, I guess, you need to put the flags before the arguments, damn, that's it.

After dinner I also implemented WSClient, but I am not sure if it will work.