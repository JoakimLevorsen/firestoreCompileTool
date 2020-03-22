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

export const ReturnStatementCompiler = (
    item: ReturnStatement,
    scope: Scope
): string => {
    const { body } = item;
    if (body instanceof BooleanLiteral)
        return BooleanLiteralCompiler(body);
    if (body instanceof ComparisonExpression)
        return ComparisonExpressionCompiler(body, scope);
    if (body instanceof Identifier) {
        const extracted = IdentifierCompiler(body, scope);
        if (extracted instanceof Literal) {
            if (!(extracted instanceof BooleanLiteral))
                throw new CompilerError(
                    extracted,
                    "Can only return boolean values"
                );
            return NonTypeLiteralCompiler(extracted);
        }
        if (extracted instanceof ComparisonExpression)
            return ComparisonExpressionCompiler(extracted, scope);
        if (extracted instanceof CallExpression)
            return CallExpressionCompiler(extracted, scope).value;
        return extracted.key;
    }
    if (body instanceof CallExpression)
        return CallExpressionCompiler(body, scope).value;
    throw new CompilerError(item, "Internal error");
};
