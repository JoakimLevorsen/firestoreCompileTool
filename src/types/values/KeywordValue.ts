import { Type } from "..";
import { CollapsedBlock } from "../blocks";
import { Interface } from "readline";
import {
    InterfaceContent,
    isInterfaceContent,
    isInterface
} from "../Interface";
import { isType } from "../Type";
import { Token } from "../Token";

type ANY = "ANY";
const ANY: ANY = "ANY";
type VALUE_TYPE = Type | ANY | FUNCTION;

interface FUNCTION {
    type: "FUNCTION";
    returns: VALUE_TYPE;
    paramenters: VALUE_TYPE;
}

const isFUNCTION = (input: any): input is FUNCTION =>
    typeof input === "object" &&
    input.type === "FUNCTION" &&
    input.returns &&
    input.paramenters;

interface OBJECT_TYPE {
    [id: string]: VALUE_TYPE | OBJECT_TYPE;
}

const isOBJECT_TYPE = (input: any): input is OBJECT_TYPE =>
    typeof input === "object" &&
    Object.keys(input).every(k => typeof k === "string") &&
    Object.values(input).every(
        v => isType(v) || isFUNCTION(v) || v === "ANY"
    );

const data: OBJECT_TYPE = { ANY };

const resource: OBJECT_TYPE = {
    data,
    id: "String"
};

const isResource = (input: any): input is typeof resource =>
    typeof input === "object" &&
    isOBJECT_TYPE(input) &&
    input.data !== undefined &&
    input.id === "String";

const auth: OBJECT_TYPE = { uid: "String" };

const request: OBJECT_TYPE = {
    auth,
    resource
};

const GlobalScope = {
    request,
    resource
};

type target = VALUE_TYPE | OBJECT_TYPE | Interface | InterfaceContent;

export default class KeywordValue {
    private key: String | null;
    private currentTarget: target;

    constructor(baseObject: string, scope: CollapsedBlock) {
        // The assignment order is: constant, path, globalScope.
        // We ignore interfaces
        const con = scope.constants.get(baseObject);
        if (con) {
            this.currentTarget = con.getType();
            this.key =
                con instanceof KeywordValue && con.getKey()
                    ? con.getKey()
                    : null;
            return;
        }
        const pVariable = scope.pathVariable;
        if (pVariable === baseObject) {
            this.key = "request.resource";
            this.currentTarget = request.resource;
        }
        if (baseObject === "request" || baseObject === "resource") {
            this.key = baseObject;
            this.currentTarget =
                baseObject === "request" ? request : resource;
        }
        throw new Error(
            `Keyword ${baseObject} was not found in scope`
        );
    }

    public static toKeywordObject(
        from: Token,
        scope: CollapsedBlock
    ): KeywordValue | null {
        // If the token isn't a keyword, that's wrong
        if (from.type !== "Keyword") return null;
        // We now split the keyword into segments.
        const segments = from.value.split(".");
        if (segments.length === 0) return null;
        try {
            const base = new KeywordValue(segments[0], scope);
            const otherSegments = segments.splice(1);
            for (const segment of otherSegments) {
                base.addSubTarget(segment);
            }
            return base;
        } catch (e) {
            return null;
        }
    }

    public addSubTarget(target: string) {
        if (isType(this.currentTarget)) {
            throw new Error(
                `Sub items do not yet exist on ${this.currentTarget}`
            );
        }
        if (isInterfaceContent(this.currentTarget)) {
            throw new Error(
                `Sub items have not yet been implemented for interfaces.`
            );
        }
        if (isFUNCTION(this.currentTarget)) {
            throw new Error(`No subitems exist on a function`);
        }
        if (isInterface(this.currentTarget)) {
            if (this.currentTarget[target]) {
                this.key += `.${target}`;
                this.currentTarget = this.currentTarget[target];
                return;
            }
            throw new Error(
                `${target} was not found on ${JSON.stringify(
                    this.currentTarget
                )}`
            );
        }
        if (isResource(this.currentTarget)) {
            if (target === "key") {
                this.currentTarget = "String";
                this.key += ".key";
                return;
            }
            this.currentTarget = ANY;
            this.key += `.data.${target}`;
            return;
        }
        // Since it is any, we just assume everything is groovy.
        this.currentTarget = ANY;
        this.key += target;
    }

    public castAs(type: target) {
        // If we are casting a request.resource or resource we need to add .data first
        if (isResource(this.currentTarget)) this.key += ".data";
        this.currentTarget = type;
    }

    public getType = () => this.currentTarget;

    public getKey = () => this.key;
}
