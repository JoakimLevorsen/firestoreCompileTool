import { expect } from "chai";
import "mocha";
import { Interface, KeywordObject } from "../../src/types";

const testInterfaces: { [id: string]: Interface } = {
    a: {
        a: { optional: false, multiType: false, value: "String" },
        b: {
            multiType: true,
            optional: true,
            value: ["String", "Timestamp"]
        }
    },
    b: {}
};

const defaultPathAndParm: [typeof testInterfaces, string[]] = [
    testInterfaces,
    ["a", "b"]
];

const parmForString = (
    parm: string
): [string, typeof testInterfaces, string[]] => [
    parm,
    testInterfaces,
    ["a", "b"]
];

const inputs: Array<[string, string, string | null]> = [
    ["request.resource.id", "request.resource.id", null],
    ["request.resource", "request.resource", "request.resource.data"],
    ["a", "request.resource", "request.resource.data"],
    ["b", "request.resource", "request.resource.data"],
    ["a.a", "request.resource.data.a", "request.resource.data.a"],
    ["resource", "resource", "resource.data"],
    ["resource.a", "resource.data.a", "resource.data.a"],
    ["resource.auth.uid", "resource.auth.uid", null]
];

describe("KeywordObject", () => {
    for (const input of inputs) {
        it(`Input '${JSON.stringify(
            input[0]
        )}' should give toString ${input[1]} and toStringAsData of ${
            input[2]
        }`, () => {
            const k = new KeywordObject(...parmForString(input[0]));
            expect(k.toString()).to.equal(input[1]);
            expect(k.toStringAsData()).to.equal(input[2]);
        });
    }
});
