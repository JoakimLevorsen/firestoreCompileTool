import { InterfaceMap, Interface } from "../Interface";
import { ConstantCollection, Constant } from "../expressions";
import { MatchBlock } from ".";

export type BlockConstructor<B extends Block> = new (
    parent?: Block
) => B;

export class Block {
    private interfaces: InterfaceMap = {};
    private constants: ConstantCollection = new ConstantCollection();
    private parent?: Block;
    private children: Block[] = [];

    constructor(parent?: Block) {
        this.parent = parent;
        if (parent) {
            this.interfaces = { ...parent.interfaces };
            this.constants = parent.constants.clone;
        }
    }

    public get parentChain(): Block[] {
        let chain: Block[] = [];
        let item: Block = this;
        while (item.parent) {
            chain.push(item.parent);
            item = item.parent;
        }
        return chain;
    }

    public get matchBlocks(): MatchBlock[] {
        return this.parentChain.filter(
            c => c instanceof MatchBlock
        ) as MatchBlock[];
    }

    public get childMatchBlocks() {
        return this.children.filter(b => b instanceof MatchBlock);
    }

    public get latestMatchBlock(): MatchBlock | null {
        if (this instanceof MatchBlock) return this;
        let item: Block = this;
        while (item.parent) {
            if (item.parent instanceof MatchBlock) {
                return item.parent;
            }
            item = item.parent;
        }
        return null;
    }

    public spawnChild<B extends Block>(
        constructor: BlockConstructor<B>
    ) {
        const newBlock = new constructor(this);
        this.children.push(newBlock);
        return newBlock;
    }

    public addChild<B extends Block>(block: B) {
        this.children.push(block);
    }

    public static get baseBlock() {
        return new Block();
    }

    public addInterface(key: string, newInterface: Interface) {
        if (this.interfaces[key]) {
            throw new Error("Interface already defined");
        }
        this.interfaces[key] = newInterface;
    }

    public getInterfaces = () => this.interfaces;

    public getConstants = () => this.constants;

    public addConstant = (con: Constant) => this.constants.add(con);

    public toRule = (): string =>
        this.childMatchBlocks.reduce(
            (pV, v) => `${pV}\n${v.toRule()}`,
            "\n"
        );
}
