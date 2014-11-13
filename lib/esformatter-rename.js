// Load in dependencies
var ecmaVariableScope = require('ecma-variable-scope');
var estraverse = require('estraverse');
var rocambole = require('rocambole');

// Define shared variables for transformation
// DEV: These are set/reset by `setOptions` which is run every `esformatter.format` call
var renameOptions;

// Handle options for rename
exports.setOptions = function (options) {
  // Pluck rename options
  renameOptions = options.rename || {};
};

// DEV: We leverage `transform` because `ecmaVariableScope` need the entire AST
exports.transform = function (ast) {
  // Mark up the AST with scope information
  ast = ecmaVariableScope(ast);

  // Skip over the custom node properties
  rocambole.BYPASS_RECURSION._insideWith = true;
  rocambole.BYPASS_RECURSION._nearestScope = true;
  rocambole.BYPASS_RECURSION._scopeType = true;
  rocambole.BYPASS_RECURSION._usedInAWith = true;
  rocambole.BYPASS_RECURSION.scopeInfo = true;
  rocambole.BYPASS_RECURSION.scope = true;

  // Walk over the identifiers
  rocambole.moonwalk(ast, function updateIdentifiers (node) {
    // If the node is an identifier and a variable
    if (node.type === 'Identifier' && node.scopeInfo) {
      // Grab the node and its name

      // If there is no rename, ignore it

      // DEV: Logic taken from `uglifyjs2` (linked from `beautify-with-words`)
      // https://github.com/mishoo/UglifyJS2/blob/v2.4.11/lib/scope.js#L59-L63
      // If the identifier is top level and we aren't touching top level items, do nothing
      var isTopLevel = node.scopeInfo.topLevel === ecmaVariableScope.SCOPE_INFO_TOP_LEVEL.YES;
      if (isTopLevel && exports.haveName(node.name)) {
        // If we are not cool with renaming top levels, warn and ignore this node
        if (renameOptions.renameTopLevel !== true) {
          console.warn('Saw matching top level variable "' + name + '" but did not rename due ' +
              'to potential issues. To force a rename on top level variables, set the ' +
              'option `rename.renameTopLevel` to `true`');
          return;
        }
      }

      // If the identifier has not been declared, do nothing
      var isUndeclared = node.scopeInfo.type === ecmaVariableScope.SCOPE_INFO_TYPES.UNDECLARED;
      if () {
        return;
      }

      // If the identifier has ever been used in a with, do nothing
      if (node.scopeInfo.usedInAWith !== ecmaVariableScope.SCOPE_INFO_USED_IN_A_WITH.NO) {
        return;
      }

      // Rename our identifier (update in both node and token tree)
      var name = node.name;
      node.name = node.startToken.value = exports.getPhoneticName(name);
    }
  });

  // Clean up custom iteration skips
  delete rocambole.BYPASS_RECURSION._insideWith;
  delete rocambole.BYPASS_RECURSION._nearestScope;
  delete rocambole.BYPASS_RECURSION._scopeType;
  delete rocambole.BYPASS_RECURSION._usedInAWith;
  delete rocambole.BYPASS_RECURSION.scopeInfo;
  delete rocambole.BYPASS_RECURSION.scope;

  // Walk over all nodes and clean up our properties
  // DEV: Without this, we would have infinite recursion on other traversals
  // DEV: We use `estraverse` over `rocambole` to prevent possible misses due to missing references
  estraverse.traverse(ast, {
    enter: function cleanupProperties (node) {
      delete node._insideWith;
      delete node._nearestScope;
      delete node._scopeType;
      delete node._usedInAWith;
      delete node.scopeInfo;
      delete node.scope;
    }
  });

  // Return the modified AST
  return ast;
};
