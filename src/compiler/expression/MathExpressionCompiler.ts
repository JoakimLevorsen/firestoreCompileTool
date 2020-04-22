import { Scope } from "..";
import {
    ComparisonExpression,
    ComparisonType,
    MathExpression
} from "../../types/expressions/comparison";
import Literal, {
    InterfaceLiteral,
    NumericLiteral
} from "../../types/literals";
import CompilerError from "../CompilerError";
import { NumericLiteralCompiler } from "../literal/NumericLiteralCompiler";
import { IdentifierMemberExtractor } from "../IdentifierMemberExtractor";
import { OutsideFunctionDeclaration } from "../OutsideFunctionDeclaration";
import { CallExpression } from "../../types/expressions/CallExpression";
import { CallExpressionCompiler } from "./CallExpressionCompiler";
import { isDatabaseLocation } from "../Compiler";
import OptionalDependecyTracker from "../OptionalDependencyTracker";

export const MathExpressionCompiler = (
    input: MathExpression,
    scope: Scope,
    optionals: OptionalDependecyTracker
): string => {
    // We need to make sure both sides are numbers, then we can return
    const [left, right] = [input.left, input.right].map(i => {
        const clean = cleanUpInputs(i, scope, optionals);
        if (clean instanceof NumericLiteral)
            return NumericLiteralCompiler(clean);
        if (clean instanceof MathExpression)
            return MathExpressionCompiler(clean, scope, optionals);
        if (isDatabaseLocation(clean)) return clean.key;
        return clean.value;
    });
    return `${left} ${input.operator} ${right}`;
};

const cleanUpInputs = (
    input: ComparisonType,
    scope: Scope,
    optionals: OptionalDependecyTracker
) => {
    const clean = IdentifierMemberExtractor(input, scope, optionals);
    if (clean instanceof Literal) {
        if (clean instanceof NumericLiteral) return clean;
        throw new CompilerError(
            input,
            "Can only compare numbers with numbers"
        );
    }
    if (clean instanceof ComparisonExpression) {
        if (clean instanceof MathExpression) return clean;
        throw new CompilerError(
            input,
            "Can not compare numbers and booleans"
        );
    }
    if (clean instanceof OutsideFunctionDeclaration)
        throw new CompilerError(
            clean,
            "Cannot use function reference as value"
        );
    if (clean instanceof CallExpression) {
        const compiled = CallExpressionCompiler(
            clean,
            scope,
            optionals
        );
        if (compiled.returnType === "number") return compiled;
        throw new CompilerError(
            clean,
            "Can not use non number in math expression"
        );
    }
    if (clean.castAs === undefined) return clean;
    if (clean.castAs instanceof InterfaceLiteral)
        throw new CompilerError(
            input,
            "Cannot compare interface with number"
        );
    if (clean.castAs.value === "number") return clean;
    throw new CompilerError(
        input,
        `Cannot use math expression with ${clean.castAs.value}`
    );
};
