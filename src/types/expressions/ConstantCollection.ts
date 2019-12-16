import { RawValue } from "..";
import { Constant } from "./Constant";

export default class ConstantCollection {
    private values: { [id: string]: RawValue } = {};

    public add(con: Constant) {
        if (this.values[con.name]) {
            throw new Error(`Object with ${con.name} already exists`);
        }
        this.values[con.name] = con.value;
    }

    public get = (key: string) => this.values[key];
}
