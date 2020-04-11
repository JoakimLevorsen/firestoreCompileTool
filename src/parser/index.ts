import { FileWrapperParser } from "./FileWrapperParser";
import ParserErrorCreator from "./ParserError";
import { getAllTokens } from "./TokenParser";

const parse = (from: string) => {
    const tokens = getAllTokens(from);
    // We now start a FileParser and parse
    const parser = new FileWrapperParser(ParserErrorCreator(from));
    let parsed;
    for (const token of tokens) {
        const result = parser.addToken(token);
        if (result) parsed = result;
    }
    return parsed;
};

export default parse;

export * from "./FileWrapperParser";
export * from "./IdentifierExtractor";
export * from "./IdentifierOrLiteralExtractor";
export * from "./Parser";
export * from "./ParserError";
export * from "./ParserGroup";
export * from "./TokenParser";
