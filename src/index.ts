#!/usr/bin/env node
"use strict";
import chalk from "chalk";
import figlet from "figlet";
import * as fs from "fs";
import compile from "./compiler";
import { formatFile } from "./formatter";
import parse from "./parser";

const [, , inputFile, outputFile] = process.argv;

console.log(chalk.hex("#795548")(figlet.textSync("Kakao")));

const doCompile = (input: string, output: string, debug = false) => {
    console.time("File read");
    const file = fs.readFileSync(input).toString();
    console.timeEnd("File read");
    console.time("Parse");

    // const Oldb = extractBlock(file);
    const asp = parse(file);
    console.timeEnd("Parse");

    if (asp) {
        console.time("Compile");
        const compiled = compile(asp, file, debug);
        console.timeEnd("Compile");
        if (!compiled) return;
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
            doCompile(data.input, data.output);
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
} else doCompile(inputFile, outputFile);
