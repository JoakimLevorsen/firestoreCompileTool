import { Interface, MatchGroup } from ".";
import { isInterface } from "./Interface";
import { isMatchGroup } from "./MatchGroup";

export type TokenType =
    | "BlockOpen"
    | "BlockClose"
    | "IndexOpen"
    | "IndexClose"
    | "Dot"
    | "Or"
    | "Colon"
    | "SemiColon"
    | "Slash"
    | "Comma"
    | "Equals"
    | "NotEquals"
    | "QuestionMark";

export type Token =
    | { type: TokenType }
    | { type: "Keyword"; value: string };

export interface Block {
    interfaces: { [id: string]: Interface };
    matchGroups: MatchGroup[];
}

export const isTokenType = (input: any): input is TokenType => {
    if (typeof input !== "string") {
        return false;
    }
    if (
        input === "BlockOpen" ||
        input === "BlockClose" ||
        input === "IndexOpen" ||
        input === "IndexClose" ||
        input === "Dot" ||
        input === "Or" ||
        input === "Colon" ||
        input === "SemiColon" ||
        input === "Slash" ||
        input === "Comma" ||
        input === "Equals" ||
        input === "NotEquals" ||
        input === "QuestionMark"
    ) {
        return true;
    }
    return false;
};

export const isToken = (input: any): input is Token => {
    if (typeof input !== "object") {
        return false;
    }
    const { type, value } = input;
    if (isTokenType(type)) {
        return true;
    } else if (type === "Keyword" && typeof value === "string") {
        return true;
    }
    return false;
};

export const isBlock = (input: any): input is Block => {
    if (typeof input !== "object") {
        return false;
    }
    const { interfaces, matchGroups } = input;
    if (
        interfaces &&
        typeof interfaces === "object" &&
        matchGroups &&
        matchGroups instanceof Array
    ) {
        // Check the interfaces
        if (!Object.values(interfaces).every(i => isInterface(i))) {
            return false;
        }
        if (matchGroups.every(m => isMatchGroup(m))) {
            return true;
        }
    }
    return false;
};
