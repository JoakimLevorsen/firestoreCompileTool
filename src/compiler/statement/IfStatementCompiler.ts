import { BooleanLiteral } from "../../parser/types/literal";
import { IfStatement } from "../../parser/types/statements";
import { ComparisonExpressionCompiler } from "../expression";
import { BooleanLiteralCompiler } from "../literal/BooleanLiteralCompiler";
import { Scope } from "../Scope";
import { BlockStatementCompiler } from "./BlockStatementCompiler";

export const IfStatementCompiler = (
    item: IfStatement,
    scope: Scope
): string => {
    /*
    This compilation operates on the priciple that
    if (a) {
        b
    } else c
    is logically equivalent to (a && b) || c
    */
    let test: string;
    if (item.test instanceof BooleanLiteral) {
        test = BooleanLiteralCompiler(item.test);
    } else {
        test = ComparisonExpressionCompiler(item.test, scope);
    }
    const consequent = BlockStatementCompiler(item.consequent, scope);
    if (item.alternate) {
        let alternate;
        if (item.alternate instanceof IfStatement) {
            alternate = IfStatementCompiler(item.alternate, scope);
        } else
            alternate = BlockStatementCompiler(item.alternate, scope);
        return `((${test} && (${consequent})) || ${alternate})`;
    }
    return `(${test} && (${consequent}))`;
};
