import { expect } from "chai";
import "mocha";
import FileWrapper from "../../../src/parser/types/FileWrapper";
import FileWrapperParser from "../../../src/parser/parsers/FileWrapperParser";
import {
    InterfaceStatement,
    MatchStatement,
    RuleStatement
} from "../../../src/parser/types/statements";
import {
    InterfaceLiteral,
    TypeLiteral
} from "../../../src/parser/types/literal";
import { IsExpression } from "../../../src/parser/types/expressions";
import Identifier from "../../../src/parser/types/Identifier";
import ParserRunner, { tokenize } from "./ParserRunner";
import ParserErrorCreator from "../../../src/parser/ParserError";

const testSet = [
    {
        input: `interface A {a: string}\n match /foo/{bar} \n{ read: doc isOnly A \n}`,
        expected: new FileWrapper(65, [
            new InterfaceStatement(
                { start: 0, end: 22 },
                "A",
                new InterfaceLiteral(
                    { start: 12, end: 22 },
                    { a: [new TypeLiteral(16, "string")] }
                )
            ),
            new MatchStatement(
                { start: 25, end: 65 },
                [
                    { name: "foo", wildcard: false },
                    { name: "bar", wildcard: true }
                ],
                [
                    new RuleStatement(
                        { start: 45, end: 64 },
                        ["read"],
                        new IsExpression(
                            { start: 51, end: 64 },
                            "isOnly",
                            new Identifier(51, "doc"),
                            new Identifier(62, "A")
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
