import {
    ComparisonExpression,
    MemberExpression
} from "../../parser/types/expressions";
import Identifier from "../../parser/types/Identifier";
import Literal, {
    BooleanLiteral,
    InterfaceLiteral,
    NumericLiteral,
    StringLiteral,
    TypeLiteral
} from "../../parser/types/literal";
import { DatabaseLocation } from "../Compiler";
import CompilerError from "../CompilerError";
import { IdentifierCompiler } from "../IdentifierCompiler";
import { Scope } from "../Scope";

export const MemberExpressionCompiler = (
    item: MemberExpression,
    scope: Scope
): Literal | DatabaseLocation | Array<Literal | Identifier> => {
    let root:
        | Literal
        | Identifier
        | ReturnType<typeof MemberExpressionCompiler>;
    if (item.object instanceof MemberExpression) {
        root = MemberExpressionCompiler(item.object, scope);
    } else root = item.object;
    let root2: Literal | ReturnType<typeof MemberExpressionCompiler>;
    if (root instanceof Identifier) {
        const extracted = IdentifierCompiler(root, scope);
        // Since this is a member expression, we can discard all comparisons so it fits in idRoot
        if (extracted instanceof ComparisonExpression)
            throw new CompilerError(
                root,
                "Cannot access property of comparison"
            );
        root2 = extracted;
    } else root2 = root;
    let root3: Literal | DatabaseLocation;
    if (root2 instanceof Array) {
        // This means we might have multiple values, if only one is present we extract it
        if (root2.length !== 1)
            throw new CompilerError(
                item.object,
                "Cannot find member of a collection of multiple types"
            );
        const v = root2[0];
        if (v instanceof Identifier) {
            const extracted = IdentifierCompiler(v, scope);
            // Since this is a member expression, we can discard all comparisons so it fits in idRoot
            if (extracted instanceof ComparisonExpression)
                throw new CompilerError(
                    v,
                    "Cannot access property of comparison"
                );
            root3 = extracted;
        } else root3 = v;
    } else root3 = root2;
    let root4: InterfaceLiteral | DatabaseLocation;
    if (root3 instanceof Literal) {
        if (root3 instanceof InterfaceLiteral) {
            root4 = root3;
        } else
            throw new CompilerError(
                root3,
                "Members of Literals of non interfaces don't exist yet."
            );
    } else root4 = root3;
    // Now we have the object ready to find the child of.
    // If this expression isn't computed it's easy
    if (!item.computed) {
        // This means the property is a string, but saved in an Identifier
        const propName = (item.property as Identifier).name;
        return extractValueForProperty(
            root4,
            item.optional,
            propName,
            item
        );
    } else {
        // This means we have to extract the property
        const prop = extractProperty(item.property, scope);
        return extractValueForProperty(
            root4,
            item.optional,
            prop,
            item
        );
    }
};

