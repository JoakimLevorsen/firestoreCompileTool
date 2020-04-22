import {
    InExpression,
    InOperator
} from "../../types/expressions/comparison/InExpression";
import { Scope } from "../scope";
import { IdentifierMemberExtractor } from "../IdentifierMemberExtractor";
import { isDatabaseLocation } from "../Compiler";
import CompilerError from "../CompilerError";
import {
    TypeLiteral,
    InterfaceLiteral,
    StringLiteral
} from "../../types/literals";
import { OutsideFunctionDeclaration } from "../OutsideFunctionDeclaration";
import { CallExpression } from "../../types/expressions/CallExpression";
import { CallExpressionCompiler } from "./CallExpressionCompiler";
import { ComparisonExpression } from "../../types/expressions/comparison";
import { ComparisonExpressionCompiler } from ".";
import { NonTypeLiteralCompiler } from "../literal";
import OptionalDependecyTracker from "../OptionalDependencyTracker";

export const InExpressionCompiler = (
    item: InExpression,
    scope: Scope
): string => {
    const optionals = new OptionalDependecyTracker();
    const [left, right] = [item.left, item.right].map(i =>
        IdentifierMemberExtractor(i, scope, optionals)
    );
    // We verify the right one is an array
    if (!isDatabaseLocation(right))
        throw new CompilerError(
            right,
            "Expected Array/Map value for in expression"
        );
    const rightC = right.needsDotData
        ? `${right.key}.data`
        : right.key;
    // Check the cast
    if (
        right.castAs instanceof TypeLiteral &&
        (right.castAs.value === "Map" ||
            right.castAs.value === "Array")
    )
        throw new CompilerError(
            item.right,
            "Expected Array/Map value for in expression"
        );
    // Then we just assume it's fine
    if (isDatabaseLocation(left)) {
        return getOutput(
            left.needsDotData ? `${left.key}.data` : left.key,
            rightC,
            item.operator,
            optionals
        );
    }
    if (left instanceof OutsideFunctionDeclaration)
        throw new CompilerError(left, "Cannot use function referece");
    if (left instanceof CallExpression) {
        return getOutput(
            CallExpressionCompiler(left, scope, optionals).value,
            rightC,
            item.operator,
            optionals
        );
    }
    if (left instanceof ComparisonExpression) {
        return getOutput(
            ComparisonExpressionCompiler(left, scope, optionals),
            rightC,
            item.operator,
            optionals
        );
    }
    if (
        left instanceof TypeLiteral ||
        left instanceof InterfaceLiteral
    )
        throw new CompilerError(
            left,
            "Cannot use type/interface in in expression"
        );
    return getOutput(
        NonTypeLiteralCompiler(left as StringLiteral),
        rightC,
        item.operator,
        optionals
    );
};

const getOutput = (
    left: string,
    right: string,
    operator: InOperator,
    optionals: OptionalDependecyTracker
) =>
    optionals.export()
        ? operator === "in"
            ? `(${optionals.export()} && ${left} in ${right})`
            : `(${optionals.export()} && !(${left} in ${right}))`
        : operator === "in"
        ? `${left} in ${right}`
        : `!(${left} in ${right})`;
