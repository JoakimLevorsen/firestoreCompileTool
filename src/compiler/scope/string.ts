import { OutsideFunctionDeclaration } from "../OutsideFunctionDeclaration";

export const string = {
    lower: new OutsideFunctionDeclaration("lower", "string"),
    matches: new OutsideFunctionDeclaration("matches", "boolean", [
        { name: "Regex", type: "string" }
    ]),
    replace: new OutsideFunctionDeclaration("replace", "string", [
        { name: "Regex", type: "string" },
        { name: "Substitute", type: "string" }
    ]),
    size: new OutsideFunctionDeclaration("size", "number"),
    split: new OutsideFunctionDeclaration("split", "Array", [
        { name: "Regex", type: "string" }
    ]),
    trim: new OutsideFunctionDeclaration("trim", "string"),
    upper: new OutsideFunctionDeclaration("upper", "string")
};
