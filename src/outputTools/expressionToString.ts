import { Expression, typeToString } from "../types";

const expressionToString = (expression: Expression): string => {
    if (typeof expression === "boolean") {
        return `${expression === true}`;
    }
    // We check index 1 for the operator
    if (expression[1] === "is") {
        const [target, _, compareTo] = expression;
        const targetData = target.toStringAsData();
        const interfaceKeys = Object.keys(compareTo);
        return interfaceKeys
            .map(iKey => {
                const interfaceContent = compareTo[iKey];
                if (interfaceContent.multiType) {
                    return (
                        interfaceContent.value.reduce(
                            (pV, v) =>
                                pV === ""
                                    ? `(\n${targetData}.${iKey} is ${typeToString(
                                          v
                                      )}`
                                    : `${pV} || ${targetData}.${iKey} is ${typeToString(
                                          v
                                      )}`,
                            ""
                        ) + "\n)"
                    );
                } else {
                    return ` ${targetData}.${iKey} is ${interfaceContent.value.toLowerCase()}`;
                }
            })
            .reduce((pV, v) => `${pV} && ${v}`);
    }
    if (expression[1] === "only") {
        const [target, _, compareTo] = expression;
        const targetData = target.toStringAsData();
        if (targetData === null) {
            throw new Error("Internal error");
        }
        const interfaceKeys = Object.keys(compareTo);
        // First we make an object.keys().hasOnly(...) for the interface keys
        // TODO: Check only expressions for deeper maps in interfaces when support added
        const ruleHeaderCommand = `\n${targetData}.keys().hasOnly(`;
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
        console.log("Rules are", JSON.stringify(rules));
        const unifiedRule = rules.reduce((pV, v) => `${pV} && ${v}`);
        return `\n\n ${ruleHeader} && (\n${unifiedRule}\n)`;
    }
    if (expression[1] === "=") {
        return `${expression[0]} == ${expression[2]}`;
    }
    if (expression[1] === "≠") {
        return `${expression[0]} != ${expression[2]}`;
    }
    return `${expression[0]} `;
};

export default expressionToString;
