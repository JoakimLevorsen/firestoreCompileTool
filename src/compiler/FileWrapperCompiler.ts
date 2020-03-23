import { FileWrapper } from "../types";
import {
    ConstStatement,
    InterfaceStatement,
    MatchStatement
} from "../types/statements";
import { intitialScope } from "./scope";
import { ConstStatementCompiler } from "./statement/ConstStatementCompiler";
import { InterfaceStatementCompiler } from "./statement/InterfaceStatementCompiler";
import { MatchStatementCompiler } from "./statement/MatchStatementCompiler";

const fileHeader = `rules_version = '2';\n service cloud.firestore { \n match /databases/{database}/documents {`;

const fileFooter = `} \n }`;

export const FileWrapperCompiler = (wrapper: FileWrapper): string => {
    let scope = intitialScope;
    // To preserve the references, we start with constants and interfaces
    wrapper.content
        .filter(c => c instanceof InterfaceStatement)
        .forEach(c => {
            const { scope: s } = InterfaceStatementCompiler(
                c as InterfaceStatement,
                scope
            );
            scope = s;
        });
    wrapper.content
        .filter(c => c instanceof ConstStatement)
        .forEach(c => {
            const { scope: s } = ConstStatementCompiler(
                c as ConstStatement,
                scope
            );
            scope = s;
        });

    const body = wrapper.content
        .filter(c => c instanceof MatchStatement)
        .map(m => MatchStatementCompiler(m as MatchStatement, scope))
        .reduce((pV, v) => `${pV}\n${v}`);
    return `${fileHeader}\n${body}\n${fileFooter}`;
};
