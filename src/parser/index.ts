import { TokenParser } from "./TokenParser";
import FileWrapperParser from "./parsers/FileWrapperParser";
import ParserErrorCreator from "./ParserError";

const parse = (from: string) => {
    const tokens = TokenParser.extractAll(from);
    // tslint:disable-next-line: no-console
    // We now start a FileParser and parse
    const parser = new FileWrapperParser(ParserErrorCreator(tokens));
    let parsed;
    for (const token of tokens) {
        const result = parser.addToken(token);
        if (result) parsed = result;
    }
    console.log("Parsed", parsed);
    return parsed;
};

export default parse;
