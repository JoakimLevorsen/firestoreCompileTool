import { Identifier } from "../../types";
import { MemberExpression } from "../../types/expressions";
import { ConstStatement } from "../../types/statements";
import { Compiler } from "../Compiler";
import CompilerError from "../CompilerError";
import { MemberExpressionCompiler } from "../expression/MemberExpressionCompiler";
import { IdentifierCompiler } from "../IdentifierCompiler";

export const ConstStatementCompiler: Compiler<ConstStatement> = (
    item,
    scope
) => {
    if (scope[item.name])
        throw new CompilerError(
            item,
            `Cannot override ${item.name} already in scope`
        );
    if (item.value instanceof Identifier) {
        scope[item.name] = IdentifierCompiler(item.value, scope);
    } else if (item.value instanceof MemberExpression) {
        const extracted = MemberExpressionCompiler(item.value, scope);
        if (extracted instanceof Identifier) {
            scope[item.name] = IdentifierCompiler(extracted, scope);
        } else if (extracted instanceof Array) {
            if (extracted.length !== 1)
                throw new CompilerError(
                    item.value,
                    "Cannot assign multiple values to constant"
                );
            const v = extracted[0];
            if (v instanceof Identifier) {
                scope[item.name] = IdentifierCompiler(v, scope);
            } else scope[item.name] = v;
        } else scope[item.name] = extracted;
    } else scope[item.name] = item.value;
    return { scope };
};
