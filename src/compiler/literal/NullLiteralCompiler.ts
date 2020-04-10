import { NullLiteral } from "../../types/literals";
import { LiteralCompiler } from "./LiteralCompiler";

export const NullLiteralCompiler: LiteralCompiler<NullLiteral> = item =>
    String(item.value);
