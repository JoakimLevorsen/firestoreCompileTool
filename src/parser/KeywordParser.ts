import { Interface } from "./InterfaceParser";

// Keyword paser extracts keywords from the users code.

export default class KeywordParser {
    private allInterfaces: { [id: string]: Interface };

    constructor(interfaces: { [id: string]: Interface }) {
        this.allInterfaces = interfaces;
    }
}
