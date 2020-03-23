import { Identifier } from "../types";
import { MemberExpression } from "../types/expressions";
import { IdentifierCompiler } from "./IdentifierCompiler";
import { Scope } from "./scope";
import { MemberExpressionCompiler } from "./expression";
import CompilerError from "./CompilerError";
import Literal from "../types/literals";
import { DatabaseLocation } from "./Compiler";
import { OutsideFunctionDeclaration } from "./OutsideFunctionDeclaration";
import SyntaxComponent from "../types/SyntaxComponent";
import { ComparisonExpression } from "../types/expressions/comparison";
import { CallExpression } from "../types/expressions/CallExpression";

export const IdentifierMemberExtractor = <S extends SyntaxComponent>(
    input: Identifier | MemberExpression | S,
    scope: Scope
):
    | Literal
    | DatabaseLocation
    | ComparisonExpression
    | CallExpression
    | OutsideFunctionDeclaration
    | S => {
    if (input instanceof MemberExpression) {
        const x = MemberExpressionCompiler(input, scope);
        if (x instanceof Array) {
            if (x.length === 1) {
                if (x[0] instanceof Identifier)
                    return IdentifierCompiler(x[0], scope);
                else return x[0];
            } else
                throw new CompilerError(
                    input,
                    "Item has multiple values"
                );
        }
        return x;
    }
    if (input instanceof Identifier) {
        return IdentifierCompiler(input, scope);
    }
    return input;
};
