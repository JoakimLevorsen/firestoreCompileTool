// This is an object to reference functions that exist outside kakao, like the .size on strings.

import SyntaxComponent from "../types/SyntaxComponent";
import { ValueType } from "../types";
import Literal from "../types/literals";
import { DatabaseLocation } from "./Compiler";

export interface Parameter {
    name: string;
    type: ValueType;
}

export class OutsideFunctionDeclaration extends SyntaxComponent {
    private _callee?: Literal | DatabaseLocation;
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

    public withCallee(
        callee: Literal | DatabaseLocation
    ): OutsideFunctionDeclaration {
        // We do some complicated code to clone this object, since we must preserve the prototype
        // https://stackoverflow.com/questions/41474986/how-to-clone-a-javascript-es6-class-instance
        const that = Object.assign(
            Object.create(Object.getPrototypeOf(this)),
            this
        );
        that._callee = callee;
        return that;
    }
}
