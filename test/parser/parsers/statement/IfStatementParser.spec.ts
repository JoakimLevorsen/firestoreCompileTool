import { expect } from "chai";
import "mocha";
import ParserErrorCreator from "../../../../src/parser/ParserError";
import IfStatementParser from "../../../../src/parser/parsers/statement/IfStatementParser";
import { EqualityExpression } from "../../../../src/parser/types/expressions";
import Identifier from "../../../../src/parser/types/Identifier";
import { BooleanLiteral } from "../../../../src/parser/types/literal";
import BlockStatement from "../../../../src/parser/types/statements/BlockStatement";
import IfStatement from "../../../../src/parser/types/statements/IfStatement";
import ReturnStatement from "../../../../src/parser/types/statements/ReturnStatement";
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
        input: `if a == true {
            return true
        }`,
        expected: new IfStatement(
            0,
            new EqualityExpression(
                { start: 3, end: 11 },
                "==",
                new Identifier(3, "a"),
                new BooleanLiteral(8, true)
            ),
            new BlockStatement({ start: 13, end: 48 }, [
                new ReturnStatement(14, new BooleanLiteral(34, true))
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
            new BlockStatement({ start: 48, end: 85 }, [
                new ReturnStatement(50, new BooleanLiteral(70, false))
            ])
        )
    }
];

describe("IfStatementParser", () =>
    IfStatementTestSet.forEach(({ input, expected }) =>
        it(`Parsing ${input}`, () => {
            const tokens = tokenize(input);
            const error = ParserErrorCreator(tokens);
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
