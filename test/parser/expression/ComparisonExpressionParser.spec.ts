import { expect } from "chai";
import "mocha";
import { ParserErrorCreator } from "../../../src/parser";
import ExpressionParser from "../../../src/parser/expression/ExpressionParser";
import { Identifier } from "../../../src/types";
import { MemberExpression } from "../../../src/types/expressions";
import {
    ComparisonOperator,
    ComparisonOperators,
    EqualityExpression,
    IsExpression,
    LogicalExpression,
    MathExpression,
    OrderExpression
} from "../../../src/types/expressions/comparison";
import Literal, {
    BooleanLiteral,
    NumericLiteral,
    StringLiteral,
    TypeLiteral
} from "../../../src/types/literals";
import SyntaxComponent from "../../../src/types/SyntaxComponent";
import { LiteralTestSet } from "../LiteralParser.spec";
import ParserRunner, { tokenize } from "../ParserRunner";
import { MemberExpressionParserTestSet } from "./MemberExpressionParser.spec";

const secondSet = (start: number) =>
    LiteralTestSet.map(item => {
        const { input, expected } = item;
        if (expected instanceof BooleanLiteral)
            return {
                input,
                expected: new BooleanLiteral(start, expected.value)
            };
        if (expected instanceof NumericLiteral)
            return {
                input,
                expected: new NumericLiteral(start, expected.value)
            };
        if (expected instanceof StringLiteral)
            return {
                input,
                expected: new StringLiteral(start, expected.value)
            };
        if (expected instanceof TypeLiteral) {
            return {
                input,
                expected: new TypeLiteral(start, expected.value)
            };
        }
        throw new Error("Unexpected behavior");
    });

const constructorForCompType = (
    op: ComparisonOperator,
    first: Literal | MemberExpression | Identifier,
    second: Literal | MemberExpression | Identifier
) => {
    switch (op) {
        case "!=":
        case "==":
            return new EqualityExpression(op, first, second);
        case "&&":
        case "||":
            return new LogicalExpression(op, first, second);
        case "is":
        case "only":
        case "isOnly":
            return new IsExpression(op, first, second);
        case "+":
        case "-":
        case "*":
        case "/":
            return new MathExpression(op, first, second);
        default:
            return new OrderExpression(op, first, second);
    }
};

const ComparisonTestSet = LiteralTestSet.map(first =>
    ComparisonOperators.map(comp =>
        // We add one more than the space, since the token start really happens after the space
        secondSet(first.expected.end + 1 + comp.length + 2).map(
            second => ({
                input: `${first.input} ${comp} ${second.input}`,
                expected: constructorForCompType(
                    comp,
                    first.expected,
                    second.expected
                )
            })
        )
    )
).reduce((pV, v) => {
    pV.forEach((_, i) => (pV[i] = pV[i].concat(v[i])));
    return pV;
});

const moreDifficultComparisons = [
    {
        input: "(a == true) && (z isOnly K)",
        expected: new LogicalExpression(
            "&&",
            new EqualityExpression(
                "==",
                new Identifier(1, "a"),
                new BooleanLiteral(6, true)
            ),
            new IsExpression(
                "isOnly",
                new Identifier(16, "z"),
                new Identifier(25, "K")
            )
        )
    },
    // TODO: Fix so this test is valid
    {
        input: "a == true && z isOnly K",
        expected: new LogicalExpression(
            "&&",
            new EqualityExpression(
                "==",
                new Identifier(0, "a"),
                new BooleanLiteral(5, true)
            ),
            new IsExpression(
                "isOnly",
                new Identifier(13, "z"),
                new Identifier(22, "K")
            )
        )
    }
];

describe("ComparisonExpressionParser", () => {
    describe(`Running Literal tests`, () =>
        LiteralTestSet.forEach(({ input, expected }) =>
            it(`Parsing ${input}`, () => {
                const tokens = tokenize(input);
                const error = ParserErrorCreator(tokens);
                const actual = ParserRunner(
                    tokens,
                    new ExpressionParser(error)
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
    describe("Running MemberExpressionParser", () =>
        MemberExpressionParserTestSet.forEach(({ input, expected }) =>
            it(`Parsing ${input}`, () => {
                const tokens = tokenize(input);
                const error = ParserErrorCreator(tokens);
                const parsed = ParserRunner(
                    tokens,
                    new ExpressionParser(error)
                );
                expect(parsed).to.not.be.null;
                expect(parsed).to.be.instanceOf(SyntaxComponent);
                if (parsed instanceof SyntaxComponent) {
                    expect(parsed.equals(expected)).to.be.true;
                }
            })
        ));
    describe("Testing all Comparison items", () =>
        ComparisonTestSet.forEach(comp =>
            it(`testing ${comp[0].expected.operator}`, () => {
                comp.forEach(({ input, expected }) => {
                    let parsed;
                    try {
                        const tokens = tokenize(input);
                        const error = ParserErrorCreator(tokens);
                        parsed = ParserRunner(
                            tokens,
                            new ExpressionParser(error)
                        );
                    } catch (e) {
                        // tslint:disable-next-line: no-console
                        console.error("got error", e);
                        throw e;
                    }
                    expect(parsed).to.not.be.null;
                    expect(parsed).to.be.instanceOf(SyntaxComponent);
                    if (parsed instanceof SyntaxComponent) {
                        const equal = parsed.equals(expected);
                        expect(equal).to.be.true;
                    }
                });
            })
        ));
    describe("Testing more difficult comparisons", () =>
        moreDifficultComparisons.forEach(({ input, expected }) =>
            it(`Testing ${input}`, () => {
                let parsed;
                try {
                    const tokens = tokenize(input);
                    const error = ParserErrorCreator(tokens);
                    parsed = ParserRunner(
                        tokens,
                        new ExpressionParser(error)
                    );
                } catch (e) {
                    // tslint:disable-next-line: no-console
                    console.error("got error", e);
                    throw e;
                }
                expect(parsed).to.not.be.null;
                expect(parsed).to.be.instanceOf(SyntaxComponent);
                if (parsed instanceof SyntaxComponent) {
                    const equal = parsed.equals(expected);
                    expect(equal).to.be.true;
                }
            })
        ));
});
