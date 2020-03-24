import { BlockStatementCompiler } from ".";
import { isDatabaseLocation, Scope } from "..";
import {
    ComparisonExpression,
    MemberExpression
} from "../../types/expressions/comparison";
import Literal, {
    BooleanLiteral,
    TypeLiteral
} from "../../types/literals";
import {
    BlockStatement,
    RuleStatement
} from "../../types/statements";
import CompilerError from "../CompilerError";
import { ComparisonExpressionCompiler } from "../expression";
import { NonTypeLiteralCompiler } from "../literal";
import { BooleanLiteralCompiler } from "../literal/BooleanLiteralCompiler";
import { OutsideFunctionDeclaration } from "../OutsideFunctionDeclaration";
import { CallExpression } from "../../types/expressions/CallExpression";
import { CallExpressionCompiler } from "../expression/CallExpressionCompiler";
import { IdentifierMemberExtractor } from "../IdentifierMemberExtractor";

export const RuleStatementCompiler = (
    item: RuleStatement,
    scope: Scope
): string => {
    const types = item.headers.reduce(
        (pV, v) => (pV === "" ? v : `${pV}, ${v}`),
        ""
    );
    // We inject the params into the scope
    const newScope = { ...scope };
    if (item.params.newDoc) {
        if (newScope[item.params.newDoc])
            throw new CompilerError(
                item,
                `A constant with the name ${item.params.newDoc} already exists`
            );
        newScope[item.params.newDoc] = {
            key: "request.resource",
            needsDotData: true
        };
    }
    if (item.params.oldDoc) {
        if (newScope[item.params.oldDoc])
            throw new CompilerError(
                item,
                `A constant with the name ${item.params.oldDoc} already exists`
            );
        newScope[item.params.oldDoc] = {
            key: "resource",
            needsDotData: true
        };
    }
    const content = extractRule(item.rule, newScope);
    return `allow ${types}: if ${content};`;
};

const extractRule = (
    rule: RuleStatement["rule"],
    scope: Scope
): string => {
    if (rule instanceof BlockStatement) {
        return BlockStatementCompiler(rule, scope);
    }
    if (rule instanceof BooleanLiteral) {
        return NonTypeLiteralCompiler(rule);
    }
    if (rule instanceof ComparisonExpression) {
        return ComparisonExpressionCompiler(rule, scope);
    }
    const safe = IdentifierMemberExtractor(rule, scope);
    if (safe instanceof MemberExpression) {
        throw new Error("This will literally never happen");
    }
    if (safe instanceof Literal) {
        if (safe instanceof BooleanLiteral)
            return BooleanLiteralCompiler(safe);
        throw new CompilerError(
            safe,
            "Can only return boolean values"
        );
    }
    if (isDatabaseLocation(safe)) {
        if (safe.castAs) {
            if (
                safe.castAs instanceof TypeLiteral &&
                safe.castAs.value === "boolean"
            )
                return safe.key;
            throw new CompilerError(
                rule,
                "Can only return boolean values"
            );
        }
        return safe.key;
    }
    if (safe instanceof OutsideFunctionDeclaration)
        throw new CompilerError(
            safe,
            "Cannot use function as a return value, it must be a boolean"
        );
    if (safe instanceof CallExpression) {
        return CallExpressionCompiler(safe, scope).value;
    }
    if (safe instanceof ComparisonExpression)
        return ComparisonExpressionCompiler(safe, scope);
    throw new Error("Did not expect this to happen");
};
