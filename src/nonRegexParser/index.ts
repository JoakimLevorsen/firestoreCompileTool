import InterfaceParser from "./InterfaceParser";
import { Block } from "../extractionTools";
import MatchParser from "./matchParser";
import ParserError from "./ParserError";
import chalk from "chalk";

type charType =
    | "BlockOpen"
    | "BlockClose"
    | "IndexOpen"
    | "IndexClose"
    | "Dot"
    | "Or"
    | "Colon"
    | "SemiColon"
    | "Slash"
    | "Comma";

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
    let myParsers = parsers.map(p => new p());
    while (!done) {
        const nextBlock = extractNextBlock(remaining);
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
                console.log(
                    `Got ${p.type} payload`,
                    JSON.stringify(p)
                );
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
                myParsers = parsers.map(p => new p());
                // parserReset due to response
            }
        });
        // Did we run out of parsers?
        if (myParsers.length === 0) {
            throw "Out of parsers";
        }
        if (
            nextBlock.remaining === "" ||
            /^\s*$/.test(nextBlock.remaining)
        ) {
            console.log(
                "Finished interpretation due to remainging being",
                nextBlock.remaining
            );
            done = true;
            break;
        }
        remaining = nextBlock.remaining;
    }
    console.log(
        "Returning block",
        JSON.stringify({ block, done, remaining })
    );
    return block;
};

const extractNextBlock = (
    input: string
): { block: charBlock; remaining: string } | null => {
    // First we remove start spacing
    const toConsider = input.replace(/^\s*/, "");
    const nextTerm = toConsider.match(/^(?:\w+|[{};,:?|\/\[\]])/);
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
        default:
            // Is it a word?
            if (/^\w+(.*)$/.test(match)) {
                const matchEnd = match.match(/^(\w+)(.*)$/);
                if (matchEnd === null)
                    throw "Unknown error" +
                        JSON.stringify({ match, matchEnd });
                // A char may be on the end of our keyword, so it is readded to the rest
                const [_, value, extraChar] = matchEnd;
                if (extraChar)
                    return {
                        block: { type: "Keyword", value },
                        remaining: extraChar + remaining
                    };
                return {
                    block: { type: "Keyword", value },
                    remaining
                };
            }
            throw "Unkown block " +
                JSON.stringify({ match, toConsider });
    }
};

const extractChar = (input: string, remaining: string) => {};

export default parse;
