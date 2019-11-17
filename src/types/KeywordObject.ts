import { Interface, InterfaceContent, isInterface, Type } from ".";

type ANY_CHILD = "ANY_CHILD";
type FUNCTION = "FUNCTION";
type OBJECT = "OBJECT";

interface ScopeType {
    type: Type | ANY_CHILD | FUNCTION | OBJECT;
    optional: boolean;
    subScope?: { [id: string]: ScopeType };
    data?: ANY_CHILD;
    ANY_STRING?: ANY_CHILD | ScopeType;
}

const isScopeType = (input: any): input is ScopeType => {
    if (typeof input !== "object") {
        return false;
    }
    if (!input.type || typeof input.type !== "string") {
        return false;
    }
    if (
        input.optional === undefined ||
        typeof input.optional !== "boolean"
    ) {
        return false;
    }
    return true;
};

const data: ScopeType = {
    data: "ANY_CHILD",
    optional: false,
    type: "OBJECT"
};

const Resource: ScopeType = {
    ANY_STRING: data,
    optional: false,
    subScope: {
        data
    },
    type: "OBJECT"
};

const Request: ScopeType = {
    optional: false,
    subScope: {
        resource: Resource
    },
    type: "OBJECT"
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
        ) {
            throw new Error("Invalid keyword structure");
        }
        const objectComponents = keyword.split(".");
        let currentTarget:
            | ScopeType
            | Type
            | Type[]
            | ANY_CHILD
            | Interface
            | null = null;
        for (const obj of objectComponents) {
            if (currentTarget !== null) {
                if (typeof currentTarget === "string") {
                    // We check if the currentTarget has children
                    switch (currentTarget) {
                        case "ANY_CHILD":
                        case "Map":
                        case "Array":
                            currentTarget = "ANY_CHILD";
                            break;
                        default:
                            throw new Error(
                                `Type ${currentTarget} does not have children`
                            );
                    }
                } else if (isScopeType(currentTarget)) {
                    // We check if the scope has the child
                    if (
                        currentTarget.subScope &&
                        currentTarget.subScope[obj]
                    ) {
                        currentTarget = currentTarget.subScope[obj];
                    } else if (
                        currentTarget.data ||
                        currentTarget.ANY_STRING
                    ) {
                        currentTarget = "ANY_CHILD";
                    }
                } else if (isInterface(currentTarget)) {
                    // The current target is an interface, so we check if the interface contains the value.
                    const interfaceValue:
                        | InterfaceContent
                        | undefined = currentTarget[obj];
                    if (interfaceValue) {
                        currentTarget = interfaceValue.value;
                    } else {
                        throw new Error(
                            `Interface ${currentTarget} does not contain a value for the key ${obj}`
                        );
                    }
                }
            } else {
                if (GlobalScope[obj]) {
                    currentTarget = GlobalScope[obj];
                } else if (interfaces && interfaces[obj]) {
                    currentTarget = interfaces[obj];
                } else {
                    throw new Error("Unknown keyword");
                }
            }
        }
    }
}
