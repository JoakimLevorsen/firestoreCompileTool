import { BinaryExpression, MemberExpression } from "../expressions";
import SyntaxComponent, { Position } from "../SyntaxComponent";
import { BlockStatement } from "./BlockStatement";

export const RuleHeaders = [
    "read",
    "write",
    "create",
    "update",
    "delete"
] as const;

export type RuleHeader = typeof RuleHeaders[number];

export class RuleStatement extends SyntaxComponent {
    constructor(
        position: Position,
        private _headers: RuleHeader[],
        private _params: { newDoc?: string; oldDoc?: string },
        private _rule:
            | BlockStatement
            | BinaryExpression
            | MemberExpression
    ) {
        super(position);
    }

    public get headers() {
        return this._headers;
    }

    public get rule() {
        return this._rule;
    }

    public get params() {
        return this._params;
    }

    protected internalEquals(other: SyntaxComponent): boolean {
        if (!(other instanceof RuleStatement)) return false;
        if (!other._rule.equals(this._rule)) return false;
        return (
            this._headers.every(h => other._headers.includes(h)) &&
            other._headers.every(h => this._headers.includes(h))
        );
    }
}
