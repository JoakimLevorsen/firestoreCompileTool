import { expect } from "chai";
import "mocha";
import { ParserErrorCreator } from "../../../src/parser";
import { BlockStatementParser } from "../../../src/parser/statement";
import { BooleanLiteral } from "../../../src/types/literals";
import {
    BlockStatement,
    ReturnStatement
} from "../../../src/types/statements";
import ParserRunner, { tokenize } from "../ParserRunner";

export const BlockTestSet = [
    {
        input: `{
        return true
    }`,
        expected: new BlockStatement({ start: 0, end: 27 }, [
            new ReturnStatement(1, new BooleanLiteral(17, true))
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
                const result = actual.equals(expected);
                expect(result).to.be.true;
            }
        })
    ));
