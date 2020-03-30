import { Scope } from "..";
import {
    ComparisonExpression,
    ComparisonType,
    MathExpression
} from "../../types/expressions/comparison";
import Literal, {
    InterfaceLiteral,
    NumericLiteral,
    StringLiteral,
    TypeLiteral
} from "../../types/literals";
import CompilerError from "../CompilerError";
import { NumericLiteralCompiler } from "../literal/NumericLiteralCompiler";
import { IdentifierMemberExtractor } from "../IdentifierMemberExtractor";
import { OutsideFunctionDeclaration } from "../OutsideFunctionDeclaration";
import { CallExpression } from "../../types/expressions/CallExpression";
import { CallExpressionCompiler } from "./CallExpressionCompiler";
import { isDatabaseLocation } from "../Compiler";
import { StringLiteralCompiler } from "../literal/StringLiteralCompiler";

export const MathExpressionCompiler = (
    input: MathExpression,
    scope: Scope
): string => {
    // We need to make sure both sides are numbers or strings, then we can return
    const [left, right] = [input.left, input.right].map((i): {
        type: "number" | "string";
        value: string;
    } => {
        const clean = cleanUpInputs(i, scope);
        if (clean instanceof NumericLiteral)
            return {
                type: "number",
                value: NumericLiteralCompiler(clean)
            };
        if (clean instanceof MathExpression)
            return {
                type: "number",
                value: MathExpressionCompiler(clean, scope)
            };
        if (clean instanceof StringLiteral) {
            return {
                type: "string",
                value: StringLiteralCompiler(clean)
            };
        }
        if (isDatabaseLocation(clean))
            return {
                type:
                    (clean.castAs! as TypeLiteral).value === "number"
                        ? "number"
                        : "string",
                value: clean.key
            };
        return {
            value: clean.value,
            type: clean.returnType === "number" ? "number" : "string"
        };
    });
    if (left.type === "string" || right.type === "string") {
        if (left.type === "string" && right.type === "string") {
            if (input.operator === "+") {
                return `${left.value} + ${right.value}`;
            }
            throw new CompilerError(
                input,
                `Cannot ${input.operator} between two strings`
            );
        } else
            throw new CompilerError(
                input,
                `Cannot ${input.operator} on a string and a number`
            );
    }
    return `${left.value} ${input.operator} ${right.value}`;
};

const cleanUpInputs = (input: ComparisonType, scope: Scope) => {
    const clean = IdentifierMemberExtractor(input, scope);
    if (clean instanceof Literal) {
        if (
            clean instanceof NumericLiteral ||
            clean instanceof StringLiteral
        )
            return clean;
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
        const compiled = CallExpressionCompiler(clean, scope);
        if (compiled.returnType === "number") return compiled;
        if (compiled.returnType === "string") return compiled;
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
    if (
        clean.castAs.value === "number" ||
        clean.castAs.value === "string"
    )
        return clean;
    throw new CompilerError(
        input,
        `Cannot use math expression with ${clean.castAs.value}`
    );
};
