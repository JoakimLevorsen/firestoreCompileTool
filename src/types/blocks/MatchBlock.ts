import { RuleSet, Rule, RuleHeader } from "../Rule";
import { Block } from "./Block";

export default class MatchBlock extends Block {
    private rules: RuleSet = {};
    private path: string;
    private pathVariables: string[];

    constructor(path: string, pathVariables: string[]) {
        super();
        this.path = path;
        this.pathVariables = pathVariables;
    }

    public addRule(key: RuleHeader, rule: Rule) {
        if (this.rules[key]) {
            throw new Error(`Rule for key ${key} already defined`);
        }
        this.rules[key] = rule;
    }
}
