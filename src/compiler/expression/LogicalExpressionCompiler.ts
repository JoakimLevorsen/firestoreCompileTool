import { ComparisonExpressionCompiler } from ".";
import { isDatabaseLocation, Scope } from "..";
import {
    ComparisonExpression,
    LogicalExpression
} from "../../types/expressions/comparison";
import Literal, {
    BooleanLiteral,
    TypeLiteral
} from "../../types/literals";
import CompilerError from "../CompilerError";
import { BooleanLiteralCompiler } from "../literal/BooleanLiteralCompiler";
import { IdentifierMemberExtractor } from "../IdentifierMemberExtractor";
import { OutsideFunctionDeclaration } from "../OutsideFunctionDeclaration";
import { CallExpression } from "../../types/expressions/CallExpression";
import { CallExpressionCompiler } from "./CallExpressionCompiler";

export const LogicalExpressionCompiler = (
    input: LogicalExpression,
    scope: Scope
): string => {
    // For this we just need to make sure no Interfaces or Types are involved, and check the comparison types return boolean values
    const left = IdentifierMemberExtractor(input.left, scope);
    const right = IdentifierMemberExtractor(input.right, scope);
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
        if (v instanceof OutsideFunctionDeclaration)
            throw new CompilerError(
                v,
                "Cannot use function reference as value"
            );
        if (v instanceof CallExpression) {
            const compiled = CallExpressionCompiler(v, scope);
            if (compiled.returnType === "boolean") return compiled;
            throw new CompilerError(
                v,
                "Cannot use non boolean return type in &&/|| expression"
            );
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
            if (isDatabaseLocation(v)) return v.key;
            return v.value;
        }
    );
    return `(${compiledLeft} ${input.operator} ${compiledRight})`;
};
