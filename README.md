# generate-radix-tree

Generates a function that uses a [radix tree](https://en.wikipedia.org/wiki/Radix_tree) to match which pattern fits the input

```
npm install generate-radix-tree
```

## Usage

```js
const gentree = require('generate-radix-tree')

const match = gentree([
  {match: 'hello'},
  {match: 'world'},
  {match: 'hello world'}
])

console.log(match('hello')) // returns {match: 'hello'} as it matches
console.log(match('hello world')) // returns {match: 'hello world'}
console.log(match('hey')) // returns null
```

The returned match function is code generated based in the input
to make as few comparisons as possible to find the pattern that matches.

You can view the generated source code by calling `toString()` on the function

```js
console.log(match.toString())
```

## Dynamic matches

If you want to match against a dynamic pattern use a function.
This function *must* set `fn.pointer` to the end index in the string it matches.

For example

```js
const match = gentree([
  {match: ['hello', any, 'world']},
  {match: 'hello world'}
])

console.log(match('hello world')) // return {match: 'hello world'}
console.log(match('hello_world')) // return {match: ['hello', any, 'world]}

// match any char in str at ptr
function any (str, ptr) {
  if (str.length > ptr) {
    // more chars, we match
    // set any.pointer to where we matched to
    any.pointer = ptr + 1
    return true
  }
  return false
}
```

The static patterns always have preference to the dynamic ones

## License

MIT
