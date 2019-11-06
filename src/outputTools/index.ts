import { Block } from "../extractionTools";
import { Logic, IfClause, ifCondition } from "../extractionTools/matchGroup";

const header = `rules_version = '2';
service cloud.firestore {
match /databases/{database}/documents {
`;

const footer = `}}`;

const blockToRules = (input: Block): string => {
    const rules = input.matchGroups.map(({ rules, path }) => {
        let output = "";
        if (rules.create) {
            output += ruleToString(rules.create, "create");
        }
        if (rules.delete) {
            output += ruleToString(rules.delete, "delete");
        }
        if (rules.read) {
            output += ruleToString(rules.read, "read");
        }
        if (rules.update) {
            output += ruleToString(rules.update, "update");
        }
        if (rules.write) {
            output += ruleToString(rules.write, "write");
        }
        const matchPath = path.reduce((pV, v) => `${pV}/${v}`, "");
        return `match ${matchPath} {${output}}`;
    });
    return `${header}${rules}${footer}`;
};

const ruleToString = (logic: Logic, key: string) => {
    const header = `allow ${key}: if `;
    const footer = ";";
    return `${header} ${logicToString(logic)} ${footer}`;
};

const logicToString = (logic: Logic): string => {
    if (typeof logic === "boolean") return `${logic}`;
    // We add a tail if this if has following code.
    const tail: string = logic.false ? `||${logicToString(logic.false)}` : "";
    return `(${ifToString(logic.check)}&&${logicToString(logic.true)})${tail}`;
};

const ifToString = (check: ifCondition) => {
    if (check[1] === "==") {
        return `${check[0]} == ${check[2]}`;
    } else {
        // Check if we're checking a type or interface
        if (typeof check[2] === "string") {
            return `${check[0]} is ${check[2]}`;
        } else {
            const selectedInterface = check[2];
            // We now add checks for all interface keys
            const rules = Object.keys(selectedInterface).map(key => {
                const rule = selectedInterface[key];
                if (rule instanceof Array) {
                    return (
                        "(" +
                        rule
                            .map(r => `${key} is ${r}`)
                            .reduce((pV, p) => `${pV} || (${p})`) +
                        ")"
                    );
                } else {
                    return `${key} is ${rule}`;
                }
            });
            // Now we just combine all the rules.
            return rules.reduce((pV, p) => `${pV} && ${p}`);
        }
    }
};

export default blockToRules;
