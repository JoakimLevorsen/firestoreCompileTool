import "mocha";
import { expect } from "chai";
import {
    Block,
    Interface,
    valueForToken,
    InterfaceValue
} from "../../src/types";

const scope = new Block();

const A: Interface = {
    a: { optional: false, value: "String", multiType: false },
    b: { optional: false, value: "Number", multiType: false }
};
scope.addInterface("A", A);

const B: Interface = {
    a: {
        optional: true,
        value: ["String", "Number"],
        multiType: true
    },
    b: { optional: false, value: "null", multiType: false }
};
scope.addInterface("B", B);

const vForString = (value: string) =>
    valueForToken({ type: "Keyword", value }, scope);

describe("InterfaceValue", () => {
    [
        { input: "A.b", value: A.b },
        { input: "A", value: A },
        { input: "B.a", value: B.a },
        { input: "B", value: B }
    ].forEach(({ input, value }) => {
        it(`${input} should return ${value}`, () => {
            const result = vForString(input) as InterfaceValue;
            expect(result).to.be.instanceOf(InterfaceValue);
            expect(result.getValue()).to.deep.equal(value);
        });
    });
});
