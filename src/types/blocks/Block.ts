import { InterfaceMap, Interface } from "../Interface";
import { ConstantCollection, Constant } from "../expressions";
import MatchBlock from "./MatchBlock";
import { CollapsedBlock } from "./BlockChain";

export class Block {
    private interfaces: InterfaceMap = {};
    private constants: ConstantCollection = new ConstantCollection();
    private matchBlocks: Array<MatchBlock> = [];

    public addInterface(key: string, newInterface: Interface) {
        if (this.interfaces[key]) {
            throw new Error("Interface already defined");
        }
        this.interfaces[key] = newInterface;
    }

    public addConstant = (con: Constant) => this.constants.add(con);

    public addMatchBlock = (mBlock: MatchBlock) =>
        this.matchBlocks.push(mBlock);

    public getCollapsed = (): CollapsedBlock => ({
        interfaces: this.interfaces,
        constants: this.constants
    });
}
