import { BooleanLiteral } from "../../parser/types/literal";
import { LiteralCompiler } from "./LiteralCompiler";

export const BooleanLiteralCompiler: LiteralCompiler<BooleanLiteral> = item =>
    String(item.value);
