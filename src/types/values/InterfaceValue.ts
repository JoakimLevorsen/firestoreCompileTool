import {
    Interface,
    InterfaceContent,
    isInterface
} from "../Interface";
import { CollapsedBlock } from "../blocks";
import { Token } from "../Token";

export default class InterfaceValue {
    private value: Interface | InterfaceContent;
    private key?: string;

    constructor(baseObject: string, scope: CollapsedBlock) {
        const match = scope.interfaces[baseObject];
        if (match) {
            this.value = match;
        } else
            throw new Error(
                `Interface with type ${baseObject} not found in scope`
            );
    }

    public static toInterfaceValue(
        from: Token,
        scope: CollapsedBlock
    ): InterfaceValue | null {
        // If the token isn't a keyword, that's wrong
        if (from.type !== "Keyword") return null;
        // We now split the keyword into segments.
        const segments = from.value.split(".");
        if (segments.length === 0) return null;
        try {
            const base = new InterfaceValue(segments[0], scope);
            const otherSegments = segments.splice(1);
            for (const segment of otherSegments) {
                base.addSubTarget(segment);
            }
            return base;
        } catch (e) {
            return null;
        }
    }

    public addSubTarget(target: string) {
        if (isInterface(this.value)) {
            const match = this.value[target];
            if (match) {
                this.value = match;
                this.key = target;
                return;
            }
            throw new Error(
                `${target} does not exist on ${this.value}`
            );
        }
        throw new Error(
            `Subtypes not yet supported for ${this.value.value}`
        );
    }

    public getInterface(): Interface {
        if (isInterface(this.value)) {
            return this.value;
        }
        const iVal: Interface = {};
        iVal[this.key || ""] = this.value;
        return iVal;
    }
}
