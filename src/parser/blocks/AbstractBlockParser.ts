import {
    Token,
    Block,
    CodeBlock,
    IfBlock,
    MatchBlock
} from "../../types";
import { WAIT } from "../WAIT";
import { ParserError, BaseParser } from "..";

export abstract class AbstractBlockParser extends BaseParser {
    abstract addToken(
        token: Token,
        nextToken: Token | null
    ):
        | ParserError
        | WAIT
        | { type: "Block"; data: Block }
        | { type: "MatchBlock"; data: MatchBlock }
        | { type: "CodeBlock"; data: CodeBlock }
        | { type: "IfBlock"; data: IfBlock };
}
