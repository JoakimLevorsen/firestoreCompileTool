import { MathExpressionCompiler } from ".";
import { DatabaseLocation, Scope } from "..";
import {
    ComparisonExpression,
    ComparisonType,
    MathExpression,
    OrderExpression
} from "../../types/expressions/comparison";
import Literal, {
    InterfaceLiteral,
    NumericLiteral,
    StringLiteral
} from "../../types/literals";
import CompilerError from "../CompilerError";
import { NonTypeLiteralCompiler } from "../literal";
import { IdentifierMemberExtractor } from "../IdentifierMemberExtractor";
import { OutsideFunctionDeclaration } from "../OutsideFunctionDeclaration";
import { CallExpression } from "../../types/expressions/CallExpression";
import { CallExpressionCompiler } from "./CallExpressionCompiler";
import { isDatabaseLocation } from "../Compiler";

export const OrderExpressionCompiler = (
    input: OrderExpression,
    scope: Scope
): string => {
    // First we check for the types. We can only compare numbers to numbers, strings to strings, and DatabaseLocations of those matching types.
    const [left, right] = [input.left, input.right].map(v =>
        extractType(v, scope)
    );
    if (left instanceof StringLiteral) {
        return compileLeftString(left, right, input);
    }
    if (
        left instanceof NumericLiteral ||
        left instanceof MathExpression
    ) {
        return compileLeftNumeric(left, right, input, scope);
    }
    if (!isDatabaseLocation(left) && left.returnType === "string")
        return compileLeftString(left.value, right, input);
    if (!isDatabaseLocation(left) && left.returnType === "number")
        return compileLeftNumeric(left.value, right, input, scope);
    // This means left is a Database location, so depending on the castAs we'll compile
    const rightC =
        right instanceof Literal
            ? NonTypeLiteralCompiler(right)
            : right instanceof MathExpression
            ? MathExpressionCompiler(right, scope)
            : right;
    // This will never happen since both string and numeric function returns were caught above
    if (!isDatabaseLocation(left))
        throw new Error("Should not be possible");
    if (left.castAs === undefined) {
        // This means right is fine no matter what
        if (isDatabaseLocation(rightC))
            return `${left.key} ${input.operator} ${
                typeof rightC === "string" ? rightC : rightC.key
            }`;
        return `${left.key} ${input.operator} ${
            typeof rightC === "string" ? rightC : rightC.value
        }`;
    }
    if (left.castAs.value === "string") {
        if (right instanceof StringLiteral)
            throw new CompilerError(
                right,
                `Cannot compare number and string with ${input.operator}`
            );
        if (isDatabaseLocation(rightC))
            return `${left.key} ${input.operator} ${
                typeof rightC === "string" ? rightC : rightC.key
            }`;
        return `${left.key} ${input.operator} ${
            typeof rightC === "string" ? rightC : rightC.value
        }`;
    }
    if (left.castAs.value === "number") {
        if (right instanceof NumericLiteral)
            throw new CompilerError(
                right,
                `Cannot compare number and string with ${input.operator}`
            );
        if (isDatabaseLocation(rightC))
            return `${left.key} ${input.operator} ${
                typeof rightC === "string" ? rightC : rightC.key
            }`;
        return `${left.key} ${input.operator} ${
            typeof rightC === "string" ? rightC : rightC.value
        }`;
    }
    throw new CompilerError(input, "Internal error");
};

const compileLeftString = (
    left: StringLiteral | string,
    right:
        | NumericLiteral
        | StringLiteral
        | DatabaseLocation
        | MathExpression
        | ReturnType<typeof CallExpressionCompiler>,
    input: OrderExpression
): string => {
    const [leftC, rightC] = [left, right].map(v =>
        v instanceof Literal ? NonTypeLiteralCompiler(v) : v
    );
    if (right instanceof StringLiteral)
        return `${leftC} ${input.operator} ${rightC}`;
    if (
        right instanceof NumericLiteral ||
        right instanceof MathExpression ||
        (isDatabaseLocation(right) &&
            right.castAs &&
            right.castAs.value === "number") ||
        (!isDatabaseLocation(right) && right.returnType !== "string")
    )
        throw new CompilerError(
            input,
            `Cannot compare number and string with ${input.operator}`
        );
    if (isDatabaseLocation(right))
        return `${leftC} ${input.operator} ${right.key}`;
    return `${leftC} ${input.operator} ${right.value}`;
};

const compileLeftNumeric = (
    left: NumericLiteral | MathExpression | string,
    right:
        | NumericLiteral
        | StringLiteral
        | DatabaseLocation
        | MathExpression
        | ReturnType<typeof CallExpressionCompiler>,
    input: OrderExpression,
    scope: Scope
): string => {
    const [leftC, rightC] = [left, right].map(v => {
        if (typeof v === "string") return v;
        if (v instanceof Literal) return NonTypeLiteralCompiler(v);
        if (v instanceof MathExpression)
            return MathExpressionCompiler(v, scope);
        if (isDatabaseLocation(v)) return v.key;
        return v.value;
    });
    if (
        right instanceof NumericLiteral ||
        right instanceof MathExpression
    )
        return `${leftC} ${input.operator} ${rightC}`;
    if (
        right instanceof StringLiteral ||
        (isDatabaseLocation(right) &&
            right.castAs &&
            right.castAs.value === "string") ||
        (!isDatabaseLocation(right) && right.returnType !== "number")
    )
        throw new CompilerError(
            input,
            `Cannot compare number and string with ${input.operator}`
        );
    if (isDatabaseLocation(right))
        return `${leftC} ${input.operator} ${right.key}`;
    return `${leftC} ${input.operator} ${right.value}`;
};

const extractType = (v: ComparisonType, scope: Scope) => {
    const clean = IdentifierMemberExtractor(v, scope);
    if (clean instanceof ComparisonExpression) {
        if (clean instanceof MathExpression) return clean;
        throw new CompilerError(
            clean,
            "Cannot compare booleans with < or >"
        );
    }
    if (clean instanceof Literal) {
        if (
            clean instanceof StringLiteral ||
            clean instanceof NumericLiteral
        )
            return clean;
        throw new CompilerError(
            clean,
            "Can only compare strings or numbers with < or >"
        );
    }
    if (clean instanceof OutsideFunctionDeclaration)
        throw new CompilerError(
            clean,
            "Cannot use function reference as value"
        );
    if (clean instanceof CallExpression)
        return CallExpressionCompiler(clean, scope);
    // If the DatabaseLocation isn't cast, we assume it's correct
    if (clean.castAs === undefined) return clean;
    if (clean.castAs instanceof InterfaceLiteral)
        throw new CompilerError(
            v,
            "Can only compare strings or numbers with < or >, not interfaces"
        );
    if (clean.castAs.value === "boolean")
        throw new CompilerError(
            v,
            "Cannot compare booleans with < or >"
        );
    return clean;
};
