import { IdentifierOrLiteralExtractor } from "..";
import {
    Identifier,
    OperatorToken,
    spaceTokens,
    Token,
    tokenHasType,
    TypedToken
} from "../../types";
import { MemberExpression } from "../../types/expressions";
import {
    ComparisonOperators,
    EqualityExpression,
    isComparisonType,
    IsExpression,
    LogicalExpression,
    MathExpression,
    MathOperators,
    OrderExpression
} from "../../types/expressions/comparison";
import {
    MinusUnaryExpression,
    NegationUnaryExpression
} from "../../types/expressions/unary";
import Literal from "../../types/literals";
import SyntaxComponent from "../../types/SyntaxComponent";
import Stack from "../../utils/Stack";
import Parser from "../Parser";
import CallExpressionParser from "./CallExpressionParser";
import { CallExpression } from "../../types/expressions/CallExpression";
import { InExpression } from "../../types/expressions/comparison/InExpression";

interface UnaryToken extends TypedToken<"-" | "!"> {
    unary: true;
}

interface UnaryShuntingComponent {
    type: "Unary";
    operator: UnaryToken;
    item: SyntaxComponent | ShuntingComponent;
}

interface BinaryShuntingComponent {
    type: "Binary";
    operator: OperatorToken;
    left: SyntaxComponent | ShuntingComponent;
    right: SyntaxComponent | ShuntingComponent;
}

interface Group {
    type: "Group";
    content: SyntaxComponent | ShuntingComponent;
}

type ShuntingComponent =
    | UnaryShuntingComponent
    | BinaryShuntingComponent
    | Group;

type GroupToken = TypedToken<"(" | ")">;

// We use the shunting yard algorithm where queue is the processed items, and operatorStack is the stack

export default class ExpressionParser extends Parser {
    private stage:
        | "awaiting item"
        | "building item"
        | "awaiting operator"
        | "ended" = "awaiting item";
    private start = NaN;
    private items: Array<
        SyntaxComponent | OperatorToken | GroupToken | UnaryToken
    > = [];
    private subParser?: CallExpressionParser;
    // Since the other parsers return many times, we might have to ignore a couple of values along the way
    private nextItem?:
        | Identifier
        | Literal
        | MemberExpression
        | CallExpression;

    public addToken(token: Token): SyntaxComponent | null {
        if (isNaN(this.start)) this.start = token.location;
        switch (this.stage) {
            case "awaiting item": {
                if (tokenHasType(token, [...spaceTokens]))
                    return this.getResult();
                if (token.type === "(") {
                    this.items.push(token as GroupToken);
                    return this.getResult();
                }
                if (token.type === "-") {
                    this.items.push({
                        ...token,
                        unary: true
                    } as UnaryToken);
                    return null;
                }
                this.stage = "building item";
                this.subParser = new CallExpressionParser(
                    this.errorCreator
                );
                const result = this.subParser.addToken(token);
                this.nextItem = result ?? undefined;
                if (this.items.length === 0) return result;
                else return this.getResult(result ?? undefined);
            }
            case "building item": {
                if (this.subParser!.canAccept(token)) {
                    const result = this.subParser!.addToken(token);
                    if (result) {
                        this.nextItem = result;
                        return this.getResult(result);
                    }
                    return null;
                }
                // This means the item was done, and we can move on to the operator stage
                if (this.nextItem) {
                    this.items.push(this.nextItem!);
                    this.nextItem = undefined;
                }
                // Now we fall through to the next stage
            }
            case "awaiting operator": {
                if (tokenHasType(token, [...spaceTokens]))
                    return this.getResult();
                if (token.type === ";") {
                    this.stage = "ended";
                    return this.getResult();
                }
                if (token.type === ")") {
                    this.items.push(token as OperatorToken);
                    return this.getResult();
                }
                if (
                    !tokenHasType(token, [
                        ...MathOperators,
                        ...ComparisonOperators
                    ])
                )
                    throw this.errorCreator(token)(
                        "Unexpected token"
                    );
                this.items.push(token as OperatorToken);
                this.stage = "awaiting item";
                return null;
            }
            case "ended":
                throw this.errorCreator(token)("Internal error");
        }
    }

    public canAccept(token: Token): boolean {
        switch (this.stage) {
            case "awaiting item":
                // We allow unary tokens, and parentheses
                if (tokenHasType(token, ["(", "-"])) return true;
                try {
                    IdentifierOrLiteralExtractor(
                        token,
                        this.errorCreator
                    );
                    return true;
                } catch (e) {
                    return false;
                }
            case "building item":
                if (this.subParser!.canAccept(token)) return true;
            case "awaiting operator":
                return tokenHasType(token, [
                    ...spaceTokens,
                    ...MathOperators,
                    ...ComparisonOperators,
                    ";",
                    ")"
                ]);
            case "ended":
                return false;
        }
    }

    public getResult(extraItem?: SyntaxComponent) {
        try {
            const result = syntaxComponentifier(
                shuntingYardParser(
                    shuntingYardExecuter(
                        extraItem
                            ? [...this.items, extraItem]
                            : this.items
                    )
                )
            );
            // We need to turn this into syntax components
            return result;
        } catch (e) {
            return null;
        }
    }
}

