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
    TypeLiteral,
    NullLiteral
} from "../../types/literals";
import CompilerError from "../CompilerError";
import { NonTypeLiteralCompiler } from "../literal";
import { IdentifierMemberExtractor } from "../IdentifierMemberExtractor";
import { OutsideFunctionDeclaration } from "../OutsideFunctionDeclaration";
import { CallExpression } from "../../types/expressions/CallExpression";
import { CallExpressionCompiler } from "./CallExpressionCompiler";
import OptionalDependecyTracker from "../OptionalDependencyTracker";

export const EqualityExpressionCompiler = (
    input: EqualityExpression,
    scope: Scope
): string => {
    // For equality, we need to make sure we have no InterfaceLiterals or TypeLiterals, and that comparison types are compatible.
    // First we check for no Interfaces
    const leftOps = new OptionalDependecyTracker();
    const rightOps = new OptionalDependecyTracker();
    const [left, right] = [input.left, input.right].map((v, i) => {
        const optionals = i === 0 ? leftOps : rightOps;
        const nonIden = IdentifierMemberExtractor(
            v,
            scope,
            optionals
        );
        if (nonIden instanceof ComparisonExpression) return nonIden;
        if (nonIden instanceof OutsideFunctionDeclaration)
            throw new CompilerError(
                v,
                "Function ref not usable as value"
            );
        if (nonIden instanceof CallExpression) {
            return CallExpressionCompiler(nonIden, scope, optionals);
        }
        if (
            nonIden instanceof InterfaceLiteral ||
            nonIden instanceof TypeLiteral
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
    } = extractTypeAndValue(left, input, scope, leftOps);
    const {
        type: rightType,
        value: rightCompiled
    } = extractTypeAndValue(right, input, scope, rightOps);
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
    // If we do have optionals we return something else however
    const leftWrapped = leftOps.export(leftCompiled);
    const rightWrapped = rightOps.export(rightCompiled);
    return `${leftWrapped} ${input.operator} ${rightWrapped}`;
};

const extractTypeAndValue = (
    from:
        | ComparisonExpression
        | Literal
        | DatabaseLocation
        | ReturnType<typeof CallExpressionCompiler>,
    input: EqualityExpression,
    scope: Scope,
    optionals: OptionalDependecyTracker
): { type: ValueType | "ANY" | "null"; value: string } => {
    if (from instanceof ComparisonExpression) {
        return {
            type: "boolean",
            value: ComparisonExpressionCompiler(
                from,
                scope,
                optionals
            )
        };
    }
    if (from instanceof Literal) {
        let type: ValueType | "null";
        if (from instanceof BooleanLiteral) type = "boolean";
        else if (from instanceof StringLiteral) type = "string";
        else if (from instanceof NumericLiteral) type = "number";
        else if (from instanceof NullLiteral) type = "null";
        else
            throw new CompilerError(
                from,
                "Interface/Type values not expected in equality comparison"
            );
        return { type, value: NonTypeLiteralCompiler(from) };
    }
    if (isDatabaseLocation(from)) {
        if (isInterfaceLiteralValues(from.castAs?.value)) {
            if (from.optional)
                return { type: "ANY", value: from.key };
            throw new CompilerError(
                input,
                "One of the values has multiple possible types, and can therefore not be compared"
            );
        }
        return { type: from.castAs?.value ?? "ANY", value: from.key };
    }
    if (typeof from === undefined) {
        throw new Error("Internal error");
    }
    return { type: from.returnType, value: from.value };
};
