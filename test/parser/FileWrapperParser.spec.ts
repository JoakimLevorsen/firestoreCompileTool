import { expect } from "chai";
import "mocha";
import {
    FileWrapperParser,
    ParserErrorCreator
} from "../../src/parser";
import { FileWrapper, Identifier } from "../../src/types";
import { IsExpression } from "../../src/types/expressions/comparison";
import {
    InterfaceLiteral,
    TypeLiteral
} from "../../src/types/literals";
import {
    InterfaceStatement,
    MatchStatement,
    RuleStatement
} from "../../src/types/statements";
import ParserRunner, { tokenize } from "./ParserRunner";

const testSet = [
    {
        input: `interface A {a: string}\n match /foo/{bar} \n{ read: (_, doc) => doc isOnly A \n}`,
        expected: new FileWrapper(77, [
            new InterfaceStatement(
                { start: 0, end: 22 },
                "A",
                new InterfaceLiteral(
                    { start: 12, end: 22 },
                    { a: [new TypeLiteral(16, "string")] }
                )
            ),
            new MatchStatement(
                { start: 25, end: 77 },
                [
                    { name: "foo", wildcard: false },
                    { name: "bar", wildcard: true }
                ],
                [
                    new RuleStatement(
                        { start: 45, end: 74 },
                        ["read"],
                        { newDoc: "doc" },
                        new IsExpression(
                            "isOnly",
                            new Identifier(63, "doc"),
                            new Identifier(74, "A")
                        )
                    )
                ]
            )
        ])
    }
];

describe("FileWrapperParser", () =>
    testSet.forEach(({ input, expected }) =>
        it(`Parsing ${input}`, () => {
            const tokens = tokenize(input);
            const error = ParserErrorCreator(input);
            const actual = ParserRunner(
                tokens,
                new FileWrapperParser(error)
            );
            expect(typeof actual).to.not.be.equal("string");
            expect(actual).to.be.instanceOf(FileWrapper);
            if (actual instanceof FileWrapper) {
                const result = actual.equals(expected);
                expect(result).to.be.true;
            }
        })
    ));
