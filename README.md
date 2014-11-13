# esformatter-rename [![Build status](https://travis-ci.org/twolfson/esformatter-rename.png?branch=master)](https://travis-ci.org/twolfson/esformatter-rename)

[Esformatter][`esformatter`] plugin to rename variables, parameters, and labels

This was built to make comprehending deobfuscated scripts easier (e.g. rename `a` to `jQuery`). It is based off its sister project [`esformatter-phonetic`][] which renames variables to pronouncable equivalents (also good for deobfuscating scripts).

[`esformatter`]: https://github.com/millermedeiros/esformatter
[`esformatter-phonetic`]: https://github.com/twolfson/esformatter-phonetic

**Features:**

- Supports ES6 arrow functions (e.g. `(a) => a + 1`)
- Supports `let` (e.g. `let a = 1;`)
- Supports destructured variables (e.g. `var {a, b} = obj;`)

## Getting Started
Install the module with: `npm install esformatter-rename`

Then, register it as a plugin and format your JS:

```js
// Load and register our plugin
var esformatter = require('esformatter');
var esformatterRename = require('esformatter-rename');
esformatter.register(esformatterRename);

// Format our code
esformatter.format([
  'function myFn() {',
    'var a = \'hello\';',
    'console.log(a);',
  '}'
].join('\n'), {
  rename: {
    variables: {
      a: 'hello'
    }
  }
});
/*
function myFn() {
  var hello = 'hello';
  console.log(hello);
}
*/
```

Alternatively, load it via `format` or `.esformatter`:

```js
{
  plugins: [
    'esformatter-rename'
  ]
}
```


## Documentation
`esformatter-rename` exposes `exports.transform` for consumption by `esformatter`.

### Options
We provide the following options to configure `esformatter-rename` during transformation. These should be stored under `rename` in your `esformatter` options.

- variables `Object` - Key value pairing of original variable name to new name
    - For example `variables: {hello: 'world'}` will rename all `hello` variables to `world` variables
        - `function hello() { console.log('hai'); } -> function world() { console.log('hai'); }`
    - If you are potentially doing something dangerous (e.g. renaming an undeclared variable), we will warn you/skip it since it can have global reprecussions)
        - These warnings can be ignored and actions can be taken via the related option
- labels `Object` - Key value pairing of origin label name to new name
    - For example `labels: {loop1: 'myLoop'}` will rename all `loop1` labels to `myLoop`
        - `loop1: while (true) { break loop1; } -> myLoop: while (true) { break myLoop; }`
- renameTopLevel `Boolean` - Allow for renaming of top level variables (i.e. anything declared with a `var` in the global scope)
    - If `true`, renaming is allowed. If `false`, it is not and a warning is logged.
    - By default, this is `false`.
- renameUndeclared `Boolean` - Allow for renaming of undeclared variables (e.g. variable referenced without a `var`)
    - If `true`, renaming is allowed. If `false`, it is not and a warning is logged.
    - By default, this is `false`.
- ignoreWith `Boolean` - Allow for renaming of variables that were referenced at least once in a `with`
    - For example `var obj = {}; var hello; with (obj) { hello(); }` will not allow renaming of `hello`
    - If `true`, renaming is allowed. If `false`, it is not and a warning is logged.
    - By default, this is `false`.

## Examples
### Renaming `jQuery`
In this example, we will rest `jQuery` from its normal convention of `$` to the full name `jQuery`.

**Script before renaming:**

```js
console.log($('#main').text());
```

**Formatter options:**

```js
{
  rename: {
    variables: {
      '$': 'jQuery'
    },
    renameUndeclared: true
  }
}
```

**Script after renaming:**

```js
console.log(jQuery('#main').text());
```


## Contributing
In lieu of a formal styleguide, take care to maintain the existing coding style. Add unit tests for any new or changed functionality. Lint via [grunt](https://github.com/gruntjs/grunt) and test via `npm test`.

## Donating
Support this project and [others by twolfson][gratipay] via [gratipay][].

[![Support via Gratipay][gratipay-badge]][gratipay]

[gratipay-badge]: https://cdn.rawgit.com/gratipay/gratipay-badge/2.x.x/dist/gratipay.png
[gratipay]: https://www.gratipay.com/twolfson/

## Unlicense
As of Nov 13 2014, Todd Wolfson has released this repository and its contents to the public domain.

It has been released under the [UNLICENSE][].

[UNLICENSE]: UNLICENSE
