import { MatchStatement } from "../../parser/types/statements";
import { Scope } from "../Scope";
import { RuleStatementCompiler } from "./RuleStatementCompiler";

export const MatchStatementCompiler = (
    item: MatchStatement,
    scope: Scope
): string => {
    const path =
        "/" +
        item.path
            .map(p => (p.wildcard ? `{${p.name}}` : p.name))
            .reduce((pV, v) => `${pV}/${v}`);
    const body = item.rules
        .map(r => RuleStatementCompiler(r, scope))
        .reduce((pV, v) => `${pV}\n${v}`);
    if (item.subStatements.length === 0) {
        return `match ${path} {\n ${body} \n  }`;
    }
    const sub = item.subStatements
        .map(s => MatchStatementCompiler(s, scope))
        .reduce((pV, v) => `${pV}\n${v}`);
    return `match ${path} {\n ${body} \n ${sub} \n }`;
};
