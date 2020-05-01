import { IdentifierCompiler, isDatabaseLocation, Scope } from "..";
import { IsExpression } from "../../types/expressions/comparison";
import Literal, {
    InterfaceLiteral,
    TypeLiteral
} from "../../types/literals";
import CompilerError from "../CompilerError";
import LiteralCompiler from "../literal";
import { IdentifierMemberExtractor } from "../IdentifierMemberExtractor";
import { TypeLiteralCompiler } from "../literal/TypeLiteralCompiler";
import OptionalDependecyTracker from "../OptionalDependencyTracker";

export const IsExpressionCompiler = (
    item: IsExpression,
    scope: Scope
) => {
    const optionals = new OptionalDependecyTracker();
    // First we make sure the Right value is an interfaceLiteral/interfaceValue/typeLiteral
    const rightValue = extractRight(item, scope, optionals);
    // We now expect the Left value to be a DatabaseLocation or a literal.
    const leftValue = extractLeft(item, scope, optionals);
    // We can now use this to compile a comparison

    // The database key might need a .data, so we add it if needed
    const dataKey = leftValue.needsDotData
        ? `${leftValue.key}.data`
        : leftValue.key;
    if (rightValue instanceof TypeLiteral) {
        // types are only valid with is expressions
        if (item.operator !== "is")
            throw new CompilerError(
                rightValue,
                "Types can only be compared using the is expression"
            );
        return `${dataKey} is ${TypeLiteralCompiler(rightValue)}`;
    }
    return extractRules(
        rightValue,
        item.operator,
        dataKey,
        scope,
        optionals
    );
};

const extractRules = (
    from: InterfaceLiteral,
    opType: "is" | "only" | "isOnly",
    dataRef: string,
    scope: Scope,
    optionals?: OptionalDependecyTracker
): string => {
    let header: string;
    const keys = Array.from(from.value.keys());
    const optionalKeys = Array.from(from.optionals.keys());
    switch (opType) {
        case "is":
            header = createIsHeader(keys, dataRef);
            break;
        case "isOnly":
            header = createIsOnlyHeader(keys, optionalKeys, dataRef);
            break;
        case "only":
            header = createOnlyHeader(keys, optionalKeys, dataRef);
            break;
    }
    // We now assemble the meat of the comparison.
    let rule = header;
    from.value.forEach((rawValues, k) => {
        // First we remove all the Identifiers
        const values = rawValues
            .map(type => {
                if (type instanceof Literal) return type;
                const extracted = IdentifierCompiler(type, scope);
                if (extracted instanceof Literal) return extracted;
                throw new CompilerError(
                    type,
                    `Expected Literal value for ${opType} operation`
                );
            })
            .map(literal => {
                if (literal instanceof InterfaceLiteral) {
                    return extractRules(
                        literal,
                        opType,
                        `${dataRef}.${k}`,
                        scope
                    );
                }
                if (literal instanceof TypeLiteral) {
                    return {
                        value: LiteralCompiler(literal),
                        type: "value"
                    };
                }
                // Since only an InterfaceLiteral returns a nonString, we just typecast the return
                return LiteralCompiler(literal) as string;
            });
        rule += `&& (${values
            .map(v => {
                if (typeof v !== "string") {
                    return `${dataRef}.${k} is ${v.value}`;
                }
                // TODO: Make this better
                if (/(&&|\|\|)/.test(v)) {
                    return `(${v})`;
                }
                return `${dataRef}.${k} == ${v}`;
            })
            .reduce((pV, v) => `${pV} || ${v}`)})`;
    });
    from.optionals.forEach((rawValues, k) => {
        // First we remove all the Identifiers
        const values = rawValues
            .map(type => {
                if (type instanceof Literal) return type;
                const extracted = IdentifierCompiler(type, scope);
                if (extracted instanceof Literal) return extracted;
                throw new CompilerError(
                    type,
                    `Expected Literal value for ${opType} operation`
                );
            })
            .map(literal => {
                if (literal instanceof InterfaceLiteral) {
                    return extractRules(
                        literal,
                        opType,
                        `${dataRef}.${k}`,
                        scope
                    );
                }
                if (literal instanceof TypeLiteral) {
                    return {
                        value: LiteralCompiler(literal),
                        type: "value"
                    };
                }
                // Since only an InterfaceLiteral returns a nonString, we just typecast the return
                return LiteralCompiler(literal) as string;
            });
        rule += `&& (${values
            .map(
                v =>
                    `(!('${k}' in ${dataRef}) || ${dataRef}.${k} ${
                        typeof v === "string" ? "==" : "is"
                    } ${typeof v === "string" ? v : v.value})`
            )
            .reduce((pV, v) => `${pV} || ${v}`)})`;
    });
    // If we have optionals we return slightly different rules
    return optionals?.export(rule) ?? rule;
};

const extractRight = (
    item: IsExpression,
    scope: Scope,
    optionals: OptionalDependecyTracker
) => {
    const right = IdentifierMemberExtractor(
        item.right,
        scope,
        optionals
    );
    if (
        right instanceof InterfaceLiteral ||
        right instanceof TypeLiteral
    )
        return right;
    else
        throw new CompilerError(
            item.right,
            `An ${item.operator} operation can only be performed with an InterfaceLiteral as the right value`
        );
};

const extractLeft = (
    item: IsExpression,
    scope: Scope,
    optionals: OptionalDependecyTracker
) => {
    const left = IdentifierMemberExtractor(
        item.left,
        scope,
        optionals
    );
    if (isDatabaseLocation(left)) {
        return left;
    } else
        throw new CompilerError(
            item.left,
            `The left side of an ${item.operator} expression should be a reference to the database, otherwise it does not change for any document.`
        );
};

const createIsHeader = (keys: string[], docRef: string) =>
    `${docRef}.keys().hasAll([${keys
        .map(k => `'${k}'`)
        .reduce((pV, v) => `${pV},${v}`)}])`;

const createOnlyHeader = (
    keys: string[],
    optionalKeys: string[],
    docRef: string
) =>
    `${docRef}.keys().hasOnly([${[...keys, ...optionalKeys]
        .map(k => `'${k}'`)
        .reduce((pV, v) => `${pV},${v}`)}])`;

const createIsOnlyHeader = (
    keys: string[],
    optionalKeys: string[],
    docRef: string
) =>
    `${createIsHeader(keys, docRef)} && ${createOnlyHeader(
        keys,
        optionalKeys,
        docRef
    )}`;
