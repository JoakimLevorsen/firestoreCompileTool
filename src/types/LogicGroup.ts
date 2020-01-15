import { RuleExportable } from "./RuleExportble";

type logic = "&&" | "||";

export class LogicGroup<T extends RuleExportable> {
    base?: T | LogicGroup<T>;
    itemChain: Array<logic | LogicGroup<T> | T>;

    constructor(
        base?: T | LogicGroup<T>,
        itemChain: Array<logic | LogicGroup<T> | T> = []
    ) {
        this.base = base;
        this.itemChain = itemChain;
    }

    public toRule(): string {
        if (!this.base) return "";
        const base = this.base.toRule();
        // Since we assume the order is correct, we can just add the remaning items
        return this.itemChain.reduce(
            (pV, v) =>
                v instanceof LogicGroup
                    ? `${pV} (${v.toRule()})`
                    : `${pV} ${
                          typeof v === "string" ? v : v.toRule()
                      }`,
            base
        );
    }
}
