# esformatter-rename [![Build status](https://travis-ci.org/twolfson/esformatter-rename.png?branch=master)](https://travis-ci.org/twolfson/esformatter-rename)

[Esformatter][`esformatter`] plugin to rename variables, parameters, and labels

This was built to make comprehending deobfuscated scripts easier (e.g. rename `a` to `jQuery`). It is based off its sister project [`esformatter-phonetic`][] which renames variables to pronouncable equivalents (also good for deobfuscating scripts).

[`esformatter`]: https://github.com/millermedeiros/esformatter
[`esformatter-phonetic`]: https://github.com/twolfson/esformatter-phonetic

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
_(Coming soon)_

## Examples
_(Coming soon)_

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
