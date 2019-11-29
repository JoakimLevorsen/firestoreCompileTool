import { Expression, Interface, typeToString } from "../types";
import RawValue from "../types/RawValue";

const expressionToString = (expression: Expression): string => {
    if (expression instanceof RawValue) {
        const xType = expression.getType();
        if (xType === "Bool" || xType === "null") {
            return `${expression.toString() === "true"}`;
        }
        throw new Error(`${xType} cannot be cast to boolean.`);
    }
    // We check index 1 for the operator
    if (
        expression[1] === "is" ||
        expression[1] === "only" ||
        expression[1] === "isOnly"
    ) {
        const [target, _, compareTo] = expression;
        const targetData = target.toStringAsData();
        if (targetData === null) {
            throw new Error("Internal error");
        }
        if (expression[1] === "isOnly") {
            return `(${isOnlyExpressionToString(
                "is",
                targetData,
                compareTo
            )} && ${isOnlyExpressionHeader(
                "only",
                targetData,
                compareTo
            )})`;
        } else {
            return isOnlyExpressionToString(
                expression[1],
                targetData,
                compareTo
            );
        }
    }
    if (expression[1] === "=") {
        return `${expression[0]} == ${expression[2]}`;
    }
    if (expression[1] === "≠") {
        return `${expression[0]} != ${expression[2]}`;
    }
    return `${expression[0]} `;
};

const isOnlyExpressionHeader = (
    type: "is" | "only",
    targetData: string,
    compareTo: Interface
): string => {
    // We get all the interface keys, and the nonOptionalKeys
    const allInterfaceKeys = Object.keys(compareTo);
    const nonOptionalKeys = [...allInterfaceKeys].filter(
        k => compareTo[k].optional === false
    );

    // First we make an object.keys().hasOnly(...) for the interface keys
    // TODO: Check only expressions for deeper maps in interfaces when support added
    const checkType = type === "is" ? "hasAll" : "hasOnly";
    const ruleHeaderCommand = ` ${targetData}.keys().${checkType}([`;

    // The items in our .hasAll() should only be the non optionals
    // where .hasOnly should have all keys
    const ruleHeaderTarget =
        type === "is" ? nonOptionalKeys : allInterfaceKeys;

    const ruleHeader =
        ruleHeaderTarget.reduce(
            (pV, v) =>
                pV === ruleHeaderCommand
                    ? `${pV}'${v}'`
                    : `${pV}, '${v}'`,
            ruleHeaderCommand
        ) + "]) ";
    return ruleHeader;
};

const isOnlyExpressionToString = (
    type: "is" | "only",
    targetData: string,
    compareTo: Interface
): string => {
    const allInterfaceKeys = Object.keys(compareTo);
    const rules = allInterfaceKeys.map(iKey => {
        const interfaceContent = compareTo[iKey];
        // If this interface defined the value as foo?: bar,
        // or we're doing an only check, we add this optional path,
        // since this value isn't forced to exist
        let optionalCheck: string | null = null;
        if (type === "only" || interfaceContent.optional) {
            optionalCheck = `!('${iKey}' in ${targetData}) `;
        }
        if (interfaceContent.multiType) {
            const checkContent = interfaceContent.value.reduce(
                (pV, p) =>
                    pV === " "
                        ? `${targetData}.${iKey} is ${typeToString(
                              p
                          )}`
                        : `${pV} || ${targetData}.${iKey} is ${typeToString(
                              p
                          )}`,
                " "
            );
            if (optionalCheck) {
                return `( ${optionalCheck} || ${checkContent} ) `;
            } else {
                return `( ${checkContent} )`;
            }
        } else {
            if (optionalCheck) {
                return `( ${optionalCheck} || ${targetData}.${iKey} is ${typeToString(
                    interfaceContent.value
                )} ) `;
            } else {
                return `${targetData}.${iKey} is ${typeToString(
                    interfaceContent.value
                )} `;
            }
        }
    });
    const unifiedRule = rules.reduce((pV, v) => `${pV} && ${v}`);
    return ` ${isOnlyExpressionHeader(
        type,
        targetData,
        compareTo
    )} && ( ${unifiedRule} )`;
};

export default expressionToString;
