import { InterfaceLiteral, TypeLiteral } from "../../types/literals";
import { ScopeItem } from ".";
import OptionalDependecyTracker from "../OptionalDependencyTracker";
import { DatabaseLocation } from "../Compiler";

const authItem: DatabaseLocation = {
    key: "request.auth",
    castAs: new InterfaceLiteral(
        { start: -1, end: -1 },
        {
            uid: [new TypeLiteral(-1, "string")],
            token: [new InterfaceLiteral({ start: -1, end: -1 }, {})]
        }
    ),
    optional: true
};

export const auth: ScopeItem = {
    value: authItem,
    optionalChecks: new OptionalDependecyTracker([
        { type: "Exist", value: authItem }
    ])
};
