import { ComparisonExpression } from "../../parser/types/expressions";
import Identifier from "../../parser/types/Identifier";
import Literal, { BooleanLiteral } from "../../parser/types/literal";
import { ReturnStatement } from "../../parser/types/statements";
import CompilerError from "../CompilerError";
import { ComparisonExpressionCompiler } from "../expression";
import { IdentifierCompiler } from "../IdentifierCompiler";
import { NonTypeLiteralCompiler } from "../literal";
import { BooleanLiteralCompiler } from "../literal/BooleanLiteralCompiler";
import { Scope } from "../Scope";

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
        return extracted.key;
    }
    throw new CompilerError(item, "Internal error");
};
