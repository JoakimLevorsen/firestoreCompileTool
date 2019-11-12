# Firestore new security language spec.

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
|Expression|Meaning|
|-|-|
|A is B|Does A have all fields of interface B|
|A only B|Does A have only fields present in B, but not nessesarily all of them|
|A isOnly B|Does A fit the interface B perfectly|
|A == B|Is A equal to the value B|
|A != B|Is A not equal to the value B|

## Rules

Rules are defined inside match blocks. Match blocks start with the match keyword, followed by their path, then a block.

```
match /foo/[bar] {

}
```

Inside a match block the rules are stated, rules can have the following headers: read, write, create, update, delete. 'read, write' would mean the following rule is valid for both read and write operations.

```
match /foo/[bar] {
    read: {
        ...
    },
    create, delete: {
        ...
    },
    update: ...
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

| name | firestore rules equivalent |
| ---- | -------------------------- |
| auth | request.auth               |
