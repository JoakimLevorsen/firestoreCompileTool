import "mocha";
import { expect } from "chai";
import { MatchBlock, CodeBlock } from "../../../src/types";
import ParserRunner from "../ParserRunner";
import { IfBlockParser, ParserError } from "../../../src/parser";

const parent = new MatchBlock();
parent.setPath("/foo/bar", "bar");
parent.addInterface("A", {
    b: { value: "String", multiType: false, optional: false }
});
const block = new CodeBlock(parent);

const expressions = [
    [
        "if bar isOnly A {\nreturn true;\n}\nreturn false;}",
        `((request.resource.keys().hasAll(['b'])&&(request.resource.bisstring)&&request.resource.keys().hasOnly(['b']))&&(true))`
    ],
    [
        "if bar isOnly A {\nreturn request.auth != null;\n}\nreturn false;}",
        `((request.resource.keys().hasAll(['b'])&&(request.resource.bisstring)&&request.resource.keys().hasOnly(['b']))&&(request.auth!=null))`
    ],
    [
        "if (bar isOnly A) {\nreturn request.auth != null;\n}\nreturn false;}",
        `((request.resource.keys().hasAll(['b'])&&(request.resource.bisstring)&&request.resource.keys().hasOnly(['b']))&&(request.auth!=null))`
    ]
];

describe("IfBlock", () => {
    expressions.forEach(([input, expectedRule]) => {
        it(`Running parser for ${input}`, () => {
            const pReturn = ParserRunner(
                input,
                new IfBlockParser(block)
            );
            expect(pReturn).to.not.be.instanceOf(ParserError);
            expect(typeof pReturn).to.not.equal("string");
            if (
                typeof pReturn !== "string" &&
                !(pReturn instanceof ParserError)
            ) {
                const rule = pReturn.data.toRule();
                expect(rule.replace(/\s/g, "")).to.equal(
                    expectedRule
                );
            }
        });
    });
});
