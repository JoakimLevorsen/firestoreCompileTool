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

const ANY_DATA_CHILD: ScopeType = {
    data: "ANY_CHILD",
    optional: true,
    type: "OBJECT"
};

const data: ScopeType = {
    ANY_STRING: ANY_DATA_CHILD,
    optional: false,
    type: "OBJECT"
};

const Resource: ScopeType = {
    ANY_STRING: data,
    optional: false,
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
    request: Request,
    resource: Resource
};

type TargetType =
    | ScopeType
    | Type
    | Type[]
    | ANY_CHILD
    | Interface
    | null;

interface TargetWithKey {
    target: TargetType;
    key: string;
}

export default class KeywordObject {
    private rootTarget: TargetWithKey | null = null;
    private subTargets: TargetWithKey[] | null = null;
    private pathComponents: Array<{
        name: string;
        optional: false;
        type: "OBJECT";
    }>;

    constructor(
        keyword: string,
        interfaces?: { [id: string]: Interface },
        stringPathComponents?: string[]
    ) {
        this.pathComponents = (stringPathComponents || []).map(
            (p: string) => ({
                name: p,
                optional: false,
                type: "OBJECT"
            })
        );
        // We add a period to make the regex simpler
        if (
            !/^([\w+\.])+$/.test(keyword + ".") ||
            keyword.length === 0
        ) {
            throw new Error("Invalid keyword structure");
        }
        const objectComponents = keyword.split(".");
        for (const obj of objectComponents) {
            const currentTarget = this.currentTarget();
            if (currentTarget !== null) {
                if (typeof currentTarget === "string") {
                    // We check if the currentTarget has children
                    switch (currentTarget) {
                        case "ANY_CHILD":
                        case "Map":
                        case "Array":
                            this.addSubTarget("ANY_CHILD", obj);
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
                        this.addSubTarget(
                            currentTarget.subScope[obj],
                            obj
                        );
                    } else if (
                        currentTarget.data ||
                        currentTarget.ANY_STRING
                    ) {
                        this.addSubTarget("ANY_CHILD", obj);
                    }
                } else if (isInterface(currentTarget)) {
                    // The current target is an interface, so we check if the interface contains the value.
                    const interfaceValue:
                        | InterfaceContent
                        | undefined = currentTarget[obj];
                    if (interfaceValue) {
                        this.addSubTarget(interfaceValue.value, obj);
                    } else {
                        throw new Error(
                            `Interface ${currentTarget} does not contain a value for the key ${obj}`
                        );
                    }
                }
            } else {
                if (GlobalScope[obj]) {
                    this.addSubTarget(GlobalScope[obj], obj);
                } else if (interfaces && interfaces[obj]) {
                    this.addSubTarget(interfaces[obj], obj);
                } else {
                    const pathMatch = this.pathComponents.find(
                        p => p.name === obj
                    );
                    if (pathMatch) {
                        this.addSubTarget(ANY_DATA_CHILD, obj);
                    } else {
                        throw new Error("Unknown keyword " + obj);
                    }
                }
            }
        }
    }

    public toString(): string {
        if (this.rootTarget === null) {
            return "";
        }
        // We check if this rootTarget is from the path
        const matchPathComponent = this.pathComponents.find(
            p => p.name === this.rootTarget!.key
        );
        if (!this.subTargets) {
            // This means no dot notation was used.
            // This only makes sense if we are accessing a value, not resource or request.
            if (matchPathComponent) {
                return "resource.data";
            } else {
                throw new Error(
                    `Use of ${
                        this.rootTarget!.key
                    } does not make sense on its own.`
                );
            }
        } else {
            const base = matchPathComponent
                ? "resource.data"
                : this.rootTarget!.key;
            const subPath = this.subTargets.reduce(
                (pV, v) => `${pV}.${v.key}`,
                ""
            );
            return base + subPath;
        }
    }

    private currentTarget = (): TargetType => {
        if (!this.rootTarget) {
            return null;
        }
        if (this.subTargets && this.subTargets.length > 0) {
            return this.subTargets[this.subTargets.length - 1].target;
        }
        return this.rootTarget.target;
    };

    private addSubTarget(
        target: TargetType,
        key: string,
        isData = false
    ) {
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
