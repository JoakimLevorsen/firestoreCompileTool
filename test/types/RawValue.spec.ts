import { expect } from "chai";
import "mocha";
import { RawValue, Token, Type } from "../../src/types";

const stringToToken = (value: string): Token => ({
    type: "Keyword",
    value
});

// Values for rawValue test: inputToken, expected type, expected value
const vals: Array<[Token, Type, string]> = [
    [stringToToken("null"), "null", "null"],
    [stringToToken("true"), "Bool", "true"],
    [stringToToken("false"), "Bool", "false"],
    [stringToToken("0"), "Number", "0"],
    [stringToToken(".0"), "Number", "0"],
    [stringToToken(",0"), "Number", "0"],
    [stringToToken(".123"), "Number", "0.123"],
    [stringToToken(",123"), "Number", "0.123"],
    [stringToToken("123"), "Number", "123"],
    [stringToToken("123.01"), "Number", "123.01"],
    [stringToToken("123,01"), "Number", "123.01"],
    [stringToToken("-123.01"), "Number", "-123.01"],
    [stringToToken("-123,01"), "Number", "-123.01"],
    [stringToToken("'Hey12'"), "String", "'Hey12'"],
    [stringToToken('"Hey12"'), "String", '"Hey12"']
];

describe("RawValue", () => {
    for (const val of vals) {
        it(`string '${
            val[0].type === "Keyword" ? val[0].value : ""
        }' expected to return type '${val[1]}' and toString value '${
            val[2]
        }'`, () => {
            const object = new RawValue(val[0]);
            expect(object.getType()).to.equal(val[1]);
            expect(object.toString()).to.equal(val[2]);
        });
    }
});
