import { Interface, KeywordValue, typeToString } from "..";

type Comparison = "is" | "only" | "isOnly";

export class IsTypeCondition {
    public firstValue: KeywordValue;
    public comparison: Comparison;
    public secondValue: Interface;
    constructor(
        firstValue: KeywordValue,
        comparison: Comparison,
        secondValue: Interface
    ) {
        this.firstValue = firstValue;
        this.comparison = comparison;
        this.secondValue = secondValue;
    }

    public toRule() {
        if (this.comparison === "isOnly") {
            return `(${this.stringBody("is")} && ${this.stringHeader(
                "only"
            )})`;
        } else {
            return this.stringBody(this.comparison);
        }
    }

    private stringHeader(type: "is" | "only"): string {
        // We get all the interface keys, and the nonOptionalKeys
        const allInterfaceKeys = Object.keys(this.secondValue);
        const nonOptionalKeys = [...allInterfaceKeys].filter(
            k => this.secondValue[k].optional === false
        );

        // First we make an object.keys().hasOnly(...) for the interface keys
        // TODO: Check only expressions for deeper maps in interfaces when support added
        const checkType = type === "is" ? "hasAll" : "hasOnly";
        const ruleHeaderCommand = ` ${this.firstValue.toStringAsData()}.keys().${checkType}([`;

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
    }

    private stringBody(type: "is" | "only"): string {
        const allInterfaceKeys = Object.keys(this.secondValue);
        const targetData = this.firstValue.toStringAsData();
        const rules = allInterfaceKeys.map(iKey => {
            const interfaceContent = this.secondValue[iKey];
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
        return ` ${this.stringHeader(type)} && ( ${unifiedRule} )`;
    }
}
