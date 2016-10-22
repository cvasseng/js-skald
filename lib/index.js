/******************************************************************************

js-skald - the simple JavaScript documentation generator

Copryright 2016 (c), Chris Vasseng <chris@tinkerer.xyz>

Licensed under the MIT license. See attached LICENSE file.

******************************************************************************/

const parser = require('./parser.js');
const transform = require('./transformtree.js');

module.exports = {
  parseFile: parser.parseFile,
  transform: transform
};