import Identifier from "../parser/types/Identifier";
import CompilerError from "./CompilerError";
import { Scope } from "./Scope";

export const IdentifierCompiler = (
    item: Identifier,
    scope: Scope
) => {
    let result = scope[item.name];
    if (!result)
        throw new CompilerError(item, "Could not find Identifier");
    while (result instanceof Identifier) {
        result = scope[result.name];
        if (!result)
            throw new CompilerError(
                result,
                "Could not find Identifier"
            );
    }
    return result;
};
