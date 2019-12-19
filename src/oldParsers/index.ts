import { Block, Token } from "../types";
import InterfaceParser from "./InterfaceParser";
import MatchParser from "./matchParser";
import ParserError from "./ParserError";
import { extractNextToken } from "./TokenParser";

export type WAIT = "WAIT";
export const WAIT: WAIT = "WAIT";

const parsers = [InterfaceParser, MatchParser];

const parse = (input: string, debug = false) => {
    let remaining = input;
    const block: Block = { interfaces: {}, matchGroups: [] };
    let myParsers = parsers.map(p => new p(block.interfaces));
    const blockHistory: Array<ReturnType<
        typeof extractNextToken
    >> = [];
    let nextToken: ReturnType<typeof extractNextToken> = null;
    do {
        const thisToken = nextToken;
        nextToken = extractNextToken(remaining);
        if (nextToken) {
            remaining = nextToken.remaining;
        }
        // For the first loop this token will be empty, but not next token
        if (!thisToken && nextToken) {
            continue;
        }
        if (thisToken === null) {
            break;
        }
        blockHistory.push(thisToken);
        const parserResponses = myParsers.map(p =>
            p.addToken(
                thisToken.token,
                nextToken !== null ? nextToken.token : null
            )
        );
        const parserErrorsThisRound: Error[] = [];
        parserResponses.forEach((p, i) => {
            if (p === "WAIT") {
                return;
            } else if (p instanceof ParserError) {
                myParsers.splice(i, 1);
                parserErrorsThisRound.push(p.getError());
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
            if (debug) {
                console.log(
                    "Token history is",
                    JSON.stringify(
                        blockHistory.map(b =>
                            b === null ? null : b.token
                        )
                    )
                );
            }
            const firstError = parserErrorsThisRound[0];
            if (firstError) {
                throw firstError;
            }
            throw new Error("Ran out of parsers");
        }
        if (
            thisToken.remaining === "" ||
            /^\s*$/.test(thisToken.remaining)
        ) {
            break;
        }
    } while (nextToken !== null);
    return block;
};

export default parse;
