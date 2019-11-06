import { Type } from "./type";
import { Interface } from "./interface";
import { extractType } from ".";

type RuleHeader = "read" | "write" | "create" | "update" | "delete";
type RuleSet = { [Header in RuleHeader]?: Logic };

const allRules: RuleHeader[] = ["create", "delete", "read", "update", "write"];
// Check if input with no spaces is a rule.
const extractRuleFromString = (input: string) =>
    allRules.find(r => r === input.replace(/\s/g, ""));

// An if is composed of: check, logic is true, logic is false
type ifIsType = [string, "is", Type | Interface];
type ifIsValue = [string, "==", string];
type IfClause = { check: ifIsType | ifIsValue; true: Logic; false?: Logic };
type Logic = IfClause | boolean;

export type MatchGroup = {
    path: string[];
    pathVariables: string[];
    rules: RuleSet;
};

const outerMatchRegex = /^\s*match\s((?:\/(?:\w+|{\w+}))*)\s*\(([\w\s:{};,]*)\)/;

export const isValidMatch = (input: string) =>
    //TODO: Make better test
    outerMatchRegex.test(input);

export const removeMatchFromString = (input: string) =>
    input.replace(outerMatchRegex, "");

const extractMatch = (
    input: string,
    interfaces: { [id: string]: Interface }
): MatchGroup => {
    if (!isValidMatch(input)) throw "Invalid Match";
    const contentMatch = input.match(outerMatchRegex);
    if (contentMatch === null) throw "Invalid Match";
    const [_, path, content] = contentMatch;
    const pathComponents = path.split("/").filter(p => p !== "");
    // First we check the path is pointing to a document (even amount of /)
    if (pathComponents.length % 2 !== 0)
        throw "Path must point to a document " + JSON.stringify(path);
    // Now we extract all the variables that exist in the path
    const pathVariables = pathComponents
        .filter(p => /{.*}/.test(p))
        .map(p => p.replace(/[{}]/g, ""));
    const newMatchGroup: MatchGroup = {
        path: pathComponents,
        pathVariables,
        rules: {}
    };
    // We now take the extracted rule content, and get the individual rules
    for (const rule of content.split(",").filter(c => c !== "")) {
        // TODO check rule syntax
        // We get the rule type
        const [rawRuleType, ruleContent] = rule.split(":");
        const ruleType = extractRuleFromString(rawRuleType);
        if (ruleType === undefined)
            throw "Rule type invalid " + JSON.stringify(rawRuleType);
        if (ruleContent.includes("{")) {
            // Check if its a one liner, or a two liner
            const logic = extractLogicFromString(
                ruleContent.replace(/[{}]/g, ""),
                interfaces
            );
            newMatchGroup.rules[ruleType] = logic;
        } else {
            const logic = extractLogicFromString(ruleContent, interfaces, true);
            newMatchGroup.rules[ruleType] = logic;
        }
    }
    return newMatchGroup;
};

const checkIsIfRegex = /^\s*(return){0,1}\s*if/;
const checkIsIfValidRegex = /^\s*(?:return){0,1}\s*if\s*([\w\.]+)\s+is\s+(\w+)/;

const extractLogicFromString = (
    input: string,
    allInterfaces: { [id: string]: Interface },
    oneLiner = false
): Logic => {
    // Check if this is an if statement
    if (checkIsIfRegex.test(input)) {
        // Check this if statement is valid
        if (!/\s*(return){0,1}\s*if/)
            throw "Invalid if statement " + JSON.stringify(input);
        // Check if this line returns
        const iReturn = /\s*return/.test(input) || oneLiner;
        const match = input.match(checkIsIfValidRegex);
        if (match === null)
            throw "Invalid if statement " + JSON.stringify(input);
        const [_, data, target] = match;
        // We set the type to an interface, and fallback to a type
        const targetType = allInterfaces[target] || extractType(target);
        if (!targetType) throw `Type ${JSON.stringify(target)} does not exist.`;
        const myIfStatement: ifIsType = [data, "is", targetType];
        if (iReturn) return { check: myIfStatement, true: true };

        return {
            check: myIfStatement,
            true: true,
            false: extractLogicFromString(
                input.replace(checkIsIfValidRegex, ""),
                allInterfaces
            )
        };
        // If this is a oneliner, the word might just be true or false.
    } else if (oneLiner && /^\s*(true|false)\s*$/.test(input)) {
        return input.includes("true");
    } else {
        throw "Invalid keyword " + JSON.stringify(input);
    }
};

export default extractMatch;
