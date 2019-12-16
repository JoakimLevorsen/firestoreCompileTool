import { RawValue } from "..";

export interface Constant {
    name: string;
    value: RawValue;
}

export const isConstant = (input: any): input is Constant => {
    if (typeof input !== "object") return false;
    if (!input.name || typeof input.name !== "string") return false;
    if (!input.value || !(input instanceof RawValue)) return false;
    return true;
};

export class ConstantBuilder {
    private name?: string;
    private value?: RawValue;

    public setName(name: string) {
        this.name = name;
        return this;
    }

    public setValue(value: RawValue) {
        this.value = value;
        return this;
    }

    public getConstant() {
        const { name, value } = this;
        if (!value || !name) {
            throw new Error("Not all constant fields filled");
        }
        return { name, value };
    }
}
