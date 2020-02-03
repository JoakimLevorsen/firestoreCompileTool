import { expect } from "chai";
import "mocha";
import { ParserErrorCreator } from "../../../../src/parser/ParserError";
import ReturnStatementParser from "../../../../src/parser/parsers/statement/ReturnStatementParser";
import BooleanLiteral from "../../../../src/parser/types/literal/BooleanLiteral";
import ReturnStatement from "../../../../src/parser/types/statements/ReturnStatement";
import SyntaxComponent from "../../../../src/parser/types/SyntaxComponent";
import ParserRunner, { tokenize } from "../ParserRunner";

const offset = "return ".length;

const ReturnStatementGenerator = (
    input: string,
    component: SyntaxComponent
) => ({
    input: `return ${input}`,
    expected: new ReturnStatement(
        { start: 0, end: offset + input.length },
        component
    )
});

const values = [
    {
        input: "true",
        expected: new BooleanLiteral(
            { start: offset, end: offset + 4 },
            true
        )
    },
    {
        input: "false",
        expected: new BooleanLiteral(
            { start: offset, end: offset + 5 },
            false
        )
    }
];

export const ReturnTestSet = values.map(({ input, expected }) =>
    ReturnStatementGenerator(input, expected)
);

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
                expect(actual.equals(expected)).to.be.true;
            }
        })
    );
});
