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
match /foo/{bar} (
    read: {
        return bar.data is Foo;
    },
    create, delete: {
        return bar.data.id == auth.uid;
    },
    match /fooBar/{foo} {
        read: true,
        write: foo is Foo
    }
)
```

## Global variables

| name | firestore rules equivalent |
| ---- | -------------------------- |
| auth | request.auth               |
