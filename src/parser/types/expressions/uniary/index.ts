import SyntaxComponent from "../../SyntaxComponent";
import { ComparisonType } from "../comparison";
import { UniaryOperator } from "./UniaryOperators";

export class UniaryExpression extends SyntaxComponent {
    constructor(
        start: number,
        protected _operator: UniaryOperator,
        protected _element: ComparisonType
    ) {
        super({ start, end: _element.getEnd() });
    }

    public get operator() {
        return this._operator;
    }

    public get element() {
        return this._element;
    }

    protected internalEquals(other: SyntaxComponent): boolean {
        if (!(other instanceof UniaryExpression)) return false;
        return (
            this._operator === other._operator &&
            this._element.equals(other._element)
        );
    }
}

export * from "./MinusUniaryExpression";
export * from "./NegationUniaryExpression";
export * from "./UniaryOperators";