const precedence = (
    token: OperatorToken | GroupToken | UnaryToken
): number => {
    if (isUnary(token)) return unaryPrecedence(token);
    return binaryPrecedence(token);
};

const binaryPrecedence = (
    token: OperatorToken | GroupToken
): number => {
    // Based on https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Operator_Precedence
    switch (token.type) {
        case "==":
        case "!=":
            return 11;
        case "<":
        case "<=":
        case ">":
        case ">=":
            return 12;
        case "is":
        case "isOnly":
        case "only":
        case "in":
        case "inn't":
            return 13;
        case "*":
        case "/":
            return 15;
        case "+":
        case "-":
            return 14;
        case "&&":
            return 5;
        case "||":
            return 5;
        default:
            return -1;
    }
};

const unaryPrecedence = (token: UnaryToken): number => {
    switch (token.type) {
        case "-":
        case "!":
            return 17;
    }
};

const isUnary = (token: Token): token is UnaryToken => {
    const t: any = token;
    return typeof t.unary === "boolean";
};

// Do the shuntingYard conversion
const shuntingYardExecuter = (
    input: Array<
        SyntaxComponent | OperatorToken | GroupToken | UnaryToken
    >
): Array<SyntaxComponent | OperatorToken> => {
    const queue: Array<SyntaxComponent | OperatorToken> = [];
    const operatorStack: Stack<
        OperatorToken | GroupToken | UnaryToken
    > = new Stack();
    for (const item of input) {
        if (item instanceof SyntaxComponent) {
            queue.push(item);
        } else if (item.type === "(") {
            operatorStack.push(item);
        } else if (item.type === ")") {
            while (
                operatorStack.top &&
                operatorStack.top.type !== "("
            )
                queue.push(operatorStack.pop() as OperatorToken);
            if (operatorStack.top?.type === "(") operatorStack.pop();
        } else {
            const myPrecidence = precedence(item as OperatorToken)!;
            while (
                !operatorStack.empty &&
                (myPrecidence < precedence(operatorStack.top!) ||
                    (myPrecidence ===
                        precedence(operatorStack.top!) &&
                        !isUnary(item)))
            )
                queue.push(operatorStack.pop() as OperatorToken);
            operatorStack.push(item);
        }
    }
    // Then we add the remaining tokens
    return [
        ...queue,
        ...(operatorStack
            .remaining()
            .filter(o => o.type !== "(" && o.type !== ")") as Array<
            SyntaxComponent | OperatorToken
        >)
    ];
};

// Then correct the structure
const shuntingYardParser = (
    input: Array<SyntaxComponent | OperatorToken | UnaryToken>
): SyntaxComponent | ShuntingComponent => {
    const output: Stack<
        ShuntingComponent | SyntaxComponent
    > = new Stack();
    for (const item of input) {
        if (item instanceof SyntaxComponent) {
            output.push(item);
        } else if (isUnary(item)) {
            const o = output.pop()!;
            output.push({ type: "Unary", operator: item, item: o });
        } else {
            const o1 = output.pop()!;
            const o2 = output.pop()!;
            output.push({
                type: "Binary",
                operator: item,
                right: o1,
                left: o2
            });
        }
    }
    // Now the output should be exactly one item
    if (output.length !== 1) throw new Error("Expression incomplete");
    const top = output.top;
    if (top === null) throw new Error("Expression incomplete");
    return top;
};

// Then we can use the shuntingYardParser output to make syntax components
const syntaxComponentifier = (
    input: SyntaxComponent | ShuntingComponent
): SyntaxComponent => {
    if (input instanceof SyntaxComponent) return input;
    switch (input.type) {
        case "Group":
            return syntaxComponentifier(input);
        case "Binary": {
            const { operator } = input;
            const [left, right] = [input.left, input.right].map(i =>
                syntaxComponentifier(i)
            );
            if (!isComparisonType(left) || !isComparisonType(right)) {
                throw new Error("Internal error");
            }
            switch (operator.type) {
                case "==":
                case "!=":
                    return new EqualityExpression(
                        operator.type,
                        left,
                        right
                    );
                case "&&":
                case "||":
                    return new LogicalExpression(
                        operator.type,
                        left,
                        right
                    );
                case "is":
                case "isOnly":
                case "only":
                    return new IsExpression(
                        operator.type,
                        left,
                        right
                    );
                case "<":
                case "<=":
                case ">":
                case ">=":
                    return new OrderExpression(
                        operator.type,
                        left,
                        right
                    );
                case "+":
                case "-":
                case "/":
                case "*":
                    return new MathExpression(
                        operator.type,
                        left,
                        right
                    );
                case "in":
                case "inn't":
                    return new InExpression(
                        operator.type,
                        left,
                        right
                    );
            }
        }
        case "Unary": {
            const { operator, item } = input;
            const value = syntaxComponentifier(item);
            if (!isComparisonType(value))
                throw new Error("Internal error");
            switch (operator.type) {
                case "-":
                    return new MinusUnaryExpression(
                        operator.location,
                        operator.type,
                        value
                    );
                case "!":
                    return new NegationUnaryExpression(
                        operator.location,
                        operator.type,
                        value
                    );
                default:
                    throw new Error("Unexpected operator");
            }
        }
    }
};
