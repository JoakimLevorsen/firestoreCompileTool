import extractType from "./type";
import extractInterface, {
    Interface,
    isValidInterface,
    removeInterfaceFromString
} from "./interface";
import extractMatch, {
    isValidMatch,
    MatchGroup,
    removeMatchFromString
} from "./matchGroup";

export { Type, allTypes } from "./type";
export { InterfaceData } from "./interface";
export { extractType, extractInterface };

export type Block = {
    interfaces: { [id: string]: Interface };
    matchGroups: MatchGroup[];
};

const extractBlock = (input: string) => {
    let treatedInput = input;
    const newBlock: Block = { interfaces: {}, matchGroups: [] };
    while (!/^\s*$/.test(treatedInput)) {
        if (isValidInterface(treatedInput)) {
            const { name, content } = extractInterface(treatedInput);
            newBlock.interfaces[name] = content;
            treatedInput = removeInterfaceFromString(treatedInput);
        } else if (isValidMatch(treatedInput)) {
            const match = extractMatch(treatedInput, newBlock.interfaces);
            newBlock.matchGroups.push(match);
            treatedInput = removeMatchFromString(treatedInput);
        } else {
            throw "Block unknown " + JSON.stringify(treatedInput);
        }
    }
    return newBlock;
};

export default extractBlock;
