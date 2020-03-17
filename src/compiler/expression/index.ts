import {
    ComparisonExpression,
    EqualityExpression,
    IsExpression,
    LogicalExpression,
    MathExpression,
    OrderExpression
} from "../../parser/types/expressions";
import { Scope } from "../Scope";
import { EqualityExpressionCompiler } from "./EqualityExpressionCompiler";
import { IsExpressionCompiler } from "./IsExpressionCompiler";
import { LogicalExpressionCompiler } from "./LogicalExpressionCompiler";
import { MathExpressionCompiler } from "./MathExpressionCompiler";
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
    LogicalExpressionCompiler,
    IsExpressionCompiler,
    EqualityExpressionCompiler
};
