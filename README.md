js-skald
====

**A super quick hack to generate documentation from JavaScript code not using prototypes.**

## Notice

This is a two-hour hack, YMMW. It works for my codestyle, but probably won't for yours. You may wonder why I've bothered doing this and haven't used jsdoc or some other existing tool. Well, aside from getting an almost perverse pleassure out of writing parsers (especially ugly ones like this!) I had to add an obscene amount of magic @ keywords to jsdoc to make it produce the output I needed. Maybe I don't know the configuration options well enough, or maybe I'm just writing really strange code, in either case this thing here does exactly what I needed. And not much more.

## Usage

`node bin/js-skald.js [filename or path] [filename or path] ...`

Stores the output (output.json and output.md) in the output folder where it was ran.

## Use cases

In cases where JavaScript objects are used, but when not using using prototypes. Spits out half-ugly markdown, and a structured JSON document.

**Example**
    
    /** A simple object
     * Creates an object with the foobar function.
     * @constructor
     * @param attributes {object} - the object properties 
     *   > name {string} - the name of the object
     *   > size {object} - the size of the object
     *     > x {number} - x-component of the size
     *     > y {number} - y-component of the size  
     * @param thing {string} - the string to log
     */
    function AnObject (attributes, thing) {
      return {
        /** This is the blurb.  
        * This is the description
        * @memberof AnObject
        * @param a {number} - this is an arg description
        * @param b {string} - this too
        * @return {object} - an object
        *   > thing {string} - constructor thing
        *   > attributes {object} - the object passed to the constructor
        *   > passed {object} - object of args passed to the function
        *     > a {anything} - a arg
        *     > b {anything} - b arg
        */
        foobar: function (a, b) {
          return {
            thing: thing,
            attributes: attributes,
            passed: {
              a: a,
              b: b
            }
          }
        }
      }
    }

**Generates the following JSON**
           
    {
      "name": "global",
      "namespaces": {
        "global": {
          "namespaces": {},
          "children": [
            {
              "info": {
                "name": "AnObject",
                "blurb": "A simple object",
                "description": "Creates an object with the foobar function.",
                "type": "object constructor",
                "filename": "tests/attributes.js",
                "lineNumber": 11,
                "namespace": [
                  "global"
                ],
                "definition": "function AnObject (attributes, thing) {"
              },
              "arguments": {
                "attributes": {
                  "description": "the object properties",
                  "type": "object",
                  "attributes": {
                    "name": {
                      "description": "the name of the object",
                      "type": "string"
                    },
                    "size": {
                      "description": "the size of the object",
                      "type": "object",
                      "attributes": {
                        "x": {
                          "description": "x-component of the size",
                          "type": "number"
                        },
                        "y": {
                          "description": "y-component of the size",
                          "type": "number"
                        }
                      }
                    }
                  }
                },
                "thing": {
                  "description": "the string to log",
                  "type": "string"
                }
              }
            }
          ]
        },
        "AnObject": {
          "namespaces": {},
          "children": [
            {
              "info": {
                "name": "foobar",
                "blurb": "This is the blurb.",
                "description": "This is the description",
                "type": "member.function",
                "filename": "tests/attributes.js",
                "lineNumber": 26,
                "namespace": [
                  "AnObject"
                ],
                "definition": "foobar: function (a, b) {"
              },
              "arguments": {
                "a": {
                  "description": "this is an arg description",
                  "type": "number"
                },
                "b": {
                  "description": "this too",
                  "type": "string"
                }
              },
              "return": {
                "description": "an object",
                "type": "object",
                "attributes": {
                  "thing": {
                    "description": "constructor thing",
                    "type": "string"
                  },
                  "attributes": {
                    "description": "the object passed to the constructor",
                    "type": "object"
                  },
                  "passed": {
                    "description": "object of args passed to the function",
                    "type": "object",
                    "attributes": {
                      "a": {
                        "description": "a arg",
                        "type": "anything"
                      },
                      "b": {
                        "description": "b arg",
                        "type": "anything"
                      }
                    }
                  },
                  "something": {
                    "description": "",
                    "type": "unknown"
                  }
                }
              }
            }
          ]
        }
      },
      "children": []
    }

Of course, things that "aren't" objects can also be commented.

Namespaces are deduced automatically if defining things as such:
  
    MyNamespace.MyNestedNamespace.fn = function (..) {..}

## Ideas

  * Inherit comments

## License

MIT.

