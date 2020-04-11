import { Identifier } from "../../types";
import {
    ComparisonExpression,
    MemberExpression
} from "../../types/expressions/comparison";
import Literal, {
    BooleanLiteral,
    InterfaceLiteral
} from "../../types/literals";
import { IfStatement } from "../../types/statements";
import { DatabaseLocation } from "../Compiler";
import CompilerError from "../CompilerError";
import {
    ComparisonExpressionCompiler,
    MemberExpressionCompiler
} from "../expression";
import { IdentifierCompiler } from "../IdentifierCompiler";
import { BooleanLiteralCompiler } from "../literal/BooleanLiteralCompiler";
import { Scope } from "../scope";
import { BlockStatementCompiler } from "./BlockStatementCompiler";
import { OutsideFunctionDeclaration } from "../OutsideFunctionDeclaration";
import { CallExpression } from "../../types/expressions/CallExpression";
import { CallExpressionCompiler } from "../expression/CallExpressionCompiler";

export const IfStatementCompiler = (
    item: IfStatement,
    scope: Scope
): string => {
    /*
    This compilation operates on the priciple that
    if (a) {
        b
    } else c
    is logically equivalent to (a && b) || c
    */
    let test: string;
    // TODO: Add support for Identifiers/MemberExpressions as tests
    if (item.test instanceof BooleanLiteral) {
        test = BooleanLiteralCompiler(item.test);
    } else if (item.test instanceof ComparisonExpression) {
        test = ComparisonExpressionCompiler(item.test, scope);
    } else {
        let memFree:
            | Literal
            | DatabaseLocation
            | ComparisonExpression
            | Identifier;
        if (item.test instanceof MemberExpression) {
            const internal = MemberExpressionCompiler(
                item.test,
                scope
            );
            if (internal instanceof OutsideFunctionDeclaration)
                throw new CompilerError(
                    internal,
                    "Can only use boolean values as tests, not functions"
                );
            if (internal instanceof Array) {
                if (internal.length === 1) memFree = internal[0];
                else
                    throw new CompilerError(
                        item.test,
                        "Cannot use multiple values as boolean expression"
                    );
            } else memFree = internal;
        } else memFree = item.test;
        let identFree:
            | Literal
            | DatabaseLocation
            | CallExpression
            | ComparisonExpression;
        if (memFree instanceof Identifier) {
            identFree = IdentifierCompiler(memFree, scope);
        } else identFree = memFree;
        if (identFree instanceof Literal) {
            if (identFree instanceof BooleanLiteral)
                test = BooleanLiteralCompiler(identFree);
            else
                throw new CompilerError(
                    identFree,
                    "Can only use boolean values as sole comparison values"
                );
        } else if (identFree instanceof ComparisonExpression) {
            test = ComparisonExpressionCompiler(identFree, scope);
        } else if (identFree instanceof CallExpression) {
            test = CallExpressionCompiler(identFree, scope).value;
        } else {
            if (!identFree.castAs)
                test = identFree.needsDotData
                    ? `${identFree.key}.data`
                    : identFree.key;
            else if (identFree.castAs instanceof InterfaceLiteral)
                throw new CompilerError(
                    item.test,
                    "Cannot use interfaces as true/false comparison"
                );
            else if (identFree.castAs.value === "boolean")
                test = identFree.needsDotData
                    ? `${identFree.key}.data`
                    : identFree.key;
            else
                throw new CompilerError(
                    item.test,
                    "Can only use boolean values as if comparisons"
                );
        }
    }
    const consequent = BlockStatementCompiler(item.consequent, scope);
    if (item.alternate) {
        let alternate;
        if (item.alternate instanceof IfStatement) {
            alternate = IfStatementCompiler(item.alternate, scope);
        } else
            alternate = BlockStatementCompiler(item.alternate, scope);
        // Look in newLogic.md for explanation of logic
        // return `((${test} && (${consequent})) || ${alternate})`;
        if (consequent === "true") {
            // If the alternate is just "false", we ignore it
            if (alternate === "false") return `(${test})`;
            return `(${test}) || (${alternate})`;
        }
        if (consequent === "false") {
            // If both are false, we just return false
            if (alternate === "false") return `false`;
            if (alternate === "true") return `(!${test})`;
            return `(!(${test}) && ${alternate})`;
        }
        if (alternate === "false") {
            return `((${test}) && (${consequent}))`;
        }
        return `((${test}) ? (${consequent}) : ${alternate})`;
    }
    // If the consequent is just 'true' or 'false' we do something else
    if (consequent === "true") {
        return `(${test})`;
    }
    if (consequent === "false") {
        return `(!(${test}))`;
    }
    return `((${test}) ? (${consequent}) : false)`;
};