const extractValueForProperty = (
    object: InterfaceLiteral | DatabaseLocation,
    optional: boolean,
    key: ReturnType<typeof extractProperty>,
    item: MemberExpression
) => {
    if (typeof key === "number")
        throw new CompilerError(
            item,
            "Due to a temporary coding issue, number keys are not supported"
        );
    if (typeof key === "string") {
        if (object instanceof InterfaceLiteral) {
            if (optional) {
                if (object.optionals.has(key))
                    return object.optionals.get(key)!;
            }
            if (object.value.has(key)) return object.value.get(key)!;
            throw new CompilerError(
                object,
                `This interface does not have the key ${key}`
            );
        }
        // Since this DatabaseLocation is passed by ref, we clone it to preserve the origial
        object = { ...object };
        if (object.castAs === undefined) {
            if (object.needsDotData) {
                object.needsDotData = false;
                object.key += ".data";
            }
            object.key += `.${key}`;
            return object;
        }
        if (object.castAs instanceof TypeLiteral)
            throw new CompilerError(
                item.property,
                "Members of literals do not exist yet"
            );
        // Now we examine the InterfaceLiteral it was cast as
        if (item.optional) {
            if (object.castAs.optionals.has(key)) {
                if (object.needsDotData) {
                    object.needsDotData = false;
                    object.key += ".data";
                }
                object.key += key;
                // TODO: preserve the cast of the location
                object.castAs = undefined;
                return object;
            }
        }
        if (object.castAs.value.has(key)) {
            if (object.needsDotData) {
                object.needsDotData = false;
                object.key += ".data";
            }
            object.key += key;
            // TODO: preserve the cast of the location
            object.castAs = undefined;
            return object;
        }
        throw new CompilerError(
            object.castAs,
            `This interface does not have the key ${key}`
        );
    }
    if (object instanceof InterfaceLiteral)
        throw new CompilerError(
            object,
            "Database values cannot be used to access interface values, since database values are not known at compile time"
        );
    // Since this DatabaseLocation is passed by ref, we clone it to preserve the origial
    object = { ...object };
    // Since both variables are unknown in value, we just return
    if (object.needsDotData) {
        object.needsDotData = false;
        object.key += ".data";
    }
    object.castAs = undefined;
    object.key += `[${key.key}]`;
    return object;
};

const extractProperty = (
    item: MemberExpression["property"],
    scope: Scope
): string | number | DatabaseLocation => {
    let prop:
        | NumericLiteral
        | StringLiteral
        | MemberExpression
        | DatabaseLocation;

    if (item instanceof Identifier) {
        const extracted = IdentifierCompiler(item, scope);
        if (extracted instanceof ComparisonExpression)
            throw new CompilerError(
                item,
                "Cannot use booleans as accessor keys"
            );
        if (
            extracted instanceof InterfaceLiteral ||
            extracted instanceof TypeLiteral ||
            extracted instanceof BooleanLiteral
        )
            throw new CompilerError(
                item,
                "Can only use strings or numbers as property keys"
            );
        prop = extracted as
            | DatabaseLocation
            | StringLiteral
            | NumericLiteral;
    } else prop = item;

    if (prop instanceof MemberExpression) {
        const extracted = MemberExpressionCompiler(prop, scope);
        if (extracted instanceof Literal) {
            if (
                extracted instanceof StringLiteral ||
                extracted instanceof NumericLiteral
            ) {
                return extracted.value;
            }
            throw new CompilerError(
                prop,
                "Only strings and numbers can be used for accessing properties"
            );
        }
        if (extracted instanceof Array) {
            if (extracted.length !== 1)
                throw new CompilerError(
                    prop,
                    "Cannot use multiple types as key for object"
                );
            const x = extracted[0];
            if (
                extracted instanceof StringLiteral ||
                extracted instanceof NumericLiteral ||
                extracted instanceof Identifier
            ) {
                return extractProperty(
                    x as StringLiteral | NumericLiteral | Identifier,
                    scope
                );
            }
            throw new CompilerError(
                prop,
                "Only strings and numbers can be used for accessing properties"
            );
        }
        // Now if this database location isn't cast we assume this is okay
        // TODO: After 'as' expression has been added, this loophole should be closed
        if (extracted.castAs === undefined) return extracted;
        if (extracted.castAs instanceof InterfaceLiteral)
            throw new CompilerError(
                prop,
                "Cannot use interface as key"
            );
        if (
            extracted.castAs.value === "string" ||
            extracted.castAs.value === "number"
        ) {
            return extracted;
        }
        throw new CompilerError(
            prop,
            "Only strings and numbers can be used for accessing properties"
        );
    }
    if (prop instanceof Literal) {
        return prop.value;
    }
    if (prop.castAs === undefined) return prop;
    if (prop.castAs instanceof InterfaceLiteral)
        throw new CompilerError(item, "Cannot use interface as key");
    if (
        prop.castAs.value === "string" ||
        prop.castAs.value === "number"
    ) {
        return prop;
    }
    throw new CompilerError(
        item,
        "Only strings and numbers can be used for accessing properties"
    );
};
