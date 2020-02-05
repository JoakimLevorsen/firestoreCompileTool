import Literal from "./Literal";
import { ValueType } from "../Token";
import SyntaxComponent, { Position } from "../SyntaxComponent";

type ValueArray = (ValueType | InterfaceLiteral)[];
export type InterfaceLiteralValues = Map<string, ValueArray>;

export default class InterfaceLiteral extends Literal {
    protected _value: InterfaceLiteralValues;

    constructor(position: Position, values: InterfaceLiteralValues) {
        super(position, values);
        this._value = values;
    }

    get value(): Map<string, ValueArray> {
        return this._value;
    }

    protected internalEquals(other: SyntaxComponent): boolean {
        if (!(other instanceof InterfaceLiteral)) return false;
        return (
            this.allValuesPresentIn(other) &&
            other.allValuesPresentIn(this)
        );
    }

    public allValuesPresentIn(other: InterfaceLiteral): boolean {
        const otherValues = other.value;
        for (const [key, value] of this._value) {
            if (!otherValues.has(key)) return false;
            const otherValue = otherValues.get(key)!;
            if (
                !value.every(dV => {
                    if (dV instanceof InterfaceLiteral) {
                        return otherValue.some(
                            oV =>
                                oV instanceof InterfaceLiteral &&
                                dV.allValuesPresentIn(oV)
                        );
                    } else {
                        return otherValue.some(oV => oV === dV);
                    }
                })
            ) {
                return false;
            }
        }
        return true;
    }
}
