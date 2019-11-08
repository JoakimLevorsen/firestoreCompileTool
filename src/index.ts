#!/usr/vin/env node

const chalk = require("chalk");
const clear = require("clear");
const figlet = require("figlet");
const path = require("path");
const program = require("commander");
import * as fs from "fs";
import extractBlock from "./extractionTools";
import blockToRules from "./outputTools";
import parse from "./nonRegexParser";

clear();
console.log(chalk.red(figlet.textSync("hi")));
const file = fs.readFileSync("./test/testFile.fRules").toString();

// const Oldb = extractBlock(file);
const b = parse(file);

console.log("Block is", JSON.stringify(b));
// console.log("Old parser got", JSON.stringify(Oldb));

const rules = blockToRules(b);

console.log("Final is", rules);
