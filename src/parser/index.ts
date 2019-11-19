import chalk from "chalk";
import { Block, Token } from "../types";
import InterfaceParser from "./InterfaceParser";
import MatchParser from "./matchParser";
import ParserError from "./ParserError";

export type WAIT = "WAIT";
export const WAIT: WAIT = "WAIT";

const parsers = [InterfaceParser, MatchParser];

const parse = (input: string) => {
    let done = false;
    let remaining = input;
    const block: Block = { interfaces: {}, matchGroups: [] };
    let myParsers = parsers.map(p => new p(block.interfaces));
    const blockHistory: Array<ReturnType<
        typeof extractNextBlock
    >> = [];
    while (!done) {
        const nextBlock = extractNextBlock(remaining);
        blockHistory.push(nextBlock);
        if (nextBlock === null) {
            done = true;
            break;
        }
        const parserResponses = myParsers.map(p =>
            p.addToken(nextBlock.token)
        );
        parserResponses.forEach((p, i) => {
            if (p === "WAIT") {
                return;
            } else if (p instanceof ParserError) {
                myParsers.splice(i, 1);
                console.error(chalk.red(p.toString()));
            } else {
                switch (p.type) {
                    case "Interface":
                        block.interfaces[p.data.name] =
                            p.data.interface;
                        break;
                    case "Match":
                        block.matchGroups.push(p.data);
                        break;
                }
                // Then we reset the parsers since we are done with one iteration.
                myParsers = parsers.map(
                    parser => new parser(block.interfaces)
                );
                // parserReset due to response
            }
        });
        // Did we run out of parsers?
        if (myParsers.length === 0) {
            console.log(
                "Token history is",
                JSON.stringify(blockHistory)
            );
            throw new Error("Out of parsers");
        }
        if (
            nextBlock.remaining === "" ||
            /^\s*$/.test(nextBlock.remaining)
        ) {
            done = true;
            break;
        }
        remaining = nextBlock.remaining;
    }
    return block;
};

export const extractNextBlock = (
    input: string
): { token: Token; remaining: string } | null => {
    // First we remove start spacing and replace == with = since no assignment exists, and != with ≠.
    const toConsider = input
        .replace(/^\s*/, "")
        .replace(/^==/, "=")
        .replace(/^!=/, "≠");
    const nextTerm = toConsider.match(
        /^(?:[\w\.]+|[{};,:?=≠|\/\[\]])/
    );
    if (nextTerm === null) {
        console.log(`${toConsider} returned null with regex`);
        return null;
    }
    const [match] = nextTerm;
    const remaining = toConsider.replace(match, "");
    switch (match) {
        case "{":
            return { token: { type: "BlockOpen" }, remaining };
        case "}":
            return { token: { type: "BlockClose" }, remaining };
        case "[":
            return { token: { type: "IndexOpen" }, remaining };
        case "]":
            return { token: { type: "IndexClose" }, remaining };
        case ".":
            return { token: { type: "Dot" }, remaining };
        case "|":
            return { token: { type: "Or" }, remaining };
        case ":":
            return { token: { type: "Colon" }, remaining };
        case ";":
            return { token: { type: "SemiColon" }, remaining };
        case "/":
            return { token: { type: "Slash" }, remaining };
        case ",":
            return { token: { type: "Comma" }, remaining };
        case "=":
            return { token: { type: "Equals" }, remaining };
        case "≠":
            return { token: { type: "NotEquals" }, remaining };
        default:
            return {
                remaining,
                token: { type: "Keyword", value: match }
            };
    }
};

export default parse;
