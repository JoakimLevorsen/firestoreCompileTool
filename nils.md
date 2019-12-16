# New Intermediate Language Syntax

## Foreword

Since every thing in firestore rules compiles down to functions, and single line rule expressions, our intermediate structure must remember this.

## Structures

### Condition

A condition is some form of comparison that returns a true or a false value.

### Expression

An expression is some some code that does something, eg. return, calculation, constant assignment.

### Block

Block is the global block all file items is contained inside.

-   Interfaces
-   MatchBlocks
-   Constants

Specific rules can only be contained if the block is surounded by a match statement.

### MatchBlock

A MatchBlock is the block after a `match` statement. It can contain the following:

-   Interfaces
-   Specific rules (eg. read, write, etc)
-   New MatchBlocks
-   Constants

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

Then the text after `write` is a codeBlock.
CodeBlocks can contain:

-   contants
-   dynamically defined constants
-   if statemets
-   return statements

The text after is `read` is a single condition

### IfBlock

An ifblock is code defined by an if statement.

```
if (a == b) {
    return true;
}
return false;
```

Where it is composed of an condition as a condition, a block to execute if true, and an optional false block.
Notice that since variables don't exist, all if statements are effectively if {} else {}.
This is since if you don't return in an if you can't really do anything else.
