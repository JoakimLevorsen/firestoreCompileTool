import { IdentifierCompiler, isDatabaseLocation, Scope } from "..";
import { IsExpression } from "../../types/expressions/comparison";
import Literal, { InterfaceLiteral } from "../../types/literals";
import CompilerError from "../CompilerError";
import LiteralCompiler from "../literal";
import { IdentifierMemberExtractor } from "../IdentifierMemberExtractor";

export const IsExpressionCompiler = (
    item: IsExpression,
    scope: Scope
) => {
    // First we make sure the Right value is an interfaceLiteral/interfaceValue
    const rightValue = extractRight(item, scope);
    // We now expect the Left value to be a DatabaseLocation or a literal.
    const leftValue = extractLeft(item, scope);
    // We can now use this to compile a comparison

    // The database key might need a .data, so we add it if needed
    const dataKey = leftValue.needsDotData
        ? `${leftValue.key}.data`
        : leftValue.key;

    return extractRules(rightValue, item.operator, dataKey, scope);
};

const extractRules = (
    from: InterfaceLiteral,
    opType: "is" | "only" | "isOnly",
    dataRef: string,
    scope: Scope
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
                        dataRef + k,
                        scope
                    );
                }
                // Since only an InterfaceLiteral returns a nonString, we just typecast the return
                return LiteralCompiler(literal) as string;
            });
        rule += `&& (${values
            .map(v => `${dataRef}.${k} is ${v}`)
            .reduce((pV, v) => `${pV} && ${v}`)})`;
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
                        dataRef + k,
                        scope
                    );
                }
                // Since only an InterfaceLiteral returns a nonString, we just typecast the return
                return LiteralCompiler(literal) as string;
            });
        rule += `&& (${values
            .map(
                v =>
                    `(!('${k}' in ${dataRef}) || ${dataRef}.${k} is ${v})`
            )
            .reduce((pV, v) => `${pV} && ${v}`)})`;
    });
    return rule;
};

const extractRight = (item: IsExpression, scope: Scope) => {
    const right = IdentifierMemberExtractor(item.right, scope);
    if (right instanceof InterfaceLiteral) return right;
    else
        throw new CompilerError(
            item.right,
            `An ${item.operator} operation can only be performed with an InterfaceLiteral as the right value`
        );
};

const extractLeft = (item: IsExpression, scope: Scope) => {
    const left = IdentifierMemberExtractor(item.left, scope);
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
