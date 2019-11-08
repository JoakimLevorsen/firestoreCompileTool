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

## Rules

Rules are defined as the following:

```
match /foo/[bar] {
    read: {
        return if bar.data is Foo;
    },
    create, delete: {
        return if bar.data.id == auth.uid;
    },
    match /fooBar/[foo] {
        read: true,
        write: if foo is Foo
    }
}
```

If a {block} is entered, return must be used, if not in a block it is optional.

## Global variables

| name | firestore rules equivalent |
| ---- | -------------------------- |
| auth | request.auth               |
