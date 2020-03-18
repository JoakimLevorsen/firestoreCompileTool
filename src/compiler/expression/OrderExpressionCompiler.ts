import { MathExpressionCompiler, MemberExpressionCompiler } from ".";
import { DatabaseLocation, IdentifierCompiler, Scope } from "..";
import { Identifier } from "../../types";
import { MemberExpression } from "../../types/expressions";
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
    // This means left is a Database location, so depending on the castAs we'll compile
    const rightC =
        right instanceof Literal
            ? NonTypeLiteralCompiler(right)
            : right instanceof MathExpression
            ? MathExpressionCompiler(right, scope)
            : right;
    if (left.castAs === undefined) {
        // This means right is fine no matter what
        return `${left.key} ${input.operator} ${
            typeof rightC === "string" ? rightC : rightC.key
        }`;
    }
    if (left.castAs.value === "string") {
        if (right instanceof StringLiteral)
            throw new CompilerError(
                right,
                `Cannot compare number and string with ${input.operator}`
            );
        return `${left.key} ${input.operator} ${
            typeof rightC === "string" ? rightC : rightC.key
        }`;
    }
    if (left.castAs.value === "number") {
        if (right instanceof NumericLiteral)
            throw new CompilerError(
                right,
                `Cannot compare number and string with ${input.operator}`
            );
        return `${left.key} ${input.operator} ${
            typeof rightC === "string" ? rightC : rightC.key
        }`;
    }
    throw new CompilerError(input, "Internal error");
};

const compileLeftString = (
    left: StringLiteral,
    right:
        | NumericLiteral
        | StringLiteral
        | DatabaseLocation
        | MathExpression,
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
        (right.castAs && right.castAs.value === "number")
    )
        throw new CompilerError(
            input,
            `Cannot compare number and string with ${input.operator}`
        );
    return `${leftC} ${input.operator} ${right.key}`;
};

const compileLeftNumeric = (
    left: NumericLiteral | MathExpression,
    right:
        | NumericLiteral
        | StringLiteral
        | DatabaseLocation
        | MathExpression,
    input: OrderExpression,
    scope: Scope
): string => {
    const [leftC, rightC] = [left, right].map(v => {
        if (v instanceof Literal) return NonTypeLiteralCompiler(v);
        if (v instanceof MathExpression)
            return MathExpressionCompiler(v, scope);
        return v.key;
    });
    if (
        right instanceof NumericLiteral ||
        right instanceof MathExpression
    )
        return `${leftC} ${input.operator} ${rightC}`;
    if (
        right instanceof StringLiteral ||
        (right.castAs && right.castAs.value === "string")
    )
        throw new CompilerError(
            input,
            `Cannot compare number and string with ${input.operator}`
        );
    return `${leftC} ${input.operator} ${right.key}`;
};

const extractType = (v: ComparisonType, scope: Scope) => {
    let root:
        | Literal
        | DatabaseLocation
        | Identifier
        | ComparisonExpression;
    if (v instanceof MemberExpression) {
        const extracted = MemberExpressionCompiler(v, scope);
        if (extracted instanceof Array) {
            if (extracted.length !== 1)
                throw new CompilerError(
                    v,
                    "Cannot compare a value cast as multiple types"
                );
            root = extracted[0];
        } else root = extracted;
    } else root = v;
    let root2: Literal | DatabaseLocation | ComparisonExpression;
    if (root instanceof Identifier) {
        root2 = IdentifierCompiler(root, scope);
    } else root2 = root;
    if (root2 instanceof ComparisonExpression) {
        if (root2 instanceof MathExpression) return root2;
        throw new CompilerError(
            root2,
            "Cannot compare booleans with < or >"
        );
    }
    if (root2 instanceof Literal) {
        if (
            root2 instanceof StringLiteral ||
            root2 instanceof NumericLiteral
        )
            return root2;
        throw new CompilerError(
            root2,
            "Can only compare strings or numbers with < or >"
        );
    }
    // If the DatabaseLocation isn't cast, we assume it's correct
    if (root2.castAs === undefined) return root2;
    if (root2.castAs instanceof InterfaceLiteral)
        throw new CompilerError(
            v,
            "Can only compare strings or numbers with < or >, not interfaces"
        );
    if (root2.castAs.value === "boolean")
        throw new CompilerError(
            v,
            "Cannot compare booleans with < or >"
        );
    return root2;
};
