#!/usr/vin/env node

const chalk = require("chalk");
const clear = require("clear");
const figlet = require("figlet");
const path = require("path");
const program = require("commander");
import * as fs from "fs";
import extractBlock from "./extractionTools";
import blockToRules from "./outputTools";

clear();
console.log(chalk.red(figlet.textSync("hi")));
const file = fs.readFileSync("./test/testFile.fRules").toString();

const b = extractBlock(file);

console.log("Block is", JSON.stringify(b));

const rules = blockToRules(b);

console.log("Final is", rules);
