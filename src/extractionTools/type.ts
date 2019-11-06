export type Type = "Number" | "String" | "Boolean" | "Geopint" | "Timestamp";
export const allTypes: Array<Type> = [
    "Boolean",
    "Geopint",
    "Number",
    "String",
    "Timestamp"
];

const extractType = (input: string) => allTypes.find(t => t === input);

export default extractType;
