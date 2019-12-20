import BaseParser from "./BaseParser";
import { Token } from "../types";
import { ParserError } from "./ParserError";
import { WAIT } from "../oldParsers";

type logic = "&&" | "||";

export default class GroupParser<
    SubParser extends BaseParser,
    T
> extends BaseParser {
    private baseItem?: T;
    private itemChain: [logic, T][] = [];
    private stage: "awaiting expression" | "awaiting logic" =
        "awaiting expression";

    postConstructor = () => {};

    addToken(
        token: Token,
        nextToken: Token | null
    ):
        | ParserError
        | WAIT
        | {
              type: "Collection";
              data: { base: T; chain: [logic, T][] };
          } {
        switch (this.stage) {
            case "awaiting expression": 
                if (token.)
        }
    }
}
