#!/usr/vin/env node

import chalk from "chalk";
import clear from "clear";
import figlet from "figlet";
import * as fs from "fs";
// import blockToRules from "./outputTools";
import parse from "./parser";
import { formatFile } from "./outputTools";

// const [inputFile, outputFile] = process.argv;

// if (inputFile === "" || outputFile === "") {
//     console.log(
//         chalk.red("A path for input and output must be provided.")
//     );
// } else {
clear();
// tslint:disable-next-line: no-console
console.log(chalk.hex("#795548")(figlet.textSync("Kakao")));
const file = fs.readFileSync("./test/testFiles/2.kakao").toString();

// const Oldb = extractBlock(file);
const b = parse(file);

// console.log("Old parser got", JSON.stringify(Oldb));
const rules = b?.toRule();
const formatted = formatFile(rules || "");

fs.writeFileSync("./output.x", formatted);
// }
