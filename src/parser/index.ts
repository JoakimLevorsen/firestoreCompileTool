import { TokenParser } from "./TokenParser";

const parse = (from: string) => {
    const tokens = TokenParser.extractAll(from);
    console.log(JSON.stringify(tokens));
};

export default parse;
