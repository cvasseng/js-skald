/******************************************************************************

js-skald - the simple JavaScript documentation generator

Copryright 2016 (c), Chris Vasseng <chris@tinkerer.xyz>

Licensed under the MIT license. See attached LICENSE file.

******************************************************************************/

/*

  Documentation format:

  /** - start of documented block
  @<name> - docuemtation of argument


  /**
   * This is a documented function. This is the name.
   * The next lines, until a @ is reached is all description.
   * @arg1 {number} - this is the description of the argument
   * @return|returns {type} - description of return
   *

   /**
    * @attributes {object} - this is the settings for the object
    *   > name {string} - this is the name
    *   > nested {object} - this is a nested options object
    *     > child1 {string} - this is the first entry
    *     > child2 {string} - this is the second entry
    *

*/

const fs = require('fs');
const Block = require('./block');

var config = {
      blockStart: '/**'.split(''),
      blockEnd: '*/'.split('')
};

function parseSource(source, filename) {
  var next, 
      prev,
      c,
      block = [],
      blocks = [],
      docTree = [],
      lcounter = 1
  ;

  source = source.split('');

  function inBlock(pos) {
    //Could reverse the delimiter arrays too
    for (var i = config.blockStart.length - 1; i > 0; i--) {
      if (source[pos - i] !== config.blockStart[i]) {
        return false;
      }
    }
    return true;
  }

  function extractAndParseNextLine(pos, block) {
    var parsingLine = false,
        line = ''
    ;

    for (var i = pos; i < source.length; i++) {
      if (source[i] === '\n') {
        lcounter++;

        if (line.replace(/\s/g, '')
                .replace(/\t/g, '')
                .replace(/\*/g, '')
                .replace(/\//g, '').length) {
          block.parseCodeLine(line, lcounter - 1);
          return i;
        }

        line = '';
      
      } else {
        line += source[i];
      }
    }
  }

  function extractBlock(config, pos, source, block) {
    if (pos >= source.length) return pos;

    //Read until we hit the end delimiter
    for (var j = 0; j < config.blockEnd.length; j++) {      
      if (source[pos + j] !== config.blockEnd[j]) {        
        if (source[pos + j] === '\n') {
          lcounter++;
        }
        block.pushToken(source[pos]);
        return extractBlock(config, ++pos, source, block);
      }
    }
    return pos + config.blockEnd.length + 1;
  }

  for (var i = 0; i < source.length; i++) {
    c = source[i];

    if (c === '\n') {
      lcounter++;
    } else if (inBlock(i)) {
      //Extract the block
      block = Block(filename, lcounter, 'global');
      blocks.push(block);
      i = extractAndParseNextLine(extractBlock(config, i, source, block), block);

      block.parse();
    }
  };

  console.log('Parsed', lcounter.toString().bold, 'lines');

  return blocks;
}

/** Parse a file 
 *  Parses the supplied file and builds a set of blocks from it.
 *  @param filename {string} - the filename to parse
 *  @param fn {function} - the function to call once done
 *    - blocks {array} - an array containing resulting blocks
 */
function parseFile(filename, fn) {  
  fs.readFile(filename, function (err, data) {
    if (err) return console.log('Error loading file'.red, filename, err);
    var blocks = parseSource(data.toString(), filename);

    if (fn) {
      fn(blocks);
    }
  });
}

module.exports = {
  parseFile: parseFile
};