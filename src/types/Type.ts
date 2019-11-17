export type Type =
    | "Number"
    | "String"
    | "Bool"
    | "Geopoint"
    | "Timestamp"
    | "Map"
    | "Array";

export const AllTypesArray: Type[] = [
    "Bool",
    "Geopoint",
    "Number",
    "String",
    "Timestamp",
    "Map",
    "Array"
];

// tslint:disable-next-line: one-variable-per-declaration
export const AllTypes: { [id: string]: Type } = {
    Array: "Array",
    Bool: "Bool",
    Geopoint: "Geopoint",
    Map: "Map",
    Number: "Number",
    String: "String",
    Timestamp: "Timestamp"
};

export const isType = (input: any): input is Type => {
    if (typeof input !== "string") {
        return false;
    }
    return AllTypes[input] !== undefined;
};
