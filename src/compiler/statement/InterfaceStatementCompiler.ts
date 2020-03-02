import { InterfaceStatement } from "../../parser/types/statements";
import { Compiler } from "../Compiler";
import CompilerError from "../CompilerError";

export const InterfaceStatementCompiler: Compiler<InterfaceStatement> = (
    item,
    scope
) => {
    if (scope[item.name])
        throw new CompilerError(
            item,
            `Cannot override ${item.name} already in scope`
        );
    scope[item.name] = item.content;
    return { scope };
};
