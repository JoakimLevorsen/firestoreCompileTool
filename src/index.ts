#!/usr/vin/env node

import chalk from "chalk";
import clear from "clear";
import figlet from "figlet";
import * as fs from "fs";
import { FileWrapperCompiler } from "./compiler/FileWrapperCompiler";
import { formatFile } from "./outputTools";
import parse from "./parser";

const [inputFile, outputFile] = process.argv;

if (inputFile === "" || outputFile === "") {
    // tslint:disable-next-line: no-console
    console.log(
        chalk.red("A path for input and output must be provided.")
    );
} else {
    clear();
    // tslint:disable-next-line: no-console
    console.log(chalk.hex("#795548")(figlet.textSync("Kakao")));
    const file = fs
        .readFileSync("./test/testFiles/4.kakao")
        .toString();

    // const Oldb = extractBlock(file);
    const asp = parse(file);
    if (asp) {
        const compiled = FileWrapperCompiler(asp);
        // tslint:disable-next-line: no-console
        fs.writeFileSync("./output.x", formatFile(compiled));
    }
}
export const e = "";
