import { expect } from "chai";
import "mocha";
import { ParserErrorCreator } from "../../../src/parser";
import { IfStatementParser } from "../../../src/parser/statement";
import { Identifier } from "../../../src/types";
import {
    EqualityExpression,
    MemberExpression
} from "../../../src/types/expressions/comparison";
import { BooleanLiteral } from "../../../src/types/literals";
import {
    BlockStatement,
    IfStatement,
    ReturnStatement
} from "../../../src/types/statements";
import ParserRunner, { tokenize } from "../ParserRunner";

export const IfStatementTestSet = [
    {
        input: `if true {return true}`,
        expected: new IfStatement(
            0,
            new BooleanLiteral(3, true),
            new BlockStatement({ start: 8, end: 21 }, [
                new ReturnStatement(9, new BooleanLiteral(16, true))
            ])
        )
    },
    {
        input: `if (a == true) {
            return true
        }`,
        expected: new IfStatement(
            0,
            new EqualityExpression(
                "==",
                new Identifier(4, "a"),
                new BooleanLiteral(9, true)
            ),
            new BlockStatement({ start: 15, end: 50 }, [
                new ReturnStatement(16, new BooleanLiteral(36, true))
            ])
        )
    },
    {
        input: `if true {
            return true
        } else {
            return false
        }`,
        expected: new IfStatement(
            0,
            new BooleanLiteral(3, true),
            new BlockStatement({ start: 8, end: 43 }, [
                new ReturnStatement(9, new BooleanLiteral(29, true))
            ]),
            new BlockStatement({ start: 49, end: 85 }, [
                new ReturnStatement(50, new BooleanLiteral(70, false))
            ])
        )
    },
    {
        input: "if (a.b.c) {return true}",
        expected: new IfStatement(
            0,
            new MemberExpression(
                8,
                new MemberExpression(
                    6,
                    new Identifier(4, "a"),
                    new Identifier(6, "b")
                ),
                new Identifier(8, "c")
            ),
            new BlockStatement({ start: 11, end: 24 }, [
                new ReturnStatement(12, new BooleanLiteral(19, true))
            ])
        )
    }
];

describe("IfStatementParser", () =>
    IfStatementTestSet.forEach(({ input, expected }) =>
        it(`Parsing ${input}`, () => {
            const tokens = tokenize(input);
            const error = ParserErrorCreator(input);
            const actual = ParserRunner(
                tokens,
                new IfStatementParser(error)
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
