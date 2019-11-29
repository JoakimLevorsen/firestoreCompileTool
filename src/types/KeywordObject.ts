import {
    Interface,
    InterfaceContent,
    isInterface,
    isInterfaceContent
} from ".";
import { Type } from "./Type";

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

const isRequest = (input: any): input is typeof request =>
    input.auth && isResource(input.resource);

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
    key?: string;
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

    public toString(): string {
        if (!this.rootTarget) {
            throw new Error(
                "Cannot export to string with no rootTarget"
            );
        }
        if (!this.subTargets || this.subTargets.length === 0) {
            // This means we access a single object with no dot notation, so we just export that
            return this.rootTarget.key!;
        }
        // Since we're using dot notation we run through all the keys to asseble our path.
        let output = this.rootTarget.key!;
        output += this.subTargets.reduce(
            (pV, p) => (p.key ? `${pV}.${p.key}` : pV),
            ""
        );
        return output;
    }

    public toStringAsData(): string | null {
        const currentTarget = this.currentTarget();
        if (currentTarget === null) {
            return null;
        }
        if (
            (typeof currentTarget === "string" &&
                currentTarget === "Map") ||
            isInterface(currentTarget) ||
            isInterfaceContent(currentTarget)
        ) {
            return this.toString();
        }
        if (typeof currentTarget === "string") {
            return null;
        }
        if (isKeywordType(currentTarget)) {
            // If we're a keyword type, we can only return if we are a map
            if (currentTarget.type === "Map") {
                return this.toString();
            }
            return null;
        }
        if (isResource(currentTarget)) {
            this.addSubTargetToSelf({
                key: "data",
                target: currentTarget.data
            });
            return this.toString();
        }
        if (isRequest(currentTarget)) {
            // This is not valid
            return null;
        }
        // Now we know it's an ObjectType, and since that's allowed we'll return toString
        return this.toString();
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
        const requestResource = "request.resource";
        if (
            this.variablePathComponents &&
            this.variablePathComponents.includes(keyword)
        ) {
            // This means we add request, then resource
            this.addSubTargetToSelf({
                key: "request",
                target: GlobalScope.request
            });
            this.addSubTargetToSelf({
                key: "resource",
                target: GlobalScope.request.resource
            });
        } else if (interfaces && interfaces[keyword]) {
            this.addSubTargetToSelf({
                key: requestResource,
                target: interfaces[keyword]
            });
        } else if (keyword === "request") {
            this.addSubTargetToSelf({
                key: "request",
                target: GlobalScope.request
            });
        } else if (keyword === "resource") {
            this.addSubTargetToSelf({
                key: "resource",
                target: GlobalScope.resource
            });
        } else {
            throw new Error("Unknown keyword: " + keyword);
        }
    }

    private addSubTarget(keyword: string) {
        const currentTarget = this.currentTarget();
        if (currentTarget === null) {
            throw new Error("Internal error");
        }
        if (typeof currentTarget === "string") {
            if (currentTarget === "Map") {
                this.addSubTargetToSelf({
                    key: keyword,
                    target: ANY_DATA_CHILD
                });
            } else {
                throw new Error(
                    `Object with type ${currentTarget} does not have any children`
                );
            }
        } else if (isInterface(currentTarget)) {
            if (currentTarget[keyword]) {
                this.addSubTargetToSelf({
                    key: keyword,
                    target: currentTarget[keyword]
                });
            } else {
                throw new Error(
                    `Interface with type ${currentTarget} does not have a child for key ${keyword}`
                );
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
                throw new Error(
                    `Interface with type ${currentTarget} does not have a child for key ${keyword}`
                );
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
                        const match =
                            currentTarget.data[keyword] ||
                            currentTarget.data[ANY];
                        if (match) {
                            this.addSubTargetToSelf({
                                key: keyword,
                                target: match
                            });
                        } else {
                            throw new Error(
                                `${keyword} was not found on ${JSON.stringify(
                                    currentTarget
                                )}`
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
                        this.addSubTargetToSelf({
                            key: keyword,
                            target: ANY_DATA_CHILD
                        });
                        // throw new Error(
                        //     `${keyword} was not found on ${JSON.stringify(
                        //         currentTarget
                        //     )}`
                        // );
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

    private addSubTargetToSelf(item: TargetWithKey) {
        const { key, target } = item;
        if (this.rootTarget !== null) {
            /* 
            If were adding the key 'id' to the rootTarget 'request.resource' 
            or 'resource' we don't need .data, otherwise we do*/
            if (
                (/resource$/.test(this.rootTarget.key || "") ||
                    (this.subTargets &&
                        this.subTargets[0] &&
                        /resource$/.test(
                            this.subTargets[0].key || ""
                        ))) &&
                key !== "id" &&
                key !== "data"
            ) {
                this.subTargets!.push({ target: data, key: "data" });
            }
            this.subTargets!.push({ target, key });
        } else {
            this.rootTarget = { target, key };
            this.subTargets = [];
        }
    }
}
