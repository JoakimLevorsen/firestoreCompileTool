import { expect } from "chai";
import "mocha";
import ParserErrorCreator from "../../../../src/parser/ParserError";
import MemberExpressionParser from "../../../../src/parser/parsers/expression/MemberExpressionParser";
import MemberExpression from "../../../../src/parser/types/expressions/MemberExpression";
import Identifier from "../../../../src/parser/types/Identifier";
import StringLiteral from "../../../../src/parser/types/literal/StringLiteral";
import SyntaxComponent from "../../../../src/parser/types/SyntaxComponent";
import { LiteralTestSet } from "../LiteralParser.spec";
import ParserRunner, { tokenize } from "../ParserRunner";

export const MemberExpressionParserTestSet = [
    {
        input: "item",
        expected: new Identifier(0, "item")
    },
    {
        input: "item.item",
        expected: new MemberExpression(
            { start: 0, end: 9 },
            new Identifier(0, "item"),
            new Identifier(5, "item")
        )
    },
    {
        input: "item.item['item3']",
        expected: new MemberExpression(
            { start: 0, end: 17 },
            new Identifier(0, "item"),
            new MemberExpression(
                { start: 5, end: 17 },
                new Identifier(5, "item"),
                new StringLiteral(10, "item3")
            )
        )
    }
];

describe("MemberExpressionParser", () => {
    describe(`Running Literal tests`, () =>
        LiteralTestSet.forEach(({ input, expected }) =>
            it(`Parsing ${input}`, () => {
                const tokens = tokenize(input);
                const error = ParserErrorCreator(tokens);
                const actual = ParserRunner(
                    tokens,
                    new MemberExpressionParser(error)
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
    MemberExpressionParserTestSet.forEach(({ input, expected }) =>
        it(`Parsing ${input}`, () => {
            const tokens = tokenize(input);
            const error = ParserErrorCreator(tokens);
            const parsed = ParserRunner(
                tokens,
                new MemberExpressionParser(error)
            );
            expect(parsed).to.not.be.null;
            expect(parsed).to.be.instanceOf(SyntaxComponent);
            if (parsed instanceof SyntaxComponent) {
                expect(parsed.equals(expected)).to.be.true;
            }
        })
    );
});
