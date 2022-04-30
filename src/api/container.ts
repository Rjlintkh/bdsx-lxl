import { Container as _Container } from "bdsx/bds/inventory";
import { LlAPI } from "../dep/native";
import { logger, PrivateFields } from "./api_help";
import { Item$newItem, LLSE_Item } from "./item";

export class LLSE_Container {
    private [PrivateFields]: _Container;

    getRawPtr() {
        return parseInt(this[PrivateFields].toString());
    }

    get size() {
        return LlAPI.Container.getSize(this[PrivateFields]);
    }

    get type() {
        return LlAPI.Container.getTypeName(this[PrivateFields]);
    }

    addItem(item: LLSE_Item) {
        if (!item[PrivateFields]) {
            logger.error("Wrong type of argument in addItem!");
            return null;
        }
        return LlAPI.Container.addItemSafe(this[PrivateFields], item[PrivateFields]);
    }

    addItemToFirstEmptySlot(item: LLSE_Item) {
        if (!item[PrivateFields]) {
            logger.error("Wrong type of argument in addItemToFirstEmptySlot!");
            return null;
        }
        return LlAPI.Container.addItemToFirstEmptySlotSafe(this[PrivateFields], item[PrivateFields]);
    }

    hasRoomFor(item: LLSE_Item) {
        if (!item[PrivateFields]) {
            logger.error("Wrong type of argument in hasRoomFor!");
            return null;
        }
        return this[PrivateFields].hasRoomForItem(item[PrivateFields]);
    }

    removeItem(index: number, count: number) {
        return this[PrivateFields].removeItem(index, count);
    }

    getItem(index: number) {
        const item = this[PrivateFields].getItem(index);
        if (!item) {
			logger.error("Fail to get slot from container!");
            return null;
        }
        return Item$newItem(item);
    }

    setItem(index: number, item: LLSE_Item) {
        if (!item[PrivateFields]) {
            logger.error("Wrong type of argument in setItem!");
            return null;
        }

        const itemOld = this[PrivateFields].getItem(index);
        if (!itemOld) {
            return false;
        }
        return LlAPI.ItemStack.setItem(itemOld, item[PrivateFields]);
    }

    getAllItems() {
        const list = this[PrivateFields].getSlots();

        const res = [];
        for (const item of list) {
            res.push(Item$newItem(item));
        }
        return res;
    }

    removeAllItems() {
        this[PrivateFields].removeAllItems();
        return true;
    }

    isEmpty() {
        return this[PrivateFields].isEmpty();
    }

    /** @deprecated */
    getSlot = this.getItem;

    /** @deprecated */
    getAllSlots = this.getAllItems;
}

export function Container$newContainer(p: _Container): LLSE_Container {
    const newp = new LLSE_Container();
    newp[PrivateFields] = p;
    return newp;
}