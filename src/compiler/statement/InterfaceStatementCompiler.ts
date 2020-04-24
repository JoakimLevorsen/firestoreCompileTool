import { InterfaceStatement } from "../../types/statements";
import { Compiler } from "../Compiler";
import CompilerError from "../CompilerError";
import { IdentifierCompiler } from "../IdentifierCompiler";
import { InterfaceLiteral } from "../../types/literals";

export const InterfaceStatementCompiler: Compiler<InterfaceStatement> = (
    item,
    scope
) => {
    if (scope[item.name])
        throw new CompilerError(
            item,
            `Cannot override ${item.name} already in scope`
        );
    const subject = item.content;
    // Now we get potential extensions
    const xtensions = item.extensions.map(x => {
        const iden = IdentifierCompiler(x, scope);
        if (iden.value instanceof InterfaceLiteral) return iden.value;
        throw new CompilerError(
            x,
            "Value not found, or not a interface"
        );
    });
    for (const i of xtensions) subject.extendWith(i);

    scope[item.name] = { value: subject };
    return { scope };
};
