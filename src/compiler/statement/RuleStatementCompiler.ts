import { ComparisonExpression } from "../../parser/types/expressions";
import Literal, {
    BooleanLiteral,
    TypeLiteral
} from "../../parser/types/literal";
import {
    BlockStatement,
    RuleStatement
} from "../../parser/types/statements";
import { isDatabaseLocation } from "../Compiler";
import CompilerError from "../CompilerError";
import { ComparisonExpressionCompiler } from "../expression";
import { MemberExpressionCompiler } from "../expression/MemberExpressionCompiler";
import { IdentifierCompiler } from "../IdentifierCompiler";
import { NonTypeLiteralCompiler } from "../literal";
import { BooleanLiteralCompiler } from "../literal/BooleanLiteralCompiler";
import { Scope } from "../Scope";
import { BlockStatementCompiler } from "./BlockStatementCompiler";

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
    if (deepExtracted instanceof ComparisonExpression)
        return ComparisonExpressionCompiler(deepExtracted, scope);
    return deepExtracted.key;
};
