import LiteralParser from ".";
import { NumericLiteral } from "../../types/literal";
import { Token, tokenHasType } from "../../types/Token";

export class NumericLiteralParser extends LiteralParser {
    private value: {
        bigNum?: number;
        seperator?: boolean;
        smallNum?: number;
    } = {};
    private start: number = NaN;

    public addToken(token: Token): NumericLiteral | null {
        if (isNaN(this.start)) this.start = token.location;
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
        if (token.type !== "Keyword" || isNaN(+token.value))
            throw error("Could not extract number");
        if (bigNum === undefined) {
            this.value.bigNum = +token.value;
            return new NumericLiteral(this.start, this.numberValue());
        }
        if (smallNum === undefined) {
            this.value.smallNum = +`0.${token.value}`;
            return new NumericLiteral(this.start, this.numberValue());
        }
        throw error("Did not expect more tokens");
    }

    public canAccept(token: Token): boolean {
        const { bigNum, seperator, smallNum } = this.value;
        if (!seperator && tokenHasType(token, [",", "."]))
            return true;
        if (!bigNum || !smallNum) {
            if (token.type === "Keyword" && !isNaN(+token.value)) {
                return true;
            }
        }
        return false;
    }

    private numberValue() {
        const { bigNum, smallNum } = this.value;
        if (bigNum === undefined && smallNum === undefined)
            return NaN;
        let value = 0;
        if (bigNum !== undefined) value += bigNum;
        if (smallNum !== undefined) value += smallNum;
        return value;
    }
}
