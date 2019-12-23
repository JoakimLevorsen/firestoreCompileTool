import { RawValue, KeywordValue } from "..";
import { Constant } from "./Constant";

export default class ConstantCollection {
    private values: { [id: string]: RawValue | KeywordValue };

    constructor(values?: { [id: string]: RawValue | KeywordValue }) {
        this.values = values || {};
    }

    public add(con: Constant) {
        if (this.values[con.name]) {
            throw new Error(`Object with ${con.name} already exists`);
        }
        this.values[con.name] = con.value;
    }

    public get = (key: string) => this.values[key];

    // Combine and override with other
    public combine = (other: ConstantCollection) =>
        new ConstantCollection({ ...this.values, ...other.values });
}
