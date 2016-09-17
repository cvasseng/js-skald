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
 *   > a {string}
 *   > b {string}
 */
myNamespace.MyClass = function () {
    
}

/** Say hello */
myNamespace.MyClass.prototype.helloWorld = function () {
    console.log('Hello world!');
};

/** Some data 
 * @type {string}
 */
myNamespace.MyClass.prototype.Data = '123';