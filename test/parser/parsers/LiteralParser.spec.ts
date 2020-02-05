import { expect } from "chai";
import "mocha";
import ParserErrorCreator from "../../../src/parser/ParserError";
import LiteralParserGroup from "../../../src/parser/parsers/literal/LiteralParserGroup";
import BooleanLiteral from "../../../src/parser/types/literal/BooleanLiteral";
import NumericLiteral from "../../../src/parser/types/literal/NumericLiteral";
import StringLiteral from "../../../src/parser/types/literal/StringLiteral";
import ParserRunner, { tokenize } from "./ParserRunner";

const BooleanCreator = (input: boolean) => ({
    input: `${input}`,
    expected: new BooleanLiteral(0, input)
});

const NumericCreator = (input: number) => ({
    input: input.toString(),
    expected: new NumericLiteral(0, input)
});

const StringCreator = (input: string) => {
    // For the result string we remove the " or ' since they wouldn't be there
    const resultString = input.substr(1, input.length - 2);
    return {
        input,
        expected: new StringLiteral(0, resultString)
    };
};

export const LiteralTestSet = [
    BooleanCreator(true),
    BooleanCreator(false),
    NumericCreator(0),
    NumericCreator(1000),
    NumericCreator(0.0001),
    NumericCreator(1000.0001),
    NumericCreator(0.0001),
    StringCreator("'input'"),
    StringCreator('"test"'),
    StringCreator('"Hey\'there"')
];

describe("LiteralParser", () => {
    LiteralTestSet.forEach(({ input, expected }) =>
        it(`Parsing ${input}`, () => {
            const tokens = tokenize(input);
            const error = ParserErrorCreator(tokens);
            const actual = ParserRunner(
                tokens,
                LiteralParserGroup(error)
            );
            expect(actual).to.be.instanceOf(Array);
            if (actual instanceof Array) {
                expect(actual.length).to.be.equal(1);
                const result = actual[0];
                expect(result.equals(expected)).to.be.true;
            }
        })
    );
});
