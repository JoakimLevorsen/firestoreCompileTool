import { Identifier } from "../../types";
import { MemberExpression } from "../../types/expressions";
import { ConstStatement } from "../../types/statements";
import { Compiler } from "../Compiler";
import CompilerError from "../CompilerError";
import { MemberExpressionCompiler } from "../expression/MemberExpressionCompiler";
import { IdentifierCompiler } from "../IdentifierCompiler";
import { OutsideFunctionDeclaration } from "../OutsideFunctionDeclaration";
import OptionalDependecyTracker from "../OptionalDependencyTracker";

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
        const optionalChecks = new OptionalDependecyTracker();
        const rawExtracted = MemberExpressionCompiler(
            item.value,
            scope,
            optionalChecks
        );
        if (rawExtracted instanceof OutsideFunctionDeclaration)
            throw new CompilerError(
                item.value,
                "Cannot assign function to constant"
            );
        if (rawExtracted instanceof Identifier) {
            scope[item.name] = IdentifierCompiler(
                rawExtracted,
                scope
            );
        } else if (rawExtracted instanceof Array) {
            if (rawExtracted.length !== 1)
                throw new CompilerError(
                    item.value,
                    "Cannot assign multiple values to constant"
                );
            const v = rawExtracted[0];
            if (v instanceof Identifier) {
                scope[item.name] = IdentifierCompiler(v, scope);
            } else scope[item.name] = { value: v, optionalChecks };
        } else
            scope[item.name] = {
                value: rawExtracted,
                optionalChecks
            };
    } else scope[item.name] = { value: item.value };
    return { scope };
};
