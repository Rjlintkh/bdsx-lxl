import { Container as _Container } from "bdsx/bds/inventory";
import { LIAPI, MCAPI } from "../dep/native";
import { logger, PrivateFields } from "./api_help";
import { Item$newItem, LXL_Item } from "./item";

export class LXL_Container {
    private [PrivateFields]: _Container;

    getRawPtr() {
        return parseInt(this[PrivateFields].toString());
    }

    get size() {
        return LIAPI.Container.getSize(this[PrivateFields]);
    }

    get type() {
        return LIAPI.Container.getTypeName(this[PrivateFields]);
    }

    addItem(item: LXL_Item) {
        if (!item[PrivateFields]) {
            logger.error("Wrong type of argument in addItem!");
            return null;
        }
        return LIAPI.Container.addItemSafe(this[PrivateFields], item[PrivateFields]);
    }

    addItemToFirstEmptySlot(item: LXL_Item) {
        if (!item[PrivateFields]) {
            logger.error("Wrong type of argument in addItemToFirstEmptySlot!");
            return null;
        }
        return LIAPI.Container.addItemToFirstEmptySlotSafe(this[PrivateFields], item[PrivateFields]);
    }

    hasRoomFor(item: LXL_Item) {
        if (!item[PrivateFields]) {
            logger.error("Wrong type of argument in hasRoomFor!");
            return null;
        }
        return MCAPI.Container.hasRoomForItem(this[PrivateFields], item[PrivateFields]);
    }

    removeItem(index: number, count: number) {
        return MCAPI.Container.removeItem(this[PrivateFields], index, count);
    }

    getItem(index: number) {
        const item = MCAPI.Container.getItem(this[PrivateFields], index);
        if (!item) {
			logger.error("Fail to get slot from container!");
            return null;
        }
        return Item$newItem(item);
    }

    setItem(index: number, item: LXL_Item) {
        if (!item[PrivateFields]) {
            logger.error("Wrong type of argument in setItem!");
            return null;
        }

        const itemOld = MCAPI.Container.getItem(this[PrivateFields], index);
        if (!itemOld) {
            return false;
        }
        return LIAPI.ItemStack.setItem(itemOld, item[PrivateFields]);
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
        MCAPI.Container.removeAllItems(this[PrivateFields]);
        return true;
    }

    isEmpty() {
        return MCAPI.Container.isEmpty(this[PrivateFields]);
    }

    /** @deprecated */
    getSlot = this.getItem;

    /** @deprecated */
    getAllSlots = this.getAllItems;
}

export function Container$newContainer(p: _Container): LXL_Container {
    const newp = new LXL_Container();
    newp[PrivateFields] = p;
    return newp;
}