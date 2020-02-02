import { expect } from "chai";
import "mocha";
import ParserErrorCreator from "../../../src/parser/ParserError";
import StringLiteral from "../../../src/parser/types/literal/StringLiteral";
import BooleanLiteral from "../../../src/parser/types/literal/BooleanLiteral";
import NumericLiteral from "../../../src/parser/types/literal/NumericLiteral";
import LiteralParser from "../../../src/parser/parsers/literal";
import ParserRunner, { tokenize } from "./ParserRunner";

const BooleanCreator = (input: boolean) => ({
    input: `${input}`,
    expected: new BooleanLiteral(
        { start: 0, end: `${input}`.length },
        input
    )
});

const NumericCreator = (input: number) => ({
    input: input.toString(),
    expected: new NumericLiteral(
        { start: 0, end: input.toString().length },
        input
    )
});

const StringCreator = (input: string) => ({
    input,
    expected: new StringLiteral(
        { start: 0, end: input.length - 1 },
        input
    )
});

export const LiteralTestSet = [
    // BooleanCreator(true),
    // BooleanCreator(false),
    // NumericCreator(0),
    // NumericCreator(1000),
    // NumericCreator(0.0001),
    // NumericCreator(1000.0001),
    // NumericCreator(0.0001),
    StringCreator("'input'"),
    StringCreator('"test"'),
    StringCreator('"Hey\'there"')
];

describe("LiteralParser", () => {
    LiteralTestSet.forEach(({ input, expected }) =>
        it(`Parsing ${input}`, () => {
            const tokens = tokenize(input);
            const error = ParserErrorCreator(tokens);
            const actual = ParserRunner(tokens, LiteralParser(error));
            expect(actual).to.be.instanceOf(Array);
            if (actual instanceof Array) {
                expect(actual.length).to.be.equal(1);
                const result = actual[0];
                expect(result.equals(expected)).to.be.true;
            }
        })
    );
});
