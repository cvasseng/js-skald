js-skald
====

**A super quick hack to generate documentation from JavaScript code not using prototypes.**

## Notice

This is a two-hour hack, YMMW. It works for my codestyle, but probably won't for yours. You may wonder why I've bothered doing this and haven't used jsdoc or some other existing tool. Well, aside from getting an almost perverse pleassure out of writing parsers (especially ugly ones like this!) I had to add an obscene amount of magic `@` keywords to jsdoc to make it produce the output I needed. Maybe I don't know the configuration options well enough, or maybe I'm just writing really strange code, in either case this thing here does exactly what I needed. And not much more.

## Usage

`node bin/js-skald.js [filename or path] [filename or path] ...`

Stores the output (`output.json` and `output.md`) in the output/ folder where it was ran.

## Use cases

In cases where JavaScript objects are used, but without using prototypes. Spits out half-ugly markdown, and a structured JSON document.

**Example**
    
    function AnObject (thing) {
      return {
        /** This is the blurb.  
        * This is the description
        * @memberof AnObject
        * @a {number} - this is an arg description
        * @b {string} - this too
        */
        foobar: function (a, b) {
          console.log(thing, a, b);
        }
      }
    }

    var myInstance = AnObject('Hello world!');
    myInstance.foobar();

## Ideas

  * Inherit comments

## License

MIT.

