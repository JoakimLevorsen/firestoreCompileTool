# Kakao with a Firebase

## Intro

The purpose of this language is to make development of Firebase security rules much much easier, by providing something much closer to a traditional scripting language.

Do note this project is still in it's very early fases, and there is no support yet for:

-   Geopoints
-   Timestamps
-   Arrays
-   Maps (sort of)

Furthermore a lot of properties you might be used to from firebase security rules have not been carried over yet. But all of this is on the way.

## Getting started

To get started simply clone the repo and run `npm run npmLike` or `yarn npmLike` to install the compiler.

It is then used as:
`kakao [inputfile] [outputfile]`
Though the files can be omitted if the current directory contains a file named `kakao.json` with the following properties:

| name   | optional | explanation     |
| ------ | -------- | --------------- |
| input  | no       | The input file  |
| output | no       | The output file |

## Interfaces

Well then, now let's get on to the exciting existing features, where the most important is `interfaces`.

Here's an example:

```
interface foo {
    bar: string
    foo?: number
    foobar: 7 | boolean | {a?: boolean}
}
```

This shows the most important interface features, we can have:

-   Properties
-   Optional properties
-   Multi type properties
-   Literal values

These interfaces can then be used to check contents of firebase docs.

## Expressions

Data can be manipulated in a couple of ways, here are the currently supported operators:

| Expression | Meaning                                                               |
| ---------- | --------------------------------------------------------------------- |
| A is B     | Does A have all and possibly more of fields from interface B          |
| A only B   | Does A have only fields present in B, but not nessesarily all of them |
| A isOnly B | Does A fit the interface B perfectly (A is B && A only B)             |
| A == B     | Is A equal to the value B                                             |
| A != B     | Is A not equal to the value B                                         |

## Rules

Now the whole purpose of this language is to make some rules, so lets make some rules:

```
write: (doc) => doc isOnly foo
```

This is a rule that allows a document to be written, if the document fits the `foo` interface exactly. We can also get more advanced:

```
write: (doc) => {
    if (doc isOnly foo) {
        return doc.bar == auth.uid
    }
    return auth.token.admin
}
```

A rule recives two paramenters, the new document, and the current. The rule then can use one, both or neither and has to return a boolean value.

## Match statements

Rules need to go somewhere, and that is in `match` statements, these are practically identical to firestores current language.

```
match /foo/{bar} {
    read: (_, doc) => doc.id == auth.uid
    create: (doc) => bar == auth.uid && doc isOnly foo
}
```

The path of a match statement must point at a document, and they can be nested within eachother.

## Const

The const concept has also been introduced to reduce the need for repitions.

```
const expectedLastWord = "please"

match /foo/{bar} {
    read: (_, doc) => doc.lastWord == expectedLastWord
}
```

## Global scope

Some values are globally available, and carried over from Firestore
| name | firestore rules equivalent |
| ------ | -------------------------- |
| `auth` | request.auth |

## Roadmap

The next stages in development:

0. ~~Comments support~~ ✔️
1. ~~< and > comparisons~~ ✔️ (needs testing)
1. Uniary expressions like `!foo` or `-bar`
1. Print compiler errors more expressively
1. More unit tests
1. Math expressions like `+ - / * %`
1. More types like `array` and `map`
1. Support for loops of iterations known at compile time.
