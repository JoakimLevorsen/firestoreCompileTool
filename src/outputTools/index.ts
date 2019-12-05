import {
    Block,
    Expression,
    IfBlock,
    isIfBlock,
    MatchGroup
} from "../types";

const header = `rules_version = '2';
service cloud.firestore {
match /databases/{database}/documents {
`;

const footer = `\t\n}\n}`;

const stringifyBlock = (input: Block): string =>
    formatFile(blockToRules(input));

const formatFile = (input: string): string => {
    // First we replace all spacing with one space
    const oneLiner = input.replace(/\s+/g, " ");
    // Then we split based on {} () [] and ;
    const split = oneLiner
        .replace(/([\[\{\(;])\s/g, "$1\n")
        .replace(/\s([\]\}\)])/g, "\n$1")
        // The Match keyword is always moved to its own line.
        .replace(/^\s*([\}\)\]])\s*match(.*)$/gm, "$1\nmatch$2")
        // We also split if two of the same type appear in a row with a space in front
        // so someting )) other is caught, but not
        // something().other
        .replace(/(\s)([\[\]\{\}\(\)])([\[\]\{\}\(\)])/g, "$1$2\n$3")
        .replace(/(\|\||&&)/g, "\n$1")
        .split("\n");

    let output = "";
    let indentation = 0;
    // Replace with better formatter that can take account of {} on one line
    /* Every single ({[ moves the tab one in, and every singe ]})
     moves it out for the next line, since that should balance it out. */
    for (const line of split) {
        const myIndentation = indentation;
        indentation +=
            countMatches(line, ["{", "[", "("]) -
            countMatches(line, [")", "]", "}"]);
        if (indentation < myIndentation) {
            output += tabsForCount(indentation) + line + "\n";
        } else {
            output += tabsForCount(myIndentation) + line + "\n";
        }
    }
    return output;
};

const countMatches = (input: string, match: string[]): number => {
    let matches = 0;
    for (const char of input) {
        if (match.some(m => m === char)) {
            matches++;
        }
    }
    return matches;
};

const tabsForCount = (count: number): string => {
    if (count < 0) {
        return "";
    }
    let output = "";
    for (let i = count; i > 0; i--) {
        output += "\t";
    }
    return output;
};

const blockToRules = (input: Block): string => {
    const ruleContent = input.matchGroups.map(mG =>
        matchGroupToRules(mG)
    );
    if (!ruleContent || ruleContent.length === 0) {
        return `${header}${footer}`;
    }
    return `${header}${ruleContent.reduce(
        (pV, p) => `${pV}\n${p}`
    )}${footer}`;
};

const matchGroupToRules = (input: MatchGroup): string => {
    let output = "";
    const { rules, path, pathVariables, subGroups } = input;
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
    if (subGroups) {
        output += subGroups
            .map(mG => matchGroupToRules(mG))
            .reduce((pV, v) => pV + " " + v);
    }
    return `match ${matchPath} {\n${output}}`;
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
    return item.toString();
};

const ifBlockToString = (ifBlock: IfBlock): string => {
    // a == b ? c : d <=> (a == b && c) || d
    const stringCondition = ifBlock.condition.toString();
    const b = expressionOrIfToString(ifBlock.ifTrue);
    if (ifBlock.ifFalse) {
        const c = expressionOrIfToString(ifBlock.ifFalse);
        return `( (${stringCondition} && ${b}) || (${c}) )`;
    }
    return `(${stringCondition} && ${b})`;
};

export default stringifyBlock;
