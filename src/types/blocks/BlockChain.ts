import { InterfaceMap } from "../Interface";
import { ConstantCollection } from "../expressions";
import { MatchBlock, Block } from ".";

// BlockChain, a chain of blocks.

// export type BlockChain = Block[];

// export interface CollapsedBlock {
//     interfaces: InterfaceMap;
//     constants: ConstantCollection;
//     path?: string;
//     pathVariable?: string;
// }

// export const collapseBlockChain = (
//     chain: BlockChain
// ): CollapsedBlock => {
//     const cBlock: CollapsedBlock = {
//         interfaces: {},
//         constants: new ConstantCollection()
//     };
//     console.log("Chain is", JSON.stringify(chain));
//     for (const block of chain) {
//         const { interfaces, constants } = block.getCollapsed();
//         cBlock.interfaces = { ...interfaces, ...cBlock.interfaces };
//         cBlock.constants = cBlock.constants.combine(constants);
//         if (block instanceof MatchBlock) {
//             const { path, pathVariable } = block.getPath();
//             if (cBlock.path) cBlock.path += path;
//             else cBlock.path = path;
//             cBlock.pathVariable = pathVariable;
//         }
//     }
//     return cBlock;
// };
