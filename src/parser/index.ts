import { FileWrapperParser } from "./FileWrapperParser";
import ParserErrorCreator from "./ParserError";
import { TokenParser } from "./TokenParser";

const parse = (from: string) => {
    const tokens = TokenParser.extractAll(from);
    // We now start a FileParser and parse
    const parser = new FileWrapperParser(ParserErrorCreator(tokens));
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
