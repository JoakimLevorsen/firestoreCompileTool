import InterfaceParser from "./InterfaceParser";
import MatchParser, { MatchGroup } from "./matchParser";
import ParserError from "./ParserError";
import chalk from "chalk";
import { Interface } from "../extractionTools/interface";

export type Block = {
    interfaces: { [id: string]: Interface };
    matchGroups: MatchGroup[];
};

export type charType =
    | "BlockOpen"
    | "BlockClose"
    | "IndexOpen"
    | "IndexClose"
    | "Dot"
    | "Or"
    | "Colon"
    | "SemiColon"
    | "Slash"
    | "Comma"
    | "Equals"
    | "NotEquals";

export type charBlock =
    | { type: charType }
    | { type: "Keyword"; value: string };

export type WAIT = "WAIT";
export const WAIT: WAIT = "WAIT";

const parsers = [InterfaceParser, MatchParser];

const parse = (input: string) => {
    let done = false;
    let remaining = input;
    let block: Block = { interfaces: {}, matchGroups: [] };
    let myParsers = parsers.map(p => new p(block.interfaces));
    const blockHistory: ReturnType<typeof extractNextBlock>[] = [];
    while (!done) {
        const nextBlock = extractNextBlock(remaining);
        blockHistory.push(nextBlock);
        if (nextBlock === null) {
            done = true;
            break;
        }
        const parserResponses = myParsers.map(p =>
            p.addChar(nextBlock.block, block.interfaces)
        );
        parserResponses.forEach((p, i) => {
            if (p === "WAIT") return;
            else if (p instanceof ParserError) {
                myParsers.splice(i, 1);
                console.error(chalk.red(p.toString()));
            } else {
                switch (p.type) {
                    case "Interface":
                        block.interfaces[p.data.name] =
                            p.data.content;
                        break;
                    case "Match":
                        block.matchGroups.push(p.data);
                        break;
                }
                // Then we reset the parsers since we are done with one iteration.
                myParsers = parsers.map(p => new p(block.interfaces));
                // parserReset due to response
            }
        });
        // Did we run out of parsers?
        if (myParsers.length === 0) {
            console.log(
                "Token history is",
                JSON.stringify(blockHistory)
            );
            throw "Out of parsers";
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

const extractNextBlock = (
    input: string
): { block: charBlock; remaining: string } | null => {
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
            return { block: { type: "BlockOpen" }, remaining };
        case "}":
            return { block: { type: "BlockClose" }, remaining };
        case "[":
            return { block: { type: "IndexOpen" }, remaining };
        case "]":
            return { block: { type: "IndexClose" }, remaining };
        case ".":
            return { block: { type: "Dot" }, remaining };
        case "|":
            return { block: { type: "Or" }, remaining };
        case ":":
            return { block: { type: "Colon" }, remaining };
        case ";":
            return { block: { type: "SemiColon" }, remaining };
        case "/":
            return { block: { type: "Slash" }, remaining };
        case ",":
            return { block: { type: "Comma" }, remaining };
        case "=":
            return { block: { type: "Equals" }, remaining };
        case "≠":
            return { block: { type: "NotEquals" }, remaining };
        default:
            return {
                block: { type: "Keyword", value: match },
                remaining
            };
    }
};

const extractChar = (input: string, remaining: string) => {};

export default parse;
