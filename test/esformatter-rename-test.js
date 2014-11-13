// Load in dependencies
var assert = require('assert');
var fs = require('fs');
var CircularJSON = require('circular-json');
var deepClone = require('clone');
var esformatter = require('esformatter');
var esformatterRename = require('../');

// Define test utilities
var testUtils = {
  format: function (filepath, options) {
    before(function formatFn () {
      // Define plugins for saving AST before and after
      var that = this;
      var beforePlugin = {
        transform: function (ast) {
          that.beforeAst = deepClone(ast);
        }
      };
      var afterPlugin = {
        transform: function (ast) {
          that.afterAst = deepClone(ast);
        }
      };

      // Register our plugins
      esformatter.register(beforePlugin);
      esformatter.register(esformatterRename);
      esformatter.register(afterPlugin);

      // Format our content
      var input = fs.readFileSync(filepath, 'utf8');
      this.output = esformatter.format(input, {
        rename: options
      });

      // Unregister our plugins
      esformatter.unregister(beforePlugin);
      esformatter.unregister(esformatterRename);
      esformatter.unregister(afterPlugin);

      // If we are in a debug environment, write the output to disk
      if (process.env.TEST_DEBUG) {
        try {
          fs.mkdirSync(__dirname + '/actual-files/');
        } catch (err) {
          // Ignore error (prob caused by directory existing)
        }
        var debugFilepath = filepath.replace('test-files/', 'actual-files/');
        fs.writeFileSync(debugFilepath, this.output);
      }
    });
    after(function cleanup () {
      // Cleanup output
      delete this.beforeAst;
      delete this.afterAst;
      delete this.output;
    });
  }
};

// Start our tests
// Basic functionality
describe('esformatter-rename', function () {
  describe.only('formatting a JS file with a declared `var` and a rename', function () {
    testUtils.format(__dirname + '/test-files/declared-yes.js', {
      rename: {
        variables: {
          a: 'renamedA'
        }
      }
    });

    it('updates the names', function () {
      var expectedOutput = fs.readFileSync(__dirname + '/expected-files/declared-yes.js', 'utf8');
      assert.strictEqual(this.output, expectedOutput);
    });

    it('updates the node\'s name', function () {
      // {Program} (afterAst) -> {fn} (body[0]) -> {var} (body.body[0])
      //   -> renamedA {declarations[0].id}
      var identifier = this.afterAst.body[0].body.body[0].declarations[0].id;
      assert.strictEqual(identifier.name, 'renamedA');
    });
  });

  describe('formatting a JS file with a declared `var` and no rename', function () {
    testUtils.format(__dirname + '/test-files/declared-yes-without-rename.js', {
      rename: {
        variables: {
          b: 'renamedB'
        }
      }
    });

    it('does not update the names', function () {
      var expectedOutput = fs.readFileSync(__dirname + '/expected-files/declared-yes-without-rename.js', 'utf8');
      assert.strictEqual(this.output, expectedOutput);
    });
  });

  describe('formatting a JS file with an undeclared variable', function () {
    testUtils.format(__dirname + '/test-files/declared-no.js');

    it('does not update the names', function () {
      var expectedOutput = fs.readFileSync(__dirname + '/expected-files/declared-no.js', 'utf8');
      assert.strictEqual(this.output, expectedOutput);
    });
  });

  describe('formatting a JS file with a variable that was used in a `with` (e.g. possibly a property)', function () {
    testUtils.format(__dirname + '/test-files/with.js');

    it('does not update the names', function () {
      var expectedOutput = fs.readFileSync(__dirname + '/expected-files/with.js', 'utf8');
      assert.strictEqual(this.output, expectedOutput);
    });
  });

  describe('formatting a JS file with a top level variable', function () {
    testUtils.format(__dirname + '/test-files/top-level-yes.js');

    it('does not update the names', function () {
      var expectedOutput = fs.readFileSync(__dirname + '/expected-files/top-level-yes.js', 'utf8');
      assert.strictEqual(this.output, expectedOutput);
    });
  });

  describe('formatting a JS file with a non-top level variable', function () {
    testUtils.format(__dirname + '/test-files/top-level-no.js');

    it('does not update the names', function () {
      var expectedOutput = fs.readFileSync(__dirname + '/expected-files/top-level-no.js', 'utf8');
      assert.strictEqual(this.output, expectedOutput);
    });
  });
});

// Intermediate cases
describe('esformatter-rename', function () {
  describe('formatting a JS file with a top level variable and allowed renames for top levels', function () {
    testUtils.format(__dirname + '/test-files/top-level-override.js', {
      renameTopLevel: true
    });

    it('does update the names', function () {
      var expectedOutput = fs.readFileSync(__dirname + '/expected-files/top-level-override.js', 'utf8');
      assert.strictEqual(this.output, expectedOutput);
    });
  });

  describe('formatting a JS file with an undeclared variable and allowed renames for undeclared variables', function () {
    testUtils.format(__dirname + '/test-files/declared-override.js', {
      renameUndeclared: true
    });

    it('does update the names', function () {
      var expectedOutput = fs.readFileSync(__dirname + '/expected-files/declared-override.js', 'utf8');
      assert.strictEqual(this.output, expectedOutput);
    });
  });

  describe('formatting a JS file with a variable used in a `with` and allowed renames for `with\'s`', function () {
    testUtils.format(__dirname + '/test-files/with-override.js', {
      ignoreWith: true
    });

    it('does update the names', function () {
      var expectedOutput = fs.readFileSync(__dirname + '/expected-files/with-override.js', 'utf8');
      assert.strictEqual(this.output, expectedOutput);
    });
  });
});

// Edge cases
describe('esformatter-rename', function () {
  describe('formatting a script with no potential changes', function () {
    testUtils.format(__dirname + '/test-files/no-changes.js');

    it('leaves the tree clean', function () {
      var beforeJson = CircularJSON.stringify(this.beforeAst);
      var afterJson = CircularJSON.stringify(this.afterAst);
      assert.strictEqual(beforeJson, afterJson);
    });
  });
});
