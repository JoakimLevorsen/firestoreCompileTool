import Literal from "../../types/literals";

export type LiteralCompiler<C extends Literal> = (item: C) => string;
