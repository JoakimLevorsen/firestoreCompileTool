import { Type } from ".";
import { Token } from "./Token";

// A raw value like: true, false, 1, 83, 'hello'

const typeRegexes = {
    boolean: /^(?:true|false)$/,
    null: /^null$/,
    number: /^(?<neg>-)?(?<int>[0-9]*)(?:(?:[\.,])(?<dec>[0-9]*))?$/,
    string: /^("|')(.*)[^\\]("|')$/
};

const openEndedRegexes = {
    boolean: /^(?:true|false)/,
    null: /^null/,
    number: /^([0-9]*)(?:([\.,])([0-9]*))?/,
    string: /^("|')(.*)[^\\]("|')/
};

export const extractRawValueString = (
    input: string
): string | null => {
    for (const regex of Object.values(openEndedRegexes)) {
        const match = input.match(regex);
        // The number parser will interpret ',' and '.' as a number, and that is wrong
        if (
            match &&
            match[0] &&
            match[0] !== "," &&
            match[0] !== "."
        ) {
            return match[0];
        }
    }
    return null;
};

export default class RawValue {
    private type: Type;
    private value: string;

    constructor(keyword: Token) {
        if (keyword.type !== "Keyword") {
            throw new Error(
                "RawValue can only be extracted from keyword tokens"
            );
        }
        // Now first we check if we're dealing with a string.
        if (typeRegexes.string.test(keyword.value)) {
            this.type = "String";
            // We set the value to the raw string value
            const matches = keyword.value.match(typeRegexes.string);
            this.value = matches![0];
            return;
        }
        // We check if its a number
        if (typeRegexes.number.test(keyword.value)) {
            const { dec, int, neg } = keyword.value.match(
                typeRegexes.number
            )!.groups!;
            const myNumber = new Number(
                `${neg || ""}${int || ""}.${dec || ""}`
            );
            this.type = "Number";
            this.value = myNumber.toString();
            return;
        }
        if (typeRegexes.boolean.test(keyword.value)) {
            const [value] = keyword.value.match(typeRegexes.boolean)!;
            this.type = "Bool";
            this.value = value;
            return;
        }
        if (typeRegexes.null.test(keyword.value)) {
            this.type = "null";
            this.value = "null";
            return;
        }
        throw new Error(
            `RawValue was not recognized from ${keyword}`
        );
    }

    public getType = () => this.type;

    public toString = () => this.value;

    public static toRawValue = (keyword: Token): RawValue | null => {
        try {
            return new RawValue(keyword);
        } catch {
            return null;
        }
    };
}
