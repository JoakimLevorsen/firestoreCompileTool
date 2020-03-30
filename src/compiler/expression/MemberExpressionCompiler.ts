import { DatabaseLocation, IdentifierCompiler, Scope } from "..";
import { Identifier } from "../../types";
import { MemberExpression } from "../../types/expressions";
import { ComparisonExpression } from "../../types/expressions/comparison";
import Literal, {
    BooleanLiteral,
    InterfaceLiteral,
    NumericLiteral,
    StringLiteral,
    TypeLiteral
} from "../../types/literals";
import CompilerError from "../CompilerError";
import { OutsideFunctionDeclaration } from "../OutsideFunctionDeclaration";
import { CallExpression } from "../../types/expressions/CallExpression";
import {
    LiteralFunctions,
    AllLiteralFunctions,
    functionsForLiteral
} from "../scope/literalFunctions";
import SyntaxComponent from "../../types/SyntaxComponent";

export const MemberExpressionCompiler = (
    item: MemberExpression,
    scope: Scope
):
    | Literal
    | DatabaseLocation
    | OutsideFunctionDeclaration
    | (Literal | Identifier)[] => {
    const root = IdentifierMemberExtractor(item.object, scope);
    if (root instanceof OutsideFunctionDeclaration)
        throw new CompilerError(
            item.object,
            "Functions do not have any children"
        );
    if (
        root instanceof CallExpression ||
        root instanceof ComparisonExpression
    )
        throw new Error("Feature to be added");
    let root2: InterfaceLiteral | DatabaseLocation;
    if (root instanceof Literal) {
        if (root instanceof InterfaceLiteral) {
            root2 = root;
        } else if (root instanceof StringLiteral) {
            console.log(
                "Keys are",
                Object.keys(LiteralFunctions).toString()
            );
            const litFunctions = LiteralFunctions.string;
            const referenced =
                litFunctions[(item.property as Identifier).name];
            if (referenced) return referenced.withCallee(root);
            throw new CompilerError(
                item.property,
                "Function not found"
            );
        } else
            throw new CompilerError(
                root,
                "Members of Literals of non interfaces don't exist yet."
            );
    } else root2 = root;
    // Now we have the object ready to find the child of.
    // If this expression isn't computed it's easy
    if (!item.computed) {
        // This means the property is a string, but saved in an Identifier
        const propName = (item.property as Identifier).name;
        return extractValueForProperty(
            root2,
            item.optional,
            propName,
            item,
            scope
        );
    } else {
        // This means we have to extract the property
        const prop = extractProperty(item.property, scope);
        return extractValueForProperty(
            root2,
            item.optional,
            prop,
            item,
            scope
        );
    }
};

const extractValueForProperty = (
    object: InterfaceLiteral | DatabaseLocation,
    optional: boolean,
    key: ReturnType<typeof extractProperty>,
    item: MemberExpression,
    scope: Scope
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
            // First we check if the name is a function
            const matchingFunction = AllLiteralFunctions[key];
            if (matchingFunction) {
                return matchingFunction.withCallee(object);
            }
            if (object.needsDotData) {
                object.needsDotData = false;
                if (key !== "id") object.key += ".data";
            }
            object.key += `.${key}`;
            return object;
        }
        if (object.castAs instanceof TypeLiteral) {
            const litFunctions =
                LiteralFunctions[object.castAs.value];
            if (litFunctions) {
                const referenced = litFunctions[key].withCallee(
                    item.object as Literal
                );
                if (referenced) return referenced;
                throw new CompilerError(
                    item.property,
                    "Function not found"
                );
            }
            throw new CompilerError(
                item.property,
                "Members of literals do not exist yet"
            );
        }
        if (!(object.castAs instanceof InterfaceLiteral)) {
            // Then this is a function
            const litFunctions = functionsForLiteral(object.castAs);
            const referenced =
                litFunctions[(item.property as Identifier).name];
            if (referenced) return referenced.withCallee(object);
            throw new CompilerError(
                item.property,
                "Function not found"
            );
        }
        // Now we examine the InterfaceLiteral it was cast as
        if (item.optional) {
            if (object.castAs.optionals.has(key)) {
                if (object.needsDotData) {
                    object.needsDotData = false;
                    if (key !== "id") object.key += ".data";
                }
                object.key += `.${key}`;
                // TODO: preserve the cast of the location
                object.castAs = undefined;
                return object;
            }
        }
        if (object.castAs.value.has(key)) {
            if (object.needsDotData) {
                object.needsDotData = false;
                if (key !== "id") object.key += ".data";
            }
            object.key += `.${key}`;
            const newType = object.castAs.value.get(key)!;
            if (newType.length === 1) {
                const newSpecificType = newType[0];
                if (newSpecificType instanceof Identifier) {
                    const real = IdentifierCompiler(
                        newSpecificType,
                        scope
                    );
                    if (real instanceof Literal) {
                        object.castAs = real;
                    } else object.castAs = undefined;
                } else object.castAs = newSpecificType;
            } else object.castAs = undefined;
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
        if (extracted instanceof OutsideFunctionDeclaration)
            throw new CompilerError(item, "Internal error");
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

// This is kinda bad, but to avoid a circular import this is a clone of the IdentifierMemberExtractor function

const IdentifierMemberExtractor = <S extends SyntaxComponent>(
    input: Identifier | MemberExpression | S,
    scope: Scope
):
    | Literal
    | DatabaseLocation
    | ComparisonExpression
    | CallExpression
    | OutsideFunctionDeclaration
    | S => {
    if (input instanceof MemberExpression) {
        const x = MemberExpressionCompiler(input, scope);
        if (x instanceof Array) {
            if (x.length === 1) {
                if (x[0] instanceof Identifier)
                    return IdentifierCompiler(x[0], scope);
                else return x[0];
            } else
                throw new CompilerError(
                    input,
                    "Item has multiple values"
                );
        }
        return x;
    }
    if (input instanceof Identifier) {
        return IdentifierCompiler(input, scope);
    }
    return input;
};
