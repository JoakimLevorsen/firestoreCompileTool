// This is an object to reference functions that exist outside kakao, like the .size on strings.

import SyntaxComponent from "../types/SyntaxComponent";
import { ValueType } from "../types";
import Literal from "../types/literals";

export interface Parameter {
    name: string;
    type: ValueType;
}

export class OutsideFunctionDeclaration extends SyntaxComponent {
    private _callee?: Literal;
    constructor(
        private _name: string,
        private _returnType: ValueType,
        private _parameters: Parameter[] = []
    ) {
        super({ start: NaN, end: NaN });
    }

    public get name() {
        return this._name;
    }

    public get parameters() {
        return this._parameters;
    }

    public get returnType() {
        return this._returnType;
    }

    public get callee() {
        return this._callee;
    }

    public internalEquals(other: SyntaxComponent): boolean {
        if (!(other instanceof OutsideFunctionDeclaration))
            return false;
        return (
            this.name === other.name &&
            this.returnType === other.returnType &&
            this.parameters.every(
                (p, i) =>
                    other.parameters?.[i].name === p.name &&
                    other.parameters?.[i].type === p.type
            )
        );
    }

    public withCallee(callee: Literal): OutsideFunctionDeclaration {
        this._callee = callee;
        return this;
    }
}
