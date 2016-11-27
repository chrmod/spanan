var babel = require('broccoli-babel-transpiler');
var MergeTrees = require('broccoli-merge-trees');
var WatchedTree = require('broccoli-source').WatchedDir;
var SystemBuilder = require('broccoli-system-builder');
var env = require('broccoli-env').getEnv();
var Funnel = require('broccoli-funnel');

function package(tree, options) {
  options = options || {};
  options.configPath = options.configPath || 'system.config.js';
  options.inputFileName = options.inputFileName || 'index.js';
  options.outputFileName = options.outputFileName || 'index.js';
  options.format = options.format || 'global';

  return new SystemBuilder(tree, '/', options.configPath, function (builder) {
    return builder.buildStatic(options.inputFileName, options.outputFileName, {
      format: options.format,
      runtime: false,
    });
  });
}

var src = new WatchedTree('src');

var transpiledSrc = babel(src);

var transpiledLib = new Funnel(transpiledSrc, {
  exclude: ['**/*-test.js'],
});

var outputNodes = [
  package(transpiledLib, {
    format: 'global',
    inputFileName: 'index.js',
    outputFileName: 'spanan.global.js'
  }),
  package(transpiledLib, {
    format: 'esm',
    inputFileName: 'index.js',
    outputFileName: 'spanan.es2015.js'
  }),
];

if (env === 'development') {
  outputNodes.push(package(transpiledSrc, {
    format: 'global',
    inputFileName: 'tests/index-test.js',
    outputFileName: 'tests.js',
  }));
}

var outputNode = new MergeTrees(outputNodes);

module.exports = outputNode;
