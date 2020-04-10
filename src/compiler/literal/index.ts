import Literal, {
    BooleanLiteral,
    InterfaceLiteral,
    NumericLiteral,
    StringLiteral,
    TypeLiteral,
    NullLiteral
} from "../../types/literals";
import CompilerError from "../CompilerError";
import { BooleanLiteralCompiler } from "./BooleanLiteralCompiler";
import { LiteralCompiler } from "./LiteralCompiler";
import { NumericLiteralCompiler } from "./NumericLiteralCompiler";
import { StringLiteralCompiler } from "./StringLiteralCompiler";
import { TypeLiteralCompiler } from "./TypeLiteralCompiler";
import { NullLiteralCompiler } from "./NullLiteralCompiler";

const LiteralCompiler = (item: Literal) => {
    if (item instanceof StringLiteral)
        return StringLiteralCompiler(item);
    if (item instanceof NullLiteral) return NullLiteralCompiler(item);
    if (item instanceof NumericLiteral)
        return NumericLiteralCompiler(item);
    if (item instanceof BooleanLiteral)
        return BooleanLiteralCompiler(item);
    if (item instanceof TypeLiteral) return TypeLiteralCompiler(item);
    if (item instanceof InterfaceLiteral) return item.value;
    throw new CompilerError(item, "Unexpected outcome");
};

export const NonTypeLiteralCompiler = (
    item:
        | NumericLiteral
        | StringLiteral
        | BooleanLiteral
        | NullLiteral
) => {
    if (item instanceof StringLiteral)
        return StringLiteralCompiler(item);
    if (item instanceof NullLiteral) return NullLiteralCompiler(item);
    if (item instanceof NumericLiteral)
        return NumericLiteralCompiler(item);
    if (item instanceof BooleanLiteral)
        return BooleanLiteralCompiler(item);
    throw new CompilerError(item, "Unexpected outcome");
};

export default LiteralCompiler;
