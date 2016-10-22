js-skald
====

**The JavaScript to markdown API reference generator**

## Notice

Quick hack, YMMW. It works for my codestyle, but probably won't for yours. 
You may wonder why I've bothered doing this and haven't used jsdoc or some other existing tool. Well, aside from getting an almost perverse pleassure out of writing parsers 
(especially ugly ones like this!) I had to add an obscene amount of magic @ keywords to jsdoc to make it produce the output I needed. Maybe I don't know the configuration options well enough, or maybe I'm just writing really strange code, in either case this thing here does exactly what I needed. 

## Installing

`npm install -g js-skald`

## Usage

`node bin/js-skald.js [filename or path] [filename or path] ...`

Stores the output (output.json and output.md) in the output folder where it was ran.

## Advanced Options

Advanced options can be specified by creating a `.skald` file in your project root.
js-skald will use this file when it exists for it's options, skipping any arguments passed
to the command line.

The format of this file is as follows:
    
    {
      "name": "<name of application>",
      "output": "<output folder>",

      //The sources should either be defined like this, or in the group attribute
      "sources": [<array of sources>],
      
      //Sources can be parsed in groups. Each group will produce a separate
      //output file.
      "group": {
        "MyGroup": [
          <array of sources>
        ]
      }
    }

## Hello World
    
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

Of course, things that "aren't" objects can also be commented.

Namespaces are deduced automatically if defining things as such:
  
    MyNamespace.MyNestedNamespace.fn = function (..) {..}
    OR
    MyPrototypeObject.prototype.fn = function (..) {..}

## Supported Keywords
 
**General**

  * `@namespace [name]`: force the thing to be a member of a given namespace
  * `@deprecated`: mark as deprecated
  * `@example [title]`: add an example - will include everything until the next keyword.
  * `@type {type}`: override the deduced type
  * `@memberof namespace`: set as a member of a given namespace
  * `@todo <description>`: add a todo entry
  * `@author <author name>`: set the author of the documented thing
  * `@module`: this is a module interface (experimental)
  * `@name`: override the parsed name. Note that by default the name of the thing being documented is parsed and used.

**Functions**
  
  * `@param name {type} - description`: document a function argument
  * `@return {type} - description`: document a function return
  * `@constructor`: mark as being an object constructor

**Objects**

  * `@emits [name] {type} - description`: document an event emit 

## Documenting Object Attributes

Attributes can be documented using the `>` symbol.

Example:
    
    @returns {object} - a size object
      > width {number} - the width
      > height {number} - the height

They can also be nested:
    
    @returns {object} - a complex object
      > foobar {number} - something
      > size {object} - a size
        > width {number}
        > height {number}
      > backToRoot {string}

The indentation decides which goes where. It doesn't matter
if you use tabs or spaces, but the use of either should be consistent.

## TODO

  * Inherit comments
  * Enum types
  * Parse (optional) thing
  * External configuration files (skaldfile.json or something)

## License

MIT.

