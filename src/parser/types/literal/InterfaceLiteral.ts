import Identifier from "../Identifier";
import SyntaxComponent, { Position } from "../SyntaxComponent";
import Literal from "./";

export type InterfaceLiteralValues = Map<
    string,
    Array<Literal | Identifier>
>;

export class InterfaceLiteral extends Literal {
    protected _value: InterfaceLiteralValues;
    protected _optionalValues: InterfaceLiteralValues;

    constructor(
        position: Position,
        values: InterfaceLiteralValues,
        optionals?: InterfaceLiteralValues
    ) {
        super(position, values);
        this._value = values;
        this._optionalValues = optionals || new Map();
    }

    get value(): InterfaceLiteralValues {
        return this._value;
    }

    get optionals(): InterfaceLiteralValues {
        return this._optionalValues;
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
                        return otherValue.some(oV => oV.equals(dV));
                    }
                })
            ) {
                return false;
            }
        }
        return true;
    }

    public equalsWithOptionals(other: any): boolean {
        if (!(other instanceof InterfaceLiteral)) return false;
        if (!other.equals(this)) return false;
        const otherValues = other._optionalValues;
        for (const [key, value] of this._optionalValues) {
            if (!otherValues.has(key)) return false;
            const otherValue = other._optionalValues.get(key)!;
            if (
                !value.every(dV => {
                    if (dV instanceof InterfaceLiteral) {
                        return otherValue.some(
                            oV =>
                                oV instanceof InterfaceLiteral &&
                                dV.allValuesPresentIn(oV)
                        );
                    } else {
                        return otherValue.some(oV => oV.equals(dV));
                    }
                })
            )
                return false;
        }
        return true;
    }

    protected internalEquals(other: SyntaxComponent): boolean {
        if (!(other instanceof InterfaceLiteral)) return false;
        return (
            this.allValuesPresentIn(other) &&
            other.allValuesPresentIn(this)
        );
    }
}
