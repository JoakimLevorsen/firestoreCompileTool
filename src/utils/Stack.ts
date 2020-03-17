export default class Stack<T> {
    private content: T[];

    constructor(withContent: T[] = []) {
        this.content = withContent;
    }

    public push = (item: T) => this.content.push(item);

    public pop = () => this.content.pop();

    public pushAll = (items: T[]) => this.content.concat(items);

    public remaining = () => [...this.content].reverse();

    public get length() {
        return this.content.length;
    }

    public get empty() {
        return this.content.length === 0;
    }

    public get top() {
        return this.content[this.content.length - 1] ?? null;
    }

    public toString(): string {
        let s = "Stack [";
        this.content.forEach(i => (s += `${JSON.stringify(i)}, `));
        return s + "]";
    }
}
