import { Condition, Expression, isExpression } from ".";

export interface IfBlock {
    condition: Expression;
    ifTrue: Expression | IfBlock;
    ifFalse?: Expression | IfBlock;
}

export const isIfBlock = (input: any): input is IfBlock => {
    if (typeof input === "object") {
        const { condition, ifTrue, ifFalse } = input;
        if (condition && ifTrue) {
            if (
                isExpression(condition) &&
                (isExpression(ifTrue) || isIfBlock(ifTrue))
            ) {
                // Now if ifFalse exists, we check the type.
                if (
                    !ifFalse ||
                    isExpression(ifFalse) || isIfBlock(ifFalse)
                ) {
                    return true;
                }
            }
        }
    }
    return false;
};
