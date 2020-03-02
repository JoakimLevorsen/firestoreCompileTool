import { expect } from "chai";
import "mocha";
import ParserErrorCreator from "../../../../src/parser/ParserError";
import { InterfaceStatementParser } from "../../../../src/parser/parsers/statement";
import {
    InterfaceLiteral,
    TypeLiteral
} from "../../../../src/parser/types/literal";
import { LiteralOrIdentifier } from "../../../../src/parser/types/LiteralOrIdentifier";
import { InterfaceStatement } from "../../../../src/parser/types/statements";
import ParserRunner, { tokenize } from "../ParserRunner";

const mapFrom = (input: {
    [index: string]: LiteralOrIdentifier[];
}) => {
    const m = new Map<string, LiteralOrIdentifier[]>();
    Object.keys(input).forEach(key => m.set(key, input[key]));
    return m;
};

const testSet = [
    {
        input: `interface A {a: number}`,
        expected: new InterfaceStatement(
            { start: 0, end: 22 },
            "A",
            new InterfaceLiteral(
                { start: 12, end: 22 },
                mapFrom({ a: [new TypeLiteral(16, "number")] })
            )
        )
    },
    {
        input: `interface B {\na: number,\n}`,
        expected: new InterfaceStatement(
            { start: 0, end: 25 },
            "B",
            new InterfaceLiteral(
                { start: 12, end: 25 },
                mapFrom({ a: [new TypeLiteral(17, "number")] })
            )
        )
    },
    {
        input: `interface C \n{\na: string, 3?: number | boolean\nb: {a: number}}`,
        expected: new InterfaceStatement(
            { start: 0, end: 61 },
            "C",
            new InterfaceLiteral(
                { start: 13, end: 61 },
                mapFrom({
                    a: [new TypeLiteral(18, "string")],
                    b: [
                        new InterfaceLiteral(
                            { start: 50, end: 61 },
                            mapFrom({
                                a: [new TypeLiteral(54, "number")]
                            })
                        )
                    ]
                }),
                mapFrom({
                    3: [
                        new TypeLiteral(30, "number"),
                        new TypeLiteral(39, "boolean")
                    ]
                })
            )
        )
    }
];

describe("InterfaceLiteralParser", () => {
    testSet.forEach(({ input, expected }) =>
        it(`Parsing ${input}`, () => {
            const tokens = tokenize(input);
            const error = ParserErrorCreator(tokens);
            const parsed = ParserRunner(
                tokens,
                new InterfaceStatementParser(error)
            );
            expect(parsed).to.be.instanceOf(InterfaceStatement);
            if (parsed instanceof InterfaceStatement) {
                const result = parsed.equals(expected);
                expect(result).to.be.true;
            }
        })
    );
});
