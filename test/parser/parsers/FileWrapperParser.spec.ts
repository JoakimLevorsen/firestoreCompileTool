import { expect } from "chai";
import "mocha";
import ParserErrorCreator from "../../../src/parser/ParserError";
import FileWrapperParser from "../../../src/parser/parsers/FileWrapperParser";
import { IsExpression } from "../../../src/parser/types/expressions";
import FileWrapper from "../../../src/parser/types/FileWrapper";
import Identifier from "../../../src/parser/types/Identifier";
import {
    InterfaceLiteral,
    TypeLiteral
} from "../../../src/parser/types/literal";
import {
    InterfaceStatement,
    MatchStatement,
    RuleStatement
} from "../../../src/parser/types/statements";
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
                            { start: 63, end: 74 },
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
            const error = ParserErrorCreator(tokens);
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
