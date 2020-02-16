import SyntaxComponent, { Position } from "../SyntaxComponent";
import { RuleStatement } from "./RuleStatement";

export interface PathElement {
    name: string;
    wildcard: boolean;
}

export class MatchStatement extends SyntaxComponent {
    constructor(
        position: Position,
        private _path: PathElement[],
        private _rules: RuleStatement[],
        private _subStatements: MatchStatement[] = []
    ) {
        super(position);
    }

    public get path() {
        return this._path;
    }

    public get rules() {
        return this._rules;
    }

    public get subStatements() {
        return this._subStatements;
    }

    protected internalEquals(other: SyntaxComponent): boolean {
        if (!(other instanceof MatchStatement)) return false;
        if (
            !this._path.every(p =>
                other._path.some(
                    oP =>
                        p.name === oP.name &&
                        p.wildcard === oP.wildcard
                )
            ) ||
            !other._path.every(p =>
                this._path.some(
                    oP =>
                        p.name === oP.name &&
                        p.wildcard === oP.wildcard
                )
            )
        )
            return false;
        return (
            this._rules.every(r =>
                other._rules.some(oR => r.equals(oR))
            ) &&
            other._rules.every(oR =>
                this._rules.some(r => r.equals(oR))
            )
        );
    }
}
