import { Type } from "./Type";
import { Interface } from "./";
import {
    isInterface,
    InterfaceContent,
    isInterfaceContent
} from "./Interface";

type ANY = "ANY";
const ANY: ANY = "ANY";
type pureValues = Type | "ANY" | List | Map;
type ValueType = pureValues | FUNCTION<pureValues> | ObjectType;
interface FUNCTION<T extends ValueType> {
    type: "FUNCTION";
    returns: T;
}

interface ObjectType {
    [id: string]: ValueType;
}

interface List {
    type: "List";
}

interface Map {
    type: "Map";
    data: ObjectType;
    keys: FUNCTION<List>;
}

const isKeywordType = (
    input: any
): input is FUNCTION<ValueType> | List | Map => {
    if (typeof input !== "object") {
        return false;
    }
    if (input.type && typeof input.type === "string") {
        switch (input.type) {
            case "FUNCTION":
            case "List":
            case "Map":
                return true;
            default:
                return false;
        }
    }
    return false;
};

const ANY_DATA_CHILD: Map = {
    data: { ANY },
    keys: { type: "FUNCTION", returns: { type: "List" } },
    type: "Map"
};

const data: Map = ANY_DATA_CHILD;

const resource: { data: ObjectType; id: string } = {
    data: { data },
    id: "String"
};

const auth: ObjectType = { uid: "String" };

const request = {
    auth,
    resource
};

const isResource = (input: any): input is typeof resource =>
    input.id && typeof input.id === "string";

const GlobalScope = {
    request,
    resource
};

type Target =
    | typeof request
    | typeof resource
    | ValueType
    | Interface
    | InterfaceContent;
interface TargetWithKey {
    target: Target;
    key: string;
}

export default class KeywordObject {
    private rootTarget: TargetWithKey | null = null;
    private subTargets: TargetWithKey[] | null = null;
    private variablePathComponents: string[];

    constructor(
        input: string,
        interfaces?: { [id: string]: Interface },
        variablePathComponents?: string[]
    ) {
        // We add a period to make the regex simpler
        if (!/^([\w+\.])+$/.test(input + ".") || input.length === 0) {
            throw new Error("Invalid keyword structure");
        }
        const keywordComponents = input.split(".");
        this.variablePathComponents = variablePathComponents || [];

        // Now we loop through the keywordComponents to assemble our KeywordObject
        for (const keyword of keywordComponents) {
            const currentTarget = this.currentTarget();
            if (currentTarget === null) {
                this.setRootTarget(keyword, interfaces);
            } else {
                this.addSubTarget(keyword);
            }
        }
    }

    private setRootTarget(
        keyword: string,
        interfaces?: { [id: string]: Interface }
    ) {
        /*
                Now we find the correct keyword based on the following order:
                1. path
                2. interfaces
                3. GlobalScope
                */
        if (
            this.variablePathComponents &&
            this.variablePathComponents.includes(keyword)
        ) {
            this.rootTarget = {
                key: keyword,
                target: ANY_DATA_CHILD
            };
        } else if (interfaces && interfaces[keyword]) {
            this.rootTarget = {
                key: keyword,
                target: interfaces[keyword]
            }!;
        } else if (keyword === "request") {
            this.rootTarget = {
                key: "request",
                target: GlobalScope.request
            };
        } else if (keyword === "resource") {
            this.rootTarget = {
                key: "resource",
                target: GlobalScope.resource
            };
        } else {
            throw new Error("Unknown keyword: " + keyword);
        }
    }

    private addSubTarget(keyword: string) {
        const currentTarget = this.currentTarget();
        if (currentTarget === null) {
            throw "Internal error";
        }
        if (typeof currentTarget === "string") {
            if (currentTarget === "Map") {
                this.addSubTargetToSelf({
                    key: keyword,
                    target: ANY_DATA_CHILD
                });
            } else {
                throw `Object with type ${currentTarget} does not have any children`;
            }
        } else if (isInterface(currentTarget)) {
            if (currentTarget[keyword]) {
                this.addSubTargetToSelf({
                    key: keyword,
                    target: currentTarget[keyword]
                });
            } else {
                throw `Interface with type ${currentTarget} does not have a child for key ${keyword}`;
            }
        } else if (isInterfaceContent(currentTarget)) {
            const extractedType = currentTarget.multiType
                ? currentTarget.value.find(t => t === "Map")
                : currentTarget.value;
            if (extractedType === "Map") {
                this.addSubTargetToSelf({
                    key: keyword,
                    target: extractedType
                });
            } else {
                throw `Interface with type ${currentTarget} does not have a child for key ${keyword}`;
            }
        } else {
            if (isKeywordType(currentTarget)) {
                switch (currentTarget.type) {
                    case "FUNCTION":
                        this.addSubTargetToSelf({
                            key: keyword,
                            target: currentTarget.returns
                        });
                        break;
                    case "List":
                        this.addSubTargetToSelf({
                            key: keyword,
                            target: ANY_DATA_CHILD
                        });
                        break;
                    case "Map":
                        const match = currentTarget.data[keyword];
                        if (match) {
                            this.addSubTargetToSelf({
                                key: keyword,
                                target: match
                            });
                        } else {
                            throw new Error(
                                `${keyword} was not found on ${currentTarget}`
                            );
                        }
                }
            } else if (isResource(currentTarget)) {
                if (keyword === "id") {
                    this.addSubTargetToSelf({
                        key: keyword,
                        target: "String"
                    });
                } else {
                    const match = currentTarget.data[keyword];
                    if (match) {
                        this.addSubTargetToSelf({
                            key: keyword,
                            target: match
                        });
                    } else {
                        throw new Error(
                            `${keyword} was not found on ${currentTarget}`
                        );
                    }
                }
            } else {
                if (keyword === "auth") {
                    this.addSubTargetToSelf({
                        key: keyword,
                        target: request.auth
                    });
                } else if (keyword === "resource") {
                    this.addSubTargetToSelf({
                        key: keyword,
                        target: request.resource
                    });
                } else {
                    const match = (currentTarget as ObjectType)[
                        keyword
                    ];
                    if (match) {
                        this.addSubTargetToSelf({
                            key: keyword,
                            target: match
                        });
                    } else {
                        throw new Error(
                            `${keyword} was not found on ${currentTarget}`
                        );
                    }
                }
            }
        }
    }

    private currentTarget = (): Target | null => {
        if (!this.rootTarget) {
            return null;
        }
        if (this.subTargets && this.subTargets.length > 0) {
            return this.subTargets[this.subTargets.length - 1].target;
        }
        return this.rootTarget.target;
    };

    private addSubTargetToSelf(item: TargetWithKey, isData = false) {
        const { key, target } = item;
        if (this.rootTarget) {
            if (isData) {
                this.subTargets!.push({ target: data, key: "data" });
            }
            this.subTargets!.push({ target, key });
        } else {
            this.rootTarget = { target, key };
            this.subTargets = [];
        }
    }
}
