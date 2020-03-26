import {
    ComparisonExpression,
    EqualityExpression,
    IsExpression,
    LogicalExpression,
    MathExpression,
    OrderExpression
} from "../../types/expressions/comparison";
import { Scope } from "../scope";
import { EqualityExpressionCompiler } from "./EqualityExpressionCompiler";
import { ExpressionCompiler } from "./ExpressionCompiler";
import { IsExpressionCompiler } from "./IsExpressionCompiler";
import { LogicalExpressionCompiler } from "./LogicalExpressionCompiler";
import { MathExpressionCompiler } from "./MathExpressionCompiler";
import { MemberExpressionCompiler } from "./MemberExpressionCompiler";
import { OrderExpressionCompiler } from "./OrderExpressionCompiler";
import { InExpression } from "../../types/expressions/comparison/InExpression";
import { InExpressionCompiler } from "./InExpressionCompiler";

export const ComparisonExpressionCompiler = (
    input: ComparisonExpression,
    scope: Scope
) => {
    if (input instanceof LogicalExpression)
        return LogicalExpressionCompiler(input, scope);
    if (input instanceof IsExpression)
        return IsExpressionCompiler(input, scope);
    if (input instanceof EqualityExpression)
        return EqualityExpressionCompiler(input, scope);
    if (input instanceof OrderExpression)
        return OrderExpressionCompiler(input, scope);
    if (input instanceof MathExpression)
        return MathExpressionCompiler(input, scope);
    if (input instanceof InExpression)
        return InExpressionCompiler(input, scope);
    throw new Error("Internal error");
};

export {
    EqualityExpressionCompiler,
    ExpressionCompiler,
    IsExpressionCompiler,
    LogicalExpressionCompiler,
    MathExpressionCompiler,
    MemberExpressionCompiler,
    OrderExpressionCompiler
};
