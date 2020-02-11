import { expect } from "chai";
import "mocha";
import ParserErrorCreator from "../../../src/parser/ParserError";
import InterfaceLiteralParser from "../../../src/parser/parsers/literal/InterfaceLiteralParser";
import InterfaceLiteral from "../../../src/parser/types/literal/InterfaceLiteral";
import TypeLiteral from "../../../src/parser/types/literal/TypeLiteral";
import { LiteralOrIdentifier } from "../../../src/parser/types/LiteralOrIdentifier";
import ParserRunner, { tokenize } from "./ParserRunner";

const mapFrom = (input: {
    [index: string]: LiteralOrIdentifier[];
}) => {
    const m = new Map<string, LiteralOrIdentifier[]>();
    Object.keys(input).forEach(key => m.set(key, input[key]));
    return m;
};

const testSet = [
    // {
    //     input: `{a: number}`,
    //     expected: new InterfaceLiteral(
    //         { start: 0, end: 10 },
    //         mapFrom({ a: [new TypeLiteral(4, "number")] })
    //     )
    // },
    {
        input: `{a: number,}`,
        expected: new InterfaceLiteral(
            { start: 0, end: 11 },
            mapFrom({ a: [new TypeLiteral(4, "number")] })
        )
    },
    {
        input: `{\na: string, 3?: number | boolean\nb: {a: number}}`,
        expected: new InterfaceLiteral(
            { start: 0, end: 48 },
            mapFrom({
                a: [new TypeLiteral(5, "string")],
                b: [
                    new InterfaceLiteral(
                        { start: 37, end: 47 },
                        mapFrom({
                            a: [new TypeLiteral(41, "number")]
                        })
                    )
                ]
            }),
            mapFrom({
                3: [
                    new TypeLiteral(17, "number"),
                    new TypeLiteral(26, "boolean")
                ]
            })
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
                new InterfaceLiteralParser(error)
            );
            expect(parsed).to.be.instanceOf(InterfaceLiteral);
            if (parsed instanceof InterfaceLiteral) {
                const result = parsed.equals(expected);
                expect(result).to.be.true;
                const optionalResult =
                    parsed.equalsWithOptionals(expected) &&
                    expected.equalsWithOptionals(parsed);
                expect(optionalResult).to.be.true;
            }
        })
    );
});
