// Load in dependencies
var ecmaVariableScope = require('ecma-variable-scope');
var estraverse = require('estraverse');
var rocambole = require('rocambole');

// Define shared variables for transformation
// DEV: These are set/reset by `setOptions` which is run every `esformatter.format` call
var labelMap;
var logger;
var variableMap;
var renameOptions;

// Handle options for rename
exports.setOptions = function (options) {
  // Pluck rename options
  renameOptions = options.rename || {};
  labelMap = renameOptions.labels || {};
  logger = renameOptions.logger || console;
  variableMap = renameOptions.variables || {};
};

// Define helper for picking out labels
var labelContainerTypes = ['LabeledStatement', 'BreakStatement', 'ContinueStatement'];
function isLabelIdentifier(node) {
  return node.parent && labelContainerTypes.indexOf(node.parent.type) !== -1;
}

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
    // If the node is an identifier
    if (node.type === 'Identifier') {
      // If it's a variable
      if (node.scopeInfo) {
        // Grab the node and its name
        var name = node.name;
        var newName = variableMap[name];

        // If there is no rename, ignore the node
        if (newName === undefined || newName === name) {
          return;
        }

        // DEV: Logic taken from `uglifyjs2` (linked from `beautify-with-words`)
        // https://github.com/mishoo/UglifyJS2/blob/v2.4.11/lib/scope.js#L59-L63
        // If the identifier has not been declared
        if (node.scopeInfo.type === ecmaVariableScope.SCOPE_INFO_TYPES.UNDECLARED) {
          // If we are not cool with renaming undeclared variables, warn and ignore this node
          if (renameOptions.renameUndeclared !== true) {
            logger.warn('Saw matching undeclared variable "' + name + '" but did not rename due ' +
                'to potential issues. To force a rename on undeclared variables, set the ' +
                'option `rename.renameUndeclared` to `true`');
            return;
          }
        // Otherwise, if the identifier is top level and we aren't touching top level items
        // DEV: All undeclareds are top level so they should be skipping this step
        } else if (node.scopeInfo.topLevel === ecmaVariableScope.SCOPE_INFO_TOP_LEVEL.YES) {
          // If we are not cool with renaming top levels, warn and ignore this node
          if (renameOptions.renameTopLevel !== true) {
            logger.warn('Saw matching top level variable "' + name + '" but did not rename due ' +
                'to potential issues. To force a rename on top level variables, set the ' +
                'option `rename.renameTopLevel` to `true`');
            return;
          }
        }

        // If the identifier has ever been used in a with, do nothing
        var usedInAWith = node.scopeInfo.usedInAWith !== ecmaVariableScope.SCOPE_INFO_USED_IN_A_WITH.NO;
        if (usedInAWith) {
          // If we are not cool with ignoring `with` related variables, warn and ignore this node
          if (renameOptions.ignoreWith !== true) {
            logger.warn('Saw matching variable "' + name + '" that was used in a `with` but did not rename due ' +
                'to potential issues. To force a rename on variables used in a `with`, set the ' +
                'option `rename.ignoreWith` to `true`');
            return;
          }
        }

        // Rename our identifier (update in both node and token tree)
        node.name = node.startToken.value = newName;
      // Otherwise, if it is in a label, break, or continue
      // https://developer.mozilla.org/en-US/docs/Mozilla/Projects/SpiderMonkey/Parser_API#Statements
      // https://github.com/twolfson/ecma-variable-scope/blob/2.1.0/lib/ecma-variable-scope.js#L101-L103
      } else if (isLabelIdentifier(node)) {
        // Grab the new name and update to it
        node.name = node.startToken.value = labelMap[node.name];
      }
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
