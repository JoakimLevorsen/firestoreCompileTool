import InterfaceParser from "./InterfaceParser";
import { Block } from "../extractionTools";

type charType =
    | "BlockOpen"
    | "BlockClose"
    | "IndexOpen"
    | "IndexClose"
    | "Dot"
    | "Or"
    | "Colon"
    | "SemiColon"
    | "Slash";

export type charBlock =
    | { type: charType }
    | { type: "Keyword"; value: string };

const parsers = [InterfaceParser];

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
            p.addChar(nextBlock.block)
        );
        parserResponses.forEach((p, i) => {
            if (p === false) myParsers.splice(i, 1);
            else if (p !== "WAIT") {
                switch (p.type) {
                    case "Interface":
                        block.interfaces[p.data.name] =
                            p.data.content;
                }
            }
        });
        // Did we run out of parsers?
        if (myParsers.length === 0) {
            console.log("Result is", JSON.stringify(block));
            console.log(
                "Parsers failed on block",
                JSON.stringify(nextBlock)
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
    // First we remove start spacing
    const toConsider = input.replace(/^\s*/, "");
    const nextTerm = toConsider.match(/^[\w{};:?|/]*/);
    if (nextTerm === null) return null;
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
            throw "Unkown block " + JSON.stringify(match);
    }
};

export default parse;
