import { expect } from "chai";
import "mocha";
import ParserErrorCreator from "../../../../src/parser/ParserError";
import { ConstStatementParser } from "../../../../src/parser/parsers/statement";
import { MemberExpression } from "../../../../src/parser/types/expressions";
import Identifier from "../../../../src/parser/types/Identifier";
import { NumericLiteral } from "../../../../src/parser/types/literal";
import { ConstStatement } from "../../../../src/parser/types/statements";
import ParserRunner, { tokenize } from "../ParserRunner";

const testSet = [
    {
        input: "const a = 2",
        expected: new ConstStatement(
            { start: 0, end: 10 },
            "a",
            new NumericLiteral(10, 2)
        )
    },
    {
        input: "const a = foo.bar",
        expected: new ConstStatement(
            { start: 0, end: 16 },
            "a",
            new MemberExpression(
                { start: 10, end: 16 },
                new Identifier(10, "foo"),
                new Identifier(14, "bar")
            )
        )
    }
];

describe("ConstStatementParser", () =>
    testSet.forEach(({ input, expected }) =>
        it(`Parsing ${input}`, () => {
            const tokens = tokenize(input);
            const error = ParserErrorCreator(tokens);
            const parsed = ParserRunner(
                tokens,
                new ConstStatementParser(error)
            );
            expect(parsed).to.be.instanceOf(ConstStatement);
            if (parsed instanceof ConstStatement) {
                const result = parsed.equals(expected);
                expect(result).to.be.true;
            }
        })
    ));
