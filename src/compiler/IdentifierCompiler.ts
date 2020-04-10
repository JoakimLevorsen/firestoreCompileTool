import { Identifier } from "../types";
import CompilerError from "./CompilerError";
import { Scope } from "./scope";

export const IdentifierCompiler = (
    item: Identifier,
    scope: Scope
) => {
    let result = scope[item.name];
    if (!result)
        throw new CompilerError(
            item,
            `Could not find Identifier ${JSON.stringify(
                Object.keys(scope)
            )}`
        );
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
