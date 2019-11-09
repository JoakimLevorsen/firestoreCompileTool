export type Type =
    | "Number"
    | "String"
    | "Bool"
    | "Geopint"
    | "Timestamp";
export const allTypes: Array<Type> = [
    "Bool",
    "Geopint",
    "Number",
    "String",
    "Timestamp"
];

const extractType = (input: string) =>
    allTypes.find(t => t === input);

export default extractType;
