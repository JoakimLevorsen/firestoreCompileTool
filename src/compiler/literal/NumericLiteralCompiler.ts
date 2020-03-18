import { NumericLiteral } from "../../types/literals";
import { LiteralCompiler } from "./LiteralCompiler";

export const NumericLiteralCompiler: LiteralCompiler<NumericLiteral> = item =>
    item.value.toString();
