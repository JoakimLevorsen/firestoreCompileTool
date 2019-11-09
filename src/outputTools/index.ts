import { Block } from "../nonRegexParser";
import { Expression } from "../nonRegexParser/ExpressionParser";
import { IfBlock } from "../nonRegexParser/IfParser";

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

const ruleToString = (
    item: Expression | IfBlock,
    ruleType: string
): string => {
    const header = `allow ${ruleType}: if `;
    const content = expressionOrIfToString(item);
    const footer = `;`;
    return header + content + footer;
};

const expressionOrIfToString = (item: Expression | IfBlock) => {
    if (typeof item === "object" && !(item instanceof Array))
        return ifBlockToString(item);
    return expressionToString(item);
};

const expressionToString = (expression: Expression): string => {
    if (typeof expression === "boolean")
        return `${expression === true}`;
    // We check index 1 for the operator
    if (expression[1] === "is") {
        const [target, _, compareTo] = expression;
        const targetData = target + ".data";
        const interfaceKeys = Object.keys(compareTo);
        return interfaceKeys
            .map(iKey => {
                const interfaceContent = compareTo[iKey];
                if (interfaceContent instanceof Array) {
                    return (
                        interfaceContent.reduce(
                            (pV, v) =>
                                pV === ""
                                    ? `(${targetData}.${iKey} is ${v}`
                                    : `${pV} || ${targetData}.${iKey} is ${v}`,
                            ""
                        ) + ")"
                    );
                } else {
                    return ` ${targetData}.${iKey} is ${interfaceContent} `;
                }
            })
            .reduce((pV, v) => `${pV} && ${v}`);
    }
    return `${expression[0]} `;
};

const ifBlockToString = (ifBlock: IfBlock): string => {
    // a == b ? c : d <=> (a == b && c) || d
    const stringCondition = expressionToString(ifBlock.condition);
    const b = expressionOrIfToString(ifBlock.ifTrue);
    if (ifBlock.ifFalse) {
        const c = expressionOrIfToString(ifBlock.ifFalse);
        return `((${stringCondition} && ${b}) || ${c})`;
    }
    return `(${stringCondition} && ${b})`;
};

// const ruleToString = (logic: Logic, key: string) => {
//     const header = `allow ${key}: if `;
//     const footer = ";";
//     return `${header} ${logicToString(logic)} ${footer}`;
// };

// const logicToString = (logic: Logic): string => {
//     if (typeof logic === "boolean") return `${logic}`;
//     // We add a tail if this if has following code.
//     const tail: string = logic.false ? `||${logicToString(logic.false)}` : "";
//     return `(${ifToString(logic.check)}&&${logicToString(logic.true)})${tail}`;
// };

// const ifToString = (check: ifCondition) => {
//     if (check[1] === "==") {
//         return `${check[0]} == ${check[2]}`;
//     } else {
//         // Check if we're checking a type or interface
//         if (typeof check[2] === "string") {
//             return `${check[0]} is ${check[2]}`;
//         } else {
//             const selectedInterface = check[2];
//             // We now add checks for all interface keys
//             const rules = Object.keys(selectedInterface).map(key => {
//                 const rule = selectedInterface[key];
//                 if (rule instanceof Array) {
//                     return (
//                         "(" +
//                         rule
//                             .map(r => `${key} is ${r}`)
//                             .reduce((pV, p) => `${pV} || (${p})`) +
//                         ")"
//                     );
//                 } else {
//                     return `${key} is ${rule}`;
//                 }
//             });
//             // Now we just combine all the rules.
//             return rules.reduce((pV, p) => `${pV} && ${p}`);
//         }
//     }
// };

export default blockToRules;
