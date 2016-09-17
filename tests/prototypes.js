/** My prototype class
 *
 * This is a simple prototype class.
 *
 * @author chris chris
 * @todo This is not doing anything at the moment
 * @deprecated
 * @constructor
 * 
 * @example My named example
 *
 * //Create a new instance of MyClass
 * var myClass = new MyClass();
 *
 * @example
 *
 * //Say hello
 * (new MyClass()).helloWorld();
 *
 * @emits MyEvent {object} - emitted at some point
 *   > a {string} - the a value
 *   > b {string} - the b value
 */
myNamespace.MyClass = function () {
    
}

/** Say hello 
 * @param text {string} - the text to output
 */
myNamespace.MyClass.prototype.helloWorld = function (text) {
    console.log('Hello world!');
};

/** Some data 
 * @type {string}
 */
myNamespace.MyClass.prototype.Data = '123';