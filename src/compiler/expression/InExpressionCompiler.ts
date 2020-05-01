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
    const leftOps = new OptionalDependecyTracker();
    const rightOps = new OptionalDependecyTracker();
    const [left, right] = [item.left, item.right].map((l, i) =>
        IdentifierMemberExtractor(
            l,
            scope,
            i === 0 ? leftOps : rightOps
        )
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
            leftOps,
            rightOps
        );
    }
    if (left instanceof OutsideFunctionDeclaration)
        throw new CompilerError(left, "Cannot use function referece");
    if (left instanceof CallExpression) {
        return getOutput(
            CallExpressionCompiler(left, scope, leftOps).value,
            rightC,
            item.operator,
            leftOps,
            rightOps
        );
    }
    if (left instanceof ComparisonExpression) {
        return getOutput(
            ComparisonExpressionCompiler(left, scope, leftOps),
            rightC,
            item.operator,
            leftOps,
            rightOps
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
        leftOps,
        rightOps
    );
};

const getOutput = (
    left: string,
    right: string,
    operator: InOperator,
    leftOps: OptionalDependecyTracker,
    rightOps: OptionalDependecyTracker
) =>
    // If this is an inn't expression, it's okay the optionals fail
    `(${leftOps.export(left)} != null) ${
        operator === "in" ? "&&" : "||"
    } (${rightOps.export(right)}) ${
        operator === "in" ? "&&" : "||"
    } ${
        operator === "in"
            ? `${left} in ${right}`
            : `!(${left} in ${right})`
    }`;
