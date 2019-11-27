import chalk from "chalk";
import { Block } from "../types";
import { extractNextToken } from "./TokenParser";
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
        typeof extractNextToken
    >> = [];
    while (!done) {
        const nextBlock = extractNextToken(remaining);
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

export default parse;
