import { TypeLiteral } from "../../types/literals";
import { MatchStatement } from "../../types/statements";
import { Scope } from "../scope";
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
    // We now extract wildcards from the path, and add them to the scope
    const newScope = { ...scope };
    item.path.forEach(p => {
        if (!p.wildcard) return;
        newScope[p.name] = {
            value: {
                key: p.name,
                castAs: new TypeLiteral(-1, "string")
            }
        };
    });
    const body = item.rules
        .map(r => RuleStatementCompiler(r, newScope))
        .reduce((pV, v) => `${pV}\n${v}`, "");
    if (item.subStatements.length === 0) {
        return `match ${path} {\n ${body} \n  }`;
    }
    const sub = item.subStatements
        .map(s => MatchStatementCompiler(s, newScope))
        .reduce((pV, v) => `${pV}\n${v}`, "");
    return `match ${path} {\n ${body} \n ${sub} \n }`;
};
