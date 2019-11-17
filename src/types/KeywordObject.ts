import { AllTypes, Type } from "../parser/TypeParser";
import { Interface } from "../parser/InterfaceParser";

type ANY_CHILD = "ANY_CHILD";
type FUNCTION = "FUNCTION";
type OBJECT = "OBJECT";
// interface SUB_OBJECT {
//     [id: string ]: SUB_OBJECT | FUNCTION | ANY_CHILD | Type;
// }
// interface FirestoreDocument {
//     [id: string] : Type | FirestoreCollection
// }
// interface FirestoreCollection {
//     [id: string]: FirestoreDocument
// }

// type Auth = {uid: AllTypes["String"]}

// type Resource = {
//     data?: FirestoreDocument,
//     auth: Auth,
//     exists: AllTypes["Bool"]
// }

// type Request = {
//     resource: Resource,
// }

// interface GlobalScope {
//     resource: Resource,
//     request: Request
// }

type ScopeType = {
    type: Type | ANY_CHILD | FUNCTION | OBJECT;
    optional: boolean;
    subScope?: { [id: string]: ScopeType };
    data?: ANY_CHILD;
    ANY_STRING?: ANY_CHILD | ScopeType;
};

const isScopeType = (input: any): input is ScopeType => {
    if (typeof input !== "object") return false;
    if (!input.type || typeof input.type !== "string") return false;
    if (
        input.optional == undefined ||
        typeof input.type !== "boolean"
    )
        return false;
    return true;
};

const data: ScopeType = {
    type: "OBJECT",
    optional: false,
    data: "ANY_CHILD"
};

const Resource: ScopeType = {
    type: "OBJECT",
    optional: false,
    subScope: {
        data
    },
    ANY_STRING: data
};

const Request: ScopeType = {
    type: "OBJECT",
    optional: false,
    subScope: {
        resource: Resource
    }
};

const GlobalScope: { [id: string]: ScopeType } = {
    Request,
    Resource
};

export default class KeywordObject {
    constructor(
        keyword: string,
        interfaces?: { [id: string]: Interface }
    ) {
        // We add a period to make the regex simpler
        if (
            !/^([\w+\.])+$/.test(keyword + ".") ||
            keyword.length === 0
        )
            throw "Invalid keyword structure";
        const objectComponents = keyword.split(".");
        let currentTarget: ScopeType | Type | Interface | null = null;
        for (const obj of objectComponents) {
            if (!currentTarget) {
                if (GlobalScope[obj]) {
                    currentTarget = GlobalScope[obj];
                } else if (interfaces && interfaces[obj]) {
                    currentTarget = interfaces[obj];
                } else throw "Unknown keyword";
            } else {
                if (typeof currentTarget === "string") {
                    currentTarget === "ANY_CHILD";
                } else if (isScopeType(currentTarget)) {
                    currentTarget;
                } else if (typeof currentTarget === "object") {
                    if (currentTarget[obj]) {
                        currentTarget = currentTarget[obj];
                    }
                } else throw "Unknown error";
            }
        }
    }
}
