import {
    ComparisonExpression,
    EqualityExpression,
    IsExpression,
    LogicalExpression,
    MathExpression,
    OrderExpression
} from "../../types/expressions/comparison";
import { Scope } from "../Scope";
import { EqualityExpressionCompiler } from "./EqualityExpressionCompiler";
import { ExpressionCompiler } from "./ExpressionCompiler";
import { IsExpressionCompiler } from "./IsExpressionCompiler";
import { LogicalExpressionCompiler } from "./LogicalExpressionCompiler";
import { MathExpressionCompiler } from "./MathExpressionCompiler";
import { MemberExpressionCompiler } from "./MemberExpressionCompiler";
import { OrderExpressionCompiler } from "./OrderExpressionCompiler";

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
