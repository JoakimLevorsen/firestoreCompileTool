import { expect } from "chai";
import "mocha";
import ParserErrorCreator from "../../../../src/parser/ParserError";
import ComparisonExpressionParser from "../../../../src/parser/parsers/expression/ComparisonExpressionParser";
import EqualityExpression from "../../../../src/parser/types/expressions/EqualityExpression";
import IsExpression from "../../../../src/parser/types/expressions/IsExpression";
import LogicalExpression from "../../../../src/parser/types/expressions/LogicalExpression";
import MemberExpression from "../../../../src/parser/types/expressions/MemberExpression";
import {
    Operator,
    Operators
} from "../../../../src/parser/types/expressions/Operators";
import Identifier from "../../../../src/parser/types/Identifier";
import BooleanLiteral from "../../../../src/parser/types/literal/BooleanLiteral";
import Literal from "../../../../src/parser/types/literal/Literal";
import NumericLiteral from "../../../../src/parser/types/literal/NumericLiteral";
import StringLiteral from "../../../../src/parser/types/literal/StringLiteral";
import SyntaxComponent, {
    Position
} from "../../../../src/parser/types/SyntaxComponent";
import { LiteralTestSet } from "../LiteralParser.spec";
import ParserRunner, { tokenize } from "../ParserRunner";
import { MemberExpressionParserTestSet } from "./MemberExpressionParser.spec";

const itemTestSet = [
    ...LiteralTestSet
    // ...MemberExpressionParserTestSet
];

const secondSet = (start: number) =>
    itemTestSet.map(({ input, expected }) => {
        const end = start + input.length;
        if (expected instanceof BooleanLiteral)
            return {
                input,
                expected: new BooleanLiteral(
                    { start, end },
                    expected.value
                )
            };
        if (expected instanceof NumericLiteral)
            return {
                input,
                expected: new NumericLiteral(
                    { start, end },
                    expected.value
                )
            };
        if (expected instanceof StringLiteral)
            return {
                input,
                expected: new StringLiteral(
                    { start, end: end - 1 },
                    expected.value
                )
            };
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
        default:
            return new IsExpression(position, op, first, second);
    }
};

const ComparisonTestSet = itemTestSet
    .map(first =>
        Operators.map(comp =>
            secondSet(first.input.length + 1 + comp.length + 1).map(
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
    )
    .reduce((pV, v) => {
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
            it(`testing ${comp[0].expected.getOperator()}`, () => {
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