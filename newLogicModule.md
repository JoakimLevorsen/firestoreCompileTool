So the old way of doing if statements to boolean does not work for return false like a normal programming language.

## Observations

```typescript
if (a) {
    return b;
}
return c;
```

Looks alot like `(a && b) || c`

When you run a boolean or expression, most languages exit as soon as they get a true

## New setup

Lets look at the following

```typescript
if (a == 2) {
    return true;
}
if (b == "Forbidden") {
    return false;
}
return c == 3;
```

Now with the old approach, this would compile to:
`(a == 2 && true) || (b == "Forbidden" && false) || c == 3`
The obvious error here is that return false does absolutely nothing in the boolean expression.

The solution to this is if a block returns false, we invert the condition, so it stops the execution and makes sure the condition is valid.
`(a == 2) || !(b == "Forbidden") || c == 3`
How ever notice that this is still not what we want, since if b is forbidden, we still continue to the last check, and if not we return there ignoring the last condition. This can be fixed by using &&
`(a == 2) || (!(b == "Forbidden") && (c == 3))`
Further if statements would be put inside the `(c == 3)` block with || just like normal. In this way we can be assured we don't return true too early, or ignore the return false.

### Note one special case though

```typescript
if (a == 2) {
    return true;
}
if (b == "Forbidden") {
    return c == 18;
}
return c == 3;
```

Now this is different since the return is not just true or false, so that means we don't know what approach from above to apply. In this case we use a teneary
`(a == 2) || ((b == "Forbidden") ? (c == 18) : (c == 3)`
Where any further statements would be added as a || on `(c == 3)`
