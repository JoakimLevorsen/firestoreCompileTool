import Identifier from "../../parser/types/Identifier";
import Literal from "../../parser/types/literal";
import SyntaxComponent from "../../parser/types/SyntaxComponent";
import { Scope } from "../Scope";

export type ExpressionCompiler<C extends SyntaxComponent> = (
    item: C,
    scope: Scope
) => {
    value?: string;
    type: Literal | Identifier | Array<Literal | Identifier>;
};
