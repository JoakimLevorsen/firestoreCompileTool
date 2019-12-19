import { Block } from "./Block";
import { InterfaceMap } from "../Interface";
import { ConstantCollection } from "../expressions";

// BlockChain, a chain of blocks.

export type BlockChain = Block[];

export interface CollapsedBlock {
    interfaces: InterfaceMap;
    constants: ConstantCollection;
}

export const collapseBlockChain = (
    chain: BlockChain
): CollapsedBlock => {
    const cBlock: CollapsedBlock = {
        interfaces: {},
        constants: new ConstantCollection()
    };
    for (const block of chain) {
        const { interfaces, constants } = block.getCollapsed();
        cBlock.interfaces = { ...interfaces, ...cBlock.interfaces };
        cBlock.constants = cBlock.constants.combine(constants);
    }
    return cBlock;
};
