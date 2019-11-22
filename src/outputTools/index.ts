import { Block, Expression, IfBlock, isIfBlock } from "../types";

const header = `rules_version = '2';
service cloud.firestore {
match /databases/{database}/documents {
`;

const footer = `\t\n}\n}`;

const stringifyBlock = (input: Block): string =>
    formatFile(blockToRules(input));

const formatFile = (input: string): string => {
    // Split lines, remove unneeded spacing, and tailing spacing
    const lines = input
        .split("\n")
        .map(s => s.replace(/\s+/g, " ").replace(/\s+$/, ""));
    let output = "";
    let tabIndentation = "";
    // Replace with better formatter that can take account of {} on one line
    for (const line of lines) {
        let myIndentation = tabIndentation;
        if (/^.*(\{|\(|\[)$/.test(line)) {
            tabIndentation += "\t";
        }
        if (/^([^\[\n]*\}|[^\[\n]*\]|[^\(\n]*\));{0,1}$/.test(line)) {
            tabIndentation = tabIndentation.substr(1);
            myIndentation = tabIndentation;
        }
        output += myIndentation + line + "\n";
    }
    return output;
};

const blockToRules = (input: Block): string => {
    const ruleContent = input.matchGroups.map(
        ({ rules, path, pathVariables }) => {
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
            const matchPath = path.reduce((pV, v) => {
                // If the path component is mentioned wrap it
                if (pathVariables.includes(v)) {
                    return `${pV}/{${v}}`;
                }
                return `${pV}/${v}`;
            }, "");
            return `match ${matchPath} {\n${output}}`;
        }
    );
    return `${header}${ruleContent.reduce(
        (pV, p) => `${pV}\n${p}`
    )}${footer}`;
};

const ruleToString = (
    item: Expression | IfBlock,
    ruleType: string
): string => {
    return `allow ${ruleType}: if ${expressionOrIfToString(item)};\n`;
};

const expressionOrIfToString = (item: Expression | IfBlock) => {
    if (isIfBlock(item)) {
        return ifBlockToString(item);
    }
    return expressionToString(item);
};

const expressionToString = (expression: Expression): string => {
    if (typeof expression === "boolean") {
        return `${expression === true}`;
    }
    // We check index 1 for the operator
    if (expression[1] === "is") {
        const [target, _, compareTo] = expression;
        const targetData = target.toStringAsData();
        const interfaceKeys = Object.keys(compareTo);
        return interfaceKeys
            .map(iKey => {
                const interfaceContent = compareTo[iKey];
                if (interfaceContent.multiType) {
                    return (
                        interfaceContent.value.reduce(
                            (pV, v) =>
                                pV === ""
                                    ? `(\n${targetData}.${iKey} is ${v.toLowerCase()}`
                                    : `${pV} || ${targetData}.${iKey} is ${v.toLowerCase()}`,
                            ""
                        ) + "\n)"
                    );
                } else {
                    return ` ${targetData}.${iKey} is ${interfaceContent.value.toLowerCase()}`;
                }
            })
            .reduce((pV, v) => `${pV} && ${v}`);
    }
    // if (expression[1] === "only") {
    //     const [target, _, compareTo] = expression;
    //     const targetData = target.toStringAsData();
    //     const interfaceKeys = Object.keys(compareTo);
    //     return interfaceKeys.map(iKey => {
    //         const interfaceContent = compareTo[iKey];
    //         return "uhigfhsuidgf udfh  iuash"
    //     });
    // }
    if (expression[1] === "=") {
        return `${expression[0]} == ${expression[2]}`;
    }
    if (expression[1] === "≠") {
        return `${expression[0]} != ${expression[2]}`;
    }
    return `${expression[0]} `;
};

const ifBlockToString = (ifBlock: IfBlock): string => {
    // a == b ? c : d <=> (a == b && c) || d
    const stringCondition = expressionToString(ifBlock.condition);
    const b = expressionOrIfToString(ifBlock.ifTrue);
    if (ifBlock.ifFalse) {
        const c = expressionOrIfToString(ifBlock.ifFalse);
        return `(\n(${stringCondition} && ${b})\n|| (${c})\n)`;
    }
    return `(${stringCondition} && ${b})`;
};

export default stringifyBlock;
