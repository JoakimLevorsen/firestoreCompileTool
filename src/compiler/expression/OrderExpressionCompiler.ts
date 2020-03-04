import {
    ComparisonExpression,
    ComparisonType,
    MemberExpression,
    OrderExpression
} from "../../parser/types/expressions";
import Identifier from "../../parser/types/Identifier";
import Literal, {
    InterfaceLiteral,
    NumericLiteral,
    StringLiteral
} from "../../parser/types/literal";
import { DatabaseLocation } from "../Compiler";
import CompilerError from "../CompilerError";
import { IdentifierCompiler } from "../IdentifierCompiler";
import { NonTypeLiteralCompiler } from "../literal";
import { Scope } from "../Scope";
import { MemberExpressionCompiler } from "./MemberExpressionCompiler";

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
    if (left instanceof NumericLiteral) {
        return compileLeftNumeric(left, right, input);
    }
    // This means left is a Database location, so depending on the castAs we'll compile
    const rightC =
        right instanceof Literal
            ? NonTypeLiteralCompiler(right)
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
    right: NumericLiteral | StringLiteral | DatabaseLocation,
    input: OrderExpression
): string => {
    const [leftC, rightC] = [left, right].map(v =>
        v instanceof Literal ? NonTypeLiteralCompiler(v) : v
    );
    if (right instanceof StringLiteral)
        return `${leftC} ${input.operator} ${rightC}`;
    if (
        right instanceof NumericLiteral ||
        (right.castAs && right.castAs.value === "number")
    )
        throw new CompilerError(
            input,
            `Cannot compare number and string with ${input.operator}`
        );
    return `${leftC} ${input.operator} ${right.key}`;
};

const compileLeftNumeric = (
    left: NumericLiteral,
    right: NumericLiteral | StringLiteral | DatabaseLocation,
    input: OrderExpression
): string => {
    const [leftC, rightC] = [left, right].map(v =>
        v instanceof Literal ? NonTypeLiteralCompiler(v) : v
    );
    if (right instanceof NumericLiteral)
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
    if (root2 instanceof ComparisonExpression)
        throw new CompilerError(
            root2,
            "Cannot compare booleans with < or >"
        );
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
