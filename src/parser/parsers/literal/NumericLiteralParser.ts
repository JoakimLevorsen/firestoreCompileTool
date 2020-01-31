import Parser from "../Parser";
import { Token, tokenHasType } from "../../types/Token";
import NumericLiteral from "../../types/literal/NumericLiteral";

export default class NumericLiteralParser extends Parser {
    private value: {
        bigNum?: number;
        seperator?: boolean;
        smallNum?: number;
    } = {};
    private start: number = NaN;

    private numberValue() {
        const { bigNum, smallNum } = this.value;
        if (!bigNum && !smallNum) return NaN;
        let number = 0;
        if (bigNum) number += bigNum;
        if (smallNum) number += +`0.${smallNum}`;
        return number;
    }

    public addToken(
        token: Token
    ): import("../../types/SyntaxComponent").default | null {
        if (!this.start) this.start = token.location;
        const { bigNum, seperator, smallNum } = this.value;
        const error = this.errorCreator(token);
        if (
            !seperator &&
            (token.type === "." || token.type === ",")
        ) {
            this.value.seperator = true;
            return null;
        }
        if (bigNum && smallNum) throw error("Already filled");
        if (token.type !== "Keyword" || !isNaN(+token.value))
            throw error("Could not extract number");
        const numToken = +token.value;
        if (!bigNum) {
            this.value.bigNum = numToken;
            return new NumericLiteral(
                {
                    start: this.start,
                    end: token.location + token.value.length
                },
                this.numberValue()
            );
        }
        if (!smallNum) {
            this.value.smallNum = numToken;
            return new NumericLiteral(
                {
                    start: this.start,
                    end: token.location + token.value.length
                },
                this.numberValue()
            );
        }
        throw error("Did not expect more tokens");
    }

    public canAccept(token: Token): boolean {
        const { bigNum, seperator, smallNum } = this.value;
        if (!seperator && tokenHasType(token.type, [",", "."]))
            return true;
        if (!bigNum || !smallNum) {
            if (token.type === "Keyword" && !isNaN(+token.value)) {
                return true;
            }
        }
        return false;
    }
}
