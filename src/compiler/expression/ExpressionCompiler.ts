import { Scope } from "..";
import { Identifier } from "../../types";
import Literal from "../../types/literals";
import SyntaxComponent from "../../types/SyntaxComponent";

export type ExpressionCompiler<C extends SyntaxComponent> = (
    item: C,
    scope: Scope
) => {
    value?: string;
    type: Literal | Identifier | Array<Literal | Identifier>;
};
