import { Expression, Interface, typeToString } from "../types";

const expressionToString = (expression: Expression): string => {
    if (typeof expression === "boolean") {
        return `${expression === true}`;
    }
    // We check index 1 for the operator
    if (
        expression[1] === "is" ||
        expression[1] === "only" ||
        expression[1] === "isOnly"
    ) {
        const [target, _, compareTo] = expression;
        const targetData = target.toStringAsData();
        const interfaceKeys = Object.keys(compareTo);
        if (targetData === null) {
            throw new Error("Internal error");
        }
        if (expression[1] === "isOnly") {
            return `(${isOnlyExpressionToString(
                "is",
                targetData,
                interfaceKeys,
                compareTo
            )} && ${isOnlyExpressionToString(
                "only",
                targetData,
                interfaceKeys,
                compareTo
            )})c`;
        } else {
            return isOnlyExpressionToString(
                expression[1],
                targetData,
                interfaceKeys,
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

const isOnlyExpressionToString = (
    type: "is" | "only",
    targetData: string,
    interfaceKeys: string[],
    compareTo: Interface
): string => {
    // First we make an object.keys().hasOnly(...) for the interface keys
    // TODO: Check only expressions for deeper maps in interfaces when support added
    const checkType = type === "is" ? "hasAll" : "hasOnly";
    const ruleHeaderCommand = ` ${targetData}.keys().${checkType}(`;
    const ruleHeader =
        interfaceKeys.reduce(
            (pV, v) =>
                pV === ruleHeaderCommand
                    ? `${pV}'${v}'`
                    : `${pV}, '${v}'`,
            ruleHeaderCommand
        ) + ") ";
    const rules = interfaceKeys.map(iKey => {
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
                    !pV
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
    return ` ${ruleHeader} && ( ${unifiedRule} )`;
};

export default expressionToString;
