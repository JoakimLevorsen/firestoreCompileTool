import { expect } from "chai";
import * as fs from "fs";
import "mocha";
import { extractNextToken } from "../../src/parser/TokenParser";
import { Token, TokenType } from "../../src/types";
import { testFiles } from "../constants/TokenParser";

const nonKeywordTokens: {
    [id: string]: { type: TokenType };
} = {
    ",": { type: "Comma" },
    ".": { type: "Dot" },
    "/": { type: "Slash" },
    ":": { type: "Colon" },
    ";": { type: "SemiColon" },
    "=": { type: "Equals" },
    "?": { type: "QuestionMark" },
    "[": { type: "IndexOpen" },
    "]": { type: "IndexClose" },
    "{": { type: "BlockOpen" },
    "|": { type: "Or" },
    "}": { type: "BlockClose" },
    "≠": { type: "NotEquals" }
};

// Note we don't test for KeywordObjects, since they're convered in another test

describe("TokenParser", () => {
    describe("Non Keyword Tokens", () => {
        Object.keys(nonKeywordTokens).forEach(key => {
            const expectedValue = nonKeywordTokens[key]!.type;
            it(`'${key}' should be extracted as ${expectedValue}`, () =>
                expect(extractNextToken(key)!.token.type).to.equal(
                    expectedValue
                ));
        });
    });
    describe("File reader tests", () => {
        for (const file of testFiles) {
            let stringFile = fs.readFileSync(file.path).toString();
            let tokens: Token[] = [];
            while (!/^\s*$/.test(stringFile)) {
                const next = extractNextToken(stringFile);
                if (next === null) {
                    break;
                }
                tokens.push(next.token);
                stringFile = next.remaining;
            }
            it(`File for path ${file.path} should have the correct tokens`, () =>
                expect(tokens).to.eql(file.expectedTokens));
        }
        expect(true).to.equal(true);
    });
});
