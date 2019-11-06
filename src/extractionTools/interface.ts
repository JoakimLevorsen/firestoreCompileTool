import { Type, extractType } from ".";

export type Interface = { [id: string]: Array<Type> | Type };

export type InterfaceData = { name: string; content: Interface };

const outerInterfaceRegex = /^\s*interface\s+(\w+)\s*{((?:[\sA-Za-z|;]*:[\sA-Za-z|;]*)*)}\s*/;

export const isValidInterface = (input: string) =>
    // TODO: Make better test
    outerInterfaceRegex.test(input);

export const removeInterfaceFromString = (input: string) =>
    input.replace(outerInterfaceRegex, "");

const extractInterface = (input: string): InterfaceData => {
    if (!isValidInterface(input)) throw "Invalid Interface";
    const contentMatch = input.match(outerInterfaceRegex);
    if (contentMatch === null) throw "Invalid Interface";
    const [_, interfaceName, content] = contentMatch;
    const newInterface: Interface = {};
    // We remove all spaces, split the content into lines, remove all empty lines, and process each line.
    for (const line of content
        .replace(/\s*/g, "")
        .split(";")
        .filter(l => l !== "")) {
        // We get the name and the type/types
        const [name, types] = line.split(":");
        // We check if the types contain a | splitter.
        if (types.includes("|")) {
            const typeContent: Array<Type> = [];
            // We extract the type from the string
            for (const t of types.split("|")) {
                const type = extractType(t);
                if (type === undefined)
                    throw "Invalid Type " + JSON.stringify(t);
                typeContent.push(type);
            }
            newInterface[name] = typeContent;
        } else {
            const type = extractType(types);
            if (type === undefined)
                throw "Invalid Type " + JSON.stringify(types);
            newInterface[name] = type;
        }
    }
    return { name: interfaceName, content: newInterface };
};

export default extractInterface;
