import { Token, LogicGroup, RuleExportable } from "../types";
import { ParserError, ParserErrorBuilder } from "./ParserError";
import { WAIT } from ".";
import BaseParser from "./BaseParser";

export default abstract class GroupParser<
    T extends RuleExportable
> extends BaseParser {
    private data: LogicGroup<T> = new LogicGroup();
    private stage: "awaiting expression" | "awaiting logic" =
        "awaiting expression";
    private parParser: GroupParser<T> | null = null;
    private partialError = ParserErrorBuilder(GroupParser);

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
                    this.parParser = this.spawnClone();
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
                    if (nextToken?.type === "(") {
                        return {
                            type: "Collection",
                            data: this.data
                        };
                    }
                    this.stage = "awaiting logic";
                    // Now we can return
                    return WAIT;
                }
                const subResponse = this.subParse(token, nextToken);
                if (
                    subResponse instanceof ParserError ||
                    subResponse === WAIT
                ) {
                    return subResponse;
                }
                this.addChild(subResponse.data);
                this.resetSub();
                if (
                    nextToken?.type === ")" ||
                    nextToken?.type === ";" ||
                    nextToken?.type === "{"
                ) {
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
                // We check if we should return
                if (token.type === ")") {
                    return { type: "Collection", data: this.data };
                }
                return errorBuilder(`Expected logic, got ${token}`);
        }
    }

    protected abstract spawnClone(): GroupParser<T>;

    protected abstract subParse(
        token: Token,
        nextToken: Token | null
    ):
        | ParserError
        | WAIT
        | {
              type: "Sub";
              data: T;
          };

    protected abstract resetSub(): void;

    private addChild(item: T | LogicGroup<T>) {
        if (this.data.base) {
            this.data.itemChain.push(item);
        } else {
            this.data.base = item;
        }
    }
}
