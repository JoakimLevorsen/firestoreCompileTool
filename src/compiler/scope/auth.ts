import { DatabaseLocation } from "..";
import { InterfaceLiteral, TypeLiteral } from "../../types/literals";

export const auth: DatabaseLocation = {
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
