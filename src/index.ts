#!/usr/bin/env node
"use strict";
import chalk from "chalk";
import figlet from "figlet";
import * as fs from "fs";
import { FileWrapperCompiler } from "./compiler/FileWrapperCompiler";
import { formatFile } from "./outputTools";
import parse from "./parser";

const [, , inputFile, outputFile] = process.argv;

console.log(chalk.hex("#795548")(figlet.textSync("Kakao")));

const compile = (input: string, output: string) => {
    const file = fs.readFileSync(input).toString();

    // const Oldb = extractBlock(file);
    const asp = parse(file);
    if (asp) {
        const compiled = FileWrapperCompiler(asp);
        fs.writeFileSync(output, formatFile(compiled));
        console.log(
            chalk.green(
                `✔️  compiled ${input} and saved it as ${output}`
            )
        );
    } else
        console.log(
            chalk.red(
                `File at ${input} had no match statements, so no code was returned.`
            )
        );
};

if (
    !inputFile ||
    inputFile === "" ||
    !outputFile ||
    outputFile === ""
) {
    // Now we see if a kakao.json exits
    if (fs.existsSync("./kakao.json")) {
        const data = JSON.parse(
            fs.readFileSync("./kakao.json").toString()
        );
        if (data.input && data.output) {
            compile(data.input, data.output);
        } else
            console.log(
                chalk.red(
                    "kakao.json must contain an input and an output property"
                )
            );
    } else
        console.log(
            chalk.red(
                "A path for input and output must be provided as arguments or in kakao.json."
            )
        );
} else compile(inputFile, outputFile);
