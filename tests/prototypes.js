/** My prototype class
 *
 * This is a simple prototype class.
 *
 * @constructor
 * 
 * @example My named example
 *
 * //Create a new instance of MyClass
 * var myClass = new MyClass();
 *
 * @example
 * //Say hello
 * (new MyClass()).helloWorld();
 */
function MyClass () {
    
}

/** Say hello */
MyClass.prototype.helloWorld = function () {
    console.log('Hello world!');
};