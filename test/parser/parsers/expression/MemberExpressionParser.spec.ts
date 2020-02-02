import { expect } from "chai";
import "mocha";
import ParserErrorCreator from "../../../../src/parser/ParserError";
import MemberExpressionParser from "../../../../src/parser/parsers/expression/MemberExpressionParser";
import MemberExpression from "../../../../src/parser/types/expressions/MemberExpression";
import Identifier from "../../../../src/parser/types/Identifier";
import StringLiteral from "../../../../src/parser/types/literal/StringLiteral";
import SyntaxComponent from "../../../../src/parser/types/SyntaxComponent";
import ParserRunner, { tokenize } from "../ParserRunner";

const testItems = [
    {
        input: "item",
        expected: new Identifier({ start: 0, end: 4 }, "item")
    },
    {
        input: "item.item",
        expected: new MemberExpression(
            { start: 0, end: 9 },
            new Identifier({ start: 0, end: 4 }, "item"),
            new Identifier({ start: 5, end: 9 }, "item")
        )
    },
    {
        input: "item.item['item3']",
        expected: new MemberExpression(
            { start: 0, end: 17 },
            new Identifier({ start: 0, end: 4 }, "item"),
            new MemberExpression(
                { start: 5, end: 17 },
                new Identifier({ start: 5, end: 9 }, "item"),
                new StringLiteral({ start: 10, end: 16 }, "item3")
            )
        )
    }
];

describe("MemberExpressionParser", () => {
    testItems.forEach(({ input, expected }) =>
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
