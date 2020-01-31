import { Token } from "../types/Token";
import SyntaxComponent from "../types/SyntaxComponent";

export default abstract class Parser {
    public abstract addToken(token: Token): SyntaxComponent | null;

    public abstract canAccept(token: Token): boolean;
}
