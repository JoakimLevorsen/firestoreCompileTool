# New Intermediate Language Syntax

## Foreword

Since every thing in firestore rules compiles down to functions, and single line rule expressions, our intermediate structure must remember this.

## Structures

### Block

A block is whatever is a container for information, either the outer lines of the file, or something inside {}. A block can contain the following:

-   Interfaces
-   Specific rules (eg. read, write, etc)
-   New match conditions
-   Constants

Specific rules can only be contained if the block is surounded by a match statement.

### CodeBlock

Check out the example below:

```
match /path/[path] {
    read: path.item is String;
    write: {
        return request.auth != null;
    }
}
```

Then the text after `read:`, and the block after `write` are codeBlocks.
CodeBlocks can contain:

-   contants
-   dynamically defined constants
-   if statemets
-   return statements
