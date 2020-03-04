import { expect } from "chai";
import "mocha";
import ParserErrorCreator from "../../../../src/parser/ParserError";
import ComparisonExpressionParser from "../../../../src/parser/parsers/expression/ComparisonExpressionParser";
import {
    EqualityExpression,
    IsExpression,
    LogicalExpression,
    MemberExpression,
    OrderExpression
} from "../../../../src/parser/types/expressions";
import Identifier from "../../../../src/parser/types/Identifier";
import Literal, {
    BooleanLiteral,
    NumericLiteral,
    StringLiteral,
    TypeLiteral
} from "../../../../src/parser/types/literal";
import {
    Operator,
    Operators
} from "../../../../src/parser/types/Operators";
import SyntaxComponent, {
    Position
} from "../../../../src/parser/types/SyntaxComponent";
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
    position: Position,
    op: Operator,
    first: Literal | MemberExpression | Identifier,
    second: Literal | MemberExpression | Identifier
) => {
    switch (op) {
        case "!=":
        case "==":
            return new EqualityExpression(
                position,
                op,
                first,
                second
            );
        case "&&":
        case "||":
            return new LogicalExpression(position, op, first, second);
        case "is":
        case "only":
        case "isOnly":
            return new IsExpression(position, op, first, second);
        default:
            return new OrderExpression(position, op, first, second);
    }
};

const ComparisonTestSet = LiteralTestSet.map(first =>
    Operators.map(comp =>
        // We add one more than the space, since the token start really happens after the space
        secondSet(first.expected.getEnd() + 1 + comp.length + 2).map(
            second => ({
                input: `${first.input} ${comp} ${second.input}`,
                expected: constructorForCompType(
                    { start: 0, end: second.expected.getEnd() },
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

describe("ComparisonExpressionParser", () => {
    describe(`Running Literal tests`, () =>
        LiteralTestSet.forEach(({ input, expected }) =>
            it(`Parsing ${input}`, () => {
                const tokens = tokenize(input);
                const error = ParserErrorCreator(tokens);
                const actual = ParserRunner(
                    tokens,
                    new ComparisonExpressionParser(error)
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
                    new ComparisonExpressionParser(error)
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
                            new ComparisonExpressionParser(error)
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
});
