import "mocha";
import { expect } from "chai";
import { ExpressionParser, ParserError } from "../../src/parser";
import { CodeBlock, ReturnExpression } from "../../src/types";
import ParserRunner, { didntFinish } from "./ParserRunner";

const block = new CodeBlock();

const expressions = [
    { input: "return false;", rule: "false" },
    { input: "return 1 == 1;", rule: "1 == 1" },
    {
        input: "return request.auth.uid == 0;",
        rule: "request.auth.uid == 0"
    },
    {
        input: "return request.auth.uid != null && 1 == 1;",
        rule: "request.auth.uid != null && 1 == 1"
    }
];

describe(`ReturnExpression`, () => {
    expressions.forEach(({ input, rule }) => {
        it(`Running parser for ${input}`, () => {
            const pReturn = ParserRunner(
                input,
                new ExpressionParser(block)
            );
            expect(pReturn).to.not.be.instanceOf(ParserError);
            expect(pReturn).to.not.equal(didntFinish);
            if (
                typeof pReturn !== "string" &&
                !(pReturn instanceof ParserError)
            ) {
                expect(pReturn.type).to.equal("Expression");
                expect(pReturn.data).to.be.instanceOf(
                    ReturnExpression
                );
                const rule = (pReturn.data as ReturnExpression)
                    .getValue()
                    .toRule();
                expect(rule).to.equal(rule);
            }
        });
    });
});
