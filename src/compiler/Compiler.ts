import { Scope } from ".";
import { ValueType } from "../types";
import { InterfaceLiteral, TypeLiteral } from "../types/literals";
import SyntaxComponent from "../types/SyntaxComponent";

export interface DatabaseLocation {
    key: string;
    castAs?: InterfaceLiteral | TypeLiteral;
    // The cast might be optional
    optionalCast?: boolean;
    // We may have some shortcut children
    children?: { [index: string]: DatabaseLocation };
    // Do we need to do .data before accessing data?
    needsDotData?: boolean;
}

export const isDatabaseLocation = (
    input: any
): input is DatabaseLocation => {
    if (typeof input !== "object") return false;
    if (
        Object.keys(input).some(
            k =>
                k !== "key" &&
                k !== "castAs" &&
                k !== "children" &&
                k !== "needsDotData" &&
                k !== "optionalCast"
        )
    )
        return false;
    if (typeof input.key !== "string") return false;
    if (input.castAs && !(input.castAs instanceof InterfaceLiteral))
        return false;
    if (input.needsDotData && typeof input.needsDotData !== "boolean")
        return false;
    if (!input.children) return true;
    return (
        Object.keys(input).every(k => typeof k === "string") &&
        Object.values(input).every(v => isDatabaseLocation(v))
    );
};

export type CompilerValueType = ValueType | "ANY";

export type Compiler<C extends SyntaxComponent> = (
    item: C,
    scope: Scope
) => { value?: string; scope: Scope };
