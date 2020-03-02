import { ComparisonExpressionCompiler } from ".";
import {
    ComparisonExpression,
    EqualityExpression,
    MemberExpression
} from "../../parser/types/expressions";
import Identifier from "../../parser/types/Identifier";
import Literal, {
    BooleanLiteral,
    InterfaceLiteral,
    isInterfaceLiteralValues,
    NumericLiteral,
    StringLiteral,
    TypeLiteral
} from "../../parser/types/literal";
import { ValueType } from "../../parser/types/Token";
import { DatabaseLocation, isDatabaseLocation } from "../Compiler";
import CompilerError from "../CompilerError";
import { IdentifierCompiler } from "../IdentifierCompiler";
import { NonTypeLiteralCompiler } from "../literal";
import { Scope } from "../Scope";
import { MemberExpressionCompiler } from "./MemberExpressionCompiler";

export const EqualityExpressionCompiler = (
    input: EqualityExpression,
    scope: Scope
): string => {
    // For equality, we need to make sure we have no InterfaceLiterals or TypeLiterals, and that comparison types are compatible.
    // First we check for no Interfaces
    const [left, right] = [input.left, input.right].map(v => {
        if (v instanceof Identifier) {
            const extracted = IdentifierCompiler(v, scope);
            if (
                extracted instanceof InterfaceLiteral ||
                extracted instanceof TypeLiteral ||
                (isDatabaseLocation(extracted) &&
                    extracted.castAs instanceof InterfaceLiteral)
            )
                throw new CompilerError(
                    v,
                    "Interfaces/Types cannot be compared with equality"
                );
            return extracted;
        }
        if (v instanceof MemberExpression) {
            const extracted = MemberExpressionCompiler(v, scope);
            if (
                extracted instanceof InterfaceLiteral ||
                extracted instanceof TypeLiteral
            )
                throw new CompilerError(
                    v,
                    "Interfaces/Types cannot be compared with equality"
                );
            if (extracted instanceof Array) {
                if (extracted.length !== 1)
                    throw new CompilerError(
                        v,
                        "Cannot do comparison with multiple types"
                    );
                const deep = extracted[0];
                if (deep instanceof Identifier) {
                    const subExtracted = IdentifierCompiler(
                        deep,
                        scope
                    );
                    if (
                        subExtracted instanceof InterfaceLiteral ||
                        subExtracted instanceof TypeLiteral ||
                        (isDatabaseLocation(subExtracted) &&
                            subExtracted.castAs instanceof
                                InterfaceLiteral)
                    )
                        throw new CompilerError(
                            v,
                            "Interfaces/Types cannot be compared with equality"
                        );
                    return subExtracted;
                }
                return deep;
            }
            return extracted;
        }
        if (v instanceof InterfaceLiteral || v instanceof TypeLiteral)
            throw new CompilerError(
                v,
                "Interfaces/Types cannot be compared with equality"
            );
        return v;
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
    from: ComparisonExpression | Literal | DatabaseLocation,
    input: EqualityExpression,
    scope: Scope
): { type: ValueType | "ANY"; value: string } => {
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
        else
            throw new CompilerError(
                from,
                "Interface/Type values not expected in equality comparison"
            );
        return { type, value: NonTypeLiteralCompiler(from) };
    }
    if (isInterfaceLiteralValues(from.castAs?.value))
        throw new CompilerError(
            input,
            "One of the values has multiple possible types, and can therefore not be compared"
        );
    return { type: from.castAs?.value ?? "ANY", value: from.key };
};