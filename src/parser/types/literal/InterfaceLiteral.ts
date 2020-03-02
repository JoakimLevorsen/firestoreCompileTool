import Identifier from "../Identifier";
import SyntaxComponent, { Position } from "../SyntaxComponent";
import Literal from "./";

export type InterfaceLiteralValues = Map<
    string,
    Array<Literal | Identifier>
>;

export const isInterfaceLiteralValues = (
    input: any
): input is InterfaceLiteralValues => {
    if (!(input instanceof Map)) return false;
    for (const [key, value] of input) {
        if (typeof key !== "string") return false;
        if (!(value instanceof Array)) return false;
        if (
            !value.every(
                v => v instanceof Literal || v instanceof Identifier
            )
        )
            return false;
    }
    return true;
};

export class InterfaceLiteral extends Literal {
    protected _value: InterfaceLiteralValues;
    protected _optionalValues: InterfaceLiteralValues;

    constructor(
        position: Position,
        values:
            | InterfaceLiteralValues
            | { [index: string]: Array<Literal | Identifier> },
        optionals?: InterfaceLiteralValues
    ) {
        let v: InterfaceLiteralValues;
        if (values instanceof Map) {
            v = values;
        } else {
            v = new Map();
            Object.keys(values).forEach(key =>
                v.set(key, values[key])
            );
        }
        super(position, v);
        this._value = v;
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
