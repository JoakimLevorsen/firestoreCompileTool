import Parser from "../Parser";
import SyntaxComponent from "../../types/SyntaxComponent";
import {
    Token,
    Identifier,
    tokenHasType,
    spaceTokens
} from "../../types";
import { MemberExpression } from "../../types/expressions";
import MemberExpressionParser from "./MemberExpressionParser";
import { CallExpression } from "../../types/expressions/CallExpression";
import Literal from "../../types/literals";

export default class CallExpressionParser extends Parser {
    private stage:
        | "awaiting start"
        | "building target"
        | "awaiting param open"
        | "awaiting param"
        | "building param"
        | "awaiting close or param sep"
        | "closed" = "awaiting start";
    private target?: Identifier | MemberExpression;
    private targetParser = new MemberExpressionParser(
        this.errorCreator
    );
    private params: SyntaxComponent[] = [];
    private nextParam?: SyntaxComponent;
    private paramParser?: CallExpressionParser;

    public addToken(
        token: Token
    ):
        | Identifier
        | Literal
        | MemberExpression
        | CallExpression
        | null {
        //
        switch (this.stage) {
            case "awaiting start":
                if (tokenHasType(token, [...spaceTokens]))
                    return null;
            case "building target":
                this.stage = "building target";
                if (this.targetParser.canAccept(token)) {
                    const result = this.targetParser.addToken(token);
                    if (result) {
                        if (
                            result instanceof Identifier ||
                            result instanceof MemberExpression
                        ) {
                            this.target = result;
                        }
                        return result;
                    }
                    return null;
                }
                // If the target is unset, something went wrong
                if (!this.target)
                    throw this.errorCreator(token)("Internal error");
            // If the target is set, we move to the next stage
            case "awaiting param open":
                if (token.type === "(") {
                    this.stage = "awaiting param";
                    return null;
                } else throw this.errorCreator(token)("Expected '('");
            case "awaiting param":
                if (tokenHasType(token, [...spaceTokens]))
                    return null;
                if (token.type === ")") {
                    this.stage = "closed";
                    return new CallExpression(
                        token.location,
                        this.target!,
                        // TO FIX
                        this.params as Literal[]
                    );
                }
            case "building param":
                this.stage = "building param";
                if (!this.paramParser)
                    this.paramParser = new CallExpressionParser(
                        this.errorCreator
                    );
                if (this.paramParser.canAccept(token)) {
                    const result = this.paramParser.addToken(token);
                    if (result) {
                        this.nextParam = result;
                    }
                    return null;
                }
                if (!this.nextParam)
                    throw this.errorCreator(token)(
                        "Unexpected token"
                    );
                this.params.push(this.nextParam);
                this.nextParam = undefined;
                this.paramParser = new CallExpressionParser(
                    this.errorCreator
                );
                this.stage = "awaiting close or param sep";
            case "awaiting close or param sep":
                if (tokenHasType(token, [...spaceTokens]))
                    return null;
                if (token.type === ",") {
                    this.stage = "awaiting param";
                    return null;
                }
                if (token.type === ")") {
                    this.stage = "closed";
                    return new CallExpression(
                        token.location,
                        this.target!,
                        // TO FIX
                        this.params as Literal[]
                    );
                }
                throw this.errorCreator(token)("Unexpected token");
            case "closed":
                throw this.errorCreator(token)("Internal error");
        }
    }

    public canAccept(token: Token): boolean {
        switch (this.stage) {
            case "awaiting start":
                if (tokenHasType(token, [...spaceTokens]))
                    return true;
            case "building target":
                if (this.targetParser.canAccept(token)) return true;
                if (!this.target) return false;
            case "awaiting param open":
                return token.type === "(";
            case "awaiting param":
                if (tokenHasType(token, [...spaceTokens, ")"]))
                    return true;
            case "building param":
                if (!this.paramParser) {
                    if (
                        new CallExpressionParser(
                            this.errorCreator
                        ).canAccept(token)
                    )
                        return true;
                } else if (this.paramParser.canAccept(token)) {
                    return true;
                }
                if (!this.nextParam) return false;
            case "awaiting close or param sep":
                return tokenHasType(token, [
                    ...spaceTokens,
                    ",",
                    ")"
                ]);
            case "closed":
                return false;
        }
    }
}
