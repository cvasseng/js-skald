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