#!/usr/vin/env node

import chalk from "chalk";
import clear from "clear";
import figlet from "figlet";
import * as fs from "fs";
import blockToRules from "./outputTools";
import parse from "./oldParsers";

const [inputFile, outputFile] = process.argv;

if (inputFile === "" || outputFile === "") {
    console.log(
        chalk.red("A path for input and output must be provided.")
    );
} else {
    clear();
    // tslint:disable-next-line: no-console
    console.log(chalk.hex("#795548")(figlet.textSync("Kakao")));
    const file = fs.readFileSync(inputFile).toString();

    // const Oldb = extractBlock(file);
    const b = parse(file);

    // console.log("Old parser got", JSON.stringify(Oldb));

    const rules = blockToRules(b);

    fs.writeFileSync(outputFile, rules);
}
