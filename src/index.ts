#!/usr/vin/env node

import chalk from "chalk";
import clear from "clear";
import figlet from "figlet";
import * as fs from "fs";
import blockToRules from "./outputTools";
import parse from "./parser";

clear();
// tslint:disable-next-line: no-console
console.log(chalk.red(figlet.textSync("hi")));
const file = fs.readFileSync("./test/testFile2.fRules").toString();

// const Oldb = extractBlock(file);
const b = parse(file);

// console.log("Old parser got", JSON.stringify(Oldb));

const rules = blockToRules(b);

fs.writeFileSync("./test/output.fire", rules);
