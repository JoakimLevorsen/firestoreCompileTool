import Literal from "../../parser/types/literal";

export type LiteralCompiler<C extends Literal> = (item: C) => string;
