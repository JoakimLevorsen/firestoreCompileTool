export type Type =
    | "Number"
    | "String"
    | "Bool"
    | "Geopoint"
    | "Timestamp"
    | "Map"
    | "Array";
export const allTypes: Type[] = [
    "Bool",
    "Geopoint",
    "Number",
    "String",
    "Timestamp",
    "Map",
    "Array"
];

export type AllTypes = { [T in Type]: T };

// tslint:disable-next-line: one-variable-per-declaration
export const AllTypes: AllTypes = {
    Array: "Array",
    Bool: "Bool",
    Geopoint: "Geopoint",
    Map: "Map",
    Number: "Number",
    String: "String",
    Timestamp: "Timestamp"
};

const extractType = (input: string) =>
    allTypes.find(t => t === input);

export default extractType;
