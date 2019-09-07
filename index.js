const { dirname, relative } = require("path");
const resolve = require("eslint-module-utils/resolve").default;
const importType = require("./importType.js");

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

        if (myPath === "<text>") return {}; // can't check a non-file
        if (myPath === "<input>") return {}; // can't check a draft

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
        const hasAllowedPaths =
          context.options &&
          context.options[0] &&
          Array.isArray(context.options[0]) &&
          context.options[0].length > 0;

        let isAnAllowedPath = false;
        if (hasAllowedPaths) {
          const paths = context.options[0];
          isAnAllowedPath = paths.some(p => depPath.startsWith(p));
        }

        if (importType(relDepPath, context) === "parent" && !isAnAllowedPath) {
          context.report({
            node,
            message:
              "Relative requires from parent directories are not allowed for serverless functions. " +
              "Please use ~root/ alias instead."
          });
        }
      }
    }
  })
};
