import { IdentifierCompiler, Scope } from "..";
import { Identifier } from "../../types";
import { ComparisonExpression } from "../../types/expressions/comparison";
import Literal, { BooleanLiteral } from "../../types/literals";
import { ReturnStatement } from "../../types/statements";
import CompilerError from "../CompilerError";
import { ComparisonExpressionCompiler } from "../expression";
import { NonTypeLiteralCompiler } from "../literal";
import { BooleanLiteralCompiler } from "../literal/BooleanLiteralCompiler";
import { CallExpression } from "../../types/expressions/CallExpression";
import { CallExpressionCompiler } from "../expression/CallExpressionCompiler";
import OptionalDependecyTracker from "../OptionalDependencyTracker";

export const ReturnStatementCompiler = (
    item: ReturnStatement,
    scope: Scope
): string => {
    const { body } = item;
    if (body instanceof BooleanLiteral)
        return BooleanLiteralCompiler(body);
    const optionals = new OptionalDependecyTracker();
    if (body instanceof ComparisonExpression) {
        const subReturn = ComparisonExpressionCompiler(
            body,
            scope,
            optionals
        );
        return optionals.export(subReturn);
    }
    if (body instanceof Identifier) {
        const rawExtracted = IdentifierCompiler(body, scope);
        const extracted = rawExtracted.value;
        optionals.cloneDepsFrom(rawExtracted.optionalChecks);
        if (extracted instanceof Literal) {
            if (!(extracted instanceof BooleanLiteral))
                throw new CompilerError(
                    extracted,
                    "Can only return boolean values"
                );
            return NonTypeLiteralCompiler(extracted);
        }
        if (extracted instanceof ComparisonExpression) {
            const subReturn = ComparisonExpressionCompiler(
                extracted,
                scope,
                optionals
            );
            return optionals.export(subReturn);
        }
        if (extracted instanceof CallExpression) {
            const subReturn = CallExpressionCompiler(
                extracted,
                scope,
                optionals
            ).value;
            return optionals.export(subReturn);
        }
        return extracted.key;
    }
    if (body instanceof CallExpression) {
        const subReturn = CallExpressionCompiler(
            body,
            scope,
            optionals
        ).value;
        return optionals.export(subReturn);
    }
    throw new CompilerError(item, "Internal error");
};
