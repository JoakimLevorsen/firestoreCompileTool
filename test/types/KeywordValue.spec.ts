import "mocha";
import { expect } from "chai";
import { MatchBlock } from "../../src/types";

const scope = new MatchBlock();
scope.setPath("/foo/bar", "bar");
