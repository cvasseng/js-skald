js-skald
====

**A super quick hack to generate documentation from JavaScript code not using prototypes.**

## Notice

This is a two-hour hack, YMMW. It works for my codestyle, but probably won't for yours.

## Usage

`node bin/js-skald.js [filename or path] [filename or path] ...`

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

