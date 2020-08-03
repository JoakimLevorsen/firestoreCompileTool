import { OutsideFunctionDeclaration } from "../OutsideFunctionDeclaration";

export const string = {
    lower: new OutsideFunctionDeclaration("lower", "string"),
    replace: new OutsideFunctionDeclaration("replace", "string", [
        { name: "Regex", type: "string" },
        { name: "Substitute", type: "string" }
    ]),
    matches: new OutsideFunctionDeclaration("matches", "boolean", [
        { name: "Regex", type: "string" }
    ])
};
