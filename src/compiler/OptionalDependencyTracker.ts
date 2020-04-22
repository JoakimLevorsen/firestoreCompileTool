import { DatabaseLocation } from "./Compiler";

interface ExistDep {
    type: "Exist";
    value: DatabaseLocation;
}

interface KeyExistDep {
    type: "Key";
    value: DatabaseLocation;
    key: string;
}

type DepType = ExistDep | KeyExistDep;

export default class OptionalDependecyTracker {
    constructor(private deps: DepType[] = []) {}

    // We clone the objects we're served to make sure they don't get manipulated unintentionally
    public addDep = (item: DatabaseLocation, key?: string) =>
        key
            ? this.deps.push({ type: "Key", key, value: { ...item } })
            : this.deps.push({ type: "Exist", value: { ...item } });

    public moveDepsTo = (other: OptionalDependecyTracker) =>
        other.deps.concat(this.deps);

    public cloneDepsFrom = (other?: OptionalDependecyTracker) => {
        if (other) this.deps = [...this.deps, ...other.deps];
    };

    private reduceSelf = () =>
        this.deps.reduce((total, item) => {
            if (item.type === "Exist") {
                const { needsDotData, key } = item.value;
                const output = `${
                    needsDotData ? `${key}.data` : key
                } != null`;
                if (total === "(") return "(" + output;
                return `${total} && ${output}`;
            }
            const { value, key } = item;
            const ref = value.needsDotData
                ? `${value.key}.data`
                : value.key;
            const output = `"${key}" in ${ref}`;
            if (total === "(") return "(" + output;
            return `${total} && ${output}`;
        }, "(") + ")";

    public export = () =>
        this.deps.length === 0 ? null : this.reduceSelf();

    //   Return expression with dependencies
    public returnFor = (other: string) =>
        this.deps.length === 0 ? other : this.reduceSelf();
}
