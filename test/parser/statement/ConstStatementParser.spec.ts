import { expect } from "chai";
import "mocha";
import { ParserErrorCreator } from "../../../src/parser";
import { ConstStatementParser } from "../../../src/parser/statement";
import { Identifier } from "../../../src/types";
import { MemberExpression } from "../../../src/types/expressions";
import { NumericLiteral } from "../../../src/types/literals";
import { ConstStatement } from "../../../src/types/statements";
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
