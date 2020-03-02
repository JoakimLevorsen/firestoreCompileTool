import { ComparisonExpressionCompiler } from ".";
import {
    ComparisonExpression,
    LogicalExpression,
    MemberExpression
} from "../../parser/types/expressions";
import Identifier from "../../parser/types/Identifier";
import Literal, {
    BooleanLiteral,
    TypeLiteral
} from "../../parser/types/literal";
import { DatabaseLocation, isDatabaseLocation } from "../Compiler";
import CompilerError from "../CompilerError";
import { IdentifierCompiler } from "../IdentifierCompiler";
import { BooleanLiteralCompiler } from "../literal/BooleanLiteralCompiler";
import { Scope } from "../Scope";
import { MemberExpressionCompiler } from "./MemberExpressionCompiler";

export const LogicalExpressionCompiler = (
    input: LogicalExpression,
    scope: Scope
): string => {
    // For this we just need to make sure no Interfaces or Types are involved, and check the comparison types return boolean values
    let left: typeof input["left"] | DatabaseLocation = input.left;
    let right: typeof input["right"] | DatabaseLocation = input.right;
    if (left instanceof Identifier) {
        left = IdentifierCompiler(left, scope);
    }
    if (right instanceof Identifier) {
        right = IdentifierCompiler(right, scope);
    }
    // Now we make sure the comparison isn't non boolean
    const [safeRight, safeLeft] = [right, left].map(v => {
        if (v instanceof Literal) {
            if (!(v instanceof BooleanLiteral))
                throw new CompilerError(
                    v,
                    `Only boolean values expected in ${input.operator} expression`
                );
            return v;
        }
        if (v instanceof MemberExpression) {
            const extracted = MemberExpressionCompiler(v, scope);
            if (
                isDatabaseLocation(extracted) &&
                (extracted.castAs === undefined ||
                    (extracted.castAs instanceof TypeLiteral &&
                        extracted.castAs.value === "boolean"))
            )
                return extracted;
            if (!(extracted instanceof BooleanLiteral))
                throw new CompilerError(
                    v,
                    `Only boolean values expected in ${input.operator} expression`
                );
            return extracted;
        }
        if (isDatabaseLocation(v)) {
            if (
                v.castAs === undefined ||
                (v.castAs instanceof TypeLiteral &&
                    v.castAs.value === "boolean")
            ) {
                return v;
            } else
                throw new CompilerError(
                    input,
                    `Only boolean values expected in ${input.operator} expression`
                );
        }
        // Since the only type left is a ComparisonExpression, this must compile.
        return v;
    });
    // Now we can compile the two sides and return them
    const [compiledRight, compiledLeft] = [safeRight, safeLeft].map(
        v => {
            if (v instanceof ComparisonExpression) {
                return ComparisonExpressionCompiler(v, scope);
            }
            if (v instanceof BooleanLiteral) {
                return BooleanLiteralCompiler(v);
            }
            return v.key;
        }
    );
    return `(${compiledLeft} ${input.operator} ${compiledRight})`;
};
