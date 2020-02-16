import { expect } from "chai";
import "mocha";
import ParserErrorCreator from "../../../../src/parser/ParserError";
import { MatchStatementParser } from "../../../../src/parser/parsers/statement";
import {
    EqualityExpression,
    IsExpression,
    MemberExpression
} from "../../../../src/parser/types/expressions";
import Identifier from "../../../../src/parser/types/Identifier";
import {
    BooleanLiteral,
    InterfaceLiteral,
    NumericLiteral,
    TypeLiteral
} from "../../../../src/parser/types/literal";
import {
    MatchStatement,
    RuleStatement
} from "../../../../src/parser/types/statements";
import ParserRunner, { tokenize } from "../ParserRunner";

const testSet = [
    {
        input: `match /foo/bar { read: doc.public; }`,
        expected: new MatchStatement(
            { start: 0, end: 35 },
            [
                {
                    name: "foo",
                    wildcard: false
                },
                { name: "bar", wildcard: false }
            ],
            [
                new RuleStatement(
                    { start: 17, end: 34 },
                    ["read"],
                    new MemberExpression(
                        { start: 23, end: 32 },
                        new Identifier(23, "doc"),
                        new Identifier(27, "public")
                    )
                )
            ]
        )
    },
    {
        input: `match /foo/bar { read, write: doc.public; }`,
        expected: new MatchStatement(
            { start: 0, end: 42 },
            [
                {
                    name: "foo",
                    wildcard: false
                },
                { name: "bar", wildcard: false }
            ],
            [
                new RuleStatement(
                    { start: 17, end: 41 },
                    ["read", "write"],
                    new MemberExpression(
                        { start: 30, end: 39 },
                        new Identifier(30, "doc"),
                        new Identifier(34, "public")
                    )
                )
            ]
        )
    },
    {
        input: `match /foo/bar { \n read: true;\n write: doc.public == 10; \n }`,
        expected: new MatchStatement(
            { start: 0, end: 59 },
            [
                {
                    name: "foo",
                    wildcard: false
                },
                { name: "bar", wildcard: false }
            ],
            [
                new RuleStatement(
                    { start: 19, end: 31 },
                    ["read"],
                    new BooleanLiteral(25, true)
                ),
                new RuleStatement(
                    { start: 32, end: 58 },
                    ["write"],
                    new EqualityExpression(
                        { start: 39, end: 54 },
                        "==",
                        new MemberExpression(
                            { start: 39, end: 48 },
                            new Identifier(39, "doc"),
                            new Identifier(43, "public")
                        ),
                        new NumericLiteral(53, 10)
                    )
                )
            ]
        )
    },
    {
        input: `match /foo/bar { match /boo/far { read: doc is { a: string } } }`,
        expected: new MatchStatement(
            { start: 0, end: 63 },
            [
                { name: "foo", wildcard: false },
                { name: "bar", wildcard: false }
            ],
            [],
            [
                new MatchStatement(
                    { start: 17, end: 61 },
                    [
                        { name: "boo", wildcard: false },
                        { name: "far", wildcard: false }
                    ],
                    [
                        new RuleStatement(
                            { start: 34, end: 59 },
                            ["read"],
                            new IsExpression(
                                { start: 40, end: 59 },
                                "is",
                                new Identifier(40, "doc"),
                                new InterfaceLiteral(
                                    { start: 47, end: 59 },
                                    {
                                        a: [
                                            new TypeLiteral(
                                                52,
                                                "string"
                                            )
                                        ]
                                    }
                                )
                            )
                        )
                    ]
                )
            ]
        )
    }
];

describe("MatchStatementParser", () =>
    testSet.forEach(({ input, expected }) =>
        it(`Parsing ${input}`, () => {
            const tokens = tokenize(input);
            const error = ParserErrorCreator(tokens);
            const actual = ParserRunner(
                tokens,
                new MatchStatementParser(error)
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
