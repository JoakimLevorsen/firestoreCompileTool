import { expect } from "chai";
import "mocha";
import ParserErrorCreator from "../../../../src/parser/ParserError";
import BlockStatementParser from "../../../../src/parser/parsers/statement/BlockStatementParser";
import BooleanLiteral from "../../../../src/parser/types/literal/BooleanLiteral";
import BlockStatement from "../../../../src/parser/types/statements/BlockStatement";
import ReturnStatement from "../../../../src/parser/types/statements/ReturnStatement";
import ParserRunner, { tokenize } from "../ParserRunner";

export const BlockTestSet = [
    {
        input: `{
        return true
    }`,
        expected: new BlockStatement({ start: 0, end: 27 }, [
            new ReturnStatement(
                { start: 1, end: 21 },
                new BooleanLiteral({ start: 18, end: 22 }, true)
            )
        ])
    }
];

describe("BlockStatementParser", () =>
    BlockTestSet.forEach(({ input, expected }) =>
        it(`Parsing ${input}`, () => {
            const tokens = tokenize(input);
            const error = ParserErrorCreator(tokens);
            const actual = ParserRunner(
                tokens,
                new BlockStatementParser(error)
            );
            expect(typeof actual).to.not.be.equal("string");
            expect(actual).to.not.be.instanceOf(Array).and.not.be
                .null;
            if (
                typeof actual !== "string" &&
                !(actual instanceof Array) &&
                actual !== null
            ) {
                expect(actual.equals(expected)).to.be.true;
            }
        })
    ));
