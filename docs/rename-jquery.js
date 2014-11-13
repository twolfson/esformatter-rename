// Load and register our plugin
var esformatter = require('esformatter');
var esformatterRename = require('../');
esformatter.register(esformatterRename);

// Format our code
console.log(esformatter.format([
  'console.log($(\'#main\').text());'
].join('\n'), {
  rename: {
    variables: {
      '$': 'jQuery'
    },
    renameUndeclared: true
  }
}));
