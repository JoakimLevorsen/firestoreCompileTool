import { expect } from "chai";
import "mocha";
import { ParserErrorCreator } from "../../../../src/parser/ParserError";
import { ReturnStatementParser } from "../../../../src/parser/parsers/statement";
import { BinaryExpression } from "../../../../src/parser/types/expressions/BinaryExpression";
import { EqualityExpression } from "../../../../src/parser/types/expressions/equality";
import Identifier from "../../../../src/parser/types/Identifier";
import { BooleanLiteral } from "../../../../src/parser/types/literal";
import { ReturnStatement } from "../../../../src/parser/types/statements";
import ParserRunner, { tokenize } from "../ParserRunner";

const offset = "return ".length;

const ReturnStatementGenerator = (
    input: string,
    component: BinaryExpression | Identifier | BooleanLiteral
) => [
    {
        input: `return ${input}`,
        expected: new ReturnStatement(0, component)
    },
    {
        input: `return ${input};`,
        expected: new ReturnStatement(0, component)
    }
];

const values = [
    {
        input: "true",
        expected: new BooleanLiteral(offset, true)
    },
    {
        input: "false",
        expected: new BooleanLiteral(offset, false)
    },
    {
        input: "a",
        expected: new Identifier(offset, "a")
    },
    {
        input: "a == true",
        expected: new EqualityExpression(
            { start: offset, end: offset + 8 },
            "==",
            new Identifier(offset, "a"),
            new BooleanLiteral(offset + 5, true)
        )
    }
];

export const ReturnTestSet = values
    .map(({ input, expected }) =>
        ReturnStatementGenerator(input, expected)
    )
    .reduce((pV, v) => [...pV, ...v], []);

describe("ReturnStatementParser", () => {
    ReturnTestSet.forEach(({ input, expected }) =>
        it(`Parsing ${input}`, () => {
            const tokens = tokenize(input);
            const error = ParserErrorCreator(tokens);
            const actual = ParserRunner(
                tokens,
                new ReturnStatementParser(error)
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
    );
});
