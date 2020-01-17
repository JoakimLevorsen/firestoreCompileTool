import { RuleSet, Rule, RuleHeader } from "../Rule";
import { Block } from "./Block";

export class MatchBlock extends Block {
    private rules: RuleSet = {};
    private path: string = "";
    // Only one path variable can exist pr block
    private pathVariable?: string;

    public addRule(key: RuleHeader, rule: Rule) {
        if (this.rules[key]) {
            throw new Error(`Rule for key ${key} already defined`);
        }
        this.rules[key] = rule;
    }

    public setPath(path: string, pathVariable?: string) {
        this.path = path;
        this.pathVariable = pathVariable;
    }

    public getPath = () => ({
        path: this.path,
        pathVariable: this.pathVariable
    });

    public toRule = (): string => `match ${this.path} {
        ${Object.keys(this.rules)
            .map(
                rK =>
                    `allow ${rK}: ${this.rules[
                        rK as RuleHeader
                    ]!.toRule()};`
            )
            .reduce((pV, v) => (pV === "" ? v : `${pV}\n${v}`), "")}
        ${this.childMatchBlocks
            .map(b => b.toRule())
            .reduce((pV, v) => (pV === "" ? v : `${pV}\n${v}`), "")}
    }`;
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
