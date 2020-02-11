# General things that are needed

## Syntax improvements

Interface names should be literals so all values would be accepted.

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
