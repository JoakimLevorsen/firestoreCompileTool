import Literal from "./Literal";

export default class StringLiteral extends Literal {
    protected _value: string;

    constructor(start: number, value: string) {
        // We add one since theres the ' or " at the start or end, and .length already adds one too many
        super({ start, end: start + value.length + 1 }, value);
        this._value = value;
    }

    public get value() {
        return this._value;
    }
}
