import { CustomForm, FormButton, FormDropdown, FormInput, FormLabel, FormSlider, FormStepSlider, FormToggle, SimpleForm } from "bdsx/bds/form";
import { PrivateFields } from "./api_help";

export class LLSE_SimpleForm {
    [PrivateFields]: SimpleForm;

    setTitle(title: string) {
        this[PrivateFields].setTitle(title);
        return this;
    }

    setContent(content: string) {
        this[PrivateFields].setContent(content);
        return this;
    }

    addButton(text: string, image?: string) {
        if (image) {
            this[PrivateFields].addButton(new FormButton(text, image.startsWith("textures/") ? "path" : "url", image));
        } else {
            this[PrivateFields].addButton(new FormButton(text));
        }
        return this;
    }
}

export function newSimpleForm() {
    const newp = new LLSE_SimpleForm();
    newp[PrivateFields] = new SimpleForm();
    return newp;
}

export class LLSE_CustomForm {
    [PrivateFields]: CustomForm;

    setTitle(title: string) {
        this[PrivateFields].setTitle(title);
        return this;
    }

    addLabel(text: string) {
        this[PrivateFields].addComponent(new FormLabel(text));
        return this;
    }

    addInput(title: string, placeholder?: string, defaultValue?: string) {
        this[PrivateFields].addComponent(new FormInput(title, placeholder, defaultValue));
        return this;
    }

    addSwitch(title: string, defaultValue?: boolean) {
        this[PrivateFields].addComponent(new FormToggle(title, defaultValue));
        return this;
    }

    addDropdown(title: string, items: string[], defaultValue?: number) {
        this[PrivateFields].addComponent(new FormDropdown(title, items, defaultValue));
        return this;
    }

    addSlider(title: string, min: number, max: number, step?: number, defaultValue?: number) {
        this[PrivateFields].addComponent(new FormSlider(title, min, max, step, defaultValue));
        return this;
    }

    addStepSlider(title: string, items: string[], defaultValue?: number) {
        this[PrivateFields].addComponent(new FormStepSlider(title, items, defaultValue));
        return this;
    }
}

export function newCustomForm() {
    const newp = new LLSE_CustomForm();
    newp[PrivateFields] = new CustomForm();
    return newp;
}