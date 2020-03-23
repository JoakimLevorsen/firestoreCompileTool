import { expect } from "chai";
import "mocha";
import { CallExpression } from "../../../src/types/expressions/CallExpression";
import { Identifier } from "../../../src/types";
import ParserRunner, { tokenize } from "../ParserRunner";
import { ParserErrorCreator } from "../../../src/parser";
import SyntaxComponent from "../../../src/types/SyntaxComponent";
import CallExpressionParser from "../../../src/parser/expression/CallExpressionParser";
import { MemberExpression } from "../../../src/types/expressions";
import {
    BooleanLiteral,
    NumericLiteral
} from "../../../src/types/literals";
import { MemberExpressionParserTestSet } from "./MemberExpressionParser.spec";

const TestSet = [
    {
        input: "a()",
        expected: new CallExpression(2, new Identifier(0, "a"))
    },
    {
        input: "a.b(true, 2.2)",
        expected: new CallExpression(
            13,
            new MemberExpression(
                2,
                new Identifier(0, "a"),
                new Identifier(2, "b")
            ),
            [new BooleanLiteral(4, true), new NumericLiteral(10, 2.2)]
        )
    },
    {
        input: "a.cebra(dims(), false, a.b())",
        expected: new CallExpression(
            28,
            new MemberExpression(
                6,
                new Identifier(0, "a"),
                new Identifier(2, "cebra")
            ),
            [
                new CallExpression(13, new Identifier(8, "dims")),
                new BooleanLiteral(16, false),
                new CallExpression(
                    27,
                    new MemberExpression(
                        25,
                        new Identifier(23, "a"),
                        new Identifier(25, "b")
                    )
                )
            ]
        )
    }
];

describe("CallExpressionParser", () =>
    [...TestSet, ...MemberExpressionParserTestSet].forEach(
        ({ input, expected }) =>
            it(`Testing ${input}`, () => {
                const tokens = tokenize(input);
                const error = ParserErrorCreator(tokens);
                const parsed = ParserRunner(
                    tokens,
                    new CallExpressionParser(error)
                );
                expect(parsed).to.not.be.null;
                expect(parsed).to.be.instanceOf(SyntaxComponent);
                if (parsed instanceof SyntaxComponent) {
                    const result = parsed.equals(expected);
                    expect(result).to.be.true;
                }
            })
    ));
