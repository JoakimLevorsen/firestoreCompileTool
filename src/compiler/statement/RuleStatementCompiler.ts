import { BlockStatementCompiler } from ".";
import { IdentifierCompiler, isDatabaseLocation, Scope } from "..";
import { ComparisonExpression } from "../../types/expressions/comparison";
import Literal, {
    BooleanLiteral,
    TypeLiteral
} from "../../types/literals";
import {
    BlockStatement,
    RuleStatement
} from "../../types/statements";
import CompilerError from "../CompilerError";
import {
    ComparisonExpressionCompiler,
    MemberExpressionCompiler
} from "../expression";
import { NonTypeLiteralCompiler } from "../literal";
import { BooleanLiteralCompiler } from "../literal/BooleanLiteralCompiler";
import { OutsideFunctionDeclaration } from "../OutsideFunctionDeclaration";
import { CallExpression } from "../../types/expressions/CallExpression";
import { CallExpressionCompiler } from "../expression/CallExpressionCompiler";

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
    const extracted = MemberExpressionCompiler(rule, scope);
    if (extracted instanceof Literal) {
        if (extracted instanceof BooleanLiteral)
            return BooleanLiteralCompiler(extracted);
        throw new CompilerError(
            extracted,
            "Can only return boolean values"
        );
    }
    if (isDatabaseLocation(extracted)) {
        if (extracted.castAs) {
            if (
                extracted.castAs instanceof TypeLiteral &&
                extracted.castAs.value === "boolean"
            )
                return extracted.key;
            throw new CompilerError(
                rule,
                "Can only return boolean values"
            );
        }
        return extracted.key;
    }
    if (extracted instanceof OutsideFunctionDeclaration)
        throw new CompilerError(
            extracted,
            "Cannot use function as a return value, it must be a boolean"
        );
    if (extracted.length !== 1)
        return "Can not return multiple types";
    const v = extracted[0];
    if (v instanceof Literal) {
        if (v instanceof BooleanLiteral)
            return BooleanLiteralCompiler(v);
        throw new CompilerError(v, "Can only return multiple values");
    }
    const deepExtracted = IdentifierCompiler(v, scope);
    if (deepExtracted instanceof Literal) {
        if (!(deepExtracted instanceof BooleanLiteral))
            throw new CompilerError(
                deepExtracted,
                "Can only return boolean values"
            );
        return NonTypeLiteralCompiler(deepExtracted);
    }
    if (deepExtracted instanceof CallExpression) {
        return CallExpressionCompiler(deepExtracted, scope).value;
    }
    if (deepExtracted instanceof ComparisonExpression)
        return ComparisonExpressionCompiler(deepExtracted, scope);
    return deepExtracted.key;
};
