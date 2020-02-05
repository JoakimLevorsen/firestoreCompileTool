import { ErrorCreator } from "../ParserError";
import SyntaxComponent from "../types/SyntaxComponent";
import { Token } from "../types/Token";

export default abstract class Parser {
    protected errorCreator: ErrorCreator;

    constructor(withError: ErrorCreator) {
        this.errorCreator = withError;
    }

    public abstract addToken(token: Token): SyntaxComponent | null;

    public abstract canAccept(token: Token): boolean;
}
