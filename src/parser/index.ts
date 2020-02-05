import { TokenParser } from "./TokenParser";

const parse = (from: string) => {
    const tokens = TokenParser.extractAll(from);
    // tslint:disable-next-line: no-console
    console.log(JSON.stringify(tokens));
};

export default parse;
