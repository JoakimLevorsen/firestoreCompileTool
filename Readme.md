# KaKao with a FireBase

[](./KaKao.svg)

## Types

The following types exist in the language:

-   Number
-   String
-   Boolean
-   Geopoint
-   Timestamp
-   Array
-   Map

## Interfaces

An interface is a collection of types, and is defined as such:

```
interface Foo {
    bar: Number;
    foo: String | Number;
    fooBar?: String | Timestamp;
}
```

## Expressions

Expressions are made to express opinion and are created using operators.
For now the following expressions exist:
| Expression | Meaning |
| ---------- | ------- |
| A is B | Does A have all and possibly more of fields from interface B |
| A only B | Does A have only fields present in B, but not nessesarily all of them |
| A isOnly B | Does A fit the interface B perfectly (A is B && A only B) |
| A == B | Is A equal to the value B |
| A != B | Is A not equal to the value B |

## Rules

Rules are defined inside match blocks. Match blocks start with the match keyword, followed by their path, then a block.

```
match /foo/[bar] {

}
```

Inside a match block the rules are stated, rules can have the following headers: read, write, create, update, delete. 'read, write' would mean the following rule is valid for both read and write operations.

All Rule headers end with an arrow function that details the name of the new document, and then the current document. An underscore indicates the item is to be ignored.

```
match /foo/[bar] {
    read: (doc) => {
        ...
    },
    create, delete: () => {
        ...
    },
    update: (_, doc) => ...
}
```

Rules can be followed either by a block containing their rule, or a one liner that states the entire rule.

```
match /foo/[bar] {
    read: bar.data is Foo;
    create, delete: {
        if bar.data.id == auth.uid {
            return false;
        }
        return bar.data is Foo;
    }
}
```

For one liners return is implied

If a {block} is entered, return must be used, if not in a block it is optional. If statements can be used for branching, but exist only for the purpose of containing another if statement, or a return, so else does not exist, since all if's are inherintly if-else.
Rule blocks use the return keyword to indicate they're done with branching and will return.

## Global variables

| name   | firestore rules equivalent |
| ------ | -------------------------- |
| `auth` | request.auth               |

## Rule variables

### Available for rule.

| name      | firestore rules equivalent |
| --------- | -------------------------- |
| `[*]`     | resource                   |
| `request` | request                    |

### Resource

The name of the resource is equal to the last part of the path for the match block.
Fields:

| name      | Meaning                                       |
| --------- | --------------------------------------------- |
| `id`      | The document ID                               |
| `docPath` | The path of the document                      |
| `\*`      | Any other property is treated as `doc.data.*` |
