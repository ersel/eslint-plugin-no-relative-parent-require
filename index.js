const { dirname, relative } = require('path');
const importType = require('./importType.js');

const checkIfStaticRequire = node => {
  return (
    node &&
    node.callee &&
    node.callee.type === "Identifier" &&
    node.callee.name === "require" &&
    node.arguments.length === 1 &&
    node.arguments[0].type === "Literal" &&
    typeof node.arguments[0].value === "string"
  );
};

module.exports.rules = {
  "no-relative-parent-require": context => ({
    CallExpression(node) {
      if (checkIfStaticRequire(node)) {
        const myPath = context.getFilename();
        const depPath = node.arguments[0].value;

        if (importType(depPath, context) === "external") {
          // ignore packages
          return;
        }

        const absDepPath = resolve(depPath, context);

        if (!absDepPath) {
          // unable to resolve path
          return;
        }

        const relDepPath = relative(dirname(myPath), absDepPath);

        if (importType(relDepPath, context) === "parent") {
          context.report({
            node,
            message:
              "Relative requires from parent directories are not allowed for serverless functions. " +
              "Please use ~root/ alias instead." 
          });
        }
        /*
        context.report({
          node,
          message: "Import from precompiled bright-components/dist instead",
          fix(fixer) {
            return fixer.replaceText(
              node,
              rawImportLine.replace(
                "bright-components/src",
                "bright-components/dist"
              )
            );
          }
        });
        */
      }
    }
  })
};
