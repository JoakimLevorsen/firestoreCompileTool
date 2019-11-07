import {
    Interface,
    InterfaceData
} from "../extractionTools/interface";
import { charBlock } from ".";
import { extractType } from "../extractionTools";

type WAIT = "WAIT";
const WAIT: WAIT = "WAIT";

export default class InterfaceParser {
    interfaceName?: string;
    interface: Interface = {};
    nextProperty?: { name: string; optional?: boolean };
    stage:
        | "awaiting keyword"
        | "awaiting name"
        | "awaiting block"
        | "building block" = "awaiting keyword";

    public addChar(
        block: charBlock
    ): false | WAIT | { type: "Interface"; data: InterfaceData } {
        switch (this.stage) {
            case "awaiting keyword":
                if (
                    block.type === "Keyword" &&
                    block.value === "interface"
                ) {
                    this.stage = "awaiting name";
                    return WAIT;
                }
                return false;
            case "awaiting name":
                if (block.type === "Keyword") {
                    this.interfaceName = block.value;
                    this.stage = "awaiting block";
                    return WAIT;
                }
                return false;
            case "awaiting block":
                if (block.type === "BlockOpen") {
                    this.stage = "building block";
                    return WAIT;
                }
                return false;
            case "building block":
                // First we check if we've been closed
                if (block.type === "BlockClose") {
                    // Are we currently building a property?
                    if (this.nextProperty) return false;
                    // Do we have a name?
                    if (!this.interfaceName) return false;
                    // Else things went good
                    return {
                        type: "Interface",
                        data: {
                            name: this.interfaceName,
                            content: this.interface
                        }
                    };
                }
                // Are we currently building a variable?
                if (
                    this.nextProperty &&
                    this.nextProperty.optional !== undefined
                ) {
                    // If we got a semiColon and one type has been added, we are done.
                    if (block.type === "SemiColon") {
                        if (
                            this.interface[this.nextProperty.name] ===
                            undefined
                        )
                            return false;
                        this.nextProperty = undefined;
                        return WAIT;
                    }
                    // If we got a | we just ignore it for now, add checks later
                    // TODO
                    if (block.type === "Or") return WAIT;
                    // If we got a keyword it must be a type we'll ad to the interface.
                    if (block.type === "Keyword") {
                        const type = extractType(block.value);
                        // If we can't find the type, fail it.
                        if (type === undefined) return false;
                        const currentValue = this.interface[
                            this.nextProperty.name
                        ];
                        if (currentValue === undefined)
                            this.interface[
                                this.nextProperty.name
                            ] = type;
                        else if (currentValue instanceof Array)
                            this.interface[this.nextProperty.name] = [
                                ...currentValue,
                                type
                            ];
                        else
                            this.interface[this.nextProperty.name] = [
                                currentValue,
                                type
                            ];
                        return WAIT;
                    }
                    // Else the type is unknown and interface creation has failed.
                    return false;
                }
                // Have we started building a variable?
                if (
                    this.nextProperty &&
                    this.nextProperty.optional === undefined
                ) {
                    if (block.type === "Colon") {
                        this.nextProperty.optional = false;
                        return WAIT;
                    }
                    return false;
                }
                // Should we start a new variable?
                if (block.type === "Keyword") {
                    this.nextProperty = { name: block.value };
                }
                // Else the value is unknown
                return false;
        }
    }
}
