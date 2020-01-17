// Different types of values expressed in a file.

import InterfaceValue from "./InterfaceValue";
import KeywordValue from "./KeywordValue";
import RawValue from "./RawValue";
import { Token } from "../Token";
import { Block } from "../blocks";

export const valueForToken = (token: Token, scope: Block) =>
    RawValue.toRawValue(token) ||
    InterfaceValue.toInterfaceValue(token, scope) ||
    KeywordValue.toKeywordValue(token, scope);

export { InterfaceValue, KeywordValue, RawValue };
