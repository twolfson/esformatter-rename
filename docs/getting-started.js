// Load and register our plugin
var esformatter = require('esformatter');
var esformatterRename = require('../');
esformatter.register(esformatterRename);

// Format our code
console.log(esformatter.format([
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
}));
