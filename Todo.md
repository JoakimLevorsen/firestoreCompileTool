# General things that are needed

## Syntax improvements

Add support for:
`return item is A || item is B`

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
