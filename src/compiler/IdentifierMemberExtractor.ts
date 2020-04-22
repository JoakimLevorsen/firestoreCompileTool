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
import OptionalDependecyTracker from "./OptionalDependencyTracker";

export const IdentifierMemberExtractor = <S extends SyntaxComponent>(
    input: Identifier | MemberExpression | S,
    scope: Scope,
    optionalChecks: OptionalDependecyTracker
):
    | Literal
    | DatabaseLocation
    | ComparisonExpression
    | CallExpression
    | OutsideFunctionDeclaration
    | S => {
    if (input instanceof MemberExpression) {
        const x = MemberExpressionCompiler(
            input,
            scope,
            optionalChecks
        );
        if (x instanceof Array) {
            if (x.length === 1) {
                if (x[0] instanceof Identifier) {
                    const stored = IdentifierCompiler(x[0], scope);
                    optionalChecks.cloneDepsFrom(
                        stored.optionalChecks
                    );
                    return stored.value;
                } else return x[0];
            } else
                throw new CompilerError(
                    input,
                    "Item has multiple values"
                );
        }
        return x;
    }
    if (input instanceof Identifier) {
        const stored = IdentifierCompiler(input, scope);
        optionalChecks.cloneDepsFrom(stored.optionalChecks);
        return stored.value;
    }
    return input;
};
