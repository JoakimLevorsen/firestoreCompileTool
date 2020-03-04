export const formatFile = (input: string): string => {
    // First we replace all spacing with one space
    const oneLiner = input.replace(/\s+/g, " ");
    // Then we split based on {} () [] and ;
    const split = oneLiner
        .replace(/([\[\{\(;])\s/g, "$1\n")
        .replace(/\s([\]\}\)])/g, "\n$1")
        // The Match keyword is always moved to its own line.
        .replace(/^\s*([\}\)\]])\s*match(.*)$/gm, "$1\nmatch$2")
        // We also split if two of the same type appear in a row with a space in front
        // so someting )) other is caught, but not
        // something().other
        .replace(/(\s)([\[\]\{\}\(\)])([\[\]\{\}\(\)])/g, "$1$2\n$3")
        .replace(/(\|\||&&)/g, "\n$1")
        .split("\n");

    let output = "";
    let indentation = 0;
    // Replace with better formatter that can take account of {} on one line
    /* Every single ({[ moves the tab one in, and every singe ]})
     moves it out for the next line, since that should balance it out. */
    for (const line of split) {
        const myIndentation = indentation;
        indentation +=
            countMatches(line, ["{", "[", "("]) -
            countMatches(line, [")", "]", "}"]);
        if (indentation < myIndentation) {
            output += tabsForCount(indentation) + line + "\n";
        } else {
            output += tabsForCount(myIndentation) + line + "\n";
        }
    }
    return output;
};

const countMatches = (input: string, match: string[]): number => {
    let matches = 0;
    for (const char of input) {
        if (match.some(m => m === char)) {
            matches++;
        }
    }
    return matches;
};

const tabsForCount = (count: number): string => {
    if (count < 0) {
        return "";
    }
    let output = "";
    for (let i = count; i > 0; i--) {
        output += "  ";
    }
    return output;
};
