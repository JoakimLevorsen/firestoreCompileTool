# General things that are needed

## Syntax improvements

Interface names should be literals so all values would be accepted.

Allow constants to be assigned a type `const a: string = "foo"`

## Recursion

Is recursion possible using?:

```
function f() {
    if (something is true) {
        return false
    }
    return f();
}
```

That would allow loops.
