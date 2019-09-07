const join = require('path').join;
const resolve =  require('eslint-module-utils/resolve').default;

function isAbsolute(name) {
  return name.indexOf('/') === 0
}

function isExternalPath(path, name, settings) {
  const folders = (settings && settings['import/external-module-folders']) || ['node_modules']

  // extract the part before the first / (redux-saga/effects => redux-saga)
  const packageName = name.match(/([^/]+)/)[0]

  return !path || folders.some(folder => -1 < path.indexOf(join(folder, packageName)))
}

const externalModuleRegExp = /^\w/
function isExternalModule(name, settings, path) {
  return externalModuleRegExp.test(name) && isExternalPath(path, name, settings)
}

const externalModuleMainRegExp = /^[\w]((?!\/).)*$/
function isExternalModuleMain(name, settings, path) {
  return externalModuleMainRegExp.test(name) && isExternalPath(path, name, settings)
}

const scopedRegExp = /^@[^/]+\/[^/]+/
function isScoped(name) {
  return scopedRegExp.test(name)
}

const scopedMainRegExp = /^@[^/]+\/?[^/]+$/
function isScopedMain(name) {
  return scopedMainRegExp.test(name)
}

function isInternalModule(name, settings, path) {
  const matchesScopedOrExternalRegExp = scopedRegExp.test(name) || externalModuleRegExp.test(name)
  return (matchesScopedOrExternalRegExp && !isExternalPath(path, name, settings))
}

function isRelativeToParent(name) {
  return /^\.\.[\\/]/.test(name)
}

const indexFiles = ['.', './', './index', './index.js']
function isIndex(name) {
  return indexFiles.indexOf(name) !== -1
}

function isRelativeToSibling(name) {
  return /^\.[\\/]/.test(name)
}

function typeTest(name, settings, path) {
  if (isAbsolute(name, settings, path)) { return 'absolute' }
  if (isInternalModule(name, settings, path)) { return 'internal' }
  if (isExternalModule(name, settings, path)) { return 'external' }
  if (isScoped(name, settings, path)) { return 'external' }
  if (isRelativeToParent(name, settings, path)) { return 'parent' }
  if (isIndex(name, settings, path)) { return 'index' }
  if (isRelativeToSibling(name, settings, path)) { return 'sibling' }
  return 'unknown'
}

module.exports = function(name, context) {
  return typeTest(name, context.settings, resolve(name, context))
}