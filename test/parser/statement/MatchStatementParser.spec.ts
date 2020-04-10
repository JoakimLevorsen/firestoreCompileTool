import { expect } from "chai";
import "mocha";
import { ParserErrorCreator } from "../../../src/parser";
import { MatchStatementParser } from "../../../src/parser/statement";
import { Identifier } from "../../../src/types";
import { MemberExpression } from "../../../src/types/expressions";
import {
    EqualityExpression,
    IsExpression
} from "../../../src/types/expressions/comparison";
import {
    BooleanLiteral,
    InterfaceLiteral,
    NumericLiteral,
    TypeLiteral
} from "../../../src/types/literals";
import {
    MatchStatement,
    RuleStatement
} from "../../../src/types/statements";
import ParserRunner, { tokenize } from "../ParserRunner";

const testSet = [
    {
        input: `match /foo/bar { read: (_,old)=> old.public; }`,
        expected: new MatchStatement(
            { start: 0, end: 45 },
            [
                {
                    name: "foo",
                    wildcard: false
                },
                { name: "bar", wildcard: false }
            ],
            [
                new RuleStatement(
                    { start: 17, end: 43 },
                    ["read"],
                    { newDoc: "old" },
                    new MemberExpression(
                        42,
                        new Identifier(33, "old"),
                        new Identifier(37, "public")
                    )
                )
            ]
        )
    },
    {
        input: `match /foo/bar { update, delete:(doc) => doc.public; }`,
        expected: new MatchStatement(
            { start: 0, end: 53 },
            [
                {
                    name: "foo",
                    wildcard: false
                },
                { name: "bar", wildcard: false }
            ],
            [
                new RuleStatement(
                    { start: 17, end: 51 },
                    ["update", "delete"],
                    {},
                    new MemberExpression(
                        50,
                        new Identifier(41, "doc"),
                        new Identifier(45, "public")
                    )
                )
            ]
        )
    },
    {
        input: `match /foo/bar { \n read:() => true;\n write: (doc) => doc.public == 10; \n }`,
        expected: new MatchStatement(
            { start: 0, end: 73 },
            [
                {
                    name: "foo",
                    wildcard: false
                },
                { name: "bar", wildcard: false }
            ],
            [
                new RuleStatement(
                    { start: 19, end: 34 },
                    ["read"],
                    {},
                    new BooleanLiteral(30, true)
                ),
                new RuleStatement(
                    { start: 37, end: 69 },
                    ["write"],
                    { newDoc: "doc" },
                    new EqualityExpression(
                        "==",
                        new MemberExpression(
                            62,
                            new Identifier(53, "doc"),
                            new Identifier(57, "public")
                        ),
                        new NumericLiteral(67, 10)
                    )
                )
            ]
        )
    },
    {
        input: `match /foo/bar { match /boo/far { read: (_, doc) => doc is { a: string } } }`,
        expected: new MatchStatement(
            { start: 0, end: 75 },
            [
                { name: "foo", wildcard: false },
                { name: "bar", wildcard: false }
            ],
            [],
            [
                new MatchStatement(
                    { start: 17, end: 73 },
                    [
                        { name: "boo", wildcard: false },
                        { name: "far", wildcard: false }
                    ],
                    [
                        new RuleStatement(
                            { start: 34, end: 73 },
                            ["read"],
                            { oldDoc: "doc" },
                            new IsExpression(
                                "is",
                                new Identifier(52, "doc"),
                                new InterfaceLiteral(
                                    { start: 59, end: 71 },
                                    {
                                        a: [
                                            new TypeLiteral(
                                                69,
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
            const error = ParserErrorCreator(input);
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
