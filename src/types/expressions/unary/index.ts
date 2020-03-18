import SyntaxComponent, { Position } from "../../SyntaxComponent";
import { ComparisonType } from "../comparison";
import { UnaryOperator } from "./UnaryOperators";

export abstract class UnaryExpression extends SyntaxComponent {
    constructor(
        position: Position,
        protected _operator: UnaryOperator,
        protected _content: ComparisonType
    ) {
        super(position);
    }

    public get content() {
        return this._content;
    }

    protected internalEquals(other: SyntaxComponent): boolean {
        if (!(other instanceof UnaryExpression)) return false;
        return (
            this.content.equals(other.content) &&
            this._operator === other._operator
        );
    }
}

export * from "./MinusUnaryExpression";
export * from "./NegationUnaryExpression";
export * from "./UnaryOperators";
