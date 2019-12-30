import { WAIT, ParserError, BaseParser, TypeParser } from ".";
import { Interface, InterfaceData, Token } from "../types";

// String indicates fail reason, "WAIT" indicates that operation will continue,
// and the type with data indicates that we finished.
export class InterfaceParser extends BaseParser {
    private interfaceName?: string;
    private interface: Interface = {};
    private nextProperty?: {
        name: string;
        optional?: boolean;
        set?: true;
    };
    private stage:
        | "awaiting keyword"
        | "awaiting name"
        | "awaiting block"
        | "building block" = "awaiting keyword";

    // tslint:disable-next-line: no-empty
    public postConstructor() {}

    public addToken(
        token: Token,
        nextToken: Token | null
    ):
        | ParserError
        | WAIT
        | { type: "Interface"; data: InterfaceData } {
        switch (this.stage) {
            case "awaiting keyword":
                if (
                    token.type === "Keyword" &&
                    token.value === "interface"
                ) {
                    this.stage = "awaiting name";
                    return WAIT;
                }
                return new ParserError(
                    "Keyword failed",
                    token,
                    InterfaceParser
                );
            case "awaiting name":
                if (token.type === "Keyword") {
                    this.interfaceName = token.value;
                    this.stage = "awaiting block";
                    return WAIT;
                }
                return new ParserError(
                    "Name is not valid",
                    token,
                    InterfaceParser
                );
            case "awaiting block":
                if (token.type === "{") {
                    this.stage = "building block";
                    return WAIT;
                }
                return new ParserError(
                    "Expected token open, got",
                    token,
                    InterfaceParser
                );
            case "building block":
                // First we check if we've been closed
                if (token.type === "}") {
                    // Are we currently building a property?
                    if (this.nextProperty) {
                        return new ParserError(
                            "Block closed too early",
                            token,
                            InterfaceParser
                        );
                    }
                    // Do we have a name?
                    if (!this.interfaceName) {
                        return new ParserError(
                            "Block closed with no name",
                            token,
                            InterfaceParser
                        );
                    }
                    // Else things went good
                    return {
                        data: {
                            interface: this.interface,
                            name: this.interfaceName
                        },
                        type: "Interface"
                    };
                }
                // Are we currently building a variable?
                if (
                    this.nextProperty &&
                    this.nextProperty.optional !== undefined &&
                    this.nextProperty.set !== undefined
                ) {
                    // If we got a semiColon and one type has been added, we are done.
                    if (token.type === ";") {
                        if (
                            this.interface[this.nextProperty.name] ===
                            undefined
                        ) {
                            return new ParserError(
                                "Block closed while we were building a variable",
                                token,
                                InterfaceParser
                            );
                        }
                        this.nextProperty = undefined;
                        return WAIT;
                    }
                    // If we got a | we just ignore it for now, add checks later
                    // TODO
                    if (token.type === "|") {
                        return WAIT;
                    }
                    // If we got a keyword it must be a type we'll ad to the interface.
                    if (token.type === "Keyword") {
                        const type = TypeParser(token.value);
                        // If we can't find the type, fail it.
                        if (type === undefined) {
                            return new ParserError(
                                "Unexpected block type",
                                token,
                                InterfaceParser
                            );
                        }
                        const currentProperty = this.interface[
                            this.nextProperty.name
                        ];

                        if (currentProperty === undefined) {
                            this.interface[this.nextProperty.name] = {
                                multiType: false,
                                optional: this.nextProperty.optional,
                                value: type
                            };
                        } else {
                            const optional = currentProperty.optional;
                            const currentValue =
                                currentProperty.value;
                            if (currentValue instanceof Array) {
                                this.interface[
                                    this.nextProperty.name
                                ] = {
                                    multiType: true,
                                    optional,
                                    value: [...currentValue, type]
                                };
                            } else {
                                this.interface[
                                    this.nextProperty.name
                                ] = {
                                    multiType: true,
                                    optional,
                                    value: [currentValue, type]
                                };
                            }
                        }
                        return WAIT;
                    }
                    // Else the type is unknown and interface creation has failed.
                    return new ParserError(
                        "Unexpected token 1",
                        token,
                        InterfaceParser
                    );
                }
                // Have we started building a variable?
                if (this.nextProperty) {
                    // ? Means we got an optional
                    if (token.type === "?") {
                        this.nextProperty.optional = true;
                        return WAIT;
                    }
                    if (token.type === ":") {
                        // Only set the optional if we haven't set it to true
                        if (
                            this.nextProperty.optional === undefined
                        ) {
                            this.nextProperty.optional = false;
                        }
                        this.nextProperty.set = true;
                        return WAIT;
                    }
                    return new ParserError(
                        "Unexpected token 2",
                        token,
                        InterfaceParser
                    );
                }
                // Should we start a new variable?
                if (token.type === "Keyword") {
                    this.nextProperty = { name: token.value };
                    return WAIT;
                }
                // Else the value is unknown
                return new ParserError(
                    "Unexpected token type",
                    token,
                    InterfaceParser
                );
        }
    }
}
