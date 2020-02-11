import { expect } from "chai";
import "mocha";
import ParserErrorCreator from "../../../../src/parser/ParserError";
import ConstStatementParser from "../../../../src/parser/parsers/statement/ConstStatementParser";
import NumericLiteral from "../../../../src/parser/types/literal/NumericLiteral";
import ConstStatement from "../../../../src/parser/types/statements/ConstStatement";
import ParserRunner, { tokenize } from "../ParserRunner";

const testSet = [
    {
        input: "const a = 2",
        expected: new ConstStatement(
            { start: 0, end: 10 },
            "a",
            new NumericLiteral(10, 2)
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
