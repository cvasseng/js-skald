/******************************************************************************

js-skald - the simple JavaScript documentation generator

Copryright 2016 (c), Chris Vasseng <chris@tinkerer.xyz>

Licensed under the MIT license. See attached LICENSE file.

******************************************************************************/

const UglifyJS = require('uglify-js');

module.exports = function (filename, lineNumber, namespace, config) {
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
      },
      lastDefinedObject = [],
      popIfNextIndentationIsEqual = false,
      enabled = true
  ;

  //Convert the block to string
  function toString() {
    return tokens.join('');
  }

  function disable() {
    enabled = false;
  }

  function isEnabled() {
    return enabled;
  }

  //Push a token to the block
  function push(thing) {
    if (thing) {
      tokens.push(thing);
      
    }
  }

  //Extract the data type from a token array
  function parseDataType(target, tokens) {
    var dataType = false

    tokens.some(function(token) {
      token = token.trim();
      if (token[0] === '{' && token[token.length - 1] === '}') {
        dataType = token.replace('{', '').replace('}', '');
        return true;
      }
    });

    if (target) {
      target.type = dataType;
      //if (dataType === 'object') {
        lastDefinedObject.push(target);  
        popIfNextIndentationIsEqual = true;      
     // } else {
      //  popIfNextIndentationIsEqual = false;
     // }
    }

    return dataType;
  } 

  //Extract symbol description from a token array
  function parseSymbolDescription(target, tokens) {
    var description = [],
        reading = false
    ;

    tokens.forEach(function (token, i) {
      if (reading) {
        description.push(token);
      } else {        
        token = token.trim();
        if (token === '-') {
          reading = true;      
        }
      }
    });

    description = description.join(' ');
    if (target) {
      target.description = description;      
    }
    return description;
  }

  function parseName(tokens) {
    var name;

    tokens.some(function (token) {
      if (token && token.length > 0) {
        name = token;
        return true;
      }
    });

    return name;
  }

  function parseArgName(tokens) {
    var dt = parseDataType(false, tokens);
    tokens = tokens.filter(function (token) {
      token = token.trim();
      return token != '{' + dt + '}';
    });
    return tokens[1] || false;
  }

  function parseAllFrom(tokens, from) {
    return tokens.filter(function (b, i) {
      return i > from;
    }).join(' ');
  }

  //Parse a line starting with @
  function parseSymbolLine(line) {
    var tokens = line.substr(1).split(' '),
        name = tokens[0],
        nn 
    ;

    lastDefinedObject = [];
    if (name === 'ignore') {
      disable();
    } else if (name === 'name') {
      blockOptions.info.name = tokens[1];
    } else if (name === 'emits') {
      blockOptions.emits = blockOptions.emits || {};

      blockOptions.emits[tokens[1]] = {};

      parseSymbolDescription(blockOptions.emits[tokens[1]], tokens);
      parseDataType(blockOptions.emits[tokens[1]], tokens);

      //Add the on method. Add a config option for this later.
      blockOptions.methods = blockOptions.methods || [];

      if (blockOptions.methods.filter(function (b) {return b.info.name === 'on'}).length === 0) {
        blockOptions.methods.push({
          "info": {
            "name": "on",
            "blurb": "Listen for event",
            "description": "",
            "type": "function",
            "namespace": blockOptions.info.namespace,
            "lineNumber": "unknown",
            "definition": "unknown"
          },
          "arguments": {
            "event": {
              "description": "The event to listen for",
              "type": "string"
            },
            "callback": {
              "description": "Function to call when the event is emitted",
              "type": "function"
            }
          },
          "return": {
            "description": "Can be called to unbind the listener",
            "type": "function"
          }
        });        
      }

    } else if (name === 'author') {
      blockOptions.info.author = parseAllFrom(tokens, 0);
    } else if (name === 'todo') {
      blockOptions.todo = blockOptions.todo || [];
      blockOptions.todo.push(parseAllFrom(tokens, 0));
    } else if (name === 'type') {
      parseDataType(blockOptions.info, tokens);
    } else if (name === 'deprecated') {
      blockOptions.info.deprecated = true;
    } else if (name === 'memberof') {
      blockOptions.info.type = blockOptions.info.type;
      blockOptions.info.namespace = tokens[1];
      blockOptions.info.isMember = true;
    } else if (name === 'constructor') {
      blockOptions.info.type = 'constructor';
    } else if (name === 'module') {
      blockOptions.info.type = 'module';
    } else if (name === 'namespace') {
      blockOptions.info.namespace = tokens[1];
    } else if (name === 'return' || name === 'returns') {
      blockOptions.return = {};
      parseSymbolDescription(blockOptions.return, tokens)
      parseDataType(blockOptions.return, tokens);
    } else if (name === "param" && blockOptions.arguments) {
      nn = parseArgName(tokens);
      if (nn) {
        if (!blockOptions.arguments[nn]) {
          console.log(
            '[warning]'.yellow,
            'argument',
             nn.bold,
             'does not match any function arguments',
             (blockOptions.info.filename + ':' + blockOptions.info.lineNumber).gray          
          );
        }

        //Right, we're looking at an argument. Need to parse the type.
        parseDataType(blockOptions.arguments[nn], tokens);                
        parseSymbolDescription(blockOptions.arguments[nn], tokens);
      }
    } else {
      console.log('[error]'.red, 'unrecognized keyword', name.bold, '\n', blockOptions);
    }
  }

  //Parse a line starting with >
  function parseObjectAttribute(line) {
    var tokens = line.substr(1).split(' '),
        name = parseName(tokens),
        top = lastDefinedObject[lastDefinedObject.length - 1]
    ;

    //We may need to pop lastDefinedObject

    top.attributes = top.attributes || {};
    top.attributes[name] = {};

    parseSymbolDescription(top.attributes[name], tokens);
    parseDataType(top.attributes[name], tokens);
  }

  //Count number of leading tabs
  function countTabs(str) {
    var res = 0, 
        reading = false
    ;

    for (var i = 0; i < str.length; i++) {
      if (reading) {
        if (str[i] === ' ') {
          ++res;
        } else if (str[i] !== '*') {
          return res;
        }        
      } else if (str[i] === '*') {
        reading = true;
      }
    }

    return res;
  }

  /** Parse the block
   *  @exposed
   *  
   * By default, the first line is the short hand name.
   * All lines following until the first @ is the description.
   */
  function parse() {
    var hasDescription = false,
        inExample = false,
        lastIndendation = 0,
        adjusted = tokens.join('').split('\n').map(function (line) {
          //Looks kind of awkward, but we need to be sure 
          //we get all leading tabs, spaces, and *
          return {
            indentation: countTabs(line),
            text: line.trim()
                     .replace(/^\t+|\t+$/g,'').trim()
                     .replace(/^\*+|\*+$/g,'').trim()
          }
          ;
        })
    ;

    blockOptions.info.blurb = adjusted[0].text;

    adjusted.forEach(function(line, i) {
      if (i === 0 || line.text.length === 0) return;

      if (line.text[0] === '@') {
        hasDescription = true;

        if (line.text.substr(1).indexOf('example') === 0) {
          blockOptions.examples = blockOptions.examples || [];

          inExample = {
            name: line.text.substr(8).trim(),
            code: []
          };

          blockOptions.examples.push(inExample);
        } else {
          inExample = false;
          parseSymbolLine(line.text);
          popIfNextIndentationIsEqual = lastIndendation = 0;          
        }

      } else if (inExample) {
        inExample.code.push(line.text);
      } else if (line.text[0] === '>' && lastDefinedObject.length) {
        //This is an attribute of the last defined object.

        if (popIfNextIndentationIsEqual && line.indentation === lastIndendation) {
          lastDefinedObject.pop();
          popIfNextIndentationIsEqual = false;
        }
        
        if (line.indentation < lastIndendation) {
          lastDefinedObject.pop();
        }

        parseObjectAttribute(line.text);
        lastIndendation = line.indentation;

      } else if (!hasDescription) {
        popIfNextIndentationIsEqual = lastIndendation = 0;
        blockOptions.info.description +=  (blockOptions.info.description.length > 0 ? '\n' : '') + line.text;
      }
    });

    // if (blockOptions.info.namespace.length && blockOptions.info.namespace[0] !== '') {
      blockOptions.info.namespace = blockOptions.info.namespace.split('.');      
    // } else {
    //   blockOptions.info.namespace = [];
    // }

    blockOptions.info.namespace = blockOptions.info.namespace.filter(function (a) {
      return a && a.length > 0 && a != '';
    });

    //Should check if there are undocumented arguments
    if (blockOptions.arguments) {
      Object.keys(blockOptions.arguments).forEach(function (arg) {
        if (!blockOptions.arguments[arg].description.length) {
          console.log(
              '[warning]'.yellow,
              'undocumented argument:',
              arg.bold,
              'for function',
              blockOptions.info.name.bold + ' ' + 
              (blockOptions.info.filename + ':' + 
              blockOptions.info.lineNumber).gray
          );
        }
      });
    }

    if (blockOptions.examples) {
      Object.keys(blockOptions.examples).forEach(function (key) {
        var stream = UglifyJS.OutputStream({
              beautify: true
            }),
            ast
        ;

        try {
          ast = UglifyJS.parse(blockOptions.examples[key].code.join('\n'), {
            comments: 'all'
          });
         
          ast.print(stream);

          blockOptions.examples[key].code = stream.toString().split('\n').join('\n\t');
        } catch (e) {
          console.log('[example error]'.red, 'there\'s a syntax error in one of the', blockOptions.info.name, 'examples:', e);
          blockOptions.examples[key].code = blockOptions.examples[key].code.join('\n\t');
        }
      });
    }
  }

  function parseAsPrototypeMember(line) {
    var index = line.indexOf('.prototype.');

    if (index < 0) return;

    blockOptions.info.name = line.substr(
                               index + 11,
                               (line.indexOf('=') - 1) - (index + 11)
                             ).trim();

    blockOptions.info.namespace = line.substr(0, index);
    //blockOptions.info.type = 'function';
    blockOptions.info.isMember = true;
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

    code = code.trim();

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
            description: '',// 'Argument #' + (Object.keys(blockOptions.arguments).length + 1),
            type: false
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

        //Prototype member
        if (buffer.indexOf('.prototype.') > 0) {
          parseAsPrototypeMember(buffer);        
        } else if (buffer.trim().indexOf('return ') == 0) {
          //This is totally an anonymous function. 
          blockOptions.info.name = '<anonymous>'; 
          blockOptions.info.namespace = 'global';        
        } else {

         // if (blockOptions.info.name.length === 0) {

            if (buffer.trim() === '(') {
              blockOptions.info.name = '<anonymous>';     
              disable();    
            } else if (buffer.trim().indexOf('var ') === 0) {
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
         // }

        }
      }
    } else {
      //This is an object.
      parseAsPrototypeMember(code);
      index = code.indexOf(':');
      if (index >= 0) {
        //This is a member of an object. probably.
        blockOptions.info.name = code.substr(0, index).trim();
      }
      blockOptions.info.type = 'data';
    }
  }

  //Public interface
  return {
    pushToken: push,
    toString: toString,
    parse: parse,
    data: blockOptions,
    parseCodeLine: parseCodeLine,
    disable: disable,
    isEnabled: isEnabled

  };
}