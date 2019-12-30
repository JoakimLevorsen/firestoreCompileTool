import { RuleSet, Rule, RuleHeader } from "../Rule";
import { Block } from "./Block";

export class MatchBlock extends Block {
    private rules: RuleSet = {};
    private path: string;
    // Only one path variable can exist pr block
    private pathVariable?: string;

    constructor(path: string, pathVariable?: string) {
        super();
        this.path = path;
        this.pathVariable = pathVariable;
    }

    public addRule(key: RuleHeader, rule: Rule) {
        if (this.rules[key]) {
            throw new Error(`Rule for key ${key} already defined`);
        }
        this.rules[key] = rule;
    }

    public getPath = () => ({
        path: this.path,
        pathVariable: this.pathVariable
    });
}

export class PathBuilder {
    private path: string[] = [];
    private pathVariable?: string;

    addComponent(path: string, isVariable = false) {
        this.path.push(path);
        if (isVariable) this.pathVariable = path;
    }

    exportPath = () => ({
        path: this.path,
        pathVariable: this.pathVariable
    });
}
