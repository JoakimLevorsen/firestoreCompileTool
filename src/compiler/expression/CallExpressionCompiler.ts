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
import { AllLiteralFunctions } from "../scope/literalFunctions";

export const CallExpressionCompiler = (
    input: CallExpression,
    scope: Scope
): { value: string; returnType: ValueType } => {
    const target = IdentifierMemberExtractor(input.target, scope);
    if (
        !(
            target instanceof OutsideFunctionDeclaration ||
            isDatabaseLocation(target)
        )
    )
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

    if (isDatabaseLocation(target)) {
        // TODO do better
        const functionName = target.key.match(
            /\.(?!data)(\w*)$/
        )?.[1];
        if (!functionName)
            throw new CompilerError(input, "Method not found");
        const functionMatch = AllLiteralFunctions[functionName];
        if (!functionMatch)
            throw new CompilerError(input, "Method not found");
        return {
            value: `${
                target.needsDotData
                    ? `${target.key}.data`
                    : target.key
            }(${stringParams.reduce(
                (pV, v) => (pV === "" ? v : `${pV}, ${v}`),
                ""
            )})`,
            returnType: functionMatch.returnType
        };
    }
    // First we get the literal we were called on
    const callee = isDatabaseLocation(target.callee)
        ? target.callee
        : IdentifierMemberExtractor(target.callee!, scope);
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
