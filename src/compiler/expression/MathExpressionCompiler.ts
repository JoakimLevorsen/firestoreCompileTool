import { MemberExpressionCompiler } from ".";
import { DatabaseLocation, IdentifierCompiler, Scope } from "..";
import { Identifier } from "../../types";
import { MemberExpression } from "../../types/expressions";
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

export const MathExpressionCompiler = (
    input: MathExpression,
    scope: Scope
): string => {
    // We need to make sure both sides are numbers, then we can return
    const [left, right] = [input.left, input.right].map(i => {
        const clean = cleanUpInputs(i, scope);
        if (clean instanceof NumericLiteral)
            return NumericLiteralCompiler(clean);
        if (clean instanceof MathExpression)
            return MathExpressionCompiler(clean, scope);
        return clean.key;
    });
    return `${left} ${input.operator} ${right}`;
};

const cleanUpInputs = (
    input: ComparisonType,
    scope: Scope
): NumericLiteral | MathExpression | DatabaseLocation => {
    let root:
        | Literal
        | DatabaseLocation
        | ComparisonExpression
        | Identifier;
    if (input instanceof MemberExpression) {
        const extracted = MemberExpressionCompiler(input, scope);
        if (extracted instanceof Array) {
            if (extracted.length !== 1)
                throw new CompilerError(
                    input,
                    "Multi value objects cannot be used for comparisons"
                );
            root = extracted[0];
        } else root = extracted;
    } else root = input;
    let root2: Literal | DatabaseLocation | ComparisonExpression;
    if (root instanceof Identifier) {
        root2 = IdentifierCompiler(root, scope);
    } else root2 = root;
    if (root2 instanceof Literal) {
        if (root2 instanceof NumericLiteral) return root2;
        throw new CompilerError(
            input,
            "Can only compare numbers with numbers"
        );
    }
    if (root2 instanceof ComparisonExpression) {
        if (root2 instanceof MathExpression) return root2;
        throw new CompilerError(
            input,
            "Can not compare numbers and booleans"
        );
    }
    if (root2.castAs === undefined) return root2;
    if (root2.castAs instanceof InterfaceLiteral)
        throw new CompilerError(
            input,
            "Cannot compare interface with number"
        );
    if (root2.castAs.value === "number") return root2;
    throw new CompilerError(
        input,
        `Cannot use math expression with ${root2.castAs.value}`
    );
};
