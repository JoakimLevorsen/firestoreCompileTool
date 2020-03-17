import { ComparisonExpression } from "../parser/types/expressions";
import Literal, {
    InterfaceLiteral,
    TypeLiteral
} from "../parser/types/literal";
import { DatabaseLocation } from "./Compiler";

export interface Scope {
    [index: string]:
        | Literal
        | ComparisonExpression
        | DatabaseLocation;
}

const auth: DatabaseLocation = {
    key: "request.auth",
    castAs: new InterfaceLiteral(
        { start: -1, end: -1 },
        {
            uid: [new TypeLiteral(-1, "string")],
            token: [new InterfaceLiteral({ start: -1, end: -1 }, {})]
        }
    ),
    optionalCast: true
};

export const intitialScope: Scope = {
    auth
};
