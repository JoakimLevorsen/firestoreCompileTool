import SyntaxComponent from "../types/SyntaxComponent";
import { Token } from "../types/Token";
import { ErrorCreator } from "./ParserError";

export default abstract class Parser {
    protected errorCreator: ErrorCreator;

    constructor(withError: ErrorCreator) {
        this.errorCreator = withError;
    }

    public abstract addToken(token: Token): SyntaxComponent | null;

    public abstract canAccept(token: Token): boolean;
}
