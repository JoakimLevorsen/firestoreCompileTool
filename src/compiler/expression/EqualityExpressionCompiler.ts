import { ComparisonExpressionCompiler } from ".";
import { DatabaseLocation, isDatabaseLocation, Scope } from "..";
import { ValueType } from "../../types";
import {
    ComparisonExpression,
    EqualityExpression
} from "../../types/expressions/comparison";
import Literal, {
    BooleanLiteral,
    InterfaceLiteral,
    isInterfaceLiteralValues,
    NumericLiteral,
    StringLiteral,
    TypeLiteral
} from "../../types/literals";
import CompilerError from "../CompilerError";
import { NonTypeLiteralCompiler } from "../literal";
import { IdentifierMemberExtractor } from "../IdentifierMemberExtractor";
import { OutsideFunctionDeclaration } from "../OutsideFunctionDeclaration";
import { CallExpression } from "../../types/expressions/CallExpression";
import { CallExpressionCompiler } from "./CallExpressionCompiler";

export const EqualityExpressionCompiler = (
    input: EqualityExpression,
    scope: Scope
): string => {
    // For equality, we need to make sure we have no InterfaceLiterals or TypeLiterals, and that comparison types are compatible.
    // First we check for no Interfaces
    const [left, right] = [input.left, input.right].map(v => {
        const nonIden = IdentifierMemberExtractor(v, scope);
        if (nonIden instanceof ComparisonExpression) return nonIden;
        if (nonIden instanceof OutsideFunctionDeclaration)
            throw new CompilerError(
                v,
                "Function ref not usable as value"
            );
        if (nonIden instanceof CallExpression) {
            return CallExpressionCompiler(nonIden, scope);
        }
        if (
            nonIden instanceof InterfaceLiteral ||
            (nonIden instanceof TypeLiteral &&
                nonIden.value !== "null")
        )
            throw new CompilerError(
                nonIden,
                "Interfaces/Types cannot be compared with equality"
            );
        return nonIden;
    });

    // Now we compile the two sides, and compare their types
    const {
        type: leftType,
        value: leftCompiled
    } = extractTypeAndValue(left, input, scope);
    const {
        type: rightType,
        value: rightCompiled
    } = extractTypeAndValue(right, input, scope);
    if (
        leftType !== rightType &&
        leftType !== "ANY" &&
        rightType !== "ANY"
    )
        throw new CompilerError(
            input,
            `Comparing ${leftType} and ${rightType} is not supported`
        );
    // Now we know everything is groovy so we can return
    return `${leftCompiled} ${input.operator} ${rightCompiled}`;
};

const extractTypeAndValue = (
    from:
        | ComparisonExpression
        | Literal
        | DatabaseLocation
        | ReturnType<typeof CallExpressionCompiler>
        | null,
    input: EqualityExpression,
    scope: Scope
): { type: ValueType | "ANY"; value: string } => {
    if (from === null) return { type: "null", value: "null" };
    if (from instanceof ComparisonExpression) {
        return {
            type: "boolean",
            value: ComparisonExpressionCompiler(from, scope)
        };
    }
    if (from instanceof Literal) {
        let type: ValueType;
        if (from instanceof BooleanLiteral) type = "boolean";
        else if (from instanceof StringLiteral) type = "string";
        else if (from instanceof NumericLiteral) type = "number";
        else if (from instanceof TypeLiteral && from.value === "null")
            return { type: "null", value: "null" };
        else
            throw new CompilerError(
                from,
                "Interface/Type values not expected in equality comparison"
            );
        return { type, value: NonTypeLiteralCompiler(from) };
    }
    if (isDatabaseLocation(from)) {
        if (isInterfaceLiteralValues(from.castAs?.value)) {
            if (from.optionalCast)
                return { type: "ANY", value: from.key };
            throw new CompilerError(
                input,
                "One of the values has multiple possible types, and can therefore not be compared"
            );
        }
        if (from.castAs instanceof TypeLiteral)
            return {
                type: from.castAs?.value ?? "ANY",
                value: from.key
            };
        return { type: from.castAs?.type ?? "ANY", value: from.key };
    }
    return { type: from.returnType, value: from.value };
};
