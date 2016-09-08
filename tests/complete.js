
/** A simple function
 * This is a super simple function.
 **   It takes two numbers or something
 * @a {string} - the string
 * @b {number} - the number
 * @returns {number} - the sum of a + b
 */


somenamespace.nested.test = function (a, b) {
  
}


  /** Another simple function
  */
  namespace.other = function (c, d) {

  }

  /** A regular function
   * This is a regular function
   */
  function sum(a, b) {

    /** Uh-oh, it's an anon return function!
     */
    return function (a, b) {
      return a + b;
    }
  }

  var thing = {

    /** Function in a thing
     * @namespace thing - this is only needed where it can't be deduced
     */
    fn: function (s, d) {

    }
  };

/** A closure to keep state out of the global namespace */
(function () {

})();

/** A function assigned to a var */
  var varFunction = function () {

  }

/** Keep track of the magic number */
var myObject = 123;

/** This is an object constructor
 * @constructor
 */
function Test() {
  

  return {
    /** Say foobar 
     * @memberof Test
     * @return {undefined} - returns nothing
     */
    foobar: function () {

    }
  };
}


/** This is an object constructor
 * @constructor
 * @attributes {object} - The attributes
 *   > name {string} - a string object
 *   > nested {object} - a nested object
 *     > subName {string} - nested property
 */
function Hello(attributes) {

}