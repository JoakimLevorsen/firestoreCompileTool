import { NumericLiteral } from "../../parser/types/literal";
import { LiteralCompiler } from "./LiteralCompiler";

export const NumericLiteralCompiler: LiteralCompiler<NumericLiteral> = item =>
    item.value.toString();
