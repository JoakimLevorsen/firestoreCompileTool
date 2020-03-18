import { expect } from "chai";
import "mocha";
import { ParserErrorCreator } from "../../src/parser";
import { InterfaceLiteralParser } from "../../src/parser/literal";
import { Identifier } from "../../src/types";
import Literal, {
    InterfaceLiteral,
    TypeLiteral
} from "../../src/types/literals";
import ParserRunner, { tokenize } from "./ParserRunner";

const mapFrom = (input: {
    [index: string]: Array<Literal | Identifier>;
}) => {
    const m = new Map<string, Array<Literal | Identifier>>();
    Object.keys(input).forEach(key => m.set(key, input[key]));
    return m;
};

const testSet = [
    {
        input: `{a: TimeStamp}`,
        expected: new InterfaceLiteral(
            { start: 0, end: 13 },
            mapFrom({ a: [new TypeLiteral(4, "TimeStamp")] })
        )
    },
    {
        input: `{a: number,}`,
        expected: new InterfaceLiteral(
            { start: 0, end: 11 },
            mapFrom({ a: [new TypeLiteral(4, "number")] })
        )
    },
    {
        input: `{\na: string, 3?: TimeStamp | boolean\nb: {a: number}}`,
        expected: new InterfaceLiteral(
            { start: 0, end: 51 },
            mapFrom({
                a: [new TypeLiteral(5, "string")],
                b: [
                    new InterfaceLiteral(
                        { start: 40, end: 50 },
                        mapFrom({
                            a: [new TypeLiteral(44, "number")]
                        })
                    )
                ]
            }),
            mapFrom({
                3: [
                    new TypeLiteral(17, "TimeStamp"),
                    new TypeLiteral(29, "boolean")
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
