import BaseParser, { ParserConstructor } from "./BaseParser";
import { Token, BlockChain } from "../types";
import { ParserError, ParserErrorBuilder } from "./ParserError";
import { WAIT } from "../oldParsers";

type logic = "&&" | "||";

export interface LogicGroup<T> {
    base?: T | LogicGroup<T>;
    itemChain: Array<logic | LogicGroup<T> | T>;
}

export default class GroupParser<
    SubParser extends BaseParser,
    T
> extends BaseParser {
    private data: LogicGroup<T> = { itemChain: [] };
    private stage: "awaiting expression" | "awaiting logic" =
        "awaiting expression";
    private parParser: GroupParser<SubParser, T> | null = null;
    private subParser: SubParser | null = null;
    private subParserConstructor: ParserConstructor<SubParser>;
    private partialError = ParserErrorBuilder(GroupParser);

    constructor(
        blockChain: BlockChain,
        SubConstructor: ParserConstructor<SubParser>
    ) {
        super(blockChain);
        this.subParserConstructor = SubConstructor;
    }

    postConstructor = () => {};

    addToken(
        token: Token,
        nextToken: Token | null
    ):
        | ParserError
        | WAIT
        | {
              type: "Collection";
              data: LogicGroup<T>;
          } {
        const errorBuilder = this.partialError(this.stage, token);
        switch (this.stage) {
            case "awaiting expression":
                if (token.type === "(") {
                    this.parParser = new GroupParser(
                        this.blockChain,
                        this.subParserConstructor
                    );
                    return WAIT;
                }
                if (this.parParser) {
                    const response = this.parParser.addToken(
                        token,
                        nextToken
                    );
                    if (
                        response instanceof ParserError ||
                        response === WAIT
                    ) {
                        return response;
                    }
                    // Now we assign the response to our selves
                    this.addChild(response.data);
                    // Now we can return
                    return WAIT;
                }
                if (!this.subParser) {
                    this.subParser = new this.subParserConstructor(
                        this.blockChain
                    );
                }
                const subResponse = this.subParser.addToken(
                    token,
                    nextToken
                );
                if (
                    subResponse instanceof ParserError ||
                    subResponse === WAIT
                ) {
                    return subResponse;
                }
                this.addChild(subResponse.data);
                // We check if we should return
                if (token.type === ")" || nextToken?.type === ";") {
                    return { type: "Collection", data: this.data };
                }
                this.stage = "awaiting logic";
                return WAIT;
            case "awaiting logic":
                if (token.type === "&" || token.type === "|") {
                    this.data.itemChain.push(
                        token.type === "&" ? "&&" : "||"
                    );
                    this.stage = "awaiting expression";
                    return WAIT;
                }
                return errorBuilder(`Expected logic, got ${token}`);
        }
    }

    private addChild(item: T | LogicGroup<T>) {
        if (this.data.base) {
            this.data.itemChain.push(item);
        } else {
            this.data.base = item;
        }
    }
}
