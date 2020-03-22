import {
    BlockStatement,
    ConstStatement,
    InterfaceStatement,
    ReturnStatement
} from "../../types/statements";
import CompilerError from "../CompilerError";
import { Scope } from "../scope";
import { ConstStatementCompiler } from "./ConstStatementCompiler";
import { IfStatementCompiler } from "./IfStatementCompiler";
import { InterfaceStatementCompiler } from "./InterfaceStatementCompiler";
import { ReturnStatementCompiler } from "./ReturnStatementCompiler";

export const BlockStatementCompiler = (
    item: BlockStatement,
    parentScope: Scope
): string => {
    let newScope = { ...parentScope };
    const { body } = item;
    // Now we go through all the lines, and return when we get to a return statement. If we get an if statement, we append them by ||'ing them together, unless it has an else expression
    const textVals: string[] = [];
    for (const line of body) {
        if (line instanceof ReturnStatement) {
            textVals.push(ReturnStatementCompiler(line, newScope));
            return `${textVals.reduce((pV, v) => `${pV} || ${v}`)}`;
        }
        if (line instanceof ConstStatement) {
            const { scope } = ConstStatementCompiler(line, newScope);
            newScope = scope;
        } else if (line instanceof InterfaceStatement) {
            const { scope } = InterfaceStatementCompiler(
                line,
                newScope
            );
            newScope = scope;
        } else {
            if (line.allPathsReturn) {
                const compiled = IfStatementCompiler(line, newScope);
                textVals.push(compiled);
                return `${textVals.reduce(
                    (pV, v) => `${pV} || ${v}`
                )}`;
            } else {
                textVals.push(IfStatementCompiler(line, newScope));
            }
        }
    }
    throw new CompilerError(
        item,
        "This block does not return for all paths"
    );
};
