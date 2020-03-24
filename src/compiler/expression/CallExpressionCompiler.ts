import { Scope } from "../scope";
import { CallExpression } from "../../types/expressions/CallExpression";
import { IdentifierMemberExtractor } from "../IdentifierMemberExtractor";
import { OutsideFunctionDeclaration } from "../OutsideFunctionDeclaration";
import CompilerError from "../CompilerError";
import Literal, {
    TypeLiteral,
    InterfaceLiteral,
    StringLiteral
} from "../../types/literals";
import { NonTypeLiteralCompiler } from "../literal";
import { ValueType } from "../../types";
import { isDatabaseLocation } from "../Compiler";

export const CallExpressionCompiler = (
    input: CallExpression,
    scope: Scope
): { value: string; returnType: ValueType } => {
    const target = IdentifierMemberExtractor(input.target, scope);
    if (!(target instanceof OutsideFunctionDeclaration))
        throw new CompilerError(
            input.target,
            "Cannot execute non function"
        );
    // TODO, check parameters match
    const stringParams = input.arguments.map(a => {
        let litVal: Literal;
        if (!(a instanceof Literal)) {
            const x = IdentifierMemberExtractor(a, scope);
            if (!(x instanceof Literal))
                throw new CompilerError(
                    a,
                    "Can currently only use literals for function parameters"
                );
            litVal = x;
        } else litVal = a;
        if (
            litVal instanceof TypeLiteral ||
            litVal instanceof InterfaceLiteral
        )
            throw new CompilerError(
                litVal,
                "Cannot use type/interface as parameter"
            );
        return NonTypeLiteralCompiler(litVal as StringLiteral);
    });

    // First we get the literal we were called on
    const callee = IdentifierMemberExtractor(target.callee!, scope);
    if (
        callee instanceof InterfaceLiteral ||
        callee instanceof TypeLiteral
    )
        throw new CompilerError(callee, "Internal error");
    let value: string;
    if (callee instanceof Literal) {
        value = `${NonTypeLiteralCompiler(callee as StringLiteral)}.${
            target.name
        }(${stringParams.reduce(
            (pV, v) => (pV === "" ? v : `${pV}, ${v}`),
            ""
        )})`;
    } else if (isDatabaseLocation(callee)) {
        value = `${callee.key}.${target.name}(${stringParams.reduce(
            (pV, v) => (pV === "" ? v : `${pV}, ${v}`),
            ""
        )})`;
    } else throw new Error("TODO");
    const { returnType } = target;

    return { value, returnType };
};