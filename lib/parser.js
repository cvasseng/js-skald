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

*/

const fs = require('fs');

var config = {
      blockStart: '/**'.split(''),
      blockEnd: '*/'.split('')
    };


function State() {
  return {

  };
}

function Block(filename, lineNumber, namespace) {
  var tokens = [],
      codeLine = '',
      blockOptions = {
        info: {
          name: '',
          blurb: '',
          description: '',
          type: '',
          filename: filename.replace(process.cwd(), ''),
          lineNumber: lineNumber,
          namespace: namespace
        }
      }
  ;

  //Convert the block to string
  function toString() {
    return tokens.join('');
  }

  //Push a token to the block
  function push(thing) {
    tokens.push(thing);
  }

  function parseDataType(tokens) {
    if (tokens.length > 1 && tokens[1][0] === '{') {
      return tokens[1].replace('{', '').replace('}', '');
    }
    return '';
  } 

  function parseSymbolLine(line) {
    var tokens = line.substr(1).split(' ');

    if (tokens[0] === 'memberof') {
      blockOptions.info.type = 'member.' + blockOptions.info.type;
      blockOptions.info.namespace = tokens[1];
    } else if (tokens[0] === 'constructor') {
      blockOptions.info.type = 'object constructor';
    } else if (tokens[0] === 'namespace') {
      blockOptions.info.namespace = tokens[1];
    } else if (tokens[0] === 'return' || tokens[0] === 'returns') {
      blockOptions.return = {
        type: parseDataType(tokens),
        description: line.substr(line.indexOf('-') + 1).trim()
      };
    } else if (blockOptions.info.type === 'function' && blockOptions.arguments) {
      if (blockOptions.arguments[tokens[0]]) {

        //Right, we're looking at an argument. Need to parse the type.
        //We're just gonna assume its at 1 for now.
        if (tokens.length > 1 && tokens[1][0] === '{') {
          blockOptions.arguments[tokens[0]].type = parseDataType(tokens);
        }

        blockOptions.arguments[tokens[0]].description = line.substr(line.indexOf('-') + 1).trim();
      }
    } else {
      console.log('Unrecognized keyword'.red, tokens[0].bold);
    }
  }

  /** Parse the block
   *  @exposed
   *  
   * By default, the first line is the short hand name.
   * All lines following until the first @ is the description.
   */
  function parse() {
    var hasDescription = false,
        adjusted = tokens.join('').split('\n').map(function (line) {
          //Looks kind of awkward, but we need to be sure 
          //we get all leading tabs, spaces, and *
          return line.trim()
                     .replace(/^\t+|\t+$/g,'').trim()
                     .replace(/^\*+|\*+$/g,'').trim()
          ;
        })
    ;

    blockOptions.info.blurb = adjusted[0];

    adjusted.forEach(function(line, i) {
      if (i === 0) return;

      if (line[0] === '@') {
        hasDescription = true;
        parseSymbolLine(line);
      } else if (!hasDescription) {
        blockOptions.info.description +=  (blockOptions.info.description.length > 0 ? '\n' : '') + line;
      }
    });


    blockOptions.info.namespace = blockOptions.info.namespace.split('.');
  }

  function parseCodeLine(code, lineNumber) {
    var args = '',
        buffer = '',
        balance = 1,
        index = 0,
        reading = false,
        special = {
          ' ': true,
          '?': true,
          '-': true,
          '!': true,
          '+': true,
          '(': true,
          ')': true
        }
    ;

    blockOptions.info.lineNumber = lineNumber;
    blockOptions.info.definition = code;

    //We need to figure out exactly what we're parsing
    if (code.indexOf('function') >= 0) {
      //It's likely a function.
      blockOptions.info.type = 'function';
      

      index = code.indexOf('function');

      //Need to parse the argument of the damn thing too..
      args = code.substr(index + 8).split('');

      args.some(function (token, i) {
        function pushArg() {
          if (buffer.length === 0) return;

          blockOptions.arguments = blockOptions.arguments || {};

          blockOptions.arguments[buffer] = {
            name: '',
            description: 'Argument #' + (Object.keys(blockOptions.arguments).length + 1),
            type: 'unknown'
          };
          buffer = '';
        }

        if (!reading) {
          if (!special[token]) {
            blockOptions.info.name += token;
          }
          if (token === '(') {
            reading = true;
          }
          return;
        }

        if (token === '(') {
          balance++;  
        } else if (token === ')') {
          balance--;
        }

        if (balance === 0) {
          //We're done with the arguments.
          pushArg();
          return true;
        } else {
          if (token === ',') {
            pushArg();
          } else if (!special[token]) {
            buffer += token;
          }
        }
      });

      //Need to figure out what the scope is.
      buffer = code.substr(0, index);
      if (buffer.length > 0) {
        //It's not a regular function definition.
        //If the name is blank, it's either an anon function, an assigned one, or a return.
        //In that case, the name is the last part of the expression,
        //meaning we can parse from the last period until the start of the function,
        //and then remove = and :

        if (buffer.trim().indexOf('return') == 0) {
          //This is totally an anonymous function. 
          blockOptions.info.name = '<anonymous>'; 
          blockOptions.info.namespace = 'global';        
        } else {

          if (blockOptions.info.name.length === 0) {

            if (buffer.trim() === '(') {
              blockOptions.info.name = '<anonymous>';         
            } else if (buffer.trim().indexOf('var') === 0) {
              blockOptions.info.name = buffer.substr(buffer.indexOf('var') + 3)
                                             .replace(/\:/g, '')
                                             .replace(/\=/g, '')
                                             .trim()
              ;
              //Similarly, the namespace is the start to the last .
              blockOptions.info.namespace = buffer.substr(0, buffer.lastIndexOf('.')).trim();
            } else {
              blockOptions.info.name = buffer.substr(buffer.lastIndexOf('.') + 1)
                                             .replace(/\:/g, '')
                                             .replace(/\=/g, '')
                                             .trim()
              ;
              //Similarly, the namespace is the start to the last .
              blockOptions.info.namespace = buffer.substr(0, buffer.lastIndexOf('.')).trim();
            }
          }

        }
      }
    } else {
      //This is an object.
      blockOptions.info.type = 'data';
    }
  }

  //Public interface
  return {
    pushToken: push,
    toString: toString,
    parse: parse,
    data: blockOptions,
    parseCodeLine: parseCodeLine
  };
}

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
        line = '',
        hasRead = false
    ;

    for (var i = pos; i < source.length; i++) {
      if (source[i] === '\n') {
        lcounter++;
        if (parsingLine) {
          block.parseCodeLine(line, lcounter - 1);
          return i;
        }
      } else if (source[i] === ' ' && !hasRead) {

      } else {
        hasRead = true;
        line += source[i];
        parsingLine = true;
      }
    }
  }

  function extractBlock(config, pos, source, block) {
    if (pos >= source.length) return pos;

    //Read until we hit the end delimiter
    for (var j = 0; j < config.blockEnd.length; j++) {
      if (source[pos + j] === '\n') {
        lcounter++;
      } else if (source[pos + j] !== config.blockEnd[j]) {        
        block.pushToken(source[pos]);
        return extractBlock(config, ++pos, source, block);
      }
    }
    return pos + config.blockEnd.length;
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

      //console.log('extracted block', block.toString());

      block.parse();
    }
  };

  //console.log(blocks);

  console.log('Parsed', lcounter.toString().bold, 'lines');

  return blocks;
}

function parseFile(filename, fn, activeState) {
  if (!activeState) activeState = State();

  fs.readFile(filename, function (err, data) {
    if (err) return console.log('Error loading file'.red, filename, err);
    var blocks = parseSource(data.toString(), filename);

    if (fn) {
      fn(blocks);
    }
  });
}

module.exports = {
  parseFile: function (filename, fn) {
    parseFile(filename, fn, undefined);
  }
};