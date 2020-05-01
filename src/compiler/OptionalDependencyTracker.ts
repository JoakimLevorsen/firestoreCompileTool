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

    public export = (successReturn: string) =>
        /*
    When we reduce we use tenerary chains to return either null, or the optional value
    So a?.b?.c turns into a != null ? (a.b != null ? (a.b.c != null ? a.b.c : null) : null ) : null
    */
        {
            return this.deps.reduceRight((total, item) => {
                if (item.type === "Exist") {
                    // Then we need to make sure this value is not null
                    const { needsDotData, key } = item.value;
                    const output = `${
                        needsDotData ? `${key}.data` : key
                    } != null`;
                    return `(${output} ? ${total} : null)`;
                } else {
                    // Otherwise we need to check if a key is present on an object
                    const { value, key } = item;
                    const ref = value.needsDotData
                        ? `${value.key}.data`
                        : value.key;
                    const output = `"${key}" in ${ref}`;
                    return `(${output} ? ${total} : null)`;
                }
            }, successReturn);
        };
}
