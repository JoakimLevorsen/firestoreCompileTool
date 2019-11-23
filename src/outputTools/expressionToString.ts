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
            return (
                isOnlyExpressionToString(
                    "is",
                    targetData,
                    interfaceKeys,
                    compareTo
                ) +
                " && " +
                isOnlyExpressionToString(
                    "only",
                    targetData,
                    interfaceKeys,
                    compareTo
                )
            );
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
    const ruleHeaderCommand = `\n${targetData}.keys().${checkType}(`;
    const ruleHeader =
        interfaceKeys.reduce(
            (pV, v) =>
                pV === ruleHeaderCommand
                    ? `${pV}'${v}'`
                    : `${pV}, '${v}'`,
            ruleHeaderCommand
        ) + ")\n";
    const rules = interfaceKeys.map(iKey => {
        const interfaceContent = compareTo[iKey];
        const optionalCheck = `!(${iKey} in ${targetData})\n`;
        if (interfaceContent.multiType) {
            const checkContent =
                interfaceContent.value.reduce(
                    (pV, p) =>
                        pV === "(\n"
                            ? `${targetData}.${iKey} is ${typeToString(
                                  p
                              )}`
                            : `${pV} \n || ${targetData}.${iKey} is ${typeToString(
                                  p
                              )}`,
                    "(\n"
                ) + "\n";
            return `(\n${optionalCheck} || ${checkContent}\n)\n`;
        } else {
            return `(\n${optionalCheck} || ${targetData}.${iKey} is ${typeToString(
                interfaceContent.value
            )}\n)\n`;
        }
    });
    const unifiedRule = rules.reduce((pV, v) => `${pV} && ${v}`);
    return `\n\n ${ruleHeader} && (\n${unifiedRule}\n)`;
};

export default expressionToString;
