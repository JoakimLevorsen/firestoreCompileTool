import ParserErrorCreator from "./ParserError";
import FileWrapperParser from "./parsers/FileWrapperParser";
import { TokenParser } from "./TokenParser";

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
    return parsed;
};

export default parse;
