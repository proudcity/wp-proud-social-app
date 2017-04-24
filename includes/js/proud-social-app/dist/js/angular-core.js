/**
 * @license AngularJS v1.6.4
 * (c) 2010-2017 Google, Inc. http://angularjs.org
 * License: MIT
 */
!function(window){"use strict";/**
 * @description
 *
 * This object provides a utility for producing rich Error messages within
 * Angular. It can be called as follows:
 *
 * var exampleMinErr = minErr('example');
 * throw exampleMinErr('one', 'This {0} is {1}', foo, bar);
 *
 * The above creates an instance of minErr in the example namespace. The
 * resulting error will have a namespaced error code of example.one.  The
 * resulting error will replace {0} with the value of foo, and {1} with the
 * value of bar. The object is not restricted in the number of arguments it can
 * take.
 *
 * If fewer arguments are specified than necessary for interpolation, the extra
 * interpolation markers will be preserved in the final string.
 *
 * Since data will be parsed statically during a build step, some restrictions
 * are applied with respect to how minErr instances are created and called.
 * Instances should have names of the form namespaceMinErr for a minErr created
 * using minErr('namespace') . Error codes, namespaces and template strings
 * should all be static strings, not variables or general expressions.
 *
 * @param {string} module The namespace to use for the new minErr instance.
 * @param {function} ErrorConstructor Custom error constructor to be instantiated when returning
 *   error from returned function, for cases when a particular type of error is useful.
 * @returns {function(code:string, template:string, ...templateArgs): Error} minErr instance
 */
function minErr(module,ErrorConstructor){return ErrorConstructor=ErrorConstructor||Error,function(){var paramPrefix,i,code=arguments[0],template=arguments[1],message="["+(module?module+":":"")+code+"] ",templateArgs=sliceArgs(arguments,2).map(function(arg){return toDebugString(arg,minErrConfig.objectMaxDepth)});for(message+=template.replace(/\{\d+\}/g,function(match){var index=+match.slice(1,-1);return index<templateArgs.length?templateArgs[index]:match}),message+="\nhttp://errors.angularjs.org/1.6.4/"+(module?module+"/":"")+code,i=0,paramPrefix="?";i<templateArgs.length;i++,paramPrefix="&")message+=paramPrefix+"p"+i+"="+encodeURIComponent(templateArgs[i]);return new ErrorConstructor(message)}}/**
 * @ngdoc function
 * @name angular.errorHandlingConfig
 * @module ng
 * @kind function
 *
 * @description
 * Configure several aspects of error handling in AngularJS if used as a setter or return the
 * current configuration if used as a getter. The following options are supported:
 *
 * - **objectMaxDepth**: The maximum depth to which objects are traversed when stringified for error messages.
 *
 * Omitted or undefined options will leave the corresponding configuration values unchanged.
 *
 * @param {Object=} config - The configuration object. May only contain the options that need to be
 *     updated. Supported keys:
 *
 * * `objectMaxDepth`  **{Number}** - The max depth for stringifying objects. Setting to a
 *   non-positive or non-numeric value, removes the max depth limit.
 *   Default: 5
 */
function errorHandlingConfig(config){return isObject(config)?void(isDefined(config.objectMaxDepth)&&(minErrConfig.objectMaxDepth=isValidObjectMaxDepth(config.objectMaxDepth)?config.objectMaxDepth:NaN)):minErrConfig}/**
 * @private
 * @param {Number} maxDepth
 * @return {boolean}
 */
function isValidObjectMaxDepth(maxDepth){return isNumber(maxDepth)&&maxDepth>0}/**
 * @private
 * @param {*} obj
 * @return {boolean} Returns true if `obj` is an array or array-like object (NodeList, Arguments,
 *                   String ...)
 */
function isArrayLike(obj){
// `null`, `undefined` and `window` are not array-like
if(null==obj||isWindow(obj))return!1;
// arrays, strings and jQuery/jqLite objects are array like
// * jqLite is either the jQuery or jqLite constructor function
// * we have to check the existence of jqLite first as this method is called
//   via the forEach method when constructing the jqLite object in the first place
if(isArray(obj)||isString(obj)||jqLite&&obj instanceof jqLite)return!0;
// Support: iOS 8.2 (not reproducible in simulator)
// "length" in obj used to prevent JIT error (gh-11508)
var length="length"in Object(obj)&&obj.length;
// NodeList objects (with `item` method) and
// other objects with suitable length characteristics are array-like
return isNumber(length)&&(length>=0&&(length-1 in obj||obj instanceof Array)||"function"==typeof obj.item)}/**
 * @ngdoc function
 * @name angular.forEach
 * @module ng
 * @kind function
 *
 * @description
 * Invokes the `iterator` function once for each item in `obj` collection, which can be either an
 * object or an array. The `iterator` function is invoked with `iterator(value, key, obj)`, where `value`
 * is the value of an object property or an array element, `key` is the object property key or
 * array element index and obj is the `obj` itself. Specifying a `context` for the function is optional.
 *
 * It is worth noting that `.forEach` does not iterate over inherited properties because it filters
 * using the `hasOwnProperty` method.
 *
 * Unlike ES262's
 * [Array.prototype.forEach](http://www.ecma-international.org/ecma-262/5.1/#sec-15.4.4.18),
 * providing 'undefined' or 'null' values for `obj` will not throw a TypeError, but rather just
 * return the value provided.
 *
   ```js
     var values = {name: 'misko', gender: 'male'};
     var log = [];
     angular.forEach(values, function(value, key) {
       this.push(key + ': ' + value);
     }, log);
     expect(log).toEqual(['name: misko', 'gender: male']);
   ```
 *
 * @param {Object|Array} obj Object to iterate over.
 * @param {Function} iterator Iterator function.
 * @param {Object=} context Object to become context (`this`) for the iterator function.
 * @returns {Object|Array} Reference to `obj`.
 */
function forEach(obj,iterator,context){var key,length;if(obj)if(isFunction(obj))for(key in obj)"prototype"!==key&&"length"!==key&&"name"!==key&&obj.hasOwnProperty(key)&&iterator.call(context,obj[key],key,obj);else if(isArray(obj)||isArrayLike(obj)){var isPrimitive="object"!=typeof obj;for(key=0,length=obj.length;key<length;key++)(isPrimitive||key in obj)&&iterator.call(context,obj[key],key,obj)}else if(obj.forEach&&obj.forEach!==forEach)obj.forEach(iterator,context,obj);else if(isBlankObject(obj))
// createMap() fast path --- Safe to avoid hasOwnProperty check because prototype chain is empty
for(key in obj)iterator.call(context,obj[key],key,obj);else if("function"==typeof obj.hasOwnProperty)
// Slow path for objects inheriting Object.prototype, hasOwnProperty check needed
for(key in obj)obj.hasOwnProperty(key)&&iterator.call(context,obj[key],key,obj);else
// Slow path for objects which do not have a method `hasOwnProperty`
for(key in obj)hasOwnProperty.call(obj,key)&&iterator.call(context,obj[key],key,obj);return obj}function forEachSorted(obj,iterator,context){for(var keys=Object.keys(obj).sort(),i=0;i<keys.length;i++)iterator.call(context,obj[keys[i]],keys[i]);return keys}/**
 * when using forEach the params are value, key, but it is often useful to have key, value.
 * @param {function(string, *)} iteratorFn
 * @returns {function(*, string)}
 */
function reverseParams(iteratorFn){return function(value,key){iteratorFn(key,value)}}/**
 * A consistent way of creating unique IDs in angular.
 *
 * Using simple numbers allows us to generate 28.6 million unique ids per second for 10 years before
 * we hit number precision issues in JavaScript.
 *
 * Math.pow(2,53) / 60 / 60 / 24 / 365 / 10 = 28.6M
 *
 * @returns {number} an unique alpha-numeric string
 */
function nextUid(){return++uid}/**
 * Set or clear the hashkey for an object.
 * @param obj object
 * @param h the hashkey (!truthy to delete the hashkey)
 */
function setHashKey(obj,h){h?obj.$$hashKey=h:delete obj.$$hashKey}function baseExtend(dst,objs,deep){for(var h=dst.$$hashKey,i=0,ii=objs.length;i<ii;++i){var obj=objs[i];if(isObject(obj)||isFunction(obj))for(var keys=Object.keys(obj),j=0,jj=keys.length;j<jj;j++){var key=keys[j],src=obj[key];deep&&isObject(src)?isDate(src)?dst[key]=new Date(src.valueOf()):isRegExp(src)?dst[key]=new RegExp(src):src.nodeName?dst[key]=src.cloneNode(!0):isElement(src)?dst[key]=src.clone():(isObject(dst[key])||(dst[key]=isArray(src)?[]:{}),baseExtend(dst[key],[src],!0)):dst[key]=src}}return setHashKey(dst,h),dst}/**
 * @ngdoc function
 * @name angular.extend
 * @module ng
 * @kind function
 *
 * @description
 * Extends the destination object `dst` by copying own enumerable properties from the `src` object(s)
 * to `dst`. You can specify multiple `src` objects. If you want to preserve original objects, you can do so
 * by passing an empty object as the target: `var object = angular.extend({}, object1, object2)`.
 *
 * **Note:** Keep in mind that `angular.extend` does not support recursive merge (deep copy). Use
 * {@link angular.merge} for this.
 *
 * @param {Object} dst Destination object.
 * @param {...Object} src Source object(s).
 * @returns {Object} Reference to `dst`.
 */
function extend(dst){return baseExtend(dst,slice.call(arguments,1),!1)}/**
* @ngdoc function
* @name angular.merge
* @module ng
* @kind function
*
* @description
* Deeply extends the destination object `dst` by copying own enumerable properties from the `src` object(s)
* to `dst`. You can specify multiple `src` objects. If you want to preserve original objects, you can do so
* by passing an empty object as the target: `var object = angular.merge({}, object1, object2)`.
*
* Unlike {@link angular.extend extend()}, `merge()` recursively descends into object properties of source
* objects, performing a deep copy.
*
* @param {Object} dst Destination object.
* @param {...Object} src Source object(s).
* @returns {Object} Reference to `dst`.
*/
function merge(dst){return baseExtend(dst,slice.call(arguments,1),!0)}function toInt(str){return parseInt(str,10)}function inherit(parent,extra){return extend(Object.create(parent),extra)}/**
 * @ngdoc function
 * @name angular.noop
 * @module ng
 * @kind function
 *
 * @description
 * A function that performs no operations. This function can be useful when writing code in the
 * functional style.
   ```js
     function foo(callback) {
       var result = calculateResult();
       (callback || angular.noop)(result);
     }
   ```
 */
function noop(){}/**
 * @ngdoc function
 * @name angular.identity
 * @module ng
 * @kind function
 *
 * @description
 * A function that returns its first argument. This function is useful when writing code in the
 * functional style.
 *
   ```js
   function transformer(transformationFn, value) {
     return (transformationFn || angular.identity)(value);
   };

   // E.g.
   function getResult(fn, input) {
     return (fn || angular.identity)(input);
   };

   getResult(function(n) { return n * 2; }, 21);   // returns 42
   getResult(null, 21);                            // returns 21
   getResult(undefined, 21);                       // returns 21
   ```
 *
 * @param {*} value to be returned.
 * @returns {*} the value passed in.
 */
function identity($){return $}function valueFn(value){return function(){return value}}function hasCustomToString(obj){return isFunction(obj.toString)&&obj.toString!==toString}/**
 * @ngdoc function
 * @name angular.isUndefined
 * @module ng
 * @kind function
 *
 * @description
 * Determines if a reference is undefined.
 *
 * @param {*} value Reference to check.
 * @returns {boolean} True if `value` is undefined.
 */
function isUndefined(value){return"undefined"==typeof value}/**
 * @ngdoc function
 * @name angular.isDefined
 * @module ng
 * @kind function
 *
 * @description
 * Determines if a reference is defined.
 *
 * @param {*} value Reference to check.
 * @returns {boolean} True if `value` is defined.
 */
function isDefined(value){return"undefined"!=typeof value}/**
 * @ngdoc function
 * @name angular.isObject
 * @module ng
 * @kind function
 *
 * @description
 * Determines if a reference is an `Object`. Unlike `typeof` in JavaScript, `null`s are not
 * considered to be objects. Note that JavaScript arrays are objects.
 *
 * @param {*} value Reference to check.
 * @returns {boolean} True if `value` is an `Object` but not `null`.
 */
function isObject(value){
// http://jsperf.com/isobject4
return null!==value&&"object"==typeof value}/**
 * Determine if a value is an object with a null prototype
 *
 * @returns {boolean} True if `value` is an `Object` with a null prototype
 */
function isBlankObject(value){return null!==value&&"object"==typeof value&&!getPrototypeOf(value)}/**
 * @ngdoc function
 * @name angular.isString
 * @module ng
 * @kind function
 *
 * @description
 * Determines if a reference is a `String`.
 *
 * @param {*} value Reference to check.
 * @returns {boolean} True if `value` is a `String`.
 */
function isString(value){return"string"==typeof value}/**
 * @ngdoc function
 * @name angular.isNumber
 * @module ng
 * @kind function
 *
 * @description
 * Determines if a reference is a `Number`.
 *
 * This includes the "special" numbers `NaN`, `+Infinity` and `-Infinity`.
 *
 * If you wish to exclude these then you can use the native
 * [`isFinite'](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/isFinite)
 * method.
 *
 * @param {*} value Reference to check.
 * @returns {boolean} True if `value` is a `Number`.
 */
function isNumber(value){return"number"==typeof value}/**
 * @ngdoc function
 * @name angular.isDate
 * @module ng
 * @kind function
 *
 * @description
 * Determines if a value is a date.
 *
 * @param {*} value Reference to check.
 * @returns {boolean} True if `value` is a `Date`.
 */
function isDate(value){return"[object Date]"===toString.call(value)}/**
 * @ngdoc function
 * @name angular.isFunction
 * @module ng
 * @kind function
 *
 * @description
 * Determines if a reference is a `Function`.
 *
 * @param {*} value Reference to check.
 * @returns {boolean} True if `value` is a `Function`.
 */
function isFunction(value){return"function"==typeof value}/**
 * Determines if a value is a regular expression object.
 *
 * @private
 * @param {*} value Reference to check.
 * @returns {boolean} True if `value` is a `RegExp`.
 */
function isRegExp(value){return"[object RegExp]"===toString.call(value)}/**
 * Checks if `obj` is a window object.
 *
 * @private
 * @param {*} obj Object to check
 * @returns {boolean} True if `obj` is a window obj.
 */
function isWindow(obj){return obj&&obj.window===obj}function isScope(obj){return obj&&obj.$evalAsync&&obj.$watch}function isFile(obj){return"[object File]"===toString.call(obj)}function isFormData(obj){return"[object FormData]"===toString.call(obj)}function isBlob(obj){return"[object Blob]"===toString.call(obj)}function isBoolean(value){return"boolean"==typeof value}function isPromiseLike(obj){return obj&&isFunction(obj.then)}function isTypedArray(value){return value&&isNumber(value.length)&&TYPED_ARRAY_REGEXP.test(toString.call(value))}function isArrayBuffer(obj){return"[object ArrayBuffer]"===toString.call(obj)}/**
 * @ngdoc function
 * @name angular.isElement
 * @module ng
 * @kind function
 *
 * @description
 * Determines if a reference is a DOM element (or wrapped jQuery element).
 *
 * @param {*} value Reference to check.
 * @returns {boolean} True if `value` is a DOM element (or wrapped jQuery element).
 */
function isElement(node){return!(!node||!(node.nodeName||node.prop&&node.attr&&node.find))}/**
 * @param str 'key1,key2,...'
 * @returns {object} in the form of {key1:true, key2:true, ...}
 */
function makeMap(str){var i,obj={},items=str.split(",");for(i=0;i<items.length;i++)obj[items[i]]=!0;return obj}function nodeName_(element){return lowercase(element.nodeName||element[0]&&element[0].nodeName)}function includes(array,obj){return Array.prototype.indexOf.call(array,obj)!==-1}function arrayRemove(array,value){var index=array.indexOf(value);return index>=0&&array.splice(index,1),index}/**
 * @ngdoc function
 * @name angular.copy
 * @module ng
 * @kind function
 *
 * @description
 * Creates a deep copy of `source`, which should be an object or an array.
 *
 * * If no destination is supplied, a copy of the object or array is created.
 * * If a destination is provided, all of its elements (for arrays) or properties (for objects)
 *   are deleted and then all elements/properties from the source are copied to it.
 * * If `source` is not an object or array (inc. `null` and `undefined`), `source` is returned.
 * * If `source` is identical to `destination` an exception will be thrown.
 *
 * <br />
 * <div class="alert alert-warning">
 *   Only enumerable properties are taken into account. Non-enumerable properties (both on `source`
 *   and on `destination`) will be ignored.
 * </div>
 *
 * @param {*} source The source that will be used to make a copy.
 *                   Can be any type, including primitives, `null`, and `undefined`.
 * @param {(Object|Array)=} destination Destination into which the source is copied. If
 *     provided, must be of the same type as `source`.
 * @returns {*} The copy or updated `destination`, if `destination` was specified.
 *
 * @example
  <example module="copyExample" name="angular-copy">
    <file name="index.html">
      <div ng-controller="ExampleController">
        <form novalidate class="simple-form">
          <label>Name: <input type="text" ng-model="user.name" /></label><br />
          <label>Age:  <input type="number" ng-model="user.age" /></label><br />
          Gender: <label><input type="radio" ng-model="user.gender" value="male" />male</label>
                  <label><input type="radio" ng-model="user.gender" value="female" />female</label><br />
          <button ng-click="reset()">RESET</button>
          <button ng-click="update(user)">SAVE</button>
        </form>
        <pre>form = {{user | json}}</pre>
        <pre>master = {{master | json}}</pre>
      </div>
    </file>
    <file name="script.js">
      // Module: copyExample
      angular.
        module('copyExample', []).
        controller('ExampleController', ['$scope', function($scope) {
          $scope.master = {};

          $scope.reset = function() {
            // Example with 1 argument
            $scope.user = angular.copy($scope.master);
          };

          $scope.update = function(user) {
            // Example with 2 arguments
            angular.copy(user, $scope.master);
          };

          $scope.reset();
        }]);
    </file>
  </example>
 */
function copy(source,destination,maxDepth){function copyRecurse(source,destination,maxDepth){if(maxDepth--,maxDepth<0)return"...";var key,h=destination.$$hashKey;if(isArray(source))for(var i=0,ii=source.length;i<ii;i++)destination.push(copyElement(source[i],maxDepth));else if(isBlankObject(source))
// createMap() fast path --- Safe to avoid hasOwnProperty check because prototype chain is empty
for(key in source)destination[key]=copyElement(source[key],maxDepth);else if(source&&"function"==typeof source.hasOwnProperty)
// Slow path, which must rely on hasOwnProperty
for(key in source)source.hasOwnProperty(key)&&(destination[key]=copyElement(source[key],maxDepth));else
// Slowest path --- hasOwnProperty can't be called as a method
for(key in source)hasOwnProperty.call(source,key)&&(destination[key]=copyElement(source[key],maxDepth));return setHashKey(destination,h),destination}function copyElement(source,maxDepth){
// Simple values
if(!isObject(source))return source;
// Already copied values
var index=stackSource.indexOf(source);if(index!==-1)return stackDest[index];if(isWindow(source)||isScope(source))throw ngMinErr("cpws","Can't copy! Making copies of Window or Scope instances is not supported.");var needsRecurse=!1,destination=copyType(source);return void 0===destination&&(destination=isArray(source)?[]:Object.create(getPrototypeOf(source)),needsRecurse=!0),stackSource.push(source),stackDest.push(destination),needsRecurse?copyRecurse(source,destination,maxDepth):destination}function copyType(source){switch(toString.call(source)){case"[object Int8Array]":case"[object Int16Array]":case"[object Int32Array]":case"[object Float32Array]":case"[object Float64Array]":case"[object Uint8Array]":case"[object Uint8ClampedArray]":case"[object Uint16Array]":case"[object Uint32Array]":return new source.constructor(copyElement(source.buffer),source.byteOffset,source.length);case"[object ArrayBuffer]":
// Support: IE10
if(!source.slice){
// If we're in this case we know the environment supports ArrayBuffer
/* eslint-disable no-undef */
var copied=new ArrayBuffer(source.byteLength);/* eslint-enable */
return new Uint8Array(copied).set(new Uint8Array(source)),copied}return source.slice(0);case"[object Boolean]":case"[object Number]":case"[object String]":case"[object Date]":return new source.constructor(source.valueOf());case"[object RegExp]":var re=new RegExp(source.source,source.toString().match(/[^\/]*$/)[0]);return re.lastIndex=source.lastIndex,re;case"[object Blob]":return new source.constructor([source],{type:source.type})}if(isFunction(source.cloneNode))return source.cloneNode(!0)}var stackSource=[],stackDest=[];if(maxDepth=isValidObjectMaxDepth(maxDepth)?maxDepth:NaN,destination){if(isTypedArray(destination)||isArrayBuffer(destination))throw ngMinErr("cpta","Can't copy! TypedArray destination cannot be mutated.");if(source===destination)throw ngMinErr("cpi","Can't copy! Source and destination are identical.");
// Empty the destination object
return isArray(destination)?destination.length=0:forEach(destination,function(value,key){"$$hashKey"!==key&&delete destination[key]}),stackSource.push(source),stackDest.push(destination),copyRecurse(source,destination,maxDepth)}return copyElement(source,maxDepth)}
// eslint-disable-next-line no-self-compare
function simpleCompare(a,b){return a===b||a!==a&&b!==b}/**
 * @ngdoc function
 * @name angular.equals
 * @module ng
 * @kind function
 *
 * @description
 * Determines if two objects or two values are equivalent. Supports value types, regular
 * expressions, arrays and objects.
 *
 * Two objects or values are considered equivalent if at least one of the following is true:
 *
 * * Both objects or values pass `===` comparison.
 * * Both objects or values are of the same type and all of their properties are equal by
 *   comparing them with `angular.equals`.
 * * Both values are NaN. (In JavaScript, NaN == NaN => false. But we consider two NaN as equal)
 * * Both values represent the same regular expression (In JavaScript,
 *   /abc/ == /abc/ => false. But we consider two regular expressions as equal when their textual
 *   representation matches).
 *
 * During a property comparison, properties of `function` type and properties with names
 * that begin with `$` are ignored.
 *
 * Scope and DOMWindow objects are being compared only by identify (`===`).
 *
 * @param {*} o1 Object or value to compare.
 * @param {*} o2 Object or value to compare.
 * @returns {boolean} True if arguments are equal.
 *
 * @example
   <example module="equalsExample" name="equalsExample">
     <file name="index.html">
      <div ng-controller="ExampleController">
        <form novalidate>
          <h3>User 1</h3>
          Name: <input type="text" ng-model="user1.name">
          Age: <input type="number" ng-model="user1.age">

          <h3>User 2</h3>
          Name: <input type="text" ng-model="user2.name">
          Age: <input type="number" ng-model="user2.age">

          <div>
            <br/>
            <input type="button" value="Compare" ng-click="compare()">
          </div>
          User 1: <pre>{{user1 | json}}</pre>
          User 2: <pre>{{user2 | json}}</pre>
          Equal: <pre>{{result}}</pre>
        </form>
      </div>
    </file>
    <file name="script.js">
        angular.module('equalsExample', []).controller('ExampleController', ['$scope', function($scope) {
          $scope.user1 = {};
          $scope.user2 = {};
          $scope.compare = function() {
            $scope.result = angular.equals($scope.user1, $scope.user2);
          };
        }]);
    </file>
  </example>
 */
function equals(o1,o2){if(o1===o2)return!0;if(null===o1||null===o2)return!1;
// eslint-disable-next-line no-self-compare
if(o1!==o1&&o2!==o2)return!0;// NaN === NaN
var length,key,keySet,t1=typeof o1,t2=typeof o2;if(t1===t2&&"object"===t1){if(!isArray(o1)){if(isDate(o1))return!!isDate(o2)&&simpleCompare(o1.getTime(),o2.getTime());if(isRegExp(o1))return!!isRegExp(o2)&&o1.toString()===o2.toString();if(isScope(o1)||isScope(o2)||isWindow(o1)||isWindow(o2)||isArray(o2)||isDate(o2)||isRegExp(o2))return!1;keySet=createMap();for(key in o1)if("$"!==key.charAt(0)&&!isFunction(o1[key])){if(!equals(o1[key],o2[key]))return!1;keySet[key]=!0}for(key in o2)if(!(key in keySet)&&"$"!==key.charAt(0)&&isDefined(o2[key])&&!isFunction(o2[key]))return!1;return!0}if(!isArray(o2))return!1;if((length=o1.length)===o2.length){for(key=0;key<length;key++)if(!equals(o1[key],o2[key]))return!1;return!0}}return!1}function concat(array1,array2,index){return array1.concat(slice.call(array2,index))}function sliceArgs(args,startIndex){return slice.call(args,startIndex||0)}/**
 * @ngdoc function
 * @name angular.bind
 * @module ng
 * @kind function
 *
 * @description
 * Returns a function which calls function `fn` bound to `self` (`self` becomes the `this` for
 * `fn`). You can supply optional `args` that are prebound to the function. This feature is also
 * known as [partial application](http://en.wikipedia.org/wiki/Partial_application), as
 * distinguished from [function currying](http://en.wikipedia.org/wiki/Currying#Contrast_with_partial_function_application).
 *
 * @param {Object} self Context which `fn` should be evaluated in.
 * @param {function()} fn Function to be bound.
 * @param {...*} args Optional arguments to be prebound to the `fn` function call.
 * @returns {function()} Function that wraps the `fn` with all the specified bindings.
 */
function bind(self,fn){var curryArgs=arguments.length>2?sliceArgs(arguments,2):[];return!isFunction(fn)||fn instanceof RegExp?fn:curryArgs.length?function(){return arguments.length?fn.apply(self,concat(curryArgs,arguments,0)):fn.apply(self,curryArgs)}:function(){return arguments.length?fn.apply(self,arguments):fn.call(self)}}function toJsonReplacer(key,value){var val=value;return"string"==typeof key&&"$"===key.charAt(0)&&"$"===key.charAt(1)?val=void 0:isWindow(value)?val="$WINDOW":value&&window.document===value?val="$DOCUMENT":isScope(value)&&(val="$SCOPE"),val}/**
 * @ngdoc function
 * @name angular.toJson
 * @module ng
 * @kind function
 *
 * @description
 * Serializes input into a JSON-formatted string. Properties with leading $$ characters will be
 * stripped since angular uses this notation internally.
 *
 * @param {Object|Array|Date|string|number|boolean} obj Input to be serialized into JSON.
 * @param {boolean|number} [pretty=2] If set to true, the JSON output will contain newlines and whitespace.
 *    If set to an integer, the JSON output will contain that many spaces per indentation.
 * @returns {string|undefined} JSON-ified string representing `obj`.
 * @knownIssue
 *
 * The Safari browser throws a `RangeError` instead of returning `null` when it tries to stringify a `Date`
 * object with an invalid date value. The only reliable way to prevent this is to monkeypatch the
 * `Date.prototype.toJSON` method as follows:
 *
 * ```
 * var _DatetoJSON = Date.prototype.toJSON;
 * Date.prototype.toJSON = function() {
 *   try {
 *     return _DatetoJSON.call(this);
 *   } catch(e) {
 *     if (e instanceof RangeError) {
 *       return null;
 *     }
 *     throw e;
 *   }
 * };
 * ```
 *
 * See https://github.com/angular/angular.js/pull/14221 for more information.
 */
function toJson(obj,pretty){if(!isUndefined(obj))return isNumber(pretty)||(pretty=pretty?2:null),JSON.stringify(obj,toJsonReplacer,pretty)}/**
 * @ngdoc function
 * @name angular.fromJson
 * @module ng
 * @kind function
 *
 * @description
 * Deserializes a JSON string.
 *
 * @param {string} json JSON string to deserialize.
 * @returns {Object|Array|string|number} Deserialized JSON string.
 */
function fromJson(json){return isString(json)?JSON.parse(json):json}function timezoneToOffset(timezone,fallback){
// Support: IE 9-11 only, Edge 13-14+
// IE/Edge do not "understand" colon (`:`) in timezone
timezone=timezone.replace(ALL_COLONS,"");var requestedTimezoneOffset=Date.parse("Jan 01, 1970 00:00:00 "+timezone)/6e4;return isNumberNaN(requestedTimezoneOffset)?fallback:requestedTimezoneOffset}function addDateMinutes(date,minutes){return date=new Date(date.getTime()),date.setMinutes(date.getMinutes()+minutes),date}function convertTimezoneToLocal(date,timezone,reverse){reverse=reverse?-1:1;var dateTimezoneOffset=date.getTimezoneOffset(),timezoneOffset=timezoneToOffset(timezone,dateTimezoneOffset);return addDateMinutes(date,reverse*(timezoneOffset-dateTimezoneOffset))}/**
 * @returns {string} Returns the string representation of the element.
 */
function startingTag(element){element=jqLite(element).clone();try{
// turns out IE does not let you set .html() on elements which
// are not allowed to have children. So we just ignore it.
element.empty()}catch(e){}var elemHtml=jqLite("<div>").append(element).html();try{return element[0].nodeType===NODE_TYPE_TEXT?lowercase(elemHtml):elemHtml.match(/^(<[^>]+>)/)[1].replace(/^<([\w-]+)/,function(match,nodeName){return"<"+lowercase(nodeName)})}catch(e){return lowercase(elemHtml)}}
/////////////////////////////////////////////////
/**
 * Tries to decode the URI component without throwing an exception.
 *
 * @private
 * @param str value potential URI component to check.
 * @returns {boolean} True if `value` can be decoded
 * with the decodeURIComponent function.
 */
function tryDecodeURIComponent(value){try{return decodeURIComponent(value)}catch(e){}}/**
 * Parses an escaped url query string into key-value pairs.
 * @returns {Object.<string,boolean|Array>}
 */
function parseKeyValue(/**string*/keyValue){var obj={};return forEach((keyValue||"").split("&"),function(keyValue){var splitPoint,key,val;keyValue&&(key=keyValue=keyValue.replace(/\+/g,"%20"),splitPoint=keyValue.indexOf("="),splitPoint!==-1&&(key=keyValue.substring(0,splitPoint),val=keyValue.substring(splitPoint+1)),key=tryDecodeURIComponent(key),isDefined(key)&&(val=!isDefined(val)||tryDecodeURIComponent(val),hasOwnProperty.call(obj,key)?isArray(obj[key])?obj[key].push(val):obj[key]=[obj[key],val]:obj[key]=val))}),obj}function toKeyValue(obj){var parts=[];return forEach(obj,function(value,key){isArray(value)?forEach(value,function(arrayValue){parts.push(encodeUriQuery(key,!0)+(arrayValue===!0?"":"="+encodeUriQuery(arrayValue,!0)))}):parts.push(encodeUriQuery(key,!0)+(value===!0?"":"="+encodeUriQuery(value,!0)))}),parts.length?parts.join("&"):""}/**
 * We need our custom method because encodeURIComponent is too aggressive and doesn't follow
 * http://www.ietf.org/rfc/rfc3986.txt with regards to the character set (pchar) allowed in path
 * segments:
 *    segment       = *pchar
 *    pchar         = unreserved / pct-encoded / sub-delims / ":" / "@"
 *    pct-encoded   = "%" HEXDIG HEXDIG
 *    unreserved    = ALPHA / DIGIT / "-" / "." / "_" / "~"
 *    sub-delims    = "!" / "$" / "&" / "'" / "(" / ")"
 *                     / "*" / "+" / "," / ";" / "="
 */
function encodeUriSegment(val){return encodeUriQuery(val,!0).replace(/%26/gi,"&").replace(/%3D/gi,"=").replace(/%2B/gi,"+")}/**
 * This method is intended for encoding *key* or *value* parts of query component. We need a custom
 * method because encodeURIComponent is too aggressive and encodes stuff that doesn't have to be
 * encoded per http://tools.ietf.org/html/rfc3986:
 *    query         = *( pchar / "/" / "?" )
 *    pchar         = unreserved / pct-encoded / sub-delims / ":" / "@"
 *    unreserved    = ALPHA / DIGIT / "-" / "." / "_" / "~"
 *    pct-encoded   = "%" HEXDIG HEXDIG
 *    sub-delims    = "!" / "$" / "&" / "'" / "(" / ")"
 *                     / "*" / "+" / "," / ";" / "="
 */
function encodeUriQuery(val,pctEncodeSpaces){return encodeURIComponent(val).replace(/%40/gi,"@").replace(/%3A/gi,":").replace(/%24/g,"$").replace(/%2C/gi,",").replace(/%3B/gi,";").replace(/%20/g,pctEncodeSpaces?"%20":"+")}function getNgAttribute(element,ngAttr){var attr,i,ii=ngAttrPrefixes.length;for(i=0;i<ii;++i)if(attr=ngAttrPrefixes[i]+ngAttr,isString(attr=element.getAttribute(attr)))return attr;return null}function allowAutoBootstrap(document){var script=document.currentScript;if(!script)
// IE does not have `document.currentScript`
return!0;
// If the `currentScript` property has been clobbered just return false, since this indicates a probable attack
if(!(script instanceof window.HTMLScriptElement||script instanceof window.SVGScriptElement))return!1;var attributes=script.attributes,srcs=[attributes.getNamedItem("src"),attributes.getNamedItem("href"),attributes.getNamedItem("xlink:href")];return srcs.every(function(src){if(!src)return!0;if(!src.value)return!1;var link=document.createElement("a");if(link.href=src.value,document.location.origin===link.origin)
// Same-origin resources are always allowed, even for non-whitelisted schemes.
return!0;
// Disabled bootstrapping unless angular.js was loaded from a known scheme used on the web.
// This is to prevent angular.js bundled with browser extensions from being used to bypass the
// content security policy in web pages and other browser extensions.
switch(link.protocol){case"http:":case"https:":case"ftp:":case"blob:":case"file:":case"data:":return!0;default:return!1}})}/**
 * @ngdoc directive
 * @name ngApp
 * @module ng
 *
 * @element ANY
 * @param {angular.Module} ngApp an optional application
 *   {@link angular.module module} name to load.
 * @param {boolean=} ngStrictDi if this attribute is present on the app element, the injector will be
 *   created in "strict-di" mode. This means that the application will fail to invoke functions which
 *   do not use explicit function annotation (and are thus unsuitable for minification), as described
 *   in {@link guide/di the Dependency Injection guide}, and useful debugging info will assist in
 *   tracking down the root of these bugs.
 *
 * @description
 *
 * Use this directive to **auto-bootstrap** an AngularJS application. The `ngApp` directive
 * designates the **root element** of the application and is typically placed near the root element
 * of the page - e.g. on the `<body>` or `<html>` tags.
 *
 * There are a few things to keep in mind when using `ngApp`:
 * - only one AngularJS application can be auto-bootstrapped per HTML document. The first `ngApp`
 *   found in the document will be used to define the root element to auto-bootstrap as an
 *   application. To run multiple applications in an HTML document you must manually bootstrap them using
 *   {@link angular.bootstrap} instead.
 * - AngularJS applications cannot be nested within each other.
 * - Do not use a directive that uses {@link ng.$compile#transclusion transclusion} on the same element as `ngApp`.
 *   This includes directives such as {@link ng.ngIf `ngIf`}, {@link ng.ngInclude `ngInclude`} and
 *   {@link ngRoute.ngView `ngView`}.
 *   Doing this misplaces the app {@link ng.$rootElement `$rootElement`} and the app's {@link auto.$injector injector},
 *   causing animations to stop working and making the injector inaccessible from outside the app.
 *
 * You can specify an **AngularJS module** to be used as the root module for the application.  This
 * module will be loaded into the {@link auto.$injector} when the application is bootstrapped. It
 * should contain the application code needed or have dependencies on other modules that will
 * contain the code. See {@link angular.module} for more information.
 *
 * In the example below if the `ngApp` directive were not placed on the `html` element then the
 * document would not be compiled, the `AppController` would not be instantiated and the `{{ a+b }}`
 * would not be resolved to `3`.
 *
 * `ngApp` is the easiest, and most common way to bootstrap an application.
 *
 <example module="ngAppDemo" name="ng-app">
   <file name="index.html">
   <div ng-controller="ngAppDemoController">
     I can add: {{a}} + {{b}} =  {{ a+b }}
   </div>
   </file>
   <file name="script.js">
   angular.module('ngAppDemo', []).controller('ngAppDemoController', function($scope) {
     $scope.a = 1;
     $scope.b = 2;
   });
   </file>
 </example>
 *
 * Using `ngStrictDi`, you would see something like this:
 *
 <example ng-app-included="true" name="strict-di">
   <file name="index.html">
   <div ng-app="ngAppStrictDemo" ng-strict-di>
       <div ng-controller="GoodController1">
           I can add: {{a}} + {{b}} =  {{ a+b }}

           <p>This renders because the controller does not fail to
              instantiate, by using explicit annotation style (see
              script.js for details)
           </p>
       </div>

       <div ng-controller="GoodController2">
           Name: <input ng-model="name"><br />
           Hello, {{name}}!

           <p>This renders because the controller does not fail to
              instantiate, by using explicit annotation style
              (see script.js for details)
           </p>
       </div>

       <div ng-controller="BadController">
           I can add: {{a}} + {{b}} =  {{ a+b }}

           <p>The controller could not be instantiated, due to relying
              on automatic function annotations (which are disabled in
              strict mode). As such, the content of this section is not
              interpolated, and there should be an error in your web console.
           </p>
       </div>
   </div>
   </file>
   <file name="script.js">
   angular.module('ngAppStrictDemo', [])
     // BadController will fail to instantiate, due to relying on automatic function annotation,
     // rather than an explicit annotation
     .controller('BadController', function($scope) {
       $scope.a = 1;
       $scope.b = 2;
     })
     // Unlike BadController, GoodController1 and GoodController2 will not fail to be instantiated,
     // due to using explicit annotations using the array style and $inject property, respectively.
     .controller('GoodController1', ['$scope', function($scope) {
       $scope.a = 1;
       $scope.b = 2;
     }])
     .controller('GoodController2', GoodController2);
     function GoodController2($scope) {
       $scope.name = 'World';
     }
     GoodController2.$inject = ['$scope'];
   </file>
   <file name="style.css">
   div[ng-controller] {
       margin-bottom: 1em;
       -webkit-border-radius: 4px;
       border-radius: 4px;
       border: 1px solid;
       padding: .5em;
   }
   div[ng-controller^=Good] {
       border-color: #d6e9c6;
       background-color: #dff0d8;
       color: #3c763d;
   }
   div[ng-controller^=Bad] {
       border-color: #ebccd1;
       background-color: #f2dede;
       color: #a94442;
       margin-bottom: 0;
   }
   </file>
 </example>
 */
function angularInit(element,bootstrap){var appElement,module,config={};if(
// The element `element` has priority over any other element.
forEach(ngAttrPrefixes,function(prefix){var name=prefix+"app";!appElement&&element.hasAttribute&&element.hasAttribute(name)&&(appElement=element,module=element.getAttribute(name))}),forEach(ngAttrPrefixes,function(prefix){var candidate,name=prefix+"app";!appElement&&(candidate=element.querySelector("["+name.replace(":","\\:")+"]"))&&(appElement=candidate,module=candidate.getAttribute(name))}),appElement){if(!isAutoBootstrapAllowed)return void window.console.error("Angular: disabling automatic bootstrap. <script> protocol indicates an extension, document.location.href does not match.");config.strictDi=null!==getNgAttribute(appElement,"strict-di"),bootstrap(appElement,module?[module]:[],config)}}/**
 * @ngdoc function
 * @name angular.bootstrap
 * @module ng
 * @description
 * Use this function to manually start up angular application.
 *
 * For more information, see the {@link guide/bootstrap Bootstrap guide}.
 *
 * Angular will detect if it has been loaded into the browser more than once and only allow the
 * first loaded script to be bootstrapped and will report a warning to the browser console for
 * each of the subsequent scripts. This prevents strange results in applications, where otherwise
 * multiple instances of Angular try to work on the DOM.
 *
 * <div class="alert alert-warning">
 * **Note:** Protractor based end-to-end tests cannot use this function to bootstrap manually.
 * They must use {@link ng.directive:ngApp ngApp}.
 * </div>
 *
 * <div class="alert alert-warning">
 * **Note:** Do not bootstrap the app on an element with a directive that uses {@link ng.$compile#transclusion transclusion},
 * such as {@link ng.ngIf `ngIf`}, {@link ng.ngInclude `ngInclude`} and {@link ngRoute.ngView `ngView`}.
 * Doing this misplaces the app {@link ng.$rootElement `$rootElement`} and the app's {@link auto.$injector injector},
 * causing animations to stop working and making the injector inaccessible from outside the app.
 * </div>
 *
 * ```html
 * <!doctype html>
 * <html>
 * <body>
 * <div ng-controller="WelcomeController">
 *   {{greeting}}
 * </div>
 *
 * <script src="angular.js"></script>
 * <script>
 *   var app = angular.module('demo', [])
 *   .controller('WelcomeController', function($scope) {
 *       $scope.greeting = 'Welcome!';
 *   });
 *   angular.bootstrap(document, ['demo']);
 * </script>
 * </body>
 * </html>
 * ```
 *
 * @param {DOMElement} element DOM element which is the root of angular application.
 * @param {Array<String|Function|Array>=} modules an array of modules to load into the application.
 *     Each item in the array should be the name of a predefined module or a (DI annotated)
 *     function that will be invoked by the injector as a `config` block.
 *     See: {@link angular.module modules}
 * @param {Object=} config an object for defining configuration options for the application. The
 *     following keys are supported:
 *
 * * `strictDi` - disable automatic function annotation for the application. This is meant to
 *   assist in finding bugs which break minified code. Defaults to `false`.
 *
 * @returns {auto.$injector} Returns the newly created injector for this app.
 */
function bootstrap(element,modules,config){isObject(config)||(config={});var defaultConfig={strictDi:!1};config=extend(defaultConfig,config);var doBootstrap=function(){if(element=jqLite(element),element.injector()){var tag=element[0]===window.document?"document":startingTag(element);
// Encode angle brackets to prevent input from being sanitized to empty string #8683.
throw ngMinErr("btstrpd","App already bootstrapped with this element '{0}'",tag.replace(/</,"&lt;").replace(/>/,"&gt;"))}modules=modules||[],modules.unshift(["$provide",function($provide){$provide.value("$rootElement",element)}]),config.debugInfoEnabled&&
// Pushing so that this overrides `debugInfoEnabled` setting defined in user's `modules`.
modules.push(["$compileProvider",function($compileProvider){$compileProvider.debugInfoEnabled(!0)}]),modules.unshift("ng");var injector=createInjector(modules,config.strictDi);return injector.invoke(["$rootScope","$rootElement","$compile","$injector",function(scope,element,compile,injector){scope.$apply(function(){element.data("$injector",injector),compile(element)(scope)})}]),injector},NG_ENABLE_DEBUG_INFO=/^NG_ENABLE_DEBUG_INFO!/,NG_DEFER_BOOTSTRAP=/^NG_DEFER_BOOTSTRAP!/;return window&&NG_ENABLE_DEBUG_INFO.test(window.name)&&(config.debugInfoEnabled=!0,window.name=window.name.replace(NG_ENABLE_DEBUG_INFO,"")),window&&!NG_DEFER_BOOTSTRAP.test(window.name)?doBootstrap():(window.name=window.name.replace(NG_DEFER_BOOTSTRAP,""),angular.resumeBootstrap=function(extraModules){return forEach(extraModules,function(module){modules.push(module)}),doBootstrap()},void(isFunction(angular.resumeDeferredBootstrap)&&angular.resumeDeferredBootstrap()))}/**
 * @ngdoc function
 * @name angular.reloadWithDebugInfo
 * @module ng
 * @description
 * Use this function to reload the current application with debug information turned on.
 * This takes precedence over a call to `$compileProvider.debugInfoEnabled(false)`.
 *
 * See {@link ng.$compileProvider#debugInfoEnabled} for more.
 */
function reloadWithDebugInfo(){window.name="NG_ENABLE_DEBUG_INFO!"+window.name,window.location.reload()}/**
 * @name angular.getTestability
 * @module ng
 * @description
 * Get the testability service for the instance of Angular on the given
 * element.
 * @param {DOMElement} element DOM element which is the root of angular application.
 */
function getTestability(rootElement){var injector=angular.element(rootElement).injector();if(!injector)throw ngMinErr("test","no injector found for element argument to getTestability");return injector.get("$$testability")}function snake_case(name,separator){return separator=separator||"_",name.replace(SNAKE_CASE_REGEXP,function(letter,pos){return(pos?separator:"")+letter.toLowerCase()})}function bindJQuery(){var originalCleanData;if(!bindJQueryFired){
// bind to jQuery if present;
var jqName=jq();jQuery=isUndefined(jqName)?window.jQuery:// use jQuery (if present)
jqName?// use jqLite
window[jqName]:void 0,// use jQuery specified by `ngJq`
// Use jQuery if it exists with proper functionality, otherwise default to us.
// Angular 1.2+ requires jQuery 1.7+ for on()/off() support.
// Angular 1.3+ technically requires at least jQuery 2.1+ but it may work with older
// versions. It will not work for sure with jQuery <1.7, though.
jQuery&&jQuery.fn.on?(jqLite=jQuery,extend(jQuery.fn,{scope:JQLitePrototype.scope,isolateScope:JQLitePrototype.isolateScope,controller:/** @type {?} */JQLitePrototype.controller,injector:JQLitePrototype.injector,inheritedData:JQLitePrototype.inheritedData}),
// All nodes removed from the DOM via various jQuery APIs like .remove()
// are passed through jQuery.cleanData. Monkey-patch this method to fire
// the $destroy event on all removed nodes.
originalCleanData=jQuery.cleanData,jQuery.cleanData=function(elems){for(var events,elem,i=0;null!=(elem=elems[i]);i++)events=jQuery._data(elem,"events"),events&&events.$destroy&&jQuery(elem).triggerHandler("$destroy");originalCleanData(elems)}):jqLite=JQLite,angular.element=jqLite,
// Prevent double-proxying.
bindJQueryFired=!0}}/**
 * throw error if the argument is falsy.
 */
function assertArg(arg,name,reason){if(!arg)throw ngMinErr("areq","Argument '{0}' is {1}",name||"?",reason||"required");return arg}function assertArgFn(arg,name,acceptArrayAnnotation){return acceptArrayAnnotation&&isArray(arg)&&(arg=arg[arg.length-1]),assertArg(isFunction(arg),name,"not a function, got "+(arg&&"object"==typeof arg?arg.constructor.name||"Object":typeof arg)),arg}/**
 * throw error if the name given is hasOwnProperty
 * @param  {String} name    the name to test
 * @param  {String} context the context in which the name is used, such as module or directive
 */
function assertNotHasOwnProperty(name,context){if("hasOwnProperty"===name)throw ngMinErr("badname","hasOwnProperty is not a valid {0} name",context)}/**
 * Return the value accessible from the object by path. Any undefined traversals are ignored
 * @param {Object} obj starting object
 * @param {String} path path to traverse
 * @param {boolean} [bindFnToScope=true]
 * @returns {Object} value as accessible by path
 */
//TODO(misko): this function needs to be removed
function getter(obj,path,bindFnToScope){if(!path)return obj;for(var key,keys=path.split("."),lastInstance=obj,len=keys.length,i=0;i<len;i++)key=keys[i],obj&&(obj=(lastInstance=obj)[key]);return!bindFnToScope&&isFunction(obj)?bind(lastInstance,obj):obj}/**
 * Return the DOM siblings between the first and last node in the given array.
 * @param {Array} array like object
 * @returns {Array} the inputted object or a jqLite collection containing the nodes
 */
function getBlockNodes(nodes){for(var blockNodes,node=nodes[0],endNode=nodes[nodes.length-1],i=1;node!==endNode&&(node=node.nextSibling);i++)(blockNodes||nodes[i]!==node)&&(blockNodes||(blockNodes=jqLite(slice.call(nodes,0,i))),blockNodes.push(node));return blockNodes||nodes}/**
 * Creates a new object without a prototype. This object is useful for lookup without having to
 * guard against prototypically inherited properties via hasOwnProperty.
 *
 * Related micro-benchmarks:
 * - http://jsperf.com/object-create2
 * - http://jsperf.com/proto-map-lookup/2
 * - http://jsperf.com/for-in-vs-object-keys2
 *
 * @returns {Object}
 */
function createMap(){return Object.create(null)}function stringify(value){if(null==value)// null || undefined
return"";switch(typeof value){case"string":break;case"number":value=""+value;break;default:value=!hasCustomToString(value)||isArray(value)||isDate(value)?toJson(value):value.toString()}return value}/**
 * @ngdoc type
 * @name angular.Module
 * @module ng
 * @description
 *
 * Interface for configuring angular {@link angular.module modules}.
 */
function setupModuleLoader(window){function ensure(obj,name,factory){return obj[name]||(obj[name]=factory())}var $injectorMinErr=minErr("$injector"),ngMinErr=minErr("ng"),angular=ensure(window,"angular",Object);
// We need to expose `angular.$$minErr` to modules such as `ngResource` that reference it during bootstrap
return angular.$$minErr=angular.$$minErr||minErr,ensure(angular,"module",function(){/** @type {Object.<string, angular.Module>} */
var modules={};/**
     * @ngdoc function
     * @name angular.module
     * @module ng
     * @description
     *
     * The `angular.module` is a global place for creating, registering and retrieving Angular
     * modules.
     * All modules (angular core or 3rd party) that should be available to an application must be
     * registered using this mechanism.
     *
     * Passing one argument retrieves an existing {@link angular.Module},
     * whereas passing more than one argument creates a new {@link angular.Module}
     *
     *
     * # Module
     *
     * A module is a collection of services, directives, controllers, filters, and configuration information.
     * `angular.module` is used to configure the {@link auto.$injector $injector}.
     *
     * ```js
     * // Create a new module
     * var myModule = angular.module('myModule', []);
     *
     * // register a new service
     * myModule.value('appName', 'MyCoolApp');
     *
     * // configure existing services inside initialization blocks.
     * myModule.config(['$locationProvider', function($locationProvider) {
     *   // Configure existing providers
     *   $locationProvider.hashPrefix('!');
     * }]);
     * ```
     *
     * Then you can create an injector and load your modules like this:
     *
     * ```js
     * var injector = angular.injector(['ng', 'myModule'])
     * ```
     *
     * However it's more likely that you'll just use
     * {@link ng.directive:ngApp ngApp} or
     * {@link angular.bootstrap} to simplify this process for you.
     *
     * @param {!string} name The name of the module to create or retrieve.
     * @param {!Array.<string>=} requires If specified then new module is being created. If
     *        unspecified then the module is being retrieved for further configuration.
     * @param {Function=} configFn Optional configuration function for the module. Same as
     *        {@link angular.Module#config Module#config()}.
     * @returns {angular.Module} new module with the {@link angular.Module} api.
     */
return function(name,requires,configFn){var info={},assertNotHasOwnProperty=function(name,context){if("hasOwnProperty"===name)throw ngMinErr("badname","hasOwnProperty is not a valid {0} name",context)};return assertNotHasOwnProperty(name,"module"),requires&&modules.hasOwnProperty(name)&&(modules[name]=null),ensure(modules,name,function(){/**
         * @param {string} provider
         * @param {string} method
         * @param {String=} insertMethod
         * @returns {angular.Module}
         */
function invokeLater(provider,method,insertMethod,queue){return queue||(queue=invokeQueue),function(){return queue[insertMethod||"push"]([provider,method,arguments]),moduleInstance}}/**
         * @param {string} provider
         * @param {string} method
         * @returns {angular.Module}
         */
function invokeLaterAndSetModuleName(provider,method,queue){return queue||(queue=invokeQueue),function(recipeName,factoryFunction){return factoryFunction&&isFunction(factoryFunction)&&(factoryFunction.$$moduleName=name),queue.push([provider,method,arguments]),moduleInstance}}if(!requires)throw $injectorMinErr("nomod","Module '{0}' is not available! You either misspelled the module name or forgot to load it. If registering a module ensure that you specify the dependencies as the second argument.",name);/** @type {!Array.<Array.<*>>} */
var invokeQueue=[],configBlocks=[],runBlocks=[],config=invokeLater("$injector","invoke","push",configBlocks),moduleInstance={
// Private state
_invokeQueue:invokeQueue,_configBlocks:configBlocks,_runBlocks:runBlocks,/**
           * @ngdoc method
           * @name angular.Module#info
           * @module ng
           *
           * @param {Object=} info Information about the module
           * @returns {Object|Module} The current info object for this module if called as a getter,
           *                          or `this` if called as a setter.
           *
           * @description
           * Read and write custom information about this module.
           * For example you could put the version of the module in here.
           *
           * ```js
           * angular.module('myModule', []).info({ version: '1.0.0' });
           * ```
           *
           * The version could then be read back out by accessing the module elsewhere:
           *
           * ```
           * var version = angular.module('myModule').info().version;
           * ```
           *
           * You can also retrieve this information during runtime via the
           * {@link $injector#modules `$injector.modules`} property:
           *
           * ```js
           * var version = $injector.modules['myModule'].info().version;
           * ```
           */
info:function(value){if(isDefined(value)){if(!isObject(value))throw ngMinErr("aobj","Argument '{0}' must be an object","value");return info=value,this}return info},/**
           * @ngdoc property
           * @name angular.Module#requires
           * @module ng
           *
           * @description
           * Holds the list of modules which the injector will load before the current module is
           * loaded.
           */
requires:requires,/**
           * @ngdoc property
           * @name angular.Module#name
           * @module ng
           *
           * @description
           * Name of the module.
           */
name:name,/**
           * @ngdoc method
           * @name angular.Module#provider
           * @module ng
           * @param {string} name service name
           * @param {Function} providerType Construction function for creating new instance of the
           *                                service.
           * @description
           * See {@link auto.$provide#provider $provide.provider()}.
           */
provider:invokeLaterAndSetModuleName("$provide","provider"),/**
           * @ngdoc method
           * @name angular.Module#factory
           * @module ng
           * @param {string} name service name
           * @param {Function} providerFunction Function for creating new instance of the service.
           * @description
           * See {@link auto.$provide#factory $provide.factory()}.
           */
factory:invokeLaterAndSetModuleName("$provide","factory"),/**
           * @ngdoc method
           * @name angular.Module#service
           * @module ng
           * @param {string} name service name
           * @param {Function} constructor A constructor function that will be instantiated.
           * @description
           * See {@link auto.$provide#service $provide.service()}.
           */
service:invokeLaterAndSetModuleName("$provide","service"),/**
           * @ngdoc method
           * @name angular.Module#value
           * @module ng
           * @param {string} name service name
           * @param {*} object Service instance object.
           * @description
           * See {@link auto.$provide#value $provide.value()}.
           */
value:invokeLater("$provide","value"),/**
           * @ngdoc method
           * @name angular.Module#constant
           * @module ng
           * @param {string} name constant name
           * @param {*} object Constant value.
           * @description
           * Because the constants are fixed, they get applied before other provide methods.
           * See {@link auto.$provide#constant $provide.constant()}.
           */
constant:invokeLater("$provide","constant","unshift"),/**
           * @ngdoc method
           * @name angular.Module#decorator
           * @module ng
           * @param {string} name The name of the service to decorate.
           * @param {Function} decorFn This function will be invoked when the service needs to be
           *                           instantiated and should return the decorated service instance.
           * @description
           * See {@link auto.$provide#decorator $provide.decorator()}.
           */
decorator:invokeLaterAndSetModuleName("$provide","decorator",configBlocks),/**
           * @ngdoc method
           * @name angular.Module#animation
           * @module ng
           * @param {string} name animation name
           * @param {Function} animationFactory Factory function for creating new instance of an
           *                                    animation.
           * @description
           *
           * **NOTE**: animations take effect only if the **ngAnimate** module is loaded.
           *
           *
           * Defines an animation hook that can be later used with
           * {@link $animate $animate} service and directives that use this service.
           *
           * ```js
           * module.animation('.animation-name', function($inject1, $inject2) {
           *   return {
           *     eventName : function(element, done) {
           *       //code to run the animation
           *       //once complete, then run done()
           *       return function cancellationFunction(element) {
           *         //code to cancel the animation
           *       }
           *     }
           *   }
           * })
           * ```
           *
           * See {@link ng.$animateProvider#register $animateProvider.register()} and
           * {@link ngAnimate ngAnimate module} for more information.
           */
animation:invokeLaterAndSetModuleName("$animateProvider","register"),/**
           * @ngdoc method
           * @name angular.Module#filter
           * @module ng
           * @param {string} name Filter name - this must be a valid angular expression identifier
           * @param {Function} filterFactory Factory function for creating new instance of filter.
           * @description
           * See {@link ng.$filterProvider#register $filterProvider.register()}.
           *
           * <div class="alert alert-warning">
           * **Note:** Filter names must be valid angular {@link expression} identifiers, such as `uppercase` or `orderBy`.
           * Names with special characters, such as hyphens and dots, are not allowed. If you wish to namespace
           * your filters, then you can use capitalization (`myappSubsectionFilterx`) or underscores
           * (`myapp_subsection_filterx`).
           * </div>
           */
filter:invokeLaterAndSetModuleName("$filterProvider","register"),/**
           * @ngdoc method
           * @name angular.Module#controller
           * @module ng
           * @param {string|Object} name Controller name, or an object map of controllers where the
           *    keys are the names and the values are the constructors.
           * @param {Function} constructor Controller constructor function.
           * @description
           * See {@link ng.$controllerProvider#register $controllerProvider.register()}.
           */
controller:invokeLaterAndSetModuleName("$controllerProvider","register"),/**
           * @ngdoc method
           * @name angular.Module#directive
           * @module ng
           * @param {string|Object} name Directive name, or an object map of directives where the
           *    keys are the names and the values are the factories.
           * @param {Function} directiveFactory Factory function for creating new instance of
           * directives.
           * @description
           * See {@link ng.$compileProvider#directive $compileProvider.directive()}.
           */
directive:invokeLaterAndSetModuleName("$compileProvider","directive"),/**
           * @ngdoc method
           * @name angular.Module#component
           * @module ng
           * @param {string} name Name of the component in camel-case (i.e. myComp which will match as my-comp)
           * @param {Object} options Component definition object (a simplified
           *    {@link ng.$compile#directive-definition-object directive definition object})
           *
           * @description
           * See {@link ng.$compileProvider#component $compileProvider.component()}.
           */
component:invokeLaterAndSetModuleName("$compileProvider","component"),/**
           * @ngdoc method
           * @name angular.Module#config
           * @module ng
           * @param {Function} configFn Execute this function on module load. Useful for service
           *    configuration.
           * @description
           * Use this method to register work which needs to be performed on module loading.
           * For more about how to configure services, see
           * {@link providers#provider-recipe Provider Recipe}.
           */
config:config,/**
           * @ngdoc method
           * @name angular.Module#run
           * @module ng
           * @param {Function} initializationFn Execute this function after injector creation.
           *    Useful for application initialization.
           * @description
           * Use this method to register work which should be performed when the injector is done
           * loading all modules.
           */
run:function(block){return runBlocks.push(block),this}};return configFn&&config(configFn),moduleInstance})}})}/* global shallowCopy: true */
/**
 * Creates a shallow copy of an object, an array or a primitive.
 *
 * Assumes that there are no proto properties for objects.
 */
function shallowCopy(src,dst){if(isArray(src)){dst=dst||[];for(var i=0,ii=src.length;i<ii;i++)dst[i]=src[i]}else if(isObject(src)){dst=dst||{};for(var key in src)"$"===key.charAt(0)&&"$"===key.charAt(1)||(dst[key]=src[key])}return dst||src}/* global toDebugString: true */
function serializeObject(obj,maxDepth){var seen=[];
// There is no direct way to stringify object until reaching a specific depth
// and a very deep object can cause a performance issue, so we copy the object
// based on this specific depth and then stringify it.
return isValidObjectMaxDepth(maxDepth)&&(obj=copy(obj,null,maxDepth)),JSON.stringify(obj,function(key,val){if(val=toJsonReplacer(key,val),isObject(val)){if(seen.indexOf(val)>=0)return"...";seen.push(val)}return val})}function toDebugString(obj,maxDepth){return"function"==typeof obj?obj.toString().replace(/ \{[\s\S]*$/,""):isUndefined(obj)?"undefined":"string"!=typeof obj?serializeObject(obj,maxDepth):obj}function publishExternalAPI(angular){extend(angular,{errorHandlingConfig:errorHandlingConfig,bootstrap:bootstrap,copy:copy,extend:extend,merge:merge,equals:equals,element:jqLite,forEach:forEach,injector:createInjector,noop:noop,bind:bind,toJson:toJson,fromJson:fromJson,identity:identity,isUndefined:isUndefined,isDefined:isDefined,isString:isString,isFunction:isFunction,isObject:isObject,isNumber:isNumber,isElement:isElement,isArray:isArray,version:version,isDate:isDate,lowercase:lowercase,uppercase:uppercase,callbacks:{$$counter:0},getTestability:getTestability,reloadWithDebugInfo:reloadWithDebugInfo,$$minErr:minErr,$$csp:csp,$$encodeUriSegment:encodeUriSegment,$$encodeUriQuery:encodeUriQuery,$$stringify:stringify}),angularModule=setupModuleLoader(window),angularModule("ng",["ngLocale"],["$provide",function($provide){
// $$sanitizeUriProvider needs to be before $compileProvider as it is used by it.
$provide.provider({$$sanitizeUri:$$SanitizeUriProvider}),$provide.provider("$compile",$CompileProvider).directive({a:htmlAnchorDirective,input:inputDirective,textarea:inputDirective,form:formDirective,script:scriptDirective,select:selectDirective,option:optionDirective,ngBind:ngBindDirective,ngBindHtml:ngBindHtmlDirective,ngBindTemplate:ngBindTemplateDirective,ngClass:ngClassDirective,ngClassEven:ngClassEvenDirective,ngClassOdd:ngClassOddDirective,ngCloak:ngCloakDirective,ngController:ngControllerDirective,ngForm:ngFormDirective,ngHide:ngHideDirective,ngIf:ngIfDirective,ngInclude:ngIncludeDirective,ngInit:ngInitDirective,ngNonBindable:ngNonBindableDirective,ngPluralize:ngPluralizeDirective,ngRepeat:ngRepeatDirective,ngShow:ngShowDirective,ngStyle:ngStyleDirective,ngSwitch:ngSwitchDirective,ngSwitchWhen:ngSwitchWhenDirective,ngSwitchDefault:ngSwitchDefaultDirective,ngOptions:ngOptionsDirective,ngTransclude:ngTranscludeDirective,ngModel:ngModelDirective,ngList:ngListDirective,ngChange:ngChangeDirective,pattern:patternDirective,ngPattern:patternDirective,required:requiredDirective,ngRequired:requiredDirective,minlength:minlengthDirective,ngMinlength:minlengthDirective,maxlength:maxlengthDirective,ngMaxlength:maxlengthDirective,ngValue:ngValueDirective,ngModelOptions:ngModelOptionsDirective}).directive({ngInclude:ngIncludeFillContentDirective}).directive(ngAttributeAliasDirectives).directive(ngEventDirectives),$provide.provider({$anchorScroll:$AnchorScrollProvider,$animate:$AnimateProvider,$animateCss:$CoreAnimateCssProvider,$$animateJs:$$CoreAnimateJsProvider,$$animateQueue:$$CoreAnimateQueueProvider,$$AnimateRunner:$$AnimateRunnerFactoryProvider,$$animateAsyncRun:$$AnimateAsyncRunFactoryProvider,$browser:$BrowserProvider,$cacheFactory:$CacheFactoryProvider,$controller:$ControllerProvider,$document:$DocumentProvider,$$isDocumentHidden:$$IsDocumentHiddenProvider,$exceptionHandler:$ExceptionHandlerProvider,$filter:$FilterProvider,$$forceReflow:$$ForceReflowProvider,$interpolate:$InterpolateProvider,$interval:$IntervalProvider,$http:$HttpProvider,$httpParamSerializer:$HttpParamSerializerProvider,$httpParamSerializerJQLike:$HttpParamSerializerJQLikeProvider,$httpBackend:$HttpBackendProvider,$xhrFactory:$xhrFactoryProvider,$jsonpCallbacks:$jsonpCallbacksProvider,$location:$LocationProvider,$log:$LogProvider,$parse:$ParseProvider,$rootScope:$RootScopeProvider,$q:$QProvider,$$q:$$QProvider,$sce:$SceProvider,$sceDelegate:$SceDelegateProvider,$sniffer:$SnifferProvider,$templateCache:$TemplateCacheProvider,$templateRequest:$TemplateRequestProvider,$$testability:$$TestabilityProvider,$timeout:$TimeoutProvider,$window:$WindowProvider,$$rAF:$$RAFProvider,$$jqLite:$$jqLiteProvider,$$Map:$$MapProvider,$$cookieReader:$$CookieReaderProvider})}]).info({angularVersion:"1.6.4"})}function jqNextId(){return++jqId}/**
 * Converts kebab-case to camelCase.
 * There is also a special case for the ms prefix starting with a lowercase letter.
 * @param name Name to normalize
 */
function cssKebabToCamel(name){return kebabToCamel(name.replace(MS_HACK_REGEXP,"ms-"))}function fnCamelCaseReplace(all,letter){return letter.toUpperCase()}/**
 * Converts kebab-case to camelCase.
 * @param name Name to normalize
 */
function kebabToCamel(name){return name.replace(DASH_LOWERCASE_REGEXP,fnCamelCaseReplace)}function jqLiteIsTextNode(html){return!HTML_REGEXP.test(html)}function jqLiteAcceptsData(node){
// The window object can accept data but has no nodeType
// Otherwise we are only interested in elements (1) and documents (9)
var nodeType=node.nodeType;return nodeType===NODE_TYPE_ELEMENT||!nodeType||nodeType===NODE_TYPE_DOCUMENT}function jqLiteHasData(node){for(var key in jqCache[node.ng339])return!0;return!1}function jqLiteBuildFragment(html,context){var tmp,tag,wrap,i,fragment=context.createDocumentFragment(),nodes=[];if(jqLiteIsTextNode(html))
// Convert non-html into a text node
nodes.push(context.createTextNode(html));else{for(
// Convert html into DOM nodes
tmp=fragment.appendChild(context.createElement("div")),tag=(TAG_NAME_REGEXP.exec(html)||["",""])[1].toLowerCase(),wrap=wrapMap[tag]||wrapMap._default,tmp.innerHTML=wrap[1]+html.replace(XHTML_TAG_REGEXP,"<$1></$2>")+wrap[2],
// Descend through wrappers to the right content
i=wrap[0];i--;)tmp=tmp.lastChild;nodes=concat(nodes,tmp.childNodes),tmp=fragment.firstChild,tmp.textContent=""}
// Remove wrapper from fragment
// Clear inner HTML
return fragment.textContent="",fragment.innerHTML="",forEach(nodes,function(node){fragment.appendChild(node)}),fragment}function jqLiteParseHTML(html,context){context=context||window.document;var parsed;return(parsed=SINGLE_TAG_REGEXP.exec(html))?[context.createElement(parsed[1])]:(parsed=jqLiteBuildFragment(html,context))?parsed.childNodes:[]}function jqLiteWrapNode(node,wrapper){var parent=node.parentNode;parent&&parent.replaceChild(wrapper,node),wrapper.appendChild(node)}
/////////////////////////////////////////////
function JQLite(element){if(element instanceof JQLite)return element;var argIsString;if(isString(element)&&(element=trim(element),argIsString=!0),!(this instanceof JQLite)){if(argIsString&&"<"!==element.charAt(0))throw jqLiteMinErr("nosel","Looking up elements via selectors is not supported by jqLite! See: http://docs.angularjs.org/api/angular.element");return new JQLite(element)}argIsString?jqLiteAddNodes(this,jqLiteParseHTML(element)):isFunction(element)?jqLiteReady(element):jqLiteAddNodes(this,element)}function jqLiteClone(element){return element.cloneNode(!0)}function jqLiteDealoc(element,onlyDescendants){!onlyDescendants&&jqLiteAcceptsData(element)&&jqLite.cleanData([element]),element.querySelectorAll&&jqLite.cleanData(element.querySelectorAll("*"))}function jqLiteOff(element,type,fn,unsupported){if(isDefined(unsupported))throw jqLiteMinErr("offargs","jqLite#off() does not support the `selector` argument");var expandoStore=jqLiteExpandoStore(element),events=expandoStore&&expandoStore.events,handle=expandoStore&&expandoStore.handle;if(handle)//no listeners registered
if(type){var removeHandler=function(type){var listenerFns=events[type];isDefined(fn)&&arrayRemove(listenerFns||[],fn),isDefined(fn)&&listenerFns&&listenerFns.length>0||(element.removeEventListener(type,handle),delete events[type])};forEach(type.split(" "),function(type){removeHandler(type),MOUSE_EVENT_MAP[type]&&removeHandler(MOUSE_EVENT_MAP[type])})}else for(type in events)"$destroy"!==type&&element.removeEventListener(type,handle),delete events[type]}function jqLiteRemoveData(element,name){var expandoId=element.ng339,expandoStore=expandoId&&jqCache[expandoId];if(expandoStore){if(name)return void delete expandoStore.data[name];expandoStore.handle&&(expandoStore.events.$destroy&&expandoStore.handle({},"$destroy"),jqLiteOff(element)),delete jqCache[expandoId],element.ng339=void 0}}function jqLiteExpandoStore(element,createIfNecessary){var expandoId=element.ng339,expandoStore=expandoId&&jqCache[expandoId];return createIfNecessary&&!expandoStore&&(element.ng339=expandoId=jqNextId(),expandoStore=jqCache[expandoId]={events:{},data:{},handle:void 0}),expandoStore}function jqLiteData(element,key,value){if(jqLiteAcceptsData(element)){var prop,isSimpleSetter=isDefined(value),isSimpleGetter=!isSimpleSetter&&key&&!isObject(key),massGetter=!key,expandoStore=jqLiteExpandoStore(element,!isSimpleGetter),data=expandoStore&&expandoStore.data;if(isSimpleSetter)// data('key', value)
data[kebabToCamel(key)]=value;else{if(massGetter)// data()
return data;if(isSimpleGetter)// data('key')
// don't force creation of expandoStore if it doesn't exist yet
return data&&data[kebabToCamel(key)];// mass-setter: data({key1: val1, key2: val2})
for(prop in key)data[kebabToCamel(prop)]=key[prop]}}}function jqLiteHasClass(element,selector){return!!element.getAttribute&&(" "+(element.getAttribute("class")||"")+" ").replace(/[\n\t]/g," ").indexOf(" "+selector+" ")>-1}function jqLiteRemoveClass(element,cssClasses){cssClasses&&element.setAttribute&&forEach(cssClasses.split(" "),function(cssClass){element.setAttribute("class",trim((" "+(element.getAttribute("class")||"")+" ").replace(/[\n\t]/g," ").replace(" "+trim(cssClass)+" "," ")))})}function jqLiteAddClass(element,cssClasses){if(cssClasses&&element.setAttribute){var existingClasses=(" "+(element.getAttribute("class")||"")+" ").replace(/[\n\t]/g," ");forEach(cssClasses.split(" "),function(cssClass){cssClass=trim(cssClass),existingClasses.indexOf(" "+cssClass+" ")===-1&&(existingClasses+=cssClass+" ")}),element.setAttribute("class",trim(existingClasses))}}function jqLiteAddNodes(root,elements){
// THIS CODE IS VERY HOT. Don't make changes without benchmarking.
if(elements)
// if a Node (the most common case)
if(elements.nodeType)root[root.length++]=elements;else{var length=elements.length;
// if an Array or NodeList and not a Window
if("number"==typeof length&&elements.window!==elements){if(length)for(var i=0;i<length;i++)root[root.length++]=elements[i]}else root[root.length++]=elements}}function jqLiteController(element,name){return jqLiteInheritedData(element,"$"+(name||"ngController")+"Controller")}function jqLiteInheritedData(element,name,value){
// if element is the document object work with the html element instead
// this makes $(document).scope() possible
element.nodeType===NODE_TYPE_DOCUMENT&&(element=element.documentElement);for(var names=isArray(name)?name:[name];element;){for(var i=0,ii=names.length;i<ii;i++)if(isDefined(value=jqLite.data(element,names[i])))return value;
// If dealing with a document fragment node with a host element, and no parent, use the host
// element as the parent. This enables directives within a Shadow DOM or polyfilled Shadow DOM
// to lookup parent controllers.
element=element.parentNode||element.nodeType===NODE_TYPE_DOCUMENT_FRAGMENT&&element.host}}function jqLiteEmpty(element){for(jqLiteDealoc(element,!0);element.firstChild;)element.removeChild(element.firstChild)}function jqLiteRemove(element,keepData){keepData||jqLiteDealoc(element);var parent=element.parentNode;parent&&parent.removeChild(element)}function jqLiteDocumentLoaded(action,win){win=win||window,"complete"===win.document.readyState?
// Force the action to be run async for consistent behavior
// from the action's point of view
// i.e. it will definitely not be in a $apply
win.setTimeout(action):
// No need to unbind this handler as load is only ever called once
jqLite(win).on("load",action)}function jqLiteReady(fn){function trigger(){window.document.removeEventListener("DOMContentLoaded",trigger),window.removeEventListener("load",trigger),fn()}
// check if document is already loaded
"complete"===window.document.readyState?window.setTimeout(fn):(
// We can not use jqLite since we are not done loading and jQuery could be loaded later.
// Works for modern browsers and IE9
window.document.addEventListener("DOMContentLoaded",trigger),
// Fallback to window.onload for others
window.addEventListener("load",trigger))}function getBooleanAttrName(element,name){
// check dom last since we will most likely fail on name
var booleanAttr=BOOLEAN_ATTR[name.toLowerCase()];
// booleanAttr is here twice to minimize DOM access
return booleanAttr&&BOOLEAN_ELEMENTS[nodeName_(element)]&&booleanAttr}function getAliasedAttrName(name){return ALIASED_ATTR[name]}function createEventHandler(element,events){var eventHandler=function(event,type){
// jQuery specific api
event.isDefaultPrevented=function(){return event.defaultPrevented};var eventFns=events[type||event.type],eventFnsLength=eventFns?eventFns.length:0;if(eventFnsLength){if(isUndefined(event.immediatePropagationStopped)){var originalStopImmediatePropagation=event.stopImmediatePropagation;event.stopImmediatePropagation=function(){event.immediatePropagationStopped=!0,event.stopPropagation&&event.stopPropagation(),originalStopImmediatePropagation&&originalStopImmediatePropagation.call(event)}}event.isImmediatePropagationStopped=function(){return event.immediatePropagationStopped===!0};
// Some events have special handlers that wrap the real handler
var handlerWrapper=eventFns.specialHandlerWrapper||defaultHandlerWrapper;
// Copy event handlers in case event handlers array is modified during execution.
eventFnsLength>1&&(eventFns=shallowCopy(eventFns));for(var i=0;i<eventFnsLength;i++)event.isImmediatePropagationStopped()||handlerWrapper(element,event,eventFns[i])}};
// TODO: this is a hack for angularMocks/clearDataCache that makes it possible to deregister all
//       events on `element`
return eventHandler.elem=element,eventHandler}function defaultHandlerWrapper(element,event,handler){handler.call(element,event)}function specialMouseHandlerWrapper(target,event,handler){
// Refer to jQuery's implementation of mouseenter & mouseleave
// Read about mouseenter and mouseleave:
// http://www.quirksmode.org/js/events_mouse.html#link8
var related=event.relatedTarget;
// For mousenter/leave call the handler if related is outside the target.
// NB: No relatedTarget if the mouse left/entered the browser window
related&&(related===target||jqLiteContains.call(target,related))||handler.call(target,event)}
// Provider for private $$jqLite service
/** @this */
function $$jqLiteProvider(){this.$get=function(){return extend(JQLite,{hasClass:function(node,classes){return node.attr&&(node=node[0]),jqLiteHasClass(node,classes)},addClass:function(node,classes){return node.attr&&(node=node[0]),jqLiteAddClass(node,classes)},removeClass:function(node,classes){return node.attr&&(node=node[0]),jqLiteRemoveClass(node,classes)}})}}/**
 * Computes a hash of an 'obj'.
 * Hash of a:
 *  string is string
 *  number is number as string
 *  object is either result of calling $$hashKey function on the object or uniquely generated id,
 *         that is also assigned to the $$hashKey property of the object.
 *
 * @param obj
 * @returns {string} hash string such that the same input will have the same hash string.
 *         The resulting string key is in 'type:hashKey' format.
 */
function hashKey(obj,nextUidFn){var key=obj&&obj.$$hashKey;if(key)return"function"==typeof key&&(key=obj.$$hashKey()),key;var objType=typeof obj;return key="function"===objType||"object"===objType&&null!==obj?obj.$$hashKey=objType+":"+(nextUidFn||nextUid)():objType+":"+obj}function NgMapShim(){this._keys=[],this._values=[],this._lastKey=NaN,this._lastIndex=-1}function stringifyFn(fn){return Function.prototype.toString.call(fn)}function extractArgs(fn){var fnText=stringifyFn(fn).replace(STRIP_COMMENTS,""),args=fnText.match(ARROW_ARG)||fnText.match(FN_ARGS);return args}function anonFn(fn){
// For anonymous functions, showing at the very least the function signature can help in
// debugging.
var args=extractArgs(fn);return args?"function("+(args[1]||"").replace(/[\s\r\n]+/," ")+")":"fn"}function annotate(fn,strictDi,name){var $inject,argDecl,last;if("function"==typeof fn){if(!($inject=fn.$inject)){if($inject=[],fn.length){if(strictDi)throw isString(name)&&name||(name=fn.name||anonFn(fn)),$injectorMinErr("strictdi","{0} is not using explicit annotation and cannot be invoked in strict mode",name);argDecl=extractArgs(fn),forEach(argDecl[1].split(FN_ARG_SPLIT),function(arg){arg.replace(FN_ARG,function(all,underscore,name){$inject.push(name)})})}fn.$inject=$inject}}else isArray(fn)?(last=fn.length-1,assertArgFn(fn[last],"fn"),$inject=fn.slice(0,last)):assertArgFn(fn,"fn",!0);return $inject}
///////////////////////////////////////
/**
 * @ngdoc service
 * @name $injector
 *
 * @description
 *
 * `$injector` is used to retrieve object instances as defined by
 * {@link auto.$provide provider}, instantiate types, invoke methods,
 * and load modules.
 *
 * The following always holds true:
 *
 * ```js
 *   var $injector = angular.injector();
 *   expect($injector.get('$injector')).toBe($injector);
 *   expect($injector.invoke(function($injector) {
 *     return $injector;
 *   })).toBe($injector);
 * ```
 *
 * # Injection Function Annotation
 *
 * JavaScript does not have annotations, and annotations are needed for dependency injection. The
 * following are all valid ways of annotating function with injection arguments and are equivalent.
 *
 * ```js
 *   // inferred (only works if code not minified/obfuscated)
 *   $injector.invoke(function(serviceA){});
 *
 *   // annotated
 *   function explicit(serviceA) {};
 *   explicit.$inject = ['serviceA'];
 *   $injector.invoke(explicit);
 *
 *   // inline
 *   $injector.invoke(['serviceA', function(serviceA){}]);
 * ```
 *
 * ## Inference
 *
 * In JavaScript calling `toString()` on a function returns the function definition. The definition
 * can then be parsed and the function arguments can be extracted. This method of discovering
 * annotations is disallowed when the injector is in strict mode.
 * *NOTE:* This does not work with minification, and obfuscation tools since these tools change the
 * argument names.
 *
 * ## `$inject` Annotation
 * By adding an `$inject` property onto a function the injection parameters can be specified.
 *
 * ## Inline
 * As an array of injection names, where the last item in the array is the function to call.
 */
/**
 * @ngdoc property
 * @name $injector#modules
 * @type {Object}
 * @description
 * A hash containing all the modules that have been loaded into the
 * $injector.
 *
 * You can use this property to find out information about a module via the
 * {@link angular.Module#info `myModule.info(...)`} method.
 *
 * For example:
 *
 * ```
 * var info = $injector.modules['ngAnimate'].info();
 * ```
 *
 * **Do not use this property to attempt to modify the modules after the application
 * has been bootstrapped.**
 */
/**
 * @ngdoc method
 * @name $injector#get
 *
 * @description
 * Return an instance of the service.
 *
 * @param {string} name The name of the instance to retrieve.
 * @param {string=} caller An optional string to provide the origin of the function call for error messages.
 * @return {*} The instance.
 */
/**
 * @ngdoc method
 * @name $injector#invoke
 *
 * @description
 * Invoke the method and supply the method arguments from the `$injector`.
 *
 * @param {Function|Array.<string|Function>} fn The injectable function to invoke. Function parameters are
 *   injected according to the {@link guide/di $inject Annotation} rules.
 * @param {Object=} self The `this` for the invoked method.
 * @param {Object=} locals Optional object. If preset then any argument names are read from this
 *                         object first, before the `$injector` is consulted.
 * @returns {*} the value returned by the invoked `fn` function.
 */
/**
 * @ngdoc method
 * @name $injector#has
 *
 * @description
 * Allows the user to query if the particular service exists.
 *
 * @param {string} name Name of the service to query.
 * @returns {boolean} `true` if injector has given service.
 */
/**
 * @ngdoc method
 * @name $injector#instantiate
 * @description
 * Create a new instance of JS type. The method takes a constructor function, invokes the new
 * operator, and supplies all of the arguments to the constructor function as specified by the
 * constructor annotation.
 *
 * @param {Function} Type Annotated constructor function.
 * @param {Object=} locals Optional object. If preset then any argument names are read from this
 * object first, before the `$injector` is consulted.
 * @returns {Object} new instance of `Type`.
 */
/**
 * @ngdoc method
 * @name $injector#annotate
 *
 * @description
 * Returns an array of service names which the function is requesting for injection. This API is
 * used by the injector to determine which services need to be injected into the function when the
 * function is invoked. There are three ways in which the function can be annotated with the needed
 * dependencies.
 *
 * # Argument names
 *
 * The simplest form is to extract the dependencies from the arguments of the function. This is done
 * by converting the function into a string using `toString()` method and extracting the argument
 * names.
 * ```js
 *   // Given
 *   function MyController($scope, $route) {
 *     // ...
 *   }
 *
 *   // Then
 *   expect(injector.annotate(MyController)).toEqual(['$scope', '$route']);
 * ```
 *
 * You can disallow this method by using strict injection mode.
 *
 * This method does not work with code minification / obfuscation. For this reason the following
 * annotation strategies are supported.
 *
 * # The `$inject` property
 *
 * If a function has an `$inject` property and its value is an array of strings, then the strings
 * represent names of services to be injected into the function.
 * ```js
 *   // Given
 *   var MyController = function(obfuscatedScope, obfuscatedRoute) {
 *     // ...
 *   }
 *   // Define function dependencies
 *   MyController['$inject'] = ['$scope', '$route'];
 *
 *   // Then
 *   expect(injector.annotate(MyController)).toEqual(['$scope', '$route']);
 * ```
 *
 * # The array notation
 *
 * It is often desirable to inline Injected functions and that's when setting the `$inject` property
 * is very inconvenient. In these situations using the array notation to specify the dependencies in
 * a way that survives minification is a better choice:
 *
 * ```js
 *   // We wish to write this (not minification / obfuscation safe)
 *   injector.invoke(function($compile, $rootScope) {
 *     // ...
 *   });
 *
 *   // We are forced to write break inlining
 *   var tmpFn = function(obfuscatedCompile, obfuscatedRootScope) {
 *     // ...
 *   };
 *   tmpFn.$inject = ['$compile', '$rootScope'];
 *   injector.invoke(tmpFn);
 *
 *   // To better support inline function the inline annotation is supported
 *   injector.invoke(['$compile', '$rootScope', function(obfCompile, obfRootScope) {
 *     // ...
 *   }]);
 *
 *   // Therefore
 *   expect(injector.annotate(
 *      ['$compile', '$rootScope', function(obfus_$compile, obfus_$rootScope) {}])
 *    ).toEqual(['$compile', '$rootScope']);
 * ```
 *
 * @param {Function|Array.<string|Function>} fn Function for which dependent service names need to
 * be retrieved as described above.
 *
 * @param {boolean=} [strictDi=false] Disallow argument name annotation inference.
 *
 * @returns {Array.<string>} The names of the services which the function requires.
 */
/**
 * @ngdoc service
 * @name $provide
 *
 * @description
 *
 * The {@link auto.$provide $provide} service has a number of methods for registering components
 * with the {@link auto.$injector $injector}. Many of these functions are also exposed on
 * {@link angular.Module}.
 *
 * An Angular **service** is a singleton object created by a **service factory**.  These **service
 * factories** are functions which, in turn, are created by a **service provider**.
 * The **service providers** are constructor functions. When instantiated they must contain a
 * property called `$get`, which holds the **service factory** function.
 *
 * When you request a service, the {@link auto.$injector $injector} is responsible for finding the
 * correct **service provider**, instantiating it and then calling its `$get` **service factory**
 * function to get the instance of the **service**.
 *
 * Often services have no configuration options and there is no need to add methods to the service
 * provider.  The provider will be no more than a constructor function with a `$get` property. For
 * these cases the {@link auto.$provide $provide} service has additional helper methods to register
 * services without specifying a provider.
 *
 * * {@link auto.$provide#provider provider(name, provider)} - registers a **service provider** with the
 *     {@link auto.$injector $injector}
 * * {@link auto.$provide#constant constant(name, obj)} - registers a value/object that can be accessed by
 *     providers and services.
 * * {@link auto.$provide#value value(name, obj)} - registers a value/object that can only be accessed by
 *     services, not providers.
 * * {@link auto.$provide#factory factory(name, fn)} - registers a service **factory function**
 *     that will be wrapped in a **service provider** object, whose `$get` property will contain the
 *     given factory function.
 * * {@link auto.$provide#service service(name, Fn)} - registers a **constructor function**
 *     that will be wrapped in a **service provider** object, whose `$get` property will instantiate
 *      a new object using the given constructor function.
 * * {@link auto.$provide#decorator decorator(name, decorFn)} - registers a **decorator function** that
 *      will be able to modify or replace the implementation of another service.
 *
 * See the individual methods for more information and examples.
 */
/**
 * @ngdoc method
 * @name $provide#provider
 * @description
 *
 * Register a **provider function** with the {@link auto.$injector $injector}. Provider functions
 * are constructor functions, whose instances are responsible for "providing" a factory for a
 * service.
 *
 * Service provider names start with the name of the service they provide followed by `Provider`.
 * For example, the {@link ng.$log $log} service has a provider called
 * {@link ng.$logProvider $logProvider}.
 *
 * Service provider objects can have additional methods which allow configuration of the provider
 * and its service. Importantly, you can configure what kind of service is created by the `$get`
 * method, or how that service will act. For example, the {@link ng.$logProvider $logProvider} has a
 * method {@link ng.$logProvider#debugEnabled debugEnabled}
 * which lets you specify whether the {@link ng.$log $log} service will log debug messages to the
 * console or not.
 *
 * @param {string} name The name of the instance. NOTE: the provider will be available under `name +
                        'Provider'` key.
 * @param {(Object|function())} provider If the provider is:
 *
 *   - `Object`: then it should have a `$get` method. The `$get` method will be invoked using
 *     {@link auto.$injector#invoke $injector.invoke()} when an instance needs to be created.
 *   - `Constructor`: a new instance of the provider will be created using
 *     {@link auto.$injector#instantiate $injector.instantiate()}, then treated as `object`.
 *
 * @returns {Object} registered provider instance

 * @example
 *
 * The following example shows how to create a simple event tracking service and register it using
 * {@link auto.$provide#provider $provide.provider()}.
 *
 * ```js
 *  // Define the eventTracker provider
 *  function EventTrackerProvider() {
 *    var trackingUrl = '/track';
 *
 *    // A provider method for configuring where the tracked events should been saved
 *    this.setTrackingUrl = function(url) {
 *      trackingUrl = url;
 *    };
 *
 *    // The service factory function
 *    this.$get = ['$http', function($http) {
 *      var trackedEvents = {};
 *      return {
 *        // Call this to track an event
 *        event: function(event) {
 *          var count = trackedEvents[event] || 0;
 *          count += 1;
 *          trackedEvents[event] = count;
 *          return count;
 *        },
 *        // Call this to save the tracked events to the trackingUrl
 *        save: function() {
 *          $http.post(trackingUrl, trackedEvents);
 *        }
 *      };
 *    }];
 *  }
 *
 *  describe('eventTracker', function() {
 *    var postSpy;
 *
 *    beforeEach(module(function($provide) {
 *      // Register the eventTracker provider
 *      $provide.provider('eventTracker', EventTrackerProvider);
 *    }));
 *
 *    beforeEach(module(function(eventTrackerProvider) {
 *      // Configure eventTracker provider
 *      eventTrackerProvider.setTrackingUrl('/custom-track');
 *    }));
 *
 *    it('tracks events', inject(function(eventTracker) {
 *      expect(eventTracker.event('login')).toEqual(1);
 *      expect(eventTracker.event('login')).toEqual(2);
 *    }));
 *
 *    it('saves to the tracking url', inject(function(eventTracker, $http) {
 *      postSpy = spyOn($http, 'post');
 *      eventTracker.event('login');
 *      eventTracker.save();
 *      expect(postSpy).toHaveBeenCalled();
 *      expect(postSpy.mostRecentCall.args[0]).not.toEqual('/track');
 *      expect(postSpy.mostRecentCall.args[0]).toEqual('/custom-track');
 *      expect(postSpy.mostRecentCall.args[1]).toEqual({ 'login': 1 });
 *    }));
 *  });
 * ```
 */
/**
 * @ngdoc method
 * @name $provide#factory
 * @description
 *
 * Register a **service factory**, which will be called to return the service instance.
 * This is short for registering a service where its provider consists of only a `$get` property,
 * which is the given service factory function.
 * You should use {@link auto.$provide#factory $provide.factory(getFn)} if you do not need to
 * configure your service in a provider.
 *
 * @param {string} name The name of the instance.
 * @param {Function|Array.<string|Function>} $getFn The injectable $getFn for the instance creation.
 *                      Internally this is a short hand for `$provide.provider(name, {$get: $getFn})`.
 * @returns {Object} registered provider instance
 *
 * @example
 * Here is an example of registering a service
 * ```js
 *   $provide.factory('ping', ['$http', function($http) {
 *     return function ping() {
 *       return $http.send('/ping');
 *     };
 *   }]);
 * ```
 * You would then inject and use this service like this:
 * ```js
 *   someModule.controller('Ctrl', ['ping', function(ping) {
 *     ping();
 *   }]);
 * ```
 */
/**
 * @ngdoc method
 * @name $provide#service
 * @description
 *
 * Register a **service constructor**, which will be invoked with `new` to create the service
 * instance.
 * This is short for registering a service where its provider's `$get` property is a factory
 * function that returns an instance instantiated by the injector from the service constructor
 * function.
 *
 * Internally it looks a bit like this:
 *
 * ```
 * {
 *   $get: function() {
 *     return $injector.instantiate(constructor);
 *   }
 * }
 * ```
 *
 *
 * You should use {@link auto.$provide#service $provide.service(class)} if you define your service
 * as a type/class.
 *
 * @param {string} name The name of the instance.
 * @param {Function|Array.<string|Function>} constructor An injectable class (constructor function)
 *     that will be instantiated.
 * @returns {Object} registered provider instance
 *
 * @example
 * Here is an example of registering a service using
 * {@link auto.$provide#service $provide.service(class)}.
 * ```js
 *   var Ping = function($http) {
 *     this.$http = $http;
 *   };
 *
 *   Ping.$inject = ['$http'];
 *
 *   Ping.prototype.send = function() {
 *     return this.$http.get('/ping');
 *   };
 *   $provide.service('ping', Ping);
 * ```
 * You would then inject and use this service like this:
 * ```js
 *   someModule.controller('Ctrl', ['ping', function(ping) {
 *     ping.send();
 *   }]);
 * ```
 */
/**
 * @ngdoc method
 * @name $provide#value
 * @description
 *
 * Register a **value service** with the {@link auto.$injector $injector}, such as a string, a
 * number, an array, an object or a function. This is short for registering a service where its
 * provider's `$get` property is a factory function that takes no arguments and returns the **value
 * service**. That also means it is not possible to inject other services into a value service.
 *
 * Value services are similar to constant services, except that they cannot be injected into a
 * module configuration function (see {@link angular.Module#config}) but they can be overridden by
 * an Angular {@link auto.$provide#decorator decorator}.
 *
 * @param {string} name The name of the instance.
 * @param {*} value The value.
 * @returns {Object} registered provider instance
 *
 * @example
 * Here are some examples of creating value services.
 * ```js
 *   $provide.value('ADMIN_USER', 'admin');
 *
 *   $provide.value('RoleLookup', { admin: 0, writer: 1, reader: 2 });
 *
 *   $provide.value('halfOf', function(value) {
 *     return value / 2;
 *   });
 * ```
 */
/**
 * @ngdoc method
 * @name $provide#constant
 * @description
 *
 * Register a **constant service** with the {@link auto.$injector $injector}, such as a string,
 * a number, an array, an object or a function. Like the {@link auto.$provide#value value}, it is not
 * possible to inject other services into a constant.
 *
 * But unlike {@link auto.$provide#value value}, a constant can be
 * injected into a module configuration function (see {@link angular.Module#config}) and it cannot
 * be overridden by an Angular {@link auto.$provide#decorator decorator}.
 *
 * @param {string} name The name of the constant.
 * @param {*} value The constant value.
 * @returns {Object} registered instance
 *
 * @example
 * Here a some examples of creating constants:
 * ```js
 *   $provide.constant('SHARD_HEIGHT', 306);
 *
 *   $provide.constant('MY_COLOURS', ['red', 'blue', 'grey']);
 *
 *   $provide.constant('double', function(value) {
 *     return value * 2;
 *   });
 * ```
 */
/**
 * @ngdoc method
 * @name $provide#decorator
 * @description
 *
 * Register a **decorator function** with the {@link auto.$injector $injector}. A decorator function
 * intercepts the creation of a service, allowing it to override or modify the behavior of the
 * service. The return value of the decorator function may be the original service, or a new service
 * that replaces (or wraps and delegates to) the original service.
 *
 * You can find out more about using decorators in the {@link guide/decorators} guide.
 *
 * @param {string} name The name of the service to decorate.
 * @param {Function|Array.<string|Function>} decorator This function will be invoked when the service needs to be
 *    provided and should return the decorated service instance. The function is called using
 *    the {@link auto.$injector#invoke injector.invoke} method and is therefore fully injectable.
 *    Local injection arguments:
 *
 *    * `$delegate` - The original service instance, which can be replaced, monkey patched, configured,
 *      decorated or delegated to.
 *
 * @example
 * Here we decorate the {@link ng.$log $log} service to convert warnings to errors by intercepting
 * calls to {@link ng.$log#error $log.warn()}.
 * ```js
 *   $provide.decorator('$log', ['$delegate', function($delegate) {
 *     $delegate.warn = $delegate.error;
 *     return $delegate;
 *   }]);
 * ```
 */
function createInjector(modulesToLoad,strictDi){
////////////////////////////////////
// $provider
////////////////////////////////////
function supportObject(delegate){return function(key,value){return isObject(key)?void forEach(key,reverseParams(delegate)):delegate(key,value)}}function provider(name,provider_){if(assertNotHasOwnProperty(name,"service"),(isFunction(provider_)||isArray(provider_))&&(provider_=providerInjector.instantiate(provider_)),!provider_.$get)throw $injectorMinErr("pget","Provider '{0}' must define $get factory method.",name);return providerCache[name+providerSuffix]=provider_}function enforceReturnValue(name,factory){/** @this */
return function(){var result=instanceInjector.invoke(factory,this);if(isUndefined(result))throw $injectorMinErr("undef","Provider '{0}' must return a value from $get factory method.",name);return result}}function factory(name,factoryFn,enforce){return provider(name,{$get:enforce!==!1?enforceReturnValue(name,factoryFn):factoryFn})}function service(name,constructor){return factory(name,["$injector",function($injector){return $injector.instantiate(constructor)}])}function value(name,val){return factory(name,valueFn(val),!1)}function constant(name,value){assertNotHasOwnProperty(name,"constant"),providerCache[name]=value,instanceCache[name]=value}function decorator(serviceName,decorFn){var origProvider=providerInjector.get(serviceName+providerSuffix),orig$get=origProvider.$get;origProvider.$get=function(){var origInstance=instanceInjector.invoke(orig$get,origProvider);return instanceInjector.invoke(decorFn,null,{$delegate:origInstance})}}
////////////////////////////////////
// Module Loading
////////////////////////////////////
function loadModules(modulesToLoad){assertArg(isUndefined(modulesToLoad)||isArray(modulesToLoad),"modulesToLoad","not an array");var moduleFn,runBlocks=[];return forEach(modulesToLoad,function(module){function runInvokeQueue(queue){var i,ii;for(i=0,ii=queue.length;i<ii;i++){var invokeArgs=queue[i],provider=providerInjector.get(invokeArgs[0]);provider[invokeArgs[1]].apply(provider,invokeArgs[2])}}if(!loadedModules.get(module)){loadedModules.set(module,!0);try{isString(module)?(moduleFn=angularModule(module),instanceInjector.modules[module]=moduleFn,runBlocks=runBlocks.concat(loadModules(moduleFn.requires)).concat(moduleFn._runBlocks),runInvokeQueue(moduleFn._invokeQueue),runInvokeQueue(moduleFn._configBlocks)):isFunction(module)?runBlocks.push(providerInjector.invoke(module)):isArray(module)?runBlocks.push(providerInjector.invoke(module)):assertArgFn(module,"module")}catch(e){
// Safari & FF's stack traces don't contain error.message content
// unlike those of Chrome and IE
// So if stack doesn't contain message, we create a new string that contains both.
// Since error.stack is read-only in Safari, I'm overriding e and not e.stack here.
// eslint-disable-next-line no-ex-assign
throw isArray(module)&&(module=module[module.length-1]),e.message&&e.stack&&e.stack.indexOf(e.message)===-1&&(e=e.message+"\n"+e.stack),$injectorMinErr("modulerr","Failed to instantiate module {0} due to:\n{1}",module,e.stack||e.message||e)}}}),runBlocks}
////////////////////////////////////
// internal Injector
////////////////////////////////////
function createInternalInjector(cache,factory){function getService(serviceName,caller){if(cache.hasOwnProperty(serviceName)){if(cache[serviceName]===INSTANTIATING)throw $injectorMinErr("cdep","Circular dependency found: {0}",serviceName+" <- "+path.join(" <- "));return cache[serviceName]}try{return path.unshift(serviceName),cache[serviceName]=INSTANTIATING,cache[serviceName]=factory(serviceName,caller),cache[serviceName]}catch(err){throw cache[serviceName]===INSTANTIATING&&delete cache[serviceName],err}finally{path.shift()}}function injectionArgs(fn,locals,serviceName){for(var args=[],$inject=createInjector.$$annotate(fn,strictDi,serviceName),i=0,length=$inject.length;i<length;i++){var key=$inject[i];if("string"!=typeof key)throw $injectorMinErr("itkn","Incorrect injection token! Expected service name as string, got {0}",key);args.push(locals&&locals.hasOwnProperty(key)?locals[key]:getService(key,serviceName))}return args}function isClass(func){
// Support: IE 9-11 only
// IE 9-11 do not support classes and IE9 leaks with the code below.
if(msie||"function"!=typeof func)return!1;var result=func.$$ngIsClass;
// Support: Edge 12-13 only
// See: https://developer.microsoft.com/en-us/microsoft-edge/platform/issues/6156135/
return isBoolean(result)||(result=func.$$ngIsClass=/^(?:class\b|constructor\()/.test(stringifyFn(func))),result}function invoke(fn,self,locals,serviceName){"string"==typeof locals&&(serviceName=locals,locals=null);var args=injectionArgs(fn,locals,serviceName);return isArray(fn)&&(fn=fn[fn.length-1]),isClass(fn)?(args.unshift(null),new(Function.prototype.bind.apply(fn,args))):fn.apply(self,args)}function instantiate(Type,locals,serviceName){
// Check if Type is annotated and use just the given function at n-1 as parameter
// e.g. someModule.factory('greeter', ['$window', function(renamed$window) {}]);
var ctor=isArray(Type)?Type[Type.length-1]:Type,args=injectionArgs(Type,locals,serviceName);
// Empty object at position 0 is ignored for invocation with `new`, but required.
return args.unshift(null),new(Function.prototype.bind.apply(ctor,args))}return{invoke:invoke,instantiate:instantiate,get:getService,annotate:createInjector.$$annotate,has:function(name){return providerCache.hasOwnProperty(name+providerSuffix)||cache.hasOwnProperty(name)}}}strictDi=strictDi===!0;var INSTANTIATING={},providerSuffix="Provider",path=[],loadedModules=new NgMap,providerCache={$provide:{provider:supportObject(provider),factory:supportObject(factory),service:supportObject(service),value:supportObject(value),constant:supportObject(constant),decorator:decorator}},providerInjector=providerCache.$injector=createInternalInjector(providerCache,function(serviceName,caller){throw angular.isString(caller)&&path.push(caller),$injectorMinErr("unpr","Unknown provider: {0}",path.join(" <- "))}),instanceCache={},protoInstanceInjector=createInternalInjector(instanceCache,function(serviceName,caller){var provider=providerInjector.get(serviceName+providerSuffix,caller);return instanceInjector.invoke(provider.$get,provider,void 0,serviceName)}),instanceInjector=protoInstanceInjector;providerCache["$injector"+providerSuffix]={$get:valueFn(protoInstanceInjector)},instanceInjector.modules=providerInjector.modules=createMap();var runBlocks=loadModules(modulesToLoad);return instanceInjector=protoInstanceInjector.get("$injector"),instanceInjector.strictDi=strictDi,forEach(runBlocks,function(fn){fn&&instanceInjector.invoke(fn)}),instanceInjector}/**
 * @ngdoc provider
 * @name $anchorScrollProvider
 * @this
 *
 * @description
 * Use `$anchorScrollProvider` to disable automatic scrolling whenever
 * {@link ng.$location#hash $location.hash()} changes.
 */
function $AnchorScrollProvider(){var autoScrollingEnabled=!0;/**
   * @ngdoc method
   * @name $anchorScrollProvider#disableAutoScrolling
   *
   * @description
   * By default, {@link ng.$anchorScroll $anchorScroll()} will automatically detect changes to
   * {@link ng.$location#hash $location.hash()} and scroll to the element matching the new hash.<br />
   * Use this method to disable automatic scrolling.
   *
   * If automatic scrolling is disabled, one must explicitly call
   * {@link ng.$anchorScroll $anchorScroll()} in order to scroll to the element related to the
   * current hash.
   */
this.disableAutoScrolling=function(){autoScrollingEnabled=!1},/**
   * @ngdoc service
   * @name $anchorScroll
   * @kind function
   * @requires $window
   * @requires $location
   * @requires $rootScope
   *
   * @description
   * When called, it scrolls to the element related to the specified `hash` or (if omitted) to the
   * current value of {@link ng.$location#hash $location.hash()}, according to the rules specified
   * in the
   * [HTML5 spec](http://www.w3.org/html/wg/drafts/html/master/browsers.html#an-indicated-part-of-the-document).
   *
   * It also watches the {@link ng.$location#hash $location.hash()} and automatically scrolls to
   * match any anchor whenever it changes. This can be disabled by calling
   * {@link ng.$anchorScrollProvider#disableAutoScrolling $anchorScrollProvider.disableAutoScrolling()}.
   *
   * Additionally, you can use its {@link ng.$anchorScroll#yOffset yOffset} property to specify a
   * vertical scroll-offset (either fixed or dynamic).
   *
   * @param {string=} hash The hash specifying the element to scroll to. If omitted, the value of
   *                       {@link ng.$location#hash $location.hash()} will be used.
   *
   * @property {(number|function|jqLite)} yOffset
   * If set, specifies a vertical scroll-offset. This is often useful when there are fixed
   * positioned elements at the top of the page, such as navbars, headers etc.
   *
   * `yOffset` can be specified in various ways:
   * - **number**: A fixed number of pixels to be used as offset.<br /><br />
   * - **function**: A getter function called everytime `$anchorScroll()` is executed. Must return
   *   a number representing the offset (in pixels).<br /><br />
   * - **jqLite**: A jqLite/jQuery element to be used for specifying the offset. The distance from
   *   the top of the page to the element's bottom will be used as offset.<br />
   *   **Note**: The element will be taken into account only as long as its `position` is set to
   *   `fixed`. This option is useful, when dealing with responsive navbars/headers that adjust
   *   their height and/or positioning according to the viewport's size.
   *
   * <br />
   * <div class="alert alert-warning">
   * In order for `yOffset` to work properly, scrolling should take place on the document's root and
   * not some child element.
   * </div>
   *
   * @example
     <example module="anchorScrollExample" name="anchor-scroll">
       <file name="index.html">
         <div id="scrollArea" ng-controller="ScrollController">
           <a ng-click="gotoBottom()">Go to bottom</a>
           <a id="bottom"></a> You're at the bottom!
         </div>
       </file>
       <file name="script.js">
         angular.module('anchorScrollExample', [])
           .controller('ScrollController', ['$scope', '$location', '$anchorScroll',
             function($scope, $location, $anchorScroll) {
               $scope.gotoBottom = function() {
                 // set the location.hash to the id of
                 // the element you wish to scroll to.
                 $location.hash('bottom');

                 // call $anchorScroll()
                 $anchorScroll();
               };
             }]);
       </file>
       <file name="style.css">
         #scrollArea {
           height: 280px;
           overflow: auto;
         }

         #bottom {
           display: block;
           margin-top: 2000px;
         }
       </file>
     </example>
   *
   * <hr />
   * The example below illustrates the use of a vertical scroll-offset (specified as a fixed value).
   * See {@link ng.$anchorScroll#yOffset $anchorScroll.yOffset} for more details.
   *
   * @example
     <example module="anchorScrollOffsetExample" name="anchor-scroll-offset">
       <file name="index.html">
         <div class="fixed-header" ng-controller="headerCtrl">
           <a href="" ng-click="gotoAnchor(x)" ng-repeat="x in [1,2,3,4,5]">
             Go to anchor {{x}}
           </a>
         </div>
         <div id="anchor{{x}}" class="anchor" ng-repeat="x in [1,2,3,4,5]">
           Anchor {{x}} of 5
         </div>
       </file>
       <file name="script.js">
         angular.module('anchorScrollOffsetExample', [])
           .run(['$anchorScroll', function($anchorScroll) {
             $anchorScroll.yOffset = 50;   // always scroll by 50 extra pixels
           }])
           .controller('headerCtrl', ['$anchorScroll', '$location', '$scope',
             function($anchorScroll, $location, $scope) {
               $scope.gotoAnchor = function(x) {
                 var newHash = 'anchor' + x;
                 if ($location.hash() !== newHash) {
                   // set the $location.hash to `newHash` and
                   // $anchorScroll will automatically scroll to it
                   $location.hash('anchor' + x);
                 } else {
                   // call $anchorScroll() explicitly,
                   // since $location.hash hasn't changed
                   $anchorScroll();
                 }
               };
             }
           ]);
       </file>
       <file name="style.css">
         body {
           padding-top: 50px;
         }

         .anchor {
           border: 2px dashed DarkOrchid;
           padding: 10px 10px 200px 10px;
         }

         .fixed-header {
           background-color: rgba(0, 0, 0, 0.2);
           height: 50px;
           position: fixed;
           top: 0; left: 0; right: 0;
         }

         .fixed-header > a {
           display: inline-block;
           margin: 5px 15px;
         }
       </file>
     </example>
   */
this.$get=["$window","$location","$rootScope",function($window,$location,$rootScope){
// Helper function to get first anchor from a NodeList
// (using `Array#some()` instead of `angular#forEach()` since it's more performant
//  and working in all supported browsers.)
function getFirstAnchor(list){var result=null;return Array.prototype.some.call(list,function(element){if("a"===nodeName_(element))return result=element,!0}),result}function getYOffset(){var offset=scroll.yOffset;if(isFunction(offset))offset=offset();else if(isElement(offset)){var elem=offset[0],style=$window.getComputedStyle(elem);offset="fixed"!==style.position?0:elem.getBoundingClientRect().bottom}else isNumber(offset)||(offset=0);return offset}function scrollTo(elem){if(elem){elem.scrollIntoView();var offset=getYOffset();if(offset){
// `offset` is the number of pixels we should scroll UP in order to align `elem` properly.
// This is true ONLY if the call to `elem.scrollIntoView()` initially aligns `elem` at the
// top of the viewport.
//
// IF the number of pixels from the top of `elem` to the end of the page's content is less
// than the height of the viewport, then `elem.scrollIntoView()` will align the `elem` some
// way down the page.
//
// This is often the case for elements near the bottom of the page.
//
// In such cases we do not need to scroll the whole `offset` up, just the difference between
// the top of the element and the offset, which is enough to align the top of `elem` at the
// desired position.
var elemTop=elem.getBoundingClientRect().top;$window.scrollBy(0,elemTop-offset)}}else $window.scrollTo(0,0)}function scroll(hash){
// Allow numeric hashes
hash=isString(hash)?hash:isNumber(hash)?hash.toString():$location.hash();var elm;
// empty hash, scroll to the top of the page
hash?(elm=document.getElementById(hash))?scrollTo(elm):(elm=getFirstAnchor(document.getElementsByName(hash)))?scrollTo(elm):"top"===hash&&scrollTo(null):scrollTo(null)}var document=$window.document;
// does not scroll when user clicks on anchor link that is currently on
// (no url change, no $location.hash() change), browser native does scroll
return autoScrollingEnabled&&$rootScope.$watch(function(){return $location.hash()},function(newVal,oldVal){
// skip the initial scroll if $location.hash is empty
newVal===oldVal&&""===newVal||jqLiteDocumentLoaded(function(){$rootScope.$evalAsync(scroll)})}),scroll}]}function mergeClasses(a,b){return a||b?a?b?(isArray(a)&&(a=a.join(" ")),isArray(b)&&(b=b.join(" ")),a+" "+b):a:b:""}function extractElementNode(element){for(var i=0;i<element.length;i++){var elm=element[i];if(elm.nodeType===ELEMENT_NODE)return elm}}function splitClasses(classes){isString(classes)&&(classes=classes.split(" "));
// Use createMap() to prevent class assumptions involving property names in
// Object.prototype
var obj=createMap();return forEach(classes,function(klass){
// sometimes the split leaves empty string values
// incase extra spaces were applied to the options
klass.length&&(obj[klass]=!0)}),obj}
// if any other type of options value besides an Object value is
// passed into the $animate.method() animation then this helper code
// will be run which will ignore it. While this patch is not the
// greatest solution to this, a lot of existing plugins depend on
// $animate to either call the callback (< 1.2) or return a promise
// that can be changed. This helper function ensures that the options
// are wiped clean incase a callback function is provided.
function prepareAnimateOptions(options){return isObject(options)?options:{}}/* global stripHash: true */
/**
 * ! This is a private undocumented service !
 *
 * @name $browser
 * @requires $log
 * @description
 * This object has two goals:
 *
 * - hide all the global state in the browser caused by the window object
 * - abstract away all the browser specific features and inconsistencies
 *
 * For tests we provide {@link ngMock.$browser mock implementation} of the `$browser`
 * service, which can be used for convenient testing of the application without the interaction with
 * the real browser apis.
 */
/**
 * @param {object} window The global window object.
 * @param {object} document jQuery wrapped document.
 * @param {object} $log window.console or an object with the same interface.
 * @param {object} $sniffer $sniffer service
 */
function Browser(window,document,$log,$sniffer){/**
   * Executes the `fn` function(supports currying) and decrements the `outstandingRequestCallbacks`
   * counter. If the counter reaches 0, all the `outstandingRequestCallbacks` are executed.
   */
function completeOutstandingRequest(fn){try{fn.apply(null,sliceArgs(arguments,1))}finally{if(outstandingRequestCount--,0===outstandingRequestCount)for(;outstandingRequestCallbacks.length;)try{outstandingRequestCallbacks.pop()()}catch(e){$log.error(e)}}}function getHash(url){var index=url.indexOf("#");return index===-1?"":url.substr(index)}function cacheStateAndFireUrlChange(){pendingLocation=null,fireStateOrUrlChange()}function cacheState(){
// This should be the only place in $browser where `history.state` is read.
cachedState=getCurrentState(),cachedState=isUndefined(cachedState)?null:cachedState,
// Prevent callbacks fo fire twice if both hashchange & popstate were fired.
equals(cachedState,lastCachedState)&&(cachedState=lastCachedState),lastCachedState=cachedState,lastHistoryState=cachedState}function fireStateOrUrlChange(){var prevLastHistoryState=lastHistoryState;cacheState(),lastBrowserUrl===self.url()&&prevLastHistoryState===cachedState||(lastBrowserUrl=self.url(),lastHistoryState=cachedState,forEach(urlChangeListeners,function(listener){listener(self.url(),cachedState)}))}var self=this,location=window.location,history=window.history,setTimeout=window.setTimeout,clearTimeout=window.clearTimeout,pendingDeferIds={};self.isMock=!1;var outstandingRequestCount=0,outstandingRequestCallbacks=[];
// TODO(vojta): remove this temporary api
self.$$completeOutstandingRequest=completeOutstandingRequest,self.$$incOutstandingRequestCount=function(){outstandingRequestCount++},/**
   * @private
   * Note: this method is used only by scenario runner
   * TODO(vojta): prefix this method with $$ ?
   * @param {function()} callback Function that will be called when no outstanding request
   */
self.notifyWhenNoOutstandingRequests=function(callback){0===outstandingRequestCount?callback():outstandingRequestCallbacks.push(callback)};
//////////////////////////////////////////////////////////////
// URL API
//////////////////////////////////////////////////////////////
var cachedState,lastHistoryState,lastBrowserUrl=location.href,baseElement=document.find("base"),pendingLocation=null,getCurrentState=$sniffer.history?function(){try{return history.state}catch(e){}}:noop;cacheState(),/**
   * @name $browser#url
   *
   * @description
   * GETTER:
   * Without any argument, this method just returns current value of location.href.
   *
   * SETTER:
   * With at least one argument, this method sets url to new value.
   * If html5 history api supported, pushState/replaceState is used, otherwise
   * location.href/location.replace is used.
   * Returns its own instance to allow chaining
   *
   * NOTE: this api is intended for use only by the $location service. Please use the
   * {@link ng.$location $location service} to change url.
   *
   * @param {string} url New url (when used as setter)
   * @param {boolean=} replace Should new url replace current history record?
   * @param {object=} state object to use with pushState/replaceState
   */
self.url=function(url,replace,state){
// setter
if(
// In modern browsers `history.state` is `null` by default; treating it separately
// from `undefined` would cause `$browser.url('/foo')` to change `history.state`
// to undefined via `pushState`. Instead, let's change `undefined` to `null` here.
isUndefined(state)&&(state=null),
// Android Browser BFCache causes location, history reference to become stale.
location!==window.location&&(location=window.location),history!==window.history&&(history=window.history),url){var sameState=lastHistoryState===state;
// Don't change anything if previous and current URLs and states match. This also prevents
// IE<10 from getting into redirect loop when in LocationHashbangInHtml5Url mode.
// See https://github.com/angular/angular.js/commit/ffb2701
if(lastBrowserUrl===url&&(!$sniffer.history||sameState))return self;var sameBase=lastBrowserUrl&&stripHash(lastBrowserUrl)===stripHash(url);
// Don't use history API if only the hash changed
// due to a bug in IE10/IE11 which leads
// to not firing a `hashchange` nor `popstate` event
// in some cases (see #9143).
return lastBrowserUrl=url,lastHistoryState=state,!$sniffer.history||sameBase&&sameState?(sameBase||(pendingLocation=url),replace?location.replace(url):sameBase?location.hash=getHash(url):location.href=url,location.href!==url&&(pendingLocation=url)):(history[replace?"replaceState":"pushState"](state,"",url),cacheState()),pendingLocation&&(pendingLocation=url),self}
// - pendingLocation is needed as browsers don't allow to read out
//   the new location.href if a reload happened or if there is a bug like in iOS 9 (see
//   https://openradar.appspot.com/22186109).
// - the replacement is a workaround for https://bugzilla.mozilla.org/show_bug.cgi?id=407172
return pendingLocation||location.href.replace(/%27/g,"'")},/**
   * @name $browser#state
   *
   * @description
   * This method is a getter.
   *
   * Return history.state or null if history.state is undefined.
   *
   * @returns {object} state
   */
self.state=function(){return cachedState};var urlChangeListeners=[],urlChangeInit=!1,lastCachedState=null;/**
   * @name $browser#onUrlChange
   *
   * @description
   * Register callback function that will be called, when url changes.
   *
   * It's only called when the url is changed from outside of angular:
   * - user types different url into address bar
   * - user clicks on history (forward/back) button
   * - user clicks on a link
   *
   * It's not called when url is changed by $browser.url() method
   *
   * The listener gets called with new url as parameter.
   *
   * NOTE: this api is intended for use only by the $location service. Please use the
   * {@link ng.$location $location service} to monitor url changes in angular apps.
   *
   * @param {function(string)} listener Listener function to be called when url changes.
   * @return {function(string)} Returns the registered listener fn - handy if the fn is anonymous.
   */
self.onUrlChange=function(callback){
// TODO(vojta): refactor to use node's syntax for events
// We listen on both (hashchange/popstate) when available, as some browsers don't
// fire popstate when user changes the address bar and don't fire hashchange when url
// changed by push/replaceState
// html5 history api - popstate event
// hashchange event
return urlChangeInit||($sniffer.history&&jqLite(window).on("popstate",cacheStateAndFireUrlChange),jqLite(window).on("hashchange",cacheStateAndFireUrlChange),urlChangeInit=!0),urlChangeListeners.push(callback),callback},/**
   * @private
   * Remove popstate and hashchange handler from window.
   *
   * NOTE: this api is intended for use only by $rootScope.
   */
self.$$applicationDestroyed=function(){jqLite(window).off("hashchange popstate",cacheStateAndFireUrlChange)},/**
   * Checks whether the url has changed outside of Angular.
   * Needs to be exported to be able to check for changes that have been done in sync,
   * as hashchange/popstate events fire in async.
   */
self.$$checkUrlChange=fireStateOrUrlChange,
//////////////////////////////////////////////////////////////
// Misc API
//////////////////////////////////////////////////////////////
/**
   * @name $browser#baseHref
   *
   * @description
   * Returns current <base href>
   * (always relative - without domain)
   *
   * @returns {string} The current base href
   */
self.baseHref=function(){var href=baseElement.attr("href");return href?href.replace(/^(https?:)?\/\/[^\/]*/,""):""},/**
   * @name $browser#defer
   * @param {function()} fn A function, who's execution should be deferred.
   * @param {number=} [delay=0] of milliseconds to defer the function execution.
   * @returns {*} DeferId that can be used to cancel the task via `$browser.defer.cancel()`.
   *
   * @description
   * Executes a fn asynchronously via `setTimeout(fn, delay)`.
   *
   * Unlike when calling `setTimeout` directly, in test this function is mocked and instead of using
   * `setTimeout` in tests, the fns are queued in an array, which can be programmatically flushed
   * via `$browser.defer.flush()`.
   *
   */
self.defer=function(fn,delay){var timeoutId;return outstandingRequestCount++,timeoutId=setTimeout(function(){delete pendingDeferIds[timeoutId],completeOutstandingRequest(fn)},delay||0),pendingDeferIds[timeoutId]=!0,timeoutId},/**
   * @name $browser#defer.cancel
   *
   * @description
   * Cancels a deferred task identified with `deferId`.
   *
   * @param {*} deferId Token returned by the `$browser.defer` function.
   * @returns {boolean} Returns `true` if the task hasn't executed yet and was successfully
   *                    canceled.
   */
self.defer.cancel=function(deferId){return!!pendingDeferIds[deferId]&&(delete pendingDeferIds[deferId],clearTimeout(deferId),completeOutstandingRequest(noop),!0)}}/** @this */
function $BrowserProvider(){this.$get=["$window","$log","$sniffer","$document",function($window,$log,$sniffer,$document){return new Browser($window,$document,$log,$sniffer)}]}/**
 * @ngdoc service
 * @name $cacheFactory
 * @this
 *
 * @description
 * Factory that constructs {@link $cacheFactory.Cache Cache} objects and gives access to
 * them.
 *
 * ```js
 *
 *  var cache = $cacheFactory('cacheId');
 *  expect($cacheFactory.get('cacheId')).toBe(cache);
 *  expect($cacheFactory.get('noSuchCacheId')).not.toBeDefined();
 *
 *  cache.put("key", "value");
 *  cache.put("another key", "another value");
 *
 *  // We've specified no options on creation
 *  expect(cache.info()).toEqual({id: 'cacheId', size: 2});
 *
 * ```
 *
 *
 * @param {string} cacheId Name or id of the newly created cache.
 * @param {object=} options Options object that specifies the cache behavior. Properties:
 *
 *   - `{number=}` `capacity` — turns the cache into LRU cache.
 *
 * @returns {object} Newly created cache object with the following set of methods:
 *
 * - `{object}` `info()` — Returns id, size, and options of cache.
 * - `{{*}}` `put({string} key, {*} value)` — Puts a new key-value pair into the cache and returns
 *   it.
 * - `{{*}}` `get({string} key)` — Returns cached value for `key` or undefined for cache miss.
 * - `{void}` `remove({string} key)` — Removes a key-value pair from the cache.
 * - `{void}` `removeAll()` — Removes all cached values.
 * - `{void}` `destroy()` — Removes references to this cache from $cacheFactory.
 *
 * @example
   <example module="cacheExampleApp" name="cache-factory">
     <file name="index.html">
       <div ng-controller="CacheController">
         <input ng-model="newCacheKey" placeholder="Key">
         <input ng-model="newCacheValue" placeholder="Value">
         <button ng-click="put(newCacheKey, newCacheValue)">Cache</button>

         <p ng-if="keys.length">Cached Values</p>
         <div ng-repeat="key in keys">
           <span ng-bind="key"></span>
           <span>: </span>
           <b ng-bind="cache.get(key)"></b>
         </div>

         <p>Cache Info</p>
         <div ng-repeat="(key, value) in cache.info()">
           <span ng-bind="key"></span>
           <span>: </span>
           <b ng-bind="value"></b>
         </div>
       </div>
     </file>
     <file name="script.js">
       angular.module('cacheExampleApp', []).
         controller('CacheController', ['$scope', '$cacheFactory', function($scope, $cacheFactory) {
           $scope.keys = [];
           $scope.cache = $cacheFactory('cacheId');
           $scope.put = function(key, value) {
             if (angular.isUndefined($scope.cache.get(key))) {
               $scope.keys.push(key);
             }
             $scope.cache.put(key, angular.isUndefined(value) ? null : value);
           };
         }]);
     </file>
     <file name="style.css">
       p {
         margin: 10px 0 3px;
       }
     </file>
   </example>
 */
function $CacheFactoryProvider(){this.$get=function(){function cacheFactory(cacheId,options){/**
       * makes the `entry` the freshEnd of the LRU linked list
       */
function refresh(entry){entry!==freshEnd&&(staleEnd?staleEnd===entry&&(staleEnd=entry.n):staleEnd=entry,link(entry.n,entry.p),link(entry,freshEnd),freshEnd=entry,freshEnd.n=null)}/**
       * bidirectionally links two entries of the LRU linked list
       */
function link(nextEntry,prevEntry){nextEntry!==prevEntry&&(nextEntry&&(nextEntry.p=prevEntry),//p stands for previous, 'prev' didn't minify
prevEntry&&(prevEntry.n=nextEntry))}if(cacheId in caches)throw minErr("$cacheFactory")("iid","CacheId '{0}' is already taken!",cacheId);var size=0,stats=extend({},options,{id:cacheId}),data=createMap(),capacity=options&&options.capacity||Number.MAX_VALUE,lruHash=createMap(),freshEnd=null,staleEnd=null;/**
       * @ngdoc type
       * @name $cacheFactory.Cache
       *
       * @description
       * A cache object used to store and retrieve data, primarily used by
       * {@link $http $http} and the {@link ng.directive:script script} directive to cache
       * templates and other data.
       *
       * ```js
       *  angular.module('superCache')
       *    .factory('superCache', ['$cacheFactory', function($cacheFactory) {
       *      return $cacheFactory('super-cache');
       *    }]);
       * ```
       *
       * Example test:
       *
       * ```js
       *  it('should behave like a cache', inject(function(superCache) {
       *    superCache.put('key', 'value');
       *    superCache.put('another key', 'another value');
       *
       *    expect(superCache.info()).toEqual({
       *      id: 'super-cache',
       *      size: 2
       *    });
       *
       *    superCache.remove('another key');
       *    expect(superCache.get('another key')).toBeUndefined();
       *
       *    superCache.removeAll();
       *    expect(superCache.info()).toEqual({
       *      id: 'super-cache',
       *      size: 0
       *    });
       *  }));
       * ```
       */
return caches[cacheId]={/**
         * @ngdoc method
         * @name $cacheFactory.Cache#put
         * @kind function
         *
         * @description
         * Inserts a named entry into the {@link $cacheFactory.Cache Cache} object to be
         * retrieved later, and incrementing the size of the cache if the key was not already
         * present in the cache. If behaving like an LRU cache, it will also remove stale
         * entries from the set.
         *
         * It will not insert undefined values into the cache.
         *
         * @param {string} key the key under which the cached data is stored.
         * @param {*} value the value to store alongside the key. If it is undefined, the key
         *    will not be stored.
         * @returns {*} the value stored.
         */
put:function(key,value){if(!isUndefined(value)){if(capacity<Number.MAX_VALUE){var lruEntry=lruHash[key]||(lruHash[key]={key:key});refresh(lruEntry)}return key in data||size++,data[key]=value,size>capacity&&this.remove(staleEnd.key),value}},/**
         * @ngdoc method
         * @name $cacheFactory.Cache#get
         * @kind function
         *
         * @description
         * Retrieves named data stored in the {@link $cacheFactory.Cache Cache} object.
         *
         * @param {string} key the key of the data to be retrieved
         * @returns {*} the value stored.
         */
get:function(key){if(capacity<Number.MAX_VALUE){var lruEntry=lruHash[key];if(!lruEntry)return;refresh(lruEntry)}return data[key]},/**
         * @ngdoc method
         * @name $cacheFactory.Cache#remove
         * @kind function
         *
         * @description
         * Removes an entry from the {@link $cacheFactory.Cache Cache} object.
         *
         * @param {string} key the key of the entry to be removed
         */
remove:function(key){if(capacity<Number.MAX_VALUE){var lruEntry=lruHash[key];if(!lruEntry)return;lruEntry===freshEnd&&(freshEnd=lruEntry.p),lruEntry===staleEnd&&(staleEnd=lruEntry.n),link(lruEntry.n,lruEntry.p),delete lruHash[key]}key in data&&(delete data[key],size--)},/**
         * @ngdoc method
         * @name $cacheFactory.Cache#removeAll
         * @kind function
         *
         * @description
         * Clears the cache object of any entries.
         */
removeAll:function(){data=createMap(),size=0,lruHash=createMap(),freshEnd=staleEnd=null},/**
         * @ngdoc method
         * @name $cacheFactory.Cache#destroy
         * @kind function
         *
         * @description
         * Destroys the {@link $cacheFactory.Cache Cache} object entirely,
         * removing it from the {@link $cacheFactory $cacheFactory} set.
         */
destroy:function(){data=null,stats=null,lruHash=null,delete caches[cacheId]},/**
         * @ngdoc method
         * @name $cacheFactory.Cache#info
         * @kind function
         *
         * @description
         * Retrieve information regarding a particular {@link $cacheFactory.Cache Cache}.
         *
         * @returns {object} an object with the following properties:
         *   <ul>
         *     <li>**id**: the id of the cache instance</li>
         *     <li>**size**: the number of entries kept in the cache instance</li>
         *     <li>**...**: any additional properties from the options object when creating the
         *       cache.</li>
         *   </ul>
         */
info:function(){return extend({},stats,{size:size})}}}var caches={};/**
   * @ngdoc method
   * @name $cacheFactory#info
   *
   * @description
   * Get information about all the caches that have been created
   *
   * @returns {Object} - key-value map of `cacheId` to the result of calling `cache#info`
   */
/**
   * @ngdoc method
   * @name $cacheFactory#get
   *
   * @description
   * Get access to a cache object by the `cacheId` used when it was created.
   *
   * @param {string} cacheId Name or id of a cache to access.
   * @returns {object} Cache object identified by the cacheId or undefined if no such cache.
   */
return cacheFactory.info=function(){var info={};return forEach(caches,function(cache,cacheId){info[cacheId]=cache.info()}),info},cacheFactory.get=function(cacheId){return caches[cacheId]},cacheFactory}}/**
 * @ngdoc service
 * @name $templateCache
 * @this
 *
 * @description
 * The first time a template is used, it is loaded in the template cache for quick retrieval. You
 * can load templates directly into the cache in a `script` tag, or by consuming the
 * `$templateCache` service directly.
 *
 * Adding via the `script` tag:
 *
 * ```html
 *   <script type="text/ng-template" id="templateId.html">
 *     <p>This is the content of the template</p>
 *   </script>
 * ```
 *
 * **Note:** the `script` tag containing the template does not need to be included in the `head` of
 * the document, but it must be a descendent of the {@link ng.$rootElement $rootElement} (IE,
 * element with ng-app attribute), otherwise the template will be ignored.
 *
 * Adding via the `$templateCache` service:
 *
 * ```js
 * var myApp = angular.module('myApp', []);
 * myApp.run(function($templateCache) {
 *   $templateCache.put('templateId.html', 'This is the content of the template');
 * });
 * ```
 *
 * To retrieve the template later, simply use it in your component:
 * ```js
 * myApp.component('myComponent', {
 *    templateUrl: 'templateId.html'
 * });
 * ```
 *
 * or get it via the `$templateCache` service:
 * ```js
 * $templateCache.get('templateId.html')
 * ```
 *
 * See {@link ng.$cacheFactory $cacheFactory}.
 *
 */
function $TemplateCacheProvider(){this.$get=["$cacheFactory",function($cacheFactory){return $cacheFactory("templates")}]}function UNINITIALIZED_VALUE(){}/** @this */
function $CompileProvider($provide,$$sanitizeUriProvider){function parseIsolateBindings(scope,directiveName,isController){var LOCAL_REGEXP=/^\s*([@&<]|=(\*?))(\??)\s*([\w$]*)\s*$/,bindings=createMap();return forEach(scope,function(definition,scopeName){if(definition in bindingCache)return void(bindings[scopeName]=bindingCache[definition]);var match=definition.match(LOCAL_REGEXP);if(!match)throw $compileMinErr("iscp","Invalid {3} for directive '{0}'. Definition: {... {1}: '{2}' ...}",directiveName,scopeName,definition,isController?"controller bindings definition":"isolate scope definition");bindings[scopeName]={mode:match[1][0],collection:"*"===match[2],optional:"?"===match[3],attrName:match[4]||scopeName},match[4]&&(bindingCache[definition]=bindings[scopeName])}),bindings}function parseDirectiveBindings(directive,directiveName){var bindings={isolateScope:null,bindToController:null};if(isObject(directive.scope)&&(directive.bindToController===!0?(bindings.bindToController=parseIsolateBindings(directive.scope,directiveName,!0),bindings.isolateScope={}):bindings.isolateScope=parseIsolateBindings(directive.scope,directiveName,!1)),isObject(directive.bindToController)&&(bindings.bindToController=parseIsolateBindings(directive.bindToController,directiveName,!0)),bindings.bindToController&&!directive.controller)
// There is no controller
throw $compileMinErr("noctrl","Cannot bind to controller without directive '{0}'s controller.",directiveName);return bindings}function assertValidDirectiveName(name){var letter=name.charAt(0);if(!letter||letter!==lowercase(letter))throw $compileMinErr("baddir","Directive/Component name '{0}' is invalid. The first character must be a lowercase letter",name);if(name!==name.trim())throw $compileMinErr("baddir","Directive/Component name '{0}' is invalid. The name should not contain leading or trailing whitespaces",name)}function getDirectiveRequire(directive){var require=directive.require||directive.controller&&directive.name;return!isArray(require)&&isObject(require)&&forEach(require,function(value,key){var match=value.match(REQUIRE_PREFIX_REGEXP),name=value.substring(match[0].length);name||(require[key]=match[0]+key)}),require}function getDirectiveRestrict(restrict,name){if(restrict&&(!isString(restrict)||!/[EACM]/.test(restrict)))throw $compileMinErr("badrestrict","Restrict property '{0}' of directive '{1}' is invalid",restrict,name);return restrict||"EA"}var hasDirectives={},Suffix="Directive",COMMENT_DIRECTIVE_REGEXP=/^\s*directive:\s*([\w-]+)\s+(.*)$/,CLASS_DIRECTIVE_REGEXP=/(([\w-]+)(?::([^;]+))?;?)/,ALL_OR_NOTHING_ATTRS=makeMap("ngSrc,ngSrcset,src,srcset"),REQUIRE_PREFIX_REGEXP=/^(?:(\^\^?)?(\?)?(\^\^?)?)?/,EVENT_HANDLER_ATTR_REGEXP=/^(on[a-z]+|formaction)$/,bindingCache=createMap();/**
   * @ngdoc method
   * @name $compileProvider#directive
   * @kind function
   *
   * @description
   * Register a new directive with the compiler.
   *
   * @param {string|Object} name Name of the directive in camel-case (i.e. <code>ngBind</code> which
   *    will match as <code>ng-bind</code>), or an object map of directives where the keys are the
   *    names and the values are the factories.
   * @param {Function|Array} directiveFactory An injectable directive factory function. See the
   *    {@link guide/directive directive guide} and the {@link $compile compile API} for more info.
   * @returns {ng.$compileProvider} Self for chaining.
   */
this.directive=function registerDirective(name,directiveFactory){return assertArg(name,"name"),assertNotHasOwnProperty(name,"directive"),isString(name)?(assertValidDirectiveName(name),assertArg(directiveFactory,"directiveFactory"),hasDirectives.hasOwnProperty(name)||(hasDirectives[name]=[],$provide.factory(name+Suffix,["$injector","$exceptionHandler",function($injector,$exceptionHandler){var directives=[];return forEach(hasDirectives[name],function(directiveFactory,index){try{var directive=$injector.invoke(directiveFactory);isFunction(directive)?directive={compile:valueFn(directive)}:!directive.compile&&directive.link&&(directive.compile=valueFn(directive.link)),directive.priority=directive.priority||0,directive.index=index,directive.name=directive.name||name,directive.require=getDirectiveRequire(directive),directive.restrict=getDirectiveRestrict(directive.restrict,name),directive.$$moduleName=directiveFactory.$$moduleName,directives.push(directive)}catch(e){$exceptionHandler(e)}}),directives}])),hasDirectives[name].push(directiveFactory)):forEach(name,reverseParams(registerDirective)),this},/**
   * @ngdoc method
   * @name $compileProvider#component
   * @module ng
   * @param {string} name Name of the component in camelCase (i.e. `myComp` which will match `<my-comp>`)
   * @param {Object} options Component definition object (a simplified
   *    {@link ng.$compile#directive-definition-object directive definition object}),
   *    with the following properties (all optional):
   *
   *    - `controller` – `{(string|function()=}` – controller constructor function that should be
   *      associated with newly created scope or the name of a {@link ng.$compile#-controller-
   *      registered controller} if passed as a string. An empty `noop` function by default.
   *    - `controllerAs` – `{string=}` – identifier name for to reference the controller in the component's scope.
   *      If present, the controller will be published to scope under the `controllerAs` name.
   *      If not present, this will default to be `$ctrl`.
   *    - `template` – `{string=|function()=}` – html template as a string or a function that
   *      returns an html template as a string which should be used as the contents of this component.
   *      Empty string by default.
   *
   *      If `template` is a function, then it is {@link auto.$injector#invoke injected} with
   *      the following locals:
   *
   *      - `$element` - Current element
   *      - `$attrs` - Current attributes object for the element
   *
   *    - `templateUrl` – `{string=|function()=}` – path or function that returns a path to an html
   *      template that should be used  as the contents of this component.
   *
   *      If `templateUrl` is a function, then it is {@link auto.$injector#invoke injected} with
   *      the following locals:
   *
   *      - `$element` - Current element
   *      - `$attrs` - Current attributes object for the element
   *
   *    - `bindings` – `{object=}` – defines bindings between DOM attributes and component properties.
   *      Component properties are always bound to the component controller and not to the scope.
   *      See {@link ng.$compile#-bindtocontroller- `bindToController`}.
   *    - `transclude` – `{boolean=}` – whether {@link $compile#transclusion content transclusion} is enabled.
   *      Disabled by default.
   *    - `require` - `{Object<string, string>=}` - requires the controllers of other directives and binds them to
   *      this component's controller. The object keys specify the property names under which the required
   *      controllers (object values) will be bound. See {@link ng.$compile#-require- `require`}.
   *    - `$...` – additional properties to attach to the directive factory function and the controller
   *      constructor function. (This is used by the component router to annotate)
   *
   * @returns {ng.$compileProvider} the compile provider itself, for chaining of function calls.
   * @description
   * Register a **component definition** with the compiler. This is a shorthand for registering a special
   * type of directive, which represents a self-contained UI component in your application. Such components
   * are always isolated (i.e. `scope: {}`) and are always restricted to elements (i.e. `restrict: 'E'`).
   *
   * Component definitions are very simple and do not require as much configuration as defining general
   * directives. Component definitions usually consist only of a template and a controller backing it.
   *
   * In order to make the definition easier, components enforce best practices like use of `controllerAs`,
   * `bindToController`. They always have **isolate scope** and are restricted to elements.
   *
   * Here are a few examples of how you would usually define components:
   *
   * ```js
   *   var myMod = angular.module(...);
   *   myMod.component('myComp', {
   *     template: '<div>My name is {{$ctrl.name}}</div>',
   *     controller: function() {
   *       this.name = 'shahar';
   *     }
   *   });
   *
   *   myMod.component('myComp', {
   *     template: '<div>My name is {{$ctrl.name}}</div>',
   *     bindings: {name: '@'}
   *   });
   *
   *   myMod.component('myComp', {
   *     templateUrl: 'views/my-comp.html',
   *     controller: 'MyCtrl',
   *     controllerAs: 'ctrl',
   *     bindings: {name: '@'}
   *   });
   *
   * ```
   * For more examples, and an in-depth guide, see the {@link guide/component component guide}.
   *
   * <br />
   * See also {@link ng.$compileProvider#directive $compileProvider.directive()}.
   */
this.component=function(name,options){function factory($injector){function makeInjectable(fn){/** @this */
return isFunction(fn)||isArray(fn)?function(tElement,tAttrs){return $injector.invoke(fn,this,{$element:tElement,$attrs:tAttrs})}:fn}var template=options.template||options.templateUrl?options.template:"",ddo={controller:controller,controllerAs:identifierForController(options.controller)||options.controllerAs||"$ctrl",template:makeInjectable(template),templateUrl:makeInjectable(options.templateUrl),transclude:options.transclude,scope:{},bindToController:options.bindings||{},restrict:"E",require:options.require};
// Copy annotations (starting with $) over to the DDO
return forEach(options,function(val,key){"$"===key.charAt(0)&&(ddo[key]=val)}),ddo}var controller=options.controller||function(){};
// TODO(pete) remove the following `forEach` before we release 1.6.0
// The component-router@0.2.0 looks for the annotations on the controller constructor
// Nothing in Angular looks for annotations on the factory function but we can't remove
// it from 1.5.x yet.
// Copy any annotation properties (starting with $) over to the factory and controller constructor functions
// These could be used by libraries such as the new component router
return forEach(options,function(val,key){"$"===key.charAt(0)&&(factory[key]=val,
// Don't try to copy over annotations to named controller
isFunction(controller)&&(controller[key]=val))}),factory.$inject=["$injector"],this.directive(name,factory)},/**
   * @ngdoc method
   * @name $compileProvider#aHrefSanitizationWhitelist
   * @kind function
   *
   * @description
   * Retrieves or overrides the default regular expression that is used for whitelisting of safe
   * urls during a[href] sanitization.
   *
   * The sanitization is a security measure aimed at preventing XSS attacks via html links.
   *
   * Any url about to be assigned to a[href] via data-binding is first normalized and turned into
   * an absolute url. Afterwards, the url is matched against the `aHrefSanitizationWhitelist`
   * regular expression. If a match is found, the original url is written into the dom. Otherwise,
   * the absolute url is prefixed with `'unsafe:'` string and only then is it written into the DOM.
   *
   * @param {RegExp=} regexp New regexp to whitelist urls with.
   * @returns {RegExp|ng.$compileProvider} Current RegExp if called without value or self for
   *    chaining otherwise.
   */
this.aHrefSanitizationWhitelist=function(regexp){return isDefined(regexp)?($$sanitizeUriProvider.aHrefSanitizationWhitelist(regexp),this):$$sanitizeUriProvider.aHrefSanitizationWhitelist()},/**
   * @ngdoc method
   * @name $compileProvider#imgSrcSanitizationWhitelist
   * @kind function
   *
   * @description
   * Retrieves or overrides the default regular expression that is used for whitelisting of safe
   * urls during img[src] sanitization.
   *
   * The sanitization is a security measure aimed at prevent XSS attacks via html links.
   *
   * Any url about to be assigned to img[src] via data-binding is first normalized and turned into
   * an absolute url. Afterwards, the url is matched against the `imgSrcSanitizationWhitelist`
   * regular expression. If a match is found, the original url is written into the dom. Otherwise,
   * the absolute url is prefixed with `'unsafe:'` string and only then is it written into the DOM.
   *
   * @param {RegExp=} regexp New regexp to whitelist urls with.
   * @returns {RegExp|ng.$compileProvider} Current RegExp if called without value or self for
   *    chaining otherwise.
   */
this.imgSrcSanitizationWhitelist=function(regexp){return isDefined(regexp)?($$sanitizeUriProvider.imgSrcSanitizationWhitelist(regexp),this):$$sanitizeUriProvider.imgSrcSanitizationWhitelist()};/**
   * @ngdoc method
   * @name  $compileProvider#debugInfoEnabled
   *
   * @param {boolean=} enabled update the debugInfoEnabled state if provided, otherwise just return the
   * current debugInfoEnabled state
   * @returns {*} current value if used as getter or itself (chaining) if used as setter
   *
   * @kind function
   *
   * @description
   * Call this method to enable/disable various debug runtime information in the compiler such as adding
   * binding information and a reference to the current scope on to DOM elements.
   * If enabled, the compiler will add the following to DOM elements that have been bound to the scope
   * * `ng-binding` CSS class
   * * `$binding` data property containing an array of the binding expressions
   *
   * You may want to disable this in production for a significant performance boost. See
   * {@link guide/production#disabling-debug-data Disabling Debug Data} for more.
   *
   * The default value is true.
   */
var debugInfoEnabled=!0;this.debugInfoEnabled=function(enabled){return isDefined(enabled)?(debugInfoEnabled=enabled,this):debugInfoEnabled};/**
   * @ngdoc method
   * @name  $compileProvider#preAssignBindingsEnabled
   *
   * @param {boolean=} enabled update the preAssignBindingsEnabled state if provided, otherwise just return the
   * current preAssignBindingsEnabled state
   * @returns {*} current value if used as getter or itself (chaining) if used as setter
   *
   * @kind function
   *
   * @description
   * Call this method to enable/disable whether directive controllers are assigned bindings before
   * calling the controller's constructor.
   * If enabled (true), the compiler assigns the value of each of the bindings to the
   * properties of the controller object before the constructor of this object is called.
   *
   * If disabled (false), the compiler calls the constructor first before assigning bindings.
   *
   * The default value is false.
   *
   * @deprecated
   * sinceVersion="1.6.0"
   * removeVersion="1.7.0"
   *
   * This method and the option to assign the bindings before calling the controller's constructor
   * will be removed in v1.7.0.
   */
var preAssignBindingsEnabled=!1;this.preAssignBindingsEnabled=function(enabled){return isDefined(enabled)?(preAssignBindingsEnabled=enabled,this):preAssignBindingsEnabled};var TTL=10;/**
   * @ngdoc method
   * @name $compileProvider#onChangesTtl
   * @description
   *
   * Sets the number of times `$onChanges` hooks can trigger new changes before giving up and
   * assuming that the model is unstable.
   *
   * The current default is 10 iterations.
   *
   * In complex applications it's possible that dependencies between `$onChanges` hooks and bindings will result
   * in several iterations of calls to these hooks. However if an application needs more than the default 10
   * iterations to stabilize then you should investigate what is causing the model to continuously change during
   * the `$onChanges` hook execution.
   *
   * Increasing the TTL could have performance implications, so you should not change it without proper justification.
   *
   * @param {number} limit The number of `$onChanges` hook iterations.
   * @returns {number|object} the current limit (or `this` if called as a setter for chaining)
   */
this.onChangesTtl=function(value){return arguments.length?(TTL=value,this):TTL};var commentDirectivesEnabledConfig=!0;/**
   * @ngdoc method
   * @name $compileProvider#commentDirectivesEnabled
   * @description
   *
   * It indicates to the compiler
   * whether or not directives on comments should be compiled.
   * Defaults to `true`.
   *
   * Calling this function with false disables the compilation of directives
   * on comments for the whole application.
   * This results in a compilation performance gain,
   * as the compiler doesn't have to check comments when looking for directives.
   * This should however only be used if you are sure that no comment directives are used in
   * the application (including any 3rd party directives).
   *
   * @param {boolean} enabled `false` if the compiler may ignore directives on comments
   * @returns {boolean|object} the current value (or `this` if called as a setter for chaining)
   */
this.commentDirectivesEnabled=function(value){return arguments.length?(commentDirectivesEnabledConfig=value,this):commentDirectivesEnabledConfig};var cssClassDirectivesEnabledConfig=!0;/**
   * @ngdoc method
   * @name $compileProvider#cssClassDirectivesEnabled
   * @description
   *
   * It indicates to the compiler
   * whether or not directives on element classes should be compiled.
   * Defaults to `true`.
   *
   * Calling this function with false disables the compilation of directives
   * on element classes for the whole application.
   * This results in a compilation performance gain,
   * as the compiler doesn't have to check element classes when looking for directives.
   * This should however only be used if you are sure that no class directives are used in
   * the application (including any 3rd party directives).
   *
   * @param {boolean} enabled `false` if the compiler may ignore directives on element classes
   * @returns {boolean|object} the current value (or `this` if called as a setter for chaining)
   */
this.cssClassDirectivesEnabled=function(value){return arguments.length?(cssClassDirectivesEnabledConfig=value,this):cssClassDirectivesEnabledConfig},this.$get=["$injector","$interpolate","$exceptionHandler","$templateRequest","$parse","$controller","$rootScope","$sce","$animate","$$sanitizeUri",function($injector,$interpolate,$exceptionHandler,$templateRequest,$parse,$controller,$rootScope,$sce,$animate,$$sanitizeUri){
// This function is called in a $$postDigest to trigger all the onChanges hooks in a single digest
function flushOnChangesQueue(){try{if(!--onChangesTtl)
// We have hit the TTL limit so reset everything
throw onChangesQueue=void 0,$compileMinErr("infchng","{0} $onChanges() iterations reached. Aborting!\n",TTL);
// We must run this hook in an apply since the $$postDigest runs outside apply
$rootScope.$apply(function(){for(var errors=[],i=0,ii=onChangesQueue.length;i<ii;++i)try{onChangesQueue[i]()}catch(e){errors.push(e)}if(
// Reset the queue to trigger a new schedule next time there is a change
onChangesQueue=void 0,errors.length)throw errors})}finally{onChangesTtl++}}function Attributes(element,attributesToCopy){if(attributesToCopy){var i,l,key,keys=Object.keys(attributesToCopy);for(i=0,l=keys.length;i<l;i++)key=keys[i],this[key]=attributesToCopy[key]}else this.$attr={};this.$$element=element}function setSpecialAttr(element,attrName,value){
// Attributes names that do not start with letters (such as `(click)`) cannot be set using `setAttribute`
// so we have to jump through some hoops to get such an attribute
// https://github.com/angular/angular.js/pull/13318
specialAttrHolder.innerHTML="<span "+attrName+">";var attributes=specialAttrHolder.firstChild.attributes,attribute=attributes[0];
// We have to remove the attribute from its container element before we can add it to the destination element
attributes.removeNamedItem(attribute.name),attribute.value=value,element.attributes.setNamedItem(attribute)}function safeAddClass($element,className){try{$element.addClass(className)}catch(e){}}
//================================
function compile($compileNodes,transcludeFn,maxPriority,ignoreDirective,previousCompileContext){$compileNodes instanceof jqLite||(
// jquery always rewraps, whereas we need to preserve the original selector so that we can
// modify it.
$compileNodes=jqLite($compileNodes));var compositeLinkFn=compileNodes($compileNodes,transcludeFn,$compileNodes,maxPriority,ignoreDirective,previousCompileContext);compile.$$addScopeClass($compileNodes);var namespace=null;return function(scope,cloneConnectFn,options){if(!$compileNodes)throw $compileMinErr("multilink","This element has already been linked.");assertArg(scope,"scope"),previousCompileContext&&previousCompileContext.needsNewScope&&(
// A parent directive did a replace and a directive on this element asked
// for transclusion, which caused us to lose a layer of element on which
// we could hold the new transclusion scope, so we will create it manually
// here.
scope=scope.$parent.$new()),options=options||{};var parentBoundTranscludeFn=options.parentBoundTranscludeFn,transcludeControllers=options.transcludeControllers,futureParentElement=options.futureParentElement;
// When `parentBoundTranscludeFn` is passed, it is a
// `controllersBoundTransclude` function (it was previously passed
// as `transclude` to directive.link) so we must unwrap it to get
// its `boundTranscludeFn`
parentBoundTranscludeFn&&parentBoundTranscludeFn.$$boundTransclude&&(parentBoundTranscludeFn=parentBoundTranscludeFn.$$boundTransclude),namespace||(namespace=detectNamespaceForChildElements(futureParentElement));var $linkNode;if(
// When using a directive with replace:true and templateUrl the $compileNodes
// (or a child element inside of them)
// might change, so we need to recreate the namespace adapted compileNodes
// for call to the link function.
// Note: This will already clone the nodes...
$linkNode="html"!==namespace?jqLite(wrapTemplate(namespace,jqLite("<div>").append($compileNodes).html())):cloneConnectFn?JQLitePrototype.clone.call($compileNodes):$compileNodes,transcludeControllers)for(var controllerName in transcludeControllers)$linkNode.data("$"+controllerName+"Controller",transcludeControllers[controllerName].instance);return compile.$$addScopeInfo($linkNode,scope),cloneConnectFn&&cloneConnectFn($linkNode,scope),compositeLinkFn&&compositeLinkFn(scope,$linkNode,$linkNode,parentBoundTranscludeFn),cloneConnectFn||($compileNodes=compositeLinkFn=null),$linkNode}}function detectNamespaceForChildElements(parentElement){
// TODO: Make this detect MathML as well...
var node=parentElement&&parentElement[0];return node&&"foreignobject"!==nodeName_(node)&&toString.call(node).match(/SVG/)?"svg":"html"}/**
     * Compile function matches each node in nodeList against the directives. Once all directives
     * for a particular node are collected their compile functions are executed. The compile
     * functions return values - the linking functions - are combined into a composite linking
     * function, which is the a linking function for the node.
     *
     * @param {NodeList} nodeList an array of nodes or NodeList to compile
     * @param {function(angular.Scope, cloneAttachFn=)} transcludeFn A linking function, where the
     *        scope argument is auto-generated to the new child of the transcluded parent scope.
     * @param {DOMElement=} $rootElement If the nodeList is the root of the compilation tree then
     *        the rootElement must be set the jqLite collection of the compile root. This is
     *        needed so that the jqLite collection items can be replaced with widgets.
     * @param {number=} maxPriority Max directive priority.
     * @returns {Function} A composite linking function of all of the matched directives or null.
     */
function compileNodes(nodeList,transcludeFn,$rootElement,maxPriority,ignoreDirective,previousCompileContext){function compositeLinkFn(scope,nodeList,$rootElement,parentBoundTranscludeFn){var nodeLinkFn,childLinkFn,node,childScope,i,ii,idx,childBoundTranscludeFn,stableNodeList;if(nodeLinkFnFound){
// copy nodeList so that if a nodeLinkFn removes or adds an element at this DOM level our
// offsets don't get screwed up
var nodeListLength=nodeList.length;
// create a sparse array by only copying the elements which have a linkFn
for(stableNodeList=new Array(nodeListLength),i=0;i<linkFns.length;i+=3)idx=linkFns[i],stableNodeList[idx]=nodeList[idx]}else stableNodeList=nodeList;for(i=0,ii=linkFns.length;i<ii;)node=stableNodeList[linkFns[i++]],nodeLinkFn=linkFns[i++],childLinkFn=linkFns[i++],nodeLinkFn?(nodeLinkFn.scope?(childScope=scope.$new(),compile.$$addScopeInfo(jqLite(node),childScope)):childScope=scope,childBoundTranscludeFn=nodeLinkFn.transcludeOnThisElement?createBoundTranscludeFn(scope,nodeLinkFn.transclude,parentBoundTranscludeFn):!nodeLinkFn.templateOnThisElement&&parentBoundTranscludeFn?parentBoundTranscludeFn:!parentBoundTranscludeFn&&transcludeFn?createBoundTranscludeFn(scope,transcludeFn):null,nodeLinkFn(childLinkFn,childScope,node,$rootElement,childBoundTranscludeFn)):childLinkFn&&childLinkFn(scope,node.childNodes,void 0,parentBoundTranscludeFn)}for(var attrs,directives,nodeLinkFn,childNodes,childLinkFn,linkFnFound,nodeLinkFnFound,linkFns=[],
// `nodeList` can be either an element's `.childNodes` (live NodeList)
// or a jqLite/jQuery collection or an array
notLiveList=isArray(nodeList)||nodeList instanceof jqLite,i=0;i<nodeList.length;i++)attrs=new Attributes,
// Support: IE 11 only
// Workaround for #11781 and #14924
11===msie&&mergeConsecutiveTextNodes(nodeList,i,notLiveList),
// We must always refer to `nodeList[i]` hereafter,
// since the nodes can be replaced underneath us.
directives=collectDirectives(nodeList[i],[],attrs,0===i?maxPriority:void 0,ignoreDirective),nodeLinkFn=directives.length?applyDirectivesToNode(directives,nodeList[i],attrs,transcludeFn,$rootElement,null,[],[],previousCompileContext):null,nodeLinkFn&&nodeLinkFn.scope&&compile.$$addScopeClass(attrs.$$element),childLinkFn=nodeLinkFn&&nodeLinkFn.terminal||!(childNodes=nodeList[i].childNodes)||!childNodes.length?null:compileNodes(childNodes,nodeLinkFn?(nodeLinkFn.transcludeOnThisElement||!nodeLinkFn.templateOnThisElement)&&nodeLinkFn.transclude:transcludeFn),(nodeLinkFn||childLinkFn)&&(linkFns.push(i,nodeLinkFn,childLinkFn),linkFnFound=!0,nodeLinkFnFound=nodeLinkFnFound||nodeLinkFn),
//use the previous context only for the first element in the virtual group
previousCompileContext=null;
// return a linking function if we have found anything, null otherwise
return linkFnFound?compositeLinkFn:null}function mergeConsecutiveTextNodes(nodeList,idx,notLiveList){var sibling,node=nodeList[idx],parent=node.parentNode;if(node.nodeType===NODE_TYPE_TEXT)for(;;){if(sibling=parent?node.nextSibling:nodeList[idx+1],!sibling||sibling.nodeType!==NODE_TYPE_TEXT)break;node.nodeValue=node.nodeValue+sibling.nodeValue,sibling.parentNode&&sibling.parentNode.removeChild(sibling),notLiveList&&sibling===nodeList[idx+1]&&nodeList.splice(idx+1,1)}}function createBoundTranscludeFn(scope,transcludeFn,previousBoundTranscludeFn){function boundTranscludeFn(transcludedScope,cloneFn,controllers,futureParentElement,containingScope){return transcludedScope||(transcludedScope=scope.$new(!1,containingScope),transcludedScope.$$transcluded=!0),transcludeFn(transcludedScope,cloneFn,{parentBoundTranscludeFn:previousBoundTranscludeFn,transcludeControllers:controllers,futureParentElement:futureParentElement})}
// We need  to attach the transclusion slots onto the `boundTranscludeFn`
// so that they are available inside the `controllersBoundTransclude` function
var boundSlots=boundTranscludeFn.$$slots=createMap();for(var slotName in transcludeFn.$$slots)transcludeFn.$$slots[slotName]?boundSlots[slotName]=createBoundTranscludeFn(scope,transcludeFn.$$slots[slotName],previousBoundTranscludeFn):boundSlots[slotName]=null;return boundTranscludeFn}/**
     * Looks for directives on the given node and adds them to the directive collection which is
     * sorted.
     *
     * @param node Node to search.
     * @param directives An array to which the directives are added to. This array is sorted before
     *        the function returns.
     * @param attrs The shared attrs object which is used to populate the normalized attributes.
     * @param {number=} maxPriority Max directive priority.
     */
function collectDirectives(node,directives,attrs,maxPriority,ignoreDirective){var match,nodeName,className,nodeType=node.nodeType,attrsMap=attrs.$attr;switch(nodeType){case NODE_TYPE_ELEMENT:/* Element */
nodeName=nodeName_(node),
// use the node name: <directive>
addDirective(directives,directiveNormalize(nodeName),"E",maxPriority,ignoreDirective);
// iterate over the attributes
for(var attr,name,nName,ngAttrName,value,isNgAttr,nAttrs=node.attributes,j=0,jj=nAttrs&&nAttrs.length;j<jj;j++){var attrStartName=!1,attrEndName=!1;attr=nAttrs[j],name=attr.name,value=attr.value,
// support ngAttr attribute binding
ngAttrName=directiveNormalize(name),isNgAttr=NG_ATTR_BINDING.test(ngAttrName),isNgAttr&&(name=name.replace(PREFIX_REGEXP,"").substr(8).replace(/_(.)/g,function(match,letter){return letter.toUpperCase()}));var multiElementMatch=ngAttrName.match(MULTI_ELEMENT_DIR_RE);multiElementMatch&&directiveIsMultiElement(multiElementMatch[1])&&(attrStartName=name,attrEndName=name.substr(0,name.length-5)+"end",name=name.substr(0,name.length-6)),nName=directiveNormalize(name.toLowerCase()),attrsMap[nName]=name,!isNgAttr&&attrs.hasOwnProperty(nName)||(attrs[nName]=value,getBooleanAttrName(node,nName)&&(attrs[nName]=!0)),addAttrInterpolateDirective(node,directives,value,nName,isNgAttr),addDirective(directives,nName,"A",maxPriority,ignoreDirective,attrStartName,attrEndName)}
// use class as directive
if("input"===nodeName&&"hidden"===node.getAttribute("type")&&
// Hidden input elements can have strange behaviour when navigating back to the page
// This tells the browser not to try to cache and reinstate previous values
node.setAttribute("autocomplete","off"),!cssClassDirectivesEnabled)break;if(className=node.className,isObject(className)&&(
// Maybe SVGAnimatedString
className=className.animVal),isString(className)&&""!==className)for(;match=CLASS_DIRECTIVE_REGEXP.exec(className);)nName=directiveNormalize(match[2]),addDirective(directives,nName,"C",maxPriority,ignoreDirective)&&(attrs[nName]=trim(match[3])),className=className.substr(match.index+match[0].length);break;case NODE_TYPE_TEXT:/* Text Node */
addTextInterpolateDirective(directives,node.nodeValue);break;case NODE_TYPE_COMMENT:/* Comment */
if(!commentDirectivesEnabled)break;collectCommentDirectives(node,directives,attrs,maxPriority,ignoreDirective)}return directives.sort(byPriority),directives}function collectCommentDirectives(node,directives,attrs,maxPriority,ignoreDirective){
// function created because of performance, try/catch disables
// the optimization of the whole function #14848
try{var match=COMMENT_DIRECTIVE_REGEXP.exec(node.nodeValue);if(match){var nName=directiveNormalize(match[1]);addDirective(directives,nName,"M",maxPriority,ignoreDirective)&&(attrs[nName]=trim(match[2]))}}catch(e){}}/**
     * Given a node with a directive-start it collects all of the siblings until it finds
     * directive-end.
     * @param node
     * @param attrStart
     * @param attrEnd
     * @returns {*}
     */
function groupScan(node,attrStart,attrEnd){var nodes=[],depth=0;if(attrStart&&node.hasAttribute&&node.hasAttribute(attrStart)){do{if(!node)throw $compileMinErr("uterdir","Unterminated attribute, found '{0}' but no matching '{1}' found.",attrStart,attrEnd);node.nodeType===NODE_TYPE_ELEMENT&&(node.hasAttribute(attrStart)&&depth++,node.hasAttribute(attrEnd)&&depth--),nodes.push(node),node=node.nextSibling}while(depth>0)}else nodes.push(node);return jqLite(nodes)}/**
     * Wrapper for linking function which converts normal linking function into a grouped
     * linking function.
     * @param linkFn
     * @param attrStart
     * @param attrEnd
     * @returns {Function}
     */
function groupElementsLinkFnWrapper(linkFn,attrStart,attrEnd){return function(scope,element,attrs,controllers,transcludeFn){return element=groupScan(element[0],attrStart,attrEnd),linkFn(scope,element,attrs,controllers,transcludeFn)}}/**
     * A function generator that is used to support both eager and lazy compilation
     * linking function.
     * @param eager
     * @param $compileNodes
     * @param transcludeFn
     * @param maxPriority
     * @param ignoreDirective
     * @param previousCompileContext
     * @returns {Function}
     */
function compilationGenerator(eager,$compileNodes,transcludeFn,maxPriority,ignoreDirective,previousCompileContext){var compiled;/** @this */
return eager?compile($compileNodes,transcludeFn,maxPriority,ignoreDirective,previousCompileContext):function(){
// Null out all of these references in order to make them eligible for garbage collection
// since this is a potentially long lived closure
return compiled||(compiled=compile($compileNodes,transcludeFn,maxPriority,ignoreDirective,previousCompileContext),$compileNodes=transcludeFn=previousCompileContext=null),compiled.apply(this,arguments)}}/**
     * Once the directives have been collected, their compile functions are executed. This method
     * is responsible for inlining directive templates as well as terminating the application
     * of the directives if the terminal directive has been reached.
     *
     * @param {Array} directives Array of collected directives to execute their compile function.
     *        this needs to be pre-sorted by priority order.
     * @param {Node} compileNode The raw DOM node to apply the compile functions to
     * @param {Object} templateAttrs The shared attribute function
     * @param {function(angular.Scope, cloneAttachFn=)} transcludeFn A linking function, where the
     *                                                  scope argument is auto-generated to the new
     *                                                  child of the transcluded parent scope.
     * @param {JQLite} jqCollection If we are working on the root of the compile tree then this
     *                              argument has the root jqLite array so that we can replace nodes
     *                              on it.
     * @param {Object=} originalReplaceDirective An optional directive that will be ignored when
     *                                           compiling the transclusion.
     * @param {Array.<Function>} preLinkFns
     * @param {Array.<Function>} postLinkFns
     * @param {Object} previousCompileContext Context used for previous compilation of the current
     *                                        node
     * @returns {Function} linkFn
     */
function applyDirectivesToNode(directives,compileNode,templateAttrs,transcludeFn,jqCollection,originalReplaceDirective,preLinkFns,postLinkFns,previousCompileContext){
////////////////////
function addLinkFns(pre,post,attrStart,attrEnd){pre&&(attrStart&&(pre=groupElementsLinkFnWrapper(pre,attrStart,attrEnd)),pre.require=directive.require,pre.directiveName=directiveName,(newIsolateScopeDirective===directive||directive.$$isolateScope)&&(pre=cloneAndAnnotateFn(pre,{isolateScope:!0})),preLinkFns.push(pre)),post&&(attrStart&&(post=groupElementsLinkFnWrapper(post,attrStart,attrEnd)),post.require=directive.require,post.directiveName=directiveName,(newIsolateScopeDirective===directive||directive.$$isolateScope)&&(post=cloneAndAnnotateFn(post,{isolateScope:!0})),postLinkFns.push(post))}function nodeLinkFn(childLinkFn,scope,linkNode,$rootElement,boundTranscludeFn){
// This is the function that is injected as `$transclude`.
// Note: all arguments are optional!
function controllersBoundTransclude(scope,cloneAttachFn,futureParentElement,slotName){var transcludeControllers;if(
// No scope passed in:
isScope(scope)||(slotName=futureParentElement,futureParentElement=cloneAttachFn,cloneAttachFn=scope,scope=void 0),hasElementTranscludeDirective&&(transcludeControllers=elementControllers),futureParentElement||(futureParentElement=hasElementTranscludeDirective?$element.parent():$element),!slotName)return boundTranscludeFn(scope,cloneAttachFn,transcludeControllers,futureParentElement,scopeToChild);
// slotTranscludeFn can be one of three things:
//  * a transclude function - a filled slot
//  * `null` - an optional slot that was not filled
//  * `undefined` - a slot that was not declared (i.e. invalid)
var slotTranscludeFn=boundTranscludeFn.$$slots[slotName];if(slotTranscludeFn)return slotTranscludeFn(scope,cloneAttachFn,transcludeControllers,futureParentElement,scopeToChild);if(isUndefined(slotTranscludeFn))throw $compileMinErr("noslot",'No parent directive that requires a transclusion with slot name "{0}". Element: {1}',slotName,startingTag($element))}var i,ii,linkFn,isolateScope,controllerScope,elementControllers,transcludeFn,$element,attrs,scopeBindingInfo;compileNode===linkNode?(attrs=templateAttrs,$element=templateAttrs.$$element):($element=jqLite(linkNode),attrs=new Attributes($element,templateAttrs)),controllerScope=scope,newIsolateScopeDirective?isolateScope=scope.$new(!0):newScopeDirective&&(controllerScope=scope.$parent),boundTranscludeFn&&(
// track `boundTranscludeFn` so it can be unwrapped if `transcludeFn`
// is later passed as `parentBoundTranscludeFn` to `publicLinkFn`
transcludeFn=controllersBoundTransclude,transcludeFn.$$boundTransclude=boundTranscludeFn,
// expose the slots on the `$transclude` function
transcludeFn.isSlotFilled=function(slotName){return!!boundTranscludeFn.$$slots[slotName]}),controllerDirectives&&(elementControllers=setupControllers($element,attrs,transcludeFn,controllerDirectives,isolateScope,scope,newIsolateScopeDirective)),newIsolateScopeDirective&&(
// Initialize isolate scope bindings for new isolate scope directive.
compile.$$addScopeInfo($element,isolateScope,!0,!(templateDirective&&(templateDirective===newIsolateScopeDirective||templateDirective===newIsolateScopeDirective.$$originalDirective))),compile.$$addScopeClass($element,!0),isolateScope.$$isolateBindings=newIsolateScopeDirective.$$isolateBindings,scopeBindingInfo=initializeDirectiveBindings(scope,attrs,isolateScope,isolateScope.$$isolateBindings,newIsolateScopeDirective),scopeBindingInfo.removeWatches&&isolateScope.$on("$destroy",scopeBindingInfo.removeWatches));
// Initialize bindToController bindings
for(var name in elementControllers){var controllerDirective=controllerDirectives[name],controller=elementControllers[name],bindings=controllerDirective.$$bindings.bindToController;if(preAssignBindingsEnabled){bindings?controller.bindingInfo=initializeDirectiveBindings(controllerScope,attrs,controller.instance,bindings,controllerDirective):controller.bindingInfo={};var controllerResult=controller();controllerResult!==controller.instance&&(
// If the controller constructor has a return value, overwrite the instance
// from setupControllers
controller.instance=controllerResult,$element.data("$"+controllerDirective.name+"Controller",controllerResult),controller.bindingInfo.removeWatches&&controller.bindingInfo.removeWatches(),controller.bindingInfo=initializeDirectiveBindings(controllerScope,attrs,controller.instance,bindings,controllerDirective))}else controller.instance=controller(),$element.data("$"+controllerDirective.name+"Controller",controller.instance),controller.bindingInfo=initializeDirectiveBindings(controllerScope,attrs,controller.instance,bindings,controllerDirective)}
// PRELINKING
for(
// Bind the required controllers to the controller, if `require` is an object and `bindToController` is truthy
forEach(controllerDirectives,function(controllerDirective,name){var require=controllerDirective.require;controllerDirective.bindToController&&!isArray(require)&&isObject(require)&&extend(elementControllers[name].instance,getControllers(name,require,$element,elementControllers))}),
// Handle the init and destroy lifecycle hooks on all controllers that have them
forEach(elementControllers,function(controller){var controllerInstance=controller.instance;if(isFunction(controllerInstance.$onChanges))try{controllerInstance.$onChanges(controller.bindingInfo.initialChanges)}catch(e){$exceptionHandler(e)}if(isFunction(controllerInstance.$onInit))try{controllerInstance.$onInit()}catch(e){$exceptionHandler(e)}isFunction(controllerInstance.$doCheck)&&(controllerScope.$watch(function(){controllerInstance.$doCheck()}),controllerInstance.$doCheck()),isFunction(controllerInstance.$onDestroy)&&controllerScope.$on("$destroy",function(){controllerInstance.$onDestroy()})}),i=0,ii=preLinkFns.length;i<ii;i++)linkFn=preLinkFns[i],invokeLinkFn(linkFn,linkFn.isolateScope?isolateScope:scope,$element,attrs,linkFn.require&&getControllers(linkFn.directiveName,linkFn.require,$element,elementControllers),transcludeFn);
// RECURSION
// We only pass the isolate scope, if the isolate directive has a template,
// otherwise the child elements do not belong to the isolate directive.
var scopeToChild=scope;
// POSTLINKING
for(newIsolateScopeDirective&&(newIsolateScopeDirective.template||null===newIsolateScopeDirective.templateUrl)&&(scopeToChild=isolateScope),childLinkFn&&childLinkFn(scopeToChild,linkNode.childNodes,void 0,boundTranscludeFn),i=postLinkFns.length-1;i>=0;i--)linkFn=postLinkFns[i],invokeLinkFn(linkFn,linkFn.isolateScope?isolateScope:scope,$element,attrs,linkFn.require&&getControllers(linkFn.directiveName,linkFn.require,$element,elementControllers),transcludeFn);
// Trigger $postLink lifecycle hooks
forEach(elementControllers,function(controller){var controllerInstance=controller.instance;isFunction(controllerInstance.$postLink)&&controllerInstance.$postLink()})}previousCompileContext=previousCompileContext||{};
// executes all directives on the current element
for(var directive,directiveName,$template,linkFn,directiveValue,terminalPriority=-Number.MAX_VALUE,newScopeDirective=previousCompileContext.newScopeDirective,controllerDirectives=previousCompileContext.controllerDirectives,newIsolateScopeDirective=previousCompileContext.newIsolateScopeDirective,templateDirective=previousCompileContext.templateDirective,nonTlbTranscludeDirective=previousCompileContext.nonTlbTranscludeDirective,hasTranscludeDirective=!1,hasTemplate=!1,hasElementTranscludeDirective=previousCompileContext.hasElementTranscludeDirective,$compileNode=templateAttrs.$$element=jqLite(compileNode),replaceDirective=originalReplaceDirective,childTranscludeFn=transcludeFn,didScanForMultipleTransclusion=!1,mightHaveMultipleTransclusionError=!1,i=0,ii=directives.length;i<ii;i++){directive=directives[i];var attrStart=directive.$$start,attrEnd=directive.$$end;if(
// collect multiblock sections
attrStart&&($compileNode=groupScan(compileNode,attrStart,attrEnd)),$template=void 0,terminalPriority>directive.priority)break;
// If we encounter a condition that can result in transclusion on the directive,
// then scan ahead in the remaining directives for others that may cause a multiple
// transclusion error to be thrown during the compilation process.  If a matching directive
// is found, then we know that when we encounter a transcluded directive, we need to eagerly
// compile the `transclude` function rather than doing it lazily in order to throw
// exceptions at the correct time
if(directiveValue=directive.scope,directiveValue&&(
// skip the check for directives with async templates, we'll check the derived sync
// directive when the template arrives
directive.templateUrl||(isObject(directiveValue)?(
// This directive is trying to add an isolated scope.
// Check that there is no scope of any kind already
assertNoDuplicate("new/isolated scope",newIsolateScopeDirective||newScopeDirective,directive,$compileNode),newIsolateScopeDirective=directive):
// This directive is trying to add a child scope.
// Check that there is no isolated scope already
assertNoDuplicate("new/isolated scope",newIsolateScopeDirective,directive,$compileNode)),newScopeDirective=newScopeDirective||directive),directiveName=directive.name,!didScanForMultipleTransclusion&&(directive.replace&&(directive.templateUrl||directive.template)||directive.transclude&&!directive.$$tlb)){for(var candidateDirective,scanningIndex=i+1;candidateDirective=directives[scanningIndex++];)if(candidateDirective.transclude&&!candidateDirective.$$tlb||candidateDirective.replace&&(candidateDirective.templateUrl||candidateDirective.template)){mightHaveMultipleTransclusionError=!0;break}didScanForMultipleTransclusion=!0}if(!directive.templateUrl&&directive.controller&&(controllerDirectives=controllerDirectives||createMap(),assertNoDuplicate("'"+directiveName+"' controller",controllerDirectives[directiveName],directive,$compileNode),controllerDirectives[directiveName]=directive),directiveValue=directive.transclude)if(hasTranscludeDirective=!0,
// Special case ngIf and ngRepeat so that we don't complain about duplicate transclusion.
// This option should only be used by directives that know how to safely handle element transclusion,
// where the transcluded nodes are added or replaced after linking.
directive.$$tlb||(assertNoDuplicate("transclusion",nonTlbTranscludeDirective,directive,$compileNode),nonTlbTranscludeDirective=directive),"element"===directiveValue)hasElementTranscludeDirective=!0,terminalPriority=directive.priority,$template=$compileNode,$compileNode=templateAttrs.$$element=jqLite(compile.$$createComment(directiveName,templateAttrs[directiveName])),compileNode=$compileNode[0],replaceWith(jqCollection,sliceArgs($template),compileNode),
// Support: Chrome < 50
// https://github.com/angular/angular.js/issues/14041
// In the versions of V8 prior to Chrome 50, the document fragment that is created
// in the `replaceWith` function is improperly garbage collected despite still
// being referenced by the `parentNode` property of all of the child nodes.  By adding
// a reference to the fragment via a different property, we can avoid that incorrect
// behavior.
// TODO: remove this line after Chrome 50 has been released
$template[0].$$parentNode=$template[0].parentNode,childTranscludeFn=compilationGenerator(mightHaveMultipleTransclusionError,$template,transcludeFn,terminalPriority,replaceDirective&&replaceDirective.name,{
// Don't pass in:
// - controllerDirectives - otherwise we'll create duplicates controllers
// - newIsolateScopeDirective or templateDirective - combining templates with
//   element transclusion doesn't make sense.
//
// We need only nonTlbTranscludeDirective so that we prevent putting transclusion
// on the same element more than once.
nonTlbTranscludeDirective:nonTlbTranscludeDirective});else{var slots=createMap();if(isObject(directiveValue)){
// We have transclusion slots,
// collect them up, compile them and store their transclusion functions
$template=[];var slotMap=createMap(),filledSlots=createMap();
// Parse the element selectors
forEach(directiveValue,function(elementSelector,slotName){
// If an element selector starts with a ? then it is optional
var optional="?"===elementSelector.charAt(0);elementSelector=optional?elementSelector.substring(1):elementSelector,slotMap[elementSelector]=slotName,
// We explicitly assign `null` since this implies that a slot was defined but not filled.
// Later when calling boundTransclusion functions with a slot name we only error if the
// slot is `undefined`
slots[slotName]=null,
// filledSlots contains `true` for all slots that are either optional or have been
// filled. This is used to check that we have not missed any required slots
filledSlots[slotName]=optional}),
// Add the matching elements into their slot
forEach($compileNode.contents(),function(node){var slotName=slotMap[directiveNormalize(nodeName_(node))];slotName?(filledSlots[slotName]=!0,slots[slotName]=slots[slotName]||[],slots[slotName].push(node)):$template.push(node)}),
// Check for required slots that were not filled
forEach(filledSlots,function(filled,slotName){if(!filled)throw $compileMinErr("reqslot","Required transclusion slot `{0}` was not filled.",slotName)});for(var slotName in slots)slots[slotName]&&(
// Only define a transclusion function if the slot was filled
slots[slotName]=compilationGenerator(mightHaveMultipleTransclusionError,slots[slotName],transcludeFn))}else $template=jqLite(jqLiteClone(compileNode)).contents();$compileNode.empty(),// clear contents
childTranscludeFn=compilationGenerator(mightHaveMultipleTransclusionError,$template,transcludeFn,void 0,void 0,{needsNewScope:directive.$$isolateScope||directive.$$newScope}),childTranscludeFn.$$slots=slots}if(directive.template)if(hasTemplate=!0,assertNoDuplicate("template",templateDirective,directive,$compileNode),templateDirective=directive,directiveValue=isFunction(directive.template)?directive.template($compileNode,templateAttrs):directive.template,directiveValue=denormalizeTemplate(directiveValue),directive.replace){if(replaceDirective=directive,$template=jqLiteIsTextNode(directiveValue)?[]:removeComments(wrapTemplate(directive.templateNamespace,trim(directiveValue))),compileNode=$template[0],1!==$template.length||compileNode.nodeType!==NODE_TYPE_ELEMENT)throw $compileMinErr("tplrt","Template for directive '{0}' must have exactly one root element. {1}",directiveName,"");replaceWith(jqCollection,$compileNode,compileNode);var newTemplateAttrs={$attr:{}},templateDirectives=collectDirectives(compileNode,[],newTemplateAttrs),unprocessedDirectives=directives.splice(i+1,directives.length-(i+1));(newIsolateScopeDirective||newScopeDirective)&&
// The original directive caused the current element to be replaced but this element
// also needs to have a new scope, so we need to tell the template directives
// that they would need to get their scope from further up, if they require transclusion
markDirectiveScope(templateDirectives,newIsolateScopeDirective,newScopeDirective),directives=directives.concat(templateDirectives).concat(unprocessedDirectives),mergeTemplateAttributes(templateAttrs,newTemplateAttrs),ii=directives.length}else $compileNode.html(directiveValue);if(directive.templateUrl)hasTemplate=!0,assertNoDuplicate("template",templateDirective,directive,$compileNode),templateDirective=directive,directive.replace&&(replaceDirective=directive),
// eslint-disable-next-line no-func-assign
nodeLinkFn=compileTemplateUrl(directives.splice(i,directives.length-i),$compileNode,templateAttrs,jqCollection,hasTranscludeDirective&&childTranscludeFn,preLinkFns,postLinkFns,{controllerDirectives:controllerDirectives,newScopeDirective:newScopeDirective!==directive&&newScopeDirective,newIsolateScopeDirective:newIsolateScopeDirective,templateDirective:templateDirective,nonTlbTranscludeDirective:nonTlbTranscludeDirective}),ii=directives.length;else if(directive.compile)try{linkFn=directive.compile($compileNode,templateAttrs,childTranscludeFn);var context=directive.$$originalDirective||directive;isFunction(linkFn)?addLinkFns(null,bind(context,linkFn),attrStart,attrEnd):linkFn&&addLinkFns(bind(context,linkFn.pre),bind(context,linkFn.post),attrStart,attrEnd)}catch(e){$exceptionHandler(e,startingTag($compileNode))}directive.terminal&&(nodeLinkFn.terminal=!0,terminalPriority=Math.max(terminalPriority,directive.priority))}
// might be normal or delayed nodeLinkFn depending on if templateUrl is present
return nodeLinkFn.scope=newScopeDirective&&newScopeDirective.scope===!0,nodeLinkFn.transcludeOnThisElement=hasTranscludeDirective,nodeLinkFn.templateOnThisElement=hasTemplate,nodeLinkFn.transclude=childTranscludeFn,previousCompileContext.hasElementTranscludeDirective=hasElementTranscludeDirective,nodeLinkFn}function getControllers(directiveName,require,$element,elementControllers){var value;if(isString(require)){var match=require.match(REQUIRE_PREFIX_REGEXP),name=require.substring(match[0].length),inheritType=match[1]||match[3],optional="?"===match[2];if(
//If only parents then start at the parent element
"^^"===inheritType?$element=$element.parent():(value=elementControllers&&elementControllers[name],value=value&&value.instance),!value){var dataName="$"+name+"Controller";value=inheritType?$element.inheritedData(dataName):$element.data(dataName)}if(!value&&!optional)throw $compileMinErr("ctreq","Controller '{0}', required by directive '{1}', can't be found!",name,directiveName)}else if(isArray(require)){value=[];for(var i=0,ii=require.length;i<ii;i++)value[i]=getControllers(directiveName,require[i],$element,elementControllers)}else isObject(require)&&(value={},forEach(require,function(controller,property){value[property]=getControllers(directiveName,controller,$element,elementControllers)}));return value||null}function setupControllers($element,attrs,transcludeFn,controllerDirectives,isolateScope,scope,newIsolateScopeDirective){var elementControllers=createMap();for(var controllerKey in controllerDirectives){var directive=controllerDirectives[controllerKey],locals={$scope:directive===newIsolateScopeDirective||directive.$$isolateScope?isolateScope:scope,$element:$element,$attrs:attrs,$transclude:transcludeFn},controller=directive.controller;"@"===controller&&(controller=attrs[directive.name]);var controllerInstance=$controller(controller,locals,!0,directive.controllerAs);
// For directives with element transclusion the element is a comment.
// In this case .data will not attach any data.
// Instead, we save the controllers for the element in a local hash and attach to .data
// later, once we have the actual element.
elementControllers[directive.name]=controllerInstance,$element.data("$"+directive.name+"Controller",controllerInstance.instance)}return elementControllers}
// Depending upon the context in which a directive finds itself it might need to have a new isolated
// or child scope created. For instance:
// * if the directive has been pulled into a template because another directive with a higher priority
// asked for element transclusion
// * if the directive itself asks for transclusion but it is at the root of a template and the original
// element was replaced. See https://github.com/angular/angular.js/issues/12936
function markDirectiveScope(directives,isolateScope,newScope){for(var j=0,jj=directives.length;j<jj;j++)directives[j]=inherit(directives[j],{$$isolateScope:isolateScope,$$newScope:newScope})}/**
     * looks up the directive and decorates it with exception handling and proper parameters. We
     * call this the boundDirective.
     *
     * @param {string} name name of the directive to look up.
     * @param {string} location The directive must be found in specific format.
     *   String containing any of theses characters:
     *
     *   * `E`: element name
     *   * `A': attribute
     *   * `C`: class
     *   * `M`: comment
     * @returns {boolean} true if directive was added.
     */
function addDirective(tDirectives,name,location,maxPriority,ignoreDirective,startAttrName,endAttrName){if(name===ignoreDirective)return null;var match=null;if(hasDirectives.hasOwnProperty(name))for(var directive,directives=$injector.get(name+Suffix),i=0,ii=directives.length;i<ii;i++)if(directive=directives[i],(isUndefined(maxPriority)||maxPriority>directive.priority)&&directive.restrict.indexOf(location)!==-1){if(startAttrName&&(directive=inherit(directive,{$$start:startAttrName,$$end:endAttrName})),!directive.$$bindings){var bindings=directive.$$bindings=parseDirectiveBindings(directive,directive.name);isObject(bindings.isolateScope)&&(directive.$$isolateBindings=bindings.isolateScope)}tDirectives.push(directive),match=directive}return match}/**
     * looks up the directive and returns true if it is a multi-element directive,
     * and therefore requires DOM nodes between -start and -end markers to be grouped
     * together.
     *
     * @param {string} name name of the directive to look up.
     * @returns true if directive was registered as multi-element.
     */
function directiveIsMultiElement(name){if(hasDirectives.hasOwnProperty(name))for(var directive,directives=$injector.get(name+Suffix),i=0,ii=directives.length;i<ii;i++)if(directive=directives[i],directive.multiElement)return!0;return!1}/**
     * When the element is replaced with HTML template then the new attributes
     * on the template need to be merged with the existing attributes in the DOM.
     * The desired effect is to have both of the attributes present.
     *
     * @param {object} dst destination attributes (original DOM)
     * @param {object} src source attributes (from the directive template)
     */
function mergeTemplateAttributes(dst,src){var srcAttr=src.$attr,dstAttr=dst.$attr;
// reapply the old attributes to the new element
forEach(dst,function(value,key){"$"!==key.charAt(0)&&(src[key]&&src[key]!==value&&(value.length?value+=("style"===key?";":" ")+src[key]:value=src[key]),dst.$set(key,value,!0,srcAttr[key]))}),
// copy the new attributes on the old attrs object
forEach(src,function(value,key){
// Check if we already set this attribute in the loop above.
// `dst` will never contain hasOwnProperty as DOM parser won't let it.
// You will get an "InvalidCharacterError: DOM Exception 5" error if you
// have an attribute like "has-own-property" or "data-has-own-property", etc.
dst.hasOwnProperty(key)||"$"===key.charAt(0)||(dst[key]=value,"class"!==key&&"style"!==key&&(dstAttr[key]=srcAttr[key]))})}function compileTemplateUrl(directives,$compileNode,tAttrs,$rootElement,childTranscludeFn,preLinkFns,postLinkFns,previousCompileContext){var afterTemplateNodeLinkFn,afterTemplateChildLinkFn,linkQueue=[],beforeTemplateCompileNode=$compileNode[0],origAsyncDirective=directives.shift(),derivedSyncDirective=inherit(origAsyncDirective,{templateUrl:null,transclude:null,replace:null,$$originalDirective:origAsyncDirective}),templateUrl=isFunction(origAsyncDirective.templateUrl)?origAsyncDirective.templateUrl($compileNode,tAttrs):origAsyncDirective.templateUrl,templateNamespace=origAsyncDirective.templateNamespace;return $compileNode.empty(),$templateRequest(templateUrl).then(function(content){var compileNode,tempTemplateAttrs,$template,childBoundTranscludeFn;if(content=denormalizeTemplate(content),origAsyncDirective.replace){if($template=jqLiteIsTextNode(content)?[]:removeComments(wrapTemplate(templateNamespace,trim(content))),compileNode=$template[0],1!==$template.length||compileNode.nodeType!==NODE_TYPE_ELEMENT)throw $compileMinErr("tplrt","Template for directive '{0}' must have exactly one root element. {1}",origAsyncDirective.name,templateUrl);tempTemplateAttrs={$attr:{}},replaceWith($rootElement,$compileNode,compileNode);var templateDirectives=collectDirectives(compileNode,[],tempTemplateAttrs);isObject(origAsyncDirective.scope)&&
// the original directive that caused the template to be loaded async required
// an isolate scope
markDirectiveScope(templateDirectives,!0),directives=templateDirectives.concat(directives),mergeTemplateAttributes(tAttrs,tempTemplateAttrs)}else compileNode=beforeTemplateCompileNode,$compileNode.html(content);for(directives.unshift(derivedSyncDirective),afterTemplateNodeLinkFn=applyDirectivesToNode(directives,compileNode,tAttrs,childTranscludeFn,$compileNode,origAsyncDirective,preLinkFns,postLinkFns,previousCompileContext),forEach($rootElement,function(node,i){node===compileNode&&($rootElement[i]=$compileNode[0])}),afterTemplateChildLinkFn=compileNodes($compileNode[0].childNodes,childTranscludeFn);linkQueue.length;){var scope=linkQueue.shift(),beforeTemplateLinkNode=linkQueue.shift(),linkRootElement=linkQueue.shift(),boundTranscludeFn=linkQueue.shift(),linkNode=$compileNode[0];if(!scope.$$destroyed){if(beforeTemplateLinkNode!==beforeTemplateCompileNode){var oldClasses=beforeTemplateLinkNode.className;previousCompileContext.hasElementTranscludeDirective&&origAsyncDirective.replace||(
// it was cloned therefore we have to clone as well.
linkNode=jqLiteClone(compileNode)),replaceWith(linkRootElement,jqLite(beforeTemplateLinkNode),linkNode),
// Copy in CSS classes from original node
safeAddClass(jqLite(linkNode),oldClasses)}childBoundTranscludeFn=afterTemplateNodeLinkFn.transcludeOnThisElement?createBoundTranscludeFn(scope,afterTemplateNodeLinkFn.transclude,boundTranscludeFn):boundTranscludeFn,afterTemplateNodeLinkFn(afterTemplateChildLinkFn,scope,linkNode,$rootElement,childBoundTranscludeFn)}}linkQueue=null})["catch"](function(error){error instanceof Error&&$exceptionHandler(error)}),function(ignoreChildLinkFn,scope,node,rootElement,boundTranscludeFn){var childBoundTranscludeFn=boundTranscludeFn;scope.$$destroyed||(linkQueue?linkQueue.push(scope,node,rootElement,childBoundTranscludeFn):(afterTemplateNodeLinkFn.transcludeOnThisElement&&(childBoundTranscludeFn=createBoundTranscludeFn(scope,afterTemplateNodeLinkFn.transclude,boundTranscludeFn)),afterTemplateNodeLinkFn(afterTemplateChildLinkFn,scope,node,rootElement,childBoundTranscludeFn)))}}/**
     * Sorting function for bound directives.
     */
function byPriority(a,b){var diff=b.priority-a.priority;return 0!==diff?diff:a.name!==b.name?a.name<b.name?-1:1:a.index-b.index}function assertNoDuplicate(what,previousDirective,directive,element){function wrapModuleNameIfDefined(moduleName){return moduleName?" (module: "+moduleName+")":""}if(previousDirective)throw $compileMinErr("multidir","Multiple directives [{0}{1}, {2}{3}] asking for {4} on: {5}",previousDirective.name,wrapModuleNameIfDefined(previousDirective.$$moduleName),directive.name,wrapModuleNameIfDefined(directive.$$moduleName),what,startingTag(element))}function addTextInterpolateDirective(directives,text){var interpolateFn=$interpolate(text,!0);interpolateFn&&directives.push({priority:0,compile:function(templateNode){var templateNodeParent=templateNode.parent(),hasCompileParent=!!templateNodeParent.length;
// When transcluding a template that has bindings in the root
// we don't have a parent and thus need to add the class during linking fn.
return hasCompileParent&&compile.$$addBindingClass(templateNodeParent),function(scope,node){var parent=node.parent();hasCompileParent||compile.$$addBindingClass(parent),compile.$$addBindingInfo(parent,interpolateFn.expressions),scope.$watch(interpolateFn,function(value){node[0].nodeValue=value})}}})}function wrapTemplate(type,template){switch(type=lowercase(type||"html")){case"svg":case"math":var wrapper=window.document.createElement("div");return wrapper.innerHTML="<"+type+">"+template+"</"+type+">",wrapper.childNodes[0].childNodes;default:return template}}function getTrustedContext(node,attrNormalizedName){if("srcdoc"===attrNormalizedName)return $sce.HTML;var tag=nodeName_(node);
// All tags with src attributes require a RESOURCE_URL value, except for
// img and various html5 media tags.
if("src"===attrNormalizedName||"ngSrc"===attrNormalizedName){if(["img","video","audio","source","track"].indexOf(tag)===-1)return $sce.RESOURCE_URL}else if("xlinkHref"===attrNormalizedName||"form"===tag&&"action"===attrNormalizedName||
// links can be stylesheets or imports, which can run script in the current origin
"link"===tag&&"href"===attrNormalizedName)return $sce.RESOURCE_URL}function addAttrInterpolateDirective(node,directives,value,name,isNgAttr){var trustedContext=getTrustedContext(node,name),mustHaveExpression=!isNgAttr,allOrNothing=ALL_OR_NOTHING_ATTRS[name]||isNgAttr,interpolateFn=$interpolate(value,mustHaveExpression,trustedContext,allOrNothing);
// no interpolation found -> ignore
if(interpolateFn){if("multiple"===name&&"select"===nodeName_(node))throw $compileMinErr("selmulti","Binding to the 'multiple' attribute is not supported. Element: {0}",startingTag(node));if(EVENT_HANDLER_ATTR_REGEXP.test(name))throw $compileMinErr("nodomevents","Interpolations for HTML DOM event attributes are disallowed.  Please use the ng- versions (such as ng-click instead of onclick) instead.");directives.push({priority:100,compile:function(){return{pre:function(scope,element,attr){var $$observers=attr.$$observers||(attr.$$observers=createMap()),newValue=attr[name];newValue!==value&&(
// we need to interpolate again since the attribute value has been updated
// (e.g. by another directive's compile function)
// ensure unset/empty values make interpolateFn falsy
interpolateFn=newValue&&$interpolate(newValue,!0,trustedContext,allOrNothing),value=newValue),
// if attribute was updated so that there is no interpolation going on we don't want to
// register any observers
interpolateFn&&(
// initialize attr object so that it's ready in case we need the value for isolate
// scope initialization, otherwise the value would not be available from isolate
// directive's linking fn during linking phase
attr[name]=interpolateFn(scope),($$observers[name]||($$observers[name]=[])).$$inter=!0,(attr.$$observers&&attr.$$observers[name].$$scope||scope).$watch(interpolateFn,function(newValue,oldValue){
//special case for class attribute addition + removal
//so that class changes can tap into the animation
//hooks provided by the $animate service. Be sure to
//skip animations when the first digest occurs (when
//both the new and the old values are the same) since
//the CSS classes are the non-interpolated values
"class"===name&&newValue!==oldValue?attr.$updateClass(newValue,oldValue):attr.$set(name,newValue)}))}}}})}}/**
     * This is a special jqLite.replaceWith, which can replace items which
     * have no parents, provided that the containing jqLite collection is provided.
     *
     * @param {JqLite=} $rootElement The root of the compile tree. Used so that we can replace nodes
     *                               in the root of the tree.
     * @param {JqLite} elementsToRemove The jqLite element which we are going to replace. We keep
     *                                  the shell, but replace its DOM node reference.
     * @param {Node} newNode The new DOM node.
     */
function replaceWith($rootElement,elementsToRemove,newNode){var i,ii,firstElementToRemove=elementsToRemove[0],removeCount=elementsToRemove.length,parent=firstElementToRemove.parentNode;if($rootElement)for(i=0,ii=$rootElement.length;i<ii;i++)if($rootElement[i]===firstElementToRemove){$rootElement[i++]=newNode;for(var j=i,j2=j+removeCount-1,jj=$rootElement.length;j<jj;j++,j2++)j2<jj?$rootElement[j]=$rootElement[j2]:delete $rootElement[j];$rootElement.length-=removeCount-1,
// If the replaced element is also the jQuery .context then replace it
// .context is a deprecated jQuery api, so we should set it only when jQuery set it
// http://api.jquery.com/context/
$rootElement.context===firstElementToRemove&&($rootElement.context=newNode);break}parent&&parent.replaceChild(newNode,firstElementToRemove);
// Append all the `elementsToRemove` to a fragment. This will...
// - remove them from the DOM
// - allow them to still be traversed with .nextSibling
// - allow a single fragment.qSA to fetch all elements being removed
var fragment=window.document.createDocumentFragment();for(i=0;i<removeCount;i++)fragment.appendChild(elementsToRemove[i]);
// Update the jqLite collection to only contain the `newNode`
for(jqLite.hasData(firstElementToRemove)&&(
// Copy over user data (that includes Angular's $scope etc.). Don't copy private
// data here because there's no public interface in jQuery to do that and copying over
// event listeners (which is the main use of private data) wouldn't work anyway.
jqLite.data(newNode,jqLite.data(firstElementToRemove)),
// Remove $destroy event listeners from `firstElementToRemove`
jqLite(firstElementToRemove).off("$destroy")),
// Cleanup any data/listeners on the elements and children.
// This includes invoking the $destroy event on any elements with listeners.
jqLite.cleanData(fragment.querySelectorAll("*")),i=1;i<removeCount;i++)delete elementsToRemove[i];elementsToRemove[0]=newNode,elementsToRemove.length=1}function cloneAndAnnotateFn(fn,annotation){return extend(function(){return fn.apply(null,arguments)},fn,annotation)}function invokeLinkFn(linkFn,scope,$element,attrs,controllers,transcludeFn){try{linkFn(scope,$element,attrs,controllers,transcludeFn)}catch(e){$exceptionHandler(e,startingTag($element))}}
// Set up $watches for isolate scope and controller bindings.
function initializeDirectiveBindings(scope,attrs,destination,bindings,directive){function recordChanges(key,currentValue,previousValue){isFunction(destination.$onChanges)&&!simpleCompare(currentValue,previousValue)&&(
// If we have not already scheduled the top level onChangesQueue handler then do so now
onChangesQueue||(scope.$$postDigest(flushOnChangesQueue),onChangesQueue=[]),
// If we have not already queued a trigger of onChanges for this controller then do so now
changes||(changes={},onChangesQueue.push(triggerOnChangesHook)),
// If the has been a change on this property already then we need to reuse the previous value
changes[key]&&(previousValue=changes[key].previousValue),
// Store this change
changes[key]=new SimpleChange(previousValue,currentValue))}function triggerOnChangesHook(){destination.$onChanges(changes),
// Now clear the changes so that we schedule onChanges when more changes arrive
changes=void 0}var changes,removeWatchCollection=[],initialChanges={};return forEach(bindings,function(definition,scopeName){var// @, =, <, or &
lastValue,parentGet,parentSet,compare,removeWatch,attrName=definition.attrName,optional=definition.optional,mode=definition.mode;switch(mode){case"@":optional||hasOwnProperty.call(attrs,attrName)||(destination[scopeName]=attrs[attrName]=void 0),removeWatch=attrs.$observe(attrName,function(value){if(isString(value)||isBoolean(value)){var oldValue=destination[scopeName];recordChanges(scopeName,value,oldValue),destination[scopeName]=value}}),attrs.$$observers[attrName].$$scope=scope,lastValue=attrs[attrName],isString(lastValue)?
// If the attribute has been provided then we trigger an interpolation to ensure
// the value is there for use in the link fn
destination[scopeName]=$interpolate(lastValue)(scope):isBoolean(lastValue)&&(
// If the attributes is one of the BOOLEAN_ATTR then Angular will have converted
// the value to boolean rather than a string, so we special case this situation
destination[scopeName]=lastValue),initialChanges[scopeName]=new SimpleChange(_UNINITIALIZED_VALUE,destination[scopeName]),removeWatchCollection.push(removeWatch);break;case"=":if(!hasOwnProperty.call(attrs,attrName)){if(optional)break;attrs[attrName]=void 0}if(optional&&!attrs[attrName])break;parentGet=$parse(attrs[attrName]),compare=parentGet.literal?equals:simpleCompare,parentSet=parentGet.assign||function(){
// reset the change, or we will throw this exception on every $digest
throw lastValue=destination[scopeName]=parentGet(scope),$compileMinErr("nonassign","Expression '{0}' in attribute '{1}' used with directive '{2}' is non-assignable!",attrs[attrName],attrName,directive.name)},lastValue=destination[scopeName]=parentGet(scope);var parentValueWatch=function(parentValue){
// we are out of sync and need to copy
// if the parent can be assigned then do so
// parent changed and it has precedence
return compare(parentValue,destination[scopeName])||(compare(parentValue,lastValue)?parentSet(scope,parentValue=destination[scopeName]):destination[scopeName]=parentValue),lastValue=parentValue};parentValueWatch.$stateful=!0,removeWatch=definition.collection?scope.$watchCollection(attrs[attrName],parentValueWatch):scope.$watch($parse(attrs[attrName],parentValueWatch),null,parentGet.literal),removeWatchCollection.push(removeWatch);break;case"<":if(!hasOwnProperty.call(attrs,attrName)){if(optional)break;attrs[attrName]=void 0}if(optional&&!attrs[attrName])break;parentGet=$parse(attrs[attrName]);var deepWatch=parentGet.literal,initialValue=destination[scopeName]=parentGet(scope);initialChanges[scopeName]=new SimpleChange(_UNINITIALIZED_VALUE,destination[scopeName]),removeWatch=scope.$watch(parentGet,function(newValue,oldValue){if(oldValue===newValue){if(oldValue===initialValue||deepWatch&&equals(oldValue,initialValue))return;oldValue=initialValue}recordChanges(scopeName,newValue,oldValue),destination[scopeName]=newValue},deepWatch),removeWatchCollection.push(removeWatch);break;case"&":
// Don't assign noop to destination if expression is not valid
if(
// Don't assign Object.prototype method to scope
parentGet=attrs.hasOwnProperty(attrName)?$parse(attrs[attrName]):noop,parentGet===noop&&optional)break;destination[scopeName]=function(locals){return parentGet(scope,locals)}}}),{initialChanges:initialChanges,removeWatches:removeWatchCollection.length&&function(){for(var i=0,ii=removeWatchCollection.length;i<ii;++i)removeWatchCollection[i]()}}}var onChangesQueue,SIMPLE_ATTR_NAME=/^\w/,specialAttrHolder=window.document.createElement("div"),commentDirectivesEnabled=commentDirectivesEnabledConfig,cssClassDirectivesEnabled=cssClassDirectivesEnabledConfig,onChangesTtl=TTL;Attributes.prototype={/**
       * @ngdoc method
       * @name $compile.directive.Attributes#$normalize
       * @kind function
       *
       * @description
       * Converts an attribute name (e.g. dash/colon/underscore-delimited string, optionally prefixed with `x-` or
       * `data-`) to its normalized, camelCase form.
       *
       * Also there is special case for Moz prefix starting with upper case letter.
       *
       * For further information check out the guide on {@link guide/directive#matching-directives Matching Directives}
       *
       * @param {string} name Name to normalize
       */
$normalize:directiveNormalize,/**
       * @ngdoc method
       * @name $compile.directive.Attributes#$addClass
       * @kind function
       *
       * @description
       * Adds the CSS class value specified by the classVal parameter to the element. If animations
       * are enabled then an animation will be triggered for the class addition.
       *
       * @param {string} classVal The className value that will be added to the element
       */
$addClass:function(classVal){classVal&&classVal.length>0&&$animate.addClass(this.$$element,classVal)},/**
       * @ngdoc method
       * @name $compile.directive.Attributes#$removeClass
       * @kind function
       *
       * @description
       * Removes the CSS class value specified by the classVal parameter from the element. If
       * animations are enabled then an animation will be triggered for the class removal.
       *
       * @param {string} classVal The className value that will be removed from the element
       */
$removeClass:function(classVal){classVal&&classVal.length>0&&$animate.removeClass(this.$$element,classVal)},/**
       * @ngdoc method
       * @name $compile.directive.Attributes#$updateClass
       * @kind function
       *
       * @description
       * Adds and removes the appropriate CSS class values to the element based on the difference
       * between the new and old CSS class values (specified as newClasses and oldClasses).
       *
       * @param {string} newClasses The current CSS className value
       * @param {string} oldClasses The former CSS className value
       */
$updateClass:function(newClasses,oldClasses){var toAdd=tokenDifference(newClasses,oldClasses);toAdd&&toAdd.length&&$animate.addClass(this.$$element,toAdd);var toRemove=tokenDifference(oldClasses,newClasses);toRemove&&toRemove.length&&$animate.removeClass(this.$$element,toRemove)},/**
       * Set a normalized attribute on the element in a way such that all directives
       * can share the attribute. This function properly handles boolean attributes.
       * @param {string} key Normalized key. (ie ngAttribute)
       * @param {string|boolean} value The value to set. If `null` attribute will be deleted.
       * @param {boolean=} writeAttr If false, does not write the value to DOM element attribute.
       *     Defaults to true.
       * @param {string=} attrName Optional none normalized name. Defaults to key.
       */
$set:function(key,value,writeAttr,attrName){
// TODO: decide whether or not to throw an error if "class"
//is set through this function since it may cause $updateClass to
//become unstable.
var nodeName,node=this.$$element[0],booleanKey=getBooleanAttrName(node,key),aliasedKey=getAliasedAttrName(key),observer=key;if(booleanKey?(this.$$element.prop(key,value),attrName=booleanKey):aliasedKey&&(this[aliasedKey]=value,observer=aliasedKey),this[key]=value,
// translate normalized key to actual key
attrName?this.$attr[key]=attrName:(attrName=this.$attr[key],attrName||(this.$attr[key]=attrName=snake_case(key,"-"))),nodeName=nodeName_(this.$$element),"a"===nodeName&&("href"===key||"xlinkHref"===key)||"img"===nodeName&&"src"===key)
// sanitize a[href] and img[src] values
this[key]=value=$$sanitizeUri(value,"src"===key);else if("img"===nodeName&&"srcset"===key&&isDefined(value)){for(var result="",trimmedSrcset=trim(value),srcPattern=/(\s+\d+x\s*,|\s+\d+w\s*,|\s+,|,\s+)/,pattern=/\s/.test(trimmedSrcset)?srcPattern:/(,)/,rawUris=trimmedSrcset.split(pattern),nbrUrisWith2parts=Math.floor(rawUris.length/2),i=0;i<nbrUrisWith2parts;i++){var innerIdx=2*i;
// sanitize the uri
result+=$$sanitizeUri(trim(rawUris[innerIdx]),!0),
// add the descriptor
result+=" "+trim(rawUris[innerIdx+1])}
// split the last item into uri and descriptor
var lastTuple=trim(rawUris[2*i]).split(/\s/);
// sanitize the last uri
result+=$$sanitizeUri(trim(lastTuple[0]),!0),
// and add the last descriptor if any
2===lastTuple.length&&(result+=" "+trim(lastTuple[1])),this[key]=value=result}writeAttr!==!1&&(null===value||isUndefined(value)?this.$$element.removeAttr(attrName):SIMPLE_ATTR_NAME.test(attrName)?this.$$element.attr(attrName,value):setSpecialAttr(this.$$element[0],attrName,value));
// fire observers
var $$observers=this.$$observers;$$observers&&forEach($$observers[observer],function(fn){try{fn(value)}catch(e){$exceptionHandler(e)}})},/**
       * @ngdoc method
       * @name $compile.directive.Attributes#$observe
       * @kind function
       *
       * @description
       * Observes an interpolated attribute.
       *
       * The observer function will be invoked once during the next `$digest` following
       * compilation. The observer is then invoked whenever the interpolated value
       * changes.
       *
       * @param {string} key Normalized key. (ie ngAttribute) .
       * @param {function(interpolatedValue)} fn Function that will be called whenever
                the interpolated value of the attribute changes.
       *        See the {@link guide/interpolation#how-text-and-attribute-bindings-work Interpolation
       *        guide} for more info.
       * @returns {function()} Returns a deregistration function for this observer.
       */
$observe:function(key,fn){var attrs=this,$$observers=attrs.$$observers||(attrs.$$observers=createMap()),listeners=$$observers[key]||($$observers[key]=[]);return listeners.push(fn),$rootScope.$evalAsync(function(){listeners.$$inter||!attrs.hasOwnProperty(key)||isUndefined(attrs[key])||
// no one registered attribute interpolation function, so lets call it manually
fn(attrs[key])}),function(){arrayRemove(listeners,fn)}}};var startSymbol=$interpolate.startSymbol(),endSymbol=$interpolate.endSymbol(),denormalizeTemplate="{{"===startSymbol&&"}}"===endSymbol?identity:function(template){return template.replace(/\{\{/g,startSymbol).replace(/}}/g,endSymbol)},NG_ATTR_BINDING=/^ngAttr[A-Z]/,MULTI_ELEMENT_DIR_RE=/^(.+)Start$/;return compile.$$addBindingInfo=debugInfoEnabled?function($element,binding){var bindings=$element.data("$binding")||[];isArray(binding)?bindings=bindings.concat(binding):bindings.push(binding),$element.data("$binding",bindings)}:noop,compile.$$addBindingClass=debugInfoEnabled?function($element){safeAddClass($element,"ng-binding")}:noop,compile.$$addScopeInfo=debugInfoEnabled?function($element,scope,isolated,noTemplate){var dataName=isolated?noTemplate?"$isolateScopeNoTemplate":"$isolateScope":"$scope";$element.data(dataName,scope)}:noop,compile.$$addScopeClass=debugInfoEnabled?function($element,isolated){safeAddClass($element,isolated?"ng-isolate-scope":"ng-scope")}:noop,compile.$$createComment=function(directiveName,comment){var content="";return debugInfoEnabled&&(content=" "+(directiveName||"")+": ",comment&&(content+=comment+" ")),window.document.createComment(content)},compile}]}function SimpleChange(previous,current){this.previousValue=previous,this.currentValue=current}/**
 * Converts all accepted directives format into proper directive name.
 * @param name Name to normalize
 */
function directiveNormalize(name){return name.replace(PREFIX_REGEXP,"").replace(SPECIAL_CHARS_REGEXP,fnCamelCaseReplace)}function tokenDifference(str1,str2){var values="",tokens1=str1.split(/\s+/),tokens2=str2.split(/\s+/);outer:for(var i=0;i<tokens1.length;i++){for(var token=tokens1[i],j=0;j<tokens2.length;j++)if(token===tokens2[j])continue outer;values+=(values.length>0?" ":"")+token}return values}function removeComments(jqNodes){jqNodes=jqLite(jqNodes);var i=jqNodes.length;if(i<=1)return jqNodes;for(;i--;){var node=jqNodes[i];(node.nodeType===NODE_TYPE_COMMENT||node.nodeType===NODE_TYPE_TEXT&&""===node.nodeValue.trim())&&splice.call(jqNodes,i,1)}return jqNodes}function identifierForController(controller,ident){if(ident&&isString(ident))return ident;if(isString(controller)){var match=CNTRL_REG.exec(controller);if(match)return match[3]}}/**
 * @ngdoc provider
 * @name $controllerProvider
 * @this
 *
 * @description
 * The {@link ng.$controller $controller service} is used by Angular to create new
 * controllers.
 *
 * This provider allows controller registration via the
 * {@link ng.$controllerProvider#register register} method.
 */
function $ControllerProvider(){var controllers={},globals=!1;/**
   * @ngdoc method
   * @name $controllerProvider#has
   * @param {string} name Controller name to check.
   */
this.has=function(name){return controllers.hasOwnProperty(name)},/**
   * @ngdoc method
   * @name $controllerProvider#register
   * @param {string|Object} name Controller name, or an object map of controllers where the keys are
   *    the names and the values are the constructors.
   * @param {Function|Array} constructor Controller constructor fn (optionally decorated with DI
   *    annotations in the array notation).
   */
this.register=function(name,constructor){assertNotHasOwnProperty(name,"controller"),isObject(name)?extend(controllers,name):controllers[name]=constructor},/**
   * @ngdoc method
   * @name $controllerProvider#allowGlobals
   * @description If called, allows `$controller` to find controller constructors on `window`
   *
   * @deprecated
   * sinceVersion="v1.3.0"
   * removeVersion="v1.7.0"
   * This method of finding controllers has been deprecated.
   */
this.allowGlobals=function(){globals=!0},this.$get=["$injector","$window",function($injector,$window){function addIdentifier(locals,identifier,instance,name){if(!locals||!isObject(locals.$scope))throw minErr("$controller")("noscp","Cannot export controller '{0}' as '{1}'! No $scope object provided via `locals`.",name,identifier);locals.$scope[identifier]=instance}/**
     * @ngdoc service
     * @name $controller
     * @requires $injector
     *
     * @param {Function|string} constructor If called with a function then it's considered to be the
     *    controller constructor function. Otherwise it's considered to be a string which is used
     *    to retrieve the controller constructor using the following steps:
     *
     *    * check if a controller with given name is registered via `$controllerProvider`
     *    * check if evaluating the string on the current scope returns a constructor
     *    * if $controllerProvider#allowGlobals, check `window[constructor]` on the global
     *      `window` object (deprecated, not recommended)
     *
     *    The string can use the `controller as property` syntax, where the controller instance is published
     *    as the specified property on the `scope`; the `scope` must be injected into `locals` param for this
     *    to work correctly.
     *
     * @param {Object} locals Injection locals for Controller.
     * @return {Object} Instance of given controller.
     *
     * @description
     * `$controller` service is responsible for instantiating controllers.
     *
     * It's just a simple call to {@link auto.$injector $injector}, but extracted into
     * a service, so that one can override this service with [BC version](https://gist.github.com/1649788).
     */
return function(expression,locals,later,ident){
// PRIVATE API:
//   param `later` --- indicates that the controller's constructor is invoked at a later time.
//                     If true, $controller will allocate the object with the correct
//                     prototype chain, but will not invoke the controller until a returned
//                     callback is invoked.
//   param `ident` --- An optional label which overrides the label parsed from the controller
//                     expression, if any.
var instance,match,constructor,identifier;if(later=later===!0,ident&&isString(ident)&&(identifier=ident),isString(expression)){if(match=expression.match(CNTRL_REG),!match)throw $controllerMinErr("ctrlfmt","Badly formed controller string '{0}'. Must match `__name__ as __id__` or `__name__`.",expression);if(constructor=match[1],identifier=identifier||match[3],expression=controllers.hasOwnProperty(constructor)?controllers[constructor]:getter(locals.$scope,constructor,!0)||(globals?getter($window,constructor,!0):void 0),!expression)throw $controllerMinErr("ctrlreg","The controller with the name '{0}' is not registered.",constructor);assertArgFn(expression,constructor,!0)}if(later){
// Instantiate controller later:
// This machinery is used to create an instance of the object before calling the
// controller's constructor itself.
//
// This allows properties to be added to the controller before the constructor is
// invoked. Primarily, this is used for isolate scope bindings in $compile.
//
// This feature is not intended for use by applications, and is thus not documented
// publicly.
// Object creation: http://jsperf.com/create-constructor/2
var controllerPrototype=(isArray(expression)?expression[expression.length-1]:expression).prototype;return instance=Object.create(controllerPrototype||null),identifier&&addIdentifier(locals,identifier,instance,constructor||expression.name),extend(function(){var result=$injector.invoke(expression,instance,locals,constructor);
// If result changed, re-assign controllerAs value to scope.
return result!==instance&&(isObject(result)||isFunction(result))&&(instance=result,identifier&&addIdentifier(locals,identifier,instance,constructor||expression.name)),instance},{instance:instance,identifier:identifier})}return instance=$injector.instantiate(expression,locals,constructor),identifier&&addIdentifier(locals,identifier,instance,constructor||expression.name),instance}}]}/**
 * @ngdoc service
 * @name $document
 * @requires $window
 * @this
 *
 * @description
 * A {@link angular.element jQuery or jqLite} wrapper for the browser's `window.document` object.
 *
 * @example
   <example module="documentExample" name="document">
     <file name="index.html">
       <div ng-controller="ExampleController">
         <p>$document title: <b ng-bind="title"></b></p>
         <p>window.document title: <b ng-bind="windowTitle"></b></p>
       </div>
     </file>
     <file name="script.js">
       angular.module('documentExample', [])
         .controller('ExampleController', ['$scope', '$document', function($scope, $document) {
           $scope.title = $document[0].title;
           $scope.windowTitle = angular.element(window.document)[0].title;
         }]);
     </file>
   </example>
 */
function $DocumentProvider(){this.$get=["$window",function(window){return jqLite(window.document)}]}/**
 * @private
 * @this
 * Listens for document visibility change and makes the current status accessible.
 */
function $$IsDocumentHiddenProvider(){this.$get=["$document","$rootScope",function($document,$rootScope){function changeListener(){hidden=doc.hidden}var doc=$document[0],hidden=doc&&doc.hidden;return $document.on("visibilitychange",changeListener),$rootScope.$on("$destroy",function(){$document.off("visibilitychange",changeListener)}),function(){return hidden}}]}/**
 * @ngdoc service
 * @name $exceptionHandler
 * @requires ng.$log
 * @this
 *
 * @description
 * Any uncaught exception in angular expressions is delegated to this service.
 * The default implementation simply delegates to `$log.error` which logs it into
 * the browser console.
 *
 * In unit tests, if `angular-mocks.js` is loaded, this service is overridden by
 * {@link ngMock.$exceptionHandler mock $exceptionHandler} which aids in testing.
 *
 * ## Example:
 *
 * The example below will overwrite the default `$exceptionHandler` in order to (a) log uncaught
 * errors to the backend for later inspection by the developers and (b) to use `$log.warn()` instead
 * of `$log.error()`.
 *
 * ```js
 *   angular.
 *     module('exceptionOverwrite', []).
 *     factory('$exceptionHandler', ['$log', 'logErrorsToBackend', function($log, logErrorsToBackend) {
 *       return function myExceptionHandler(exception, cause) {
 *         logErrorsToBackend(exception, cause);
 *         $log.warn(exception, cause);
 *       };
 *     }]);
 * ```
 *
 * <hr />
 * Note, that code executed in event-listeners (even those registered using jqLite's `on`/`bind`
 * methods) does not delegate exceptions to the {@link ng.$exceptionHandler $exceptionHandler}
 * (unless executed during a digest).
 *
 * If you wish, you can manually delegate exceptions, e.g.
 * `try { ... } catch(e) { $exceptionHandler(e); }`
 *
 * @param {Error} exception Exception associated with the error.
 * @param {string=} cause Optional information about the context in which
 *       the error was thrown.
 *
 */
function $ExceptionHandlerProvider(){this.$get=["$log",function($log){return function(exception,cause){$log.error.apply($log,arguments)}}]}function serializeValue(v){return isObject(v)?isDate(v)?v.toISOString():toJson(v):v}/** @this */
function $HttpParamSerializerProvider(){/**
   * @ngdoc service
   * @name $httpParamSerializer
   * @description
   *
   * Default {@link $http `$http`} params serializer that converts objects to strings
   * according to the following rules:
   *
   * * `{'foo': 'bar'}` results in `foo=bar`
   * * `{'foo': Date.now()}` results in `foo=2015-04-01T09%3A50%3A49.262Z` (`toISOString()` and encoded representation of a Date object)
   * * `{'foo': ['bar', 'baz']}` results in `foo=bar&foo=baz` (repeated key for each array element)
   * * `{'foo': {'bar':'baz'}}` results in `foo=%7B%22bar%22%3A%22baz%22%7D` (stringified and encoded representation of an object)
   *
   * Note that serializer will sort the request parameters alphabetically.
   * */
this.$get=function(){return function(params){if(!params)return"";var parts=[];return forEachSorted(params,function(value,key){null===value||isUndefined(value)||(isArray(value)?forEach(value,function(v){parts.push(encodeUriQuery(key)+"="+encodeUriQuery(serializeValue(v)))}):parts.push(encodeUriQuery(key)+"="+encodeUriQuery(serializeValue(value))))}),parts.join("&")}}}/** @this */
function $HttpParamSerializerJQLikeProvider(){/**
   * @ngdoc service
   * @name $httpParamSerializerJQLike
   *
   * @description
   *
   * Alternative {@link $http `$http`} params serializer that follows
   * jQuery's [`param()`](http://api.jquery.com/jquery.param/) method logic.
   * The serializer will also sort the params alphabetically.
   *
   * To use it for serializing `$http` request parameters, set it as the `paramSerializer` property:
   *
   * ```js
   * $http({
   *   url: myUrl,
   *   method: 'GET',
   *   params: myParams,
   *   paramSerializer: '$httpParamSerializerJQLike'
   * });
   * ```
   *
   * It is also possible to set it as the default `paramSerializer` in the
   * {@link $httpProvider#defaults `$httpProvider`}.
   *
   * Additionally, you can inject the serializer and use it explicitly, for example to serialize
   * form data for submission:
   *
   * ```js
   * .controller(function($http, $httpParamSerializerJQLike) {
   *   //...
   *
   *   $http({
   *     url: myUrl,
   *     method: 'POST',
   *     data: $httpParamSerializerJQLike(myData),
   *     headers: {
   *       'Content-Type': 'application/x-www-form-urlencoded'
   *     }
   *   });
   *
   * });
   * ```
   *
   * */
this.$get=function(){return function(params){function serialize(toSerialize,prefix,topLevel){null===toSerialize||isUndefined(toSerialize)||(isArray(toSerialize)?forEach(toSerialize,function(value,index){serialize(value,prefix+"["+(isObject(value)?index:"")+"]")}):isObject(toSerialize)&&!isDate(toSerialize)?forEachSorted(toSerialize,function(value,key){serialize(value,prefix+(topLevel?"":"[")+key+(topLevel?"":"]"))}):parts.push(encodeUriQuery(prefix)+"="+encodeUriQuery(serializeValue(toSerialize))))}if(!params)return"";var parts=[];return serialize(params,"",!0),parts.join("&")}}}function defaultHttpResponseTransform(data,headers){if(isString(data)){
// Strip json vulnerability protection prefix and trim whitespace
var tempData=data.replace(JSON_PROTECTION_PREFIX,"").trim();if(tempData){var contentType=headers("Content-Type");if(contentType&&0===contentType.indexOf(APPLICATION_JSON)||isJsonLike(tempData))try{data=fromJson(tempData)}catch(e){throw $httpMinErr("baddata",'Data must be a valid JSON object. Received: "{0}". Parse error: "{1}"',data,e)}}}return data}function isJsonLike(str){var jsonStart=str.match(JSON_START);return jsonStart&&JSON_ENDS[jsonStart[0]].test(str)}/**
 * Parse headers into key value object
 *
 * @param {string} headers Raw headers as a string
 * @returns {Object} Parsed headers as key value object
 */
function parseHeaders(headers){function fillInParsed(key,val){key&&(parsed[key]=parsed[key]?parsed[key]+", "+val:val)}var i,parsed=createMap();return isString(headers)?forEach(headers.split("\n"),function(line){i=line.indexOf(":"),fillInParsed(lowercase(trim(line.substr(0,i))),trim(line.substr(i+1)))}):isObject(headers)&&forEach(headers,function(headerVal,headerKey){fillInParsed(lowercase(headerKey),trim(headerVal))}),parsed}/**
 * Returns a function that provides access to parsed headers.
 *
 * Headers are lazy parsed when first requested.
 * @see parseHeaders
 *
 * @param {(string|Object)} headers Headers to provide access to.
 * @returns {function(string=)} Returns a getter function which if called with:
 *
 *   - if called with an argument returns a single header value or null
 *   - if called with no arguments returns an object containing all headers.
 */
function headersGetter(headers){var headersObj;return function(name){if(headersObj||(headersObj=parseHeaders(headers)),name){var value=headersObj[lowercase(name)];return void 0===value&&(value=null),value}return headersObj}}/**
 * Chain all given functions
 *
 * This function is used for both request and response transforming
 *
 * @param {*} data Data to transform.
 * @param {function(string=)} headers HTTP headers getter fn.
 * @param {number} status HTTP status code of the response.
 * @param {(Function|Array.<Function>)} fns Function or an array of functions.
 * @returns {*} Transformed data.
 */
function transformData(data,headers,status,fns){return isFunction(fns)?fns(data,headers,status):(forEach(fns,function(fn){data=fn(data,headers,status)}),data)}function isSuccess(status){return 200<=status&&status<300}/**
 * @ngdoc provider
 * @name $httpProvider
 * @this
 *
 * @description
 * Use `$httpProvider` to change the default behavior of the {@link ng.$http $http} service.
 * */
function $HttpProvider(){/**
   * @ngdoc property
   * @name $httpProvider#defaults
   * @description
   *
   * Object containing default values for all {@link ng.$http $http} requests.
   *
   * - **`defaults.cache`** - {boolean|Object} - A boolean value or object created with
   * {@link ng.$cacheFactory `$cacheFactory`} to enable or disable caching of HTTP responses
   * by default. See {@link $http#caching $http Caching} for more information.
   *
   * - **`defaults.xsrfCookieName`** - {string} - Name of cookie containing the XSRF token.
   * Defaults value is `'XSRF-TOKEN'`.
   *
   * - **`defaults.xsrfHeaderName`** - {string} - Name of HTTP header to populate with the
   * XSRF token. Defaults value is `'X-XSRF-TOKEN'`.
   *
   * - **`defaults.headers`** - {Object} - Default headers for all $http requests.
   * Refer to {@link ng.$http#setting-http-headers $http} for documentation on
   * setting default headers.
   *     - **`defaults.headers.common`**
   *     - **`defaults.headers.post`**
   *     - **`defaults.headers.put`**
   *     - **`defaults.headers.patch`**
   *
   *
   * - **`defaults.paramSerializer`** - `{string|function(Object<string,string>):string}` - A function
   *  used to the prepare string representation of request parameters (specified as an object).
   *  If specified as string, it is interpreted as a function registered with the {@link auto.$injector $injector}.
   *  Defaults to {@link ng.$httpParamSerializer $httpParamSerializer}.
   *
   * - **`defaults.jsonpCallbackParam`** - `{string}` - the name of the query parameter that passes the name of the
   * callback in a JSONP request. The value of this parameter will be replaced with the expression generated by the
   * {@link $jsonpCallbacks} service. Defaults to `'callback'`.
   *
   **/
var defaults=this.defaults={
// transform incoming response data
transformResponse:[defaultHttpResponseTransform],
// transform outgoing request data
transformRequest:[function(d){return!isObject(d)||isFile(d)||isBlob(d)||isFormData(d)?d:toJson(d)}],
// default headers
headers:{common:{Accept:"application/json, text/plain, */*"},post:shallowCopy(CONTENT_TYPE_APPLICATION_JSON),put:shallowCopy(CONTENT_TYPE_APPLICATION_JSON),patch:shallowCopy(CONTENT_TYPE_APPLICATION_JSON)},xsrfCookieName:"XSRF-TOKEN",xsrfHeaderName:"X-XSRF-TOKEN",paramSerializer:"$httpParamSerializer",jsonpCallbackParam:"callback"},useApplyAsync=!1;/**
   * @ngdoc method
   * @name $httpProvider#useApplyAsync
   * @description
   *
   * Configure $http service to combine processing of multiple http responses received at around
   * the same time via {@link ng.$rootScope.Scope#$applyAsync $rootScope.$applyAsync}. This can result in
   * significant performance improvement for bigger applications that make many HTTP requests
   * concurrently (common during application bootstrap).
   *
   * Defaults to false. If no value is specified, returns the current configured value.
   *
   * @param {boolean=} value If true, when requests are loaded, they will schedule a deferred
   *    "apply" on the next tick, giving time for subsequent requests in a roughly ~10ms window
   *    to load and share the same digest cycle.
   *
   * @returns {boolean|Object} If a value is specified, returns the $httpProvider for chaining.
   *    otherwise, returns the current configured value.
   **/
this.useApplyAsync=function(value){return isDefined(value)?(useApplyAsync=!!value,this):useApplyAsync};/**
   * @ngdoc property
   * @name $httpProvider#interceptors
   * @description
   *
   * Array containing service factories for all synchronous or asynchronous {@link ng.$http $http}
   * pre-processing of request or postprocessing of responses.
   *
   * These service factories are ordered by request, i.e. they are applied in the same order as the
   * array, on request, but reverse order, on response.
   *
   * {@link ng.$http#interceptors Interceptors detailed info}
   **/
var interceptorFactories=this.interceptors=[];this.$get=["$browser","$httpBackend","$$cookieReader","$cacheFactory","$rootScope","$q","$injector","$sce",function($browser,$httpBackend,$$cookieReader,$cacheFactory,$rootScope,$q,$injector,$sce){/**
     * @ngdoc service
     * @kind function
     * @name $http
     * @requires ng.$httpBackend
     * @requires $cacheFactory
     * @requires $rootScope
     * @requires $q
     * @requires $injector
     *
     * @description
     * The `$http` service is a core Angular service that facilitates communication with the remote
     * HTTP servers via the browser's [XMLHttpRequest](https://developer.mozilla.org/en/xmlhttprequest)
     * object or via [JSONP](http://en.wikipedia.org/wiki/JSONP).
     *
     * For unit testing applications that use `$http` service, see
     * {@link ngMock.$httpBackend $httpBackend mock}.
     *
     * For a higher level of abstraction, please check out the {@link ngResource.$resource
     * $resource} service.
     *
     * The $http API is based on the {@link ng.$q deferred/promise APIs} exposed by
     * the $q service. While for simple usage patterns this doesn't matter much, for advanced usage
     * it is important to familiarize yourself with these APIs and the guarantees they provide.
     *
     *
     * ## General usage
     * The `$http` service is a function which takes a single argument — a {@link $http#usage configuration object} —
     * that is used to generate an HTTP request and returns  a {@link ng.$q promise}.
     *
     * ```js
     *   // Simple GET request example:
     *   $http({
     *     method: 'GET',
     *     url: '/someUrl'
     *   }).then(function successCallback(response) {
     *       // this callback will be called asynchronously
     *       // when the response is available
     *     }, function errorCallback(response) {
     *       // called asynchronously if an error occurs
     *       // or server returns response with an error status.
     *     });
     * ```
     *
     * The response object has these properties:
     *
     *   - **data** – `{string|Object}` – The response body transformed with the transform
     *     functions.
     *   - **status** – `{number}` – HTTP status code of the response.
     *   - **headers** – `{function([headerName])}` – Header getter function.
     *   - **config** – `{Object}` – The configuration object that was used to generate the request.
     *   - **statusText** – `{string}` – HTTP status text of the response.
     *
     * A response status code between 200 and 299 is considered a success status and will result in
     * the success callback being called. Any response status code outside of that range is
     * considered an error status and will result in the error callback being called.
     * Also, status codes less than -1 are normalized to zero. -1 usually means the request was
     * aborted, e.g. using a `config.timeout`.
     * Note that if the response is a redirect, XMLHttpRequest will transparently follow it, meaning
     * that the outcome (success or error) will be determined by the final response status code.
     *
     *
     * ## Shortcut methods
     *
     * Shortcut methods are also available. All shortcut methods require passing in the URL, and
     * request data must be passed in for POST/PUT requests. An optional config can be passed as the
     * last argument.
     *
     * ```js
     *   $http.get('/someUrl', config).then(successCallback, errorCallback);
     *   $http.post('/someUrl', data, config).then(successCallback, errorCallback);
     * ```
     *
     * Complete list of shortcut methods:
     *
     * - {@link ng.$http#get $http.get}
     * - {@link ng.$http#head $http.head}
     * - {@link ng.$http#post $http.post}
     * - {@link ng.$http#put $http.put}
     * - {@link ng.$http#delete $http.delete}
     * - {@link ng.$http#jsonp $http.jsonp}
     * - {@link ng.$http#patch $http.patch}
     *
     *
     * ## Writing Unit Tests that use $http
     * When unit testing (using {@link ngMock ngMock}), it is necessary to call
     * {@link ngMock.$httpBackend#flush $httpBackend.flush()} to flush each pending
     * request using trained responses.
     *
     * ```
     * $httpBackend.expectGET(...);
     * $http.get(...);
     * $httpBackend.flush();
     * ```
     *
     * ## Setting HTTP Headers
     *
     * The $http service will automatically add certain HTTP headers to all requests. These defaults
     * can be fully configured by accessing the `$httpProvider.defaults.headers` configuration
     * object, which currently contains this default configuration:
     *
     * - `$httpProvider.defaults.headers.common` (headers that are common for all requests):
     *   - <code>Accept: application/json, text/plain, \*&#65279;/&#65279;\*</code>
     * - `$httpProvider.defaults.headers.post`: (header defaults for POST requests)
     *   - `Content-Type: application/json`
     * - `$httpProvider.defaults.headers.put` (header defaults for PUT requests)
     *   - `Content-Type: application/json`
     *
     * To add or overwrite these defaults, simply add or remove a property from these configuration
     * objects. To add headers for an HTTP method other than POST or PUT, simply add a new object
     * with the lowercased HTTP method name as the key, e.g.
     * `$httpProvider.defaults.headers.get = { 'My-Header' : 'value' }`.
     *
     * The defaults can also be set at runtime via the `$http.defaults` object in the same
     * fashion. For example:
     *
     * ```
     * module.run(function($http) {
     *   $http.defaults.headers.common.Authorization = 'Basic YmVlcDpib29w';
     * });
     * ```
     *
     * In addition, you can supply a `headers` property in the config object passed when
     * calling `$http(config)`, which overrides the defaults without changing them globally.
     *
     * To explicitly remove a header automatically added via $httpProvider.defaults.headers on a per request basis,
     * Use the `headers` property, setting the desired header to `undefined`. For example:
     *
     * ```js
     * var req = {
     *  method: 'POST',
     *  url: 'http://example.com',
     *  headers: {
     *    'Content-Type': undefined
     *  },
     *  data: { test: 'test' }
     * }
     *
     * $http(req).then(function(){...}, function(){...});
     * ```
     *
     * ## Transforming Requests and Responses
     *
     * Both requests and responses can be transformed using transformation functions: `transformRequest`
     * and `transformResponse`. These properties can be a single function that returns
     * the transformed value (`function(data, headersGetter, status)`) or an array of such transformation functions,
     * which allows you to `push` or `unshift` a new transformation function into the transformation chain.
     *
     * <div class="alert alert-warning">
     * **Note:** Angular does not make a copy of the `data` parameter before it is passed into the `transformRequest` pipeline.
     * That means changes to the properties of `data` are not local to the transform function (since Javascript passes objects by reference).
     * For example, when calling `$http.get(url, $scope.myObject)`, modifications to the object's properties in a transformRequest
     * function will be reflected on the scope and in any templates where the object is data-bound.
     * To prevent this, transform functions should have no side-effects.
     * If you need to modify properties, it is recommended to make a copy of the data, or create new object to return.
     * </div>
     *
     * ### Default Transformations
     *
     * The `$httpProvider` provider and `$http` service expose `defaults.transformRequest` and
     * `defaults.transformResponse` properties. If a request does not provide its own transformations
     * then these will be applied.
     *
     * You can augment or replace the default transformations by modifying these properties by adding to or
     * replacing the array.
     *
     * Angular provides the following default transformations:
     *
     * Request transformations (`$httpProvider.defaults.transformRequest` and `$http.defaults.transformRequest`):
     *
     * - If the `data` property of the request configuration object contains an object, serialize it
     *   into JSON format.
     *
     * Response transformations (`$httpProvider.defaults.transformResponse` and `$http.defaults.transformResponse`):
     *
     *  - If XSRF prefix is detected, strip it (see Security Considerations section below).
     *  - If JSON response is detected, deserialize it using a JSON parser.
     *
     *
     * ### Overriding the Default Transformations Per Request
     *
     * If you wish to override the request/response transformations only for a single request then provide
     * `transformRequest` and/or `transformResponse` properties on the configuration object passed
     * into `$http`.
     *
     * Note that if you provide these properties on the config object the default transformations will be
     * overwritten. If you wish to augment the default transformations then you must include them in your
     * local transformation array.
     *
     * The following code demonstrates adding a new response transformation to be run after the default response
     * transformations have been run.
     *
     * ```js
     * function appendTransform(defaults, transform) {
     *
     *   // We can't guarantee that the default transformation is an array
     *   defaults = angular.isArray(defaults) ? defaults : [defaults];
     *
     *   // Append the new transformation to the defaults
     *   return defaults.concat(transform);
     * }
     *
     * $http({
     *   url: '...',
     *   method: 'GET',
     *   transformResponse: appendTransform($http.defaults.transformResponse, function(value) {
     *     return doTransform(value);
     *   })
     * });
     * ```
     *
     *
     * ## Caching
     *
     * {@link ng.$http `$http`} responses are not cached by default. To enable caching, you must
     * set the config.cache value or the default cache value to TRUE or to a cache object (created
     * with {@link ng.$cacheFactory `$cacheFactory`}). If defined, the value of config.cache takes
     * precedence over the default cache value.
     *
     * In order to:
     *   * cache all responses - set the default cache value to TRUE or to a cache object
     *   * cache a specific response - set config.cache value to TRUE or to a cache object
     *
     * If caching is enabled, but neither the default cache nor config.cache are set to a cache object,
     * then the default `$cacheFactory("$http")` object is used.
     *
     * The default cache value can be set by updating the
     * {@link ng.$http#defaults `$http.defaults.cache`} property or the
     * {@link $httpProvider#defaults `$httpProvider.defaults.cache`} property.
     *
     * When caching is enabled, {@link ng.$http `$http`} stores the response from the server using
     * the relevant cache object. The next time the same request is made, the response is returned
     * from the cache without sending a request to the server.
     *
     * Take note that:
     *
     *   * Only GET and JSONP requests are cached.
     *   * The cache key is the request URL including search parameters; headers are not considered.
     *   * Cached responses are returned asynchronously, in the same way as responses from the server.
     *   * If multiple identical requests are made using the same cache, which is not yet populated,
     *     one request will be made to the server and remaining requests will return the same response.
     *   * A cache-control header on the response does not affect if or how responses are cached.
     *
     *
     * ## Interceptors
     *
     * Before you start creating interceptors, be sure to understand the
     * {@link ng.$q $q and deferred/promise APIs}.
     *
     * For purposes of global error handling, authentication, or any kind of synchronous or
     * asynchronous pre-processing of request or postprocessing of responses, it is desirable to be
     * able to intercept requests before they are handed to the server and
     * responses before they are handed over to the application code that
     * initiated these requests. The interceptors leverage the {@link ng.$q
     * promise APIs} to fulfill this need for both synchronous and asynchronous pre-processing.
     *
     * The interceptors are service factories that are registered with the `$httpProvider` by
     * adding them to the `$httpProvider.interceptors` array. The factory is called and
     * injected with dependencies (if specified) and returns the interceptor.
     *
     * There are two kinds of interceptors (and two kinds of rejection interceptors):
     *
     *   * `request`: interceptors get called with a http {@link $http#usage config} object. The function is free to
     *     modify the `config` object or create a new one. The function needs to return the `config`
     *     object directly, or a promise containing the `config` or a new `config` object.
     *   * `requestError`: interceptor gets called when a previous interceptor threw an error or
     *     resolved with a rejection.
     *   * `response`: interceptors get called with http `response` object. The function is free to
     *     modify the `response` object or create a new one. The function needs to return the `response`
     *     object directly, or as a promise containing the `response` or a new `response` object.
     *   * `responseError`: interceptor gets called when a previous interceptor threw an error or
     *     resolved with a rejection.
     *
     *
     * ```js
     *   // register the interceptor as a service
     *   $provide.factory('myHttpInterceptor', function($q, dependency1, dependency2) {
     *     return {
     *       // optional method
     *       'request': function(config) {
     *         // do something on success
     *         return config;
     *       },
     *
     *       // optional method
     *      'requestError': function(rejection) {
     *         // do something on error
     *         if (canRecover(rejection)) {
     *           return responseOrNewPromise
     *         }
     *         return $q.reject(rejection);
     *       },
     *
     *
     *
     *       // optional method
     *       'response': function(response) {
     *         // do something on success
     *         return response;
     *       },
     *
     *       // optional method
     *      'responseError': function(rejection) {
     *         // do something on error
     *         if (canRecover(rejection)) {
     *           return responseOrNewPromise
     *         }
     *         return $q.reject(rejection);
     *       }
     *     };
     *   });
     *
     *   $httpProvider.interceptors.push('myHttpInterceptor');
     *
     *
     *   // alternatively, register the interceptor via an anonymous factory
     *   $httpProvider.interceptors.push(function($q, dependency1, dependency2) {
     *     return {
     *      'request': function(config) {
     *          // same as above
     *       },
     *
     *       'response': function(response) {
     *          // same as above
     *       }
     *     };
     *   });
     * ```
     *
     * ## Security Considerations
     *
     * When designing web applications, consider security threats from:
     *
     * - [JSON vulnerability](http://haacked.com/archive/2008/11/20/anatomy-of-a-subtle-json-vulnerability.aspx)
     * - [XSRF](http://en.wikipedia.org/wiki/Cross-site_request_forgery)
     *
     * Both server and the client must cooperate in order to eliminate these threats. Angular comes
     * pre-configured with strategies that address these issues, but for this to work backend server
     * cooperation is required.
     *
     * ### JSON Vulnerability Protection
     *
     * A [JSON vulnerability](http://haacked.com/archive/2008/11/20/anatomy-of-a-subtle-json-vulnerability.aspx)
     * allows third party website to turn your JSON resource URL into
     * [JSONP](http://en.wikipedia.org/wiki/JSONP) request under some conditions. To
     * counter this your server can prefix all JSON requests with following string `")]}',\n"`.
     * Angular will automatically strip the prefix before processing it as JSON.
     *
     * For example if your server needs to return:
     * ```js
     * ['one','two']
     * ```
     *
     * which is vulnerable to attack, your server can return:
     * ```js
     * )]}',
     * ['one','two']
     * ```
     *
     * Angular will strip the prefix, before processing the JSON.
     *
     *
     * ### Cross Site Request Forgery (XSRF) Protection
     *
     * [XSRF](http://en.wikipedia.org/wiki/Cross-site_request_forgery) is an attack technique by
     * which the attacker can trick an authenticated user into unknowingly executing actions on your
     * website. Angular provides a mechanism to counter XSRF. When performing XHR requests, the
     * $http service reads a token from a cookie (by default, `XSRF-TOKEN`) and sets it as an HTTP
     * header (`X-XSRF-TOKEN`). Since only JavaScript that runs on your domain could read the
     * cookie, your server can be assured that the XHR came from JavaScript running on your domain.
     * The header will not be set for cross-domain requests.
     *
     * To take advantage of this, your server needs to set a token in a JavaScript readable session
     * cookie called `XSRF-TOKEN` on the first HTTP GET request. On subsequent XHR requests the
     * server can verify that the cookie matches `X-XSRF-TOKEN` HTTP header, and therefore be sure
     * that only JavaScript running on your domain could have sent the request. The token must be
     * unique for each user and must be verifiable by the server (to prevent the JavaScript from
     * making up its own tokens). We recommend that the token is a digest of your site's
     * authentication cookie with a [salt](https://en.wikipedia.org/wiki/Salt_(cryptography&#41;)
     * for added security.
     *
     * The name of the headers can be specified using the xsrfHeaderName and xsrfCookieName
     * properties of either $httpProvider.defaults at config-time, $http.defaults at run-time,
     * or the per-request config object.
     *
     * In order to prevent collisions in environments where multiple Angular apps share the
     * same domain or subdomain, we recommend that each application uses unique cookie name.
     *
     * @param {object} config Object describing the request to be made and how it should be
     *    processed. The object has following properties:
     *
     *    - **method** – `{string}` – HTTP method (e.g. 'GET', 'POST', etc)
     *    - **url** – `{string|TrustedObject}` – Absolute or relative URL of the resource that is being requested;
     *      or an object created by a call to `$sce.trustAsResourceUrl(url)`.
     *    - **params** – `{Object.<string|Object>}` – Map of strings or objects which will be serialized
     *      with the `paramSerializer` and appended as GET parameters.
     *    - **data** – `{string|Object}` – Data to be sent as the request message data.
     *    - **headers** – `{Object}` – Map of strings or functions which return strings representing
     *      HTTP headers to send to the server. If the return value of a function is null, the
     *      header will not be sent. Functions accept a config object as an argument.
     *    - **eventHandlers** - `{Object}` - Event listeners to be bound to the XMLHttpRequest object.
     *      To bind events to the XMLHttpRequest upload object, use `uploadEventHandlers`.
     *      The handler will be called in the context of a `$apply` block.
     *    - **uploadEventHandlers** - `{Object}` - Event listeners to be bound to the XMLHttpRequest upload
     *      object. To bind events to the XMLHttpRequest object, use `eventHandlers`.
     *      The handler will be called in the context of a `$apply` block.
     *    - **xsrfHeaderName** – `{string}` – Name of HTTP header to populate with the XSRF token.
     *    - **xsrfCookieName** – `{string}` – Name of cookie containing the XSRF token.
     *    - **transformRequest** –
     *      `{function(data, headersGetter)|Array.<function(data, headersGetter)>}` –
     *      transform function or an array of such functions. The transform function takes the http
     *      request body and headers and returns its transformed (typically serialized) version.
     *      See {@link ng.$http#overriding-the-default-transformations-per-request
     *      Overriding the Default Transformations}
     *    - **transformResponse** –
     *      `{function(data, headersGetter, status)|Array.<function(data, headersGetter, status)>}` –
     *      transform function or an array of such functions. The transform function takes the http
     *      response body, headers and status and returns its transformed (typically deserialized) version.
     *      See {@link ng.$http#overriding-the-default-transformations-per-request
     *      Overriding the Default Transformations}
     *    - **paramSerializer** - `{string|function(Object<string,string>):string}` - A function used to
     *      prepare the string representation of request parameters (specified as an object).
     *      If specified as string, it is interpreted as function registered with the
     *      {@link $injector $injector}, which means you can create your own serializer
     *      by registering it as a {@link auto.$provide#service service}.
     *      The default serializer is the {@link $httpParamSerializer $httpParamSerializer};
     *      alternatively, you can use the {@link $httpParamSerializerJQLike $httpParamSerializerJQLike}
     *    - **cache** – `{boolean|Object}` – A boolean value or object created with
     *      {@link ng.$cacheFactory `$cacheFactory`} to enable or disable caching of the HTTP response.
     *      See {@link $http#caching $http Caching} for more information.
     *    - **timeout** – `{number|Promise}` – timeout in milliseconds, or {@link ng.$q promise}
     *      that should abort the request when resolved.
     *    - **withCredentials** - `{boolean}` - whether to set the `withCredentials` flag on the
     *      XHR object. See [requests with credentials](https://developer.mozilla.org/docs/Web/HTTP/Access_control_CORS#Requests_with_credentials)
     *      for more information.
     *    - **responseType** - `{string}` - see
     *      [XMLHttpRequest.responseType](https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest#xmlhttprequest-responsetype).
     *
     * @returns {HttpPromise} Returns a {@link ng.$q `Promise}` that will be resolved to a response object
     *                        when the request succeeds or fails.
     *
     *
     * @property {Array.<Object>} pendingRequests Array of config objects for currently pending
     *   requests. This is primarily meant to be used for debugging purposes.
     *
     *
     * @example
<example module="httpExample" name="http-service">
<file name="index.html">
  <div ng-controller="FetchController">
    <select ng-model="method" aria-label="Request method">
      <option>GET</option>
      <option>JSONP</option>
    </select>
    <input type="text" ng-model="url" size="80" aria-label="URL" />
    <button id="fetchbtn" ng-click="fetch()">fetch</button><br>
    <button id="samplegetbtn" ng-click="updateModel('GET', 'http-hello.html')">Sample GET</button>
    <button id="samplejsonpbtn"
      ng-click="updateModel('JSONP',
                    'https://angularjs.org/greet.php?name=Super%20Hero')">
      Sample JSONP
    </button>
    <button id="invalidjsonpbtn"
      ng-click="updateModel('JSONP', 'https://angularjs.org/doesntexist')">
        Invalid JSONP
      </button>
    <pre>http status code: {{status}}</pre>
    <pre>http response data: {{data}}</pre>
  </div>
</file>
<file name="script.js">
  angular.module('httpExample', [])
    .config(['$sceDelegateProvider', function($sceDelegateProvider) {
      // We must whitelist the JSONP endpoint that we are using to show that we trust it
      $sceDelegateProvider.resourceUrlWhitelist([
        'self',
        'https://angularjs.org/**'
      ]);
    }])
    .controller('FetchController', ['$scope', '$http', '$templateCache',
      function($scope, $http, $templateCache) {
        $scope.method = 'GET';
        $scope.url = 'http-hello.html';

        $scope.fetch = function() {
          $scope.code = null;
          $scope.response = null;

          $http({method: $scope.method, url: $scope.url, cache: $templateCache}).
            then(function(response) {
              $scope.status = response.status;
              $scope.data = response.data;
            }, function(response) {
              $scope.data = response.data || 'Request failed';
              $scope.status = response.status;
          });
        };

        $scope.updateModel = function(method, url) {
          $scope.method = method;
          $scope.url = url;
        };
      }]);
</file>
<file name="http-hello.html">
  Hello, $http!
</file>
<file name="protractor.js" type="protractor">
  var status = element(by.binding('status'));
  var data = element(by.binding('data'));
  var fetchBtn = element(by.id('fetchbtn'));
  var sampleGetBtn = element(by.id('samplegetbtn'));
  var invalidJsonpBtn = element(by.id('invalidjsonpbtn'));

  it('should make an xhr GET request', function() {
    sampleGetBtn.click();
    fetchBtn.click();
    expect(status.getText()).toMatch('200');
    expect(data.getText()).toMatch(/Hello, \$http!/);
  });

// Commented out due to flakes. See https://github.com/angular/angular.js/issues/9185
// it('should make a JSONP request to angularjs.org', function() {
//   var sampleJsonpBtn = element(by.id('samplejsonpbtn'));
//   sampleJsonpBtn.click();
//   fetchBtn.click();
//   expect(status.getText()).toMatch('200');
//   expect(data.getText()).toMatch(/Super Hero!/);
// });

  it('should make JSONP request to invalid URL and invoke the error handler',
      function() {
    invalidJsonpBtn.click();
    fetchBtn.click();
    expect(status.getText()).toMatch('0');
    expect(data.getText()).toMatch('Request failed');
  });
</file>
</example>
     */
function $http(requestConfig){function chainInterceptors(promise,interceptors){for(var i=0,ii=interceptors.length;i<ii;){var thenFn=interceptors[i++],rejectFn=interceptors[i++];promise=promise.then(thenFn,rejectFn)}return interceptors.length=0,promise}function completeOutstandingRequest(){$browser.$$completeOutstandingRequest(noop)}function executeHeaderFns(headers,config){var headerContent,processedHeaders={};return forEach(headers,function(headerFn,header){isFunction(headerFn)?(headerContent=headerFn(config),null!=headerContent&&(processedHeaders[header]=headerContent)):processedHeaders[header]=headerFn}),processedHeaders}function mergeHeaders(config){var defHeaderName,lowercaseDefHeaderName,reqHeaderName,defHeaders=defaults.headers,reqHeaders=extend({},config.headers);defHeaders=extend({},defHeaders.common,defHeaders[lowercase(config.method)]);
// using for-in instead of forEach to avoid unnecessary iteration after header has been found
defaultHeadersIteration:for(defHeaderName in defHeaders){lowercaseDefHeaderName=lowercase(defHeaderName);for(reqHeaderName in reqHeaders)if(lowercase(reqHeaderName)===lowercaseDefHeaderName)continue defaultHeadersIteration;reqHeaders[defHeaderName]=defHeaders[defHeaderName]}
// execute if header value is a function for merged headers
return executeHeaderFns(reqHeaders,shallowCopy(config))}function serverRequest(config){var headers=config.headers,reqData=transformData(config.data,headersGetter(headers),void 0,config.transformRequest);
// send request
// strip content-type if data is undefined
return isUndefined(reqData)&&forEach(headers,function(value,header){"content-type"===lowercase(header)&&delete headers[header]}),isUndefined(config.withCredentials)&&!isUndefined(defaults.withCredentials)&&(config.withCredentials=defaults.withCredentials),sendReq(config,reqData).then(transformResponse,transformResponse)}function transformResponse(response){
// make a copy since the response must be cacheable
var resp=extend({},response);return resp.data=transformData(response.data,response.headers,response.status,config.transformResponse),isSuccess(response.status)?resp:$q.reject(resp)}if(!isObject(requestConfig))throw minErr("$http")("badreq","Http request configuration must be an object.  Received: {0}",requestConfig);if(!isString($sce.valueOf(requestConfig.url)))throw minErr("$http")("badreq","Http request configuration url must be a string or a $sce trusted object.  Received: {0}",requestConfig.url);var config=extend({method:"get",transformRequest:defaults.transformRequest,transformResponse:defaults.transformResponse,paramSerializer:defaults.paramSerializer,jsonpCallbackParam:defaults.jsonpCallbackParam},requestConfig);config.headers=mergeHeaders(requestConfig),config.method=uppercase(config.method),config.paramSerializer=isString(config.paramSerializer)?$injector.get(config.paramSerializer):config.paramSerializer,$browser.$$incOutstandingRequestCount();var requestInterceptors=[],responseInterceptors=[],promise=$q.resolve(config);
// apply interceptors
return forEach(reversedInterceptors,function(interceptor){(interceptor.request||interceptor.requestError)&&requestInterceptors.unshift(interceptor.request,interceptor.requestError),(interceptor.response||interceptor.responseError)&&responseInterceptors.push(interceptor.response,interceptor.responseError)}),promise=chainInterceptors(promise,requestInterceptors),promise=promise.then(serverRequest),promise=chainInterceptors(promise,responseInterceptors),promise=promise["finally"](completeOutstandingRequest)}function createShortMethods(names){forEach(arguments,function(name){$http[name]=function(url,config){return $http(extend({},config||{},{method:name,url:url}))}})}function createShortMethodsWithData(name){forEach(arguments,function(name){$http[name]=function(url,data,config){return $http(extend({},config||{},{method:name,url:url,data:data}))}})}/**
     * Makes the request.
     *
     * !!! ACCESSES CLOSURE VARS:
     * $httpBackend, defaults, $log, $rootScope, defaultCache, $http.pendingRequests
     */
function sendReq(config,reqData){function createApplyHandlers(eventHandlers){if(eventHandlers){var applyHandlers={};return forEach(eventHandlers,function(eventHandler,key){applyHandlers[key]=function(event){function callEventHandler(){eventHandler(event)}useApplyAsync?$rootScope.$applyAsync(callEventHandler):$rootScope.$$phase?callEventHandler():$rootScope.$apply(callEventHandler)}}),applyHandlers}}/**
       * Callback registered to $httpBackend():
       *  - caches the response if desired
       *  - resolves the raw $http promise
       *  - calls $apply
       */
function done(status,response,headersString,statusText){function resolveHttpPromise(){resolvePromise(response,status,headersString,statusText)}cache&&(isSuccess(status)?cache.put(url,[status,response,parseHeaders(headersString),statusText]):
// remove promise from the cache
cache.remove(url)),useApplyAsync?$rootScope.$applyAsync(resolveHttpPromise):(resolveHttpPromise(),$rootScope.$$phase||$rootScope.$apply())}/**
       * Resolves the raw $http promise.
       */
function resolvePromise(response,status,headers,statusText){
//status: HTTP response status code, 0, -1 (aborted by timeout / promise)
status=status>=-1?status:0,(isSuccess(status)?deferred.resolve:deferred.reject)({data:response,status:status,headers:headersGetter(headers),config:config,statusText:statusText})}function resolvePromiseWithResult(result){resolvePromise(result.data,result.status,shallowCopy(result.headers()),result.statusText)}function removePendingReq(){var idx=$http.pendingRequests.indexOf(config);idx!==-1&&$http.pendingRequests.splice(idx,1)}var cache,cachedResp,deferred=$q.defer(),promise=deferred.promise,reqHeaders=config.headers,isJsonp="jsonp"===lowercase(config.method),url=config.url;
// if we won't have the response in cache, set the xsrf headers and
// send the request to the backend
if(isJsonp?
// JSONP is a pretty sensitive operation where we're allowing a script to have full access to
// our DOM and JS space.  So we require that the URL satisfies SCE.RESOURCE_URL.
url=$sce.getTrustedResourceUrl(url):isString(url)||(
// If it is not a string then the URL must be a $sce trusted object
url=$sce.valueOf(url)),url=buildUrl(url,config.paramSerializer(config.params)),isJsonp&&(
// Check the url and add the JSONP callback placeholder
url=sanitizeJsonpCallbackParam(url,config.jsonpCallbackParam)),$http.pendingRequests.push(config),promise.then(removePendingReq,removePendingReq),!config.cache&&!defaults.cache||config.cache===!1||"GET"!==config.method&&"JSONP"!==config.method||(cache=isObject(config.cache)?config.cache:isObject(/** @type {?} */defaults.cache)?/** @type {?} */defaults.cache:defaultCache),cache&&(cachedResp=cache.get(url),isDefined(cachedResp)?isPromiseLike(cachedResp)?
// cached request has already been sent, but there is no response yet
cachedResp.then(resolvePromiseWithResult,resolvePromiseWithResult):
// serving from cache
isArray(cachedResp)?resolvePromise(cachedResp[1],cachedResp[0],shallowCopy(cachedResp[2]),cachedResp[3]):resolvePromise(cachedResp,200,{},"OK"):
// put the promise for the non-transformed response into cache as a placeholder
cache.put(url,promise)),isUndefined(cachedResp)){var xsrfValue=urlIsSameOrigin(config.url)?$$cookieReader()[config.xsrfCookieName||defaults.xsrfCookieName]:void 0;xsrfValue&&(reqHeaders[config.xsrfHeaderName||defaults.xsrfHeaderName]=xsrfValue),$httpBackend(config.method,url,reqData,done,reqHeaders,config.timeout,config.withCredentials,config.responseType,createApplyHandlers(config.eventHandlers),createApplyHandlers(config.uploadEventHandlers))}return promise}function buildUrl(url,serializedParams){return serializedParams.length>0&&(url+=(url.indexOf("?")===-1?"?":"&")+serializedParams),url}function sanitizeJsonpCallbackParam(url,key){if(/[&?][^=]+=JSON_CALLBACK/.test(url))
// Throw if the url already contains a reference to JSON_CALLBACK
throw $httpMinErr("badjsonp",'Illegal use of JSON_CALLBACK in url, "{0}"',url);var callbackParamRegex=new RegExp("[&?]"+key+"=");if(callbackParamRegex.test(url))
// Throw if the callback param was already provided
throw $httpMinErr("badjsonp",'Illegal use of callback param, "{0}", in url, "{1}"',key,url);
// Add in the JSON_CALLBACK callback param value
return url+=(url.indexOf("?")===-1?"?":"&")+key+"=JSON_CALLBACK"}var defaultCache=$cacheFactory("$http");/**
     * Make sure that default param serializer is exposed as a function
     */
defaults.paramSerializer=isString(defaults.paramSerializer)?$injector.get(defaults.paramSerializer):defaults.paramSerializer;/**
     * Interceptors stored in reverse order. Inner interceptors before outer interceptors.
     * The reversal is needed so that we can build up the interception chain around the
     * server request.
     */
var reversedInterceptors=[];/**
     * @ngdoc method
     * @name $http#get
     *
     * @description
     * Shortcut method to perform `GET` request.
     *
     * @param {string|TrustedObject} url Absolute or relative URL of the resource that is being requested;
     *                                   or an object created by a call to `$sce.trustAsResourceUrl(url)`.
     * @param {Object=} config Optional configuration object
     * @returns {HttpPromise} Future object
     */
/**
     * @ngdoc method
     * @name $http#delete
     *
     * @description
     * Shortcut method to perform `DELETE` request.
     *
     * @param {string|TrustedObject} url Absolute or relative URL of the resource that is being requested;
     *                                   or an object created by a call to `$sce.trustAsResourceUrl(url)`.
     * @param {Object=} config Optional configuration object
     * @returns {HttpPromise} Future object
     */
/**
     * @ngdoc method
     * @name $http#head
     *
     * @description
     * Shortcut method to perform `HEAD` request.
     *
     * @param {string|TrustedObject} url Absolute or relative URL of the resource that is being requested;
     *                                   or an object created by a call to `$sce.trustAsResourceUrl(url)`.
     * @param {Object=} config Optional configuration object
     * @returns {HttpPromise} Future object
     */
/**
     * @ngdoc method
     * @name $http#jsonp
     *
     * @description
     * Shortcut method to perform `JSONP` request.
     *
     * Note that, since JSONP requests are sensitive because the response is given full access to the browser,
     * the url must be declared, via {@link $sce} as a trusted resource URL.
     * You can trust a URL by adding it to the whitelist via
     * {@link $sceDelegateProvider#resourceUrlWhitelist  `$sceDelegateProvider.resourceUrlWhitelist`} or
     * by explicitly trusting the URL via {@link $sce#trustAsResourceUrl `$sce.trustAsResourceUrl(url)`}.
     *
     * JSONP requests must specify a callback to be used in the response from the server. This callback
     * is passed as a query parameter in the request. You must specify the name of this parameter by
     * setting the `jsonpCallbackParam` property on the request config object.
     *
     * ```
     * $http.jsonp('some/trusted/url', {jsonpCallbackParam: 'callback'})
     * ```
     *
     * You can also specify a default callback parameter name in `$http.defaults.jsonpCallbackParam`.
     * Initially this is set to `'callback'`.
     *
     * <div class="alert alert-danger">
     * You can no longer use the `JSON_CALLBACK` string as a placeholder for specifying where the callback
     * parameter value should go.
     * </div>
     *
     * If you would like to customise where and how the callbacks are stored then try overriding
     * or decorating the {@link $jsonpCallbacks} service.
     *
     * @param {string|TrustedObject} url Absolute or relative URL of the resource that is being requested;
     *                                   or an object created by a call to `$sce.trustAsResourceUrl(url)`.
     * @param {Object=} config Optional configuration object
     * @returns {HttpPromise} Future object
     */
/**
     * @ngdoc method
     * @name $http#post
     *
     * @description
     * Shortcut method to perform `POST` request.
     *
     * @param {string} url Relative or absolute URL specifying the destination of the request
     * @param {*} data Request content
     * @param {Object=} config Optional configuration object
     * @returns {HttpPromise} Future object
     */
/**
     * @ngdoc method
     * @name $http#put
     *
     * @description
     * Shortcut method to perform `PUT` request.
     *
     * @param {string} url Relative or absolute URL specifying the destination of the request
     * @param {*} data Request content
     * @param {Object=} config Optional configuration object
     * @returns {HttpPromise} Future object
     */
/**
      * @ngdoc method
      * @name $http#patch
      *
      * @description
      * Shortcut method to perform `PATCH` request.
      *
      * @param {string} url Relative or absolute URL specifying the destination of the request
      * @param {*} data Request content
      * @param {Object=} config Optional configuration object
      * @returns {HttpPromise} Future object
      */
/**
         * @ngdoc property
         * @name $http#defaults
         *
         * @description
         * Runtime equivalent of the `$httpProvider.defaults` property. Allows configuration of
         * default headers, withCredentials as well as request and response transformations.
         *
         * See "Setting HTTP Headers" and "Transforming Requests and Responses" sections above.
         */
return forEach(interceptorFactories,function(interceptorFactory){reversedInterceptors.unshift(isString(interceptorFactory)?$injector.get(interceptorFactory):$injector.invoke(interceptorFactory))}),$http.pendingRequests=[],createShortMethods("get","delete","head","jsonp"),createShortMethodsWithData("post","put","patch"),$http.defaults=defaults,$http}]}/**
 * @ngdoc service
 * @name $xhrFactory
 * @this
 *
 * @description
 * Factory function used to create XMLHttpRequest objects.
 *
 * Replace or decorate this service to create your own custom XMLHttpRequest objects.
 *
 * ```
 * angular.module('myApp', [])
 * .factory('$xhrFactory', function() {
 *   return function createXhr(method, url) {
 *     return new window.XMLHttpRequest({mozSystem: true});
 *   };
 * });
 * ```
 *
 * @param {string} method HTTP method of the request (GET, POST, PUT, ..)
 * @param {string} url URL of the request.
 */
function $xhrFactoryProvider(){this.$get=function(){return function(){return new window.XMLHttpRequest}}}/**
 * @ngdoc service
 * @name $httpBackend
 * @requires $jsonpCallbacks
 * @requires $document
 * @requires $xhrFactory
 * @this
 *
 * @description
 * HTTP backend used by the {@link ng.$http service} that delegates to
 * XMLHttpRequest object or JSONP and deals with browser incompatibilities.
 *
 * You should never need to use this service directly, instead use the higher-level abstractions:
 * {@link ng.$http $http} or {@link ngResource.$resource $resource}.
 *
 * During testing this implementation is swapped with {@link ngMock.$httpBackend mock
 * $httpBackend} which can be trained with responses.
 */
function $HttpBackendProvider(){this.$get=["$browser","$jsonpCallbacks","$document","$xhrFactory",function($browser,$jsonpCallbacks,$document,$xhrFactory){return createHttpBackend($browser,$xhrFactory,$browser.defer,$jsonpCallbacks,$document[0])}]}function createHttpBackend($browser,createXhr,$browserDefer,callbacks,rawDocument){function jsonpReq(url,callbackPath,done){url=url.replace("JSON_CALLBACK",callbackPath);
// we can't use jQuery/jqLite here because jQuery does crazy stuff with script elements, e.g.:
// - fetches local scripts via XHR and evals them
// - adds and immediately removes script elements from the document
var script=rawDocument.createElement("script"),callback=null;return script.type="text/javascript",script.src=url,script.async=!0,callback=function(event){script.removeEventListener("load",callback),script.removeEventListener("error",callback),rawDocument.body.removeChild(script),script=null;var status=-1,text="unknown";event&&("load"!==event.type||callbacks.wasCalled(callbackPath)||(event={type:"error"}),text=event.type,status="error"===event.type?404:200),done&&done(status,text)},script.addEventListener("load",callback),script.addEventListener("error",callback),rawDocument.body.appendChild(script),callback}
// TODO(vojta): fix the signature
return function(method,url,post,callback,headers,timeout,withCredentials,responseType,eventHandlers,uploadEventHandlers){function timeoutRequest(){jsonpDone&&jsonpDone(),xhr&&xhr.abort()}function completeRequest(callback,status,response,headersString,statusText){
// cancel timeout and subsequent timeout promise resolution
isDefined(timeoutId)&&$browserDefer.cancel(timeoutId),jsonpDone=xhr=null,callback(status,response,headersString,statusText)}if(url=url||$browser.url(),"jsonp"===lowercase(method))var callbackPath=callbacks.createCallback(url),jsonpDone=jsonpReq(url,callbackPath,function(status,text){
// jsonpReq only ever sets status to 200 (OK), 404 (ERROR) or -1 (WAITING)
var response=200===status&&callbacks.getResponse(callbackPath);completeRequest(callback,status,response,"",text),callbacks.removeCallback(callbackPath)});else{var xhr=createXhr(method,url);xhr.open(method,url,!0),forEach(headers,function(value,key){isDefined(value)&&xhr.setRequestHeader(key,value)}),xhr.onload=function(){var statusText=xhr.statusText||"",response="response"in xhr?xhr.response:xhr.responseText,status=1223===xhr.status?204:xhr.status;
// fix status code when it is 0 (0 status is undocumented).
// Occurs when accessing file resources or on Android 4.1 stock browser
// while retrieving files from application cache.
0===status&&(status=response?200:"file"===urlResolve(url).protocol?404:0),completeRequest(callback,status,response,xhr.getAllResponseHeaders(),statusText)};var requestError=function(){
// The response is always empty
// See https://xhr.spec.whatwg.org/#request-error-steps and https://fetch.spec.whatwg.org/#concept-network-error
completeRequest(callback,-1,null,null,"")};if(xhr.onerror=requestError,xhr.onabort=requestError,xhr.ontimeout=requestError,forEach(eventHandlers,function(value,key){xhr.addEventListener(key,value)}),forEach(uploadEventHandlers,function(value,key){xhr.upload.addEventListener(key,value)}),withCredentials&&(xhr.withCredentials=!0),responseType)try{xhr.responseType=responseType}catch(e){
// WebKit added support for the json responseType value on 09/03/2013
// https://bugs.webkit.org/show_bug.cgi?id=73648. Versions of Safari prior to 7 are
// known to throw when setting the value "json" as the response type. Other older
// browsers implementing the responseType
//
// The json response type can be ignored if not supported, because JSON payloads are
// parsed on the client-side regardless.
if("json"!==responseType)throw e}xhr.send(isUndefined(post)?null:post)}if(timeout>0)var timeoutId=$browserDefer(timeoutRequest,timeout);else isPromiseLike(timeout)&&timeout.then(timeoutRequest)}}/**
 * @ngdoc provider
 * @name $interpolateProvider
 * @this
 *
 * @description
 *
 * Used for configuring the interpolation markup. Defaults to `{{` and `}}`.
 *
 * <div class="alert alert-danger">
 * This feature is sometimes used to mix different markup languages, e.g. to wrap an Angular
 * template within a Python Jinja template (or any other template language). Mixing templating
 * languages is **very dangerous**. The embedding template language will not safely escape Angular
 * expressions, so any user-controlled values in the template will cause Cross Site Scripting (XSS)
 * security bugs!
 * </div>
 *
 * @example
<example name="custom-interpolation-markup" module="customInterpolationApp">
<file name="index.html">
<script>
  var customInterpolationApp = angular.module('customInterpolationApp', []);

  customInterpolationApp.config(function($interpolateProvider) {
    $interpolateProvider.startSymbol('//');
    $interpolateProvider.endSymbol('//');
  });


  customInterpolationApp.controller('DemoController', function() {
      this.label = "This binding is brought you by // interpolation symbols.";
  });
</script>
<div ng-controller="DemoController as demo">
    //demo.label//
</div>
</file>
<file name="protractor.js" type="protractor">
  it('should interpolate binding with custom symbols', function() {
    expect(element(by.binding('demo.label')).getText()).toBe('This binding is brought you by // interpolation symbols.');
  });
</file>
</example>
 */
function $InterpolateProvider(){var startSymbol="{{",endSymbol="}}";/**
   * @ngdoc method
   * @name $interpolateProvider#startSymbol
   * @description
   * Symbol to denote start of expression in the interpolated string. Defaults to `{{`.
   *
   * @param {string=} value new value to set the starting symbol to.
   * @returns {string|self} Returns the symbol when used as getter and self if used as setter.
   */
this.startSymbol=function(value){return value?(startSymbol=value,this):startSymbol},/**
   * @ngdoc method
   * @name $interpolateProvider#endSymbol
   * @description
   * Symbol to denote the end of expression in the interpolated string. Defaults to `}}`.
   *
   * @param {string=} value new value to set the ending symbol to.
   * @returns {string|self} Returns the symbol when used as getter and self if used as setter.
   */
this.endSymbol=function(value){return value?(endSymbol=value,this):endSymbol},this.$get=["$parse","$exceptionHandler","$sce",function($parse,$exceptionHandler,$sce){function escape(ch){return"\\\\\\"+ch}function unescapeText(text){return text.replace(escapedStartRegexp,startSymbol).replace(escapedEndRegexp,endSymbol)}
// TODO: this is the same as the constantWatchDelegate in parse.js
function constantWatchDelegate(scope,listener,objectEquality,constantInterp){var unwatch=scope.$watch(function(scope){return unwatch(),constantInterp(scope)},listener,objectEquality);return unwatch}/**
     * @ngdoc service
     * @name $interpolate
     * @kind function
     *
     * @requires $parse
     * @requires $sce
     *
     * @description
     *
     * Compiles a string with markup into an interpolation function. This service is used by the
     * HTML {@link ng.$compile $compile} service for data binding. See
     * {@link ng.$interpolateProvider $interpolateProvider} for configuring the
     * interpolation markup.
     *
     *
     * ```js
     *   var $interpolate = ...; // injected
     *   var exp = $interpolate('Hello {{name | uppercase}}!');
     *   expect(exp({name:'Angular'})).toEqual('Hello ANGULAR!');
     * ```
     *
     * `$interpolate` takes an optional fourth argument, `allOrNothing`. If `allOrNothing` is
     * `true`, the interpolation function will return `undefined` unless all embedded expressions
     * evaluate to a value other than `undefined`.
     *
     * ```js
     *   var $interpolate = ...; // injected
     *   var context = {greeting: 'Hello', name: undefined };
     *
     *   // default "forgiving" mode
     *   var exp = $interpolate('{{greeting}} {{name}}!');
     *   expect(exp(context)).toEqual('Hello !');
     *
     *   // "allOrNothing" mode
     *   exp = $interpolate('{{greeting}} {{name}}!', false, null, true);
     *   expect(exp(context)).toBeUndefined();
     *   context.name = 'Angular';
     *   expect(exp(context)).toEqual('Hello Angular!');
     * ```
     *
     * `allOrNothing` is useful for interpolating URLs. `ngSrc` and `ngSrcset` use this behavior.
     *
     * #### Escaped Interpolation
     * $interpolate provides a mechanism for escaping interpolation markers. Start and end markers
     * can be escaped by preceding each of their characters with a REVERSE SOLIDUS U+005C (backslash).
     * It will be rendered as a regular start/end marker, and will not be interpreted as an expression
     * or binding.
     *
     * This enables web-servers to prevent script injection attacks and defacing attacks, to some
     * degree, while also enabling code examples to work without relying on the
     * {@link ng.directive:ngNonBindable ngNonBindable} directive.
     *
     * **For security purposes, it is strongly encouraged that web servers escape user-supplied data,
     * replacing angle brackets (&lt;, &gt;) with &amp;lt; and &amp;gt; respectively, and replacing all
     * interpolation start/end markers with their escaped counterparts.**
     *
     * Escaped interpolation markers are only replaced with the actual interpolation markers in rendered
     * output when the $interpolate service processes the text. So, for HTML elements interpolated
     * by {@link ng.$compile $compile}, or otherwise interpolated with the `mustHaveExpression` parameter
     * set to `true`, the interpolated text must contain an unescaped interpolation expression. As such,
     * this is typically useful only when user-data is used in rendering a template from the server, or
     * when otherwise untrusted data is used by a directive.
     *
     * <example name="interpolation">
     *  <file name="index.html">
     *    <div ng-init="username='A user'">
     *      <p ng-init="apptitle='Escaping demo'">{{apptitle}}: \{\{ username = "defaced value"; \}\}
     *        </p>
     *      <p><strong>{{username}}</strong> attempts to inject code which will deface the
     *        application, but fails to accomplish their task, because the server has correctly
     *        escaped the interpolation start/end markers with REVERSE SOLIDUS U+005C (backslash)
     *        characters.</p>
     *      <p>Instead, the result of the attempted script injection is visible, and can be removed
     *        from the database by an administrator.</p>
     *    </div>
     *  </file>
     * </example>
     *
     * @knownIssue
     * It is currently not possible for an interpolated expression to contain the interpolation end
     * symbol. For example, `{{ '}}' }}` will be incorrectly interpreted as `{{ ' }}` + `' }}`, i.e.
     * an interpolated expression consisting of a single-quote (`'`) and the `' }}` string.
     *
     * @knownIssue
     * All directives and components must use the standard `{{` `}}` interpolation symbols
     * in their templates. If you change the application interpolation symbols the {@link $compile}
     * service will attempt to denormalize the standard symbols to the custom symbols.
     * The denormalization process is not clever enough to know not to replace instances of the standard
     * symbols where they would not normally be treated as interpolation symbols. For example in the following
     * code snippet the closing braces of the literal object will get incorrectly denormalized:
     *
     * ```
     * <div data-context='{"context":{"id":3,"type":"page"}}">
     * ```
     *
     * The workaround is to ensure that such instances are separated by whitespace:
     * ```
     * <div data-context='{"context":{"id":3,"type":"page"} }">
     * ```
     *
     * See https://github.com/angular/angular.js/pull/14610#issuecomment-219401099 for more information.
     *
     * @param {string} text The text with markup to interpolate.
     * @param {boolean=} mustHaveExpression if set to true then the interpolation string must have
     *    embedded expression in order to return an interpolation function. Strings with no
     *    embedded expression will return null for the interpolation function.
     * @param {string=} trustedContext when provided, the returned function passes the interpolated
     *    result through {@link ng.$sce#getTrusted $sce.getTrusted(interpolatedResult,
     *    trustedContext)} before returning it.  Refer to the {@link ng.$sce $sce} service that
     *    provides Strict Contextual Escaping for details.
     * @param {boolean=} allOrNothing if `true`, then the returned function returns undefined
     *    unless all embedded expressions evaluate to a value other than `undefined`.
     * @returns {function(context)} an interpolation function which is used to compute the
     *    interpolated string. The function has these parameters:
     *
     * - `context`: evaluation context for all expressions embedded in the interpolated text
     */
function $interpolate(text,mustHaveExpression,trustedContext,allOrNothing){function parseStringifyInterceptor(value){try{return value=getValue(value),allOrNothing&&!isDefined(value)?value:stringify(value)}catch(err){$exceptionHandler($interpolateMinErr.interr(text,err))}}
// Provide a quick exit and simplified result function for text with no interpolation
if(!text.length||text.indexOf(startSymbol)===-1){var constantInterp;if(!mustHaveExpression){var unescapedText=unescapeText(text);constantInterp=valueFn(unescapedText),constantInterp.exp=text,constantInterp.expressions=[],constantInterp.$$watchDelegate=constantWatchDelegate}return constantInterp}allOrNothing=!!allOrNothing;for(var startIndex,endIndex,exp,index=0,expressions=[],parseFns=[],textLength=text.length,concat=[],expressionPositions=[];index<textLength;){if((startIndex=text.indexOf(startSymbol,index))===-1||(endIndex=text.indexOf(endSymbol,startIndex+startSymbolLength))===-1){
// we did not find an interpolation, so we have to add the remainder to the separators array
index!==textLength&&concat.push(unescapeText(text.substring(index)));break}index!==startIndex&&concat.push(unescapeText(text.substring(index,startIndex))),exp=text.substring(startIndex+startSymbolLength,endIndex),expressions.push(exp),parseFns.push($parse(exp,parseStringifyInterceptor)),index=endIndex+endSymbolLength,expressionPositions.push(concat.length),concat.push("")}if(
// Concatenating expressions makes it hard to reason about whether some combination of
// concatenated values are unsafe to use and could easily lead to XSS.  By requiring that a
// single expression be used for iframe[src], object[src], etc., we ensure that the value
// that's used is assigned or constructed by some JS code somewhere that is more testable or
// make it obvious that you bound the value to some user controlled value.  This helps reduce
// the load when auditing for XSS issues.
trustedContext&&concat.length>1&&$interpolateMinErr.throwNoconcat(text),!mustHaveExpression||expressions.length){var compute=function(values){for(var i=0,ii=expressions.length;i<ii;i++){if(allOrNothing&&isUndefined(values[i]))return;concat[expressionPositions[i]]=values[i]}return concat.join("")},getValue=function(value){return trustedContext?$sce.getTrusted(trustedContext,value):$sce.valueOf(value)};return extend(function(context){var i=0,ii=expressions.length,values=new Array(ii);try{for(;i<ii;i++)values[i]=parseFns[i](context);return compute(values)}catch(err){$exceptionHandler($interpolateMinErr.interr(text,err))}},{
// all of these properties are undocumented for now
exp:text,//just for compatibility with regular watchers created via $watch
expressions:expressions,$$watchDelegate:function(scope,listener){var lastValue;/** @this */
return scope.$watchGroup(parseFns,function(values,oldValues){var currValue=compute(values);isFunction(listener)&&listener.call(this,currValue,values!==oldValues?lastValue:currValue,scope),lastValue=currValue})}})}}var startSymbolLength=startSymbol.length,endSymbolLength=endSymbol.length,escapedStartRegexp=new RegExp(startSymbol.replace(/./g,escape),"g"),escapedEndRegexp=new RegExp(endSymbol.replace(/./g,escape),"g");/**
     * @ngdoc method
     * @name $interpolate#startSymbol
     * @description
     * Symbol to denote the start of expression in the interpolated string. Defaults to `{{`.
     *
     * Use {@link ng.$interpolateProvider#startSymbol `$interpolateProvider.startSymbol`} to change
     * the symbol.
     *
     * @returns {string} start symbol.
     */
/**
     * @ngdoc method
     * @name $interpolate#endSymbol
     * @description
     * Symbol to denote the end of expression in the interpolated string. Defaults to `}}`.
     *
     * Use {@link ng.$interpolateProvider#endSymbol `$interpolateProvider.endSymbol`} to change
     * the symbol.
     *
     * @returns {string} end symbol.
     */
return $interpolate.startSymbol=function(){return startSymbol},$interpolate.endSymbol=function(){return endSymbol},$interpolate}]}/** @this */
function $IntervalProvider(){this.$get=["$rootScope","$window","$q","$$q","$browser",function($rootScope,$window,$q,$$q,$browser){/**
      * @ngdoc service
      * @name $interval
      *
      * @description
      * Angular's wrapper for `window.setInterval`. The `fn` function is executed every `delay`
      * milliseconds.
      *
      * The return value of registering an interval function is a promise. This promise will be
      * notified upon each tick of the interval, and will be resolved after `count` iterations, or
      * run indefinitely if `count` is not defined. The value of the notification will be the
      * number of iterations that have run.
      * To cancel an interval, call `$interval.cancel(promise)`.
      *
      * In tests you can use {@link ngMock.$interval#flush `$interval.flush(millis)`} to
      * move forward by `millis` milliseconds and trigger any functions scheduled to run in that
      * time.
      *
      * <div class="alert alert-warning">
      * **Note**: Intervals created by this service must be explicitly destroyed when you are finished
      * with them.  In particular they are not automatically destroyed when a controller's scope or a
      * directive's element are destroyed.
      * You should take this into consideration and make sure to always cancel the interval at the
      * appropriate moment.  See the example below for more details on how and when to do this.
      * </div>
      *
      * @param {function()} fn A function that should be called repeatedly. If no additional arguments
      *   are passed (see below), the function is called with the current iteration count.
      * @param {number} delay Number of milliseconds between each function call.
      * @param {number=} [count=0] Number of times to repeat. If not set, or 0, will repeat
      *   indefinitely.
      * @param {boolean=} [invokeApply=true] If set to `false` skips model dirty checking, otherwise
      *   will invoke `fn` within the {@link ng.$rootScope.Scope#$apply $apply} block.
      * @param {...*=} Pass additional parameters to the executed function.
      * @returns {promise} A promise which will be notified on each iteration. It will resolve once all iterations of the interval complete.
      *
      * @example
      * <example module="intervalExample" name="interval-service">
      * <file name="index.html">
      *   <script>
      *     angular.module('intervalExample', [])
      *       .controller('ExampleController', ['$scope', '$interval',
      *         function($scope, $interval) {
      *           $scope.format = 'M/d/yy h:mm:ss a';
      *           $scope.blood_1 = 100;
      *           $scope.blood_2 = 120;
      *
      *           var stop;
      *           $scope.fight = function() {
      *             // Don't start a new fight if we are already fighting
      *             if ( angular.isDefined(stop) ) return;
      *
      *             stop = $interval(function() {
      *               if ($scope.blood_1 > 0 && $scope.blood_2 > 0) {
      *                 $scope.blood_1 = $scope.blood_1 - 3;
      *                 $scope.blood_2 = $scope.blood_2 - 4;
      *               } else {
      *                 $scope.stopFight();
      *               }
      *             }, 100);
      *           };
      *
      *           $scope.stopFight = function() {
      *             if (angular.isDefined(stop)) {
      *               $interval.cancel(stop);
      *               stop = undefined;
      *             }
      *           };
      *
      *           $scope.resetFight = function() {
      *             $scope.blood_1 = 100;
      *             $scope.blood_2 = 120;
      *           };
      *
      *           $scope.$on('$destroy', function() {
      *             // Make sure that the interval is destroyed too
      *             $scope.stopFight();
      *           });
      *         }])
      *       // Register the 'myCurrentTime' directive factory method.
      *       // We inject $interval and dateFilter service since the factory method is DI.
      *       .directive('myCurrentTime', ['$interval', 'dateFilter',
      *         function($interval, dateFilter) {
      *           // return the directive link function. (compile function not needed)
      *           return function(scope, element, attrs) {
      *             var format,  // date format
      *                 stopTime; // so that we can cancel the time updates
      *
      *             // used to update the UI
      *             function updateTime() {
      *               element.text(dateFilter(new Date(), format));
      *             }
      *
      *             // watch the expression, and update the UI on change.
      *             scope.$watch(attrs.myCurrentTime, function(value) {
      *               format = value;
      *               updateTime();
      *             });
      *
      *             stopTime = $interval(updateTime, 1000);
      *
      *             // listen on DOM destroy (removal) event, and cancel the next UI update
      *             // to prevent updating time after the DOM element was removed.
      *             element.on('$destroy', function() {
      *               $interval.cancel(stopTime);
      *             });
      *           }
      *         }]);
      *   </script>
      *
      *   <div>
      *     <div ng-controller="ExampleController">
      *       <label>Date format: <input ng-model="format"></label> <hr/>
      *       Current time is: <span my-current-time="format"></span>
      *       <hr/>
      *       Blood 1 : <font color='red'>{{blood_1}}</font>
      *       Blood 2 : <font color='red'>{{blood_2}}</font>
      *       <button type="button" data-ng-click="fight()">Fight</button>
      *       <button type="button" data-ng-click="stopFight()">StopFight</button>
      *       <button type="button" data-ng-click="resetFight()">resetFight</button>
      *     </div>
      *   </div>
      *
      * </file>
      * </example>
      */
function interval(fn,delay,count,invokeApply){function callback(){hasParams?fn.apply(null,args):fn(iteration)}var hasParams=arguments.length>4,args=hasParams?sliceArgs(arguments,4):[],setInterval=$window.setInterval,clearInterval=$window.clearInterval,iteration=0,skipApply=isDefined(invokeApply)&&!invokeApply,deferred=(skipApply?$$q:$q).defer(),promise=deferred.promise;return count=isDefined(count)?count:0,promise.$$intervalId=setInterval(function(){skipApply?$browser.defer(callback):$rootScope.$evalAsync(callback),deferred.notify(iteration++),count>0&&iteration>=count&&(deferred.resolve(iteration),clearInterval(promise.$$intervalId),delete intervals[promise.$$intervalId]),skipApply||$rootScope.$apply()},delay),intervals[promise.$$intervalId]=deferred,promise}var intervals={};/**
      * @ngdoc method
      * @name $interval#cancel
      *
      * @description
      * Cancels a task associated with the `promise`.
      *
      * @param {Promise=} promise returned by the `$interval` function.
      * @returns {boolean} Returns `true` if the task was successfully canceled.
      */
return interval.cancel=function(promise){
// Interval cancels should not report as unhandled promise.
return!!(promise&&promise.$$intervalId in intervals)&&(intervals[promise.$$intervalId].promise["catch"](noop),intervals[promise.$$intervalId].reject("canceled"),$window.clearInterval(promise.$$intervalId),delete intervals[promise.$$intervalId],!0)},interval}]}/**
 * Encode path using encodeUriSegment, ignoring forward slashes
 *
 * @param {string} path Path to encode
 * @returns {string}
 */
function encodePath(path){for(var segments=path.split("/"),i=segments.length;i--;)segments[i]=encodeUriSegment(segments[i]);return segments.join("/")}function parseAbsoluteUrl(absoluteUrl,locationObj){var parsedUrl=urlResolve(absoluteUrl);locationObj.$$protocol=parsedUrl.protocol,locationObj.$$host=parsedUrl.hostname,locationObj.$$port=toInt(parsedUrl.port)||DEFAULT_PORTS[parsedUrl.protocol]||null}function parseAppUrl(url,locationObj){if(DOUBLE_SLASH_REGEX.test(url))throw $locationMinErr("badpath",'Invalid url "{0}".',url);var prefixed="/"!==url.charAt(0);prefixed&&(url="/"+url);var match=urlResolve(url);locationObj.$$path=decodeURIComponent(prefixed&&"/"===match.pathname.charAt(0)?match.pathname.substring(1):match.pathname),locationObj.$$search=parseKeyValue(match.search),locationObj.$$hash=decodeURIComponent(match.hash),
// make sure path starts with '/';
locationObj.$$path&&"/"!==locationObj.$$path.charAt(0)&&(locationObj.$$path="/"+locationObj.$$path)}function startsWith(str,search){return str.slice(0,search.length)===search}/**
 *
 * @param {string} base
 * @param {string} url
 * @returns {string} returns text from `url` after `base` or `undefined` if it does not begin with
 *                   the expected string.
 */
function stripBaseUrl(base,url){if(startsWith(url,base))return url.substr(base.length)}function stripHash(url){var index=url.indexOf("#");return index===-1?url:url.substr(0,index)}function trimEmptyHash(url){return url.replace(/(#.+)|#$/,"$1")}function stripFile(url){return url.substr(0,stripHash(url).lastIndexOf("/")+1)}/* return the server only (scheme://host:port) */
function serverBase(url){return url.substring(0,url.indexOf("/",url.indexOf("//")+2))}/**
 * LocationHtml5Url represents a URL
 * This object is exposed as $location service when HTML5 mode is enabled and supported
 *
 * @constructor
 * @param {string} appBase application base URL
 * @param {string} appBaseNoFile application base URL stripped of any filename
 * @param {string} basePrefix URL path prefix
 */
function LocationHtml5Url(appBase,appBaseNoFile,basePrefix){this.$$html5=!0,basePrefix=basePrefix||"",parseAbsoluteUrl(appBase,this),/**
   * Parse given HTML5 (regular) URL string into properties
   * @param {string} url HTML5 URL
   * @private
   */
this.$$parse=function(url){var pathUrl=stripBaseUrl(appBaseNoFile,url);if(!isString(pathUrl))throw $locationMinErr("ipthprfx",'Invalid url "{0}", missing path prefix "{1}".',url,appBaseNoFile);parseAppUrl(pathUrl,this),this.$$path||(this.$$path="/"),this.$$compose()},/**
   * Compose url and update `absUrl` property
   * @private
   */
this.$$compose=function(){var search=toKeyValue(this.$$search),hash=this.$$hash?"#"+encodeUriSegment(this.$$hash):"";this.$$url=encodePath(this.$$path)+(search?"?"+search:"")+hash,this.$$absUrl=appBaseNoFile+this.$$url.substr(1),// first char is always '/'
this.$$urlUpdatedByLocation=!0},this.$$parseLinkUrl=function(url,relHref){if(relHref&&"#"===relHref[0])
// special case for links to hash fragments:
// keep the old url and only replace the hash fragment
return this.hash(relHref.slice(1)),!0;var appUrl,prevAppUrl,rewrittenUrl;return isDefined(appUrl=stripBaseUrl(appBase,url))?(prevAppUrl=appUrl,rewrittenUrl=basePrefix&&isDefined(appUrl=stripBaseUrl(basePrefix,appUrl))?appBaseNoFile+(stripBaseUrl("/",appUrl)||appUrl):appBase+prevAppUrl):isDefined(appUrl=stripBaseUrl(appBaseNoFile,url))?rewrittenUrl=appBaseNoFile+appUrl:appBaseNoFile===url+"/"&&(rewrittenUrl=appBaseNoFile),rewrittenUrl&&this.$$parse(rewrittenUrl),!!rewrittenUrl}}/**
 * LocationHashbangUrl represents URL
 * This object is exposed as $location service when developer doesn't opt into html5 mode.
 * It also serves as the base class for html5 mode fallback on legacy browsers.
 *
 * @constructor
 * @param {string} appBase application base URL
 * @param {string} appBaseNoFile application base URL stripped of any filename
 * @param {string} hashPrefix hashbang prefix
 */
function LocationHashbangUrl(appBase,appBaseNoFile,hashPrefix){parseAbsoluteUrl(appBase,this),/**
   * Parse given hashbang URL into properties
   * @param {string} url Hashbang URL
   * @private
   */
this.$$parse=function(url){/*
     * In Windows, on an anchor node on documents loaded from
     * the filesystem, the browser will return a pathname
     * prefixed with the drive name ('/C:/path') when a
     * pathname without a drive is set:
     *  * a.setAttribute('href', '/foo')
     *   * a.pathname === '/C:/foo' //true
     *
     * Inside of Angular, we're always using pathnames that
     * do not include drive names for routing.
     */
function removeWindowsDriveName(path,url,base){/*
      Matches paths for file protocol on windows,
      such as /C:/foo/bar, and captures only /foo/bar.
      */
var firstPathSegmentMatch,windowsFilePathExp=/^\/[A-Z]:(\/.*)/;
// The input URL intentionally contains a first path segment that ends with a colon.
//Get the relative path from the input URL.
// The input URL intentionally contains a first path segment that ends with a colon.
return startsWith(url,base)&&(url=url.replace(base,"")),windowsFilePathExp.exec(url)?path:(firstPathSegmentMatch=windowsFilePathExp.exec(path),firstPathSegmentMatch?firstPathSegmentMatch[1]:path)}var withoutHashUrl,withoutBaseUrl=stripBaseUrl(appBase,url)||stripBaseUrl(appBaseNoFile,url);isUndefined(withoutBaseUrl)||"#"!==withoutBaseUrl.charAt(0)?
// There was no hashbang path nor hash fragment:
// If we are in HTML5 mode we use what is left as the path;
// Otherwise we ignore what is left
this.$$html5?withoutHashUrl=withoutBaseUrl:(withoutHashUrl="",isUndefined(withoutBaseUrl)&&(appBase=url,/** @type {?} */
this.replace())):(
// The rest of the URL starts with a hash so we have
// got either a hashbang path or a plain hash fragment
withoutHashUrl=stripBaseUrl(hashPrefix,withoutBaseUrl),isUndefined(withoutHashUrl)&&(
// There was no hashbang prefix so we just have a hash fragment
withoutHashUrl=withoutBaseUrl)),parseAppUrl(withoutHashUrl,this),this.$$path=removeWindowsDriveName(this.$$path,withoutHashUrl,appBase),this.$$compose()},/**
   * Compose hashbang URL and update `absUrl` property
   * @private
   */
this.$$compose=function(){var search=toKeyValue(this.$$search),hash=this.$$hash?"#"+encodeUriSegment(this.$$hash):"";this.$$url=encodePath(this.$$path)+(search?"?"+search:"")+hash,this.$$absUrl=appBase+(this.$$url?hashPrefix+this.$$url:""),this.$$urlUpdatedByLocation=!0},this.$$parseLinkUrl=function(url,relHref){return stripHash(appBase)===stripHash(url)&&(this.$$parse(url),!0)}}/**
 * LocationHashbangUrl represents URL
 * This object is exposed as $location service when html5 history api is enabled but the browser
 * does not support it.
 *
 * @constructor
 * @param {string} appBase application base URL
 * @param {string} appBaseNoFile application base URL stripped of any filename
 * @param {string} hashPrefix hashbang prefix
 */
function LocationHashbangInHtml5Url(appBase,appBaseNoFile,hashPrefix){this.$$html5=!0,LocationHashbangUrl.apply(this,arguments),this.$$parseLinkUrl=function(url,relHref){if(relHref&&"#"===relHref[0])
// special case for links to hash fragments:
// keep the old url and only replace the hash fragment
return this.hash(relHref.slice(1)),!0;var rewrittenUrl,appUrl;return appBase===stripHash(url)?rewrittenUrl=url:(appUrl=stripBaseUrl(appBaseNoFile,url))?rewrittenUrl=appBase+hashPrefix+appUrl:appBaseNoFile===url+"/"&&(rewrittenUrl=appBaseNoFile),rewrittenUrl&&this.$$parse(rewrittenUrl),!!rewrittenUrl},this.$$compose=function(){var search=toKeyValue(this.$$search),hash=this.$$hash?"#"+encodeUriSegment(this.$$hash):"";this.$$url=encodePath(this.$$path)+(search?"?"+search:"")+hash,
// include hashPrefix in $$absUrl when $$url is empty so IE9 does not reload page because of removal of '#'
this.$$absUrl=appBase+hashPrefix+this.$$url,this.$$urlUpdatedByLocation=!0}}function locationGetter(property){/** @this */
return function(){return this[property]}}function locationGetterSetter(property,preprocess){/** @this */
return function(value){return isUndefined(value)?this[property]:(this[property]=preprocess(value),this.$$compose(),this)}}/**
 * @ngdoc service
 * @name $location
 *
 * @requires $rootElement
 *
 * @description
 * The $location service parses the URL in the browser address bar (based on the
 * [window.location](https://developer.mozilla.org/en/window.location)) and makes the URL
 * available to your application. Changes to the URL in the address bar are reflected into
 * $location service and changes to $location are reflected into the browser address bar.
 *
 * **The $location service:**
 *
 * - Exposes the current URL in the browser address bar, so you can
 *   - Watch and observe the URL.
 *   - Change the URL.
 * - Synchronizes the URL with the browser when the user
 *   - Changes the address bar.
 *   - Clicks the back or forward button (or clicks a History link).
 *   - Clicks on a link.
 * - Represents the URL object as a set of methods (protocol, host, port, path, search, hash).
 *
 * For more information see {@link guide/$location Developer Guide: Using $location}
 */
/**
 * @ngdoc provider
 * @name $locationProvider
 * @this
 *
 * @description
 * Use the `$locationProvider` to configure how the application deep linking paths are stored.
 */
function $LocationProvider(){var hashPrefix="!",html5Mode={enabled:!1,requireBase:!0,rewriteLinks:!0};/**
   * @ngdoc method
   * @name $locationProvider#hashPrefix
   * @description
   * The default value for the prefix is `'!'`.
   * @param {string=} prefix Prefix for hash part (containing path and search)
   * @returns {*} current value if used as getter or itself (chaining) if used as setter
   */
this.hashPrefix=function(prefix){return isDefined(prefix)?(hashPrefix=prefix,this):hashPrefix},/**
   * @ngdoc method
   * @name $locationProvider#html5Mode
   * @description
   * @param {(boolean|Object)=} mode If boolean, sets `html5Mode.enabled` to value.
   *   If object, sets `enabled`, `requireBase` and `rewriteLinks` to respective values. Supported
   *   properties:
   *   - **enabled** – `{boolean}` – (default: false) If true, will rely on `history.pushState` to
   *     change urls where supported. Will fall back to hash-prefixed paths in browsers that do not
   *     support `pushState`.
   *   - **requireBase** - `{boolean}` - (default: `true`) When html5Mode is enabled, specifies
   *     whether or not a <base> tag is required to be present. If `enabled` and `requireBase` are
   *     true, and a base tag is not present, an error will be thrown when `$location` is injected.
   *     See the {@link guide/$location $location guide for more information}
   *   - **rewriteLinks** - `{boolean|string}` - (default: `true`) When html5Mode is enabled,
   *     enables/disables URL rewriting for relative links. If set to a string, URL rewriting will
   *     only happen on links with an attribute that matches the given string. For example, if set
   *     to `'internal-link'`, then the URL will only be rewritten for `<a internal-link>` links.
   *     Note that [attribute name normalization](guide/directive#normalization) does not apply
   *     here, so `'internalLink'` will **not** match `'internal-link'`.
   *
   * @returns {Object} html5Mode object if used as getter or itself (chaining) if used as setter
   */
this.html5Mode=function(mode){return isBoolean(mode)?(html5Mode.enabled=mode,this):isObject(mode)?(isBoolean(mode.enabled)&&(html5Mode.enabled=mode.enabled),isBoolean(mode.requireBase)&&(html5Mode.requireBase=mode.requireBase),(isBoolean(mode.rewriteLinks)||isString(mode.rewriteLinks))&&(html5Mode.rewriteLinks=mode.rewriteLinks),this):html5Mode},/**
   * @ngdoc event
   * @name $location#$locationChangeStart
   * @eventType broadcast on root scope
   * @description
   * Broadcasted before a URL will change.
   *
   * This change can be prevented by calling
   * `preventDefault` method of the event. See {@link ng.$rootScope.Scope#$on} for more
   * details about event object. Upon successful change
   * {@link ng.$location#$locationChangeSuccess $locationChangeSuccess} is fired.
   *
   * The `newState` and `oldState` parameters may be defined only in HTML5 mode and when
   * the browser supports the HTML5 History API.
   *
   * @param {Object} angularEvent Synthetic event object.
   * @param {string} newUrl New URL
   * @param {string=} oldUrl URL that was before it was changed.
   * @param {string=} newState New history state object
   * @param {string=} oldState History state object that was before it was changed.
   */
/**
   * @ngdoc event
   * @name $location#$locationChangeSuccess
   * @eventType broadcast on root scope
   * @description
   * Broadcasted after a URL was changed.
   *
   * The `newState` and `oldState` parameters may be defined only in HTML5 mode and when
   * the browser supports the HTML5 History API.
   *
   * @param {Object} angularEvent Synthetic event object.
   * @param {string} newUrl New URL
   * @param {string=} oldUrl URL that was before it was changed.
   * @param {string=} newState New history state object
   * @param {string=} oldState History state object that was before it was changed.
   */
this.$get=["$rootScope","$browser","$sniffer","$rootElement","$window",function($rootScope,$browser,$sniffer,$rootElement,$window){function setBrowserUrlWithFallback(url,replace,state){var oldUrl=$location.url(),oldState=$location.$$state;try{$browser.url(url,replace,state),
// Make sure $location.state() returns referentially identical (not just deeply equal)
// state object; this makes possible quick checking if the state changed in the digest
// loop. Checking deep equality would be too expensive.
$location.$$state=$browser.state()}catch(e){
// Restore old values if pushState fails
throw $location.url(oldUrl),$location.$$state=oldState,e}}function afterLocationChange(oldUrl,oldState){$rootScope.$broadcast("$locationChangeSuccess",$location.absUrl(),oldUrl,$location.$$state,oldState)}var $location,LocationMode,appBase,baseHref=$browser.baseHref(),// if base[href] is undefined, it defaults to ''
initialUrl=$browser.url();if(html5Mode.enabled){if(!baseHref&&html5Mode.requireBase)throw $locationMinErr("nobase","$location in HTML5 mode requires a <base> tag to be present!");appBase=serverBase(initialUrl)+(baseHref||"/"),LocationMode=$sniffer.history?LocationHtml5Url:LocationHashbangInHtml5Url}else appBase=stripHash(initialUrl),LocationMode=LocationHashbangUrl;var appBaseNoFile=stripFile(appBase);$location=new LocationMode(appBase,appBaseNoFile,"#"+hashPrefix),$location.$$parseLinkUrl(initialUrl,initialUrl),$location.$$state=$browser.state();var IGNORE_URI_REGEXP=/^\s*(javascript|mailto):/i;$rootElement.on("click",function(event){var rewriteLinks=html5Mode.rewriteLinks;
// TODO(vojta): rewrite link when opening in new tab/window (in legacy browser)
// currently we open nice url link and redirect then
if(rewriteLinks&&!event.ctrlKey&&!event.metaKey&&!event.shiftKey&&2!==event.which&&2!==event.button){
// traverse the DOM up to find first A tag
for(var elm=jqLite(event.target);"a"!==nodeName_(elm[0]);)
// ignore rewriting if no A tag (reached root element, or no parent - removed from document)
if(elm[0]===$rootElement[0]||!(elm=elm.parent())[0])return;if(!isString(rewriteLinks)||!isUndefined(elm.attr(rewriteLinks))){var absHref=elm.prop("href"),relHref=elm.attr("href")||elm.attr("xlink:href");isObject(absHref)&&"[object SVGAnimatedString]"===absHref.toString()&&(
// SVGAnimatedString.animVal should be identical to SVGAnimatedString.baseVal, unless during
// an animation.
absHref=urlResolve(absHref.animVal).href),
// Ignore when url is started with javascript: or mailto:
IGNORE_URI_REGEXP.test(absHref)||!absHref||elm.attr("target")||event.isDefaultPrevented()||$location.$$parseLinkUrl(absHref,relHref)&&(
// We do a preventDefault for all urls that are part of the angular application,
// in html5mode and also without, so that we are able to abort navigation without
// getting double entries in the location history.
event.preventDefault(),
// update location manually
$location.absUrl()!==$browser.url()&&($rootScope.$apply(),
// hack to work around FF6 bug 684208 when scenario runner clicks on links
$window.angular["ff-684208-preventDefault"]=!0))}}}),
// rewrite hashbang url <> html5 url
trimEmptyHash($location.absUrl())!==trimEmptyHash(initialUrl)&&$browser.url($location.absUrl(),!0);var initializing=!0;
// update $location when $browser url changes
// update browser
return $browser.onUrlChange(function(newUrl,newState){
// If we are navigating outside of the app then force a reload
return startsWith(newUrl,appBaseNoFile)?($rootScope.$evalAsync(function(){var defaultPrevented,oldUrl=$location.absUrl(),oldState=$location.$$state;newUrl=trimEmptyHash(newUrl),$location.$$parse(newUrl),$location.$$state=newState,defaultPrevented=$rootScope.$broadcast("$locationChangeStart",newUrl,oldUrl,newState,oldState).defaultPrevented,
// if the location was changed by a `$locationChangeStart` handler then stop
// processing this location change
$location.absUrl()===newUrl&&(defaultPrevented?($location.$$parse(oldUrl),$location.$$state=oldState,setBrowserUrlWithFallback(oldUrl,!1,oldState)):(initializing=!1,afterLocationChange(oldUrl,oldState)))}),void($rootScope.$$phase||$rootScope.$digest())):void($window.location.href=newUrl)}),$rootScope.$watch(function(){if(initializing||$location.$$urlUpdatedByLocation){$location.$$urlUpdatedByLocation=!1;var oldUrl=trimEmptyHash($browser.url()),newUrl=trimEmptyHash($location.absUrl()),oldState=$browser.state(),currentReplace=$location.$$replace,urlOrStateChanged=oldUrl!==newUrl||$location.$$html5&&$sniffer.history&&oldState!==$location.$$state;(initializing||urlOrStateChanged)&&(initializing=!1,$rootScope.$evalAsync(function(){var newUrl=$location.absUrl(),defaultPrevented=$rootScope.$broadcast("$locationChangeStart",newUrl,oldUrl,$location.$$state,oldState).defaultPrevented;
// if the location was changed by a `$locationChangeStart` handler then stop
// processing this location change
$location.absUrl()===newUrl&&(defaultPrevented?($location.$$parse(oldUrl),$location.$$state=oldState):(urlOrStateChanged&&setBrowserUrlWithFallback(newUrl,currentReplace,oldState===$location.$$state?null:$location.$$state),afterLocationChange(oldUrl,oldState)))}))}$location.$$replace=!1}),$location}]}/**
 * @ngdoc service
 * @name $log
 * @requires $window
 *
 * @description
 * Simple service for logging. Default implementation safely writes the message
 * into the browser's console (if present).
 *
 * The main purpose of this service is to simplify debugging and troubleshooting.
 *
 * The default is to log `debug` messages. You can use
 * {@link ng.$logProvider ng.$logProvider#debugEnabled} to change this.
 *
 * @example
   <example module="logExample" name="log-service">
     <file name="script.js">
       angular.module('logExample', [])
         .controller('LogController', ['$scope', '$log', function($scope, $log) {
           $scope.$log = $log;
           $scope.message = 'Hello World!';
         }]);
     </file>
     <file name="index.html">
       <div ng-controller="LogController">
         <p>Reload this page with open console, enter text and hit the log button...</p>
         <label>Message:
         <input type="text" ng-model="message" /></label>
         <button ng-click="$log.log(message)">log</button>
         <button ng-click="$log.warn(message)">warn</button>
         <button ng-click="$log.info(message)">info</button>
         <button ng-click="$log.error(message)">error</button>
         <button ng-click="$log.debug(message)">debug</button>
       </div>
     </file>
   </example>
 */
/**
 * @ngdoc provider
 * @name $logProvider
 * @this
 *
 * @description
 * Use the `$logProvider` to configure how the application logs messages
 */
function $LogProvider(){var debug=!0,self=this;/**
   * @ngdoc method
   * @name $logProvider#debugEnabled
   * @description
   * @param {boolean=} flag enable or disable debug level messages
   * @returns {*} current value if used as getter or itself (chaining) if used as setter
   */
this.debugEnabled=function(flag){return isDefined(flag)?(debug=flag,this):debug},this.$get=["$window",function($window){function formatError(arg){return arg instanceof Error&&(arg.stack&&formatStackTrace?arg=arg.message&&arg.stack.indexOf(arg.message)===-1?"Error: "+arg.message+"\n"+arg.stack:arg.stack:arg.sourceURL&&(arg=arg.message+"\n"+arg.sourceURL+":"+arg.line)),arg}function consoleLog(type){var console=$window.console||{},logFn=console[type]||console.log||noop,hasApply=!1;
// Note: reading logFn.apply throws an error in IE11 in IE8 document mode.
// The reason behind this is that console.log has type "object" in IE8...
try{hasApply=!!logFn.apply}catch(e){}return hasApply?function(){var args=[];return forEach(arguments,function(arg){args.push(formatError(arg))}),logFn.apply(console,args)}:function(arg1,arg2){logFn(arg1,null==arg2?"":arg2)}}
// Support: IE 9-11, Edge 12-14+
// IE/Edge display errors in such a way that it requires the user to click in 4 places
// to see the stack trace. There is no way to feature-detect it so there's a chance
// of the user agent sniffing to go wrong but since it's only about logging, this shouldn't
// break apps. Other browsers display errors in a sensible way and some of them map stack
// traces along source maps if available so it makes sense to let browsers display it
// as they want.
var formatStackTrace=msie||/\bEdge\//.test($window.navigator&&$window.navigator.userAgent);return{/**
       * @ngdoc method
       * @name $log#log
       *
       * @description
       * Write a log message
       */
log:consoleLog("log"),/**
       * @ngdoc method
       * @name $log#info
       *
       * @description
       * Write an information message
       */
info:consoleLog("info"),/**
       * @ngdoc method
       * @name $log#warn
       *
       * @description
       * Write a warning message
       */
warn:consoleLog("warn"),/**
       * @ngdoc method
       * @name $log#error
       *
       * @description
       * Write an error message
       */
error:consoleLog("error"),/**
       * @ngdoc method
       * @name $log#debug
       *
       * @description
       * Write a debug message
       */
debug:function(){var fn=consoleLog("debug");return function(){debug&&fn.apply(self,arguments)}}()}}]}
// Sandboxing Angular Expressions
// ------------------------------
// Angular expressions are no longer sandboxed. So it is now even easier to access arbitrary JS code by
// various means such as obtaining a reference to native JS functions like the Function constructor.
//
// As an example, consider the following Angular expression:
//
//   {}.toString.constructor('alert("evil JS code")')
//
// It is important to realize that if you create an expression from a string that contains user provided
// content then it is possible that your application contains a security vulnerability to an XSS style attack.
//
// See https://docs.angularjs.org/guide/security
function getStringValue(name){
// Property names must be strings. This means that non-string objects cannot be used
// as keys in an object. Any non-string object, including a number, is typecasted
// into a string via the toString method.
// -- MDN, https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Operators/Property_accessors#Property_names
//
// So, to ensure that we are checking the same `name` that JavaScript would use, we cast it
// to a string. It's not always possible. If `name` is an object and its `toString` method is
// 'broken' (doesn't return a string, isn't a function, etc.), an error will be thrown:
//
// TypeError: Cannot convert object to primitive value
//
// For performance reasons, we don't catch this error here and allow it to propagate up the call
// stack. Note that you'll get the same error in JavaScript if you try to access a property using
// such a 'broken' object as a key.
return name+""}function ifDefined(v,d){return"undefined"!=typeof v?v:d}function plusFn(l,r){return"undefined"==typeof l?r:"undefined"==typeof r?l:l+r}function isStateless($filter,filterName){var fn=$filter(filterName);return!fn.$stateful}function findConstantAndWatchExpressions(ast,$filter){var allConstants,argsToWatch,isStatelessFilter;switch(ast.type){case AST.Program:allConstants=!0,forEach(ast.body,function(expr){findConstantAndWatchExpressions(expr.expression,$filter),allConstants=allConstants&&expr.expression.constant}),ast.constant=allConstants;break;case AST.Literal:ast.constant=!0,ast.toWatch=[];break;case AST.UnaryExpression:findConstantAndWatchExpressions(ast.argument,$filter),ast.constant=ast.argument.constant,ast.toWatch=ast.argument.toWatch;break;case AST.BinaryExpression:findConstantAndWatchExpressions(ast.left,$filter),findConstantAndWatchExpressions(ast.right,$filter),ast.constant=ast.left.constant&&ast.right.constant,ast.toWatch=ast.left.toWatch.concat(ast.right.toWatch);break;case AST.LogicalExpression:findConstantAndWatchExpressions(ast.left,$filter),findConstantAndWatchExpressions(ast.right,$filter),ast.constant=ast.left.constant&&ast.right.constant,ast.toWatch=ast.constant?[]:[ast];break;case AST.ConditionalExpression:findConstantAndWatchExpressions(ast.test,$filter),findConstantAndWatchExpressions(ast.alternate,$filter),findConstantAndWatchExpressions(ast.consequent,$filter),ast.constant=ast.test.constant&&ast.alternate.constant&&ast.consequent.constant,ast.toWatch=ast.constant?[]:[ast];break;case AST.Identifier:ast.constant=!1,ast.toWatch=[ast];break;case AST.MemberExpression:findConstantAndWatchExpressions(ast.object,$filter),ast.computed&&findConstantAndWatchExpressions(ast.property,$filter),ast.constant=ast.object.constant&&(!ast.computed||ast.property.constant),ast.toWatch=[ast];break;case AST.CallExpression:isStatelessFilter=!!ast.filter&&isStateless($filter,ast.callee.name),allConstants=isStatelessFilter,argsToWatch=[],forEach(ast.arguments,function(expr){findConstantAndWatchExpressions(expr,$filter),allConstants=allConstants&&expr.constant,expr.constant||argsToWatch.push.apply(argsToWatch,expr.toWatch)}),ast.constant=allConstants,ast.toWatch=isStatelessFilter?argsToWatch:[ast];break;case AST.AssignmentExpression:findConstantAndWatchExpressions(ast.left,$filter),findConstantAndWatchExpressions(ast.right,$filter),ast.constant=ast.left.constant&&ast.right.constant,ast.toWatch=[ast];break;case AST.ArrayExpression:allConstants=!0,argsToWatch=[],forEach(ast.elements,function(expr){findConstantAndWatchExpressions(expr,$filter),allConstants=allConstants&&expr.constant,expr.constant||argsToWatch.push.apply(argsToWatch,expr.toWatch)}),ast.constant=allConstants,ast.toWatch=argsToWatch;break;case AST.ObjectExpression:allConstants=!0,argsToWatch=[],forEach(ast.properties,function(property){findConstantAndWatchExpressions(property.value,$filter),allConstants=allConstants&&property.value.constant&&!property.computed,property.value.constant||argsToWatch.push.apply(argsToWatch,property.value.toWatch),property.computed&&(findConstantAndWatchExpressions(property.key,$filter),property.key.constant||argsToWatch.push.apply(argsToWatch,property.key.toWatch))}),ast.constant=allConstants,ast.toWatch=argsToWatch;break;case AST.ThisExpression:ast.constant=!1,ast.toWatch=[];break;case AST.LocalsExpression:ast.constant=!1,ast.toWatch=[]}}function getInputs(body){if(1===body.length){var lastExpression=body[0].expression,candidate=lastExpression.toWatch;return 1!==candidate.length?candidate:candidate[0]!==lastExpression?candidate:void 0}}function isAssignable(ast){return ast.type===AST.Identifier||ast.type===AST.MemberExpression}function assignableAST(ast){if(1===ast.body.length&&isAssignable(ast.body[0].expression))return{type:AST.AssignmentExpression,left:ast.body[0].expression,right:{type:AST.NGValueParameter},operator:"="}}function isLiteral(ast){return 0===ast.body.length||1===ast.body.length&&(ast.body[0].expression.type===AST.Literal||ast.body[0].expression.type===AST.ArrayExpression||ast.body[0].expression.type===AST.ObjectExpression)}function isConstant(ast){return ast.constant}function ASTCompiler($filter){this.$filter=$filter}function ASTInterpreter($filter){this.$filter=$filter}/**
 * @constructor
 */
function Parser(lexer,$filter,options){this.ast=new AST(lexer,options),this.astCompiler=options.csp?new ASTInterpreter($filter):new ASTCompiler($filter)}function getValueOf(value){return isFunction(value.valueOf)?value.valueOf():objectValueOf.call(value)}
///////////////////////////////////
/**
 * @ngdoc service
 * @name $parse
 * @kind function
 *
 * @description
 *
 * Converts Angular {@link guide/expression expression} into a function.
 *
 * ```js
 *   var getter = $parse('user.name');
 *   var setter = getter.assign;
 *   var context = {user:{name:'angular'}};
 *   var locals = {user:{name:'local'}};
 *
 *   expect(getter(context)).toEqual('angular');
 *   setter(context, 'newValue');
 *   expect(context.user.name).toEqual('newValue');
 *   expect(getter(context, locals)).toEqual('local');
 * ```
 *
 *
 * @param {string} expression String expression to compile.
 * @returns {function(context, locals)} a function which represents the compiled expression:
 *
 *    * `context` – `{object}` – an object against which any expressions embedded in the strings
 *      are evaluated against (typically a scope object).
 *    * `locals` – `{object=}` – local variables context object, useful for overriding values in
 *      `context`.
 *
 *    The returned function also has the following properties:
 *      * `literal` – `{boolean}` – whether the expression's top-level node is a JavaScript
 *        literal.
 *      * `constant` – `{boolean}` – whether the expression is made entirely of JavaScript
 *        constant literals.
 *      * `assign` – `{?function(context, value)}` – if the expression is assignable, this will be
 *        set to a function to change its value on the given context.
 *
 */
/**
 * @ngdoc provider
 * @name $parseProvider
 * @this
 *
 * @description
 * `$parseProvider` can be used for configuring the default behavior of the {@link ng.$parse $parse}
 *  service.
 */
function $ParseProvider(){var identStart,identContinue,cache=createMap(),literals={"true":!0,"false":!1,"null":null,undefined:void 0};/**
   * @ngdoc method
   * @name $parseProvider#addLiteral
   * @description
   *
   * Configure $parse service to add literal values that will be present as literal at expressions.
   *
   * @param {string} literalName Token for the literal value. The literal name value must be a valid literal name.
   * @param {*} literalValue Value for this literal. All literal values must be primitives or `undefined`.
   *
   **/
this.addLiteral=function(literalName,literalValue){literals[literalName]=literalValue},/**
  * @ngdoc method
  * @name $parseProvider#setIdentifierFns
  *
  * @description
  *
  * Allows defining the set of characters that are allowed in Angular expressions. The function
  * `identifierStart` will get called to know if a given character is a valid character to be the
  * first character for an identifier. The function `identifierContinue` will get called to know if
  * a given character is a valid character to be a follow-up identifier character. The functions
  * `identifierStart` and `identifierContinue` will receive as arguments the single character to be
  * identifier and the character code point. These arguments will be `string` and `numeric`. Keep in
  * mind that the `string` parameter can be two characters long depending on the character
  * representation. It is expected for the function to return `true` or `false`, whether that
  * character is allowed or not.
  *
  * Since this function will be called extensively, keep the implementation of these functions fast,
  * as the performance of these functions have a direct impact on the expressions parsing speed.
  *
  * @param {function=} identifierStart The function that will decide whether the given character is
  *   a valid identifier start character.
  * @param {function=} identifierContinue The function that will decide whether the given character is
  *   a valid identifier continue character.
  */
this.setIdentifierFns=function(identifierStart,identifierContinue){return identStart=identifierStart,identContinue=identifierContinue,this},this.$get=["$filter",function($filter){function $parse(exp,interceptorFn){var parsedExpression,oneTime,cacheKey;switch(typeof exp){case"string":if(exp=exp.trim(),cacheKey=exp,parsedExpression=cache[cacheKey],!parsedExpression){":"===exp.charAt(0)&&":"===exp.charAt(1)&&(oneTime=!0,exp=exp.substring(2));var lexer=new Lexer($parseOptions),parser=new Parser(lexer,$filter,$parseOptions);parsedExpression=parser.parse(exp),parsedExpression.constant?parsedExpression.$$watchDelegate=constantWatchDelegate:oneTime?(parsedExpression.oneTime=!0,parsedExpression.$$watchDelegate=oneTimeWatchDelegate):parsedExpression.inputs&&(parsedExpression.$$watchDelegate=inputsWatchDelegate),cache[cacheKey]=parsedExpression}return addInterceptor(parsedExpression,interceptorFn);case"function":return addInterceptor(exp,interceptorFn);default:return addInterceptor(noop,interceptorFn)}}function expressionInputDirtyCheck(newValue,oldValueOfValue,compareObjectIdentity){
// attempt to convert the value to a primitive type
// TODO(docs): add a note to docs that by implementing valueOf even objects and arrays can
//             be cheaply dirty-checked
return null==newValue||null==oldValueOfValue?newValue===oldValueOfValue:!("object"==typeof newValue&&(newValue=getValueOf(newValue),"object"==typeof newValue&&!compareObjectIdentity))&&(newValue===oldValueOfValue||newValue!==newValue&&oldValueOfValue!==oldValueOfValue)}function inputsWatchDelegate(scope,listener,objectEquality,parsedExpression,prettyPrintExpression){var lastResult,inputExpressions=parsedExpression.inputs;if(1===inputExpressions.length){var oldInputValueOf=expressionInputDirtyCheck;// init to something unique so that equals check fails
return inputExpressions=inputExpressions[0],scope.$watch(function(scope){var newInputValue=inputExpressions(scope);return expressionInputDirtyCheck(newInputValue,oldInputValueOf,parsedExpression.literal)||(lastResult=parsedExpression(scope,void 0,void 0,[newInputValue]),oldInputValueOf=newInputValue&&getValueOf(newInputValue)),lastResult},listener,objectEquality,prettyPrintExpression)}for(var oldInputValueOfValues=[],oldInputValues=[],i=0,ii=inputExpressions.length;i<ii;i++)oldInputValueOfValues[i]=expressionInputDirtyCheck,// init to something unique so that equals check fails
oldInputValues[i]=null;return scope.$watch(function(scope){for(var changed=!1,i=0,ii=inputExpressions.length;i<ii;i++){var newInputValue=inputExpressions[i](scope);(changed||(changed=!expressionInputDirtyCheck(newInputValue,oldInputValueOfValues[i],parsedExpression.literal)))&&(oldInputValues[i]=newInputValue,oldInputValueOfValues[i]=newInputValue&&getValueOf(newInputValue))}return changed&&(lastResult=parsedExpression(scope,void 0,void 0,oldInputValues)),lastResult},listener,objectEquality,prettyPrintExpression)}function oneTimeWatchDelegate(scope,listener,objectEquality,parsedExpression,prettyPrintExpression){function oneTimeWatch(scope){return parsedExpression(scope)}function oneTimeListener(value,old,scope){lastValue=value,isFunction(listener)&&listener(value,old,scope),isDone(value)&&scope.$$postDigest(function(){isDone(lastValue)&&unwatch()})}var unwatch,lastValue,isDone=parsedExpression.literal?isAllDefined:isDefined;return unwatch=parsedExpression.inputs?inputsWatchDelegate(scope,oneTimeListener,objectEquality,parsedExpression,prettyPrintExpression):scope.$watch(oneTimeWatch,oneTimeListener,objectEquality)}function isAllDefined(value){var allDefined=!0;return forEach(value,function(val){isDefined(val)||(allDefined=!1)}),allDefined}function constantWatchDelegate(scope,listener,objectEquality,parsedExpression){var unwatch=scope.$watch(function(scope){return unwatch(),parsedExpression(scope)},listener,objectEquality);return unwatch}function addInterceptor(parsedExpression,interceptorFn){function regularInterceptedExpression(scope,locals,assign,inputs){var value=useInputs&&inputs?inputs[0]:parsedExpression(scope,locals,assign,inputs);return interceptorFn(value,scope,locals)}function oneTimeInterceptedExpression(scope,locals,assign,inputs){var value=useInputs&&inputs?inputs[0]:parsedExpression(scope,locals,assign,inputs),result=interceptorFn(value,scope,locals);
// we only return the interceptor's result if the
// initial value is defined (for bind-once)
return isDone(value)?result:value}if(!interceptorFn)return parsedExpression;var watchDelegate=parsedExpression.$$watchDelegate,useInputs=!1,isDone=parsedExpression.literal?isAllDefined:isDefined,fn=parsedExpression.oneTime?oneTimeInterceptedExpression:regularInterceptedExpression;
// Propogate the literal/oneTime attributes
// Propagate or create inputs / $$watchDelegates
// If there is an interceptor, but no watchDelegate then treat the interceptor like
// we treat filters - it is assumed to be a pure function unless flagged with $stateful
return fn.literal=parsedExpression.literal,fn.oneTime=parsedExpression.oneTime,useInputs=!parsedExpression.inputs,watchDelegate&&watchDelegate!==inputsWatchDelegate?(fn.$$watchDelegate=watchDelegate,fn.inputs=parsedExpression.inputs):interceptorFn.$stateful||(fn.$$watchDelegate=inputsWatchDelegate,fn.inputs=parsedExpression.inputs?parsedExpression.inputs:[parsedExpression]),fn}var noUnsafeEval=csp().noUnsafeEval,$parseOptions={csp:noUnsafeEval,literals:copy(literals),isIdentifierStart:isFunction(identStart)&&identStart,isIdentifierContinue:isFunction(identContinue)&&identContinue};return $parse}]}/**
 * @ngdoc service
 * @name $q
 * @requires $rootScope
 *
 * @description
 * A service that helps you run functions asynchronously, and use their return values (or exceptions)
 * when they are done processing.
 *
 * This is a [Promises/A+](https://promisesaplus.com/)-compliant implementation of promises/deferred
 * objects inspired by [Kris Kowal's Q](https://github.com/kriskowal/q).
 *
 * $q can be used in two fashions --- one which is more similar to Kris Kowal's Q or jQuery's Deferred
 * implementations, and the other which resembles ES6 (ES2015) promises to some degree.
 *
 * # $q constructor
 *
 * The streamlined ES6 style promise is essentially just using $q as a constructor which takes a `resolver`
 * function as the first argument. This is similar to the native Promise implementation from ES6,
 * see [MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise).
 *
 * While the constructor-style use is supported, not all of the supporting methods from ES6 promises are
 * available yet.
 *
 * It can be used like so:
 *
 * ```js
 *   // for the purpose of this example let's assume that variables `$q` and `okToGreet`
 *   // are available in the current lexical scope (they could have been injected or passed in).
 *
 *   function asyncGreet(name) {
 *     // perform some asynchronous operation, resolve or reject the promise when appropriate.
 *     return $q(function(resolve, reject) {
 *       setTimeout(function() {
 *         if (okToGreet(name)) {
 *           resolve('Hello, ' + name + '!');
 *         } else {
 *           reject('Greeting ' + name + ' is not allowed.');
 *         }
 *       }, 1000);
 *     });
 *   }
 *
 *   var promise = asyncGreet('Robin Hood');
 *   promise.then(function(greeting) {
 *     alert('Success: ' + greeting);
 *   }, function(reason) {
 *     alert('Failed: ' + reason);
 *   });
 * ```
 *
 * Note: progress/notify callbacks are not currently supported via the ES6-style interface.
 *
 * Note: unlike ES6 behavior, an exception thrown in the constructor function will NOT implicitly reject the promise.
 *
 * However, the more traditional CommonJS-style usage is still available, and documented below.
 *
 * [The CommonJS Promise proposal](http://wiki.commonjs.org/wiki/Promises) describes a promise as an
 * interface for interacting with an object that represents the result of an action that is
 * performed asynchronously, and may or may not be finished at any given point in time.
 *
 * From the perspective of dealing with error handling, deferred and promise APIs are to
 * asynchronous programming what `try`, `catch` and `throw` keywords are to synchronous programming.
 *
 * ```js
 *   // for the purpose of this example let's assume that variables `$q` and `okToGreet`
 *   // are available in the current lexical scope (they could have been injected or passed in).
 *
 *   function asyncGreet(name) {
 *     var deferred = $q.defer();
 *
 *     setTimeout(function() {
 *       deferred.notify('About to greet ' + name + '.');
 *
 *       if (okToGreet(name)) {
 *         deferred.resolve('Hello, ' + name + '!');
 *       } else {
 *         deferred.reject('Greeting ' + name + ' is not allowed.');
 *       }
 *     }, 1000);
 *
 *     return deferred.promise;
 *   }
 *
 *   var promise = asyncGreet('Robin Hood');
 *   promise.then(function(greeting) {
 *     alert('Success: ' + greeting);
 *   }, function(reason) {
 *     alert('Failed: ' + reason);
 *   }, function(update) {
 *     alert('Got notification: ' + update);
 *   });
 * ```
 *
 * At first it might not be obvious why this extra complexity is worth the trouble. The payoff
 * comes in the way of guarantees that promise and deferred APIs make, see
 * https://github.com/kriskowal/uncommonjs/blob/master/promises/specification.md.
 *
 * Additionally the promise api allows for composition that is very hard to do with the
 * traditional callback ([CPS](http://en.wikipedia.org/wiki/Continuation-passing_style)) approach.
 * For more on this please see the [Q documentation](https://github.com/kriskowal/q) especially the
 * section on serial or parallel joining of promises.
 *
 * # The Deferred API
 *
 * A new instance of deferred is constructed by calling `$q.defer()`.
 *
 * The purpose of the deferred object is to expose the associated Promise instance as well as APIs
 * that can be used for signaling the successful or unsuccessful completion, as well as the status
 * of the task.
 *
 * **Methods**
 *
 * - `resolve(value)` – resolves the derived promise with the `value`. If the value is a rejection
 *   constructed via `$q.reject`, the promise will be rejected instead.
 * - `reject(reason)` – rejects the derived promise with the `reason`. This is equivalent to
 *   resolving it with a rejection constructed via `$q.reject`.
 * - `notify(value)` - provides updates on the status of the promise's execution. This may be called
 *   multiple times before the promise is either resolved or rejected.
 *
 * **Properties**
 *
 * - promise – `{Promise}` – promise object associated with this deferred.
 *
 *
 * # The Promise API
 *
 * A new promise instance is created when a deferred instance is created and can be retrieved by
 * calling `deferred.promise`.
 *
 * The purpose of the promise object is to allow for interested parties to get access to the result
 * of the deferred task when it completes.
 *
 * **Methods**
 *
 * - `then(successCallback, [errorCallback], [notifyCallback])` – regardless of when the promise was or
 *   will be resolved or rejected, `then` calls one of the success or error callbacks asynchronously
 *   as soon as the result is available. The callbacks are called with a single argument: the result
 *   or rejection reason. Additionally, the notify callback may be called zero or more times to
 *   provide a progress indication, before the promise is resolved or rejected.
 *
 *   This method *returns a new promise* which is resolved or rejected via the return value of the
 *   `successCallback`, `errorCallback` (unless that value is a promise, in which case it is resolved
 *   with the value which is resolved in that promise using
 *   [promise chaining](http://www.html5rocks.com/en/tutorials/es6/promises/#toc-promises-queues)).
 *   It also notifies via the return value of the `notifyCallback` method. The promise cannot be
 *   resolved or rejected from the notifyCallback method. The errorCallback and notifyCallback
 *   arguments are optional.
 *
 * - `catch(errorCallback)` – shorthand for `promise.then(null, errorCallback)`
 *
 * - `finally(callback, notifyCallback)` – allows you to observe either the fulfillment or rejection of a promise,
 *   but to do so without modifying the final value. This is useful to release resources or do some
 *   clean-up that needs to be done whether the promise was rejected or resolved. See the [full
 *   specification](https://github.com/kriskowal/q/wiki/API-Reference#promisefinallycallback) for
 *   more information.
 *
 * # Chaining promises
 *
 * Because calling the `then` method of a promise returns a new derived promise, it is easily
 * possible to create a chain of promises:
 *
 * ```js
 *   promiseB = promiseA.then(function(result) {
 *     return result + 1;
 *   });
 *
 *   // promiseB will be resolved immediately after promiseA is resolved and its value
 *   // will be the result of promiseA incremented by 1
 * ```
 *
 * It is possible to create chains of any length and since a promise can be resolved with another
 * promise (which will defer its resolution further), it is possible to pause/defer resolution of
 * the promises at any point in the chain. This makes it possible to implement powerful APIs like
 * $http's response interceptors.
 *
 *
 * # Differences between Kris Kowal's Q and $q
 *
 *  There are two main differences:
 *
 * - $q is integrated with the {@link ng.$rootScope.Scope} Scope model observation
 *   mechanism in angular, which means faster propagation of resolution or rejection into your
 *   models and avoiding unnecessary browser repaints, which would result in flickering UI.
 * - Q has many more features than $q, but that comes at a cost of bytes. $q is tiny, but contains
 *   all the important functionality needed for common async tasks.
 *
 * # Testing
 *
 *  ```js
 *    it('should simulate promise', inject(function($q, $rootScope) {
 *      var deferred = $q.defer();
 *      var promise = deferred.promise;
 *      var resolvedValue;
 *
 *      promise.then(function(value) { resolvedValue = value; });
 *      expect(resolvedValue).toBeUndefined();
 *
 *      // Simulate resolving of promise
 *      deferred.resolve(123);
 *      // Note that the 'then' function does not get called synchronously.
 *      // This is because we want the promise API to always be async, whether or not
 *      // it got called synchronously or asynchronously.
 *      expect(resolvedValue).toBeUndefined();
 *
 *      // Propagate promise resolution to 'then' functions using $apply().
 *      $rootScope.$apply();
 *      expect(resolvedValue).toEqual(123);
 *    }));
 *  ```
 *
 * @param {function(function, function)} resolver Function which is responsible for resolving or
 *   rejecting the newly created promise. The first parameter is a function which resolves the
 *   promise, the second parameter is a function which rejects the promise.
 *
 * @returns {Promise} The newly created promise.
 */
/**
 * @ngdoc provider
 * @name $qProvider
 * @this
 *
 * @description
 */
function $QProvider(){var errorOnUnhandledRejections=!0;this.$get=["$rootScope","$exceptionHandler",function($rootScope,$exceptionHandler){return qFactory(function(callback){$rootScope.$evalAsync(callback)},$exceptionHandler,errorOnUnhandledRejections)}],/**
   * @ngdoc method
   * @name $qProvider#errorOnUnhandledRejections
   * @kind function
   *
   * @description
   * Retrieves or overrides whether to generate an error when a rejected promise is not handled.
   * This feature is enabled by default.
   *
   * @param {boolean=} value Whether to generate an error when a rejected promise is not handled.
   * @returns {boolean|ng.$qProvider} Current value when called without a new value or self for
   *    chaining otherwise.
   */
this.errorOnUnhandledRejections=function(value){return isDefined(value)?(errorOnUnhandledRejections=value,this):errorOnUnhandledRejections}}/** @this */
function $$QProvider(){var errorOnUnhandledRejections=!0;this.$get=["$browser","$exceptionHandler",function($browser,$exceptionHandler){return qFactory(function(callback){$browser.defer(callback)},$exceptionHandler,errorOnUnhandledRejections)}],this.errorOnUnhandledRejections=function(value){return isDefined(value)?(errorOnUnhandledRejections=value,this):errorOnUnhandledRejections}}/**
 * Constructs a promise manager.
 *
 * @param {function(function)} nextTick Function for executing functions in the next turn.
 * @param {function(...*)} exceptionHandler Function into which unexpected exceptions are passed for
 *     debugging purposes.
 @ param {=boolean} errorOnUnhandledRejections Whether an error should be generated on unhandled
 *     promises rejections.
 * @returns {object} Promise manager.
 */
function qFactory(nextTick,exceptionHandler,errorOnUnhandledRejections){/**
   * @ngdoc method
   * @name ng.$q#defer
   * @kind function
   *
   * @description
   * Creates a `Deferred` object which represents a task which will finish in the future.
   *
   * @returns {Deferred} Returns a new instance of deferred.
   */
function defer(){return new Deferred}function Deferred(){var promise=this.promise=new Promise;
//Non prototype methods necessary to support unbound execution :/
this.resolve=function(val){resolvePromise(promise,val)},this.reject=function(reason){rejectPromise(promise,reason)},this.notify=function(progress){notifyPromise(promise,progress)}}function Promise(){this.$$state={status:0}}function processQueue(state){var fn,promise,pending;pending=state.pending,state.processScheduled=!1,state.pending=void 0;try{for(var i=0,ii=pending.length;i<ii;++i){state.pur=!0,promise=pending[i][0],fn=pending[i][state.status];try{isFunction(fn)?resolvePromise(promise,fn(state.value)):1===state.status?resolvePromise(promise,state.value):rejectPromise(promise,state.value)}catch(e){rejectPromise(promise,e)}}}finally{--queueSize,errorOnUnhandledRejections&&0===queueSize&&nextTick(processChecks)}}function processChecks(){
// eslint-disable-next-line no-unmodified-loop-condition
for(;!queueSize&&checkQueue.length;){var toCheck=checkQueue.shift();if(!toCheck.pur){toCheck.pur=!0;var errorMessage="Possibly unhandled rejection: "+toDebugString(toCheck.value);toCheck.value instanceof Error?exceptionHandler(toCheck.value,errorMessage):exceptionHandler(errorMessage)}}}function scheduleProcessQueue(state){!errorOnUnhandledRejections||state.pending||2!==state.status||state.pur||(0===queueSize&&0===checkQueue.length&&nextTick(processChecks),checkQueue.push(state)),!state.processScheduled&&state.pending&&(state.processScheduled=!0,++queueSize,nextTick(function(){processQueue(state)}))}function resolvePromise(promise,val){promise.$$state.status||(val===promise?$$reject(promise,$qMinErr("qcycle","Expected promise to be resolved with value other than itself '{0}'",val)):$$resolve(promise,val))}function $$resolve(promise,val){function doResolve(val){done||(done=!0,$$resolve(promise,val))}function doReject(val){done||(done=!0,$$reject(promise,val))}function doNotify(progress){notifyPromise(promise,progress)}var then,done=!1;try{(isObject(val)||isFunction(val))&&(then=val.then),isFunction(then)?(promise.$$state.status=-1,then.call(val,doResolve,doReject,doNotify)):(promise.$$state.value=val,promise.$$state.status=1,scheduleProcessQueue(promise.$$state))}catch(e){doReject(e)}}function rejectPromise(promise,reason){promise.$$state.status||$$reject(promise,reason)}function $$reject(promise,reason){promise.$$state.value=reason,promise.$$state.status=2,scheduleProcessQueue(promise.$$state)}function notifyPromise(promise,progress){var callbacks=promise.$$state.pending;promise.$$state.status<=0&&callbacks&&callbacks.length&&nextTick(function(){for(var callback,result,i=0,ii=callbacks.length;i<ii;i++){result=callbacks[i][0],callback=callbacks[i][3];try{notifyPromise(result,isFunction(callback)?callback(progress):progress)}catch(e){exceptionHandler(e)}}})}/**
   * @ngdoc method
   * @name $q#reject
   * @kind function
   *
   * @description
   * Creates a promise that is resolved as rejected with the specified `reason`. This api should be
   * used to forward rejection in a chain of promises. If you are dealing with the last promise in
   * a promise chain, you don't need to worry about it.
   *
   * When comparing deferreds/promises to the familiar behavior of try/catch/throw, think of
   * `reject` as the `throw` keyword in JavaScript. This also means that if you "catch" an error via
   * a promise error callback and you want to forward the error to the promise derived from the
   * current promise, you have to "rethrow" the error by returning a rejection constructed via
   * `reject`.
   *
   * ```js
   *   promiseB = promiseA.then(function(result) {
   *     // success: do something and resolve promiseB
   *     //          with the old or a new result
   *     return result;
   *   }, function(reason) {
   *     // error: handle the error if possible and
   *     //        resolve promiseB with newPromiseOrValue,
   *     //        otherwise forward the rejection to promiseB
   *     if (canHandle(reason)) {
   *      // handle the error and recover
   *      return newPromiseOrValue;
   *     }
   *     return $q.reject(reason);
   *   });
   * ```
   *
   * @param {*} reason Constant, message, exception or an object representing the rejection reason.
   * @returns {Promise} Returns a promise that was already resolved as rejected with the `reason`.
   */
function reject(reason){var result=new Promise;return rejectPromise(result,reason),result}function handleCallback(value,resolver,callback){var callbackOutput=null;try{isFunction(callback)&&(callbackOutput=callback())}catch(e){return reject(e)}return isPromiseLike(callbackOutput)?callbackOutput.then(function(){return resolver(value)},reject):resolver(value)}/**
   * @ngdoc method
   * @name $q#when
   * @kind function
   *
   * @description
   * Wraps an object that might be a value or a (3rd party) then-able promise into a $q promise.
   * This is useful when you are dealing with an object that might or might not be a promise, or if
   * the promise comes from a source that can't be trusted.
   *
   * @param {*} value Value or a promise
   * @param {Function=} successCallback
   * @param {Function=} errorCallback
   * @param {Function=} progressCallback
   * @returns {Promise} Returns a promise of the passed value or promise
   */
function when(value,callback,errback,progressBack){var result=new Promise;return resolvePromise(result,value),result.then(callback,errback,progressBack)}/**
   * @ngdoc method
   * @name $q#all
   * @kind function
   *
   * @description
   * Combines multiple promises into a single promise that is resolved when all of the input
   * promises are resolved.
   *
   * @param {Array.<Promise>|Object.<Promise>} promises An array or hash of promises.
   * @returns {Promise} Returns a single promise that will be resolved with an array/hash of values,
   *   each value corresponding to the promise at the same index/key in the `promises` array/hash.
   *   If any of the promises is resolved with a rejection, this resulting promise will be rejected
   *   with the same rejection value.
   */
function all(promises){var result=new Promise,counter=0,results=isArray(promises)?[]:{};return forEach(promises,function(promise,key){counter++,when(promise).then(function(value){results[key]=value,--counter||resolvePromise(result,results)},function(reason){rejectPromise(result,reason)})}),0===counter&&resolvePromise(result,results),result}/**
   * @ngdoc method
   * @name $q#race
   * @kind function
   *
   * @description
   * Returns a promise that resolves or rejects as soon as one of those promises
   * resolves or rejects, with the value or reason from that promise.
   *
   * @param {Array.<Promise>|Object.<Promise>} promises An array or hash of promises.
   * @returns {Promise} a promise that resolves or rejects as soon as one of the `promises`
   * resolves or rejects, with the value or reason from that promise.
   */
function race(promises){var deferred=defer();return forEach(promises,function(promise){when(promise).then(deferred.resolve,deferred.reject)}),deferred.promise}function $Q(resolver){function resolveFn(value){resolvePromise(promise,value)}function rejectFn(reason){rejectPromise(promise,reason)}if(!isFunction(resolver))throw $qMinErr("norslvr","Expected resolverFn, got '{0}'",resolver);var promise=new Promise;return resolver(resolveFn,rejectFn),promise}var $qMinErr=minErr("$q",TypeError),queueSize=0,checkQueue=[];extend(Promise.prototype,{then:function(onFulfilled,onRejected,progressBack){if(isUndefined(onFulfilled)&&isUndefined(onRejected)&&isUndefined(progressBack))return this;var result=new Promise;return this.$$state.pending=this.$$state.pending||[],this.$$state.pending.push([result,onFulfilled,onRejected,progressBack]),this.$$state.status>0&&scheduleProcessQueue(this.$$state),result},"catch":function(callback){return this.then(null,callback)},"finally":function(callback,progressBack){return this.then(function(value){return handleCallback(value,resolve,callback)},function(error){return handleCallback(error,reject,callback)},progressBack)}});/**
   * @ngdoc method
   * @name $q#resolve
   * @kind function
   *
   * @description
   * Alias of {@link ng.$q#when when} to maintain naming consistency with ES6.
   *
   * @param {*} value Value or a promise
   * @param {Function=} successCallback
   * @param {Function=} errorCallback
   * @param {Function=} progressCallback
   * @returns {Promise} Returns a promise of the passed value or promise
   */
var resolve=when;
// Let's make the instanceof operator work for promises, so that
// `new $q(fn) instanceof $q` would evaluate to true.
return $Q.prototype=Promise.prototype,$Q.defer=defer,$Q.reject=reject,$Q.when=when,$Q.resolve=resolve,$Q.all=all,$Q.race=race,$Q}/** @this */
function $$RAFProvider(){//rAF
this.$get=["$window","$timeout",function($window,$timeout){var requestAnimationFrame=$window.requestAnimationFrame||$window.webkitRequestAnimationFrame,cancelAnimationFrame=$window.cancelAnimationFrame||$window.webkitCancelAnimationFrame||$window.webkitCancelRequestAnimationFrame,rafSupported=!!requestAnimationFrame,raf=rafSupported?function(fn){var id=requestAnimationFrame(fn);return function(){cancelAnimationFrame(id)}}:function(fn){var timer=$timeout(fn,16.66,!1);// 1000 / 60 = 16.666
return function(){$timeout.cancel(timer)}};return raf.supported=rafSupported,raf}]}/**
 * DESIGN NOTES
 *
 * The design decisions behind the scope are heavily favored for speed and memory consumption.
 *
 * The typical use of scope is to watch the expressions, which most of the time return the same
 * value as last time so we optimize the operation.
 *
 * Closures construction is expensive in terms of speed as well as memory:
 *   - No closures, instead use prototypical inheritance for API
 *   - Internal state needs to be stored on scope directly, which means that private state is
 *     exposed as $$____ properties
 *
 * Loop operations are optimized by using while(count--) { ... }
 *   - This means that in order to keep the same order of execution as addition we have to add
 *     items to the array at the beginning (unshift) instead of at the end (push)
 *
 * Child scopes are created and removed often
 *   - Using an array would be slow since inserts in the middle are expensive; so we use linked lists
 *
 * There are fewer watches than observers. This is why you don't want the observer to be implemented
 * in the same way as watch. Watch requires return of the initialization function which is expensive
 * to construct.
 */
/**
 * @ngdoc provider
 * @name $rootScopeProvider
 * @description
 *
 * Provider for the $rootScope service.
 */
/**
 * @ngdoc method
 * @name $rootScopeProvider#digestTtl
 * @description
 *
 * Sets the number of `$digest` iterations the scope should attempt to execute before giving up and
 * assuming that the model is unstable.
 *
 * The current default is 10 iterations.
 *
 * In complex applications it's possible that the dependencies between `$watch`s will result in
 * several digest iterations. However if an application needs more than the default 10 digest
 * iterations for its model to stabilize then you should investigate what is causing the model to
 * continuously change during the digest.
 *
 * Increasing the TTL could have performance implications, so you should not change it without
 * proper justification.
 *
 * @param {number} limit The number of digest iterations.
 */
/**
 * @ngdoc service
 * @name $rootScope
 * @this
 *
 * @description
 *
 * Every application has a single root {@link ng.$rootScope.Scope scope}.
 * All other scopes are descendant scopes of the root scope. Scopes provide separation
 * between the model and the view, via a mechanism for watching the model for changes.
 * They also provide event emission/broadcast and subscription facility. See the
 * {@link guide/scope developer guide on scopes}.
 */
function $RootScopeProvider(){function createChildScopeClass(parent){function ChildScope(){this.$$watchers=this.$$nextSibling=this.$$childHead=this.$$childTail=null,this.$$listeners={},this.$$listenerCount={},this.$$watchersCount=0,this.$id=nextUid(),this.$$ChildScope=null}return ChildScope.prototype=parent,ChildScope}var TTL=10,$rootScopeMinErr=minErr("$rootScope"),lastDirtyWatch=null,applyAsyncId=null;this.digestTtl=function(value){return arguments.length&&(TTL=value),TTL},this.$get=["$exceptionHandler","$parse","$browser",function($exceptionHandler,$parse,$browser){function destroyChildScope($event){$event.currentScope.$$destroyed=!0}function cleanUpScope($scope){
// Support: IE 9 only
9===msie&&(
// There is a memory leak in IE9 if all child scopes are not disconnected
// completely when a scope is destroyed. So this code will recurse up through
// all this scopes children
//
// See issue https://github.com/angular/angular.js/issues/10706
$scope.$$childHead&&cleanUpScope($scope.$$childHead),$scope.$$nextSibling&&cleanUpScope($scope.$$nextSibling)),
// The code below works around IE9 and V8's memory leaks
//
// See:
// - https://code.google.com/p/v8/issues/detail?id=2073#c26
// - https://github.com/angular/angular.js/issues/6794#issuecomment-38648909
// - https://github.com/angular/angular.js/issues/1313#issuecomment-10378451
$scope.$parent=$scope.$$nextSibling=$scope.$$prevSibling=$scope.$$childHead=$scope.$$childTail=$scope.$root=$scope.$$watchers=null}/**
     * @ngdoc type
     * @name $rootScope.Scope
     *
     * @description
     * A root scope can be retrieved using the {@link ng.$rootScope $rootScope} key from the
     * {@link auto.$injector $injector}. Child scopes are created using the
     * {@link ng.$rootScope.Scope#$new $new()} method. (Most scopes are created automatically when
     * compiled HTML template is executed.) See also the {@link guide/scope Scopes guide} for
     * an in-depth introduction and usage examples.
     *
     *
     * # Inheritance
     * A scope can inherit from a parent scope, as in this example:
     * ```js
         var parent = $rootScope;
         var child = parent.$new();

         parent.salutation = "Hello";
         expect(child.salutation).toEqual('Hello');

         child.salutation = "Welcome";
         expect(child.salutation).toEqual('Welcome');
         expect(parent.salutation).toEqual('Hello');
     * ```
     *
     * When interacting with `Scope` in tests, additional helper methods are available on the
     * instances of `Scope` type. See {@link ngMock.$rootScope.Scope ngMock Scope} for additional
     * details.
     *
     *
     * @param {Object.<string, function()>=} providers Map of service factory which need to be
     *                                       provided for the current scope. Defaults to {@link ng}.
     * @param {Object.<string, *>=} instanceCache Provides pre-instantiated services which should
     *                              append/override services provided by `providers`. This is handy
     *                              when unit-testing and having the need to override a default
     *                              service.
     * @returns {Object} Newly created scope.
     *
     */
function Scope(){this.$id=nextUid(),this.$$phase=this.$parent=this.$$watchers=this.$$nextSibling=this.$$prevSibling=this.$$childHead=this.$$childTail=null,this.$root=this,this.$$destroyed=!1,this.$$listeners={},this.$$listenerCount={},this.$$watchersCount=0,this.$$isolateBindings=null}function beginPhase(phase){if($rootScope.$$phase)throw $rootScopeMinErr("inprog","{0} already in progress",$rootScope.$$phase);$rootScope.$$phase=phase}function clearPhase(){$rootScope.$$phase=null}function incrementWatchersCount(current,count){do current.$$watchersCount+=count;while(current=current.$parent)}function decrementListenerCount(current,count,name){do current.$$listenerCount[name]-=count,0===current.$$listenerCount[name]&&delete current.$$listenerCount[name];while(current=current.$parent)}/**
     * function used as an initial value for watchers.
     * because it's unique we can easily tell it apart from other values
     */
function initWatchVal(){}function flushApplyAsync(){for(;applyAsyncQueue.length;)try{applyAsyncQueue.shift()()}catch(e){$exceptionHandler(e)}applyAsyncId=null}function scheduleApplyAsync(){null===applyAsyncId&&(applyAsyncId=$browser.defer(function(){$rootScope.$apply(flushApplyAsync)}))}/**
     * @ngdoc property
     * @name $rootScope.Scope#$id
     *
     * @description
     * Unique scope ID (monotonically increasing) useful for debugging.
     */
/**
      * @ngdoc property
      * @name $rootScope.Scope#$parent
      *
      * @description
      * Reference to the parent scope.
      */
/**
       * @ngdoc property
       * @name $rootScope.Scope#$root
       *
       * @description
       * Reference to the root scope.
       */
Scope.prototype={constructor:Scope,/**
       * @ngdoc method
       * @name $rootScope.Scope#$new
       * @kind function
       *
       * @description
       * Creates a new child {@link ng.$rootScope.Scope scope}.
       *
       * The parent scope will propagate the {@link ng.$rootScope.Scope#$digest $digest()} event.
       * The scope can be removed from the scope hierarchy using {@link ng.$rootScope.Scope#$destroy $destroy()}.
       *
       * {@link ng.$rootScope.Scope#$destroy $destroy()} must be called on a scope when it is
       * desired for the scope and its child scopes to be permanently detached from the parent and
       * thus stop participating in model change detection and listener notification by invoking.
       *
       * @param {boolean} isolate If true, then the scope does not prototypically inherit from the
       *         parent scope. The scope is isolated, as it can not see parent scope properties.
       *         When creating widgets, it is useful for the widget to not accidentally read parent
       *         state.
       *
       * @param {Scope} [parent=this] The {@link ng.$rootScope.Scope `Scope`} that will be the `$parent`
       *                              of the newly created scope. Defaults to `this` scope if not provided.
       *                              This is used when creating a transclude scope to correctly place it
       *                              in the scope hierarchy while maintaining the correct prototypical
       *                              inheritance.
       *
       * @returns {Object} The newly created child scope.
       *
       */
$new:function(isolate,parent){var child;
// Only create a child scope class if somebody asks for one,
// but cache it to allow the VM to optimize lookups.
// When the new scope is not isolated or we inherit from `this`, and
// the parent scope is destroyed, the property `$$destroyed` is inherited
// prototypically. In all other cases, this property needs to be set
// when the parent scope is destroyed.
// The listener needs to be added after the parent is set
return parent=parent||this,isolate?(child=new Scope,child.$root=this.$root):(this.$$ChildScope||(this.$$ChildScope=createChildScopeClass(this)),child=new this.$$ChildScope),child.$parent=parent,child.$$prevSibling=parent.$$childTail,parent.$$childHead?(parent.$$childTail.$$nextSibling=child,parent.$$childTail=child):parent.$$childHead=parent.$$childTail=child,(isolate||parent!==this)&&child.$on("$destroy",destroyChildScope),child},/**
       * @ngdoc method
       * @name $rootScope.Scope#$watch
       * @kind function
       *
       * @description
       * Registers a `listener` callback to be executed whenever the `watchExpression` changes.
       *
       * - The `watchExpression` is called on every call to {@link ng.$rootScope.Scope#$digest
       *   $digest()} and should return the value that will be watched. (`watchExpression` should not change
       *   its value when executed multiple times with the same input because it may be executed multiple
       *   times by {@link ng.$rootScope.Scope#$digest $digest()}. That is, `watchExpression` should be
       *   [idempotent](http://en.wikipedia.org/wiki/Idempotence).)
       * - The `listener` is called only when the value from the current `watchExpression` and the
       *   previous call to `watchExpression` are not equal (with the exception of the initial run,
       *   see below). Inequality is determined according to reference inequality,
       *   [strict comparison](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Comparison_Operators)
       *    via the `!==` Javascript operator, unless `objectEquality == true`
       *   (see next point)
       * - When `objectEquality == true`, inequality of the `watchExpression` is determined
       *   according to the {@link angular.equals} function. To save the value of the object for
       *   later comparison, the {@link angular.copy} function is used. This therefore means that
       *   watching complex objects will have adverse memory and performance implications.
       * - This should not be used to watch for changes in objects that are
       *   or contain [File](https://developer.mozilla.org/docs/Web/API/File) objects due to limitations with {@link angular.copy `angular.copy`}.
       * - The watch `listener` may change the model, which may trigger other `listener`s to fire.
       *   This is achieved by rerunning the watchers until no changes are detected. The rerun
       *   iteration limit is 10 to prevent an infinite loop deadlock.
       *
       *
       * If you want to be notified whenever {@link ng.$rootScope.Scope#$digest $digest} is called,
       * you can register a `watchExpression` function with no `listener`. (Be prepared for
       * multiple calls to your `watchExpression` because it will execute multiple times in a
       * single {@link ng.$rootScope.Scope#$digest $digest} cycle if a change is detected.)
       *
       * After a watcher is registered with the scope, the `listener` fn is called asynchronously
       * (via {@link ng.$rootScope.Scope#$evalAsync $evalAsync}) to initialize the
       * watcher. In rare cases, this is undesirable because the listener is called when the result
       * of `watchExpression` didn't change. To detect this scenario within the `listener` fn, you
       * can compare the `newVal` and `oldVal`. If these two values are identical (`===`) then the
       * listener was called due to initialization.
       *
       *
       *
       * # Example
       * ```js
           // let's assume that scope was dependency injected as the $rootScope
           var scope = $rootScope;
           scope.name = 'misko';
           scope.counter = 0;

           expect(scope.counter).toEqual(0);
           scope.$watch('name', function(newValue, oldValue) {
             scope.counter = scope.counter + 1;
           });
           expect(scope.counter).toEqual(0);

           scope.$digest();
           // the listener is always called during the first $digest loop after it was registered
           expect(scope.counter).toEqual(1);

           scope.$digest();
           // but now it will not be called unless the value changes
           expect(scope.counter).toEqual(1);

           scope.name = 'adam';
           scope.$digest();
           expect(scope.counter).toEqual(2);



           // Using a function as a watchExpression
           var food;
           scope.foodCounter = 0;
           expect(scope.foodCounter).toEqual(0);
           scope.$watch(
             // This function returns the value being watched. It is called for each turn of the $digest loop
             function() { return food; },
             // This is the change listener, called when the value returned from the above function changes
             function(newValue, oldValue) {
               if ( newValue !== oldValue ) {
                 // Only increment the counter if the value changed
                 scope.foodCounter = scope.foodCounter + 1;
               }
             }
           );
           // No digest has been run so the counter will be zero
           expect(scope.foodCounter).toEqual(0);

           // Run the digest but since food has not changed count will still be zero
           scope.$digest();
           expect(scope.foodCounter).toEqual(0);

           // Update food and run digest.  Now the counter will increment
           food = 'cheeseburger';
           scope.$digest();
           expect(scope.foodCounter).toEqual(1);

       * ```
       *
       *
       *
       * @param {(function()|string)} watchExpression Expression that is evaluated on each
       *    {@link ng.$rootScope.Scope#$digest $digest} cycle. A change in the return value triggers
       *    a call to the `listener`.
       *
       *    - `string`: Evaluated as {@link guide/expression expression}
       *    - `function(scope)`: called with current `scope` as a parameter.
       * @param {function(newVal, oldVal, scope)} listener Callback called whenever the value
       *    of `watchExpression` changes.
       *
       *    - `newVal` contains the current value of the `watchExpression`
       *    - `oldVal` contains the previous value of the `watchExpression`
       *    - `scope` refers to the current scope
       * @param {boolean=} [objectEquality=false] Compare for object equality using {@link angular.equals} instead of
       *     comparing for reference equality.
       * @returns {function()} Returns a deregistration function for this listener.
       */
$watch:function(watchExp,listener,objectEquality,prettyPrintExpression){var get=$parse(watchExp);if(get.$$watchDelegate)return get.$$watchDelegate(this,listener,objectEquality,get,watchExp);var scope=this,array=scope.$$watchers,watcher={fn:listener,last:initWatchVal,get:get,exp:prettyPrintExpression||watchExp,eq:!!objectEquality};
// we use unshift since we use a while loop in $digest for speed.
// the while loop reads in reverse order.
return lastDirtyWatch=null,isFunction(listener)||(watcher.fn=noop),array||(array=scope.$$watchers=[],array.$$digestWatchIndex=-1),array.unshift(watcher),array.$$digestWatchIndex++,incrementWatchersCount(this,1),function(){var index=arrayRemove(array,watcher);index>=0&&(incrementWatchersCount(scope,-1),index<array.$$digestWatchIndex&&array.$$digestWatchIndex--),lastDirtyWatch=null}},/**
       * @ngdoc method
       * @name $rootScope.Scope#$watchGroup
       * @kind function
       *
       * @description
       * A variant of {@link ng.$rootScope.Scope#$watch $watch()} where it watches an array of `watchExpressions`.
       * If any one expression in the collection changes the `listener` is executed.
       *
       * - The items in the `watchExpressions` array are observed via the standard `$watch` operation. Their return
       *   values are examined for changes on every call to `$digest`.
       * - The `listener` is called whenever any expression in the `watchExpressions` array changes.
       *
       * @param {Array.<string|Function(scope)>} watchExpressions Array of expressions that will be individually
       * watched using {@link ng.$rootScope.Scope#$watch $watch()}
       *
       * @param {function(newValues, oldValues, scope)} listener Callback called whenever the return value of any
       *    expression in `watchExpressions` changes
       *    The `newValues` array contains the current values of the `watchExpressions`, with the indexes matching
       *    those of `watchExpression`
       *    and the `oldValues` array contains the previous values of the `watchExpressions`, with the indexes matching
       *    those of `watchExpression`
       *    The `scope` refers to the current scope.
       * @returns {function()} Returns a de-registration function for all listeners.
       */
$watchGroup:function(watchExpressions,listener){function watchGroupAction(){changeReactionScheduled=!1,firstRun?(firstRun=!1,listener(newValues,newValues,self)):listener(newValues,oldValues,self)}var oldValues=new Array(watchExpressions.length),newValues=new Array(watchExpressions.length),deregisterFns=[],self=this,changeReactionScheduled=!1,firstRun=!0;if(!watchExpressions.length){
// No expressions means we call the listener ASAP
var shouldCall=!0;return self.$evalAsync(function(){shouldCall&&listener(newValues,newValues,self)}),function(){shouldCall=!1}}return 1===watchExpressions.length?this.$watch(watchExpressions[0],function(value,oldValue,scope){newValues[0]=value,oldValues[0]=oldValue,listener(newValues,value===oldValue?newValues:oldValues,scope)}):(forEach(watchExpressions,function(expr,i){var unwatchFn=self.$watch(expr,function(value,oldValue){newValues[i]=value,oldValues[i]=oldValue,changeReactionScheduled||(changeReactionScheduled=!0,self.$evalAsync(watchGroupAction))});deregisterFns.push(unwatchFn)}),function(){for(;deregisterFns.length;)deregisterFns.shift()()})},/**
       * @ngdoc method
       * @name $rootScope.Scope#$watchCollection
       * @kind function
       *
       * @description
       * Shallow watches the properties of an object and fires whenever any of the properties change
       * (for arrays, this implies watching the array items; for object maps, this implies watching
       * the properties). If a change is detected, the `listener` callback is fired.
       *
       * - The `obj` collection is observed via standard $watch operation and is examined on every
       *   call to $digest() to see if any items have been added, removed, or moved.
       * - The `listener` is called whenever anything within the `obj` has changed. Examples include
       *   adding, removing, and moving items belonging to an object or array.
       *
       *
       * # Example
       * ```js
          $scope.names = ['igor', 'matias', 'misko', 'james'];
          $scope.dataCount = 4;

          $scope.$watchCollection('names', function(newNames, oldNames) {
            $scope.dataCount = newNames.length;
          });

          expect($scope.dataCount).toEqual(4);
          $scope.$digest();

          //still at 4 ... no changes
          expect($scope.dataCount).toEqual(4);

          $scope.names.pop();
          $scope.$digest();

          //now there's been a change
          expect($scope.dataCount).toEqual(3);
       * ```
       *
       *
       * @param {string|function(scope)} obj Evaluated as {@link guide/expression expression}. The
       *    expression value should evaluate to an object or an array which is observed on each
       *    {@link ng.$rootScope.Scope#$digest $digest} cycle. Any shallow change within the
       *    collection will trigger a call to the `listener`.
       *
       * @param {function(newCollection, oldCollection, scope)} listener a callback function called
       *    when a change is detected.
       *    - The `newCollection` object is the newly modified data obtained from the `obj` expression
       *    - The `oldCollection` object is a copy of the former collection data.
       *      Due to performance considerations, the`oldCollection` value is computed only if the
       *      `listener` function declares two or more arguments.
       *    - The `scope` argument refers to the current scope.
       *
       * @returns {function()} Returns a de-registration function for this listener. When the
       *    de-registration function is executed, the internal watch operation is terminated.
       */
$watchCollection:function(obj,listener){function $watchCollectionInterceptor(_value){newValue=_value;var newLength,key,bothNaN,newItem,oldItem;
// If the new value is undefined, then return undefined as the watch may be a one-time watch
if(!isUndefined(newValue)){if(isObject(newValue))if(isArrayLike(newValue)){oldValue!==internalArray&&(
// we are transitioning from something which was not an array into array.
oldValue=internalArray,oldLength=oldValue.length=0,changeDetected++),newLength=newValue.length,oldLength!==newLength&&(
// if lengths do not match we need to trigger change notification
changeDetected++,oldValue.length=oldLength=newLength);
// copy the items to oldValue and look for changes.
for(var i=0;i<newLength;i++)oldItem=oldValue[i],newItem=newValue[i],
// eslint-disable-next-line no-self-compare
bothNaN=oldItem!==oldItem&&newItem!==newItem,bothNaN||oldItem===newItem||(changeDetected++,oldValue[i]=newItem)}else{oldValue!==internalObject&&(
// we are transitioning from something which was not an object into object.
oldValue=internalObject={},oldLength=0,changeDetected++),
// copy the items to oldValue and look for changes.
newLength=0;for(key in newValue)hasOwnProperty.call(newValue,key)&&(newLength++,newItem=newValue[key],oldItem=oldValue[key],key in oldValue?(
// eslint-disable-next-line no-self-compare
bothNaN=oldItem!==oldItem&&newItem!==newItem,bothNaN||oldItem===newItem||(changeDetected++,oldValue[key]=newItem)):(oldLength++,oldValue[key]=newItem,changeDetected++));if(oldLength>newLength){
// we used to have more keys, need to find them and destroy them.
changeDetected++;for(key in oldValue)hasOwnProperty.call(newValue,key)||(oldLength--,delete oldValue[key])}}else// if primitive
oldValue!==newValue&&(oldValue=newValue,changeDetected++);return changeDetected}}function $watchCollectionAction(){
// make a copy for the next time a collection is changed
if(initRun?(initRun=!1,listener(newValue,newValue,self)):listener(newValue,veryOldValue,self),trackVeryOldValue)if(isObject(newValue))if(isArrayLike(newValue)){veryOldValue=new Array(newValue.length);for(var i=0;i<newValue.length;i++)veryOldValue[i]=newValue[i]}else{// if object
veryOldValue={};for(var key in newValue)hasOwnProperty.call(newValue,key)&&(veryOldValue[key]=newValue[key])}else
//primitive
veryOldValue=newValue}$watchCollectionInterceptor.$stateful=!0;var newValue,oldValue,veryOldValue,self=this,trackVeryOldValue=listener.length>1,changeDetected=0,changeDetector=$parse(obj,$watchCollectionInterceptor),internalArray=[],internalObject={},initRun=!0,oldLength=0;return this.$watch(changeDetector,$watchCollectionAction)},/**
       * @ngdoc method
       * @name $rootScope.Scope#$digest
       * @kind function
       *
       * @description
       * Processes all of the {@link ng.$rootScope.Scope#$watch watchers} of the current scope and
       * its children. Because a {@link ng.$rootScope.Scope#$watch watcher}'s listener can change
       * the model, the `$digest()` keeps calling the {@link ng.$rootScope.Scope#$watch watchers}
       * until no more listeners are firing. This means that it is possible to get into an infinite
       * loop. This function will throw `'Maximum iteration limit exceeded.'` if the number of
       * iterations exceeds 10.
       *
       * Usually, you don't call `$digest()` directly in
       * {@link ng.directive:ngController controllers} or in
       * {@link ng.$compileProvider#directive directives}.
       * Instead, you should call {@link ng.$rootScope.Scope#$apply $apply()} (typically from within
       * a {@link ng.$compileProvider#directive directive}), which will force a `$digest()`.
       *
       * If you want to be notified whenever `$digest()` is called,
       * you can register a `watchExpression` function with
       * {@link ng.$rootScope.Scope#$watch $watch()} with no `listener`.
       *
       * In unit tests, you may need to call `$digest()` to simulate the scope life cycle.
       *
       * # Example
       * ```js
           var scope = ...;
           scope.name = 'misko';
           scope.counter = 0;

           expect(scope.counter).toEqual(0);
           scope.$watch('name', function(newValue, oldValue) {
             scope.counter = scope.counter + 1;
           });
           expect(scope.counter).toEqual(0);

           scope.$digest();
           // the listener is always called during the first $digest loop after it was registered
           expect(scope.counter).toEqual(1);

           scope.$digest();
           // but now it will not be called unless the value changes
           expect(scope.counter).toEqual(1);

           scope.name = 'adam';
           scope.$digest();
           expect(scope.counter).toEqual(2);
       * ```
       *
       */
$digest:function(){var watch,value,last,fn,get,watchers,dirty,next,current,logIdx,asyncTask,ttl=TTL,target=this,watchLog=[];beginPhase("$digest"),
// Check for changes to browser url that happened in sync before the call to $digest
$browser.$$checkUrlChange(),this===$rootScope&&null!==applyAsyncId&&(
// If this is the root scope, and $applyAsync has scheduled a deferred $apply(), then
// cancel the scheduled $apply and flush the queue of expressions to be evaluated.
$browser.defer.cancel(applyAsyncId),flushApplyAsync()),lastDirtyWatch=null;do{// "while dirty" loop
dirty=!1,current=target;
// It's safe for asyncQueuePosition to be a local variable here because this loop can't
// be reentered recursively. Calling $digest from a function passed to $evalAsync would
// lead to a '$digest already in progress' error.
for(var asyncQueuePosition=0;asyncQueuePosition<asyncQueue.length;asyncQueuePosition++){try{asyncTask=asyncQueue[asyncQueuePosition],fn=asyncTask.fn,fn(asyncTask.scope,asyncTask.locals)}catch(e){$exceptionHandler(e)}lastDirtyWatch=null}asyncQueue.length=0;traverseScopesLoop:do{// "traverse the scopes" loop
if(watchers=current.$$watchers)for(
// process our watches
watchers.$$digestWatchIndex=watchers.length;watchers.$$digestWatchIndex--;)try{
// Most common watches are on primitives, in which case we can short
// circuit it with === operator, only when === fails do we use .equals
if(watch=watchers[watchers.$$digestWatchIndex])if(get=watch.get,(value=get(current))===(last=watch.last)||(watch.eq?equals(value,last):isNumberNaN(value)&&isNumberNaN(last))){if(watch===lastDirtyWatch){
// If the most recently dirty watcher is now clean, short circuit since the remaining watchers
// have already been tested.
dirty=!1;break traverseScopesLoop}}else dirty=!0,lastDirtyWatch=watch,watch.last=watch.eq?copy(value,null):value,fn=watch.fn,fn(value,last===initWatchVal?value:last,current),ttl<5&&(logIdx=4-ttl,watchLog[logIdx]||(watchLog[logIdx]=[]),watchLog[logIdx].push({msg:isFunction(watch.exp)?"fn: "+(watch.exp.name||watch.exp.toString()):watch.exp,newVal:value,oldVal:last}))}catch(e){$exceptionHandler(e)}
// Insanity Warning: scope depth-first traversal
// yes, this code is a bit crazy, but it works and we have tests to prove it!
// this piece should be kept in sync with the traversal in $broadcast
if(!(next=current.$$watchersCount&&current.$$childHead||current!==target&&current.$$nextSibling))for(;current!==target&&!(next=current.$$nextSibling);)current=current.$parent}while(current=next);
// `break traverseScopesLoop;` takes us to here
if((dirty||asyncQueue.length)&&!ttl--)throw clearPhase(),$rootScopeMinErr("infdig","{0} $digest() iterations reached. Aborting!\nWatchers fired in the last 5 iterations: {1}",TTL,watchLog)}while(dirty||asyncQueue.length);
// postDigestQueuePosition isn't local here because this loop can be reentered recursively.
for(clearPhase();postDigestQueuePosition<postDigestQueue.length;)try{postDigestQueue[postDigestQueuePosition++]()}catch(e){$exceptionHandler(e)}postDigestQueue.length=postDigestQueuePosition=0,
// Check for changes to browser url that happened during the $digest
// (for which no event is fired; e.g. via `history.pushState()`)
$browser.$$checkUrlChange()},/**
       * @ngdoc event
       * @name $rootScope.Scope#$destroy
       * @eventType broadcast on scope being destroyed
       *
       * @description
       * Broadcasted when a scope and its children are being destroyed.
       *
       * Note that, in AngularJS, there is also a `$destroy` jQuery event, which can be used to
       * clean up DOM bindings before an element is removed from the DOM.
       */
/**
       * @ngdoc method
       * @name $rootScope.Scope#$destroy
       * @kind function
       *
       * @description
       * Removes the current scope (and all of its children) from the parent scope. Removal implies
       * that calls to {@link ng.$rootScope.Scope#$digest $digest()} will no longer
       * propagate to the current scope and its children. Removal also implies that the current
       * scope is eligible for garbage collection.
       *
       * The `$destroy()` is usually used by directives such as
       * {@link ng.directive:ngRepeat ngRepeat} for managing the
       * unrolling of the loop.
       *
       * Just before a scope is destroyed, a `$destroy` event is broadcasted on this scope.
       * Application code can register a `$destroy` event handler that will give it a chance to
       * perform any necessary cleanup.
       *
       * Note that, in AngularJS, there is also a `$destroy` jQuery event, which can be used to
       * clean up DOM bindings before an element is removed from the DOM.
       */
$destroy:function(){
// We can't destroy a scope that has been already destroyed.
if(!this.$$destroyed){var parent=this.$parent;this.$broadcast("$destroy"),this.$$destroyed=!0,this===$rootScope&&
//Remove handlers attached to window when $rootScope is removed
$browser.$$applicationDestroyed(),incrementWatchersCount(this,-this.$$watchersCount);for(var eventName in this.$$listenerCount)decrementListenerCount(this,this.$$listenerCount[eventName],eventName);
// sever all the references to parent scopes (after this cleanup, the current scope should
// not be retained by any of our references and should be eligible for garbage collection)
parent&&parent.$$childHead===this&&(parent.$$childHead=this.$$nextSibling),parent&&parent.$$childTail===this&&(parent.$$childTail=this.$$prevSibling),this.$$prevSibling&&(this.$$prevSibling.$$nextSibling=this.$$nextSibling),this.$$nextSibling&&(this.$$nextSibling.$$prevSibling=this.$$prevSibling),
// Disable listeners, watchers and apply/digest methods
this.$destroy=this.$digest=this.$apply=this.$evalAsync=this.$applyAsync=noop,this.$on=this.$watch=this.$watchGroup=function(){return noop},this.$$listeners={},
// Disconnect the next sibling to prevent `cleanUpScope` destroying those too
this.$$nextSibling=null,cleanUpScope(this)}},/**
       * @ngdoc method
       * @name $rootScope.Scope#$eval
       * @kind function
       *
       * @description
       * Executes the `expression` on the current scope and returns the result. Any exceptions in
       * the expression are propagated (uncaught). This is useful when evaluating Angular
       * expressions.
       *
       * # Example
       * ```js
           var scope = ng.$rootScope.Scope();
           scope.a = 1;
           scope.b = 2;

           expect(scope.$eval('a+b')).toEqual(3);
           expect(scope.$eval(function(scope){ return scope.a + scope.b; })).toEqual(3);
       * ```
       *
       * @param {(string|function())=} expression An angular expression to be executed.
       *
       *    - `string`: execute using the rules as defined in  {@link guide/expression expression}.
       *    - `function(scope)`: execute the function with the current `scope` parameter.
       *
       * @param {(object)=} locals Local variables object, useful for overriding values in scope.
       * @returns {*} The result of evaluating the expression.
       */
$eval:function(expr,locals){return $parse(expr)(this,locals)},/**
       * @ngdoc method
       * @name $rootScope.Scope#$evalAsync
       * @kind function
       *
       * @description
       * Executes the expression on the current scope at a later point in time.
       *
       * The `$evalAsync` makes no guarantees as to when the `expression` will be executed, only
       * that:
       *
       *   - it will execute after the function that scheduled the evaluation (preferably before DOM
       *     rendering).
       *   - at least one {@link ng.$rootScope.Scope#$digest $digest cycle} will be performed after
       *     `expression` execution.
       *
       * Any exceptions from the execution of the expression are forwarded to the
       * {@link ng.$exceptionHandler $exceptionHandler} service.
       *
       * __Note:__ if this function is called outside of a `$digest` cycle, a new `$digest` cycle
       * will be scheduled. However, it is encouraged to always call code that changes the model
       * from within an `$apply` call. That includes code evaluated via `$evalAsync`.
       *
       * @param {(string|function())=} expression An angular expression to be executed.
       *
       *    - `string`: execute using the rules as defined in {@link guide/expression expression}.
       *    - `function(scope)`: execute the function with the current `scope` parameter.
       *
       * @param {(object)=} locals Local variables object, useful for overriding values in scope.
       */
$evalAsync:function(expr,locals){
// if we are outside of an $digest loop and this is the first time we are scheduling async
// task also schedule async auto-flush
$rootScope.$$phase||asyncQueue.length||$browser.defer(function(){asyncQueue.length&&$rootScope.$digest()}),asyncQueue.push({scope:this,fn:$parse(expr),locals:locals})},$$postDigest:function(fn){postDigestQueue.push(fn)},/**
       * @ngdoc method
       * @name $rootScope.Scope#$apply
       * @kind function
       *
       * @description
       * `$apply()` is used to execute an expression in angular from outside of the angular
       * framework. (For example from browser DOM events, setTimeout, XHR or third party libraries).
       * Because we are calling into the angular framework we need to perform proper scope life
       * cycle of {@link ng.$exceptionHandler exception handling},
       * {@link ng.$rootScope.Scope#$digest executing watches}.
       *
       * ## Life cycle
       *
       * # Pseudo-Code of `$apply()`
       * ```js
           function $apply(expr) {
             try {
               return $eval(expr);
             } catch (e) {
               $exceptionHandler(e);
             } finally {
               $root.$digest();
             }
           }
       * ```
       *
       *
       * Scope's `$apply()` method transitions through the following stages:
       *
       * 1. The {@link guide/expression expression} is executed using the
       *    {@link ng.$rootScope.Scope#$eval $eval()} method.
       * 2. Any exceptions from the execution of the expression are forwarded to the
       *    {@link ng.$exceptionHandler $exceptionHandler} service.
       * 3. The {@link ng.$rootScope.Scope#$watch watch} listeners are fired immediately after the
       *    expression was executed using the {@link ng.$rootScope.Scope#$digest $digest()} method.
       *
       *
       * @param {(string|function())=} exp An angular expression to be executed.
       *
       *    - `string`: execute using the rules as defined in {@link guide/expression expression}.
       *    - `function(scope)`: execute the function with current `scope` parameter.
       *
       * @returns {*} The result of evaluating the expression.
       */
$apply:function(expr){try{beginPhase("$apply");try{return this.$eval(expr)}finally{clearPhase()}}catch(e){$exceptionHandler(e)}finally{try{$rootScope.$digest()}catch(e){
// eslint-disable-next-line no-unsafe-finally
throw $exceptionHandler(e),e}}},/**
       * @ngdoc method
       * @name $rootScope.Scope#$applyAsync
       * @kind function
       *
       * @description
       * Schedule the invocation of $apply to occur at a later time. The actual time difference
       * varies across browsers, but is typically around ~10 milliseconds.
       *
       * This can be used to queue up multiple expressions which need to be evaluated in the same
       * digest.
       *
       * @param {(string|function())=} exp An angular expression to be executed.
       *
       *    - `string`: execute using the rules as defined in {@link guide/expression expression}.
       *    - `function(scope)`: execute the function with current `scope` parameter.
       */
$applyAsync:function(expr){function $applyAsyncExpression(){scope.$eval(expr)}var scope=this;expr&&applyAsyncQueue.push($applyAsyncExpression),expr=$parse(expr),scheduleApplyAsync()},/**
       * @ngdoc method
       * @name $rootScope.Scope#$on
       * @kind function
       *
       * @description
       * Listens on events of a given type. See {@link ng.$rootScope.Scope#$emit $emit} for
       * discussion of event life cycle.
       *
       * The event listener function format is: `function(event, args...)`. The `event` object
       * passed into the listener has the following attributes:
       *
       *   - `targetScope` - `{Scope}`: the scope on which the event was `$emit`-ed or
       *     `$broadcast`-ed.
       *   - `currentScope` - `{Scope}`: the scope that is currently handling the event. Once the
       *     event propagates through the scope hierarchy, this property is set to null.
       *   - `name` - `{string}`: name of the event.
       *   - `stopPropagation` - `{function=}`: calling `stopPropagation` function will cancel
       *     further event propagation (available only for events that were `$emit`-ed).
       *   - `preventDefault` - `{function}`: calling `preventDefault` sets `defaultPrevented` flag
       *     to true.
       *   - `defaultPrevented` - `{boolean}`: true if `preventDefault` was called.
       *
       * @param {string} name Event name to listen on.
       * @param {function(event, ...args)} listener Function to call when the event is emitted.
       * @returns {function()} Returns a deregistration function for this listener.
       */
$on:function(name,listener){var namedListeners=this.$$listeners[name];namedListeners||(this.$$listeners[name]=namedListeners=[]),namedListeners.push(listener);var current=this;do current.$$listenerCount[name]||(current.$$listenerCount[name]=0),current.$$listenerCount[name]++;while(current=current.$parent);var self=this;return function(){var indexOfListener=namedListeners.indexOf(listener);indexOfListener!==-1&&(namedListeners[indexOfListener]=null,decrementListenerCount(self,1,name))}},/**
       * @ngdoc method
       * @name $rootScope.Scope#$emit
       * @kind function
       *
       * @description
       * Dispatches an event `name` upwards through the scope hierarchy notifying the
       * registered {@link ng.$rootScope.Scope#$on} listeners.
       *
       * The event life cycle starts at the scope on which `$emit` was called. All
       * {@link ng.$rootScope.Scope#$on listeners} listening for `name` event on this scope get
       * notified. Afterwards, the event traverses upwards toward the root scope and calls all
       * registered listeners along the way. The event will stop propagating if one of the listeners
       * cancels it.
       *
       * Any exception emitted from the {@link ng.$rootScope.Scope#$on listeners} will be passed
       * onto the {@link ng.$exceptionHandler $exceptionHandler} service.
       *
       * @param {string} name Event name to emit.
       * @param {...*} args Optional one or more arguments which will be passed onto the event listeners.
       * @return {Object} Event object (see {@link ng.$rootScope.Scope#$on}).
       */
$emit:function(name,args){var namedListeners,i,length,empty=[],scope=this,stopPropagation=!1,event={name:name,targetScope:scope,stopPropagation:function(){stopPropagation=!0},preventDefault:function(){event.defaultPrevented=!0},defaultPrevented:!1},listenerArgs=concat([event],arguments,1);do{for(namedListeners=scope.$$listeners[name]||empty,event.currentScope=scope,i=0,length=namedListeners.length;i<length;i++)
// if listeners were deregistered, defragment the array
if(namedListeners[i])try{
//allow all listeners attached to the current scope to run
namedListeners[i].apply(null,listenerArgs)}catch(e){$exceptionHandler(e)}else namedListeners.splice(i,1),i--,length--;
//if any listener on the current scope stops propagation, prevent bubbling
if(stopPropagation)return event.currentScope=null,event;
//traverse upwards
scope=scope.$parent}while(scope);return event.currentScope=null,event},/**
       * @ngdoc method
       * @name $rootScope.Scope#$broadcast
       * @kind function
       *
       * @description
       * Dispatches an event `name` downwards to all child scopes (and their children) notifying the
       * registered {@link ng.$rootScope.Scope#$on} listeners.
       *
       * The event life cycle starts at the scope on which `$broadcast` was called. All
       * {@link ng.$rootScope.Scope#$on listeners} listening for `name` event on this scope get
       * notified. Afterwards, the event propagates to all direct and indirect scopes of the current
       * scope and calls all registered listeners along the way. The event cannot be canceled.
       *
       * Any exception emitted from the {@link ng.$rootScope.Scope#$on listeners} will be passed
       * onto the {@link ng.$exceptionHandler $exceptionHandler} service.
       *
       * @param {string} name Event name to broadcast.
       * @param {...*} args Optional one or more arguments which will be passed onto the event listeners.
       * @return {Object} Event object, see {@link ng.$rootScope.Scope#$on}
       */
$broadcast:function(name,args){var target=this,current=target,next=target,event={name:name,targetScope:target,preventDefault:function(){event.defaultPrevented=!0},defaultPrevented:!1};if(!target.$$listenerCount[name])return event;
//down while you can, then up and next sibling or up and next sibling until back at root
for(var listeners,i,length,listenerArgs=concat([event],arguments,1);current=next;){for(event.currentScope=current,listeners=current.$$listeners[name]||[],i=0,length=listeners.length;i<length;i++)
// if listeners were deregistered, defragment the array
if(listeners[i])try{listeners[i].apply(null,listenerArgs)}catch(e){$exceptionHandler(e)}else listeners.splice(i,1),i--,length--;
// Insanity Warning: scope depth-first traversal
// yes, this code is a bit crazy, but it works and we have tests to prove it!
// this piece should be kept in sync with the traversal in $digest
// (though it differs due to having the extra check for $$listenerCount)
if(!(next=current.$$listenerCount[name]&&current.$$childHead||current!==target&&current.$$nextSibling))for(;current!==target&&!(next=current.$$nextSibling);)current=current.$parent}return event.currentScope=null,event}};var $rootScope=new Scope,asyncQueue=$rootScope.$$asyncQueue=[],postDigestQueue=$rootScope.$$postDigestQueue=[],applyAsyncQueue=$rootScope.$$applyAsyncQueue=[],postDigestQueuePosition=0;return $rootScope}]}/**
 * @ngdoc service
 * @name $rootElement
 *
 * @description
 * The root element of Angular application. This is either the element where {@link
 * ng.directive:ngApp ngApp} was declared or the element passed into
 * {@link angular.bootstrap}. The element represents the root element of application. It is also the
 * location where the application's {@link auto.$injector $injector} service gets
 * published, and can be retrieved using `$rootElement.injector()`.
 */
// the implementation is in angular.bootstrap
/**
 * @this
 * @description
 * Private service to sanitize uris for links and images. Used by $compile and $sanitize.
 */
function $$SanitizeUriProvider(){var aHrefSanitizationWhitelist=/^\s*(https?|ftp|mailto|tel|file):/,imgSrcSanitizationWhitelist=/^\s*((https?|ftp|file|blob):|data:image\/)/;/**
   * @description
   * Retrieves or overrides the default regular expression that is used for whitelisting of safe
   * urls during a[href] sanitization.
   *
   * The sanitization is a security measure aimed at prevent XSS attacks via html links.
   *
   * Any url about to be assigned to a[href] via data-binding is first normalized and turned into
   * an absolute url. Afterwards, the url is matched against the `aHrefSanitizationWhitelist`
   * regular expression. If a match is found, the original url is written into the dom. Otherwise,
   * the absolute url is prefixed with `'unsafe:'` string and only then is it written into the DOM.
   *
   * @param {RegExp=} regexp New regexp to whitelist urls with.
   * @returns {RegExp|ng.$compileProvider} Current RegExp if called without value or self for
   *    chaining otherwise.
   */
this.aHrefSanitizationWhitelist=function(regexp){return isDefined(regexp)?(aHrefSanitizationWhitelist=regexp,this):aHrefSanitizationWhitelist},/**
   * @description
   * Retrieves or overrides the default regular expression that is used for whitelisting of safe
   * urls during img[src] sanitization.
   *
   * The sanitization is a security measure aimed at prevent XSS attacks via html links.
   *
   * Any url about to be assigned to img[src] via data-binding is first normalized and turned into
   * an absolute url. Afterwards, the url is matched against the `imgSrcSanitizationWhitelist`
   * regular expression. If a match is found, the original url is written into the dom. Otherwise,
   * the absolute url is prefixed with `'unsafe:'` string and only then is it written into the DOM.
   *
   * @param {RegExp=} regexp New regexp to whitelist urls with.
   * @returns {RegExp|ng.$compileProvider} Current RegExp if called without value or self for
   *    chaining otherwise.
   */
this.imgSrcSanitizationWhitelist=function(regexp){return isDefined(regexp)?(imgSrcSanitizationWhitelist=regexp,this):imgSrcSanitizationWhitelist},this.$get=function(){return function(uri,isImage){var normalizedVal,regex=isImage?imgSrcSanitizationWhitelist:aHrefSanitizationWhitelist;return normalizedVal=urlResolve(uri).href,""===normalizedVal||normalizedVal.match(regex)?uri:"unsafe:"+normalizedVal}}}function snakeToCamel(name){return name.replace(UNDERSCORE_LOWERCASE_REGEXP,fnCamelCaseReplace)}function adjustMatcher(matcher){if("self"===matcher)return matcher;if(isString(matcher)){
// Strings match exactly except for 2 wildcards - '*' and '**'.
// '*' matches any character except those from the set ':/.?&'.
// '**' matches any character (like .* in a RegExp).
// More than 2 *'s raises an error as it's ill defined.
if(matcher.indexOf("***")>-1)throw $sceMinErr("iwcard","Illegal sequence *** in string matcher.  String: {0}",matcher);return matcher=escapeForRegexp(matcher).replace(/\\\*\\\*/g,".*").replace(/\\\*/g,"[^:/.?&;]*"),new RegExp("^"+matcher+"$")}if(isRegExp(matcher))
// The only other type of matcher allowed is a Regexp.
// Match entire URL / disallow partial matches.
// Flags are reset (i.e. no global, ignoreCase or multiline)
return new RegExp("^"+matcher.source+"$");throw $sceMinErr("imatcher",'Matchers may only be "self", string patterns or RegExp objects')}function adjustMatchers(matchers){var adjustedMatchers=[];return isDefined(matchers)&&forEach(matchers,function(matcher){adjustedMatchers.push(adjustMatcher(matcher))}),adjustedMatchers}/**
 * @ngdoc service
 * @name $sceDelegate
 * @kind function
 *
 * @description
 *
 * `$sceDelegate` is a service that is used by the `$sce` service to provide {@link ng.$sce Strict
 * Contextual Escaping (SCE)} services to AngularJS.
 *
 * For an overview of this service and the functionnality it provides in AngularJS, see the main
 * page for {@link ng.$sce SCE}. The current page is targeted for developers who need to alter how
 * SCE works in their application, which shouldn't be needed in most cases.
 *
 * <div class="alert alert-danger">
 * AngularJS strongly relies on contextual escaping for the security of bindings: disabling or
 * modifying this might cause cross site scripting (XSS) vulnerabilities. For libraries owners,
 * changes to this service will also influence users, so be extra careful and document your changes.
 * </div>
 *
 * Typically, you would configure or override the {@link ng.$sceDelegate $sceDelegate} instead of
 * the `$sce` service to customize the way Strict Contextual Escaping works in AngularJS.  This is
 * because, while the `$sce` provides numerous shorthand methods, etc., you really only need to
 * override 3 core functions (`trustAs`, `getTrusted` and `valueOf`) to replace the way things
 * work because `$sce` delegates to `$sceDelegate` for these operations.
 *
 * Refer {@link ng.$sceDelegateProvider $sceDelegateProvider} to configure this service.
 *
 * The default instance of `$sceDelegate` should work out of the box with little pain.  While you
 * can override it completely to change the behavior of `$sce`, the common case would
 * involve configuring the {@link ng.$sceDelegateProvider $sceDelegateProvider} instead by setting
 * your own whitelists and blacklists for trusting URLs used for loading AngularJS resources such as
 * templates.  Refer {@link ng.$sceDelegateProvider#resourceUrlWhitelist
 * $sceDelegateProvider.resourceUrlWhitelist} and {@link
 * ng.$sceDelegateProvider#resourceUrlBlacklist $sceDelegateProvider.resourceUrlBlacklist}
 */
/**
 * @ngdoc provider
 * @name $sceDelegateProvider
 * @this
 *
 * @description
 *
 * The `$sceDelegateProvider` provider allows developers to configure the {@link ng.$sceDelegate
 * $sceDelegate service}, used as a delegate for {@link ng.$sce Strict Contextual Escaping (SCE)}.
 *
 * The `$sceDelegateProvider` allows one to get/set the whitelists and blacklists used to ensure
 * that the URLs used for sourcing AngularJS templates and other script-running URLs are safe (all
 * places that use the `$sce.RESOURCE_URL` context). See
 * {@link ng.$sceDelegateProvider#resourceUrlWhitelist $sceDelegateProvider.resourceUrlWhitelist}
 * and
 * {@link ng.$sceDelegateProvider#resourceUrlBlacklist $sceDelegateProvider.resourceUrlBlacklist},
 *
 * For the general details about this service in Angular, read the main page for {@link ng.$sce
 * Strict Contextual Escaping (SCE)}.
 *
 * **Example**:  Consider the following case. <a name="example"></a>
 *
 * - your app is hosted at url `http://myapp.example.com/`
 * - but some of your templates are hosted on other domains you control such as
 *   `http://srv01.assets.example.com/`, `http://srv02.assets.example.com/`, etc.
 * - and you have an open redirect at `http://myapp.example.com/clickThru?...`.
 *
 * Here is what a secure configuration for this scenario might look like:
 *
 * ```
 *  angular.module('myApp', []).config(function($sceDelegateProvider) {
 *    $sceDelegateProvider.resourceUrlWhitelist([
 *      // Allow same origin resource loads.
 *      'self',
 *      // Allow loading from our assets domain.  Notice the difference between * and **.
 *      'http://srv*.assets.example.com/**'
 *    ]);
 *
 *    // The blacklist overrides the whitelist so the open redirect here is blocked.
 *    $sceDelegateProvider.resourceUrlBlacklist([
 *      'http://myapp.example.com/clickThru**'
 *    ]);
 *  });
 * ```
 * Note that an empty whitelist will block every resource URL from being loaded, and will require
 * you to manually mark each one as trusted with `$sce.trustAsResourceUrl`. However, templates
 * requested by {@link ng.$templateRequest $templateRequest} that are present in
 * {@link ng.$templateCache $templateCache} will not go through this check. If you have a mechanism
 * to populate your templates in that cache at config time, then it is a good idea to remove 'self'
 * from that whitelist. This helps to mitigate the security impact of certain types of issues, like
 * for instance attacker-controlled `ng-includes`.
 */
function $SceDelegateProvider(){this.SCE_CONTEXTS=SCE_CONTEXTS;
// Resource URLs can also be trusted by policy.
var resourceUrlWhitelist=["self"],resourceUrlBlacklist=[];/**
   * @ngdoc method
   * @name $sceDelegateProvider#resourceUrlWhitelist
   * @kind function
   *
   * @param {Array=} whitelist When provided, replaces the resourceUrlWhitelist with the value
   *     provided.  This must be an array or null.  A snapshot of this array is used so further
   *     changes to the array are ignored.
   *     Follow {@link ng.$sce#resourceUrlPatternItem this link} for a description of the items
   *     allowed in this array.
   *
   * @return {Array} The currently set whitelist array.
   *
   * @description
   * Sets/Gets the whitelist of trusted resource URLs.
   *
   * The **default value** when no whitelist has been explicitly set is `['self']` allowing only
   * same origin resource requests.
   *
   * <div class="alert alert-warning">
   * **Note:** the default whitelist of 'self' is not recommended if your app shares its origin
   * with other apps! It is a good idea to limit it to only your application's directory.
   * </div>
   */
this.resourceUrlWhitelist=function(value){return arguments.length&&(resourceUrlWhitelist=adjustMatchers(value)),resourceUrlWhitelist},/**
   * @ngdoc method
   * @name $sceDelegateProvider#resourceUrlBlacklist
   * @kind function
   *
   * @param {Array=} blacklist When provided, replaces the resourceUrlBlacklist with the value
   *     provided.  This must be an array or null.  A snapshot of this array is used so further
   *     changes to the array are ignored.</p><p>
   *     Follow {@link ng.$sce#resourceUrlPatternItem this link} for a description of the items
   *     allowed in this array.</p><p>
   *     The typical usage for the blacklist is to **block
   *     [open redirects](http://cwe.mitre.org/data/definitions/601.html)** served by your domain as
   *     these would otherwise be trusted but actually return content from the redirected domain.
   *     </p><p>
   *     Finally, **the blacklist overrides the whitelist** and has the final say.
   *
   * @return {Array} The currently set blacklist array.
   *
   * @description
   * Sets/Gets the blacklist of trusted resource URLs.
   *
   * The **default value** when no whitelist has been explicitly set is the empty array (i.e. there
   * is no blacklist.)
   */
this.resourceUrlBlacklist=function(value){return arguments.length&&(resourceUrlBlacklist=adjustMatchers(value)),resourceUrlBlacklist},this.$get=["$injector",function($injector){function matchUrl(matcher,parsedUrl){return"self"===matcher?urlIsSameOrigin(parsedUrl):!!matcher.exec(parsedUrl.href)}function isResourceUrlAllowedByPolicy(url){var i,n,parsedUrl=urlResolve(url.toString()),allowed=!1;
// Ensure that at least one item from the whitelist allows this url.
for(i=0,n=resourceUrlWhitelist.length;i<n;i++)if(matchUrl(resourceUrlWhitelist[i],parsedUrl)){allowed=!0;break}if(allowed)
// Ensure that no item from the blacklist blocked this url.
for(i=0,n=resourceUrlBlacklist.length;i<n;i++)if(matchUrl(resourceUrlBlacklist[i],parsedUrl)){allowed=!1;break}return allowed}function generateHolderType(Base){var holderType=function(trustedValue){this.$$unwrapTrustedValue=function(){return trustedValue}};return Base&&(holderType.prototype=new Base),holderType.prototype.valueOf=function(){return this.$$unwrapTrustedValue()},holderType.prototype.toString=function(){return this.$$unwrapTrustedValue().toString()},holderType}/**
     * @ngdoc method
     * @name $sceDelegate#trustAs
     *
     * @description
     * Returns a trusted representation of the parameter for the specified context. This trusted
     * object will later on be used as-is, without any security check, by bindings or directives
     * that require this security context.
     * For instance, marking a string as trusted for the `$sce.HTML` context will entirely bypass
     * the potential `$sanitize` call in corresponding `$sce.HTML` bindings or directives, such as
     * `ng-bind-html`. Note that in most cases you won't need to call this function: if you have the
     * sanitizer loaded, passing the value itself will render all the HTML that does not pose a
     * security risk.
     *
     * See {@link ng.$sceDelegate#getTrusted getTrusted} for the function that will consume those
     * trusted values, and {@link ng.$sce $sce} for general documentation about strict contextual
     * escaping.
     *
     * @param {string} type The context in which this value is safe for use, e.g. `$sce.URL`,
     *     `$sce.RESOURCE_URL`, `$sce.HTML`, `$sce.JS` or `$sce.CSS`.
     *
     * @param {*} value The value that should be considered trusted.
     * @return {*} A trusted representation of value, that can be used in the given context.
     */
function trustAs(type,trustedValue){var Constructor=byType.hasOwnProperty(type)?byType[type]:null;if(!Constructor)throw $sceMinErr("icontext","Attempted to trust a value in invalid context. Context: {0}; Value: {1}",type,trustedValue);if(null===trustedValue||isUndefined(trustedValue)||""===trustedValue)return trustedValue;
// All the current contexts in SCE_CONTEXTS happen to be strings.  In order to avoid trusting
// mutable objects, we ensure here that the value passed in is actually a string.
if("string"!=typeof trustedValue)throw $sceMinErr("itype","Attempted to trust a non-string value in a content requiring a string: Context: {0}",type);return new Constructor(trustedValue)}/**
     * @ngdoc method
     * @name $sceDelegate#valueOf
     *
     * @description
     * If the passed parameter had been returned by a prior call to {@link ng.$sceDelegate#trustAs
     * `$sceDelegate.trustAs`}, returns the value that had been passed to {@link
     * ng.$sceDelegate#trustAs `$sceDelegate.trustAs`}.
     *
     * If the passed parameter is not a value that had been returned by {@link
     * ng.$sceDelegate#trustAs `$sceDelegate.trustAs`}, it must be returned as-is.
     *
     * @param {*} value The result of a prior {@link ng.$sceDelegate#trustAs `$sceDelegate.trustAs`}
     *     call or anything else.
     * @return {*} The `value` that was originally provided to {@link ng.$sceDelegate#trustAs
     *     `$sceDelegate.trustAs`} if `value` is the result of such a call.  Otherwise, returns
     *     `value` unchanged.
     */
function valueOf(maybeTrusted){return maybeTrusted instanceof trustedValueHolderBase?maybeTrusted.$$unwrapTrustedValue():maybeTrusted}/**
     * @ngdoc method
     * @name $sceDelegate#getTrusted
     *
     * @description
     * Takes any input, and either returns a value that's safe to use in the specified context, or
     * throws an exception.
     *
     * In practice, there are several cases. When given a string, this function runs checks
     * and sanitization to make it safe without prior assumptions. When given the result of a {@link
     * ng.$sceDelegate#trustAs `$sceDelegate.trustAs`} call, it returns the originally supplied
     * value if that value's context is valid for this call's context. Finally, this function can
     * also throw when there is no way to turn `maybeTrusted` in a safe value (e.g., no sanitization
     * is available or possible.)
     *
     * @param {string} type The context in which this value is to be used (such as `$sce.HTML`).
     * @param {*} maybeTrusted The result of a prior {@link ng.$sceDelegate#trustAs
     *     `$sceDelegate.trustAs`} call, or anything else (which will not be considered trusted.)
     * @return {*} A version of the value that's safe to use in the given context, or throws an
     *     exception if this is impossible.
     */
function getTrusted(type,maybeTrusted){if(null===maybeTrusted||isUndefined(maybeTrusted)||""===maybeTrusted)return maybeTrusted;var constructor=byType.hasOwnProperty(type)?byType[type]:null;
// If maybeTrusted is a trusted class instance or subclass instance, then unwrap and return
// as-is.
if(constructor&&maybeTrusted instanceof constructor)return maybeTrusted.$$unwrapTrustedValue();
// Otherwise, if we get here, then we may either make it safe, or throw an exception. This
// depends on the context: some are sanitizatible (HTML), some use whitelists (RESOURCE_URL),
// some are impossible to do (JS). This step isn't implemented for CSS and URL, as AngularJS
// has no corresponding sinks.
if(type===SCE_CONTEXTS.RESOURCE_URL){
// RESOURCE_URL uses a whitelist.
if(isResourceUrlAllowedByPolicy(maybeTrusted))return maybeTrusted;throw $sceMinErr("insecurl","Blocked loading resource from url not allowed by $sceDelegate policy.  URL: {0}",maybeTrusted.toString())}if(type===SCE_CONTEXTS.HTML)
// htmlSanitizer throws its own error when no sanitizer is available.
return htmlSanitizer(maybeTrusted);
// Default error when the $sce service has no way to make the input safe.
throw $sceMinErr("unsafe","Attempting to use an unsafe value in a safe context.")}var htmlSanitizer=function(html){throw $sceMinErr("unsafe","Attempting to use an unsafe value in a safe context.")};$injector.has("$sanitize")&&(htmlSanitizer=$injector.get("$sanitize"));var trustedValueHolderBase=generateHolderType(),byType={};return byType[SCE_CONTEXTS.HTML]=generateHolderType(trustedValueHolderBase),byType[SCE_CONTEXTS.CSS]=generateHolderType(trustedValueHolderBase),byType[SCE_CONTEXTS.URL]=generateHolderType(trustedValueHolderBase),byType[SCE_CONTEXTS.JS]=generateHolderType(trustedValueHolderBase),byType[SCE_CONTEXTS.RESOURCE_URL]=generateHolderType(byType[SCE_CONTEXTS.URL]),{trustAs:trustAs,getTrusted:getTrusted,valueOf:valueOf}}]}/**
 * @ngdoc provider
 * @name $sceProvider
 * @this
 *
 * @description
 *
 * The $sceProvider provider allows developers to configure the {@link ng.$sce $sce} service.
 * -   enable/disable Strict Contextual Escaping (SCE) in a module
 * -   override the default implementation with a custom delegate
 *
 * Read more about {@link ng.$sce Strict Contextual Escaping (SCE)}.
 */
/**
 * @ngdoc service
 * @name $sce
 * @kind function
 *
 * @description
 *
 * `$sce` is a service that provides Strict Contextual Escaping services to AngularJS.
 *
 * # Strict Contextual Escaping
 *
 * Strict Contextual Escaping (SCE) is a mode in which AngularJS constrains bindings to only render
 * trusted values. Its goal is to assist in writing code in a way that (a) is secure by default, and
 * (b) makes auditing for security vulnerabilities such as XSS, clickjacking, etc. a lot easier.
 *
 * ## Overview
 *
 * To systematically block XSS security bugs, AngularJS treats all values as untrusted by default in
 * HTML or sensitive URL bindings. When binding untrusted values, AngularJS will automatically
 * run security checks on them (sanitizations, whitelists, depending on context), or throw when it
 * cannot guarantee the security of the result. That behavior depends strongly on contexts: HTML
 * can be sanitized, but template URLs cannot, for instance.
 *
 * To illustrate this, consider the `ng-bind-html` directive. It renders its value directly as HTML:
 * we call that the *context*. When given an untrusted input, AngularJS will attempt to sanitize it
 * before rendering if a sanitizer is available, and throw otherwise. To bypass sanitization and
 * render the input as-is, you will need to mark it as trusted for that context before attempting
 * to bind it.
 *
 * As of version 1.2, AngularJS ships with SCE enabled by default.
 *
 * ## In practice
 *
 * Here's an example of a binding in a privileged context:
 *
 * ```
 * <input ng-model="userHtml" aria-label="User input">
 * <div ng-bind-html="userHtml"></div>
 * ```
 *
 * Notice that `ng-bind-html` is bound to `userHtml` controlled by the user.  With SCE
 * disabled, this application allows the user to render arbitrary HTML into the DIV, which would
 * be an XSS security bug. In a more realistic example, one may be rendering user comments, blog
 * articles, etc. via bindings. (HTML is just one example of a context where rendering user
 * controlled input creates security vulnerabilities.)
 *
 * For the case of HTML, you might use a library, either on the client side, or on the server side,
 * to sanitize unsafe HTML before binding to the value and rendering it in the document.
 *
 * How would you ensure that every place that used these types of bindings was bound to a value that
 * was sanitized by your library (or returned as safe for rendering by your server?)  How can you
 * ensure that you didn't accidentally delete the line that sanitized the value, or renamed some
 * properties/fields and forgot to update the binding to the sanitized value?
 *
 * To be secure by default, AngularJS makes sure bindings go through that sanitization, or
 * any similar validation process, unless there's a good reason to trust the given value in this
 * context.  That trust is formalized with a function call. This means that as a developer, you
 * can assume all untrusted bindings are safe. Then, to audit your code for binding security issues,
 * you just need to ensure the values you mark as trusted indeed are safe - because they were
 * received from your server, sanitized by your library, etc. You can organize your codebase to
 * help with this - perhaps allowing only the files in a specific directory to do this.
 * Ensuring that the internal API exposed by that code doesn't markup arbitrary values as safe then
 * becomes a more manageable task.
 *
 * In the case of AngularJS' SCE service, one uses {@link ng.$sce#trustAs $sce.trustAs}
 * (and shorthand methods such as {@link ng.$sce#trustAsHtml $sce.trustAsHtml}, etc.) to
 * build the trusted versions of your values.
 *
 * ## How does it work?
 *
 * In privileged contexts, directives and code will bind to the result of {@link ng.$sce#getTrusted
 * $sce.getTrusted(context, value)} rather than to the value directly.  Think of this function as
 * a way to enforce the required security context in your data sink. Directives use {@link
 * ng.$sce#parseAs $sce.parseAs} rather than `$parse` to watch attribute bindings, which performs
 * the {@link ng.$sce#getTrusted $sce.getTrusted} behind the scenes on non-constant literals. Also,
 * when binding without directives, AngularJS will understand the context of your bindings
 * automatically.
 *
 * As an example, {@link ng.directive:ngBindHtml ngBindHtml} uses {@link
 * ng.$sce#parseAsHtml $sce.parseAsHtml(binding expression)}.  Here's the actual code (slightly
 * simplified):
 *
 * ```
 * var ngBindHtmlDirective = ['$sce', function($sce) {
 *   return function(scope, element, attr) {
 *     scope.$watch($sce.parseAsHtml(attr.ngBindHtml), function(value) {
 *       element.html(value || '');
 *     });
 *   };
 * }];
 * ```
 *
 * ## Impact on loading templates
 *
 * This applies both to the {@link ng.directive:ngInclude `ng-include`} directive as well as
 * `templateUrl`'s specified by {@link guide/directive directives}.
 *
 * By default, Angular only loads templates from the same domain and protocol as the application
 * document.  This is done by calling {@link ng.$sce#getTrustedResourceUrl
 * $sce.getTrustedResourceUrl} on the template URL.  To load templates from other domains and/or
 * protocols, you may either {@link ng.$sceDelegateProvider#resourceUrlWhitelist whitelist
 * them} or {@link ng.$sce#trustAsResourceUrl wrap it} into a trusted value.
 *
 * *Please note*:
 * The browser's
 * [Same Origin Policy](https://code.google.com/p/browsersec/wiki/Part2#Same-origin_policy_for_XMLHttpRequest)
 * and [Cross-Origin Resource Sharing (CORS)](http://www.w3.org/TR/cors/)
 * policy apply in addition to this and may further restrict whether the template is successfully
 * loaded.  This means that without the right CORS policy, loading templates from a different domain
 * won't work on all browsers.  Also, loading templates from `file://` URL does not work on some
 * browsers.
 *
 * ## This feels like too much overhead
 *
 * It's important to remember that SCE only applies to interpolation expressions.
 *
 * If your expressions are constant literals, they're automatically trusted and you don't need to
 * call `$sce.trustAs` on them (e.g.
 * `<div ng-bind-html="'<b>implicitly trusted</b>'"></div>`) just works. The `$sceDelegate` will
 * also use the `$sanitize` service if it is available when binding untrusted values to
 * `$sce.HTML` context. AngularJS provides an implementation in `angular-sanitize.js`, and if you
 * wish to use it, you will also need to depend on the {@link ngSanitize `ngSanitize`} module in
 * your application.
 *
 * The included {@link ng.$sceDelegate $sceDelegate} comes with sane defaults to allow you to load
 * templates in `ng-include` from your application's domain without having to even know about SCE.
 * It blocks loading templates from other domains or loading templates over http from an https
 * served document.  You can change these by setting your own custom {@link
 * ng.$sceDelegateProvider#resourceUrlWhitelist whitelists} and {@link
 * ng.$sceDelegateProvider#resourceUrlBlacklist blacklists} for matching such URLs.
 *
 * This significantly reduces the overhead.  It is far easier to pay the small overhead and have an
 * application that's secure and can be audited to verify that with much more ease than bolting
 * security onto an application later.
 *
 * <a name="contexts"></a>
 * ## What trusted context types are supported?
 *
 * | Context             | Notes          |
 * |---------------------|----------------|
 * | `$sce.HTML`         | For HTML that's safe to source into the application.  The {@link ng.directive:ngBindHtml ngBindHtml} directive uses this context for bindings. If an unsafe value is encountered, and the {@link ngSanitize.$sanitize $sanitize} service is available (implemented by the {@link ngSanitize ngSanitize} module) this will sanitize the value instead of throwing an error. |
 * | `$sce.CSS`          | For CSS that's safe to source into the application.  Currently, no bindings require this context. Feel free to use it in your own directives. |
 * | `$sce.URL`          | For URLs that are safe to follow as links.  Currently unused (`<a href=`, `<img src=`, and some others sanitize their urls and don't constitute an SCE context.) |
 * | `$sce.RESOURCE_URL` | For URLs that are not only safe to follow as links, but whose contents are also safe to include in your application.  Examples include `ng-include`, `src` / `ngSrc` bindings for tags other than `IMG`, `VIDEO`, `AUDIO`, `SOURCE`, and `TRACK` (e.g. `IFRAME`, `OBJECT`, etc.)  <br><br>Note that `$sce.RESOURCE_URL` makes a stronger statement about the URL than `$sce.URL` does (it's not just the URL that matters, but also what is at the end of it), and therefore contexts requiring values trusted for `$sce.RESOURCE_URL` can be used anywhere that values trusted for `$sce.URL` are required. |
 * | `$sce.JS`           | For JavaScript that is safe to execute in your application's context.  Currently, no bindings require this context.  Feel free to use it in your own directives. |
 *
 *
 * Be aware that `a[href]` and `img[src]` automatically sanitize their URLs and do not pass them
 * through {@link ng.$sce#getTrusted $sce.getTrusted}. There's no CSS-, URL-, or JS-context bindings
 * in AngularJS currently, so their corresponding `$sce.trustAs` functions aren't useful yet. This
 * might evolve.
 *
 * ## Format of items in {@link ng.$sceDelegateProvider#resourceUrlWhitelist resourceUrlWhitelist}/{@link ng.$sceDelegateProvider#resourceUrlBlacklist Blacklist} <a name="resourceUrlPatternItem"></a>
 *
 *  Each element in these arrays must be one of the following:
 *
 *  - **'self'**
 *    - The special **string**, `'self'`, can be used to match against all URLs of the **same
 *      domain** as the application document using the **same protocol**.
 *  - **String** (except the special value `'self'`)
 *    - The string is matched against the full *normalized / absolute URL* of the resource
 *      being tested (substring matches are not good enough.)
 *    - There are exactly **two wildcard sequences** - `*` and `**`.  All other characters
 *      match themselves.
 *    - `*`: matches zero or more occurrences of any character other than one of the following 6
 *      characters: '`:`', '`/`', '`.`', '`?`', '`&`' and '`;`'.  It's a useful wildcard for use
 *      in a whitelist.
 *    - `**`: matches zero or more occurrences of *any* character.  As such, it's not
 *      appropriate for use in a scheme, domain, etc. as it would match too much.  (e.g.
 *      http://**.example.com/ would match http://evil.com/?ignore=.example.com/ and that might
 *      not have been the intention.)  Its usage at the very end of the path is ok.  (e.g.
 *      http://foo.example.com/templates/**).
 *  - **RegExp** (*see caveat below*)
 *    - *Caveat*:  While regular expressions are powerful and offer great flexibility,  their syntax
 *      (and all the inevitable escaping) makes them *harder to maintain*.  It's easy to
 *      accidentally introduce a bug when one updates a complex expression (imho, all regexes should
 *      have good test coverage).  For instance, the use of `.` in the regex is correct only in a
 *      small number of cases.  A `.` character in the regex used when matching the scheme or a
 *      subdomain could be matched against a `:` or literal `.` that was likely not intended.   It
 *      is highly recommended to use the string patterns and only fall back to regular expressions
 *      as a last resort.
 *    - The regular expression must be an instance of RegExp (i.e. not a string.)  It is
 *      matched against the **entire** *normalized / absolute URL* of the resource being tested
 *      (even when the RegExp did not have the `^` and `$` codes.)  In addition, any flags
 *      present on the RegExp (such as multiline, global, ignoreCase) are ignored.
 *    - If you are generating your JavaScript from some other templating engine (not
 *      recommended, e.g. in issue [#4006](https://github.com/angular/angular.js/issues/4006)),
 *      remember to escape your regular expression (and be aware that you might need more than
 *      one level of escaping depending on your templating engine and the way you interpolated
 *      the value.)  Do make use of your platform's escaping mechanism as it might be good
 *      enough before coding your own.  E.g. Ruby has
 *      [Regexp.escape(str)](http://www.ruby-doc.org/core-2.0.0/Regexp.html#method-c-escape)
 *      and Python has [re.escape](http://docs.python.org/library/re.html#re.escape).
 *      Javascript lacks a similar built in function for escaping.  Take a look at Google
 *      Closure library's [goog.string.regExpEscape(s)](
 *      http://docs.closure-library.googlecode.com/git/closure_goog_string_string.js.source.html#line962).
 *
 * Refer {@link ng.$sceDelegateProvider $sceDelegateProvider} for an example.
 *
 * ## Show me an example using SCE.
 *
 * <example module="mySceApp" deps="angular-sanitize.js" name="sce-service">
 * <file name="index.html">
 *   <div ng-controller="AppController as myCtrl">
 *     <i ng-bind-html="myCtrl.explicitlyTrustedHtml" id="explicitlyTrustedHtml"></i><br><br>
 *     <b>User comments</b><br>
 *     By default, HTML that isn't explicitly trusted (e.g. Alice's comment) is sanitized when
 *     $sanitize is available.  If $sanitize isn't available, this results in an error instead of an
 *     exploit.
 *     <div class="well">
 *       <div ng-repeat="userComment in myCtrl.userComments">
 *         <b>{{userComment.name}}</b>:
 *         <span ng-bind-html="userComment.htmlComment" class="htmlComment"></span>
 *         <br>
 *       </div>
 *     </div>
 *   </div>
 * </file>
 *
 * <file name="script.js">
 *   angular.module('mySceApp', ['ngSanitize'])
 *     .controller('AppController', ['$http', '$templateCache', '$sce',
 *       function AppController($http, $templateCache, $sce) {
 *         var self = this;
 *         $http.get('test_data.json', {cache: $templateCache}).then(function(response) {
 *           self.userComments = response.data;
 *         });
 *         self.explicitlyTrustedHtml = $sce.trustAsHtml(
 *             '<span onmouseover="this.textContent=&quot;Explicitly trusted HTML bypasses ' +
 *             'sanitization.&quot;">Hover over this text.</span>');
 *       }]);
 * </file>
 *
 * <file name="test_data.json">
 * [
 *   { "name": "Alice",
 *     "htmlComment":
 *         "<span onmouseover='this.textContent=\"PWN3D!\"'>Is <i>anyone</i> reading this?</span>"
 *   },
 *   { "name": "Bob",
 *     "htmlComment": "<i>Yes!</i>  Am I the only other one?"
 *   }
 * ]
 * </file>
 *
 * <file name="protractor.js" type="protractor">
 *   describe('SCE doc demo', function() {
 *     it('should sanitize untrusted values', function() {
 *       expect(element.all(by.css('.htmlComment')).first().getAttribute('innerHTML'))
 *           .toBe('<span>Is <i>anyone</i> reading this?</span>');
 *     });
 *
 *     it('should NOT sanitize explicitly trusted values', function() {
 *       expect(element(by.id('explicitlyTrustedHtml')).getAttribute('innerHTML')).toBe(
 *           '<span onmouseover="this.textContent=&quot;Explicitly trusted HTML bypasses ' +
 *           'sanitization.&quot;">Hover over this text.</span>');
 *     });
 *   });
 * </file>
 * </example>
 *
 *
 *
 * ## Can I disable SCE completely?
 *
 * Yes, you can.  However, this is strongly discouraged.  SCE gives you a lot of security benefits
 * for little coding overhead.  It will be much harder to take an SCE disabled application and
 * either secure it on your own or enable SCE at a later stage.  It might make sense to disable SCE
 * for cases where you have a lot of existing code that was written before SCE was introduced and
 * you're migrating them a module at a time. Also do note that this is an app-wide setting, so if
 * you are writing a library, you will cause security bugs applications using it.
 *
 * That said, here's how you can completely disable SCE:
 *
 * ```
 * angular.module('myAppWithSceDisabledmyApp', []).config(function($sceProvider) {
 *   // Completely disable SCE.  For demonstration purposes only!
 *   // Do not use in new projects or libraries.
 *   $sceProvider.enabled(false);
 * });
 * ```
 *
 */
function $SceProvider(){var enabled=!0;/**
   * @ngdoc method
   * @name $sceProvider#enabled
   * @kind function
   *
   * @param {boolean=} value If provided, then enables/disables SCE application-wide.
   * @return {boolean} True if SCE is enabled, false otherwise.
   *
   * @description
   * Enables/disables SCE and returns the current value.
   */
this.enabled=function(value){return arguments.length&&(enabled=!!value),enabled},/* Design notes on the default implementation for SCE.
   *
   * The API contract for the SCE delegate
   * -------------------------------------
   * The SCE delegate object must provide the following 3 methods:
   *
   * - trustAs(contextEnum, value)
   *     This method is used to tell the SCE service that the provided value is OK to use in the
   *     contexts specified by contextEnum.  It must return an object that will be accepted by
   *     getTrusted() for a compatible contextEnum and return this value.
   *
   * - valueOf(value)
   *     For values that were not produced by trustAs(), return them as is.  For values that were
   *     produced by trustAs(), return the corresponding input value to trustAs.  Basically, if
   *     trustAs is wrapping the given values into some type, this operation unwraps it when given
   *     such a value.
   *
   * - getTrusted(contextEnum, value)
   *     This function should return the a value that is safe to use in the context specified by
   *     contextEnum or throw and exception otherwise.
   *
   * NOTE: This contract deliberately does NOT state that values returned by trustAs() must be
   * opaque or wrapped in some holder object.  That happens to be an implementation detail.  For
   * instance, an implementation could maintain a registry of all trusted objects by context.  In
   * such a case, trustAs() would return the same object that was passed in.  getTrusted() would
   * return the same object passed in if it was found in the registry under a compatible context or
   * throw an exception otherwise.  An implementation might only wrap values some of the time based
   * on some criteria.  getTrusted() might return a value and not throw an exception for special
   * constants or objects even if not wrapped.  All such implementations fulfill this contract.
   *
   *
   * A note on the inheritance model for SCE contexts
   * ------------------------------------------------
   * I've used inheritance and made RESOURCE_URL wrapped types a subtype of URL wrapped types.  This
   * is purely an implementation details.
   *
   * The contract is simply this:
   *
   *     getTrusted($sce.RESOURCE_URL, value) succeeding implies that getTrusted($sce.URL, value)
   *     will also succeed.
   *
   * Inheritance happens to capture this in a natural way. In some future, we may not use
   * inheritance anymore. That is OK because no code outside of sce.js and sceSpecs.js would need to
   * be aware of this detail.
   */
this.$get=["$parse","$sceDelegate",function($parse,$sceDelegate){
// Support: IE 9-11 only
// Prereq: Ensure that we're not running in IE<11 quirks mode.  In that mode, IE < 11 allow
// the "expression(javascript expression)" syntax which is insecure.
if(enabled&&msie<8)throw $sceMinErr("iequirks","Strict Contextual Escaping does not support Internet Explorer version < 11 in quirks mode.  You can fix this by adding the text <!doctype html> to the top of your HTML document.  See http://docs.angularjs.org/api/ng.$sce for more information.");var sce=shallowCopy(SCE_CONTEXTS);/**
     * @ngdoc method
     * @name $sce#isEnabled
     * @kind function
     *
     * @return {Boolean} True if SCE is enabled, false otherwise.  If you want to set the value, you
     *     have to do it at module config time on {@link ng.$sceProvider $sceProvider}.
     *
     * @description
     * Returns a boolean indicating if SCE is enabled.
     */
sce.isEnabled=function(){return enabled},sce.trustAs=$sceDelegate.trustAs,sce.getTrusted=$sceDelegate.getTrusted,sce.valueOf=$sceDelegate.valueOf,enabled||(sce.trustAs=sce.getTrusted=function(type,value){return value},sce.valueOf=identity),/**
     * @ngdoc method
     * @name $sce#parseAs
     *
     * @description
     * Converts Angular {@link guide/expression expression} into a function.  This is like {@link
     * ng.$parse $parse} and is identical when the expression is a literal constant.  Otherwise, it
     * wraps the expression in a call to {@link ng.$sce#getTrusted $sce.getTrusted(*type*,
     * *result*)}
     *
     * @param {string} type The SCE context in which this result will be used.
     * @param {string} expression String expression to compile.
     * @return {function(context, locals)} A function which represents the compiled expression:
     *
     *    * `context` – `{object}` – an object against which any expressions embedded in the
     *      strings are evaluated against (typically a scope object).
     *    * `locals` – `{object=}` – local variables context object, useful for overriding values
     *      in `context`.
     */
sce.parseAs=function(type,expr){var parsed=$parse(expr);return parsed.literal&&parsed.constant?parsed:$parse(expr,function(value){return sce.getTrusted(type,value)})};/**
     * @ngdoc method
     * @name $sce#trustAs
     *
     * @description
     * Delegates to {@link ng.$sceDelegate#trustAs `$sceDelegate.trustAs`}. As such, returns a
     * wrapped object that represents your value, and the trust you have in its safety for the given
     * context. AngularJS can then use that value as-is in bindings of the specified secure context.
     * This is used in bindings for `ng-bind-html`, `ng-include`, and most `src` attribute
     * interpolations. See {@link ng.$sce $sce} for strict contextual escaping.
     *
     * @param {string} type The context in which this value is safe for use, e.g. `$sce.URL`,
     *     `$sce.RESOURCE_URL`, `$sce.HTML`, `$sce.JS` or `$sce.CSS`.
     *
     * @param {*} value The value that that should be considered trusted.
     * @return {*} A wrapped version of value that can be used as a trusted variant of your `value`
     *     in the context you specified.
     */
/**
     * @ngdoc method
     * @name $sce#trustAsHtml
     *
     * @description
     * Shorthand method.  `$sce.trustAsHtml(value)` →
     *     {@link ng.$sceDelegate#trustAs `$sceDelegate.trustAs($sce.HTML, value)`}
     *
     * @param {*} value The value to mark as trusted for `$sce.HTML` context.
     * @return {*} A wrapped version of value that can be used as a trusted variant of your `value`
     *     in `$sce.HTML` context (like `ng-bind-html`).
     */
/**
     * @ngdoc method
     * @name $sce#trustAsCss
     *
     * @description
     * Shorthand method.  `$sce.trustAsCss(value)` →
     *     {@link ng.$sceDelegate#trustAs `$sceDelegate.trustAs($sce.CSS, value)`}
     *
     * @param {*} value The value to mark as trusted for `$sce.CSS` context.
     * @return {*} A wrapped version of value that can be used as a trusted variant
     *     of your `value` in `$sce.CSS` context. This context is currently unused, so there are
     *     almost no reasons to use this function so far.
     */
/**
     * @ngdoc method
     * @name $sce#trustAsUrl
     *
     * @description
     * Shorthand method.  `$sce.trustAsUrl(value)` →
     *     {@link ng.$sceDelegate#trustAs `$sceDelegate.trustAs($sce.URL, value)`}
     *
     * @param {*} value The value to mark as trusted for `$sce.URL` context.
     * @return {*} A wrapped version of value that can be used as a trusted variant of your `value`
     *     in `$sce.URL` context. That context is currently unused, so there are almost no reasons
     *     to use this function so far.
     */
/**
     * @ngdoc method
     * @name $sce#trustAsResourceUrl
     *
     * @description
     * Shorthand method.  `$sce.trustAsResourceUrl(value)` →
     *     {@link ng.$sceDelegate#trustAs `$sceDelegate.trustAs($sce.RESOURCE_URL, value)`}
     *
     * @param {*} value The value to mark as trusted for `$sce.RESOURCE_URL` context.
     * @return {*} A wrapped version of value that can be used as a trusted variant of your `value`
     *     in `$sce.RESOURCE_URL` context (template URLs in `ng-include`, most `src` attribute
     *     bindings, ...)
     */
/**
     * @ngdoc method
     * @name $sce#trustAsJs
     *
     * @description
     * Shorthand method.  `$sce.trustAsJs(value)` →
     *     {@link ng.$sceDelegate#trustAs `$sceDelegate.trustAs($sce.JS, value)`}
     *
     * @param {*} value The value to mark as trusted for `$sce.JS` context.
     * @return {*} A wrapped version of value that can be used as a trusted variant of your `value`
     *     in `$sce.JS` context. That context is currently unused, so there are almost no reasons to
     *     use this function so far.
     */
/**
     * @ngdoc method
     * @name $sce#getTrusted
     *
     * @description
     * Delegates to {@link ng.$sceDelegate#getTrusted `$sceDelegate.getTrusted`}.  As such,
     * takes any input, and either returns a value that's safe to use in the specified context,
     * or throws an exception. This function is aware of trusted values created by the `trustAs`
     * function and its shorthands, and when contexts are appropriate, returns the unwrapped value
     * as-is. Finally, this function can also throw when there is no way to turn `maybeTrusted` in a
     * safe value (e.g., no sanitization is available or possible.)
     *
     * @param {string} type The context in which this value is to be used.
     * @param {*} maybeTrusted The result of a prior {@link ng.$sce#trustAs
     *     `$sce.trustAs`} call, or anything else (which will not be considered trusted.)
     * @return {*} A version of the value that's safe to use in the given context, or throws an
     *     exception if this is impossible.
     */
/**
     * @ngdoc method
     * @name $sce#getTrustedHtml
     *
     * @description
     * Shorthand method.  `$sce.getTrustedHtml(value)` →
     *     {@link ng.$sceDelegate#getTrusted `$sceDelegate.getTrusted($sce.HTML, value)`}
     *
     * @param {*} value The value to pass to `$sce.getTrusted`.
     * @return {*} The return value of `$sce.getTrusted($sce.HTML, value)`
     */
/**
     * @ngdoc method
     * @name $sce#getTrustedCss
     *
     * @description
     * Shorthand method.  `$sce.getTrustedCss(value)` →
     *     {@link ng.$sceDelegate#getTrusted `$sceDelegate.getTrusted($sce.CSS, value)`}
     *
     * @param {*} value The value to pass to `$sce.getTrusted`.
     * @return {*} The return value of `$sce.getTrusted($sce.CSS, value)`
     */
/**
     * @ngdoc method
     * @name $sce#getTrustedUrl
     *
     * @description
     * Shorthand method.  `$sce.getTrustedUrl(value)` →
     *     {@link ng.$sceDelegate#getTrusted `$sceDelegate.getTrusted($sce.URL, value)`}
     *
     * @param {*} value The value to pass to `$sce.getTrusted`.
     * @return {*} The return value of `$sce.getTrusted($sce.URL, value)`
     */
/**
     * @ngdoc method
     * @name $sce#getTrustedResourceUrl
     *
     * @description
     * Shorthand method.  `$sce.getTrustedResourceUrl(value)` →
     *     {@link ng.$sceDelegate#getTrusted `$sceDelegate.getTrusted($sce.RESOURCE_URL, value)`}
     *
     * @param {*} value The value to pass to `$sceDelegate.getTrusted`.
     * @return {*} The return value of `$sce.getTrusted($sce.RESOURCE_URL, value)`
     */
/**
     * @ngdoc method
     * @name $sce#getTrustedJs
     *
     * @description
     * Shorthand method.  `$sce.getTrustedJs(value)` →
     *     {@link ng.$sceDelegate#getTrusted `$sceDelegate.getTrusted($sce.JS, value)`}
     *
     * @param {*} value The value to pass to `$sce.getTrusted`.
     * @return {*} The return value of `$sce.getTrusted($sce.JS, value)`
     */
/**
     * @ngdoc method
     * @name $sce#parseAsHtml
     *
     * @description
     * Shorthand method.  `$sce.parseAsHtml(expression string)` →
     *     {@link ng.$sce#parseAs `$sce.parseAs($sce.HTML, value)`}
     *
     * @param {string} expression String expression to compile.
     * @return {function(context, locals)} A function which represents the compiled expression:
     *
     *    * `context` – `{object}` – an object against which any expressions embedded in the
     *      strings are evaluated against (typically a scope object).
     *    * `locals` – `{object=}` – local variables context object, useful for overriding values
     *      in `context`.
     */
/**
     * @ngdoc method
     * @name $sce#parseAsCss
     *
     * @description
     * Shorthand method.  `$sce.parseAsCss(value)` →
     *     {@link ng.$sce#parseAs `$sce.parseAs($sce.CSS, value)`}
     *
     * @param {string} expression String expression to compile.
     * @return {function(context, locals)} A function which represents the compiled expression:
     *
     *    * `context` – `{object}` – an object against which any expressions embedded in the
     *      strings are evaluated against (typically a scope object).
     *    * `locals` – `{object=}` – local variables context object, useful for overriding values
     *      in `context`.
     */
/**
     * @ngdoc method
     * @name $sce#parseAsUrl
     *
     * @description
     * Shorthand method.  `$sce.parseAsUrl(value)` →
     *     {@link ng.$sce#parseAs `$sce.parseAs($sce.URL, value)`}
     *
     * @param {string} expression String expression to compile.
     * @return {function(context, locals)} A function which represents the compiled expression:
     *
     *    * `context` – `{object}` – an object against which any expressions embedded in the
     *      strings are evaluated against (typically a scope object).
     *    * `locals` – `{object=}` – local variables context object, useful for overriding values
     *      in `context`.
     */
/**
     * @ngdoc method
     * @name $sce#parseAsResourceUrl
     *
     * @description
     * Shorthand method.  `$sce.parseAsResourceUrl(value)` →
     *     {@link ng.$sce#parseAs `$sce.parseAs($sce.RESOURCE_URL, value)`}
     *
     * @param {string} expression String expression to compile.
     * @return {function(context, locals)} A function which represents the compiled expression:
     *
     *    * `context` – `{object}` – an object against which any expressions embedded in the
     *      strings are evaluated against (typically a scope object).
     *    * `locals` – `{object=}` – local variables context object, useful for overriding values
     *      in `context`.
     */
/**
     * @ngdoc method
     * @name $sce#parseAsJs
     *
     * @description
     * Shorthand method.  `$sce.parseAsJs(value)` →
     *     {@link ng.$sce#parseAs `$sce.parseAs($sce.JS, value)`}
     *
     * @param {string} expression String expression to compile.
     * @return {function(context, locals)} A function which represents the compiled expression:
     *
     *    * `context` – `{object}` – an object against which any expressions embedded in the
     *      strings are evaluated against (typically a scope object).
     *    * `locals` – `{object=}` – local variables context object, useful for overriding values
     *      in `context`.
     */
// Shorthand delegations.
var parse=sce.parseAs,getTrusted=sce.getTrusted,trustAs=sce.trustAs;return forEach(SCE_CONTEXTS,function(enumValue,name){var lName=lowercase(name);sce[snakeToCamel("parse_as_"+lName)]=function(expr){return parse(enumValue,expr)},sce[snakeToCamel("get_trusted_"+lName)]=function(value){return getTrusted(enumValue,value)},sce[snakeToCamel("trust_as_"+lName)]=function(value){return trustAs(enumValue,value)}}),sce}]}/* exported $SnifferProvider */
/**
 * !!! This is an undocumented "private" service !!!
 *
 * @name $sniffer
 * @requires $window
 * @requires $document
 * @this
 *
 * @property {boolean} history Does the browser support html5 history api ?
 * @property {boolean} transitions Does the browser support CSS transition events ?
 * @property {boolean} animations Does the browser support CSS animation events ?
 *
 * @description
 * This is very simple implementation of testing browser's features.
 */
function $SnifferProvider(){this.$get=["$window","$document",function($window,$document){var eventSupport={},
// Chrome Packaged Apps are not allowed to access `history.pushState`.
// If not sandboxed, they can be detected by the presence of `chrome.app.runtime`
// (see https://developer.chrome.com/apps/api_index). If sandboxed, they can be detected by
// the presence of an extension runtime ID and the absence of other Chrome runtime APIs
// (see https://developer.chrome.com/apps/manifest/sandbox).
// (NW.js apps have access to Chrome APIs, but do support `history`.)
isNw=$window.nw&&$window.nw.process,isChromePackagedApp=!isNw&&$window.chrome&&($window.chrome.app&&$window.chrome.app.runtime||!$window.chrome.app&&$window.chrome.runtime&&$window.chrome.runtime.id),hasHistoryPushState=!isChromePackagedApp&&$window.history&&$window.history.pushState,android=toInt((/android (\d+)/.exec(lowercase(($window.navigator||{}).userAgent))||[])[1]),boxee=/Boxee/i.test(($window.navigator||{}).userAgent),document=$document[0]||{},bodyStyle=document.body&&document.body.style,transitions=!1,animations=!1;
// Support: Android <5, Blackberry Browser 10, default Chrome in Android 4.4.x
// Mentioned browsers need a -webkit- prefix for transitions & animations.
return bodyStyle&&(transitions=!!("transition"in bodyStyle||"webkitTransition"in bodyStyle),animations=!!("animation"in bodyStyle||"webkitAnimation"in bodyStyle)),{
// Android has history.pushState, but it does not update location correctly
// so let's not use the history API at all.
// http://code.google.com/p/android/issues/detail?id=17471
// https://github.com/angular/angular.js/issues/904
// older webkit browser (533.9) on Boxee box has exactly the same problem as Android has
// so let's not use the history API also
// We are purposefully using `!(android < 4)` to cover the case when `android` is undefined
history:!(!hasHistoryPushState||android<4||boxee),hasEvent:function(event){
// Support: IE 9-11 only
// IE9 implements 'input' event it's so fubared that we rather pretend that it doesn't have
// it. In particular the event is not fired when backspace or delete key are pressed or
// when cut operation is performed.
// IE10+ implements 'input' event but it erroneously fires under various situations,
// e.g. when placeholder changes, or a form is focused.
if("input"===event&&msie)return!1;if(isUndefined(eventSupport[event])){var divElm=document.createElement("div");eventSupport[event]="on"+event in divElm}return eventSupport[event]},csp:csp(),transitions:transitions,animations:animations,android:android}}]}/**
 * @ngdoc provider
 * @name $templateRequestProvider
 * @this
 *
 * @description
 * Used to configure the options passed to the {@link $http} service when making a template request.
 *
 * For example, it can be used for specifying the "Accept" header that is sent to the server, when
 * requesting a template.
 */
function $TemplateRequestProvider(){var httpOptions;/**
   * @ngdoc method
   * @name $templateRequestProvider#httpOptions
   * @description
   * The options to be passed to the {@link $http} service when making the request.
   * You can use this to override options such as the "Accept" header for template requests.
   *
   * The {@link $templateRequest} will set the `cache` and the `transformResponse` properties of the
   * options if not overridden here.
   *
   * @param {string=} value new value for the {@link $http} options.
   * @returns {string|self} Returns the {@link $http} options when used as getter and self if used as setter.
   */
this.httpOptions=function(val){return val?(httpOptions=val,this):httpOptions},/**
   * @ngdoc service
   * @name $templateRequest
   *
   * @description
   * The `$templateRequest` service runs security checks then downloads the provided template using
   * `$http` and, upon success, stores the contents inside of `$templateCache`. If the HTTP request
   * fails or the response data of the HTTP request is empty, a `$compile` error will be thrown (the
   * exception can be thwarted by setting the 2nd parameter of the function to true). Note that the
   * contents of `$templateCache` are trusted, so the call to `$sce.getTrustedUrl(tpl)` is omitted
   * when `tpl` is of type string and `$templateCache` has the matching entry.
   *
   * If you want to pass custom options to the `$http` service, such as setting the Accept header you
   * can configure this via {@link $templateRequestProvider#httpOptions}.
   *
   * @param {string|TrustedResourceUrl} tpl The HTTP request template URL
   * @param {boolean=} ignoreRequestError Whether or not to ignore the exception when the request fails or the template is empty
   *
   * @return {Promise} a promise for the HTTP response data of the given URL.
   *
   * @property {number} totalPendingRequests total amount of pending template requests being downloaded.
   */
this.$get=["$exceptionHandler","$templateCache","$http","$q","$sce",function($exceptionHandler,$templateCache,$http,$q,$sce){function handleRequestFn(tpl,ignoreRequestError){function handleError(resp){return ignoreRequestError||(resp=$templateRequestMinErr("tpload","Failed to load template: {0} (HTTP status: {1} {2})",tpl,resp.status,resp.statusText),$exceptionHandler(resp)),$q.reject(resp)}handleRequestFn.totalPendingRequests++,
// We consider the template cache holds only trusted templates, so
// there's no need to go through whitelisting again for keys that already
// are included in there. This also makes Angular accept any script
// directive, no matter its name. However, we still need to unwrap trusted
// types.
isString(tpl)&&!isUndefined($templateCache.get(tpl))||(tpl=$sce.getTrustedResourceUrl(tpl));var transformResponse=$http.defaults&&$http.defaults.transformResponse;return isArray(transformResponse)?transformResponse=transformResponse.filter(function(transformer){return transformer!==defaultHttpResponseTransform}):transformResponse===defaultHttpResponseTransform&&(transformResponse=null),$http.get(tpl,extend({cache:$templateCache,transformResponse:transformResponse},httpOptions))["finally"](function(){handleRequestFn.totalPendingRequests--}).then(function(response){return $templateCache.put(tpl,response.data),response.data},handleError)}return handleRequestFn.totalPendingRequests=0,handleRequestFn}]}/** @this */
function $$TestabilityProvider(){this.$get=["$rootScope","$browser","$location",function($rootScope,$browser,$location){/**
     * @name $testability
     *
     * @description
     * The private $$testability service provides a collection of methods for use when debugging
     * or by automated test and debugging tools.
     */
var testability={};/**
     * @name $$testability#findBindings
     *
     * @description
     * Returns an array of elements that are bound (via ng-bind or {{}})
     * to expressions matching the input.
     *
     * @param {Element} element The element root to search from.
     * @param {string} expression The binding expression to match.
     * @param {boolean} opt_exactMatch If true, only returns exact matches
     *     for the expression. Filters and whitespace are ignored.
     */
/**
     * @name $$testability#findModels
     *
     * @description
     * Returns an array of elements that are two-way found via ng-model to
     * expressions matching the input.
     *
     * @param {Element} element The element root to search from.
     * @param {string} expression The model expression to match.
     * @param {boolean} opt_exactMatch If true, only returns exact matches
     *     for the expression.
     */
/**
     * @name $$testability#getLocation
     *
     * @description
     * Shortcut for getting the location in a browser agnostic way. Returns
     *     the path, search, and hash. (e.g. /path?a=b#hash)
     */
/**
     * @name $$testability#setLocation
     *
     * @description
     * Shortcut for navigating to a location without doing a full page reload.
     *
     * @param {string} url The location url (path, search and hash,
     *     e.g. /path?a=b#hash) to go to.
     */
/**
     * @name $$testability#whenStable
     *
     * @description
     * Calls the callback when $timeout and $http requests are completed.
     *
     * @param {function} callback
     */
return testability.findBindings=function(element,expression,opt_exactMatch){var bindings=element.getElementsByClassName("ng-binding"),matches=[];return forEach(bindings,function(binding){var dataBinding=angular.element(binding).data("$binding");dataBinding&&forEach(dataBinding,function(bindingName){if(opt_exactMatch){var matcher=new RegExp("(^|\\s)"+escapeForRegexp(expression)+"(\\s|\\||$)");matcher.test(bindingName)&&matches.push(binding)}else bindingName.indexOf(expression)!==-1&&matches.push(binding)})}),matches},testability.findModels=function(element,expression,opt_exactMatch){for(var prefixes=["ng-","data-ng-","ng\\:"],p=0;p<prefixes.length;++p){var attributeEquals=opt_exactMatch?"=":"*=",selector="["+prefixes[p]+"model"+attributeEquals+'"'+expression+'"]',elements=element.querySelectorAll(selector);if(elements.length)return elements}},testability.getLocation=function(){return $location.url()},testability.setLocation=function(url){url!==$location.url()&&($location.url(url),$rootScope.$digest())},testability.whenStable=function(callback){$browser.notifyWhenNoOutstandingRequests(callback)},testability}]}/** @this */
function $TimeoutProvider(){this.$get=["$rootScope","$browser","$q","$$q","$exceptionHandler",function($rootScope,$browser,$q,$$q,$exceptionHandler){/**
      * @ngdoc service
      * @name $timeout
      *
      * @description
      * Angular's wrapper for `window.setTimeout`. The `fn` function is wrapped into a try/catch
      * block and delegates any exceptions to
      * {@link ng.$exceptionHandler $exceptionHandler} service.
      *
      * The return value of calling `$timeout` is a promise, which will be resolved when
      * the delay has passed and the timeout function, if provided, is executed.
      *
      * To cancel a timeout request, call `$timeout.cancel(promise)`.
      *
      * In tests you can use {@link ngMock.$timeout `$timeout.flush()`} to
      * synchronously flush the queue of deferred functions.
      *
      * If you only want a promise that will be resolved after some specified delay
      * then you can call `$timeout` without the `fn` function.
      *
      * @param {function()=} fn A function, whose execution should be delayed.
      * @param {number=} [delay=0] Delay in milliseconds.
      * @param {boolean=} [invokeApply=true] If set to `false` skips model dirty checking, otherwise
      *   will invoke `fn` within the {@link ng.$rootScope.Scope#$apply $apply} block.
      * @param {...*=} Pass additional parameters to the executed function.
      * @returns {Promise} Promise that will be resolved when the timeout is reached. The promise
      *   will be resolved with the return value of the `fn` function.
      *
      */
function timeout(fn,delay,invokeApply){isFunction(fn)||(invokeApply=delay,delay=fn,fn=noop);var timeoutId,args=sliceArgs(arguments,3),skipApply=isDefined(invokeApply)&&!invokeApply,deferred=(skipApply?$$q:$q).defer(),promise=deferred.promise;return timeoutId=$browser.defer(function(){try{deferred.resolve(fn.apply(null,args))}catch(e){deferred.reject(e),$exceptionHandler(e)}finally{delete deferreds[promise.$$timeoutId]}skipApply||$rootScope.$apply()},delay),promise.$$timeoutId=timeoutId,deferreds[timeoutId]=deferred,promise}var deferreds={};/**
      * @ngdoc method
      * @name $timeout#cancel
      *
      * @description
      * Cancels a task associated with the `promise`. As a result of this, the promise will be
      * resolved with a rejection.
      *
      * @param {Promise=} promise Promise returned by the `$timeout` function.
      * @returns {boolean} Returns `true` if the task hasn't executed yet and was successfully
      *   canceled.
      */
return timeout.cancel=function(promise){
// Timeout cancels should not report an unhandled promise.
return!!(promise&&promise.$$timeoutId in deferreds)&&(deferreds[promise.$$timeoutId].promise["catch"](noop),deferreds[promise.$$timeoutId].reject("canceled"),delete deferreds[promise.$$timeoutId],$browser.defer.cancel(promise.$$timeoutId))},timeout}]}/**
 *
 * Implementation Notes for non-IE browsers
 * ----------------------------------------
 * Assigning a URL to the href property of an anchor DOM node, even one attached to the DOM,
 * results both in the normalizing and parsing of the URL.  Normalizing means that a relative
 * URL will be resolved into an absolute URL in the context of the application document.
 * Parsing means that the anchor node's host, hostname, protocol, port, pathname and related
 * properties are all populated to reflect the normalized URL.  This approach has wide
 * compatibility - Safari 1+, Mozilla 1+ etc.  See
 * http://www.aptana.com/reference/html/api/HTMLAnchorElement.html
 *
 * Implementation Notes for IE
 * ---------------------------
 * IE <= 10 normalizes the URL when assigned to the anchor node similar to the other
 * browsers.  However, the parsed components will not be set if the URL assigned did not specify
 * them.  (e.g. if you assign a.href = "foo", then a.protocol, a.host, etc. will be empty.)  We
 * work around that by performing the parsing in a 2nd step by taking a previously normalized
 * URL (e.g. by assigning to a.href) and assigning it a.href again.  This correctly populates the
 * properties such as protocol, hostname, port, etc.
 *
 * References:
 *   http://developer.mozilla.org/en-US/docs/Web/API/HTMLAnchorElement
 *   http://www.aptana.com/reference/html/api/HTMLAnchorElement.html
 *   http://url.spec.whatwg.org/#urlutils
 *   https://github.com/angular/angular.js/pull/2902
 *   http://james.padolsey.com/javascript/parsing-urls-with-the-dom/
 *
 * @kind function
 * @param {string} url The URL to be parsed.
 * @description Normalizes and parses a URL.
 * @returns {object} Returns the normalized URL as a dictionary.
 *
 *   | member name   | Description    |
 *   |---------------|----------------|
 *   | href          | A normalized version of the provided URL if it was not an absolute URL |
 *   | protocol      | The protocol including the trailing colon                              |
 *   | host          | The host and port (if the port is non-default) of the normalizedUrl    |
 *   | search        | The search params, minus the question mark                             |
 *   | hash          | The hash string, minus the hash symbol
 *   | hostname      | The hostname
 *   | port          | The port, without ":"
 *   | pathname      | The pathname, beginning with "/"
 *
 */
function urlResolve(url){var href=url;
// urlParsingNode provides the UrlUtils interface - http://url.spec.whatwg.org/#urlutils
// Support: IE 9-11 only
// Normalize before parse.  Refer Implementation Notes on why this is
// done in two steps on IE.
return msie&&(urlParsingNode.setAttribute("href",href),href=urlParsingNode.href),urlParsingNode.setAttribute("href",href),{href:urlParsingNode.href,protocol:urlParsingNode.protocol?urlParsingNode.protocol.replace(/:$/,""):"",host:urlParsingNode.host,search:urlParsingNode.search?urlParsingNode.search.replace(/^\?/,""):"",hash:urlParsingNode.hash?urlParsingNode.hash.replace(/^#/,""):"",hostname:urlParsingNode.hostname,port:urlParsingNode.port,pathname:"/"===urlParsingNode.pathname.charAt(0)?urlParsingNode.pathname:"/"+urlParsingNode.pathname}}/**
 * Parse a request URL and determine whether this is a same-origin request as the application document.
 *
 * @param {string|object} requestUrl The url of the request as a string that will be resolved
 * or a parsed URL object.
 * @returns {boolean} Whether the request is for the same origin as the application document.
 */
function urlIsSameOrigin(requestUrl){var parsed=isString(requestUrl)?urlResolve(requestUrl):requestUrl;return parsed.protocol===originUrl.protocol&&parsed.host===originUrl.host}/**
 * @ngdoc service
 * @name $window
 * @this
 *
 * @description
 * A reference to the browser's `window` object. While `window`
 * is globally available in JavaScript, it causes testability problems, because
 * it is a global variable. In angular we always refer to it through the
 * `$window` service, so it may be overridden, removed or mocked for testing.
 *
 * Expressions, like the one defined for the `ngClick` directive in the example
 * below, are evaluated with respect to the current scope.  Therefore, there is
 * no risk of inadvertently coding in a dependency on a global value in such an
 * expression.
 *
 * @example
   <example module="windowExample" name="window-service">
     <file name="index.html">
       <script>
         angular.module('windowExample', [])
           .controller('ExampleController', ['$scope', '$window', function($scope, $window) {
             $scope.greeting = 'Hello, World!';
             $scope.doGreeting = function(greeting) {
               $window.alert(greeting);
             };
           }]);
       </script>
       <div ng-controller="ExampleController">
         <input type="text" ng-model="greeting" aria-label="greeting" />
         <button ng-click="doGreeting(greeting)">ALERT</button>
       </div>
     </file>
     <file name="protractor.js" type="protractor">
      it('should display the greeting in the input box', function() {
       element(by.model('greeting')).sendKeys('Hello, E2E Tests');
       // If we click the button it will block the test runner
       // element(':button').click();
      });
     </file>
   </example>
 */
function $WindowProvider(){this.$get=valueFn(window)}/**
 * @name $$cookieReader
 * @requires $document
 *
 * @description
 * This is a private service for reading cookies used by $http and ngCookies
 *
 * @return {Object} a key/value map of the current cookies
 */
function $$CookieReader($document){function safeGetCookie(rawDocument){try{return rawDocument.cookie||""}catch(e){return""}}function safeDecodeURIComponent(str){try{return decodeURIComponent(str)}catch(e){return str}}var rawDocument=$document[0]||{},lastCookies={},lastCookieString="";return function(){var cookieArray,cookie,i,index,name,currentCookieString=safeGetCookie(rawDocument);if(currentCookieString!==lastCookieString)for(lastCookieString=currentCookieString,cookieArray=lastCookieString.split("; "),lastCookies={},i=0;i<cookieArray.length;i++)cookie=cookieArray[i],index=cookie.indexOf("="),index>0&&(//ignore nameless cookies
name=safeDecodeURIComponent(cookie.substring(0,index)),
// the first value that is seen for a cookie is the most
// specific one.  values for the same cookie name that
// follow are for less specific paths.
isUndefined(lastCookies[name])&&(lastCookies[name]=safeDecodeURIComponent(cookie.substring(index+1))));return lastCookies}}/** @this */
function $$CookieReaderProvider(){this.$get=$$CookieReader}/** @this */
function $FilterProvider($provide){/**
   * @ngdoc method
   * @name $filterProvider#register
   * @param {string|Object} name Name of the filter function, or an object map of filters where
   *    the keys are the filter names and the values are the filter factories.
   *
   *    <div class="alert alert-warning">
   *    **Note:** Filter names must be valid angular {@link expression} identifiers, such as `uppercase` or `orderBy`.
   *    Names with special characters, such as hyphens and dots, are not allowed. If you wish to namespace
   *    your filters, then you can use capitalization (`myappSubsectionFilterx`) or underscores
   *    (`myapp_subsection_filterx`).
   *    </div>
    * @param {Function} factory If the first argument was a string, a factory function for the filter to be registered.
   * @returns {Object} Registered filter instance, or if a map of filters was provided then a map
   *    of the registered filter instances.
   */
function register(name,factory){if(isObject(name)){var filters={};return forEach(name,function(filter,key){filters[key]=register(key,filter)}),filters}return $provide.factory(name+suffix,factory)}var suffix="Filter";this.register=register,this.$get=["$injector",function($injector){return function(name){return $injector.get(name+suffix)}}],
////////////////////////////////////////
/* global
    currencyFilter: false,
    dateFilter: false,
    filterFilter: false,
    jsonFilter: false,
    limitToFilter: false,
    lowercaseFilter: false,
    numberFilter: false,
    orderByFilter: false,
    uppercaseFilter: false
  */
register("currency",currencyFilter),register("date",dateFilter),register("filter",filterFilter),register("json",jsonFilter),register("limitTo",limitToFilter),register("lowercase",lowercaseFilter),register("number",numberFilter),register("orderBy",orderByFilter),register("uppercase",uppercaseFilter)}/**
 * @ngdoc filter
 * @name filter
 * @kind function
 *
 * @description
 * Selects a subset of items from `array` and returns it as a new array.
 *
 * @param {Array} array The source array.
 * <div class="alert alert-info">
 *   **Note**: If the array contains objects that reference themselves, filtering is not possible.
 * </div>
 * @param {string|Object|function()} expression The predicate to be used for selecting items from
 *   `array`.
 *
 *   Can be one of:
 *
 *   - `string`: The string is used for matching against the contents of the `array`. All strings or
 *     objects with string properties in `array` that match this string will be returned. This also
 *     applies to nested object properties.
 *     The predicate can be negated by prefixing the string with `!`.
 *
 *   - `Object`: A pattern object can be used to filter specific properties on objects contained
 *     by `array`. For example `{name:"M", phone:"1"}` predicate will return an array of items
 *     which have property `name` containing "M" and property `phone` containing "1". A special
 *     property name (`$` by default) can be used (e.g. as in `{$: "text"}`) to accept a match
 *     against any property of the object or its nested object properties. That's equivalent to the
 *     simple substring match with a `string` as described above. The special property name can be
 *     overwritten, using the `anyPropertyKey` parameter.
 *     The predicate can be negated by prefixing the string with `!`.
 *     For example `{name: "!M"}` predicate will return an array of items which have property `name`
 *     not containing "M".
 *
 *     Note that a named property will match properties on the same level only, while the special
 *     `$` property will match properties on the same level or deeper. E.g. an array item like
 *     `{name: {first: 'John', last: 'Doe'}}` will **not** be matched by `{name: 'John'}`, but
 *     **will** be matched by `{$: 'John'}`.
 *
 *   - `function(value, index, array)`: A predicate function can be used to write arbitrary filters.
 *     The function is called for each element of the array, with the element, its index, and
 *     the entire array itself as arguments.
 *
 *     The final result is an array of those elements that the predicate returned true for.
 *
 * @param {function(actual, expected)|true|false} [comparator] Comparator which is used in
 *     determining if values retrieved using `expression` (when it is not a function) should be
 *     considered a match based on the the expected value (from the filter expression) and actual
 *     value (from the object in the array).
 *
 *   Can be one of:
 *
 *   - `function(actual, expected)`:
 *     The function will be given the object value and the predicate value to compare and
 *     should return true if both values should be considered equal.
 *
 *   - `true`: A shorthand for `function(actual, expected) { return angular.equals(actual, expected)}`.
 *     This is essentially strict comparison of expected and actual.
 *
 *   - `false`: A short hand for a function which will look for a substring match in a case
 *     insensitive way. Primitive values are converted to strings. Objects are not compared against
 *     primitives, unless they have a custom `toString` method (e.g. `Date` objects).
 *
 *
 *   Defaults to `false`.
 *
 * @param {string} [anyPropertyKey] The special property name that matches against any property.
 *     By default `$`.
 *
 * @example
   <example name="filter-filter">
     <file name="index.html">
       <div ng-init="friends = [{name:'John', phone:'555-1276'},
                                {name:'Mary', phone:'800-BIG-MARY'},
                                {name:'Mike', phone:'555-4321'},
                                {name:'Adam', phone:'555-5678'},
                                {name:'Julie', phone:'555-8765'},
                                {name:'Juliette', phone:'555-5678'}]"></div>

       <label>Search: <input ng-model="searchText"></label>
       <table id="searchTextResults">
         <tr><th>Name</th><th>Phone</th></tr>
         <tr ng-repeat="friend in friends | filter:searchText">
           <td>{{friend.name}}</td>
           <td>{{friend.phone}}</td>
         </tr>
       </table>
       <hr>
       <label>Any: <input ng-model="search.$"></label> <br>
       <label>Name only <input ng-model="search.name"></label><br>
       <label>Phone only <input ng-model="search.phone"></label><br>
       <label>Equality <input type="checkbox" ng-model="strict"></label><br>
       <table id="searchObjResults">
         <tr><th>Name</th><th>Phone</th></tr>
         <tr ng-repeat="friendObj in friends | filter:search:strict">
           <td>{{friendObj.name}}</td>
           <td>{{friendObj.phone}}</td>
         </tr>
       </table>
     </file>
     <file name="protractor.js" type="protractor">
       var expectFriendNames = function(expectedNames, key) {
         element.all(by.repeater(key + ' in friends').column(key + '.name')).then(function(arr) {
           arr.forEach(function(wd, i) {
             expect(wd.getText()).toMatch(expectedNames[i]);
           });
         });
       };

       it('should search across all fields when filtering with a string', function() {
         var searchText = element(by.model('searchText'));
         searchText.clear();
         searchText.sendKeys('m');
         expectFriendNames(['Mary', 'Mike', 'Adam'], 'friend');

         searchText.clear();
         searchText.sendKeys('76');
         expectFriendNames(['John', 'Julie'], 'friend');
       });

       it('should search in specific fields when filtering with a predicate object', function() {
         var searchAny = element(by.model('search.$'));
         searchAny.clear();
         searchAny.sendKeys('i');
         expectFriendNames(['Mary', 'Mike', 'Julie', 'Juliette'], 'friendObj');
       });
       it('should use a equal comparison when comparator is true', function() {
         var searchName = element(by.model('search.name'));
         var strict = element(by.model('strict'));
         searchName.clear();
         searchName.sendKeys('Julie');
         strict.click();
         expectFriendNames(['Julie'], 'friendObj');
       });
     </file>
   </example>
 */
function filterFilter(){return function(array,expression,comparator,anyPropertyKey){if(!isArrayLike(array)){if(null==array)return array;throw minErr("filter")("notarray","Expected array but received: {0}",array)}anyPropertyKey=anyPropertyKey||"$";var predicateFn,matchAgainstAnyProp,expressionType=getTypeForFilter(expression);switch(expressionType){case"function":predicateFn=expression;break;case"boolean":case"null":case"number":case"string":matchAgainstAnyProp=!0;
// falls through
case"object":predicateFn=createPredicateFn(expression,comparator,anyPropertyKey,matchAgainstAnyProp);break;default:return array}return Array.prototype.filter.call(array,predicateFn)}}
// Helper functions for `filterFilter`
function createPredicateFn(expression,comparator,anyPropertyKey,matchAgainstAnyProp){var predicateFn,shouldMatchPrimitives=isObject(expression)&&anyPropertyKey in expression;return comparator===!0?comparator=equals:isFunction(comparator)||(comparator=function(actual,expected){return!isUndefined(actual)&&(null===actual||null===expected?actual===expected:!(isObject(expected)||isObject(actual)&&!hasCustomToString(actual))&&(actual=lowercase(""+actual),expected=lowercase(""+expected),actual.indexOf(expected)!==-1))}),predicateFn=function(item){return shouldMatchPrimitives&&!isObject(item)?deepCompare(item,expression[anyPropertyKey],comparator,anyPropertyKey,!1):deepCompare(item,expression,comparator,anyPropertyKey,matchAgainstAnyProp)}}function deepCompare(actual,expected,comparator,anyPropertyKey,matchAgainstAnyProp,dontMatchWholeObject){var actualType=getTypeForFilter(actual),expectedType=getTypeForFilter(expected);if("string"===expectedType&&"!"===expected.charAt(0))return!deepCompare(actual,expected.substring(1),comparator,anyPropertyKey,matchAgainstAnyProp);if(isArray(actual))
// In case `actual` is an array, consider it a match
// if ANY of it's items matches `expected`
return actual.some(function(item){return deepCompare(item,expected,comparator,anyPropertyKey,matchAgainstAnyProp)});switch(actualType){case"object":var key;if(matchAgainstAnyProp){for(key in actual)
// Under certain, rare, circumstances, key may not be a string and `charAt` will be undefined
// See: https://github.com/angular/angular.js/issues/15644
if(key.charAt&&"$"!==key.charAt(0)&&deepCompare(actual[key],expected,comparator,anyPropertyKey,!0))return!0;return!dontMatchWholeObject&&deepCompare(actual,expected,comparator,anyPropertyKey,!1)}if("object"===expectedType){for(key in expected){var expectedVal=expected[key];if(!isFunction(expectedVal)&&!isUndefined(expectedVal)){var matchAnyProperty=key===anyPropertyKey,actualVal=matchAnyProperty?actual:actual[key];if(!deepCompare(actualVal,expectedVal,comparator,anyPropertyKey,matchAnyProperty,matchAnyProperty))return!1}}return!0}return comparator(actual,expected);case"function":return!1;default:return comparator(actual,expected)}}
// Used for easily differentiating between `null` and actual `object`
function getTypeForFilter(val){return null===val?"null":typeof val}function currencyFilter($locale){var formats=$locale.NUMBER_FORMATS;return function(amount,currencySymbol,fractionSize){
// if null or undefined pass it through
return isUndefined(currencySymbol)&&(currencySymbol=formats.CURRENCY_SYM),isUndefined(fractionSize)&&(fractionSize=formats.PATTERNS[1].maxFrac),null==amount?amount:formatNumber(amount,formats.PATTERNS[1],formats.GROUP_SEP,formats.DECIMAL_SEP,fractionSize).replace(/\u00A4/g,currencySymbol)}}function numberFilter($locale){var formats=$locale.NUMBER_FORMATS;return function(number,fractionSize){
// if null or undefined pass it through
return null==number?number:formatNumber(number,formats.PATTERNS[0],formats.GROUP_SEP,formats.DECIMAL_SEP,fractionSize)}}/**
 * Parse a number (as a string) into three components that can be used
 * for formatting the number.
 *
 * (Significant bits of this parse algorithm came from https://github.com/MikeMcl/big.js/)
 *
 * @param  {string} numStr The number to parse
 * @return {object} An object describing this number, containing the following keys:
 *  - d : an array of digits containing leading zeros as necessary
 *  - i : the number of the digits in `d` that are to the left of the decimal point
 *  - e : the exponent for numbers that would need more than `MAX_DIGITS` digits in `d`
 *
 */
function parse(numStr){var digits,numberOfIntegerDigits,i,j,zeros,exponent=0;
// Count the number of leading zeros.
for(
// Decimal point?
(numberOfIntegerDigits=numStr.indexOf(DECIMAL_SEP))>-1&&(numStr=numStr.replace(DECIMAL_SEP,"")),
// Exponential form?
(i=numStr.search(/e/i))>0?(
// Work out the exponent.
numberOfIntegerDigits<0&&(numberOfIntegerDigits=i),numberOfIntegerDigits+=+numStr.slice(i+1),numStr=numStr.substring(0,i)):numberOfIntegerDigits<0&&(
// There was no decimal point or exponent so it is an integer.
numberOfIntegerDigits=numStr.length),i=0;numStr.charAt(i)===ZERO_CHAR;i++);if(i===(zeros=numStr.length))
// The digits are all zero.
digits=[0],numberOfIntegerDigits=1;else{for(
// Count the number of trailing zeros
zeros--;numStr.charAt(zeros)===ZERO_CHAR;)zeros--;
// Convert string to array of digits without leading/trailing zeros.
for(
// Trailing zeros are insignificant so ignore them
numberOfIntegerDigits-=i,digits=[],j=0;i<=zeros;i++,j++)digits[j]=+numStr.charAt(i)}
// If the number overflows the maximum allowed digits then use an exponent.
return numberOfIntegerDigits>MAX_DIGITS&&(digits=digits.splice(0,MAX_DIGITS-1),exponent=numberOfIntegerDigits-1,numberOfIntegerDigits=1),{d:digits,e:exponent,i:numberOfIntegerDigits}}/**
 * Round the parsed number to the specified number of decimal places
 * This function changed the parsedNumber in-place
 */
function roundNumber(parsedNumber,fractionSize,minFrac,maxFrac){var digits=parsedNumber.d,fractionLen=digits.length-parsedNumber.i;
// determine fractionSize if it is not specified; `+fractionSize` converts it to a number
fractionSize=isUndefined(fractionSize)?Math.min(Math.max(minFrac,fractionLen),maxFrac):+fractionSize;
// The index of the digit to where rounding is to occur
var roundAt=fractionSize+parsedNumber.i,digit=digits[roundAt];if(roundAt>0){
// Drop fractional digits beyond `roundAt`
digits.splice(Math.max(parsedNumber.i,roundAt));
// Set non-fractional digits beyond `roundAt` to 0
for(var j=roundAt;j<digits.length;j++)digits[j]=0}else{
// We rounded to zero so reset the parsedNumber
fractionLen=Math.max(0,fractionLen),parsedNumber.i=1,digits.length=Math.max(1,roundAt=fractionSize+1),digits[0]=0;for(var i=1;i<roundAt;i++)digits[i]=0}if(digit>=5)if(roundAt-1<0){for(var k=0;k>roundAt;k--)digits.unshift(0),parsedNumber.i++;digits.unshift(1),parsedNumber.i++}else digits[roundAt-1]++;
// Pad out with zeros to get the required fraction length
for(;fractionLen<Math.max(0,fractionSize);fractionLen++)digits.push(0);
// Do any carrying, e.g. a digit was rounded up to 10
var carry=digits.reduceRight(function(carry,d,i,digits){return d+=carry,digits[i]=d%10,Math.floor(d/10)},0);carry&&(digits.unshift(carry),parsedNumber.i++)}/**
 * Format a number into a string
 * @param  {number} number       The number to format
 * @param  {{
 *           minFrac, // the minimum number of digits required in the fraction part of the number
 *           maxFrac, // the maximum number of digits required in the fraction part of the number
 *           gSize,   // number of digits in each group of separated digits
 *           lgSize,  // number of digits in the last group of digits before the decimal separator
 *           negPre,  // the string to go in front of a negative number (e.g. `-` or `(`))
 *           posPre,  // the string to go in front of a positive number
 *           negSuf,  // the string to go after a negative number (e.g. `)`)
 *           posSuf   // the string to go after a positive number
 *         }} pattern
 * @param  {string} groupSep     The string to separate groups of number (e.g. `,`)
 * @param  {string} decimalSep   The string to act as the decimal separator (e.g. `.`)
 * @param  {[type]} fractionSize The size of the fractional part of the number
 * @return {string}              The number formatted as a string
 */
function formatNumber(number,pattern,groupSep,decimalSep,fractionSize){if(!isString(number)&&!isNumber(number)||isNaN(number))return"";var parsedNumber,isInfinity=!isFinite(number),isZero=!1,numStr=Math.abs(number)+"",formattedText="";if(isInfinity)formattedText="∞";else{parsedNumber=parse(numStr),roundNumber(parsedNumber,fractionSize,pattern.minFrac,pattern.maxFrac);var digits=parsedNumber.d,integerLen=parsedNumber.i,exponent=parsedNumber.e,decimals=[];
// pad zeros for small numbers
for(isZero=digits.reduce(function(isZero,d){return isZero&&!d},!0);integerLen<0;)digits.unshift(0),integerLen++;
// extract decimals digits
integerLen>0?decimals=digits.splice(integerLen,digits.length):(decimals=digits,digits=[0]);
// format the integer digits with grouping separators
var groups=[];for(digits.length>=pattern.lgSize&&groups.unshift(digits.splice(-pattern.lgSize,digits.length).join(""));digits.length>pattern.gSize;)groups.unshift(digits.splice(-pattern.gSize,digits.length).join(""));digits.length&&groups.unshift(digits.join("")),formattedText=groups.join(groupSep),
// append the decimal digits
decimals.length&&(formattedText+=decimalSep+decimals.join("")),exponent&&(formattedText+="e+"+exponent)}return number<0&&!isZero?pattern.negPre+formattedText+pattern.negSuf:pattern.posPre+formattedText+pattern.posSuf}function padNumber(num,digits,trim,negWrap){var neg="";for((num<0||negWrap&&num<=0)&&(negWrap?num=-num+1:(num=-num,neg="-")),num=""+num;num.length<digits;)num=ZERO_CHAR+num;return trim&&(num=num.substr(num.length-digits)),neg+num}function dateGetter(name,size,offset,trim,negWrap){return offset=offset||0,function(date){var value=date["get"+name]();return(offset>0||value>-offset)&&(value+=offset),0===value&&offset===-12&&(value=12),padNumber(value,size,trim,negWrap)}}function dateStrGetter(name,shortForm,standAlone){return function(date,formats){var value=date["get"+name](),propPrefix=(standAlone?"STANDALONE":"")+(shortForm?"SHORT":""),get=uppercase(propPrefix+name);return formats[get][value]}}function timeZoneGetter(date,formats,offset){var zone=-1*offset,paddedZone=zone>=0?"+":"";return paddedZone+=padNumber(Math[zone>0?"floor":"ceil"](zone/60),2)+padNumber(Math.abs(zone%60),2)}function getFirstThursdayOfYear(year){
// 0 = index of January
var dayOfWeekOnFirst=new Date(year,0,1).getDay();
// 4 = index of Thursday (+1 to account for 1st = 5)
// 11 = index of *next* Thursday (+1 account for 1st = 12)
return new Date(year,0,(dayOfWeekOnFirst<=4?5:12)-dayOfWeekOnFirst)}function getThursdayThisWeek(datetime){
// 4 = index of Thursday
return new Date(datetime.getFullYear(),datetime.getMonth(),datetime.getDate()+(4-datetime.getDay()))}function weekGetter(size){return function(date){var firstThurs=getFirstThursdayOfYear(date.getFullYear()),thisThurs=getThursdayThisWeek(date),diff=+thisThurs-+firstThurs,result=1+Math.round(diff/6048e5);// 6.048e8 ms per week
return padNumber(result,size)}}function ampmGetter(date,formats){return date.getHours()<12?formats.AMPMS[0]:formats.AMPMS[1]}function eraGetter(date,formats){return date.getFullYear()<=0?formats.ERAS[0]:formats.ERAS[1]}function longEraGetter(date,formats){return date.getFullYear()<=0?formats.ERANAMES[0]:formats.ERANAMES[1]}function dateFilter($locale){
// 1        2       3         4          5          6          7          8  9     10      11
function jsonStringToDate(string){var match;if(match=string.match(R_ISO8601_STR)){var date=new Date(0),tzHour=0,tzMin=0,dateSetter=match[8]?date.setUTCFullYear:date.setFullYear,timeSetter=match[8]?date.setUTCHours:date.setHours;match[9]&&(tzHour=toInt(match[9]+match[10]),tzMin=toInt(match[9]+match[11])),dateSetter.call(date,toInt(match[1]),toInt(match[2])-1,toInt(match[3]));var h=toInt(match[4]||0)-tzHour,m=toInt(match[5]||0)-tzMin,s=toInt(match[6]||0),ms=Math.round(1e3*parseFloat("0."+(match[7]||0)));return timeSetter.call(date,h,m,s,ms),date}return string}var R_ISO8601_STR=/^(\d{4})-?(\d\d)-?(\d\d)(?:T(\d\d)(?::?(\d\d)(?::?(\d\d)(?:\.(\d+))?)?)?(Z|([+-])(\d\d):?(\d\d))?)?$/;return function(date,format,timezone){var fn,match,text="",parts=[];if(format=format||"mediumDate",format=$locale.DATETIME_FORMATS[format]||format,isString(date)&&(date=NUMBER_STRING.test(date)?toInt(date):jsonStringToDate(date)),isNumber(date)&&(date=new Date(date)),!isDate(date)||!isFinite(date.getTime()))return date;for(;format;)match=DATE_FORMATS_SPLIT.exec(format),match?(parts=concat(parts,match,1),format=parts.pop()):(parts.push(format),format=null);var dateTimezoneOffset=date.getTimezoneOffset();return timezone&&(dateTimezoneOffset=timezoneToOffset(timezone,dateTimezoneOffset),date=convertTimezoneToLocal(date,timezone,!0)),forEach(parts,function(value){fn=DATE_FORMATS[value],text+=fn?fn(date,$locale.DATETIME_FORMATS,dateTimezoneOffset):"''"===value?"'":value.replace(/(^'|'$)/g,"").replace(/''/g,"'")}),text}}/**
 * @ngdoc filter
 * @name json
 * @kind function
 *
 * @description
 *   Allows you to convert a JavaScript object into JSON string.
 *
 *   This filter is mostly useful for debugging. When using the double curly {{value}} notation
 *   the binding is automatically converted to JSON.
 *
 * @param {*} object Any JavaScript object (including arrays and primitive types) to filter.
 * @param {number=} spacing The number of spaces to use per indentation, defaults to 2.
 * @returns {string} JSON string.
 *
 *
 * @example
   <example name="filter-json">
     <file name="index.html">
       <pre id="default-spacing">{{ {'name':'value'} | json }}</pre>
       <pre id="custom-spacing">{{ {'name':'value'} | json:4 }}</pre>
     </file>
     <file name="protractor.js" type="protractor">
       it('should jsonify filtered objects', function() {
         expect(element(by.id('default-spacing')).getText()).toMatch(/\{\n {2}"name": ?"value"\n}/);
         expect(element(by.id('custom-spacing')).getText()).toMatch(/\{\n {4}"name": ?"value"\n}/);
       });
     </file>
   </example>
 *
 */
function jsonFilter(){return function(object,spacing){return isUndefined(spacing)&&(spacing=2),toJson(object,spacing)}}/**
 * @ngdoc filter
 * @name limitTo
 * @kind function
 *
 * @description
 * Creates a new array or string containing only a specified number of elements. The elements are
 * taken from either the beginning or the end of the source array, string or number, as specified by
 * the value and sign (positive or negative) of `limit`. Other array-like objects are also supported
 * (e.g. array subclasses, NodeLists, jqLite/jQuery collections etc). If a number is used as input,
 * it is converted to a string.
 *
 * @param {Array|ArrayLike|string|number} input - Array/array-like, string or number to be limited.
 * @param {string|number} limit - The length of the returned array or string. If the `limit` number
 *     is positive, `limit` number of items from the beginning of the source array/string are copied.
 *     If the number is negative, `limit` number  of items from the end of the source array/string
 *     are copied. The `limit` will be trimmed if it exceeds `array.length`. If `limit` is undefined,
 *     the input will be returned unchanged.
 * @param {(string|number)=} begin - Index at which to begin limitation. As a negative index,
 *     `begin` indicates an offset from the end of `input`. Defaults to `0`.
 * @returns {Array|string} A new sub-array or substring of length `limit` or less if the input had
 *     less than `limit` elements.
 *
 * @example
   <example module="limitToExample" name="limit-to-filter">
     <file name="index.html">
       <script>
         angular.module('limitToExample', [])
           .controller('ExampleController', ['$scope', function($scope) {
             $scope.numbers = [1,2,3,4,5,6,7,8,9];
             $scope.letters = "abcdefghi";
             $scope.longNumber = 2345432342;
             $scope.numLimit = 3;
             $scope.letterLimit = 3;
             $scope.longNumberLimit = 3;
           }]);
       </script>
       <div ng-controller="ExampleController">
         <label>
            Limit {{numbers}} to:
            <input type="number" step="1" ng-model="numLimit">
         </label>
         <p>Output numbers: {{ numbers | limitTo:numLimit }}</p>
         <label>
            Limit {{letters}} to:
            <input type="number" step="1" ng-model="letterLimit">
         </label>
         <p>Output letters: {{ letters | limitTo:letterLimit }}</p>
         <label>
            Limit {{longNumber}} to:
            <input type="number" step="1" ng-model="longNumberLimit">
         </label>
         <p>Output long number: {{ longNumber | limitTo:longNumberLimit }}</p>
       </div>
     </file>
     <file name="protractor.js" type="protractor">
       var numLimitInput = element(by.model('numLimit'));
       var letterLimitInput = element(by.model('letterLimit'));
       var longNumberLimitInput = element(by.model('longNumberLimit'));
       var limitedNumbers = element(by.binding('numbers | limitTo:numLimit'));
       var limitedLetters = element(by.binding('letters | limitTo:letterLimit'));
       var limitedLongNumber = element(by.binding('longNumber | limitTo:longNumberLimit'));

       it('should limit the number array to first three items', function() {
         expect(numLimitInput.getAttribute('value')).toBe('3');
         expect(letterLimitInput.getAttribute('value')).toBe('3');
         expect(longNumberLimitInput.getAttribute('value')).toBe('3');
         expect(limitedNumbers.getText()).toEqual('Output numbers: [1,2,3]');
         expect(limitedLetters.getText()).toEqual('Output letters: abc');
         expect(limitedLongNumber.getText()).toEqual('Output long number: 234');
       });

       // There is a bug in safari and protractor that doesn't like the minus key
       // it('should update the output when -3 is entered', function() {
       //   numLimitInput.clear();
       //   numLimitInput.sendKeys('-3');
       //   letterLimitInput.clear();
       //   letterLimitInput.sendKeys('-3');
       //   longNumberLimitInput.clear();
       //   longNumberLimitInput.sendKeys('-3');
       //   expect(limitedNumbers.getText()).toEqual('Output numbers: [7,8,9]');
       //   expect(limitedLetters.getText()).toEqual('Output letters: ghi');
       //   expect(limitedLongNumber.getText()).toEqual('Output long number: 342');
       // });

       it('should not exceed the maximum size of input array', function() {
         numLimitInput.clear();
         numLimitInput.sendKeys('100');
         letterLimitInput.clear();
         letterLimitInput.sendKeys('100');
         longNumberLimitInput.clear();
         longNumberLimitInput.sendKeys('100');
         expect(limitedNumbers.getText()).toEqual('Output numbers: [1,2,3,4,5,6,7,8,9]');
         expect(limitedLetters.getText()).toEqual('Output letters: abcdefghi');
         expect(limitedLongNumber.getText()).toEqual('Output long number: 2345432342');
       });
     </file>
   </example>
*/
function limitToFilter(){return function(input,limit,begin){return limit=Math.abs(Number(limit))===1/0?Number(limit):toInt(limit),isNumberNaN(limit)?input:(isNumber(input)&&(input=input.toString()),isArrayLike(input)?(begin=!begin||isNaN(begin)?0:toInt(begin),begin=begin<0?Math.max(0,input.length+begin):begin,limit>=0?sliceFn(input,begin,begin+limit):0===begin?sliceFn(input,limit,input.length):sliceFn(input,Math.max(0,begin+limit),begin)):input)}}function sliceFn(input,begin,end){return isString(input)?input.slice(begin,end):slice.call(input,begin,end)}function orderByFilter($parse){function processPredicates(sortPredicates){return sortPredicates.map(function(predicate){var descending=1,get=identity;if(isFunction(predicate))get=predicate;else if(isString(predicate)&&("+"!==predicate.charAt(0)&&"-"!==predicate.charAt(0)||(descending="-"===predicate.charAt(0)?-1:1,predicate=predicate.substring(1)),""!==predicate&&(get=$parse(predicate),get.constant))){var key=get();get=function(value){return value[key]}}return{get:get,descending:descending}})}function isPrimitive(value){switch(typeof value){case"number":/* falls through */
case"boolean":/* falls through */
case"string":return!0;default:return!1}}function objectValue(value){
// If `valueOf` is a valid function use that
// If `valueOf` is a valid function use that
// If `toString` is a valid function and not the one from `Object.prototype` use that
return isFunction(value.valueOf)&&(value=value.valueOf(),isPrimitive(value))?value:hasCustomToString(value)&&(value=value.toString(),isPrimitive(value))?value:value}function getPredicateValue(value,index){var type=typeof value;return null===value?(type="string",value="null"):"object"===type&&(value=objectValue(value)),{value:value,type:type,index:index}}function defaultCompare(v1,v2){var result=0,type1=v1.type,type2=v2.type;if(type1===type2){var value1=v1.value,value2=v2.value;"string"===type1?(
// Compare strings case-insensitively
value1=value1.toLowerCase(),value2=value2.toLowerCase()):"object"===type1&&(
// For basic objects, use the position of the object
// in the collection instead of the value
isObject(value1)&&(value1=v1.index),isObject(value2)&&(value2=v2.index)),value1!==value2&&(result=value1<value2?-1:1)}else result=type1<type2?-1:1;return result}return function(array,sortPredicate,reverseOrder,compareFn){function getComparisonObject(value,index){
// NOTE: We are adding an extra `tieBreaker` value based on the element's index.
// This will be used to keep the sort stable when none of the input predicates can
// distinguish between two elements.
return{value:value,tieBreaker:{value:index,type:"number",index:index},predicateValues:predicates.map(function(predicate){return getPredicateValue(predicate.get(value),index)})}}function doComparison(v1,v2){for(var i=0,ii=predicates.length;i<ii;i++){var result=compare(v1.predicateValues[i],v2.predicateValues[i]);if(result)return result*predicates[i].descending*descending}return compare(v1.tieBreaker,v2.tieBreaker)*descending}if(null==array)return array;if(!isArrayLike(array))throw minErr("orderBy")("notarray","Expected array but received: {0}",array);isArray(sortPredicate)||(sortPredicate=[sortPredicate]),0===sortPredicate.length&&(sortPredicate=["+"]);var predicates=processPredicates(sortPredicate),descending=reverseOrder?-1:1,compare=isFunction(compareFn)?compareFn:defaultCompare,compareValues=Array.prototype.map.call(array,getComparisonObject);return compareValues.sort(doComparison),array=compareValues.map(function(item){return item.value})}}function ngDirective(directive){return isFunction(directive)&&(directive={link:directive}),directive.restrict=directive.restrict||"AC",valueFn(directive)}function nullFormRenameControl(control,name){control.$name=name}function FormController($element,$attrs,$scope,$animate,$interpolate){this.$$controls=[],
// init state
this.$error={},this.$$success={},this.$pending=void 0,this.$name=$interpolate($attrs.name||$attrs.ngForm||"")($scope),this.$dirty=!1,this.$pristine=!0,this.$valid=!0,this.$invalid=!1,this.$submitted=!1,this.$$parentForm=nullFormCtrl,this.$$element=$element,this.$$animate=$animate,setupValidity(this)}
// helper methods
function setupValidity(instance){instance.$$classCache={},instance.$$classCache[INVALID_CLASS]=!(instance.$$classCache[VALID_CLASS]=instance.$$element.hasClass(VALID_CLASS))}function addSetValidityMethod(context){function createAndSet(ctrl,name,value,controller){ctrl[name]||(ctrl[name]={}),set(ctrl[name],value,controller)}function unsetAndCleanup(ctrl,name,value,controller){ctrl[name]&&unset(ctrl[name],value,controller),isObjectEmpty(ctrl[name])&&(ctrl[name]=void 0)}function cachedToggleClass(ctrl,className,switchValue){switchValue&&!ctrl.$$classCache[className]?(ctrl.$$animate.addClass(ctrl.$$element,className),ctrl.$$classCache[className]=!0):!switchValue&&ctrl.$$classCache[className]&&(ctrl.$$animate.removeClass(ctrl.$$element,className),ctrl.$$classCache[className]=!1)}function toggleValidationCss(ctrl,validationErrorKey,isValid){validationErrorKey=validationErrorKey?"-"+snake_case(validationErrorKey,"-"):"",cachedToggleClass(ctrl,VALID_CLASS+validationErrorKey,isValid===!0),cachedToggleClass(ctrl,INVALID_CLASS+validationErrorKey,isValid===!1)}var clazz=context.clazz,set=context.set,unset=context.unset;clazz.prototype.$setValidity=function(validationErrorKey,state,controller){isUndefined(state)?createAndSet(this,"$pending",validationErrorKey,controller):unsetAndCleanup(this,"$pending",validationErrorKey,controller),isBoolean(state)?state?(unset(this.$error,validationErrorKey,controller),set(this.$$success,validationErrorKey,controller)):(set(this.$error,validationErrorKey,controller),unset(this.$$success,validationErrorKey,controller)):(unset(this.$error,validationErrorKey,controller),unset(this.$$success,validationErrorKey,controller)),this.$pending?(cachedToggleClass(this,PENDING_CLASS,!0),this.$valid=this.$invalid=void 0,toggleValidationCss(this,"",null)):(cachedToggleClass(this,PENDING_CLASS,!1),this.$valid=isObjectEmpty(this.$error),this.$invalid=!this.$valid,toggleValidationCss(this,"",this.$valid));
// re-read the state as the set/unset methods could have
// combined state in this.$error[validationError] (used for forms),
// where setting/unsetting only increments/decrements the value,
// and does not replace it.
var combinedState;combinedState=this.$pending&&this.$pending[validationErrorKey]?void 0:!this.$error[validationErrorKey]&&(!!this.$$success[validationErrorKey]||null),toggleValidationCss(this,validationErrorKey,combinedState),this.$$parentForm.$setValidity(validationErrorKey,combinedState,this)}}function isObjectEmpty(obj){if(obj)for(var prop in obj)if(obj.hasOwnProperty(prop))return!1;return!0}function stringBasedInputType(ctrl){ctrl.$formatters.push(function(value){return ctrl.$isEmpty(value)?value:value.toString()})}function textInputType(scope,element,attr,ctrl,$sniffer,$browser){baseInputType(scope,element,attr,ctrl,$sniffer,$browser),stringBasedInputType(ctrl)}function baseInputType(scope,element,attr,ctrl,$sniffer,$browser){var type=lowercase(element[0].type);
// In composition mode, users are still inputting intermediate text buffer,
// hold the listener until composition is done.
// More about composition events: https://developer.mozilla.org/en-US/docs/Web/API/CompositionEvent
if(!$sniffer.android){var composing=!1;element.on("compositionstart",function(){composing=!0}),element.on("compositionend",function(){composing=!1,listener()})}var timeout,listener=function(ev){if(timeout&&($browser.defer.cancel(timeout),timeout=null),!composing){var value=element.val(),event=ev&&ev.type;
// By default we will trim the value
// If the attribute ng-trim exists we will avoid trimming
// If input type is 'password', the value is never trimmed
"password"===type||attr.ngTrim&&"false"===attr.ngTrim||(value=trim(value)),
// If a control is suffering from bad input (due to native validators), browsers discard its
// value, so it may be necessary to revalidate (by calling $setViewValue again) even if the
// control's value is the same empty value twice in a row.
(ctrl.$viewValue!==value||""===value&&ctrl.$$hasNativeValidators)&&ctrl.$setViewValue(value,event)}};
// if the browser does support "input" event, we are fine - except on IE9 which doesn't fire the
// input event on backspace, delete or cut
if($sniffer.hasEvent("input"))element.on("input",listener);else{var deferListener=function(ev,input,origValue){timeout||(timeout=$browser.defer(function(){timeout=null,input&&input.value===origValue||listener(ev)}))};element.on("keydown",/** @this */function(event){var key=event.keyCode;
// ignore
//    command            modifiers                   arrows
91===key||15<key&&key<19||37<=key&&key<=40||deferListener(event,this,this.value)}),
// if user modifies input value using context menu in IE, we need "paste" and "cut" events to catch it
$sniffer.hasEvent("paste")&&element.on("paste cut",deferListener)}
// if user paste into input using mouse on older browser
// or form autocomplete on newer browser, we need "change" event to catch it
element.on("change",listener),
// Some native input types (date-family) have the ability to change validity without
// firing any input/change events.
// For these event types, when native validators are present and the browser supports the type,
// check for validity changes on various DOM events.
PARTIAL_VALIDATION_TYPES[type]&&ctrl.$$hasNativeValidators&&type===attr.type&&element.on(PARTIAL_VALIDATION_EVENTS,/** @this */function(ev){if(!timeout){var validity=this[VALIDITY_STATE_PROPERTY],origBadInput=validity.badInput,origTypeMismatch=validity.typeMismatch;timeout=$browser.defer(function(){timeout=null,validity.badInput===origBadInput&&validity.typeMismatch===origTypeMismatch||listener(ev)})}}),ctrl.$render=function(){
// Workaround for Firefox validation #12102.
var value=ctrl.$isEmpty(ctrl.$viewValue)?"":ctrl.$viewValue;element.val()!==value&&element.val(value)}}function weekParser(isoWeek,existingDate){if(isDate(isoWeek))return isoWeek;if(isString(isoWeek)){WEEK_REGEXP.lastIndex=0;var parts=WEEK_REGEXP.exec(isoWeek);if(parts){var year=+parts[1],week=+parts[2],hours=0,minutes=0,seconds=0,milliseconds=0,firstThurs=getFirstThursdayOfYear(year),addDays=7*(week-1);return existingDate&&(hours=existingDate.getHours(),minutes=existingDate.getMinutes(),seconds=existingDate.getSeconds(),milliseconds=existingDate.getMilliseconds()),new Date(year,0,firstThurs.getDate()+addDays,hours,minutes,seconds,milliseconds)}}return NaN}function createDateParser(regexp,mapping){return function(iso,date){var parts,map;if(isDate(iso))return iso;if(isString(iso)){if(
// When a date is JSON'ified to wraps itself inside of an extra
// set of double quotes. This makes the date parsing code unable
// to match the date string and parse it as a date.
'"'===iso.charAt(0)&&'"'===iso.charAt(iso.length-1)&&(iso=iso.substring(1,iso.length-1)),ISO_DATE_REGEXP.test(iso))return new Date(iso);if(regexp.lastIndex=0,parts=regexp.exec(iso))return parts.shift(),map=date?{yyyy:date.getFullYear(),MM:date.getMonth()+1,dd:date.getDate(),HH:date.getHours(),mm:date.getMinutes(),ss:date.getSeconds(),sss:date.getMilliseconds()/1e3}:{yyyy:1970,MM:1,dd:1,HH:0,mm:0,ss:0,sss:0},forEach(parts,function(part,index){index<mapping.length&&(map[mapping[index]]=+part)}),new Date(map.yyyy,map.MM-1,map.dd,map.HH,map.mm,map.ss||0,1e3*map.sss||0)}return NaN}}function createDateInputType(type,regexp,parseDate,format){return function(scope,element,attr,ctrl,$sniffer,$browser,$filter){function isValidDate(value){
// Invalid Date: getTime() returns NaN
return value&&!(value.getTime&&value.getTime()!==value.getTime())}function parseObservedDateValue(val){return isDefined(val)&&!isDate(val)?parseDate(val)||void 0:val}badInputChecker(scope,element,attr,ctrl),baseInputType(scope,element,attr,ctrl,$sniffer,$browser);var previousDate,timezone=ctrl&&ctrl.$options.getOption("timezone");if(ctrl.$$parserName=type,ctrl.$parsers.push(function(value){if(ctrl.$isEmpty(value))return null;if(regexp.test(value)){
// Note: We cannot read ctrl.$modelValue, as there might be a different
// parser/formatter in the processing chain so that the model
// contains some different data format!
var parsedDate=parseDate(value,previousDate);return timezone&&(parsedDate=convertTimezoneToLocal(parsedDate,timezone)),parsedDate}}),ctrl.$formatters.push(function(value){if(value&&!isDate(value))throw ngModelMinErr("datefmt","Expected `{0}` to be a date",value);return isValidDate(value)?(previousDate=value,previousDate&&timezone&&(previousDate=convertTimezoneToLocal(previousDate,timezone,!0)),$filter("date")(value,format,timezone)):(previousDate=null,"")}),isDefined(attr.min)||attr.ngMin){var minVal;ctrl.$validators.min=function(value){return!isValidDate(value)||isUndefined(minVal)||parseDate(value)>=minVal},attr.$observe("min",function(val){minVal=parseObservedDateValue(val),ctrl.$validate()})}if(isDefined(attr.max)||attr.ngMax){var maxVal;ctrl.$validators.max=function(value){return!isValidDate(value)||isUndefined(maxVal)||parseDate(value)<=maxVal},attr.$observe("max",function(val){maxVal=parseObservedDateValue(val),ctrl.$validate()})}}}function badInputChecker(scope,element,attr,ctrl){var node=element[0],nativeValidation=ctrl.$$hasNativeValidators=isObject(node.validity);nativeValidation&&ctrl.$parsers.push(function(value){var validity=element.prop(VALIDITY_STATE_PROPERTY)||{};return validity.badInput||validity.typeMismatch?void 0:value})}function numberFormatterParser(ctrl){ctrl.$$parserName="number",ctrl.$parsers.push(function(value){return ctrl.$isEmpty(value)?null:NUMBER_REGEXP.test(value)?parseFloat(value):void 0}),ctrl.$formatters.push(function(value){if(!ctrl.$isEmpty(value)){if(!isNumber(value))throw ngModelMinErr("numfmt","Expected `{0}` to be a number",value);value=value.toString()}return value})}function parseNumberAttrVal(val){return isDefined(val)&&!isNumber(val)&&(val=parseFloat(val)),isNumberNaN(val)?void 0:val}function isNumberInteger(num){
// See http://stackoverflow.com/questions/14636536/how-to-check-if-a-variable-is-an-integer-in-javascript#14794066
// (minus the assumption that `num` is a number)
// eslint-disable-next-line no-bitwise
return(0|num)===num}function countDecimals(num){var numString=num.toString(),decimalSymbolIndex=numString.indexOf(".");if(decimalSymbolIndex===-1){if(-1<num&&num<1){
// It may be in the exponential notation format (`1e-X`)
var match=/e-(\d+)$/.exec(numString);if(match)return Number(match[1])}return 0}return numString.length-decimalSymbolIndex-1}function isValidForStep(viewValue,stepBase,step){
// At this point `stepBase` and `step` are expected to be non-NaN values
// and `viewValue` is expected to be a valid stringified number.
var value=Number(viewValue),isNonIntegerValue=!isNumberInteger(value),isNonIntegerStepBase=!isNumberInteger(stepBase),isNonIntegerStep=!isNumberInteger(step);
// Due to limitations in Floating Point Arithmetic (e.g. `0.3 - 0.2 !== 0.1` or
// `0.5 % 0.1 !== 0`), we need to convert all numbers to integers.
if(isNonIntegerValue||isNonIntegerStepBase||isNonIntegerStep){var valueDecimals=isNonIntegerValue?countDecimals(value):0,stepBaseDecimals=isNonIntegerStepBase?countDecimals(stepBase):0,stepDecimals=isNonIntegerStep?countDecimals(step):0,decimalCount=Math.max(valueDecimals,stepBaseDecimals,stepDecimals),multiplier=Math.pow(10,decimalCount);value*=multiplier,stepBase*=multiplier,step*=multiplier,isNonIntegerValue&&(value=Math.round(value)),isNonIntegerStepBase&&(stepBase=Math.round(stepBase)),isNonIntegerStep&&(step=Math.round(step))}return(value-stepBase)%step===0}function numberInputType(scope,element,attr,ctrl,$sniffer,$browser){badInputChecker(scope,element,attr,ctrl),numberFormatterParser(ctrl),baseInputType(scope,element,attr,ctrl,$sniffer,$browser);var minVal,maxVal;if((isDefined(attr.min)||attr.ngMin)&&(ctrl.$validators.min=function(value){return ctrl.$isEmpty(value)||isUndefined(minVal)||value>=minVal},attr.$observe("min",function(val){minVal=parseNumberAttrVal(val),
// TODO(matsko): implement validateLater to reduce number of validations
ctrl.$validate()})),(isDefined(attr.max)||attr.ngMax)&&(ctrl.$validators.max=function(value){return ctrl.$isEmpty(value)||isUndefined(maxVal)||value<=maxVal},attr.$observe("max",function(val){maxVal=parseNumberAttrVal(val),
// TODO(matsko): implement validateLater to reduce number of validations
ctrl.$validate()})),isDefined(attr.step)||attr.ngStep){var stepVal;ctrl.$validators.step=function(modelValue,viewValue){return ctrl.$isEmpty(viewValue)||isUndefined(stepVal)||isValidForStep(viewValue,minVal||0,stepVal)},attr.$observe("step",function(val){stepVal=parseNumberAttrVal(val),
// TODO(matsko): implement validateLater to reduce number of validations
ctrl.$validate()})}}function rangeInputType(scope,element,attr,ctrl,$sniffer,$browser){function setInitialValueAndObserver(htmlAttrName,changeFn){
// interpolated attributes set the attribute value only after a digest, but we need the
// attribute value when the input is first rendered, so that the browser can adjust the
// input value based on the min/max value
element.attr(htmlAttrName,attr[htmlAttrName]),attr.$observe(htmlAttrName,changeFn)}function minChange(val){
// ignore changes before model is initialized
if(minVal=parseNumberAttrVal(val),!isNumberNaN(ctrl.$modelValue))if(supportsRange){var elVal=element.val();
// IE11 doesn't set the el val correctly if the minVal is greater than the element value
minVal>elVal&&(elVal=minVal,element.val(elVal)),ctrl.$setViewValue(elVal)}else
// TODO(matsko): implement validateLater to reduce number of validations
ctrl.$validate()}function maxChange(val){
// ignore changes before model is initialized
if(maxVal=parseNumberAttrVal(val),!isNumberNaN(ctrl.$modelValue))if(supportsRange){var elVal=element.val();
// IE11 doesn't set the el val correctly if the maxVal is less than the element value
maxVal<elVal&&(element.val(maxVal),
// IE11 and Chrome don't set the value to the minVal when max < min
elVal=maxVal<minVal?minVal:maxVal),ctrl.$setViewValue(elVal)}else
// TODO(matsko): implement validateLater to reduce number of validations
ctrl.$validate()}function stepChange(val){stepVal=parseNumberAttrVal(val),
// ignore changes before model is initialized
isNumberNaN(ctrl.$modelValue)||(
// Some browsers don't adjust the input value correctly, but set the stepMismatch error
supportsRange&&ctrl.$viewValue!==element.val()?ctrl.$setViewValue(element.val()):
// TODO(matsko): implement validateLater to reduce number of validations
ctrl.$validate())}badInputChecker(scope,element,attr,ctrl),numberFormatterParser(ctrl),baseInputType(scope,element,attr,ctrl,$sniffer,$browser);var supportsRange=ctrl.$$hasNativeValidators&&"range"===element[0].type,minVal=supportsRange?0:void 0,maxVal=supportsRange?100:void 0,stepVal=supportsRange?1:void 0,validity=element[0].validity,hasMinAttr=isDefined(attr.min),hasMaxAttr=isDefined(attr.max),hasStepAttr=isDefined(attr.step),originalRender=ctrl.$render;ctrl.$render=supportsRange&&isDefined(validity.rangeUnderflow)&&isDefined(validity.rangeOverflow)?
//Browsers that implement range will set these values automatically, but reading the adjusted values after
//$render would cause the min / max validators to be applied with the wrong value
function(){originalRender(),ctrl.$setViewValue(element.val())}:originalRender,hasMinAttr&&(ctrl.$validators.min=supportsRange?
// Since all browsers set the input to a valid value, we don't need to check validity
function(){return!0}:
// non-support browsers validate the min val
function(modelValue,viewValue){return ctrl.$isEmpty(viewValue)||isUndefined(minVal)||viewValue>=minVal},setInitialValueAndObserver("min",minChange)),hasMaxAttr&&(ctrl.$validators.max=supportsRange?
// Since all browsers set the input to a valid value, we don't need to check validity
function(){return!0}:
// non-support browsers validate the max val
function(modelValue,viewValue){return ctrl.$isEmpty(viewValue)||isUndefined(maxVal)||viewValue<=maxVal},setInitialValueAndObserver("max",maxChange)),hasStepAttr&&(ctrl.$validators.step=supportsRange?function(){
// Currently, only FF implements the spec on step change correctly (i.e. adjusting the
// input element value to a valid value). It's possible that other browsers set the stepMismatch
// validity error instead, so we can at least report an error in that case.
return!validity.stepMismatch}:
// ngStep doesn't set the setp attr, so the browser doesn't adjust the input value as setting step would
function(modelValue,viewValue){return ctrl.$isEmpty(viewValue)||isUndefined(stepVal)||isValidForStep(viewValue,minVal||0,stepVal)},setInitialValueAndObserver("step",stepChange))}function urlInputType(scope,element,attr,ctrl,$sniffer,$browser){
// Note: no badInputChecker here by purpose as `url` is only a validation
// in browsers, i.e. we can always read out input.value even if it is not valid!
baseInputType(scope,element,attr,ctrl,$sniffer,$browser),stringBasedInputType(ctrl),ctrl.$$parserName="url",ctrl.$validators.url=function(modelValue,viewValue){var value=modelValue||viewValue;return ctrl.$isEmpty(value)||URL_REGEXP.test(value)}}function emailInputType(scope,element,attr,ctrl,$sniffer,$browser){
// Note: no badInputChecker here by purpose as `url` is only a validation
// in browsers, i.e. we can always read out input.value even if it is not valid!
baseInputType(scope,element,attr,ctrl,$sniffer,$browser),stringBasedInputType(ctrl),ctrl.$$parserName="email",ctrl.$validators.email=function(modelValue,viewValue){var value=modelValue||viewValue;return ctrl.$isEmpty(value)||EMAIL_REGEXP.test(value)}}function radioInputType(scope,element,attr,ctrl){var doTrim=!attr.ngTrim||"false"!==trim(attr.ngTrim);
// make the name unique, if not defined
isUndefined(attr.name)&&element.attr("name",nextUid());var listener=function(ev){var value;element[0].checked&&(value=attr.value,doTrim&&(value=trim(value)),ctrl.$setViewValue(value,ev&&ev.type))};element.on("click",listener),ctrl.$render=function(){var value=attr.value;doTrim&&(value=trim(value)),element[0].checked=value===ctrl.$viewValue},attr.$observe("value",ctrl.$render)}function parseConstantExpr($parse,context,name,expression,fallback){var parseFn;if(isDefined(expression)){if(parseFn=$parse(expression),!parseFn.constant)throw ngModelMinErr("constexpr","Expected constant expression for `{0}`, but saw `{1}`.",name,expression);return parseFn(context)}return fallback}function checkboxInputType(scope,element,attr,ctrl,$sniffer,$browser,$filter,$parse){var trueValue=parseConstantExpr($parse,scope,"ngTrueValue",attr.ngTrueValue,!0),falseValue=parseConstantExpr($parse,scope,"ngFalseValue",attr.ngFalseValue,!1),listener=function(ev){ctrl.$setViewValue(element[0].checked,ev&&ev.type)};element.on("click",listener),ctrl.$render=function(){element[0].checked=ctrl.$viewValue},
// Override the standard `$isEmpty` because the $viewValue of an empty checkbox is always set to `false`
// This is because of the parser below, which compares the `$modelValue` with `trueValue` to convert
// it to a boolean.
ctrl.$isEmpty=function(value){return value===!1},ctrl.$formatters.push(function(value){return equals(value,trueValue)}),ctrl.$parsers.push(function(value){return value?trueValue:falseValue})}/* exported
  ngClassDirective,
  ngClassEvenDirective,
  ngClassOddDirective
*/
function classDirective(name,selector){
// Helpers
function arrayDifference(tokens1,tokens2){if(!tokens1||!tokens1.length)return[];if(!tokens2||!tokens2.length)return tokens1;var values=[];outer:for(var i=0;i<tokens1.length;i++){for(var token=tokens1[i],j=0;j<tokens2.length;j++)if(token===tokens2[j])continue outer;values.push(token)}return values}function split(classString){return classString&&classString.split(" ")}function toClassString(classValue){var classString=classValue;return isArray(classValue)?classString=classValue.map(toClassString).join(" "):isObject(classValue)&&(classString=Object.keys(classValue).filter(function(key){return classValue[key]}).join(" ")),classString}name="ngClass"+name;var indexWatchExpression;return["$parse",function($parse){return{restrict:"AC",link:function(scope,element,attr){function addClasses(classString){classString=digestClassCounts(split(classString),1),attr.$addClass(classString)}function removeClasses(classString){classString=digestClassCounts(split(classString),-1),attr.$removeClass(classString)}function updateClasses(oldClassString,newClassString){var oldClassArray=split(oldClassString),newClassArray=split(newClassString),toRemoveArray=arrayDifference(oldClassArray,newClassArray),toAddArray=arrayDifference(newClassArray,oldClassArray),toRemoveString=digestClassCounts(toRemoveArray,-1),toAddString=digestClassCounts(toAddArray,1);attr.$addClass(toAddString),attr.$removeClass(toRemoveString)}function digestClassCounts(classArray,count){var classesToUpdate=[];return forEach(classArray,function(className){(count>0||classCounts[className])&&(classCounts[className]=(classCounts[className]||0)+count,classCounts[className]===+(count>0)&&classesToUpdate.push(className))}),classesToUpdate.join(" ")}function ngClassIndexWatchAction(newModulo){
// This watch-action should run before the `ngClassWatchAction()`, thus it
// adds/removes `oldClassString`. If the `ngClass` expression has changed as well, the
// `ngClassWatchAction()` will update the classes.
newModulo===selector?addClasses(oldClassString):removeClasses(oldClassString),oldModulo=newModulo}function ngClassWatchAction(newClassString){
// When using a one-time binding the newClassString will return
// the pre-interceptor value until the one-time is complete
isString(newClassString)||(newClassString=toClassString(newClassString)),oldModulo===selector&&updateClasses(oldClassString,newClassString),oldClassString=newClassString}var oldClassString,classCounts=element.data("$classCounts"),oldModulo=!0;classCounts||(
// Use createMap() to prevent class assumptions involving property
// names in Object.prototype
classCounts=createMap(),element.data("$classCounts",classCounts)),"ngClass"!==name&&(indexWatchExpression||(indexWatchExpression=$parse("$index",function($index){
// eslint-disable-next-line no-bitwise
return 1&$index})),scope.$watch(indexWatchExpression,ngClassIndexWatchAction)),scope.$watch($parse(attr[name],toClassString),ngClassWatchAction)}}}]}function NgModelController($scope,$exceptionHandler,$attr,$element,$parse,$animate,$timeout,$q,$interpolate){this.$viewValue=Number.NaN,this.$modelValue=Number.NaN,this.$$rawModelValue=void 0,// stores the parsed modelValue / model set from scope regardless of validity.
this.$validators={},this.$asyncValidators={},this.$parsers=[],this.$formatters=[],this.$viewChangeListeners=[],this.$untouched=!0,this.$touched=!1,this.$pristine=!0,this.$dirty=!1,this.$valid=!0,this.$invalid=!1,this.$error={},// keep invalid keys here
this.$$success={},// keep valid keys here
this.$pending=void 0,// keep pending keys here
this.$name=$interpolate($attr.name||"",!1)($scope),this.$$parentForm=nullFormCtrl,this.$options=defaultModelOptions,this.$$parsedNgModel=$parse($attr.ngModel),this.$$parsedNgModelAssign=this.$$parsedNgModel.assign,this.$$ngModelGet=this.$$parsedNgModel,this.$$ngModelSet=this.$$parsedNgModelAssign,this.$$pendingDebounce=null,this.$$parserValid=void 0,this.$$currentValidationRunId=0,
// https://github.com/angular/angular.js/issues/15833
// Prevent `$$scope` from being iterated over by `copy` when NgModelController is deep watched
Object.defineProperty(this,"$$scope",{value:$scope}),this.$$attr=$attr,this.$$element=$element,this.$$animate=$animate,this.$$timeout=$timeout,this.$$parse=$parse,this.$$q=$q,this.$$exceptionHandler=$exceptionHandler,setupValidity(this),setupModelWatcher(this)}function setupModelWatcher(ctrl){
// model -> value
// Note: we cannot use a normal scope.$watch as we want to detect the following:
// 1. scope value is 'a'
// 2. user enters 'b'
// 3. ng-change kicks in and reverts scope value to 'a'
//    -> scope value did not change since the last digest as
//       ng-change executes in apply phase
// 4. view should be changed back to 'a'
ctrl.$$scope.$watch(function(scope){var modelValue=ctrl.$$ngModelGet(scope);
// if scope model value and ngModel value are out of sync
// TODO(perf): why not move this to the action fn?
if(modelValue!==ctrl.$modelValue&&(
// checks for NaN is needed to allow setting the model to NaN when there's an asyncValidator
// eslint-disable-next-line no-self-compare
ctrl.$modelValue===ctrl.$modelValue||modelValue===modelValue)){ctrl.$modelValue=ctrl.$$rawModelValue=modelValue,ctrl.$$parserValid=void 0;for(var formatters=ctrl.$formatters,idx=formatters.length,viewValue=modelValue;idx--;)viewValue=formatters[idx](viewValue);ctrl.$viewValue!==viewValue&&(ctrl.$$updateEmptyClasses(viewValue),ctrl.$viewValue=ctrl.$$lastCommittedViewValue=viewValue,ctrl.$render(),
// It is possible that model and view value have been updated during render
ctrl.$$runValidators(ctrl.$modelValue,ctrl.$viewValue,noop))}return modelValue})}/**
 * @ngdoc type
 * @name ModelOptions
 * @description
 * A container for the options set by the {@link ngModelOptions} directive
 */
function ModelOptions(options){this.$$options=options}
// shallow copy over values from `src` that are not already specified on `dst`
function defaults(dst,src){forEach(src,function(value,key){isDefined(dst[key])||(dst[key]=value)})}function setOptionSelectedStatus(optionEl,value){optionEl.prop("selected",value),// needed for IE
/**
   * When unselecting an option, setting the property to null / false should be enough
   * However, screenreaders might react to the selected attribute instead, see
   * https://github.com/angular/angular.js/issues/14419
   * Note: "selected" is a boolean attr and will be removed when the "value" arg in attr() is false
   * or null
   */
optionEl.attr("selected",value)}/* We need to tell ESLint what variables are being exported */
/* exported
  angular,
  msie,
  jqLite,
  jQuery,
  slice,
  splice,
  push,
  toString,
  minErrConfig,
  errorHandlingConfig,
  isValidObjectMaxDepth,
  ngMinErr,
  angularModule,
  uid,
  REGEX_STRING_REGEXP,
  VALIDITY_STATE_PROPERTY,

  lowercase,
  uppercase,
  manualLowercase,
  manualUppercase,
  nodeName_,
  isArrayLike,
  forEach,
  forEachSorted,
  reverseParams,
  nextUid,
  setHashKey,
  extend,
  toInt,
  inherit,
  merge,
  noop,
  identity,
  valueFn,
  isUndefined,
  isDefined,
  isObject,
  isBlankObject,
  isString,
  isNumber,
  isNumberNaN,
  isDate,
  isArray,
  isFunction,
  isRegExp,
  isWindow,
  isScope,
  isFile,
  isFormData,
  isBlob,
  isBoolean,
  isPromiseLike,
  trim,
  escapeForRegexp,
  isElement,
  makeMap,
  includes,
  arrayRemove,
  copy,
  simpleCompare,
  equals,
  csp,
  jq,
  concat,
  sliceArgs,
  bind,
  toJsonReplacer,
  toJson,
  fromJson,
  convertTimezoneToLocal,
  timezoneToOffset,
  startingTag,
  tryDecodeURIComponent,
  parseKeyValue,
  toKeyValue,
  encodeUriSegment,
  encodeUriQuery,
  angularInit,
  bootstrap,
  getTestability,
  snake_case,
  bindJQuery,
  assertArg,
  assertArgFn,
  assertNotHasOwnProperty,
  getter,
  getBlockNodes,
  hasOwnProperty,
  createMap,
  stringify,

  NODE_TYPE_ELEMENT,
  NODE_TYPE_ATTRIBUTE,
  NODE_TYPE_TEXT,
  NODE_TYPE_COMMENT,
  NODE_TYPE_DOCUMENT,
  NODE_TYPE_DOCUMENT_FRAGMENT
*/
////////////////////////////////////
/**
 * @ngdoc module
 * @name ng
 * @module ng
 * @installation
 * @description
 *
 * # ng (core module)
 * The ng module is loaded by default when an AngularJS application is started. The module itself
 * contains the essential components for an AngularJS application to function. The table below
 * lists a high level breakdown of each of the services/factories, filters, directives and testing
 * components available within this core module.
 *
 * <div doc-module-components="ng"></div>
 */
var REGEX_STRING_REGEXP=/^\/(.+)\/([a-z]*)$/,VALIDITY_STATE_PROPERTY="validity",hasOwnProperty=Object.prototype.hasOwnProperty,minErrConfig={objectMaxDepth:5},lowercase=function(string){return isString(string)?string.toLowerCase():string},uppercase=function(string){return isString(string)?string.toUpperCase():string},manualLowercase=function(s){/* eslint-disable no-bitwise */
return isString(s)?s.replace(/[A-Z]/g,function(ch){return String.fromCharCode(32|ch.charCodeAt(0))}):s},manualUppercase=function(s){/* eslint-disable no-bitwise */
return isString(s)?s.replace(/[a-z]/g,function(ch){return String.fromCharCode(ch.charCodeAt(0)&-33)}):s};
// String#toLowerCase and String#toUpperCase don't produce correct results in browsers with Turkish
// locale, for this reason we need to detect this case and redefine lowercase/uppercase methods
// with correct but slower alternatives. See https://github.com/angular/angular.js/issues/11387
"i"!=="I".toLowerCase()&&(lowercase=manualLowercase,uppercase=manualUppercase);var msie,// holds major version number for IE, or NaN if UA is not IE.
jqLite,// delay binding since jQuery could be loaded after us.
jQuery,angularModule,// delay binding
slice=[].slice,splice=[].splice,push=[].push,toString=Object.prototype.toString,getPrototypeOf=Object.getPrototypeOf,ngMinErr=minErr("ng"),/** @name angular */
angular=window.angular||(window.angular={}),uid=0;
// Support: IE 9-11 only
/**
 * documentMode is an IE-only property
 * http://msdn.microsoft.com/en-us/library/ie/cc196988(v=vs.85).aspx
 */
msie=window.document.documentMode;var isNumberNaN=Number.isNaN||function(num){
// eslint-disable-next-line no-self-compare
return num!==num};noop.$inject=[],identity.$inject=[];/**
 * @ngdoc function
 * @name angular.isArray
 * @module ng
 * @kind function
 *
 * @description
 * Determines if a reference is an `Array`. Alias of Array.isArray.
 *
 * @param {*} value Reference to check.
 * @returns {boolean} True if `value` is an `Array`.
 */
var isArray=Array.isArray,TYPED_ARRAY_REGEXP=/^\[object (?:Uint8|Uint8Clamped|Uint16|Uint32|Int8|Int16|Int32|Float32|Float64)Array]$/,trim=function(value){return isString(value)?value.trim():value},escapeForRegexp=function(s){return s.replace(/([-()[\]{}+?*.$^|,:#<!\\])/g,"\\$1").replace(/\x08/g,"\\x08")},csp=function(){function noUnsafeEval(){try{
// eslint-disable-next-line no-new, no-new-func
return new Function(""),!1}catch(e){return!0}}if(!isDefined(csp.rules)){var ngCspElement=window.document.querySelector("[ng-csp]")||window.document.querySelector("[data-ng-csp]");if(ngCspElement){var ngCspAttribute=ngCspElement.getAttribute("ng-csp")||ngCspElement.getAttribute("data-ng-csp");csp.rules={noUnsafeEval:!ngCspAttribute||ngCspAttribute.indexOf("no-unsafe-eval")!==-1,noInlineStyle:!ngCspAttribute||ngCspAttribute.indexOf("no-inline-style")!==-1}}else csp.rules={noUnsafeEval:noUnsafeEval(),noInlineStyle:!1}}return csp.rules},jq=function(){if(isDefined(jq.name_))return jq.name_;var el,i,prefix,name,ii=ngAttrPrefixes.length;for(i=0;i<ii;++i)if(prefix=ngAttrPrefixes[i],el=window.document.querySelector("["+prefix.replace(":","\\:")+"jq]")){name=el.getAttribute(prefix+"jq");break}return jq.name_=name},ALL_COLONS=/:/g,ngAttrPrefixes=["ng-","data-ng-","ng:","x-ng-"],isAutoBootstrapAllowed=allowAutoBootstrap(window.document),SNAKE_CASE_REGEXP=/[A-Z]/g,bindJQueryFired=!1,NODE_TYPE_ELEMENT=1,NODE_TYPE_ATTRIBUTE=2,NODE_TYPE_TEXT=3,NODE_TYPE_COMMENT=8,NODE_TYPE_DOCUMENT=9,NODE_TYPE_DOCUMENT_FRAGMENT=11,version={
// These placeholder strings will be replaced by grunt's `build` task.
// They need to be double- or single-quoted.
full:"1.6.4",major:1,minor:6,dot:4,codeName:"phenomenal-footnote"};/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 *     Any commits to this file should be reviewed with security in mind.  *
 *   Changes to this file can potentially create security vulnerabilities. *
 *          An approval from 2 Core members with history of modifying      *
 *                         this file is required.                          *
 *                                                                         *
 *  Does the change somehow allow for arbitrary javascript to be executed? *
 *    Or allows for someone to change the prototype of built-in objects?   *
 *     Or gives undesired access to variables likes document or window?    *
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */
/* global
  JQLitePrototype: true,
  BOOLEAN_ATTR: true,
  ALIASED_ATTR: true
*/
//////////////////////////////////
//JQLite
//////////////////////////////////
/**
 * @ngdoc function
 * @name angular.element
 * @module ng
 * @kind function
 *
 * @description
 * Wraps a raw DOM element or HTML string as a [jQuery](http://jquery.com) element.
 *
 * If jQuery is available, `angular.element` is an alias for the
 * [jQuery](http://api.jquery.com/jQuery/) function. If jQuery is not available, `angular.element`
 * delegates to Angular's built-in subset of jQuery, called "jQuery lite" or **jqLite**.
 *
 * jqLite is a tiny, API-compatible subset of jQuery that allows
 * Angular to manipulate the DOM in a cross-browser compatible way. jqLite implements only the most
 * commonly needed functionality with the goal of having a very small footprint.
 *
 * To use `jQuery`, simply ensure it is loaded before the `angular.js` file. You can also use the
 * {@link ngJq `ngJq`} directive to specify that jqlite should be used over jQuery, or to use a
 * specific version of jQuery if multiple versions exist on the page.
 *
 * <div class="alert alert-info">**Note:** All element references in Angular are always wrapped with jQuery or
 * jqLite (such as the element argument in a directive's compile / link function). They are never raw DOM references.</div>
 *
 * <div class="alert alert-warning">**Note:** Keep in mind that this function will not find elements
 * by tag name / CSS selector. For lookups by tag name, try instead `angular.element(document).find(...)`
 * or `$document.find()`, or use the standard DOM APIs, e.g. `document.querySelectorAll()`.</div>
 *
 * ## Angular's jqLite
 * jqLite provides only the following jQuery methods:
 *
 * - [`addClass()`](http://api.jquery.com/addClass/) - Does not support a function as first argument
 * - [`after()`](http://api.jquery.com/after/)
 * - [`append()`](http://api.jquery.com/append/)
 * - [`attr()`](http://api.jquery.com/attr/) - Does not support functions as parameters
 * - [`bind()`](http://api.jquery.com/bind/) (_deprecated_, use [`on()`](http://api.jquery.com/on/)) - Does not support namespaces, selectors or eventData
 * - [`children()`](http://api.jquery.com/children/) - Does not support selectors
 * - [`clone()`](http://api.jquery.com/clone/)
 * - [`contents()`](http://api.jquery.com/contents/)
 * - [`css()`](http://api.jquery.com/css/) - Only retrieves inline-styles, does not call `getComputedStyle()`.
 *   As a setter, does not convert numbers to strings or append 'px', and also does not have automatic property prefixing.
 * - [`data()`](http://api.jquery.com/data/)
 * - [`detach()`](http://api.jquery.com/detach/)
 * - [`empty()`](http://api.jquery.com/empty/)
 * - [`eq()`](http://api.jquery.com/eq/)
 * - [`find()`](http://api.jquery.com/find/) - Limited to lookups by tag name
 * - [`hasClass()`](http://api.jquery.com/hasClass/)
 * - [`html()`](http://api.jquery.com/html/)
 * - [`next()`](http://api.jquery.com/next/) - Does not support selectors
 * - [`on()`](http://api.jquery.com/on/) - Does not support namespaces, selectors or eventData
 * - [`off()`](http://api.jquery.com/off/) - Does not support namespaces, selectors or event object as parameter
 * - [`one()`](http://api.jquery.com/one/) - Does not support namespaces or selectors
 * - [`parent()`](http://api.jquery.com/parent/) - Does not support selectors
 * - [`prepend()`](http://api.jquery.com/prepend/)
 * - [`prop()`](http://api.jquery.com/prop/)
 * - [`ready()`](http://api.jquery.com/ready/) (_deprecated_, use `angular.element(callback)` instead of `angular.element(document).ready(callback)`)
 * - [`remove()`](http://api.jquery.com/remove/)
 * - [`removeAttr()`](http://api.jquery.com/removeAttr/) - Does not support multiple attributes
 * - [`removeClass()`](http://api.jquery.com/removeClass/) - Does not support a function as first argument
 * - [`removeData()`](http://api.jquery.com/removeData/)
 * - [`replaceWith()`](http://api.jquery.com/replaceWith/)
 * - [`text()`](http://api.jquery.com/text/)
 * - [`toggleClass()`](http://api.jquery.com/toggleClass/) - Does not support a function as first argument
 * - [`triggerHandler()`](http://api.jquery.com/triggerHandler/) - Passes a dummy event object to handlers
 * - [`unbind()`](http://api.jquery.com/unbind/) (_deprecated_, use [`off()`](http://api.jquery.com/off/)) - Does not support namespaces or event object as parameter
 * - [`val()`](http://api.jquery.com/val/)
 * - [`wrap()`](http://api.jquery.com/wrap/)
 *
 * ## jQuery/jqLite Extras
 * Angular also provides the following additional methods and events to both jQuery and jqLite:
 *
 * ### Events
 * - `$destroy` - AngularJS intercepts all jqLite/jQuery's DOM destruction apis and fires this event
 *    on all DOM nodes being removed.  This can be used to clean up any 3rd party bindings to the DOM
 *    element before it is removed.
 *
 * ### Methods
 * - `controller(name)` - retrieves the controller of the current element or its parent. By default
 *   retrieves controller associated with the `ngController` directive. If `name` is provided as
 *   camelCase directive name, then the controller for this directive will be retrieved (e.g.
 *   `'ngModel'`).
 * - `injector()` - retrieves the injector of the current element or its parent.
 * - `scope()` - retrieves the {@link ng.$rootScope.Scope scope} of the current
 *   element or its parent. Requires {@link guide/production#disabling-debug-data Debug Data} to
 *   be enabled.
 * - `isolateScope()` - retrieves an isolate {@link ng.$rootScope.Scope scope} if one is attached directly to the
 *   current element. This getter should be used only on elements that contain a directive which starts a new isolate
 *   scope. Calling `scope()` on this element always returns the original non-isolate scope.
 *   Requires {@link guide/production#disabling-debug-data Debug Data} to be enabled.
 * - `inheritedData()` - same as `data()`, but walks up the DOM until a value is found or the top
 *   parent element is reached.
 *
 * @knownIssue You cannot spy on `angular.element` if you are using Jasmine version 1.x. See
 * https://github.com/angular/angular.js/issues/14251 for more information.
 *
 * @param {string|DOMElement} element HTML string or DOMElement to be wrapped into jQuery.
 * @returns {Object} jQuery object.
 */
JQLite.expando="ng339";var jqCache=JQLite.cache={},jqId=1;/*
 * !!! This is an undocumented "private" function !!!
 */
JQLite._data=function(node){
//jQuery always returns an object on cache miss
return this.cache[node[this.expando]]||{}};var DASH_LOWERCASE_REGEXP=/-([a-z])/g,MS_HACK_REGEXP=/^-ms-/,MOUSE_EVENT_MAP={mouseleave:"mouseout",mouseenter:"mouseover"},jqLiteMinErr=minErr("jqLite"),SINGLE_TAG_REGEXP=/^<([\w-]+)\s*\/?>(?:<\/\1>|)$/,HTML_REGEXP=/<|&#?\w+;/,TAG_NAME_REGEXP=/<([\w:-]+)/,XHTML_TAG_REGEXP=/<(?!area|br|col|embed|hr|img|input|link|meta|param)(([\w:-]+)[^>]*)\/>/gi,wrapMap={option:[1,'<select multiple="multiple">',"</select>"],thead:[1,"<table>","</table>"],col:[2,"<table><colgroup>","</colgroup></table>"],tr:[2,"<table><tbody>","</tbody></table>"],td:[3,"<table><tbody><tr>","</tr></tbody></table>"],_default:[0,"",""]};wrapMap.optgroup=wrapMap.option,wrapMap.tbody=wrapMap.tfoot=wrapMap.colgroup=wrapMap.caption=wrapMap.thead,wrapMap.th=wrapMap.td;
// IE9-11 has no method "contains" in SVG element and in Node.prototype. Bug #10259.
var jqLiteContains=window.Node.prototype.contains||/** @this */function(arg){
// eslint-disable-next-line no-bitwise
return!!(16&this.compareDocumentPosition(arg))},JQLitePrototype=JQLite.prototype={ready:jqLiteReady,toString:function(){var value=[];return forEach(this,function(e){value.push(""+e)}),"["+value.join(", ")+"]"},eq:function(index){return jqLite(index>=0?this[index]:this[this.length+index])},length:0,push:push,sort:[].sort,splice:[].splice},BOOLEAN_ATTR={};forEach("multiple,selected,checked,disabled,readOnly,required,open".split(","),function(value){BOOLEAN_ATTR[lowercase(value)]=value});var BOOLEAN_ELEMENTS={};forEach("input,select,option,textarea,button,form,details".split(","),function(value){BOOLEAN_ELEMENTS[value]=!0});var ALIASED_ATTR={ngMinlength:"minlength",ngMaxlength:"maxlength",ngMin:"min",ngMax:"max",ngPattern:"pattern",ngStep:"step"};forEach({data:jqLiteData,removeData:jqLiteRemoveData,hasData:jqLiteHasData,cleanData:function(nodes){for(var i=0,ii=nodes.length;i<ii;i++)jqLiteRemoveData(nodes[i])}},function(fn,name){JQLite[name]=fn}),forEach({data:jqLiteData,inheritedData:jqLiteInheritedData,scope:function(element){
// Can't use jqLiteData here directly so we stay compatible with jQuery!
return jqLite.data(element,"$scope")||jqLiteInheritedData(element.parentNode||element,["$isolateScope","$scope"])},isolateScope:function(element){
// Can't use jqLiteData here directly so we stay compatible with jQuery!
return jqLite.data(element,"$isolateScope")||jqLite.data(element,"$isolateScopeNoTemplate")},controller:jqLiteController,injector:function(element){return jqLiteInheritedData(element,"$injector")},removeAttr:function(element,name){element.removeAttribute(name)},hasClass:jqLiteHasClass,css:function(element,name,value){return name=cssKebabToCamel(name),isDefined(value)?void(element.style[name]=value):element.style[name]},attr:function(element,name,value){var ret,nodeType=element.nodeType;if(nodeType!==NODE_TYPE_TEXT&&nodeType!==NODE_TYPE_ATTRIBUTE&&nodeType!==NODE_TYPE_COMMENT&&element.getAttribute){var lowercasedName=lowercase(name),isBooleanAttr=BOOLEAN_ATTR[lowercasedName];
// setter
// getter
return isDefined(value)?void(null===value||value===!1&&isBooleanAttr?element.removeAttribute(name):element.setAttribute(name,isBooleanAttr?lowercasedName:value)):(ret=element.getAttribute(name),isBooleanAttr&&null!==ret&&(ret=lowercasedName),null===ret?void 0:ret)}},prop:function(element,name,value){return isDefined(value)?void(element[name]=value):element[name]},text:function(){function getText(element,value){if(isUndefined(value)){var nodeType=element.nodeType;return nodeType===NODE_TYPE_ELEMENT||nodeType===NODE_TYPE_TEXT?element.textContent:""}element.textContent=value}return getText.$dv="",getText}(),val:function(element,value){if(isUndefined(value)){if(element.multiple&&"select"===nodeName_(element)){var result=[];return forEach(element.options,function(option){option.selected&&result.push(option.value||option.text)}),result}return element.value}element.value=value},html:function(element,value){return isUndefined(value)?element.innerHTML:(jqLiteDealoc(element,!0),void(element.innerHTML=value))},empty:jqLiteEmpty},function(fn,name){/**
   * Properties: writes return selection, reads return first value
   */
JQLite.prototype[name]=function(arg1,arg2){var i,key,nodeCount=this.length;
// jqLiteHasClass has only two arguments, but is a getter-only fn, so we need to special-case it
// in a way that survives minification.
// jqLiteEmpty takes no arguments but is a setter.
if(fn!==jqLiteEmpty&&isUndefined(2===fn.length&&fn!==jqLiteHasClass&&fn!==jqLiteController?arg1:arg2)){if(isObject(arg1)){
// we are a write, but the object properties are the key/values
for(i=0;i<nodeCount;i++)if(fn===jqLiteData)
// data() takes the whole object in jQuery
fn(this[i],arg1);else for(key in arg1)fn(this[i],key,arg1[key]);
// return self for chaining
return this}for(var value=fn.$dv,jj=isUndefined(value)?Math.min(nodeCount,1):nodeCount,j=0;j<jj;j++){var nodeValue=fn(this[j],arg1,arg2);value=value?value+nodeValue:nodeValue}return value}
// we are a write, so apply to all children
for(i=0;i<nodeCount;i++)fn(this[i],arg1,arg2);
// return self for chaining
return this}}),
//////////////////////////////////////////
// Functions iterating traversal.
// These functions chain results into a single
// selector.
//////////////////////////////////////////
forEach({removeData:jqLiteRemoveData,on:function(element,type,fn,unsupported){if(isDefined(unsupported))throw jqLiteMinErr("onargs","jqLite#on() does not support the `selector` or `eventData` parameters");
// Do not add event handlers to non-elements because they will not be cleaned up.
if(jqLiteAcceptsData(element)){var expandoStore=jqLiteExpandoStore(element,!0),events=expandoStore.events,handle=expandoStore.handle;handle||(handle=expandoStore.handle=createEventHandler(element,events));for(
// http://jsperf.com/string-indexof-vs-split
var types=type.indexOf(" ")>=0?type.split(" "):[type],i=types.length,addHandler=function(type,specialHandlerWrapper,noEventListener){var eventFns=events[type];eventFns||(eventFns=events[type]=[],eventFns.specialHandlerWrapper=specialHandlerWrapper,"$destroy"===type||noEventListener||element.addEventListener(type,handle)),eventFns.push(fn)};i--;)type=types[i],MOUSE_EVENT_MAP[type]?(addHandler(MOUSE_EVENT_MAP[type],specialMouseHandlerWrapper),addHandler(type,void 0,!0)):addHandler(type)}},off:jqLiteOff,one:function(element,type,fn){element=jqLite(element),
//add the listener twice so that when it is called
//you can remove the original function and still be
//able to call element.off(ev, fn) normally
element.on(type,function onFn(){element.off(type,fn),element.off(type,onFn)}),element.on(type,fn)},replaceWith:function(element,replaceNode){var index,parent=element.parentNode;jqLiteDealoc(element),forEach(new JQLite(replaceNode),function(node){index?parent.insertBefore(node,index.nextSibling):parent.replaceChild(node,element),index=node})},children:function(element){var children=[];return forEach(element.childNodes,function(element){element.nodeType===NODE_TYPE_ELEMENT&&children.push(element)}),children},contents:function(element){return element.contentDocument||element.childNodes||[]},append:function(element,node){var nodeType=element.nodeType;if(nodeType===NODE_TYPE_ELEMENT||nodeType===NODE_TYPE_DOCUMENT_FRAGMENT){node=new JQLite(node);for(var i=0,ii=node.length;i<ii;i++){var child=node[i];element.appendChild(child)}}},prepend:function(element,node){if(element.nodeType===NODE_TYPE_ELEMENT){var index=element.firstChild;forEach(new JQLite(node),function(child){element.insertBefore(child,index)})}},wrap:function(element,wrapNode){jqLiteWrapNode(element,jqLite(wrapNode).eq(0).clone()[0])},remove:jqLiteRemove,detach:function(element){jqLiteRemove(element,!0)},after:function(element,newElement){var index=element,parent=element.parentNode;if(parent){newElement=new JQLite(newElement);for(var i=0,ii=newElement.length;i<ii;i++){var node=newElement[i];parent.insertBefore(node,index.nextSibling),index=node}}},addClass:jqLiteAddClass,removeClass:jqLiteRemoveClass,toggleClass:function(element,selector,condition){selector&&forEach(selector.split(" "),function(className){var classCondition=condition;isUndefined(classCondition)&&(classCondition=!jqLiteHasClass(element,className)),(classCondition?jqLiteAddClass:jqLiteRemoveClass)(element,className)})},parent:function(element){var parent=element.parentNode;return parent&&parent.nodeType!==NODE_TYPE_DOCUMENT_FRAGMENT?parent:null},next:function(element){return element.nextElementSibling},find:function(element,selector){return element.getElementsByTagName?element.getElementsByTagName(selector):[]},clone:jqLiteClone,triggerHandler:function(element,event,extraParameters){var dummyEvent,eventFnsCopy,handlerArgs,eventName=event.type||event,expandoStore=jqLiteExpandoStore(element),events=expandoStore&&expandoStore.events,eventFns=events&&events[eventName];eventFns&&(
// Create a dummy event to pass to the handlers
dummyEvent={preventDefault:function(){this.defaultPrevented=!0},isDefaultPrevented:function(){return this.defaultPrevented===!0},stopImmediatePropagation:function(){this.immediatePropagationStopped=!0},isImmediatePropagationStopped:function(){return this.immediatePropagationStopped===!0},stopPropagation:noop,type:eventName,target:element},
// If a custom event was provided then extend our dummy event with it
event.type&&(dummyEvent=extend(dummyEvent,event)),
// Copy event handlers in case event handlers array is modified during execution.
eventFnsCopy=shallowCopy(eventFns),handlerArgs=extraParameters?[dummyEvent].concat(extraParameters):[dummyEvent],forEach(eventFnsCopy,function(fn){dummyEvent.isImmediatePropagationStopped()||fn.apply(element,handlerArgs)}))}},function(fn,name){/**
   * chaining functions
   */
JQLite.prototype[name]=function(arg1,arg2,arg3){for(var value,i=0,ii=this.length;i<ii;i++)isUndefined(value)?(value=fn(this[i],arg1,arg2,arg3),isDefined(value)&&(
// any function which returns a value needs to be wrapped
value=jqLite(value))):jqLiteAddNodes(value,fn(this[i],arg1,arg2,arg3));return isDefined(value)?value:this}}),
// bind legacy bind/unbind to on/off
JQLite.prototype.bind=JQLite.prototype.on,JQLite.prototype.unbind=JQLite.prototype.off;
// A minimal ES2015 Map implementation.
// Should be bug/feature equivalent to the native implementations of supported browsers
// (for the features required in Angular).
// See https://kangax.github.io/compat-table/es6/#test-Map
var nanKey=Object.create(null);NgMapShim.prototype={_idx:function(key){return key===this._lastKey?this._lastIndex:(this._lastKey=key,this._lastIndex=this._keys.indexOf(key),this._lastIndex)},_transformKey:function(key){return isNumberNaN(key)?nanKey:key},get:function(key){key=this._transformKey(key);var idx=this._idx(key);if(idx!==-1)return this._values[idx]},set:function(key,value){key=this._transformKey(key);var idx=this._idx(key);idx===-1&&(idx=this._lastIndex=this._keys.length),this._keys[idx]=key,this._values[idx]=value},"delete":function(key){key=this._transformKey(key);var idx=this._idx(key);return idx!==-1&&(this._keys.splice(idx,1),this._values.splice(idx,1),this._lastKey=NaN,this._lastIndex=-1,!0)}};
// For now, always use `NgMapShim`, even if `window.Map` is available. Some native implementations
// are still buggy (often in subtle ways) and can cause hard-to-debug failures. When native `Map`
// implementations get more stable, we can reconsider switching to `window.Map` (when available).
var NgMap=NgMapShim,$$MapProvider=[/** @this */function(){this.$get=[function(){return NgMap}]}],ARROW_ARG=/^([^(]+?)=>/,FN_ARGS=/^[^(]*\(\s*([^)]*)\)/m,FN_ARG_SPLIT=/,/,FN_ARG=/^\s*(_?)(\S+?)\1\s*$/,STRIP_COMMENTS=/((\/\/.*$)|(\/\*[\s\S]*?\*\/))/gm,$injectorMinErr=minErr("$injector");createInjector.$$annotate=annotate;var $animateMinErr=minErr("$animate"),ELEMENT_NODE=1,NG_ANIMATE_CLASSNAME="ng-animate",$$CoreAnimateJsProvider=/** @this */function(){this.$get=noop},$$CoreAnimateQueueProvider=/** @this */function(){var postDigestQueue=new NgMap,postDigestElements=[];this.$get=["$$AnimateRunner","$rootScope",function($$AnimateRunner,$rootScope){function updateData(data,classes,value){var changed=!1;return classes&&(classes=isString(classes)?classes.split(" "):isArray(classes)?classes:[],forEach(classes,function(className){className&&(changed=!0,data[className]=value)})),changed}function handleCSSClassChanges(){forEach(postDigestElements,function(element){var data=postDigestQueue.get(element);if(data){var existing=splitClasses(element.attr("class")),toAdd="",toRemove="";forEach(data,function(status,className){var hasClass=!!existing[className];status!==hasClass&&(status?toAdd+=(toAdd.length?" ":"")+className:toRemove+=(toRemove.length?" ":"")+className)}),forEach(element,function(elm){toAdd&&jqLiteAddClass(elm,toAdd),toRemove&&jqLiteRemoveClass(elm,toRemove)}),postDigestQueue["delete"](element)}}),postDigestElements.length=0}function addRemoveClassesPostDigest(element,add,remove){var data=postDigestQueue.get(element)||{},classesAdded=updateData(data,add,!0),classesRemoved=updateData(data,remove,!1);(classesAdded||classesRemoved)&&(postDigestQueue.set(element,data),postDigestElements.push(element),1===postDigestElements.length&&$rootScope.$$postDigest(handleCSSClassChanges))}return{enabled:noop,on:noop,off:noop,pin:noop,push:function(element,event,options,domOperation){domOperation&&domOperation(),options=options||{},options.from&&element.css(options.from),options.to&&element.css(options.to),(options.addClass||options.removeClass)&&addRemoveClassesPostDigest(element,options.addClass,options.removeClass);var runner=new $$AnimateRunner;
// since there are no animations to run the runner needs to be
// notified that the animation call is complete.
return runner.complete(),runner}}}]},$AnimateProvider=["$provide",/** @this */function($provide){var provider=this,classNameFilter=null;this.$$registeredAnimations=Object.create(null),/**
   * @ngdoc method
   * @name $animateProvider#register
   *
   * @description
   * Registers a new injectable animation factory function. The factory function produces the
   * animation object which contains callback functions for each event that is expected to be
   * animated.
   *
   *   * `eventFn`: `function(element, ... , doneFunction, options)`
   *   The element to animate, the `doneFunction` and the options fed into the animation. Depending
   *   on the type of animation additional arguments will be injected into the animation function. The
   *   list below explains the function signatures for the different animation methods:
   *
   *   - setClass: function(element, addedClasses, removedClasses, doneFunction, options)
   *   - addClass: function(element, addedClasses, doneFunction, options)
   *   - removeClass: function(element, removedClasses, doneFunction, options)
   *   - enter, leave, move: function(element, doneFunction, options)
   *   - animate: function(element, fromStyles, toStyles, doneFunction, options)
   *
   *   Make sure to trigger the `doneFunction` once the animation is fully complete.
   *
   * ```js
   *   return {
   *     //enter, leave, move signature
   *     eventFn : function(element, done, options) {
   *       //code to run the animation
   *       //once complete, then run done()
   *       return function endFunction(wasCancelled) {
   *         //code to cancel the animation
   *       }
   *     }
   *   }
   * ```
   *
   * @param {string} name The name of the animation (this is what the class-based CSS value will be compared to).
   * @param {Function} factory The factory function that will be executed to return the animation
   *                           object.
   */
this.register=function(name,factory){if(name&&"."!==name.charAt(0))throw $animateMinErr("notcsel","Expecting class selector starting with '.' got '{0}'.",name);var key=name+"-animation";provider.$$registeredAnimations[name.substr(1)]=key,$provide.factory(key,factory)},/**
   * @ngdoc method
   * @name $animateProvider#classNameFilter
   *
   * @description
   * Sets and/or returns the CSS class regular expression that is checked when performing
   * an animation. Upon bootstrap the classNameFilter value is not set at all and will
   * therefore enable $animate to attempt to perform an animation on any element that is triggered.
   * When setting the `classNameFilter` value, animations will only be performed on elements
   * that successfully match the filter expression. This in turn can boost performance
   * for low-powered devices as well as applications containing a lot of structural operations.
   * @param {RegExp=} expression The className expression which will be checked against all animations
   * @return {RegExp} The current CSS className expression value. If null then there is no expression value
   */
this.classNameFilter=function(expression){if(1===arguments.length&&(classNameFilter=expression instanceof RegExp?expression:null)){var reservedRegex=new RegExp("[(\\s|\\/)]"+NG_ANIMATE_CLASSNAME+"[(\\s|\\/)]");if(reservedRegex.test(classNameFilter.toString()))throw classNameFilter=null,$animateMinErr("nongcls",'$animateProvider.classNameFilter(regex) prohibits accepting a regex value which matches/contains the "{0}" CSS class.',NG_ANIMATE_CLASSNAME)}return classNameFilter},this.$get=["$$animateQueue",function($$animateQueue){function domInsert(element,parentElement,afterElement){
// if for some reason the previous element was removed
// from the dom sometime before this code runs then let's
// just stick to using the parent element as the anchor
if(afterElement){var afterNode=extractElementNode(afterElement);!afterNode||afterNode.parentNode||afterNode.previousElementSibling||(afterElement=null)}afterElement?afterElement.after(element):parentElement.prepend(element)}/**
     * @ngdoc service
     * @name $animate
     * @description The $animate service exposes a series of DOM utility methods that provide support
     * for animation hooks. The default behavior is the application of DOM operations, however,
     * when an animation is detected (and animations are enabled), $animate will do the heavy lifting
     * to ensure that animation runs with the triggered DOM operation.
     *
     * By default $animate doesn't trigger any animations. This is because the `ngAnimate` module isn't
     * included and only when it is active then the animation hooks that `$animate` triggers will be
     * functional. Once active then all structural `ng-` directives will trigger animations as they perform
     * their DOM-related operations (enter, leave and move). Other directives such as `ngClass`,
     * `ngShow`, `ngHide` and `ngMessages` also provide support for animations.
     *
     * It is recommended that the`$animate` service is always used when executing DOM-related procedures within directives.
     *
     * To learn more about enabling animation support, click here to visit the
     * {@link ngAnimate ngAnimate module page}.
     */
return{
// we don't call it directly since non-existant arguments may
// be interpreted as null within the sub enabled function
/**
       *
       * @ngdoc method
       * @name $animate#on
       * @kind function
       * @description Sets up an event listener to fire whenever the animation event (enter, leave, move, etc...)
       *    has fired on the given element or among any of its children. Once the listener is fired, the provided callback
       *    is fired with the following params:
       *
       * ```js
       * $animate.on('enter', container,
       *    function callback(element, phase) {
       *      // cool we detected an enter animation within the container
       *    }
       * );
       * ```
       *
       * @param {string} event the animation event that will be captured (e.g. enter, leave, move, addClass, removeClass, etc...)
       * @param {DOMElement} container the container element that will capture each of the animation events that are fired on itself
       *     as well as among its children
       * @param {Function} callback the callback function that will be fired when the listener is triggered
       *
       * The arguments present in the callback function are:
       * * `element` - The captured DOM element that the animation was fired on.
       * * `phase` - The phase of the animation. The two possible phases are **start** (when the animation starts) and **close** (when it ends).
       */
on:$$animateQueue.on,/**
       *
       * @ngdoc method
       * @name $animate#off
       * @kind function
       * @description Deregisters an event listener based on the event which has been associated with the provided element. This method
       * can be used in three different ways depending on the arguments:
       *
       * ```js
       * // remove all the animation event listeners listening for `enter`
       * $animate.off('enter');
       *
       * // remove listeners for all animation events from the container element
       * $animate.off(container);
       *
       * // remove all the animation event listeners listening for `enter` on the given element and its children
       * $animate.off('enter', container);
       *
       * // remove the event listener function provided by `callback` that is set
       * // to listen for `enter` on the given `container` as well as its children
       * $animate.off('enter', container, callback);
       * ```
       *
       * @param {string|DOMElement} event|container the animation event (e.g. enter, leave, move,
       * addClass, removeClass, etc...), or the container element. If it is the element, all other
       * arguments are ignored.
       * @param {DOMElement=} container the container element the event listener was placed on
       * @param {Function=} callback the callback function that was registered as the listener
       */
off:$$animateQueue.off,/**
       * @ngdoc method
       * @name $animate#pin
       * @kind function
       * @description Associates the provided element with a host parent element to allow the element to be animated even if it exists
       *    outside of the DOM structure of the Angular application. By doing so, any animation triggered via `$animate` can be issued on the
       *    element despite being outside the realm of the application or within another application. Say for example if the application
       *    was bootstrapped on an element that is somewhere inside of the `<body>` tag, but we wanted to allow for an element to be situated
       *    as a direct child of `document.body`, then this can be achieved by pinning the element via `$animate.pin(element)`. Keep in mind
       *    that calling `$animate.pin(element, parentElement)` will not actually insert into the DOM anywhere; it will just create the association.
       *
       *    Note that this feature is only active when the `ngAnimate` module is used.
       *
       * @param {DOMElement} element the external element that will be pinned
       * @param {DOMElement} parentElement the host parent element that will be associated with the external element
       */
pin:$$animateQueue.pin,/**
       *
       * @ngdoc method
       * @name $animate#enabled
       * @kind function
       * @description Used to get and set whether animations are enabled or not on the entire application or on an element and its children. This
       * function can be called in four ways:
       *
       * ```js
       * // returns true or false
       * $animate.enabled();
       *
       * // changes the enabled state for all animations
       * $animate.enabled(false);
       * $animate.enabled(true);
       *
       * // returns true or false if animations are enabled for an element
       * $animate.enabled(element);
       *
       * // changes the enabled state for an element and its children
       * $animate.enabled(element, true);
       * $animate.enabled(element, false);
       * ```
       *
       * @param {DOMElement=} element the element that will be considered for checking/setting the enabled state
       * @param {boolean=} enabled whether or not the animations will be enabled for the element
       *
       * @return {boolean} whether or not animations are enabled
       */
enabled:$$animateQueue.enabled,/**
       * @ngdoc method
       * @name $animate#cancel
       * @kind function
       * @description Cancels the provided animation.
       *
       * @param {Promise} animationPromise The animation promise that is returned when an animation is started.
       */
cancel:function(runner){runner.end&&runner.end()},/**
       *
       * @ngdoc method
       * @name $animate#enter
       * @kind function
       * @description Inserts the element into the DOM either after the `after` element (if provided) or
       *   as the first child within the `parent` element and then triggers an animation.
       *   A promise is returned that will be resolved during the next digest once the animation
       *   has completed.
       *
       * @param {DOMElement} element the element which will be inserted into the DOM
       * @param {DOMElement} parent the parent element which will append the element as
       *   a child (so long as the after element is not present)
       * @param {DOMElement=} after the sibling element after which the element will be appended
       * @param {object=} options an optional collection of options/styles that will be applied to the element.
       *   The object can have the following properties:
       *
       *   - **addClass** - `{string}` - space-separated CSS classes to add to element
       *   - **from** - `{Object}` - CSS properties & values at the beginning of animation. Must have matching `to`
       *   - **removeClass** - `{string}` - space-separated CSS classes to remove from element
       *   - **to** - `{Object}` - CSS properties & values at end of animation. Must have matching `from`
       *
       * @return {Promise} the animation callback promise
       */
enter:function(element,parent,after,options){return parent=parent&&jqLite(parent),after=after&&jqLite(after),parent=parent||after.parent(),domInsert(element,parent,after),$$animateQueue.push(element,"enter",prepareAnimateOptions(options))},/**
       *
       * @ngdoc method
       * @name $animate#move
       * @kind function
       * @description Inserts (moves) the element into its new position in the DOM either after
       *   the `after` element (if provided) or as the first child within the `parent` element
       *   and then triggers an animation. A promise is returned that will be resolved
       *   during the next digest once the animation has completed.
       *
       * @param {DOMElement} element the element which will be moved into the new DOM position
       * @param {DOMElement} parent the parent element which will append the element as
       *   a child (so long as the after element is not present)
       * @param {DOMElement=} after the sibling element after which the element will be appended
       * @param {object=} options an optional collection of options/styles that will be applied to the element.
       *   The object can have the following properties:
       *
       *   - **addClass** - `{string}` - space-separated CSS classes to add to element
       *   - **from** - `{Object}` - CSS properties & values at the beginning of animation. Must have matching `to`
       *   - **removeClass** - `{string}` - space-separated CSS classes to remove from element
       *   - **to** - `{Object}` - CSS properties & values at end of animation. Must have matching `from`
       *
       * @return {Promise} the animation callback promise
       */
move:function(element,parent,after,options){return parent=parent&&jqLite(parent),after=after&&jqLite(after),parent=parent||after.parent(),domInsert(element,parent,after),$$animateQueue.push(element,"move",prepareAnimateOptions(options))},/**
       * @ngdoc method
       * @name $animate#leave
       * @kind function
       * @description Triggers an animation and then removes the element from the DOM.
       * When the function is called a promise is returned that will be resolved during the next
       * digest once the animation has completed.
       *
       * @param {DOMElement} element the element which will be removed from the DOM
       * @param {object=} options an optional collection of options/styles that will be applied to the element.
       *   The object can have the following properties:
       *
       *   - **addClass** - `{string}` - space-separated CSS classes to add to element
       *   - **from** - `{Object}` - CSS properties & values at the beginning of animation. Must have matching `to`
       *   - **removeClass** - `{string}` - space-separated CSS classes to remove from element
       *   - **to** - `{Object}` - CSS properties & values at end of animation. Must have matching `from`
       *
       * @return {Promise} the animation callback promise
       */
leave:function(element,options){return $$animateQueue.push(element,"leave",prepareAnimateOptions(options),function(){element.remove()})},/**
       * @ngdoc method
       * @name $animate#addClass
       * @kind function
       *
       * @description Triggers an addClass animation surrounding the addition of the provided CSS class(es). Upon
       *   execution, the addClass operation will only be handled after the next digest and it will not trigger an
       *   animation if element already contains the CSS class or if the class is removed at a later step.
       *   Note that class-based animations are treated differently compared to structural animations
       *   (like enter, move and leave) since the CSS classes may be added/removed at different points
       *   depending if CSS or JavaScript animations are used.
       *
       * @param {DOMElement} element the element which the CSS classes will be applied to
       * @param {string} className the CSS class(es) that will be added (multiple classes are separated via spaces)
       * @param {object=} options an optional collection of options/styles that will be applied to the element.
       *   The object can have the following properties:
       *
       *   - **addClass** - `{string}` - space-separated CSS classes to add to element
       *   - **from** - `{Object}` - CSS properties & values at the beginning of animation. Must have matching `to`
       *   - **removeClass** - `{string}` - space-separated CSS classes to remove from element
       *   - **to** - `{Object}` - CSS properties & values at end of animation. Must have matching `from`
       *
       * @return {Promise} the animation callback promise
       */
addClass:function(element,className,options){return options=prepareAnimateOptions(options),options.addClass=mergeClasses(options.addclass,className),$$animateQueue.push(element,"addClass",options)},/**
       * @ngdoc method
       * @name $animate#removeClass
       * @kind function
       *
       * @description Triggers a removeClass animation surrounding the removal of the provided CSS class(es). Upon
       *   execution, the removeClass operation will only be handled after the next digest and it will not trigger an
       *   animation if element does not contain the CSS class or if the class is added at a later step.
       *   Note that class-based animations are treated differently compared to structural animations
       *   (like enter, move and leave) since the CSS classes may be added/removed at different points
       *   depending if CSS or JavaScript animations are used.
       *
       * @param {DOMElement} element the element which the CSS classes will be applied to
       * @param {string} className the CSS class(es) that will be removed (multiple classes are separated via spaces)
       * @param {object=} options an optional collection of options/styles that will be applied to the element.
       *   The object can have the following properties:
       *
       *   - **addClass** - `{string}` - space-separated CSS classes to add to element
       *   - **from** - `{Object}` - CSS properties & values at the beginning of animation. Must have matching `to`
       *   - **removeClass** - `{string}` - space-separated CSS classes to remove from element
       *   - **to** - `{Object}` - CSS properties & values at end of animation. Must have matching `from`
       *
       * @return {Promise} the animation callback promise
       */
removeClass:function(element,className,options){return options=prepareAnimateOptions(options),options.removeClass=mergeClasses(options.removeClass,className),$$animateQueue.push(element,"removeClass",options)},/**
       * @ngdoc method
       * @name $animate#setClass
       * @kind function
       *
       * @description Performs both the addition and removal of a CSS classes on an element and (during the process)
       *    triggers an animation surrounding the class addition/removal. Much like `$animate.addClass` and
       *    `$animate.removeClass`, `setClass` will only evaluate the classes being added/removed once a digest has
       *    passed. Note that class-based animations are treated differently compared to structural animations
       *    (like enter, move and leave) since the CSS classes may be added/removed at different points
       *    depending if CSS or JavaScript animations are used.
       *
       * @param {DOMElement} element the element which the CSS classes will be applied to
       * @param {string} add the CSS class(es) that will be added (multiple classes are separated via spaces)
       * @param {string} remove the CSS class(es) that will be removed (multiple classes are separated via spaces)
       * @param {object=} options an optional collection of options/styles that will be applied to the element.
       *   The object can have the following properties:
       *
       *   - **addClass** - `{string}` - space-separated CSS classes to add to element
       *   - **from** - `{Object}` - CSS properties & values at the beginning of animation. Must have matching `to`
       *   - **removeClass** - `{string}` - space-separated CSS classes to remove from element
       *   - **to** - `{Object}` - CSS properties & values at end of animation. Must have matching `from`
       *
       * @return {Promise} the animation callback promise
       */
setClass:function(element,add,remove,options){return options=prepareAnimateOptions(options),options.addClass=mergeClasses(options.addClass,add),options.removeClass=mergeClasses(options.removeClass,remove),$$animateQueue.push(element,"setClass",options)},/**
       * @ngdoc method
       * @name $animate#animate
       * @kind function
       *
       * @description Performs an inline animation on the element which applies the provided to and from CSS styles to the element.
       * If any detected CSS transition, keyframe or JavaScript matches the provided className value, then the animation will take
       * on the provided styles. For example, if a transition animation is set for the given className, then the provided `from` and
       * `to` styles will be applied alongside the given transition. If the CSS style provided in `from` does not have a corresponding
       * style in `to`, the style in `from` is applied immediately, and no animation is run.
       * If a JavaScript animation is detected then the provided styles will be given in as function parameters into the `animate`
       * method (or as part of the `options` parameter):
       *
       * ```js
       * ngModule.animation('.my-inline-animation', function() {
       *   return {
       *     animate : function(element, from, to, done, options) {
       *       //animation
       *       done();
       *     }
       *   }
       * });
       * ```
       *
       * @param {DOMElement} element the element which the CSS styles will be applied to
       * @param {object} from the from (starting) CSS styles that will be applied to the element and across the animation.
       * @param {object} to the to (destination) CSS styles that will be applied to the element and across the animation.
       * @param {string=} className an optional CSS class that will be applied to the element for the duration of the animation. If
       *    this value is left as empty then a CSS class of `ng-inline-animate` will be applied to the element.
       *    (Note that if no animation is detected then this value will not be applied to the element.)
       * @param {object=} options an optional collection of options/styles that will be applied to the element.
       *   The object can have the following properties:
       *
       *   - **addClass** - `{string}` - space-separated CSS classes to add to element
       *   - **from** - `{Object}` - CSS properties & values at the beginning of animation. Must have matching `to`
       *   - **removeClass** - `{string}` - space-separated CSS classes to remove from element
       *   - **to** - `{Object}` - CSS properties & values at end of animation. Must have matching `from`
       *
       * @return {Promise} the animation callback promise
       */
animate:function(element,from,to,className,options){return options=prepareAnimateOptions(options),options.from=options.from?extend(options.from,from):from,options.to=options.to?extend(options.to,to):to,className=className||"ng-inline-animate",options.tempClasses=mergeClasses(options.tempClasses,className),$$animateQueue.push(element,"animate",options)}}}]}],$$AnimateAsyncRunFactoryProvider=/** @this */function(){this.$get=["$$rAF",function($$rAF){function waitForTick(fn){waitQueue.push(fn),waitQueue.length>1||$$rAF(function(){for(var i=0;i<waitQueue.length;i++)waitQueue[i]();waitQueue=[]})}var waitQueue=[];return function(){var passed=!1;return waitForTick(function(){passed=!0}),function(callback){passed?callback():waitForTick(callback)}}}]},$$AnimateRunnerFactoryProvider=/** @this */function(){this.$get=["$q","$sniffer","$$animateAsyncRun","$$isDocumentHidden","$timeout",function($q,$sniffer,$$animateAsyncRun,$$isDocumentHidden,$timeout){function AnimateRunner(host){this.setHost(host);var rafTick=$$animateAsyncRun(),timeoutTick=function(fn){$timeout(fn,0,!1)};this._doneCallbacks=[],this._tick=function(fn){$$isDocumentHidden()?timeoutTick(fn):rafTick(fn)},this._state=0}var INITIAL_STATE=0,DONE_PENDING_STATE=1,DONE_COMPLETE_STATE=2;return AnimateRunner.chain=function(chain,callback){function next(){return index===chain.length?void callback(!0):void chain[index](function(response){return response===!1?void callback(!1):(index++,void next())})}var index=0;next()},AnimateRunner.all=function(runners,callback){function onProgress(response){status=status&&response,++count===runners.length&&callback(status)}var count=0,status=!0;forEach(runners,function(runner){runner.done(onProgress)})},AnimateRunner.prototype={setHost:function(host){this.host=host||{}},done:function(fn){this._state===DONE_COMPLETE_STATE?fn():this._doneCallbacks.push(fn)},progress:noop,getPromise:function(){if(!this.promise){var self=this;this.promise=$q(function(resolve,reject){self.done(function(status){status===!1?reject():resolve()})})}return this.promise},then:function(resolveHandler,rejectHandler){return this.getPromise().then(resolveHandler,rejectHandler)},"catch":function(handler){return this.getPromise()["catch"](handler)},"finally":function(handler){return this.getPromise()["finally"](handler)},pause:function(){this.host.pause&&this.host.pause()},resume:function(){this.host.resume&&this.host.resume()},end:function(){this.host.end&&this.host.end(),this._resolve(!0)},cancel:function(){this.host.cancel&&this.host.cancel(),this._resolve(!1)},complete:function(response){var self=this;self._state===INITIAL_STATE&&(self._state=DONE_PENDING_STATE,self._tick(function(){self._resolve(response)}))},_resolve:function(response){this._state!==DONE_COMPLETE_STATE&&(forEach(this._doneCallbacks,function(fn){fn(response)}),this._doneCallbacks.length=0,this._state=DONE_COMPLETE_STATE)}},AnimateRunner}]},$CoreAnimateCssProvider=function(){this.$get=["$$rAF","$q","$$AnimateRunner",function($$rAF,$q,$$AnimateRunner){return function(element,initialOptions){function run(){return $$rAF(function(){applyAnimationContents(),closed||runner.complete(),closed=!0}),runner}function applyAnimationContents(){options.addClass&&(element.addClass(options.addClass),options.addClass=null),options.removeClass&&(element.removeClass(options.removeClass),options.removeClass=null),options.to&&(element.css(options.to),options.to=null)}
// all of the animation functions should create
// a copy of the options data, however, if a
// parent service has already created a copy then
// we should stick to using that
var options=initialOptions||{};options.$$prepared||(options=copy(options)),
// there is no point in applying the styles since
// there is no animation that goes on at all in
// this version of $animateCss.
options.cleanupStyles&&(options.from=options.to=null),options.from&&(element.css(options.from),options.from=null);var closed,runner=new $$AnimateRunner;return{start:run,end:run}}}]},$compileMinErr=minErr("$compile"),_UNINITIALIZED_VALUE=new UNINITIALIZED_VALUE;/**
 * @ngdoc provider
 * @name $compileProvider
 *
 * @description
 */
$CompileProvider.$inject=["$provide","$$sanitizeUriProvider"],SimpleChange.prototype.isFirstChange=function(){return this.previousValue===_UNINITIALIZED_VALUE};var PREFIX_REGEXP=/^((?:x|data)[:\-_])/i,SPECIAL_CHARS_REGEXP=/[:\-_]+(.)/g,$controllerMinErr=minErr("$controller"),CNTRL_REG=/^(\S+)(\s+as\s+([\w$]+))?$/,$$ForceReflowProvider=/** @this */function(){this.$get=["$document",function($document){return function(domNode){
//the line below will force the browser to perform a repaint so
//that all the animated elements within the animation frame will
//be properly updated and drawn on screen. This is required to
//ensure that the preparation animation is properly flushed so that
//the active state picks up from there. DO NOT REMOVE THIS LINE.
//DO NOT OPTIMIZE THIS LINE. THE MINIFIER WILL REMOVE IT OTHERWISE WHICH
//WILL RESULT IN AN UNPREDICTABLE BUG THAT IS VERY HARD TO TRACK DOWN AND
//WILL TAKE YEARS AWAY FROM YOUR LIFE.
return domNode?!domNode.nodeType&&domNode instanceof jqLite&&(domNode=domNode[0]):domNode=$document[0].body,domNode.offsetWidth+1}}]},APPLICATION_JSON="application/json",CONTENT_TYPE_APPLICATION_JSON={"Content-Type":APPLICATION_JSON+";charset=utf-8"},JSON_START=/^\[|^\{(?!\{)/,JSON_ENDS={"[":/]$/,"{":/}$/},JSON_PROTECTION_PREFIX=/^\)]\}',?\n/,$httpMinErr=minErr("$http"),$interpolateMinErr=angular.$interpolateMinErr=minErr("$interpolate");$interpolateMinErr.throwNoconcat=function(text){throw $interpolateMinErr("noconcat","Error while interpolating: {0}\nStrict Contextual Escaping disallows interpolations that concatenate multiple expressions when a trusted value is required.  See http://docs.angularjs.org/api/ng.$sce",text)},$interpolateMinErr.interr=function(text,err){return $interpolateMinErr("interr","Can't interpolate: {0}\n{1}",text,err.toString())};/**
 * @ngdoc service
 * @name $jsonpCallbacks
 * @requires $window
 * @description
 * This service handles the lifecycle of callbacks to handle JSONP requests.
 * Override this service if you wish to customise where the callbacks are stored and
 * how they vary compared to the requested url.
 */
var $jsonpCallbacksProvider=/** @this */function(){this.$get=function(){function createCallback(callbackId){var callback=function(data){callback.data=data,callback.called=!0};return callback.id=callbackId,callback}var callbacks=angular.callbacks,callbackMap={};return{/**
       * @ngdoc method
       * @name $jsonpCallbacks#createCallback
       * @param {string} url the url of the JSONP request
       * @returns {string} the callback path to send to the server as part of the JSONP request
       * @description
       * {@link $httpBackend} calls this method to create a callback and get hold of the path to the callback
       * to pass to the server, which will be used to call the callback with its payload in the JSONP response.
       */
createCallback:function(url){var callbackId="_"+(callbacks.$$counter++).toString(36),callbackPath="angular.callbacks."+callbackId,callback=createCallback(callbackId);return callbackMap[callbackPath]=callbacks[callbackId]=callback,callbackPath},/**
       * @ngdoc method
       * @name $jsonpCallbacks#wasCalled
       * @param {string} callbackPath the path to the callback that was sent in the JSONP request
       * @returns {boolean} whether the callback has been called, as a result of the JSONP response
       * @description
       * {@link $httpBackend} calls this method to find out whether the JSONP response actually called the
       * callback that was passed in the request.
       */
wasCalled:function(callbackPath){return callbackMap[callbackPath].called},/**
       * @ngdoc method
       * @name $jsonpCallbacks#getResponse
       * @param {string} callbackPath the path to the callback that was sent in the JSONP request
       * @returns {*} the data received from the response via the registered callback
       * @description
       * {@link $httpBackend} calls this method to get hold of the data that was provided to the callback
       * in the JSONP response.
       */
getResponse:function(callbackPath){return callbackMap[callbackPath].data},/**
       * @ngdoc method
       * @name $jsonpCallbacks#removeCallback
       * @param {string} callbackPath the path to the callback that was sent in the JSONP request
       * @description
       * {@link $httpBackend} calls this method to remove the callback after the JSONP request has
       * completed or timed-out.
       */
removeCallback:function(callbackPath){var callback=callbackMap[callbackPath];delete callbacks[callback.id],delete callbackMap[callbackPath]}}}},PATH_MATCH=/^([^?#]*)(\?([^#]*))?(#(.*))?$/,DEFAULT_PORTS={http:80,https:443,ftp:21},$locationMinErr=minErr("$location"),DOUBLE_SLASH_REGEX=/^\s*[\\/]{2,}/,locationPrototype={/**
   * Ensure absolute URL is initialized.
   * @private
   */
$$absUrl:"",/**
   * Are we in html5 mode?
   * @private
   */
$$html5:!1,/**
   * Has any change been replacing?
   * @private
   */
$$replace:!1,/**
   * @ngdoc method
   * @name $location#absUrl
   *
   * @description
   * This method is getter only.
   *
   * Return full URL representation with all segments encoded according to rules specified in
   * [RFC 3986](http://www.ietf.org/rfc/rfc3986.txt).
   *
   *
   * ```js
   * // given URL http://example.com/#/some/path?foo=bar&baz=xoxo
   * var absUrl = $location.absUrl();
   * // => "http://example.com/#/some/path?foo=bar&baz=xoxo"
   * ```
   *
   * @return {string} full URL
   */
absUrl:locationGetter("$$absUrl"),/**
   * @ngdoc method
   * @name $location#url
   *
   * @description
   * This method is getter / setter.
   *
   * Return URL (e.g. `/path?a=b#hash`) when called without any parameter.
   *
   * Change path, search and hash, when called with parameter and return `$location`.
   *
   *
   * ```js
   * // given URL http://example.com/#/some/path?foo=bar&baz=xoxo
   * var url = $location.url();
   * // => "/some/path?foo=bar&baz=xoxo"
   * ```
   *
   * @param {string=} url New URL without base prefix (e.g. `/path?a=b#hash`)
   * @return {string} url
   */
url:function(url){if(isUndefined(url))return this.$$url;var match=PATH_MATCH.exec(url);return(match[1]||""===url)&&this.path(decodeURIComponent(match[1])),(match[2]||match[1]||""===url)&&this.search(match[3]||""),this.hash(match[5]||""),this},/**
   * @ngdoc method
   * @name $location#protocol
   *
   * @description
   * This method is getter only.
   *
   * Return protocol of current URL.
   *
   *
   * ```js
   * // given URL http://example.com/#/some/path?foo=bar&baz=xoxo
   * var protocol = $location.protocol();
   * // => "http"
   * ```
   *
   * @return {string} protocol of current URL
   */
protocol:locationGetter("$$protocol"),/**
   * @ngdoc method
   * @name $location#host
   *
   * @description
   * This method is getter only.
   *
   * Return host of current URL.
   *
   * Note: compared to the non-angular version `location.host` which returns `hostname:port`, this returns the `hostname` portion only.
   *
   *
   * ```js
   * // given URL http://example.com/#/some/path?foo=bar&baz=xoxo
   * var host = $location.host();
   * // => "example.com"
   *
   * // given URL http://user:password@example.com:8080/#/some/path?foo=bar&baz=xoxo
   * host = $location.host();
   * // => "example.com"
   * host = location.host;
   * // => "example.com:8080"
   * ```
   *
   * @return {string} host of current URL.
   */
host:locationGetter("$$host"),/**
   * @ngdoc method
   * @name $location#port
   *
   * @description
   * This method is getter only.
   *
   * Return port of current URL.
   *
   *
   * ```js
   * // given URL http://example.com/#/some/path?foo=bar&baz=xoxo
   * var port = $location.port();
   * // => 80
   * ```
   *
   * @return {Number} port
   */
port:locationGetter("$$port"),/**
   * @ngdoc method
   * @name $location#path
   *
   * @description
   * This method is getter / setter.
   *
   * Return path of current URL when called without any parameter.
   *
   * Change path when called with parameter and return `$location`.
   *
   * Note: Path should always begin with forward slash (/), this method will add the forward slash
   * if it is missing.
   *
   *
   * ```js
   * // given URL http://example.com/#/some/path?foo=bar&baz=xoxo
   * var path = $location.path();
   * // => "/some/path"
   * ```
   *
   * @param {(string|number)=} path New path
   * @return {(string|object)} path if called with no parameters, or `$location` if called with a parameter
   */
path:locationGetterSetter("$$path",function(path){return path=null!==path?path.toString():"","/"===path.charAt(0)?path:"/"+path}),/**
   * @ngdoc method
   * @name $location#search
   *
   * @description
   * This method is getter / setter.
   *
   * Return search part (as object) of current URL when called without any parameter.
   *
   * Change search part when called with parameter and return `$location`.
   *
   *
   * ```js
   * // given URL http://example.com/#/some/path?foo=bar&baz=xoxo
   * var searchObject = $location.search();
   * // => {foo: 'bar', baz: 'xoxo'}
   *
   * // set foo to 'yipee'
   * $location.search('foo', 'yipee');
   * // $location.search() => {foo: 'yipee', baz: 'xoxo'}
   * ```
   *
   * @param {string|Object.<string>|Object.<Array.<string>>} search New search params - string or
   * hash object.
   *
   * When called with a single argument the method acts as a setter, setting the `search` component
   * of `$location` to the specified value.
   *
   * If the argument is a hash object containing an array of values, these values will be encoded
   * as duplicate search parameters in the URL.
   *
   * @param {(string|Number|Array<string>|boolean)=} paramValue If `search` is a string or number, then `paramValue`
   * will override only a single search property.
   *
   * If `paramValue` is an array, it will override the property of the `search` component of
   * `$location` specified via the first argument.
   *
   * If `paramValue` is `null`, the property specified via the first argument will be deleted.
   *
   * If `paramValue` is `true`, the property specified via the first argument will be added with no
   * value nor trailing equal sign.
   *
   * @return {Object} If called with no arguments returns the parsed `search` object. If called with
   * one or more arguments returns `$location` object itself.
   */
search:function(search,paramValue){switch(arguments.length){case 0:return this.$$search;case 1:if(isString(search)||isNumber(search))search=search.toString(),this.$$search=parseKeyValue(search);else{if(!isObject(search))throw $locationMinErr("isrcharg","The first argument of the `$location#search()` call must be a string or an object.");search=copy(search,{}),
// remove object undefined or null properties
forEach(search,function(value,key){null==value&&delete search[key]}),this.$$search=search}break;default:isUndefined(paramValue)||null===paramValue?delete this.$$search[search]:this.$$search[search]=paramValue}return this.$$compose(),this},/**
   * @ngdoc method
   * @name $location#hash
   *
   * @description
   * This method is getter / setter.
   *
   * Returns the hash fragment when called without any parameters.
   *
   * Changes the hash fragment when called with a parameter and returns `$location`.
   *
   *
   * ```js
   * // given URL http://example.com/#/some/path?foo=bar&baz=xoxo#hashValue
   * var hash = $location.hash();
   * // => "hashValue"
   * ```
   *
   * @param {(string|number)=} hash New hash fragment
   * @return {string} hash
   */
hash:locationGetterSetter("$$hash",function(hash){return null!==hash?hash.toString():""}),/**
   * @ngdoc method
   * @name $location#replace
   *
   * @description
   * If called, all changes to $location during the current `$digest` will replace the current history
   * record, instead of adding a new one.
   */
replace:function(){return this.$$replace=!0,this}};forEach([LocationHashbangInHtml5Url,LocationHashbangUrl,LocationHtml5Url],function(Location){Location.prototype=Object.create(locationPrototype),/**
   * @ngdoc method
   * @name $location#state
   *
   * @description
   * This method is getter / setter.
   *
   * Return the history state object when called without any parameter.
   *
   * Change the history state object when called with one parameter and return `$location`.
   * The state object is later passed to `pushState` or `replaceState`.
   *
   * NOTE: This method is supported only in HTML5 mode and only in browsers supporting
   * the HTML5 History API (i.e. methods `pushState` and `replaceState`). If you need to support
   * older browsers (like IE9 or Android < 4.0), don't use this method.
   *
   * @param {object=} state State object for pushState or replaceState
   * @return {object} state
   */
Location.prototype.state=function(state){if(!arguments.length)return this.$$state;if(Location!==LocationHtml5Url||!this.$$html5)throw $locationMinErr("nostate","History API state support is available only in HTML5 mode and only in browsers supporting HTML5 History API");
// The user might modify `stateObject` after invoking `$location.state(stateObject)`
// but we're changing the $$state reference to $browser.state() during the $digest
// so the modification window is narrow.
return this.$$state=isUndefined(state)?null:state,this.$$urlUpdatedByLocation=!0,this}});/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 *     Any commits to this file should be reviewed with security in mind.  *
 *   Changes to this file can potentially create security vulnerabilities. *
 *          An approval from 2 Core members with history of modifying      *
 *                         this file is required.                          *
 *                                                                         *
 *  Does the change somehow allow for arbitrary javascript to be executed? *
 *    Or allows for someone to change the prototype of built-in objects?   *
 *     Or gives undesired access to variables likes document or window?    *
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */
var $parseMinErr=minErr("$parse"),objectValueOf={}.constructor.prototype.valueOf,OPERATORS=createMap();forEach("+ - * / % === !== == != < > <= >= && || ! = |".split(" "),function(operator){OPERATORS[operator]=!0});var ESCAPE={n:"\n",f:"\f",r:"\r",t:"\t",v:"\x0B","'":"'",'"':'"'},Lexer=function(options){this.options=options};Lexer.prototype={constructor:Lexer,lex:function(text){for(this.text=text,this.index=0,this.tokens=[];this.index<this.text.length;){var ch=this.text.charAt(this.index);if('"'===ch||"'"===ch)this.readString(ch);else if(this.isNumber(ch)||"."===ch&&this.isNumber(this.peek()))this.readNumber();else if(this.isIdentifierStart(this.peekMultichar()))this.readIdent();else if(this.is(ch,"(){}[].,;:?"))this.tokens.push({index:this.index,text:ch}),this.index++;else if(this.isWhitespace(ch))this.index++;else{var ch2=ch+this.peek(),ch3=ch2+this.peek(2),op1=OPERATORS[ch],op2=OPERATORS[ch2],op3=OPERATORS[ch3];if(op1||op2||op3){var token=op3?ch3:op2?ch2:ch;this.tokens.push({index:this.index,text:token,operator:!0}),this.index+=token.length}else this.throwError("Unexpected next character ",this.index,this.index+1)}}return this.tokens},is:function(ch,chars){return chars.indexOf(ch)!==-1},peek:function(i){var num=i||1;return this.index+num<this.text.length&&this.text.charAt(this.index+num)},isNumber:function(ch){return"0"<=ch&&ch<="9"&&"string"==typeof ch},isWhitespace:function(ch){
// IE treats non-breaking space as \u00A0
return" "===ch||"\r"===ch||"\t"===ch||"\n"===ch||"\x0B"===ch||" "===ch},isIdentifierStart:function(ch){return this.options.isIdentifierStart?this.options.isIdentifierStart(ch,this.codePointAt(ch)):this.isValidIdentifierStart(ch)},isValidIdentifierStart:function(ch){return"a"<=ch&&ch<="z"||"A"<=ch&&ch<="Z"||"_"===ch||"$"===ch},isIdentifierContinue:function(ch){return this.options.isIdentifierContinue?this.options.isIdentifierContinue(ch,this.codePointAt(ch)):this.isValidIdentifierContinue(ch)},isValidIdentifierContinue:function(ch,cp){return this.isValidIdentifierStart(ch,cp)||this.isNumber(ch)},codePointAt:function(ch){return 1===ch.length?ch.charCodeAt(0):(ch.charCodeAt(0)<<10)+ch.charCodeAt(1)-56613888},peekMultichar:function(){var ch=this.text.charAt(this.index),peek=this.peek();if(!peek)return ch;var cp1=ch.charCodeAt(0),cp2=peek.charCodeAt(0);return cp1>=55296&&cp1<=56319&&cp2>=56320&&cp2<=57343?ch+peek:ch},isExpOperator:function(ch){return"-"===ch||"+"===ch||this.isNumber(ch)},throwError:function(error,start,end){end=end||this.index;var colStr=isDefined(start)?"s "+start+"-"+this.index+" ["+this.text.substring(start,end)+"]":" "+end;throw $parseMinErr("lexerr","Lexer Error: {0} at column{1} in expression [{2}].",error,colStr,this.text)},readNumber:function(){for(var number="",start=this.index;this.index<this.text.length;){var ch=lowercase(this.text.charAt(this.index));if("."===ch||this.isNumber(ch))number+=ch;else{var peekCh=this.peek();if("e"===ch&&this.isExpOperator(peekCh))number+=ch;else if(this.isExpOperator(ch)&&peekCh&&this.isNumber(peekCh)&&"e"===number.charAt(number.length-1))number+=ch;else{if(!this.isExpOperator(ch)||peekCh&&this.isNumber(peekCh)||"e"!==number.charAt(number.length-1))break;this.throwError("Invalid exponent")}}this.index++}this.tokens.push({index:start,text:number,constant:!0,value:Number(number)})},readIdent:function(){var start=this.index;for(this.index+=this.peekMultichar().length;this.index<this.text.length;){var ch=this.peekMultichar();if(!this.isIdentifierContinue(ch))break;this.index+=ch.length}this.tokens.push({index:start,text:this.text.slice(start,this.index),identifier:!0})},readString:function(quote){var start=this.index;this.index++;for(var string="",rawString=quote,escape=!1;this.index<this.text.length;){var ch=this.text.charAt(this.index);if(rawString+=ch,escape){if("u"===ch){var hex=this.text.substring(this.index+1,this.index+5);hex.match(/[\da-f]{4}/i)||this.throwError("Invalid unicode escape [\\u"+hex+"]"),this.index+=4,string+=String.fromCharCode(parseInt(hex,16))}else{var rep=ESCAPE[ch];string+=rep||ch}escape=!1}else if("\\"===ch)escape=!0;else{if(ch===quote)return this.index++,void this.tokens.push({index:start,text:rawString,constant:!0,value:string});string+=ch}this.index++}this.throwError("Unterminated quote",start)}};var AST=function(lexer,options){this.lexer=lexer,this.options=options};AST.Program="Program",AST.ExpressionStatement="ExpressionStatement",AST.AssignmentExpression="AssignmentExpression",AST.ConditionalExpression="ConditionalExpression",AST.LogicalExpression="LogicalExpression",AST.BinaryExpression="BinaryExpression",AST.UnaryExpression="UnaryExpression",AST.CallExpression="CallExpression",AST.MemberExpression="MemberExpression",AST.Identifier="Identifier",AST.Literal="Literal",AST.ArrayExpression="ArrayExpression",AST.Property="Property",AST.ObjectExpression="ObjectExpression",AST.ThisExpression="ThisExpression",AST.LocalsExpression="LocalsExpression",
// Internal use only
AST.NGValueParameter="NGValueParameter",AST.prototype={ast:function(text){this.text=text,this.tokens=this.lexer.lex(text);var value=this.program();return 0!==this.tokens.length&&this.throwError("is an unexpected token",this.tokens[0]),value},program:function(){for(var body=[];;)if(this.tokens.length>0&&!this.peek("}",")",";","]")&&body.push(this.expressionStatement()),!this.expect(";"))return{type:AST.Program,body:body}},expressionStatement:function(){return{type:AST.ExpressionStatement,expression:this.filterChain()}},filterChain:function(){for(var left=this.expression();this.expect("|");)left=this.filter(left);return left},expression:function(){return this.assignment()},assignment:function(){var result=this.ternary();if(this.expect("=")){if(!isAssignable(result))throw $parseMinErr("lval","Trying to assign a value to a non l-value");result={type:AST.AssignmentExpression,left:result,right:this.assignment(),operator:"="}}return result},ternary:function(){var alternate,consequent,test=this.logicalOR();return this.expect("?")&&(alternate=this.expression(),this.consume(":"))?(consequent=this.expression(),{type:AST.ConditionalExpression,test:test,alternate:alternate,consequent:consequent}):test},logicalOR:function(){for(var left=this.logicalAND();this.expect("||");)left={type:AST.LogicalExpression,operator:"||",left:left,right:this.logicalAND()};return left},logicalAND:function(){for(var left=this.equality();this.expect("&&");)left={type:AST.LogicalExpression,operator:"&&",left:left,right:this.equality()};return left},equality:function(){for(var token,left=this.relational();token=this.expect("==","!=","===","!==");)left={type:AST.BinaryExpression,operator:token.text,left:left,right:this.relational()};return left},relational:function(){for(var token,left=this.additive();token=this.expect("<",">","<=",">=");)left={type:AST.BinaryExpression,operator:token.text,left:left,right:this.additive()};return left},additive:function(){for(var token,left=this.multiplicative();token=this.expect("+","-");)left={type:AST.BinaryExpression,operator:token.text,left:left,right:this.multiplicative()};return left},multiplicative:function(){for(var token,left=this.unary();token=this.expect("*","/","%");)left={type:AST.BinaryExpression,operator:token.text,left:left,right:this.unary()};return left},unary:function(){var token;return(token=this.expect("+","-","!"))?{type:AST.UnaryExpression,operator:token.text,prefix:!0,argument:this.unary()}:this.primary()},primary:function(){var primary;this.expect("(")?(primary=this.filterChain(),this.consume(")")):this.expect("[")?primary=this.arrayDeclaration():this.expect("{")?primary=this.object():this.selfReferential.hasOwnProperty(this.peek().text)?primary=copy(this.selfReferential[this.consume().text]):this.options.literals.hasOwnProperty(this.peek().text)?primary={type:AST.Literal,value:this.options.literals[this.consume().text]}:this.peek().identifier?primary=this.identifier():this.peek().constant?primary=this.constant():this.throwError("not a primary expression",this.peek());for(var next;next=this.expect("(","[",".");)"("===next.text?(primary={type:AST.CallExpression,callee:primary,arguments:this.parseArguments()},this.consume(")")):"["===next.text?(primary={type:AST.MemberExpression,object:primary,property:this.expression(),computed:!0},this.consume("]")):"."===next.text?primary={type:AST.MemberExpression,object:primary,property:this.identifier(),computed:!1}:this.throwError("IMPOSSIBLE");return primary},filter:function(baseExpression){for(var args=[baseExpression],result={type:AST.CallExpression,callee:this.identifier(),arguments:args,filter:!0};this.expect(":");)args.push(this.expression());return result},parseArguments:function(){var args=[];if(")"!==this.peekToken().text)do args.push(this.filterChain());while(this.expect(","));return args},identifier:function(){var token=this.consume();return token.identifier||this.throwError("is not a valid identifier",token),{type:AST.Identifier,name:token.text}},constant:function(){
// TODO check that it is a constant
return{type:AST.Literal,value:this.consume().value}},arrayDeclaration:function(){var elements=[];if("]"!==this.peekToken().text)do{if(this.peek("]"))
// Support trailing commas per ES5.1.
break;elements.push(this.expression())}while(this.expect(","));return this.consume("]"),{type:AST.ArrayExpression,elements:elements}},object:function(){var property,properties=[];if("}"!==this.peekToken().text)do{if(this.peek("}"))
// Support trailing commas per ES5.1.
break;property={type:AST.Property,kind:"init"},this.peek().constant?(property.key=this.constant(),property.computed=!1,this.consume(":"),property.value=this.expression()):this.peek().identifier?(property.key=this.identifier(),property.computed=!1,this.peek(":")?(this.consume(":"),property.value=this.expression()):property.value=property.key):this.peek("[")?(this.consume("["),property.key=this.expression(),this.consume("]"),property.computed=!0,this.consume(":"),property.value=this.expression()):this.throwError("invalid key",this.peek()),properties.push(property)}while(this.expect(","));return this.consume("}"),{type:AST.ObjectExpression,properties:properties}},throwError:function(msg,token){throw $parseMinErr("syntax","Syntax Error: Token '{0}' {1} at column {2} of the expression [{3}] starting at [{4}].",token.text,msg,token.index+1,this.text,this.text.substring(token.index))},consume:function(e1){if(0===this.tokens.length)throw $parseMinErr("ueoe","Unexpected end of expression: {0}",this.text);var token=this.expect(e1);return token||this.throwError("is unexpected, expecting ["+e1+"]",this.peek()),token},peekToken:function(){if(0===this.tokens.length)throw $parseMinErr("ueoe","Unexpected end of expression: {0}",this.text);return this.tokens[0]},peek:function(e1,e2,e3,e4){return this.peekAhead(0,e1,e2,e3,e4)},peekAhead:function(i,e1,e2,e3,e4){if(this.tokens.length>i){var token=this.tokens[i],t=token.text;if(t===e1||t===e2||t===e3||t===e4||!e1&&!e2&&!e3&&!e4)return token}return!1},expect:function(e1,e2,e3,e4){var token=this.peek(e1,e2,e3,e4);return!!token&&(this.tokens.shift(),token)},selfReferential:{"this":{type:AST.ThisExpression},$locals:{type:AST.LocalsExpression}}},ASTCompiler.prototype={compile:function(ast){var self=this;this.state={nextId:0,filters:{},fn:{vars:[],body:[],own:{}},assign:{vars:[],body:[],own:{}},inputs:[]},findConstantAndWatchExpressions(ast,self.$filter);var assignable,extra="";if(this.stage="assign",assignable=assignableAST(ast)){this.state.computing="assign";var result=this.nextId();this.recurse(assignable,result),this.return_(result),extra="fn.assign="+this.generateFunction("assign","s,v,l")}var toWatch=getInputs(ast.body);self.stage="inputs",forEach(toWatch,function(watch,key){var fnKey="fn"+key;self.state[fnKey]={vars:[],body:[],own:{}},self.state.computing=fnKey;var intoId=self.nextId();self.recurse(watch,intoId),self.return_(intoId),self.state.inputs.push(fnKey),watch.watchId=key}),this.state.computing="fn",this.stage="main",this.recurse(ast);var fnString=
// The build and minification steps remove the string "use strict" from the code, but this is done using a regex.
// This is a workaround for this until we do a better job at only removing the prefix only when we should.
'"'+this.USE+" "+this.STRICT+'";\n'+this.filterPrefix()+"var fn="+this.generateFunction("fn","s,l,a,i")+extra+this.watchFns()+"return fn;",fn=new Function("$filter","getStringValue","ifDefined","plus",fnString)(this.$filter,getStringValue,ifDefined,plusFn);return this.state=this.stage=void 0,fn},USE:"use",STRICT:"strict",watchFns:function(){var result=[],fns=this.state.inputs,self=this;return forEach(fns,function(name){result.push("var "+name+"="+self.generateFunction(name,"s"))}),fns.length&&result.push("fn.inputs=["+fns.join(",")+"];"),result.join("")},generateFunction:function(name,params){return"function("+params+"){"+this.varsPrefix(name)+this.body(name)+"};"},filterPrefix:function(){var parts=[],self=this;return forEach(this.state.filters,function(id,filter){parts.push(id+"=$filter("+self.escape(filter)+")")}),parts.length?"var "+parts.join(",")+";":""},varsPrefix:function(section){return this.state[section].vars.length?"var "+this.state[section].vars.join(",")+";":""},body:function(section){return this.state[section].body.join("")},recurse:function(ast,intoId,nameId,recursionFn,create,skipWatchIdCheck){var left,right,args,expression,computed,self=this;if(recursionFn=recursionFn||noop,!skipWatchIdCheck&&isDefined(ast.watchId))return intoId=intoId||this.nextId(),void this.if_("i",this.lazyAssign(intoId,this.computedMember("i",ast.watchId)),this.lazyRecurse(ast,intoId,nameId,recursionFn,create,!0));switch(ast.type){case AST.Program:forEach(ast.body,function(expression,pos){self.recurse(expression.expression,void 0,void 0,function(expr){right=expr}),pos!==ast.body.length-1?self.current().body.push(right,";"):self.return_(right)});break;case AST.Literal:expression=this.escape(ast.value),this.assign(intoId,expression),recursionFn(intoId||expression);break;case AST.UnaryExpression:this.recurse(ast.argument,void 0,void 0,function(expr){right=expr}),expression=ast.operator+"("+this.ifDefined(right,0)+")",this.assign(intoId,expression),recursionFn(expression);break;case AST.BinaryExpression:this.recurse(ast.left,void 0,void 0,function(expr){left=expr}),this.recurse(ast.right,void 0,void 0,function(expr){right=expr}),expression="+"===ast.operator?this.plus(left,right):"-"===ast.operator?this.ifDefined(left,0)+ast.operator+this.ifDefined(right,0):"("+left+")"+ast.operator+"("+right+")",this.assign(intoId,expression),recursionFn(expression);break;case AST.LogicalExpression:intoId=intoId||this.nextId(),self.recurse(ast.left,intoId),self.if_("&&"===ast.operator?intoId:self.not(intoId),self.lazyRecurse(ast.right,intoId)),recursionFn(intoId);break;case AST.ConditionalExpression:intoId=intoId||this.nextId(),self.recurse(ast.test,intoId),self.if_(intoId,self.lazyRecurse(ast.alternate,intoId),self.lazyRecurse(ast.consequent,intoId)),recursionFn(intoId);break;case AST.Identifier:intoId=intoId||this.nextId(),nameId&&(nameId.context="inputs"===self.stage?"s":this.assign(this.nextId(),this.getHasOwnProperty("l",ast.name)+"?l:s"),nameId.computed=!1,nameId.name=ast.name),self.if_("inputs"===self.stage||self.not(self.getHasOwnProperty("l",ast.name)),function(){self.if_("inputs"===self.stage||"s",function(){create&&1!==create&&self.if_(self.isNull(self.nonComputedMember("s",ast.name)),self.lazyAssign(self.nonComputedMember("s",ast.name),"{}")),self.assign(intoId,self.nonComputedMember("s",ast.name))})},intoId&&self.lazyAssign(intoId,self.nonComputedMember("l",ast.name))),recursionFn(intoId);break;case AST.MemberExpression:left=nameId&&(nameId.context=this.nextId())||this.nextId(),intoId=intoId||this.nextId(),self.recurse(ast.object,left,void 0,function(){self.if_(self.notNull(left),function(){ast.computed?(right=self.nextId(),self.recurse(ast.property,right),self.getStringValue(right),create&&1!==create&&self.if_(self.not(self.computedMember(left,right)),self.lazyAssign(self.computedMember(left,right),"{}")),expression=self.computedMember(left,right),self.assign(intoId,expression),nameId&&(nameId.computed=!0,nameId.name=right)):(create&&1!==create&&self.if_(self.isNull(self.nonComputedMember(left,ast.property.name)),self.lazyAssign(self.nonComputedMember(left,ast.property.name),"{}")),expression=self.nonComputedMember(left,ast.property.name),self.assign(intoId,expression),nameId&&(nameId.computed=!1,nameId.name=ast.property.name))},function(){self.assign(intoId,"undefined")}),recursionFn(intoId)},!!create);break;case AST.CallExpression:intoId=intoId||this.nextId(),ast.filter?(right=self.filter(ast.callee.name),args=[],forEach(ast.arguments,function(expr){var argument=self.nextId();self.recurse(expr,argument),args.push(argument)}),expression=right+"("+args.join(",")+")",self.assign(intoId,expression),recursionFn(intoId)):(right=self.nextId(),left={},args=[],self.recurse(ast.callee,right,left,function(){self.if_(self.notNull(right),function(){forEach(ast.arguments,function(expr){self.recurse(expr,ast.constant?void 0:self.nextId(),void 0,function(argument){args.push(argument)})}),expression=left.name?self.member(left.context,left.name,left.computed)+"("+args.join(",")+")":right+"("+args.join(",")+")",self.assign(intoId,expression)},function(){self.assign(intoId,"undefined")}),recursionFn(intoId)}));break;case AST.AssignmentExpression:right=this.nextId(),left={},this.recurse(ast.left,void 0,left,function(){self.if_(self.notNull(left.context),function(){self.recurse(ast.right,right),expression=self.member(left.context,left.name,left.computed)+ast.operator+right,self.assign(intoId,expression),recursionFn(intoId||expression)})},1);break;case AST.ArrayExpression:args=[],forEach(ast.elements,function(expr){self.recurse(expr,ast.constant?void 0:self.nextId(),void 0,function(argument){args.push(argument)})}),expression="["+args.join(",")+"]",this.assign(intoId,expression),recursionFn(intoId||expression);break;case AST.ObjectExpression:args=[],computed=!1,forEach(ast.properties,function(property){property.computed&&(computed=!0)}),computed?(intoId=intoId||this.nextId(),this.assign(intoId,"{}"),forEach(ast.properties,function(property){property.computed?(left=self.nextId(),self.recurse(property.key,left)):left=property.key.type===AST.Identifier?property.key.name:""+property.key.value,right=self.nextId(),self.recurse(property.value,right),self.assign(self.member(intoId,left,property.computed),right)})):(forEach(ast.properties,function(property){self.recurse(property.value,ast.constant?void 0:self.nextId(),void 0,function(expr){args.push(self.escape(property.key.type===AST.Identifier?property.key.name:""+property.key.value)+":"+expr)})}),expression="{"+args.join(",")+"}",this.assign(intoId,expression)),recursionFn(intoId||expression);break;case AST.ThisExpression:this.assign(intoId,"s"),recursionFn(intoId||"s");break;case AST.LocalsExpression:this.assign(intoId,"l"),recursionFn(intoId||"l");break;case AST.NGValueParameter:this.assign(intoId,"v"),recursionFn(intoId||"v")}},getHasOwnProperty:function(element,property){var key=element+"."+property,own=this.current().own;return own.hasOwnProperty(key)||(own[key]=this.nextId(!1,element+"&&("+this.escape(property)+" in "+element+")")),own[key]},assign:function(id,value){if(id)return this.current().body.push(id,"=",value,";"),id},filter:function(filterName){return this.state.filters.hasOwnProperty(filterName)||(this.state.filters[filterName]=this.nextId(!0)),this.state.filters[filterName]},ifDefined:function(id,defaultValue){return"ifDefined("+id+","+this.escape(defaultValue)+")"},plus:function(left,right){return"plus("+left+","+right+")"},return_:function(id){this.current().body.push("return ",id,";")},if_:function(test,alternate,consequent){if(test===!0)alternate();else{var body=this.current().body;body.push("if(",test,"){"),alternate(),body.push("}"),consequent&&(body.push("else{"),consequent(),body.push("}"))}},not:function(expression){return"!("+expression+")"},isNull:function(expression){return expression+"==null"},notNull:function(expression){return expression+"!=null"},nonComputedMember:function(left,right){var SAFE_IDENTIFIER=/^[$_a-zA-Z][$_a-zA-Z0-9]*$/,UNSAFE_CHARACTERS=/[^$_a-zA-Z0-9]/g;return SAFE_IDENTIFIER.test(right)?left+"."+right:left+'["'+right.replace(UNSAFE_CHARACTERS,this.stringEscapeFn)+'"]'},computedMember:function(left,right){return left+"["+right+"]"},member:function(left,right,computed){return computed?this.computedMember(left,right):this.nonComputedMember(left,right)},getStringValue:function(item){this.assign(item,"getStringValue("+item+")")},lazyRecurse:function(ast,intoId,nameId,recursionFn,create,skipWatchIdCheck){var self=this;return function(){self.recurse(ast,intoId,nameId,recursionFn,create,skipWatchIdCheck)}},lazyAssign:function(id,value){var self=this;return function(){self.assign(id,value)}},stringEscapeRegex:/[^ a-zA-Z0-9]/g,stringEscapeFn:function(c){return"\\u"+("0000"+c.charCodeAt(0).toString(16)).slice(-4)},escape:function(value){if(isString(value))return"'"+value.replace(this.stringEscapeRegex,this.stringEscapeFn)+"'";if(isNumber(value))return value.toString();if(value===!0)return"true";if(value===!1)return"false";if(null===value)return"null";if("undefined"==typeof value)return"undefined";throw $parseMinErr("esc","IMPOSSIBLE")},nextId:function(skip,init){var id="v"+this.state.nextId++;return skip||this.current().vars.push(id+(init?"="+init:"")),id},current:function(){return this.state[this.state.computing]}},ASTInterpreter.prototype={compile:function(ast){var self=this;findConstantAndWatchExpressions(ast,self.$filter);var assignable,assign;(assignable=assignableAST(ast))&&(assign=this.recurse(assignable));var inputs,toWatch=getInputs(ast.body);toWatch&&(inputs=[],forEach(toWatch,function(watch,key){var input=self.recurse(watch);watch.input=input,inputs.push(input),watch.watchId=key}));var expressions=[];forEach(ast.body,function(expression){expressions.push(self.recurse(expression.expression))});var fn=0===ast.body.length?noop:1===ast.body.length?expressions[0]:function(scope,locals){var lastValue;return forEach(expressions,function(exp){lastValue=exp(scope,locals)}),lastValue};return assign&&(fn.assign=function(scope,value,locals){return assign(scope,locals,value)}),inputs&&(fn.inputs=inputs),fn},recurse:function(ast,context,create){var left,right,args,self=this;if(ast.input)return this.inputs(ast.input,ast.watchId);switch(ast.type){case AST.Literal:return this.value(ast.value,context);case AST.UnaryExpression:return right=this.recurse(ast.argument),this["unary"+ast.operator](right,context);case AST.BinaryExpression:return left=this.recurse(ast.left),right=this.recurse(ast.right),this["binary"+ast.operator](left,right,context);case AST.LogicalExpression:return left=this.recurse(ast.left),right=this.recurse(ast.right),this["binary"+ast.operator](left,right,context);case AST.ConditionalExpression:return this["ternary?:"](this.recurse(ast.test),this.recurse(ast.alternate),this.recurse(ast.consequent),context);case AST.Identifier:return self.identifier(ast.name,context,create);case AST.MemberExpression:return left=this.recurse(ast.object,!1,!!create),ast.computed||(right=ast.property.name),ast.computed&&(right=this.recurse(ast.property)),ast.computed?this.computedMember(left,right,context,create):this.nonComputedMember(left,right,context,create);case AST.CallExpression:return args=[],forEach(ast.arguments,function(expr){args.push(self.recurse(expr))}),ast.filter&&(right=this.$filter(ast.callee.name)),ast.filter||(right=this.recurse(ast.callee,!0)),ast.filter?function(scope,locals,assign,inputs){for(var values=[],i=0;i<args.length;++i)values.push(args[i](scope,locals,assign,inputs));var value=right.apply(void 0,values,inputs);return context?{context:void 0,name:void 0,value:value}:value}:function(scope,locals,assign,inputs){var value,rhs=right(scope,locals,assign,inputs);if(null!=rhs.value){for(var values=[],i=0;i<args.length;++i)values.push(args[i](scope,locals,assign,inputs));value=rhs.value.apply(rhs.context,values)}return context?{value:value}:value};case AST.AssignmentExpression:return left=this.recurse(ast.left,!0,1),right=this.recurse(ast.right),function(scope,locals,assign,inputs){var lhs=left(scope,locals,assign,inputs),rhs=right(scope,locals,assign,inputs);return lhs.context[lhs.name]=rhs,context?{value:rhs}:rhs};case AST.ArrayExpression:return args=[],forEach(ast.elements,function(expr){args.push(self.recurse(expr))}),function(scope,locals,assign,inputs){for(var value=[],i=0;i<args.length;++i)value.push(args[i](scope,locals,assign,inputs));return context?{value:value}:value};case AST.ObjectExpression:return args=[],forEach(ast.properties,function(property){property.computed?args.push({key:self.recurse(property.key),computed:!0,value:self.recurse(property.value)}):args.push({key:property.key.type===AST.Identifier?property.key.name:""+property.key.value,computed:!1,value:self.recurse(property.value)})}),function(scope,locals,assign,inputs){for(var value={},i=0;i<args.length;++i)args[i].computed?value[args[i].key(scope,locals,assign,inputs)]=args[i].value(scope,locals,assign,inputs):value[args[i].key]=args[i].value(scope,locals,assign,inputs);return context?{value:value}:value};case AST.ThisExpression:return function(scope){return context?{value:scope}:scope};case AST.LocalsExpression:return function(scope,locals){return context?{value:locals}:locals};case AST.NGValueParameter:return function(scope,locals,assign){return context?{value:assign}:assign}}},"unary+":function(argument,context){return function(scope,locals,assign,inputs){var arg=argument(scope,locals,assign,inputs);return arg=isDefined(arg)?+arg:0,context?{value:arg}:arg}},"unary-":function(argument,context){return function(scope,locals,assign,inputs){var arg=argument(scope,locals,assign,inputs);return arg=isDefined(arg)?-arg:-0,context?{value:arg}:arg}},"unary!":function(argument,context){return function(scope,locals,assign,inputs){var arg=!argument(scope,locals,assign,inputs);return context?{value:arg}:arg}},"binary+":function(left,right,context){return function(scope,locals,assign,inputs){var lhs=left(scope,locals,assign,inputs),rhs=right(scope,locals,assign,inputs),arg=plusFn(lhs,rhs);return context?{value:arg}:arg}},"binary-":function(left,right,context){return function(scope,locals,assign,inputs){var lhs=left(scope,locals,assign,inputs),rhs=right(scope,locals,assign,inputs),arg=(isDefined(lhs)?lhs:0)-(isDefined(rhs)?rhs:0);return context?{value:arg}:arg}},"binary*":function(left,right,context){return function(scope,locals,assign,inputs){var arg=left(scope,locals,assign,inputs)*right(scope,locals,assign,inputs);return context?{value:arg}:arg}},"binary/":function(left,right,context){return function(scope,locals,assign,inputs){var arg=left(scope,locals,assign,inputs)/right(scope,locals,assign,inputs);return context?{value:arg}:arg}},"binary%":function(left,right,context){return function(scope,locals,assign,inputs){var arg=left(scope,locals,assign,inputs)%right(scope,locals,assign,inputs);return context?{value:arg}:arg}},"binary===":function(left,right,context){return function(scope,locals,assign,inputs){var arg=left(scope,locals,assign,inputs)===right(scope,locals,assign,inputs);return context?{value:arg}:arg}},"binary!==":function(left,right,context){return function(scope,locals,assign,inputs){var arg=left(scope,locals,assign,inputs)!==right(scope,locals,assign,inputs);return context?{value:arg}:arg}},"binary==":function(left,right,context){return function(scope,locals,assign,inputs){
// eslint-disable-next-line eqeqeq
var arg=left(scope,locals,assign,inputs)==right(scope,locals,assign,inputs);return context?{value:arg}:arg}},"binary!=":function(left,right,context){return function(scope,locals,assign,inputs){
// eslint-disable-next-line eqeqeq
var arg=left(scope,locals,assign,inputs)!=right(scope,locals,assign,inputs);return context?{value:arg}:arg}},"binary<":function(left,right,context){return function(scope,locals,assign,inputs){var arg=left(scope,locals,assign,inputs)<right(scope,locals,assign,inputs);return context?{value:arg}:arg}},"binary>":function(left,right,context){return function(scope,locals,assign,inputs){var arg=left(scope,locals,assign,inputs)>right(scope,locals,assign,inputs);return context?{value:arg}:arg}},"binary<=":function(left,right,context){return function(scope,locals,assign,inputs){var arg=left(scope,locals,assign,inputs)<=right(scope,locals,assign,inputs);return context?{value:arg}:arg}},"binary>=":function(left,right,context){return function(scope,locals,assign,inputs){var arg=left(scope,locals,assign,inputs)>=right(scope,locals,assign,inputs);return context?{value:arg}:arg}},"binary&&":function(left,right,context){return function(scope,locals,assign,inputs){var arg=left(scope,locals,assign,inputs)&&right(scope,locals,assign,inputs);return context?{value:arg}:arg}},"binary||":function(left,right,context){return function(scope,locals,assign,inputs){var arg=left(scope,locals,assign,inputs)||right(scope,locals,assign,inputs);return context?{value:arg}:arg}},"ternary?:":function(test,alternate,consequent,context){return function(scope,locals,assign,inputs){var arg=test(scope,locals,assign,inputs)?alternate(scope,locals,assign,inputs):consequent(scope,locals,assign,inputs);return context?{value:arg}:arg}},value:function(value,context){return function(){return context?{context:void 0,name:void 0,value:value}:value}},identifier:function(name,context,create){return function(scope,locals,assign,inputs){var base=locals&&name in locals?locals:scope;create&&1!==create&&base&&null==base[name]&&(base[name]={});var value=base?base[name]:void 0;return context?{context:base,name:name,value:value}:value}},computedMember:function(left,right,context,create){return function(scope,locals,assign,inputs){var rhs,value,lhs=left(scope,locals,assign,inputs);return null!=lhs&&(rhs=right(scope,locals,assign,inputs),rhs=getStringValue(rhs),create&&1!==create&&lhs&&!lhs[rhs]&&(lhs[rhs]={}),value=lhs[rhs]),context?{context:lhs,name:rhs,value:value}:value}},nonComputedMember:function(left,right,context,create){return function(scope,locals,assign,inputs){var lhs=left(scope,locals,assign,inputs);create&&1!==create&&lhs&&null==lhs[right]&&(lhs[right]={});var value=null!=lhs?lhs[right]:void 0;return context?{context:lhs,name:right,value:value}:value}},inputs:function(input,watchId){return function(scope,value,locals,inputs){return inputs?inputs[watchId]:input(scope,value,locals)}}},Parser.prototype={constructor:Parser,parse:function(text){var ast=this.ast.ast(text),fn=this.astCompiler.compile(ast);return fn.literal=isLiteral(ast),fn.constant=isConstant(ast),fn}};/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 *     Any commits to this file should be reviewed with security in mind.  *
 *   Changes to this file can potentially create security vulnerabilities. *
 *          An approval from 2 Core members with history of modifying      *
 *                         this file is required.                          *
 *                                                                         *
 *  Does the change somehow allow for arbitrary javascript to be executed? *
 *    Or allows for someone to change the prototype of built-in objects?   *
 *     Or gives undesired access to variables likes document or window?    *
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */
/* exported $SceProvider, $SceDelegateProvider */
var $sceMinErr=minErr("$sce"),SCE_CONTEXTS={
// HTML is used when there's HTML rendered (e.g. ng-bind-html, iframe srcdoc binding).
HTML:"html",
// Style statements or stylesheets. Currently unused in AngularJS.
CSS:"css",
// An URL used in a context where it does not refer to a resource that loads code. Currently
// unused in AngularJS.
URL:"url",
// RESOURCE_URL is a subtype of URL used where the referred-to resource could be interpreted as
// code. (e.g. ng-include, script src binding, templateUrl)
RESOURCE_URL:"resourceUrl",
// Script. Currently unused in AngularJS.
JS:"js"},UNDERSCORE_LOWERCASE_REGEXP=/_([a-z])/g,$templateRequestMinErr=minErr("$compile"),urlParsingNode=window.document.createElement("a"),originUrl=urlResolve(window.location.href);$$CookieReader.$inject=["$document"],/* global currencyFilter: true,
 dateFilter: true,
 filterFilter: true,
 jsonFilter: true,
 limitToFilter: true,
 lowercaseFilter: true,
 numberFilter: true,
 orderByFilter: true,
 uppercaseFilter: true,
 */
/**
 * @ngdoc provider
 * @name $filterProvider
 * @description
 *
 * Filters are just functions which transform input to an output. However filters need to be
 * Dependency Injected. To achieve this a filter definition consists of a factory function which is
 * annotated with dependencies and is responsible for creating a filter function.
 *
 * <div class="alert alert-warning">
 * **Note:** Filter names must be valid angular {@link expression} identifiers, such as `uppercase` or `orderBy`.
 * Names with special characters, such as hyphens and dots, are not allowed. If you wish to namespace
 * your filters, then you can use capitalization (`myappSubsectionFilterx`) or underscores
 * (`myapp_subsection_filterx`).
 * </div>
 *
 * ```js
 *   // Filter registration
 *   function MyModule($provide, $filterProvider) {
 *     // create a service to demonstrate injection (not always needed)
 *     $provide.value('greet', function(name){
 *       return 'Hello ' + name + '!';
 *     });
 *
 *     // register a filter factory which uses the
 *     // greet service to demonstrate DI.
 *     $filterProvider.register('greet', function(greet){
 *       // return the filter function which uses the greet service
 *       // to generate salutation
 *       return function(text) {
 *         // filters need to be forgiving so check input validity
 *         return text && greet(text) || text;
 *       };
 *     });
 *   }
 * ```
 *
 * The filter function is registered with the `$injector` under the filter name suffix with
 * `Filter`.
 *
 * ```js
 *   it('should be the same instance', inject(
 *     function($filterProvider) {
 *       $filterProvider.register('reverse', function(){
 *         return ...;
 *       });
 *     },
 *     function($filter, reverseFilter) {
 *       expect($filter('reverse')).toBe(reverseFilter);
 *     });
 * ```
 *
 *
 * For more information about how angular filters work, and how to create your own filters, see
 * {@link guide/filter Filters} in the Angular Developer Guide.
 */
/**
 * @ngdoc service
 * @name $filter
 * @kind function
 * @description
 * Filters are used for formatting data displayed to the user.
 *
 * They can be used in view templates, controllers or services.Angular comes
 * with a collection of [built-in filters](api/ng/filter), but it is easy to
 * define your own as well.
 *
 * The general syntax in templates is as follows:
 *
 * ```html
 * {{ expression [| filter_name[:parameter_value] ... ] }}
 * ```
 *
 * @param {String} name Name of the filter function to retrieve
 * @return {Function} the filter function
 * @example
   <example name="$filter" module="filterExample">
     <file name="index.html">
       <div ng-controller="MainCtrl">
        <h3>{{ originalText }}</h3>
        <h3>{{ filteredText }}</h3>
       </div>
     </file>

     <file name="script.js">
      angular.module('filterExample', [])
      .controller('MainCtrl', function($scope, $filter) {
        $scope.originalText = 'hello';
        $scope.filteredText = $filter('uppercase')($scope.originalText);
      });
     </file>
   </example>
  */
$FilterProvider.$inject=["$provide"];var MAX_DIGITS=22,DECIMAL_SEP=".",ZERO_CHAR="0";/**
 * @ngdoc filter
 * @name currency
 * @kind function
 *
 * @description
 * Formats a number as a currency (ie $1,234.56). When no currency symbol is provided, default
 * symbol for current locale is used.
 *
 * @param {number} amount Input to filter.
 * @param {string=} symbol Currency symbol or identifier to be displayed.
 * @param {number=} fractionSize Number of decimal places to round the amount to, defaults to default max fraction size for current locale
 * @returns {string} Formatted number.
 *
 *
 * @example
   <example module="currencyExample" name="currency-filter">
     <file name="index.html">
       <script>
         angular.module('currencyExample', [])
           .controller('ExampleController', ['$scope', function($scope) {
             $scope.amount = 1234.56;
           }]);
       </script>
       <div ng-controller="ExampleController">
         <input type="number" ng-model="amount" aria-label="amount"> <br>
         default currency symbol ($): <span id="currency-default">{{amount | currency}}</span><br>
         custom currency identifier (USD$): <span id="currency-custom">{{amount | currency:"USD$"}}</span><br>
         no fractions (0): <span id="currency-no-fractions">{{amount | currency:"USD$":0}}</span>
       </div>
     </file>
     <file name="protractor.js" type="protractor">
       it('should init with 1234.56', function() {
         expect(element(by.id('currency-default')).getText()).toBe('$1,234.56');
         expect(element(by.id('currency-custom')).getText()).toBe('USD$1,234.56');
         expect(element(by.id('currency-no-fractions')).getText()).toBe('USD$1,235');
       });
       it('should update', function() {
         if (browser.params.browser === 'safari') {
           // Safari does not understand the minus key. See
           // https://github.com/angular/protractor/issues/481
           return;
         }
         element(by.model('amount')).clear();
         element(by.model('amount')).sendKeys('-1234');
         expect(element(by.id('currency-default')).getText()).toBe('-$1,234.00');
         expect(element(by.id('currency-custom')).getText()).toBe('-USD$1,234.00');
         expect(element(by.id('currency-no-fractions')).getText()).toBe('-USD$1,234');
       });
     </file>
   </example>
 */
currencyFilter.$inject=["$locale"],/**
 * @ngdoc filter
 * @name number
 * @kind function
 *
 * @description
 * Formats a number as text.
 *
 * If the input is null or undefined, it will just be returned.
 * If the input is infinite (Infinity or -Infinity), the Infinity symbol '∞' or '-∞' is returned, respectively.
 * If the input is not a number an empty string is returned.
 *
 *
 * @param {number|string} number Number to format.
 * @param {(number|string)=} fractionSize Number of decimal places to round the number to.
 * If this is not provided then the fraction size is computed from the current locale's number
 * formatting pattern. In the case of the default locale, it will be 3.
 * @returns {string} Number rounded to `fractionSize` appropriately formatted based on the current
 *                   locale (e.g., in the en_US locale it will have "." as the decimal separator and
 *                   include "," group separators after each third digit).
 *
 * @example
   <example module="numberFilterExample" name="number-filter">
     <file name="index.html">
       <script>
         angular.module('numberFilterExample', [])
           .controller('ExampleController', ['$scope', function($scope) {
             $scope.val = 1234.56789;
           }]);
       </script>
       <div ng-controller="ExampleController">
         <label>Enter number: <input ng-model='val'></label><br>
         Default formatting: <span id='number-default'>{{val | number}}</span><br>
         No fractions: <span>{{val | number:0}}</span><br>
         Negative number: <span>{{-val | number:4}}</span>
       </div>
     </file>
     <file name="protractor.js" type="protractor">
       it('should format numbers', function() {
         expect(element(by.id('number-default')).getText()).toBe('1,234.568');
         expect(element(by.binding('val | number:0')).getText()).toBe('1,235');
         expect(element(by.binding('-val | number:4')).getText()).toBe('-1,234.5679');
       });

       it('should update', function() {
         element(by.model('val')).clear();
         element(by.model('val')).sendKeys('3374.333');
         expect(element(by.id('number-default')).getText()).toBe('3,374.333');
         expect(element(by.binding('val | number:0')).getText()).toBe('3,374');
         expect(element(by.binding('-val | number:4')).getText()).toBe('-3,374.3330');
      });
     </file>
   </example>
 */
numberFilter.$inject=["$locale"];var DATE_FORMATS={yyyy:dateGetter("FullYear",4,0,!1,!0),yy:dateGetter("FullYear",2,0,!0,!0),y:dateGetter("FullYear",1,0,!1,!0),MMMM:dateStrGetter("Month"),MMM:dateStrGetter("Month",!0),MM:dateGetter("Month",2,1),M:dateGetter("Month",1,1),LLLL:dateStrGetter("Month",!1,!0),dd:dateGetter("Date",2),d:dateGetter("Date",1),HH:dateGetter("Hours",2),H:dateGetter("Hours",1),hh:dateGetter("Hours",2,-12),h:dateGetter("Hours",1,-12),mm:dateGetter("Minutes",2),m:dateGetter("Minutes",1),ss:dateGetter("Seconds",2),s:dateGetter("Seconds",1),
// while ISO 8601 requires fractions to be prefixed with `.` or `,`
// we can be just safely rely on using `sss` since we currently don't support single or two digit fractions
sss:dateGetter("Milliseconds",3),EEEE:dateStrGetter("Day"),EEE:dateStrGetter("Day",!0),a:ampmGetter,Z:timeZoneGetter,ww:weekGetter(2),w:weekGetter(1),G:eraGetter,GG:eraGetter,GGG:eraGetter,GGGG:longEraGetter},DATE_FORMATS_SPLIT=/((?:[^yMLdHhmsaZEwG']+)|(?:'(?:[^']|'')*')|(?:E+|y+|M+|L+|d+|H+|h+|m+|s+|a|Z|G+|w+))([\s\S]*)/,NUMBER_STRING=/^-?\d+$/;/**
 * @ngdoc filter
 * @name date
 * @kind function
 *
 * @description
 *   Formats `date` to a string based on the requested `format`.
 *
 *   `format` string can be composed of the following elements:
 *
 *   * `'yyyy'`: 4 digit representation of year (e.g. AD 1 => 0001, AD 2010 => 2010)
 *   * `'yy'`: 2 digit representation of year, padded (00-99). (e.g. AD 2001 => 01, AD 2010 => 10)
 *   * `'y'`: 1 digit representation of year, e.g. (AD 1 => 1, AD 199 => 199)
 *   * `'MMMM'`: Month in year (January-December)
 *   * `'MMM'`: Month in year (Jan-Dec)
 *   * `'MM'`: Month in year, padded (01-12)
 *   * `'M'`: Month in year (1-12)
 *   * `'LLLL'`: Stand-alone month in year (January-December)
 *   * `'dd'`: Day in month, padded (01-31)
 *   * `'d'`: Day in month (1-31)
 *   * `'EEEE'`: Day in Week,(Sunday-Saturday)
 *   * `'EEE'`: Day in Week, (Sun-Sat)
 *   * `'HH'`: Hour in day, padded (00-23)
 *   * `'H'`: Hour in day (0-23)
 *   * `'hh'`: Hour in AM/PM, padded (01-12)
 *   * `'h'`: Hour in AM/PM, (1-12)
 *   * `'mm'`: Minute in hour, padded (00-59)
 *   * `'m'`: Minute in hour (0-59)
 *   * `'ss'`: Second in minute, padded (00-59)
 *   * `'s'`: Second in minute (0-59)
 *   * `'sss'`: Millisecond in second, padded (000-999)
 *   * `'a'`: AM/PM marker
 *   * `'Z'`: 4 digit (+sign) representation of the timezone offset (-1200-+1200)
 *   * `'ww'`: Week of year, padded (00-53). Week 01 is the week with the first Thursday of the year
 *   * `'w'`: Week of year (0-53). Week 1 is the week with the first Thursday of the year
 *   * `'G'`, `'GG'`, `'GGG'`: The abbreviated form of the era string (e.g. 'AD')
 *   * `'GGGG'`: The long form of the era string (e.g. 'Anno Domini')
 *
 *   `format` string can also be one of the following predefined
 *   {@link guide/i18n localizable formats}:
 *
 *   * `'medium'`: equivalent to `'MMM d, y h:mm:ss a'` for en_US locale
 *     (e.g. Sep 3, 2010 12:05:08 PM)
 *   * `'short'`: equivalent to `'M/d/yy h:mm a'` for en_US  locale (e.g. 9/3/10 12:05 PM)
 *   * `'fullDate'`: equivalent to `'EEEE, MMMM d, y'` for en_US  locale
 *     (e.g. Friday, September 3, 2010)
 *   * `'longDate'`: equivalent to `'MMMM d, y'` for en_US  locale (e.g. September 3, 2010)
 *   * `'mediumDate'`: equivalent to `'MMM d, y'` for en_US  locale (e.g. Sep 3, 2010)
 *   * `'shortDate'`: equivalent to `'M/d/yy'` for en_US locale (e.g. 9/3/10)
 *   * `'mediumTime'`: equivalent to `'h:mm:ss a'` for en_US locale (e.g. 12:05:08 PM)
 *   * `'shortTime'`: equivalent to `'h:mm a'` for en_US locale (e.g. 12:05 PM)
 *
 *   `format` string can contain literal values. These need to be escaped by surrounding with single quotes (e.g.
 *   `"h 'in the morning'"`). In order to output a single quote, escape it - i.e., two single quotes in a sequence
 *   (e.g. `"h 'o''clock'"`).
 *
 *   Any other characters in the `format` string will be output as-is.
 *
 * @param {(Date|number|string)} date Date to format either as Date object, milliseconds (string or
 *    number) or various ISO 8601 datetime string formats (e.g. yyyy-MM-ddTHH:mm:ss.sssZ and its
 *    shorter versions like yyyy-MM-ddTHH:mmZ, yyyy-MM-dd or yyyyMMddTHHmmssZ). If no timezone is
 *    specified in the string input, the time is considered to be in the local timezone.
 * @param {string=} format Formatting rules (see Description). If not specified,
 *    `mediumDate` is used.
 * @param {string=} timezone Timezone to be used for formatting. It understands UTC/GMT and the
 *    continental US time zone abbreviations, but for general use, use a time zone offset, for
 *    example, `'+0430'` (4 hours, 30 minutes east of the Greenwich meridian)
 *    If not specified, the timezone of the browser will be used.
 * @returns {string} Formatted string or the input if input is not recognized as date/millis.
 *
 * @example
   <example name="filter-date">
     <file name="index.html">
       <span ng-non-bindable>{{1288323623006 | date:'medium'}}</span>:
           <span>{{1288323623006 | date:'medium'}}</span><br>
       <span ng-non-bindable>{{1288323623006 | date:'yyyy-MM-dd HH:mm:ss Z'}}</span>:
          <span>{{1288323623006 | date:'yyyy-MM-dd HH:mm:ss Z'}}</span><br>
       <span ng-non-bindable>{{1288323623006 | date:'MM/dd/yyyy @ h:mma'}}</span>:
          <span>{{'1288323623006' | date:'MM/dd/yyyy @ h:mma'}}</span><br>
       <span ng-non-bindable>{{1288323623006 | date:"MM/dd/yyyy 'at' h:mma"}}</span>:
          <span>{{'1288323623006' | date:"MM/dd/yyyy 'at' h:mma"}}</span><br>
     </file>
     <file name="protractor.js" type="protractor">
       it('should format date', function() {
         expect(element(by.binding("1288323623006 | date:'medium'")).getText()).
            toMatch(/Oct 2\d, 2010 \d{1,2}:\d{2}:\d{2} (AM|PM)/);
         expect(element(by.binding("1288323623006 | date:'yyyy-MM-dd HH:mm:ss Z'")).getText()).
            toMatch(/2010-10-2\d \d{2}:\d{2}:\d{2} (-|\+)?\d{4}/);
         expect(element(by.binding("'1288323623006' | date:'MM/dd/yyyy @ h:mma'")).getText()).
            toMatch(/10\/2\d\/2010 @ \d{1,2}:\d{2}(AM|PM)/);
         expect(element(by.binding("'1288323623006' | date:\"MM/dd/yyyy 'at' h:mma\"")).getText()).
            toMatch(/10\/2\d\/2010 at \d{1,2}:\d{2}(AM|PM)/);
       });
     </file>
   </example>
 */
dateFilter.$inject=["$locale"];/**
 * @ngdoc filter
 * @name lowercase
 * @kind function
 * @description
 * Converts string to lowercase.
 * @see angular.lowercase
 */
var lowercaseFilter=valueFn(lowercase),uppercaseFilter=valueFn(uppercase);/**
 * @ngdoc filter
 * @name orderBy
 * @kind function
 *
 * @description
 * Returns an array containing the items from the specified `collection`, ordered by a `comparator`
 * function based on the values computed using the `expression` predicate.
 *
 * For example, `[{id: 'foo'}, {id: 'bar'}] | orderBy:'id'` would result in
 * `[{id: 'bar'}, {id: 'foo'}]`.
 *
 * The `collection` can be an Array or array-like object (e.g. NodeList, jQuery object, TypedArray,
 * String, etc).
 *
 * The `expression` can be a single predicate, or a list of predicates each serving as a tie-breaker
 * for the preceding one. The `expression` is evaluated against each item and the output is used
 * for comparing with other items.
 *
 * You can change the sorting order by setting `reverse` to `true`. By default, items are sorted in
 * ascending order.
 *
 * The comparison is done using the `comparator` function. If none is specified, a default, built-in
 * comparator is used (see below for details - in a nutshell, it compares numbers numerically and
 * strings alphabetically).
 *
 * ### Under the hood
 *
 * Ordering the specified `collection` happens in two phases:
 *
 * 1. All items are passed through the predicate (or predicates), and the returned values are saved
 *    along with their type (`string`, `number` etc). For example, an item `{label: 'foo'}`, passed
 *    through a predicate that extracts the value of the `label` property, would be transformed to:
 *    ```
 *    {
 *      value: 'foo',
 *      type: 'string',
 *      index: ...
 *    }
 *    ```
 * 2. The comparator function is used to sort the items, based on the derived values, types and
 *    indices.
 *
 * If you use a custom comparator, it will be called with pairs of objects of the form
 * `{value: ..., type: '...', index: ...}` and is expected to return `0` if the objects are equal
 * (as far as the comparator is concerned), `-1` if the 1st one should be ranked higher than the
 * second, or `1` otherwise.
 *
 * In order to ensure that the sorting will be deterministic across platforms, if none of the
 * specified predicates can distinguish between two items, `orderBy` will automatically introduce a
 * dummy predicate that returns the item's index as `value`.
 * (If you are using a custom comparator, make sure it can handle this predicate as well.)
 *
 * Finally, in an attempt to simplify things, if a predicate returns an object as the extracted
 * value for an item, `orderBy` will try to convert that object to a primitive value, before passing
 * it to the comparator. The following rules govern the conversion:
 *
 * 1. If the object has a `valueOf()` method that returns a primitive, its return value will be
 *    used instead.<br />
 *    (If the object has a `valueOf()` method that returns another object, then the returned object
 *    will be used in subsequent steps.)
 * 2. If the object has a custom `toString()` method (i.e. not the one inherited from `Object`) that
 *    returns a primitive, its return value will be used instead.<br />
 *    (If the object has a `toString()` method that returns another object, then the returned object
 *    will be used in subsequent steps.)
 * 3. No conversion; the object itself is used.
 *
 * ### The default comparator
 *
 * The default, built-in comparator should be sufficient for most usecases. In short, it compares
 * numbers numerically, strings alphabetically (and case-insensitively), for objects falls back to
 * using their index in the original collection, and sorts values of different types by type.
 *
 * More specifically, it follows these steps to determine the relative order of items:
 *
 * 1. If the compared values are of different types, compare the types themselves alphabetically.
 * 2. If both values are of type `string`, compare them alphabetically in a case- and
 *    locale-insensitive way.
 * 3. If both values are objects, compare their indices instead.
 * 4. Otherwise, return:
 *    -  `0`, if the values are equal (by strict equality comparison, i.e. using `===`).
 *    - `-1`, if the 1st value is "less than" the 2nd value (compared using the `<` operator).
 *    -  `1`, otherwise.
 *
 * **Note:** If you notice numbers not being sorted as expected, make sure they are actually being
 *           saved as numbers and not strings.
 * **Note:** For the purpose of sorting, `null` values are treated as the string `'null'` (i.e.
 *           `type: 'string'`, `value: 'null'`). This may cause unexpected sort order relative to
 *           other values.
 *
 * @param {Array|ArrayLike} collection - The collection (array or array-like object) to sort.
 * @param {(Function|string|Array.<Function|string>)=} expression - A predicate (or list of
 *    predicates) to be used by the comparator to determine the order of elements.
 *
 *    Can be one of:
 *
 *    - `Function`: A getter function. This function will be called with each item as argument and
 *      the return value will be used for sorting.
 *    - `string`: An Angular expression. This expression will be evaluated against each item and the
 *      result will be used for sorting. For example, use `'label'` to sort by a property called
 *      `label` or `'label.substring(0, 3)'` to sort by the first 3 characters of the `label`
 *      property.<br />
 *      (The result of a constant expression is interpreted as a property name to be used for
 *      comparison. For example, use `'"special name"'` (note the extra pair of quotes) to sort by a
 *      property called `special name`.)<br />
 *      An expression can be optionally prefixed with `+` or `-` to control the sorting direction,
 *      ascending or descending. For example, `'+label'` or `'-label'`. If no property is provided,
 *      (e.g. `'+'` or `'-'`), the collection element itself is used in comparisons.
 *    - `Array`: An array of function and/or string predicates. If a predicate cannot determine the
 *      relative order of two items, the next predicate is used as a tie-breaker.
 *
 * **Note:** If the predicate is missing or empty then it defaults to `'+'`.
 *
 * @param {boolean=} reverse - If `true`, reverse the sorting order.
 * @param {(Function)=} comparator - The comparator function used to determine the relative order of
 *    value pairs. If omitted, the built-in comparator will be used.
 *
 * @returns {Array} - The sorted array.
 *
 *
 * @example
 * ### Ordering a table with `ngRepeat`
 *
 * The example below demonstrates a simple {@link ngRepeat ngRepeat}, where the data is sorted by
 * age in descending order (expression is set to `'-age'`). The `comparator` is not set, which means
 * it defaults to the built-in comparator.
 *
   <example name="orderBy-static" module="orderByExample1">
     <file name="index.html">
       <div ng-controller="ExampleController">
         <table class="friends">
           <tr>
             <th>Name</th>
             <th>Phone Number</th>
             <th>Age</th>
           </tr>
           <tr ng-repeat="friend in friends | orderBy:'-age'">
             <td>{{friend.name}}</td>
             <td>{{friend.phone}}</td>
             <td>{{friend.age}}</td>
           </tr>
         </table>
       </div>
     </file>
     <file name="script.js">
       angular.module('orderByExample1', [])
         .controller('ExampleController', ['$scope', function($scope) {
           $scope.friends = [
             {name: 'John',   phone: '555-1212',  age: 10},
             {name: 'Mary',   phone: '555-9876',  age: 19},
             {name: 'Mike',   phone: '555-4321',  age: 21},
             {name: 'Adam',   phone: '555-5678',  age: 35},
             {name: 'Julie',  phone: '555-8765',  age: 29}
           ];
         }]);
     </file>
     <file name="style.css">
       .friends {
         border-collapse: collapse;
       }

       .friends th {
         border-bottom: 1px solid;
       }
       .friends td, .friends th {
         border-left: 1px solid;
         padding: 5px 10px;
       }
       .friends td:first-child, .friends th:first-child {
         border-left: none;
       }
     </file>
     <file name="protractor.js" type="protractor">
       // Element locators
       var names = element.all(by.repeater('friends').column('friend.name'));

       it('should sort friends by age in reverse order', function() {
         expect(names.get(0).getText()).toBe('Adam');
         expect(names.get(1).getText()).toBe('Julie');
         expect(names.get(2).getText()).toBe('Mike');
         expect(names.get(3).getText()).toBe('Mary');
         expect(names.get(4).getText()).toBe('John');
       });
     </file>
   </example>
 * <hr />
 *
 * @example
 * ### Changing parameters dynamically
 *
 * All parameters can be changed dynamically. The next example shows how you can make the columns of
 * a table sortable, by binding the `expression` and `reverse` parameters to scope properties.
 *
   <example name="orderBy-dynamic" module="orderByExample2">
     <file name="index.html">
       <div ng-controller="ExampleController">
         <pre>Sort by = {{propertyName}}; reverse = {{reverse}}</pre>
         <hr/>
         <button ng-click="propertyName = null; reverse = false">Set to unsorted</button>
         <hr/>
         <table class="friends">
           <tr>
             <th>
               <button ng-click="sortBy('name')">Name</button>
               <span class="sortorder" ng-show="propertyName === 'name'" ng-class="{reverse: reverse}"></span>
             </th>
             <th>
               <button ng-click="sortBy('phone')">Phone Number</button>
               <span class="sortorder" ng-show="propertyName === 'phone'" ng-class="{reverse: reverse}"></span>
             </th>
             <th>
               <button ng-click="sortBy('age')">Age</button>
               <span class="sortorder" ng-show="propertyName === 'age'" ng-class="{reverse: reverse}"></span>
             </th>
           </tr>
           <tr ng-repeat="friend in friends | orderBy:propertyName:reverse">
             <td>{{friend.name}}</td>
             <td>{{friend.phone}}</td>
             <td>{{friend.age}}</td>
           </tr>
         </table>
       </div>
     </file>
     <file name="script.js">
       angular.module('orderByExample2', [])
         .controller('ExampleController', ['$scope', function($scope) {
           var friends = [
             {name: 'John',   phone: '555-1212',  age: 10},
             {name: 'Mary',   phone: '555-9876',  age: 19},
             {name: 'Mike',   phone: '555-4321',  age: 21},
             {name: 'Adam',   phone: '555-5678',  age: 35},
             {name: 'Julie',  phone: '555-8765',  age: 29}
           ];

           $scope.propertyName = 'age';
           $scope.reverse = true;
           $scope.friends = friends;

           $scope.sortBy = function(propertyName) {
             $scope.reverse = ($scope.propertyName === propertyName) ? !$scope.reverse : false;
             $scope.propertyName = propertyName;
           };
         }]);
     </file>
     <file name="style.css">
       .friends {
         border-collapse: collapse;
       }

       .friends th {
         border-bottom: 1px solid;
       }
       .friends td, .friends th {
         border-left: 1px solid;
         padding: 5px 10px;
       }
       .friends td:first-child, .friends th:first-child {
         border-left: none;
       }

       .sortorder:after {
         content: '\25b2';   // BLACK UP-POINTING TRIANGLE
       }
       .sortorder.reverse:after {
         content: '\25bc';   // BLACK DOWN-POINTING TRIANGLE
       }
     </file>
     <file name="protractor.js" type="protractor">
       // Element locators
       var unsortButton = element(by.partialButtonText('unsorted'));
       var nameHeader = element(by.partialButtonText('Name'));
       var phoneHeader = element(by.partialButtonText('Phone'));
       var ageHeader = element(by.partialButtonText('Age'));
       var firstName = element(by.repeater('friends').column('friend.name').row(0));
       var lastName = element(by.repeater('friends').column('friend.name').row(4));

       it('should sort friends by some property, when clicking on the column header', function() {
         expect(firstName.getText()).toBe('Adam');
         expect(lastName.getText()).toBe('John');

         phoneHeader.click();
         expect(firstName.getText()).toBe('John');
         expect(lastName.getText()).toBe('Mary');

         nameHeader.click();
         expect(firstName.getText()).toBe('Adam');
         expect(lastName.getText()).toBe('Mike');

         ageHeader.click();
         expect(firstName.getText()).toBe('John');
         expect(lastName.getText()).toBe('Adam');
       });

       it('should sort friends in reverse order, when clicking on the same column', function() {
         expect(firstName.getText()).toBe('Adam');
         expect(lastName.getText()).toBe('John');

         ageHeader.click();
         expect(firstName.getText()).toBe('John');
         expect(lastName.getText()).toBe('Adam');

         ageHeader.click();
         expect(firstName.getText()).toBe('Adam');
         expect(lastName.getText()).toBe('John');
       });

       it('should restore the original order, when clicking "Set to unsorted"', function() {
         expect(firstName.getText()).toBe('Adam');
         expect(lastName.getText()).toBe('John');

         unsortButton.click();
         expect(firstName.getText()).toBe('John');
         expect(lastName.getText()).toBe('Julie');
       });
     </file>
   </example>
 * <hr />
 *
 * @example
 * ### Using `orderBy` inside a controller
 *
 * It is also possible to call the `orderBy` filter manually, by injecting `orderByFilter`, and
 * calling it with the desired parameters. (Alternatively, you could inject the `$filter` factory
 * and retrieve the `orderBy` filter with `$filter('orderBy')`.)
 *
   <example name="orderBy-call-manually" module="orderByExample3">
     <file name="index.html">
       <div ng-controller="ExampleController">
         <pre>Sort by = {{propertyName}}; reverse = {{reverse}}</pre>
         <hr/>
         <button ng-click="sortBy(null)">Set to unsorted</button>
         <hr/>
         <table class="friends">
           <tr>
             <th>
               <button ng-click="sortBy('name')">Name</button>
               <span class="sortorder" ng-show="propertyName === 'name'" ng-class="{reverse: reverse}"></span>
             </th>
             <th>
               <button ng-click="sortBy('phone')">Phone Number</button>
               <span class="sortorder" ng-show="propertyName === 'phone'" ng-class="{reverse: reverse}"></span>
             </th>
             <th>
               <button ng-click="sortBy('age')">Age</button>
               <span class="sortorder" ng-show="propertyName === 'age'" ng-class="{reverse: reverse}"></span>
             </th>
           </tr>
           <tr ng-repeat="friend in friends">
             <td>{{friend.name}}</td>
             <td>{{friend.phone}}</td>
             <td>{{friend.age}}</td>
           </tr>
         </table>
       </div>
     </file>
     <file name="script.js">
       angular.module('orderByExample3', [])
         .controller('ExampleController', ['$scope', 'orderByFilter', function($scope, orderBy) {
           var friends = [
             {name: 'John',   phone: '555-1212',  age: 10},
             {name: 'Mary',   phone: '555-9876',  age: 19},
             {name: 'Mike',   phone: '555-4321',  age: 21},
             {name: 'Adam',   phone: '555-5678',  age: 35},
             {name: 'Julie',  phone: '555-8765',  age: 29}
           ];

           $scope.propertyName = 'age';
           $scope.reverse = true;
           $scope.friends = orderBy(friends, $scope.propertyName, $scope.reverse);

           $scope.sortBy = function(propertyName) {
             $scope.reverse = (propertyName !== null && $scope.propertyName === propertyName)
                 ? !$scope.reverse : false;
             $scope.propertyName = propertyName;
             $scope.friends = orderBy(friends, $scope.propertyName, $scope.reverse);
           };
         }]);
     </file>
     <file name="style.css">
       .friends {
         border-collapse: collapse;
       }

       .friends th {
         border-bottom: 1px solid;
       }
       .friends td, .friends th {
         border-left: 1px solid;
         padding: 5px 10px;
       }
       .friends td:first-child, .friends th:first-child {
         border-left: none;
       }

       .sortorder:after {
         content: '\25b2';   // BLACK UP-POINTING TRIANGLE
       }
       .sortorder.reverse:after {
         content: '\25bc';   // BLACK DOWN-POINTING TRIANGLE
       }
     </file>
     <file name="protractor.js" type="protractor">
       // Element locators
       var unsortButton = element(by.partialButtonText('unsorted'));
       var nameHeader = element(by.partialButtonText('Name'));
       var phoneHeader = element(by.partialButtonText('Phone'));
       var ageHeader = element(by.partialButtonText('Age'));
       var firstName = element(by.repeater('friends').column('friend.name').row(0));
       var lastName = element(by.repeater('friends').column('friend.name').row(4));

       it('should sort friends by some property, when clicking on the column header', function() {
         expect(firstName.getText()).toBe('Adam');
         expect(lastName.getText()).toBe('John');

         phoneHeader.click();
         expect(firstName.getText()).toBe('John');
         expect(lastName.getText()).toBe('Mary');

         nameHeader.click();
         expect(firstName.getText()).toBe('Adam');
         expect(lastName.getText()).toBe('Mike');

         ageHeader.click();
         expect(firstName.getText()).toBe('John');
         expect(lastName.getText()).toBe('Adam');
       });

       it('should sort friends in reverse order, when clicking on the same column', function() {
         expect(firstName.getText()).toBe('Adam');
         expect(lastName.getText()).toBe('John');

         ageHeader.click();
         expect(firstName.getText()).toBe('John');
         expect(lastName.getText()).toBe('Adam');

         ageHeader.click();
         expect(firstName.getText()).toBe('Adam');
         expect(lastName.getText()).toBe('John');
       });

       it('should restore the original order, when clicking "Set to unsorted"', function() {
         expect(firstName.getText()).toBe('Adam');
         expect(lastName.getText()).toBe('John');

         unsortButton.click();
         expect(firstName.getText()).toBe('John');
         expect(lastName.getText()).toBe('Julie');
       });
     </file>
   </example>
 * <hr />
 *
 * @example
 * ### Using a custom comparator
 *
 * If you have very specific requirements about the way items are sorted, you can pass your own
 * comparator function. For example, you might need to compare some strings in a locale-sensitive
 * way. (When specifying a custom comparator, you also need to pass a value for the `reverse`
 * argument - passing `false` retains the default sorting order, i.e. ascending.)
 *
   <example name="orderBy-custom-comparator" module="orderByExample4">
     <file name="index.html">
       <div ng-controller="ExampleController">
         <div class="friends-container custom-comparator">
           <h3>Locale-sensitive Comparator</h3>
           <table class="friends">
             <tr>
               <th>Name</th>
               <th>Favorite Letter</th>
             </tr>
             <tr ng-repeat="friend in friends | orderBy:'favoriteLetter':false:localeSensitiveComparator">
               <td>{{friend.name}}</td>
               <td>{{friend.favoriteLetter}}</td>
             </tr>
           </table>
         </div>
         <div class="friends-container default-comparator">
           <h3>Default Comparator</h3>
           <table class="friends">
             <tr>
               <th>Name</th>
               <th>Favorite Letter</th>
             </tr>
             <tr ng-repeat="friend in friends | orderBy:'favoriteLetter'">
               <td>{{friend.name}}</td>
               <td>{{friend.favoriteLetter}}</td>
             </tr>
           </table>
         </div>
       </div>
     </file>
     <file name="script.js">
       angular.module('orderByExample4', [])
         .controller('ExampleController', ['$scope', function($scope) {
           $scope.friends = [
             {name: 'John',   favoriteLetter: 'Ä'},
             {name: 'Mary',   favoriteLetter: 'Ü'},
             {name: 'Mike',   favoriteLetter: 'Ö'},
             {name: 'Adam',   favoriteLetter: 'H'},
             {name: 'Julie',  favoriteLetter: 'Z'}
           ];

           $scope.localeSensitiveComparator = function(v1, v2) {
             // If we don't get strings, just compare by index
             if (v1.type !== 'string' || v2.type !== 'string') {
               return (v1.index < v2.index) ? -1 : 1;
             }

             // Compare strings alphabetically, taking locale into account
             return v1.value.localeCompare(v2.value);
           };
         }]);
     </file>
     <file name="style.css">
       .friends-container {
         display: inline-block;
         margin: 0 30px;
       }

       .friends {
         border-collapse: collapse;
       }

       .friends th {
         border-bottom: 1px solid;
       }
       .friends td, .friends th {
         border-left: 1px solid;
         padding: 5px 10px;
       }
       .friends td:first-child, .friends th:first-child {
         border-left: none;
       }
     </file>
     <file name="protractor.js" type="protractor">
       // Element locators
       var container = element(by.css('.custom-comparator'));
       var names = container.all(by.repeater('friends').column('friend.name'));

       it('should sort friends by favorite letter (in correct alphabetical order)', function() {
         expect(names.get(0).getText()).toBe('John');
         expect(names.get(1).getText()).toBe('Adam');
         expect(names.get(2).getText()).toBe('Mike');
         expect(names.get(3).getText()).toBe('Mary');
         expect(names.get(4).getText()).toBe('Julie');
       });
     </file>
   </example>
 *
 */
orderByFilter.$inject=["$parse"];/**
 * @ngdoc directive
 * @name a
 * @restrict E
 *
 * @description
 * Modifies the default behavior of the html a tag so that the default action is prevented when
 * the href attribute is empty.
 *
 * For dynamically creating `href` attributes for a tags, see the {@link ng.ngHref `ngHref`} directive.
 */
var htmlAnchorDirective=valueFn({restrict:"E",compile:function(element,attr){if(!attr.href&&!attr.xlinkHref)return function(scope,element){
// If the linked element is not an anchor tag anymore, do nothing
if("a"===element[0].nodeName.toLowerCase()){
// SVGAElement does not use the href attribute, but rather the 'xlinkHref' attribute.
var href="[object SVGAnimatedString]"===toString.call(element.prop("href"))?"xlink:href":"href";element.on("click",function(event){
// if we have no href url, then don't navigate anywhere.
element.attr(href)||event.preventDefault()})}}}}),ngAttributeAliasDirectives={};
// boolean attrs are evaluated
forEach(BOOLEAN_ATTR,function(propName,attrName){function defaultLinkFn(scope,element,attr){scope.$watch(attr[normalized],function(value){attr.$set(attrName,!!value)})}
// binding to multiple is not supported
if("multiple"!==propName){var normalized=directiveNormalize("ng-"+attrName),linkFn=defaultLinkFn;"checked"===propName&&(linkFn=function(scope,element,attr){
// ensuring ngChecked doesn't interfere with ngModel when both are set on the same input
attr.ngModel!==attr[normalized]&&defaultLinkFn(scope,element,attr)}),ngAttributeAliasDirectives[normalized]=function(){return{restrict:"A",priority:100,link:linkFn}}}}),
// aliased input attrs are evaluated
forEach(ALIASED_ATTR,function(htmlAttr,ngAttr){ngAttributeAliasDirectives[ngAttr]=function(){return{priority:100,link:function(scope,element,attr){
//special case ngPattern when a literal regular expression value
//is used as the expression (this way we don't have to watch anything).
if("ngPattern"===ngAttr&&"/"===attr.ngPattern.charAt(0)){var match=attr.ngPattern.match(REGEX_STRING_REGEXP);if(match)return void attr.$set("ngPattern",new RegExp(match[1],match[2]))}scope.$watch(attr[ngAttr],function(value){attr.$set(ngAttr,value)})}}}}),
// ng-src, ng-srcset, ng-href are interpolated
forEach(["src","srcset","href"],function(attrName){var normalized=directiveNormalize("ng-"+attrName);ngAttributeAliasDirectives[normalized]=function(){return{priority:99,// it needs to run after the attributes are interpolated
link:function(scope,element,attr){var propName=attrName,name=attrName;"href"===attrName&&"[object SVGAnimatedString]"===toString.call(element.prop("href"))&&(name="xlinkHref",attr.$attr[name]="xlink:href",propName=null),attr.$observe(normalized,function(value){
// Support: IE 9-11 only
// On IE, if "ng:src" directive declaration is used and "src" attribute doesn't exist
// then calling element.setAttribute('src', 'foo') doesn't do anything, so we need
// to set the property as well to achieve the desired effect.
// We use attr[attrName] value since $set can sanitize the url.
return value?(attr.$set(name,value),void(msie&&propName&&element.prop(propName,attr[name]))):void("href"===attrName&&attr.$set(name,null))})}}}});/* global -nullFormCtrl, -PENDING_CLASS, -SUBMITTED_CLASS
 */
var nullFormCtrl={$addControl:noop,$$renameControl:nullFormRenameControl,$removeControl:noop,$setValidity:noop,$setDirty:noop,$setPristine:noop,$setSubmitted:noop},PENDING_CLASS="ng-pending",SUBMITTED_CLASS="ng-submitted";/**
 * @ngdoc type
 * @name form.FormController
 *
 * @property {boolean} $pristine True if user has not interacted with the form yet.
 * @property {boolean} $dirty True if user has already interacted with the form.
 * @property {boolean} $valid True if all of the containing forms and controls are valid.
 * @property {boolean} $invalid True if at least one containing control or form is invalid.
 * @property {boolean} $pending True if at least one containing control or form is pending.
 * @property {boolean} $submitted True if user has submitted the form even if its invalid.
 *
 * @property {Object} $error Is an object hash, containing references to controls or
 *  forms with failing validators, where:
 *
 *  - keys are validation tokens (error names),
 *  - values are arrays of controls or forms that have a failing validator for given error name.
 *
 *  Built-in validation tokens:
 *
 *  - `email`
 *  - `max`
 *  - `maxlength`
 *  - `min`
 *  - `minlength`
 *  - `number`
 *  - `pattern`
 *  - `required`
 *  - `url`
 *  - `date`
 *  - `datetimelocal`
 *  - `time`
 *  - `week`
 *  - `month`
 *
 * @description
 * `FormController` keeps track of all its controls and nested forms as well as the state of them,
 * such as being valid/invalid or dirty/pristine.
 *
 * Each {@link ng.directive:form form} directive creates an instance
 * of `FormController`.
 *
 */
//asks for $scope to fool the BC controller module
FormController.$inject=["$element","$attrs","$scope","$animate","$interpolate"],FormController.prototype={/**
   * @ngdoc method
   * @name form.FormController#$rollbackViewValue
   *
   * @description
   * Rollback all form controls pending updates to the `$modelValue`.
   *
   * Updates may be pending by a debounced event or because the input is waiting for a some future
   * event defined in `ng-model-options`. This method is typically needed by the reset button of
   * a form that uses `ng-model-options` to pend updates.
   */
$rollbackViewValue:function(){forEach(this.$$controls,function(control){control.$rollbackViewValue()})},/**
   * @ngdoc method
   * @name form.FormController#$commitViewValue
   *
   * @description
   * Commit all form controls pending updates to the `$modelValue`.
   *
   * Updates may be pending by a debounced event or because the input is waiting for a some future
   * event defined in `ng-model-options`. This method is rarely needed as `NgModelController`
   * usually handles calling this in response to input events.
   */
$commitViewValue:function(){forEach(this.$$controls,function(control){control.$commitViewValue()})},/**
   * @ngdoc method
   * @name form.FormController#$addControl
   * @param {object} control control object, either a {@link form.FormController} or an
   * {@link ngModel.NgModelController}
   *
   * @description
   * Register a control with the form. Input elements using ngModelController do this automatically
   * when they are linked.
   *
   * Note that the current state of the control will not be reflected on the new parent form. This
   * is not an issue with normal use, as freshly compiled and linked controls are in a `$pristine`
   * state.
   *
   * However, if the method is used programmatically, for example by adding dynamically created controls,
   * or controls that have been previously removed without destroying their corresponding DOM element,
   * it's the developers responsibility to make sure the current state propagates to the parent form.
   *
   * For example, if an input control is added that is already `$dirty` and has `$error` properties,
   * calling `$setDirty()` and `$validate()` afterwards will propagate the state to the parent form.
   */
$addControl:function(control){
// Breaking change - before, inputs whose name was "hasOwnProperty" were quietly ignored
// and not added to the scope.  Now we throw an error.
assertNotHasOwnProperty(control.$name,"input"),this.$$controls.push(control),control.$name&&(this[control.$name]=control),control.$$parentForm=this},
// Private API: rename a form control
$$renameControl:function(control,newName){var oldName=control.$name;this[oldName]===control&&delete this[oldName],this[newName]=control,control.$name=newName},/**
   * @ngdoc method
   * @name form.FormController#$removeControl
   * @param {object} control control object, either a {@link form.FormController} or an
   * {@link ngModel.NgModelController}
   *
   * @description
   * Deregister a control from the form.
   *
   * Input elements using ngModelController do this automatically when they are destroyed.
   *
   * Note that only the removed control's validation state (`$errors`etc.) will be removed from the
   * form. `$dirty`, `$submitted` states will not be changed, because the expected behavior can be
   * different from case to case. For example, removing the only `$dirty` control from a form may or
   * may not mean that the form is still `$dirty`.
   */
$removeControl:function(control){control.$name&&this[control.$name]===control&&delete this[control.$name],forEach(this.$pending,function(value,name){
// eslint-disable-next-line no-invalid-this
this.$setValidity(name,null,control)},this),forEach(this.$error,function(value,name){
// eslint-disable-next-line no-invalid-this
this.$setValidity(name,null,control)},this),forEach(this.$$success,function(value,name){
// eslint-disable-next-line no-invalid-this
this.$setValidity(name,null,control)},this),arrayRemove(this.$$controls,control),control.$$parentForm=nullFormCtrl},/**
   * @ngdoc method
   * @name form.FormController#$setDirty
   *
   * @description
   * Sets the form to a dirty state.
   *
   * This method can be called to add the 'ng-dirty' class and set the form to a dirty
   * state (ng-dirty class). This method will also propagate to parent forms.
   */
$setDirty:function(){this.$$animate.removeClass(this.$$element,PRISTINE_CLASS),this.$$animate.addClass(this.$$element,DIRTY_CLASS),this.$dirty=!0,this.$pristine=!1,this.$$parentForm.$setDirty()},/**
   * @ngdoc method
   * @name form.FormController#$setPristine
   *
   * @description
   * Sets the form to its pristine state.
   *
   * This method sets the form's `$pristine` state to true, the `$dirty` state to false, removes
   * the `ng-dirty` class and adds the `ng-pristine` class. Additionally, it sets the `$submitted`
   * state to false.
   *
   * This method will also propagate to all the controls contained in this form.
   *
   * Setting a form back to a pristine state is often useful when we want to 'reuse' a form after
   * saving or resetting it.
   */
$setPristine:function(){this.$$animate.setClass(this.$$element,PRISTINE_CLASS,DIRTY_CLASS+" "+SUBMITTED_CLASS),this.$dirty=!1,this.$pristine=!0,this.$submitted=!1,forEach(this.$$controls,function(control){control.$setPristine()})},/**
   * @ngdoc method
   * @name form.FormController#$setUntouched
   *
   * @description
   * Sets the form to its untouched state.
   *
   * This method can be called to remove the 'ng-touched' class and set the form controls to their
   * untouched state (ng-untouched class).
   *
   * Setting a form controls back to their untouched state is often useful when setting the form
   * back to its pristine state.
   */
$setUntouched:function(){forEach(this.$$controls,function(control){control.$setUntouched()})},/**
   * @ngdoc method
   * @name form.FormController#$setSubmitted
   *
   * @description
   * Sets the form to its submitted state.
   */
$setSubmitted:function(){this.$$animate.addClass(this.$$element,SUBMITTED_CLASS),this.$submitted=!0,this.$$parentForm.$setSubmitted()}},/**
 * @ngdoc method
 * @name form.FormController#$setValidity
 *
 * @description
 * Sets the validity of a form control.
 *
 * This method will also propagate to parent forms.
 */
addSetValidityMethod({clazz:FormController,set:function(object,property,controller){var list=object[property];if(list){var index=list.indexOf(controller);index===-1&&list.push(controller)}else object[property]=[controller]},unset:function(object,property,controller){var list=object[property];list&&(arrayRemove(list,controller),0===list.length&&delete object[property])}});/**
 * @ngdoc directive
 * @name ngForm
 * @restrict EAC
 *
 * @description
 * Nestable alias of {@link ng.directive:form `form`} directive. HTML
 * does not allow nesting of form elements. It is useful to nest forms, for example if the validity of a
 * sub-group of controls needs to be determined.
 *
 * Note: the purpose of `ngForm` is to group controls,
 * but not to be a replacement for the `<form>` tag with all of its capabilities
 * (e.g. posting to the server, ...).
 *
 * @param {string=} ngForm|name Name of the form. If specified, the form controller will be published into
 *                       related scope, under this name.
 *
 */
/**
 * @ngdoc directive
 * @name form
 * @restrict E
 *
 * @description
 * Directive that instantiates
 * {@link form.FormController FormController}.
 *
 * If the `name` attribute is specified, the form controller is published onto the current scope under
 * this name.
 *
 * # Alias: {@link ng.directive:ngForm `ngForm`}
 *
 * In Angular, forms can be nested. This means that the outer form is valid when all of the child
 * forms are valid as well. However, browsers do not allow nesting of `<form>` elements, so
 * Angular provides the {@link ng.directive:ngForm `ngForm`} directive, which behaves identically to
 * `form` but can be nested. Nested forms can be useful, for example, if the validity of a sub-group
 * of controls needs to be determined.
 *
 * # CSS classes
 *  - `ng-valid` is set if the form is valid.
 *  - `ng-invalid` is set if the form is invalid.
 *  - `ng-pending` is set if the form is pending.
 *  - `ng-pristine` is set if the form is pristine.
 *  - `ng-dirty` is set if the form is dirty.
 *  - `ng-submitted` is set if the form was submitted.
 *
 * Keep in mind that ngAnimate can detect each of these classes when added and removed.
 *
 *
 * # Submitting a form and preventing the default action
 *
 * Since the role of forms in client-side Angular applications is different than in classical
 * roundtrip apps, it is desirable for the browser not to translate the form submission into a full
 * page reload that sends the data to the server. Instead some javascript logic should be triggered
 * to handle the form submission in an application-specific way.
 *
 * For this reason, Angular prevents the default action (form submission to the server) unless the
 * `<form>` element has an `action` attribute specified.
 *
 * You can use one of the following two ways to specify what javascript method should be called when
 * a form is submitted:
 *
 * - {@link ng.directive:ngSubmit ngSubmit} directive on the form element
 * - {@link ng.directive:ngClick ngClick} directive on the first
  *  button or input field of type submit (input[type=submit])
 *
 * To prevent double execution of the handler, use only one of the {@link ng.directive:ngSubmit ngSubmit}
 * or {@link ng.directive:ngClick ngClick} directives.
 * This is because of the following form submission rules in the HTML specification:
 *
 * - If a form has only one input field then hitting enter in this field triggers form submit
 * (`ngSubmit`)
 * - if a form has 2+ input fields and no buttons or input[type=submit] then hitting enter
 * doesn't trigger submit
 * - if a form has one or more input fields and one or more buttons or input[type=submit] then
 * hitting enter in any of the input fields will trigger the click handler on the *first* button or
 * input[type=submit] (`ngClick`) *and* a submit handler on the enclosing form (`ngSubmit`)
 *
 * Any pending `ngModelOptions` changes will take place immediately when an enclosing form is
 * submitted. Note that `ngClick` events will occur before the model is updated. Use `ngSubmit`
 * to have access to the updated model.
 *
 * ## Animation Hooks
 *
 * Animations in ngForm are triggered when any of the associated CSS classes are added and removed.
 * These classes are: `.ng-pristine`, `.ng-dirty`, `.ng-invalid` and `.ng-valid` as well as any
 * other validations that are performed within the form. Animations in ngForm are similar to how
 * they work in ngClass and animations can be hooked into using CSS transitions, keyframes as well
 * as JS animations.
 *
 * The following example shows a simple way to utilize CSS transitions to style a form element
 * that has been rendered as invalid after it has been validated:
 *
 * <pre>
 * //be sure to include ngAnimate as a module to hook into more
 * //advanced animations
 * .my-form {
 *   transition:0.5s linear all;
 *   background: white;
 * }
 * .my-form.ng-invalid {
 *   background: red;
 *   color:white;
 * }
 * </pre>
 *
 * @example
    <example name="ng-form" deps="angular-animate.js" animations="true" fixBase="true" module="formExample">
      <file name="index.html">
       <script>
         angular.module('formExample', [])
           .controller('FormController', ['$scope', function($scope) {
             $scope.userType = 'guest';
           }]);
       </script>
       <style>
        .my-form {
          transition:all linear 0.5s;
          background: transparent;
        }
        .my-form.ng-invalid {
          background: red;
        }
       </style>
       <form name="myForm" ng-controller="FormController" class="my-form">
         userType: <input name="input" ng-model="userType" required>
         <span class="error" ng-show="myForm.input.$error.required">Required!</span><br>
         <code>userType = {{userType}}</code><br>
         <code>myForm.input.$valid = {{myForm.input.$valid}}</code><br>
         <code>myForm.input.$error = {{myForm.input.$error}}</code><br>
         <code>myForm.$valid = {{myForm.$valid}}</code><br>
         <code>myForm.$error.required = {{!!myForm.$error.required}}</code><br>
        </form>
      </file>
      <file name="protractor.js" type="protractor">
        it('should initialize to model', function() {
          var userType = element(by.binding('userType'));
          var valid = element(by.binding('myForm.input.$valid'));

          expect(userType.getText()).toContain('guest');
          expect(valid.getText()).toContain('true');
        });

        it('should be invalid if empty', function() {
          var userType = element(by.binding('userType'));
          var valid = element(by.binding('myForm.input.$valid'));
          var userInput = element(by.model('userType'));

          userInput.clear();
          userInput.sendKeys('');

          expect(userType.getText()).toEqual('userType =');
          expect(valid.getText()).toContain('false');
        });
      </file>
    </example>
 *
 * @param {string=} name Name of the form. If specified, the form controller will be published into
 *                       related scope, under this name.
 */
var formDirectiveFactory=function(isNgForm){return["$timeout","$parse",function($timeout,$parse){function getSetter(expression){return""===expression?$parse('this[""]').assign:$parse(expression).assign||noop}var formDirective={name:"form",restrict:isNgForm?"EAC":"E",require:["form","^^?form"],//first is the form's own ctrl, second is an optional parent form
controller:FormController,compile:function(formElement,attr){
// Setup initial state of the control
formElement.addClass(PRISTINE_CLASS).addClass(VALID_CLASS);var nameAttr=attr.name?"name":!(!isNgForm||!attr.ngForm)&&"ngForm";return{pre:function(scope,formElement,attr,ctrls){var controller=ctrls[0];
// if `action` attr is not present on the form, prevent the default action (submission)
if(!("action"in attr)){
// we can't use jq events because if a form is destroyed during submission the default
// action is not prevented. see #1238
//
// IE 9 is not affected because it doesn't fire a submit event and try to do a full
// page reload if the form was destroyed by submission of the form via a click handler
// on a button in the form. Looks like an IE9 specific bug.
var handleFormSubmission=function(event){scope.$apply(function(){controller.$commitViewValue(),controller.$setSubmitted()}),event.preventDefault()};formElement[0].addEventListener("submit",handleFormSubmission),
// unregister the preventDefault listener so that we don't not leak memory but in a
// way that will achieve the prevention of the default action.
formElement.on("$destroy",function(){$timeout(function(){formElement[0].removeEventListener("submit",handleFormSubmission)},0,!1)})}var parentFormCtrl=ctrls[1]||controller.$$parentForm;parentFormCtrl.$addControl(controller);var setter=nameAttr?getSetter(controller.$name):noop;nameAttr&&(setter(scope,controller),attr.$observe(nameAttr,function(newValue){controller.$name!==newValue&&(setter(scope,void 0),controller.$$parentForm.$$renameControl(controller,newValue),(setter=getSetter(controller.$name))(scope,controller))})),formElement.on("$destroy",function(){controller.$$parentForm.$removeControl(controller),setter(scope,void 0),extend(controller,nullFormCtrl)})}}}};return formDirective}]},formDirective=formDirectiveFactory(),ngFormDirective=formDirectiveFactory(!0),ISO_DATE_REGEXP=/^\d{4,}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d\.\d+(?:[+-][0-2]\d:[0-5]\d|Z)$/,URL_REGEXP=/^[a-z][a-z\d.+-]*:\/*(?:[^:@]+(?::[^@]+)?@)?(?:[^\s:\/?#]+|\[[a-f\d:]+])(?::\d+)?(?:\/[^?#]*)?(?:\?[^#]*)?(?:#.*)?$/i,EMAIL_REGEXP=/^(?=.{1,254}$)(?=.{1,64}@)[-!#$%&'*+\/0-9=?A-Z^_`a-z{|}~]+(\.[-!#$%&'*+\/0-9=?A-Z^_`a-z{|}~]+)*@[A-Za-z0-9]([A-Za-z0-9-]{0,61}[A-Za-z0-9])?(\.[A-Za-z0-9]([A-Za-z0-9-]{0,61}[A-Za-z0-9])?)*$/,NUMBER_REGEXP=/^\s*(-|\+)?(\d+|(\d*(\.\d*)))([eE][+-]?\d+)?\s*$/,DATE_REGEXP=/^(\d{4,})-(\d{2})-(\d{2})$/,DATETIMELOCAL_REGEXP=/^(\d{4,})-(\d\d)-(\d\d)T(\d\d):(\d\d)(?::(\d\d)(\.\d{1,3})?)?$/,WEEK_REGEXP=/^(\d{4,})-W(\d\d)$/,MONTH_REGEXP=/^(\d{4,})-(\d\d)$/,TIME_REGEXP=/^(\d\d):(\d\d)(?::(\d\d)(\.\d{1,3})?)?$/,PARTIAL_VALIDATION_EVENTS="keydown wheel mousedown",PARTIAL_VALIDATION_TYPES=createMap();forEach("date,datetime-local,month,time,week".split(","),function(type){PARTIAL_VALIDATION_TYPES[type]=!0});var inputType={/**
   * @ngdoc input
   * @name input[text]
   *
   * @description
   * Standard HTML text input with angular data binding, inherited by most of the `input` elements.
   *
   *
   * @param {string} ngModel Assignable angular expression to data-bind to.
   * @param {string=} name Property name of the form under which the control is published.
   * @param {string=} required Adds `required` validation error key if the value is not entered.
   * @param {string=} ngRequired Adds `required` attribute and `required` validation constraint to
   *    the element when the ngRequired expression evaluates to true. Use `ngRequired` instead of
   *    `required` when you want to data-bind to the `required` attribute.
   * @param {number=} ngMinlength Sets `minlength` validation error key if the value is shorter than
   *    minlength.
   * @param {number=} ngMaxlength Sets `maxlength` validation error key if the value is longer than
   *    maxlength. Setting the attribute to a negative or non-numeric value, allows view values of
   *    any length.
   * @param {string=} pattern Similar to `ngPattern` except that the attribute value is the actual string
   *    that contains the regular expression body that will be converted to a regular expression
   *    as in the ngPattern directive.
   * @param {string=} ngPattern Sets `pattern` validation error key if the ngModel {@link ngModel.NgModelController#$viewValue $viewValue}
   *    does not match a RegExp found by evaluating the Angular expression given in the attribute value.
   *    If the expression evaluates to a RegExp object, then this is used directly.
   *    If the expression evaluates to a string, then it will be converted to a RegExp
   *    after wrapping it in `^` and `$` characters. For instance, `"abc"` will be converted to
   *    `new RegExp('^abc$')`.<br />
   *    **Note:** Avoid using the `g` flag on the RegExp, as it will cause each successive search to
   *    start at the index of the last search's match, thus not taking the whole input value into
   *    account.
   * @param {string=} ngChange Angular expression to be executed when input changes due to user
   *    interaction with the input element.
   * @param {boolean=} [ngTrim=true] If set to false Angular will not automatically trim the input.
   *    This parameter is ignored for input[type=password] controls, which will never trim the
   *    input.
   *
   * @example
      <example name="text-input-directive" module="textInputExample">
        <file name="index.html">
         <script>
           angular.module('textInputExample', [])
             .controller('ExampleController', ['$scope', function($scope) {
               $scope.example = {
                 text: 'guest',
                 word: /^\s*\w*\s*$/
               };
             }]);
         </script>
         <form name="myForm" ng-controller="ExampleController">
           <label>Single word:
             <input type="text" name="input" ng-model="example.text"
                    ng-pattern="example.word" required ng-trim="false">
           </label>
           <div role="alert">
             <span class="error" ng-show="myForm.input.$error.required">
               Required!</span>
             <span class="error" ng-show="myForm.input.$error.pattern">
               Single word only!</span>
           </div>
           <code>text = {{example.text}}</code><br/>
           <code>myForm.input.$valid = {{myForm.input.$valid}}</code><br/>
           <code>myForm.input.$error = {{myForm.input.$error}}</code><br/>
           <code>myForm.$valid = {{myForm.$valid}}</code><br/>
           <code>myForm.$error.required = {{!!myForm.$error.required}}</code><br/>
          </form>
        </file>
        <file name="protractor.js" type="protractor">
          var text = element(by.binding('example.text'));
          var valid = element(by.binding('myForm.input.$valid'));
          var input = element(by.model('example.text'));

          it('should initialize to model', function() {
            expect(text.getText()).toContain('guest');
            expect(valid.getText()).toContain('true');
          });

          it('should be invalid if empty', function() {
            input.clear();
            input.sendKeys('');

            expect(text.getText()).toEqual('text =');
            expect(valid.getText()).toContain('false');
          });

          it('should be invalid if multi word', function() {
            input.clear();
            input.sendKeys('hello world');

            expect(valid.getText()).toContain('false');
          });
        </file>
      </example>
   */
text:textInputType,/**
     * @ngdoc input
     * @name input[date]
     *
     * @description
     * Input with date validation and transformation. In browsers that do not yet support
     * the HTML5 date input, a text element will be used. In that case, text must be entered in a valid ISO-8601
     * date format (yyyy-MM-dd), for example: `2009-01-06`. Since many
     * modern browsers do not yet support this input type, it is important to provide cues to users on the
     * expected input format via a placeholder or label.
     *
     * The model must always be a Date object, otherwise Angular will throw an error.
     * Invalid `Date` objects (dates whose `getTime()` is `NaN`) will be rendered as an empty string.
     *
     * The timezone to be used to read/write the `Date` instance in the model can be defined using
     * {@link ng.directive:ngModelOptions ngModelOptions}. By default, this is the timezone of the browser.
     *
     * @param {string} ngModel Assignable angular expression to data-bind to.
     * @param {string=} name Property name of the form under which the control is published.
     * @param {string=} min Sets the `min` validation error key if the value entered is less than `min`. This must be a
     *   valid ISO date string (yyyy-MM-dd). You can also use interpolation inside this attribute
     *   (e.g. `min="{{minDate | date:'yyyy-MM-dd'}}"`). Note that `min` will also add native HTML5
     *   constraint validation.
     * @param {string=} max Sets the `max` validation error key if the value entered is greater than `max`. This must be
     *   a valid ISO date string (yyyy-MM-dd). You can also use interpolation inside this attribute
     *   (e.g. `max="{{maxDate | date:'yyyy-MM-dd'}}"`). Note that `max` will also add native HTML5
     *   constraint validation.
     * @param {(date|string)=} ngMin Sets the `min` validation constraint to the Date / ISO date string
     *   the `ngMin` expression evaluates to. Note that it does not set the `min` attribute.
     * @param {(date|string)=} ngMax Sets the `max` validation constraint to the Date / ISO date string
     *   the `ngMax` expression evaluates to. Note that it does not set the `max` attribute.
     * @param {string=} required Sets `required` validation error key if the value is not entered.
     * @param {string=} ngRequired Adds `required` attribute and `required` validation constraint to
     *    the element when the ngRequired expression evaluates to true. Use `ngRequired` instead of
     *    `required` when you want to data-bind to the `required` attribute.
     * @param {string=} ngChange Angular expression to be executed when input changes due to user
     *    interaction with the input element.
     *
     * @example
     <example name="date-input-directive" module="dateInputExample">
     <file name="index.html">
       <script>
          angular.module('dateInputExample', [])
            .controller('DateController', ['$scope', function($scope) {
              $scope.example = {
                value: new Date(2013, 9, 22)
              };
            }]);
       </script>
       <form name="myForm" ng-controller="DateController as dateCtrl">
          <label for="exampleInput">Pick a date in 2013:</label>
          <input type="date" id="exampleInput" name="input" ng-model="example.value"
              placeholder="yyyy-MM-dd" min="2013-01-01" max="2013-12-31" required />
          <div role="alert">
            <span class="error" ng-show="myForm.input.$error.required">
                Required!</span>
            <span class="error" ng-show="myForm.input.$error.date">
                Not a valid date!</span>
           </div>
           <tt>value = {{example.value | date: "yyyy-MM-dd"}}</tt><br/>
           <tt>myForm.input.$valid = {{myForm.input.$valid}}</tt><br/>
           <tt>myForm.input.$error = {{myForm.input.$error}}</tt><br/>
           <tt>myForm.$valid = {{myForm.$valid}}</tt><br/>
           <tt>myForm.$error.required = {{!!myForm.$error.required}}</tt><br/>
       </form>
     </file>
     <file name="protractor.js" type="protractor">
        var value = element(by.binding('example.value | date: "yyyy-MM-dd"'));
        var valid = element(by.binding('myForm.input.$valid'));

        // currently protractor/webdriver does not support
        // sending keys to all known HTML5 input controls
        // for various browsers (see https://github.com/angular/protractor/issues/562).
        function setInput(val) {
          // set the value of the element and force validation.
          var scr = "var ipt = document.getElementById('exampleInput'); " +
          "ipt.value = '" + val + "';" +
          "angular.element(ipt).scope().$apply(function(s) { s.myForm[ipt.name].$setViewValue('" + val + "'); });";
          browser.executeScript(scr);
        }

        it('should initialize to model', function() {
          expect(value.getText()).toContain('2013-10-22');
          expect(valid.getText()).toContain('myForm.input.$valid = true');
        });

        it('should be invalid if empty', function() {
          setInput('');
          expect(value.getText()).toEqual('value =');
          expect(valid.getText()).toContain('myForm.input.$valid = false');
        });

        it('should be invalid if over max', function() {
          setInput('2015-01-01');
          expect(value.getText()).toContain('');
          expect(valid.getText()).toContain('myForm.input.$valid = false');
        });
     </file>
     </example>
     */
date:createDateInputType("date",DATE_REGEXP,createDateParser(DATE_REGEXP,["yyyy","MM","dd"]),"yyyy-MM-dd"),/**
    * @ngdoc input
    * @name input[datetime-local]
    *
    * @description
    * Input with datetime validation and transformation. In browsers that do not yet support
    * the HTML5 date input, a text element will be used. In that case, the text must be entered in a valid ISO-8601
    * local datetime format (yyyy-MM-ddTHH:mm:ss), for example: `2010-12-28T14:57:00`.
    *
    * The model must always be a Date object, otherwise Angular will throw an error.
    * Invalid `Date` objects (dates whose `getTime()` is `NaN`) will be rendered as an empty string.
    *
    * The timezone to be used to read/write the `Date` instance in the model can be defined using
    * {@link ng.directive:ngModelOptions ngModelOptions}. By default, this is the timezone of the browser.
    *
    * @param {string} ngModel Assignable angular expression to data-bind to.
    * @param {string=} name Property name of the form under which the control is published.
    * @param {string=} min Sets the `min` validation error key if the value entered is less than `min`.
    *   This must be a valid ISO datetime format (yyyy-MM-ddTHH:mm:ss). You can also use interpolation
    *   inside this attribute (e.g. `min="{{minDatetimeLocal | date:'yyyy-MM-ddTHH:mm:ss'}}"`).
    *   Note that `min` will also add native HTML5 constraint validation.
    * @param {string=} max Sets the `max` validation error key if the value entered is greater than `max`.
    *   This must be a valid ISO datetime format (yyyy-MM-ddTHH:mm:ss). You can also use interpolation
    *   inside this attribute (e.g. `max="{{maxDatetimeLocal | date:'yyyy-MM-ddTHH:mm:ss'}}"`).
    *   Note that `max` will also add native HTML5 constraint validation.
    * @param {(date|string)=} ngMin Sets the `min` validation error key to the Date / ISO datetime string
    *   the `ngMin` expression evaluates to. Note that it does not set the `min` attribute.
    * @param {(date|string)=} ngMax Sets the `max` validation error key to the Date / ISO datetime string
    *   the `ngMax` expression evaluates to. Note that it does not set the `max` attribute.
    * @param {string=} required Sets `required` validation error key if the value is not entered.
    * @param {string=} ngRequired Adds `required` attribute and `required` validation constraint to
    *    the element when the ngRequired expression evaluates to true. Use `ngRequired` instead of
    *    `required` when you want to data-bind to the `required` attribute.
    * @param {string=} ngChange Angular expression to be executed when input changes due to user
    *    interaction with the input element.
    *
    * @example
    <example name="datetimelocal-input-directive" module="dateExample">
    <file name="index.html">
      <script>
        angular.module('dateExample', [])
          .controller('DateController', ['$scope', function($scope) {
            $scope.example = {
              value: new Date(2010, 11, 28, 14, 57)
            };
          }]);
      </script>
      <form name="myForm" ng-controller="DateController as dateCtrl">
        <label for="exampleInput">Pick a date between in 2013:</label>
        <input type="datetime-local" id="exampleInput" name="input" ng-model="example.value"
            placeholder="yyyy-MM-ddTHH:mm:ss" min="2001-01-01T00:00:00" max="2013-12-31T00:00:00" required />
        <div role="alert">
          <span class="error" ng-show="myForm.input.$error.required">
              Required!</span>
          <span class="error" ng-show="myForm.input.$error.datetimelocal">
              Not a valid date!</span>
        </div>
        <tt>value = {{example.value | date: "yyyy-MM-ddTHH:mm:ss"}}</tt><br/>
        <tt>myForm.input.$valid = {{myForm.input.$valid}}</tt><br/>
        <tt>myForm.input.$error = {{myForm.input.$error}}</tt><br/>
        <tt>myForm.$valid = {{myForm.$valid}}</tt><br/>
        <tt>myForm.$error.required = {{!!myForm.$error.required}}</tt><br/>
      </form>
    </file>
    <file name="protractor.js" type="protractor">
      var value = element(by.binding('example.value | date: "yyyy-MM-ddTHH:mm:ss"'));
      var valid = element(by.binding('myForm.input.$valid'));

      // currently protractor/webdriver does not support
      // sending keys to all known HTML5 input controls
      // for various browsers (https://github.com/angular/protractor/issues/562).
      function setInput(val) {
        // set the value of the element and force validation.
        var scr = "var ipt = document.getElementById('exampleInput'); " +
        "ipt.value = '" + val + "';" +
        "angular.element(ipt).scope().$apply(function(s) { s.myForm[ipt.name].$setViewValue('" + val + "'); });";
        browser.executeScript(scr);
      }

      it('should initialize to model', function() {
        expect(value.getText()).toContain('2010-12-28T14:57:00');
        expect(valid.getText()).toContain('myForm.input.$valid = true');
      });

      it('should be invalid if empty', function() {
        setInput('');
        expect(value.getText()).toEqual('value =');
        expect(valid.getText()).toContain('myForm.input.$valid = false');
      });

      it('should be invalid if over max', function() {
        setInput('2015-01-01T23:59:00');
        expect(value.getText()).toContain('');
        expect(valid.getText()).toContain('myForm.input.$valid = false');
      });
    </file>
    </example>
    */
"datetime-local":createDateInputType("datetimelocal",DATETIMELOCAL_REGEXP,createDateParser(DATETIMELOCAL_REGEXP,["yyyy","MM","dd","HH","mm","ss","sss"]),"yyyy-MM-ddTHH:mm:ss.sss"),/**
   * @ngdoc input
   * @name input[time]
   *
   * @description
   * Input with time validation and transformation. In browsers that do not yet support
   * the HTML5 time input, a text element will be used. In that case, the text must be entered in a valid ISO-8601
   * local time format (HH:mm:ss), for example: `14:57:00`. Model must be a Date object. This binding will always output a
   * Date object to the model of January 1, 1970, or local date `new Date(1970, 0, 1, HH, mm, ss)`.
   *
   * The model must always be a Date object, otherwise Angular will throw an error.
   * Invalid `Date` objects (dates whose `getTime()` is `NaN`) will be rendered as an empty string.
   *
   * The timezone to be used to read/write the `Date` instance in the model can be defined using
   * {@link ng.directive:ngModelOptions ngModelOptions}. By default, this is the timezone of the browser.
   *
   * @param {string} ngModel Assignable angular expression to data-bind to.
   * @param {string=} name Property name of the form under which the control is published.
   * @param {string=} min Sets the `min` validation error key if the value entered is less than `min`.
   *   This must be a valid ISO time format (HH:mm:ss). You can also use interpolation inside this
   *   attribute (e.g. `min="{{minTime | date:'HH:mm:ss'}}"`). Note that `min` will also add
   *   native HTML5 constraint validation.
   * @param {string=} max Sets the `max` validation error key if the value entered is greater than `max`.
   *   This must be a valid ISO time format (HH:mm:ss). You can also use interpolation inside this
   *   attribute (e.g. `max="{{maxTime | date:'HH:mm:ss'}}"`). Note that `max` will also add
   *   native HTML5 constraint validation.
   * @param {(date|string)=} ngMin Sets the `min` validation constraint to the Date / ISO time string the
   *   `ngMin` expression evaluates to. Note that it does not set the `min` attribute.
   * @param {(date|string)=} ngMax Sets the `max` validation constraint to the Date / ISO time string the
   *   `ngMax` expression evaluates to. Note that it does not set the `max` attribute.
   * @param {string=} required Sets `required` validation error key if the value is not entered.
   * @param {string=} ngRequired Adds `required` attribute and `required` validation constraint to
   *    the element when the ngRequired expression evaluates to true. Use `ngRequired` instead of
   *    `required` when you want to data-bind to the `required` attribute.
   * @param {string=} ngChange Angular expression to be executed when input changes due to user
   *    interaction with the input element.
   *
   * @example
   <example name="time-input-directive" module="timeExample">
   <file name="index.html">
     <script>
      angular.module('timeExample', [])
        .controller('DateController', ['$scope', function($scope) {
          $scope.example = {
            value: new Date(1970, 0, 1, 14, 57, 0)
          };
        }]);
     </script>
     <form name="myForm" ng-controller="DateController as dateCtrl">
        <label for="exampleInput">Pick a time between 8am and 5pm:</label>
        <input type="time" id="exampleInput" name="input" ng-model="example.value"
            placeholder="HH:mm:ss" min="08:00:00" max="17:00:00" required />
        <div role="alert">
          <span class="error" ng-show="myForm.input.$error.required">
              Required!</span>
          <span class="error" ng-show="myForm.input.$error.time">
              Not a valid date!</span>
        </div>
        <tt>value = {{example.value | date: "HH:mm:ss"}}</tt><br/>
        <tt>myForm.input.$valid = {{myForm.input.$valid}}</tt><br/>
        <tt>myForm.input.$error = {{myForm.input.$error}}</tt><br/>
        <tt>myForm.$valid = {{myForm.$valid}}</tt><br/>
        <tt>myForm.$error.required = {{!!myForm.$error.required}}</tt><br/>
     </form>
   </file>
   <file name="protractor.js" type="protractor">
      var value = element(by.binding('example.value | date: "HH:mm:ss"'));
      var valid = element(by.binding('myForm.input.$valid'));

      // currently protractor/webdriver does not support
      // sending keys to all known HTML5 input controls
      // for various browsers (https://github.com/angular/protractor/issues/562).
      function setInput(val) {
        // set the value of the element and force validation.
        var scr = "var ipt = document.getElementById('exampleInput'); " +
        "ipt.value = '" + val + "';" +
        "angular.element(ipt).scope().$apply(function(s) { s.myForm[ipt.name].$setViewValue('" + val + "'); });";
        browser.executeScript(scr);
      }

      it('should initialize to model', function() {
        expect(value.getText()).toContain('14:57:00');
        expect(valid.getText()).toContain('myForm.input.$valid = true');
      });

      it('should be invalid if empty', function() {
        setInput('');
        expect(value.getText()).toEqual('value =');
        expect(valid.getText()).toContain('myForm.input.$valid = false');
      });

      it('should be invalid if over max', function() {
        setInput('23:59:00');
        expect(value.getText()).toContain('');
        expect(valid.getText()).toContain('myForm.input.$valid = false');
      });
   </file>
   </example>
   */
time:createDateInputType("time",TIME_REGEXP,createDateParser(TIME_REGEXP,["HH","mm","ss","sss"]),"HH:mm:ss.sss"),/**
    * @ngdoc input
    * @name input[week]
    *
    * @description
    * Input with week-of-the-year validation and transformation to Date. In browsers that do not yet support
    * the HTML5 week input, a text element will be used. In that case, the text must be entered in a valid ISO-8601
    * week format (yyyy-W##), for example: `2013-W02`.
    *
    * The model must always be a Date object, otherwise Angular will throw an error.
    * Invalid `Date` objects (dates whose `getTime()` is `NaN`) will be rendered as an empty string.
    *
    * The timezone to be used to read/write the `Date` instance in the model can be defined using
    * {@link ng.directive:ngModelOptions ngModelOptions}. By default, this is the timezone of the browser.
    *
    * @param {string} ngModel Assignable angular expression to data-bind to.
    * @param {string=} name Property name of the form under which the control is published.
    * @param {string=} min Sets the `min` validation error key if the value entered is less than `min`.
    *   This must be a valid ISO week format (yyyy-W##). You can also use interpolation inside this
    *   attribute (e.g. `min="{{minWeek | date:'yyyy-Www'}}"`). Note that `min` will also add
    *   native HTML5 constraint validation.
    * @param {string=} max Sets the `max` validation error key if the value entered is greater than `max`.
    *   This must be a valid ISO week format (yyyy-W##). You can also use interpolation inside this
    *   attribute (e.g. `max="{{maxWeek | date:'yyyy-Www'}}"`). Note that `max` will also add
    *   native HTML5 constraint validation.
    * @param {(date|string)=} ngMin Sets the `min` validation constraint to the Date / ISO week string
    *   the `ngMin` expression evaluates to. Note that it does not set the `min` attribute.
    * @param {(date|string)=} ngMax Sets the `max` validation constraint to the Date / ISO week string
    *   the `ngMax` expression evaluates to. Note that it does not set the `max` attribute.
    * @param {string=} required Sets `required` validation error key if the value is not entered.
    * @param {string=} ngRequired Adds `required` attribute and `required` validation constraint to
    *    the element when the ngRequired expression evaluates to true. Use `ngRequired` instead of
    *    `required` when you want to data-bind to the `required` attribute.
    * @param {string=} ngChange Angular expression to be executed when input changes due to user
    *    interaction with the input element.
    *
    * @example
    <example name="week-input-directive" module="weekExample">
    <file name="index.html">
      <script>
      angular.module('weekExample', [])
        .controller('DateController', ['$scope', function($scope) {
          $scope.example = {
            value: new Date(2013, 0, 3)
          };
        }]);
      </script>
      <form name="myForm" ng-controller="DateController as dateCtrl">
        <label>Pick a date between in 2013:
          <input id="exampleInput" type="week" name="input" ng-model="example.value"
                 placeholder="YYYY-W##" min="2012-W32"
                 max="2013-W52" required />
        </label>
        <div role="alert">
          <span class="error" ng-show="myForm.input.$error.required">
              Required!</span>
          <span class="error" ng-show="myForm.input.$error.week">
              Not a valid date!</span>
        </div>
        <tt>value = {{example.value | date: "yyyy-Www"}}</tt><br/>
        <tt>myForm.input.$valid = {{myForm.input.$valid}}</tt><br/>
        <tt>myForm.input.$error = {{myForm.input.$error}}</tt><br/>
        <tt>myForm.$valid = {{myForm.$valid}}</tt><br/>
        <tt>myForm.$error.required = {{!!myForm.$error.required}}</tt><br/>
      </form>
    </file>
    <file name="protractor.js" type="protractor">
      var value = element(by.binding('example.value | date: "yyyy-Www"'));
      var valid = element(by.binding('myForm.input.$valid'));

      // currently protractor/webdriver does not support
      // sending keys to all known HTML5 input controls
      // for various browsers (https://github.com/angular/protractor/issues/562).
      function setInput(val) {
        // set the value of the element and force validation.
        var scr = "var ipt = document.getElementById('exampleInput'); " +
        "ipt.value = '" + val + "';" +
        "angular.element(ipt).scope().$apply(function(s) { s.myForm[ipt.name].$setViewValue('" + val + "'); });";
        browser.executeScript(scr);
      }

      it('should initialize to model', function() {
        expect(value.getText()).toContain('2013-W01');
        expect(valid.getText()).toContain('myForm.input.$valid = true');
      });

      it('should be invalid if empty', function() {
        setInput('');
        expect(value.getText()).toEqual('value =');
        expect(valid.getText()).toContain('myForm.input.$valid = false');
      });

      it('should be invalid if over max', function() {
        setInput('2015-W01');
        expect(value.getText()).toContain('');
        expect(valid.getText()).toContain('myForm.input.$valid = false');
      });
    </file>
    </example>
    */
week:createDateInputType("week",WEEK_REGEXP,weekParser,"yyyy-Www"),/**
   * @ngdoc input
   * @name input[month]
   *
   * @description
   * Input with month validation and transformation. In browsers that do not yet support
   * the HTML5 month input, a text element will be used. In that case, the text must be entered in a valid ISO-8601
   * month format (yyyy-MM), for example: `2009-01`.
   *
   * The model must always be a Date object, otherwise Angular will throw an error.
   * Invalid `Date` objects (dates whose `getTime()` is `NaN`) will be rendered as an empty string.
   * If the model is not set to the first of the month, the next view to model update will set it
   * to the first of the month.
   *
   * The timezone to be used to read/write the `Date` instance in the model can be defined using
   * {@link ng.directive:ngModelOptions ngModelOptions}. By default, this is the timezone of the browser.
   *
   * @param {string} ngModel Assignable angular expression to data-bind to.
   * @param {string=} name Property name of the form under which the control is published.
   * @param {string=} min Sets the `min` validation error key if the value entered is less than `min`.
   *   This must be a valid ISO month format (yyyy-MM). You can also use interpolation inside this
   *   attribute (e.g. `min="{{minMonth | date:'yyyy-MM'}}"`). Note that `min` will also add
   *   native HTML5 constraint validation.
   * @param {string=} max Sets the `max` validation error key if the value entered is greater than `max`.
   *   This must be a valid ISO month format (yyyy-MM). You can also use interpolation inside this
   *   attribute (e.g. `max="{{maxMonth | date:'yyyy-MM'}}"`). Note that `max` will also add
   *   native HTML5 constraint validation.
   * @param {(date|string)=} ngMin Sets the `min` validation constraint to the Date / ISO week string
   *   the `ngMin` expression evaluates to. Note that it does not set the `min` attribute.
   * @param {(date|string)=} ngMax Sets the `max` validation constraint to the Date / ISO week string
   *   the `ngMax` expression evaluates to. Note that it does not set the `max` attribute.

   * @param {string=} required Sets `required` validation error key if the value is not entered.
   * @param {string=} ngRequired Adds `required` attribute and `required` validation constraint to
   *    the element when the ngRequired expression evaluates to true. Use `ngRequired` instead of
   *    `required` when you want to data-bind to the `required` attribute.
   * @param {string=} ngChange Angular expression to be executed when input changes due to user
   *    interaction with the input element.
   *
   * @example
   <example name="month-input-directive" module="monthExample">
   <file name="index.html">
     <script>
      angular.module('monthExample', [])
        .controller('DateController', ['$scope', function($scope) {
          $scope.example = {
            value: new Date(2013, 9, 1)
          };
        }]);
     </script>
     <form name="myForm" ng-controller="DateController as dateCtrl">
       <label for="exampleInput">Pick a month in 2013:</label>
       <input id="exampleInput" type="month" name="input" ng-model="example.value"
          placeholder="yyyy-MM" min="2013-01" max="2013-12" required />
       <div role="alert">
         <span class="error" ng-show="myForm.input.$error.required">
            Required!</span>
         <span class="error" ng-show="myForm.input.$error.month">
            Not a valid month!</span>
       </div>
       <tt>value = {{example.value | date: "yyyy-MM"}}</tt><br/>
       <tt>myForm.input.$valid = {{myForm.input.$valid}}</tt><br/>
       <tt>myForm.input.$error = {{myForm.input.$error}}</tt><br/>
       <tt>myForm.$valid = {{myForm.$valid}}</tt><br/>
       <tt>myForm.$error.required = {{!!myForm.$error.required}}</tt><br/>
     </form>
   </file>
   <file name="protractor.js" type="protractor">
      var value = element(by.binding('example.value | date: "yyyy-MM"'));
      var valid = element(by.binding('myForm.input.$valid'));

      // currently protractor/webdriver does not support
      // sending keys to all known HTML5 input controls
      // for various browsers (https://github.com/angular/protractor/issues/562).
      function setInput(val) {
        // set the value of the element and force validation.
        var scr = "var ipt = document.getElementById('exampleInput'); " +
        "ipt.value = '" + val + "';" +
        "angular.element(ipt).scope().$apply(function(s) { s.myForm[ipt.name].$setViewValue('" + val + "'); });";
        browser.executeScript(scr);
      }

      it('should initialize to model', function() {
        expect(value.getText()).toContain('2013-10');
        expect(valid.getText()).toContain('myForm.input.$valid = true');
      });

      it('should be invalid if empty', function() {
        setInput('');
        expect(value.getText()).toEqual('value =');
        expect(valid.getText()).toContain('myForm.input.$valid = false');
      });

      it('should be invalid if over max', function() {
        setInput('2015-01');
        expect(value.getText()).toContain('');
        expect(valid.getText()).toContain('myForm.input.$valid = false');
      });
   </file>
   </example>
   */
month:createDateInputType("month",MONTH_REGEXP,createDateParser(MONTH_REGEXP,["yyyy","MM"]),"yyyy-MM"),/**
   * @ngdoc input
   * @name input[number]
   *
   * @description
   * Text input with number validation and transformation. Sets the `number` validation
   * error if not a valid number.
   *
   * <div class="alert alert-warning">
   * The model must always be of type `number` otherwise Angular will throw an error.
   * Be aware that a string containing a number is not enough. See the {@link ngModel:numfmt}
   * error docs for more information and an example of how to convert your model if necessary.
   * </div>
   *
   * ## Issues with HTML5 constraint validation
   *
   * In browsers that follow the
   * [HTML5 specification](https://html.spec.whatwg.org/multipage/forms.html#number-state-%28type=number%29),
   * `input[number]` does not work as expected with {@link ngModelOptions `ngModelOptions.allowInvalid`}.
   * If a non-number is entered in the input, the browser will report the value as an empty string,
   * which means the view / model values in `ngModel` and subsequently the scope value
   * will also be an empty string.
   *
   *
   * @param {string} ngModel Assignable angular expression to data-bind to.
   * @param {string=} name Property name of the form under which the control is published.
   * @param {string=} min Sets the `min` validation error key if the value entered is less than `min`.
   *    Can be interpolated.
   * @param {string=} max Sets the `max` validation error key if the value entered is greater than `max`.
   *    Can be interpolated.
   * @param {string=} ngMin Like `min`, sets the `min` validation error key if the value entered is less than `ngMin`,
   *    but does not trigger HTML5 native validation. Takes an expression.
   * @param {string=} ngMax Like `max`, sets the `max` validation error key if the value entered is greater than `ngMax`,
   *    but does not trigger HTML5 native validation. Takes an expression.
   * @param {string=} step Sets the `step` validation error key if the value entered does not fit the `step` constraint.
   *    Can be interpolated.
   * @param {string=} ngStep Like `step`, sets the `step` validation error key if the value entered does not fit the `ngStep` constraint,
   *    but does not trigger HTML5 native validation. Takes an expression.
   * @param {string=} required Sets `required` validation error key if the value is not entered.
   * @param {string=} ngRequired Adds `required` attribute and `required` validation constraint to
   *    the element when the ngRequired expression evaluates to true. Use `ngRequired` instead of
   *    `required` when you want to data-bind to the `required` attribute.
   * @param {number=} ngMinlength Sets `minlength` validation error key if the value is shorter than
   *    minlength.
   * @param {number=} ngMaxlength Sets `maxlength` validation error key if the value is longer than
   *    maxlength. Setting the attribute to a negative or non-numeric value, allows view values of
   *    any length.
   * @param {string=} pattern Similar to `ngPattern` except that the attribute value is the actual string
   *    that contains the regular expression body that will be converted to a regular expression
   *    as in the ngPattern directive.
   * @param {string=} ngPattern Sets `pattern` validation error key if the ngModel {@link ngModel.NgModelController#$viewValue $viewValue}
   *    does not match a RegExp found by evaluating the Angular expression given in the attribute value.
   *    If the expression evaluates to a RegExp object, then this is used directly.
   *    If the expression evaluates to a string, then it will be converted to a RegExp
   *    after wrapping it in `^` and `$` characters. For instance, `"abc"` will be converted to
   *    `new RegExp('^abc$')`.<br />
   *    **Note:** Avoid using the `g` flag on the RegExp, as it will cause each successive search to
   *    start at the index of the last search's match, thus not taking the whole input value into
   *    account.
   * @param {string=} ngChange Angular expression to be executed when input changes due to user
   *    interaction with the input element.
   *
   * @example
      <example name="number-input-directive" module="numberExample">
        <file name="index.html">
         <script>
           angular.module('numberExample', [])
             .controller('ExampleController', ['$scope', function($scope) {
               $scope.example = {
                 value: 12
               };
             }]);
         </script>
         <form name="myForm" ng-controller="ExampleController">
           <label>Number:
             <input type="number" name="input" ng-model="example.value"
                    min="0" max="99" required>
          </label>
           <div role="alert">
             <span class="error" ng-show="myForm.input.$error.required">
               Required!</span>
             <span class="error" ng-show="myForm.input.$error.number">
               Not valid number!</span>
           </div>
           <tt>value = {{example.value}}</tt><br/>
           <tt>myForm.input.$valid = {{myForm.input.$valid}}</tt><br/>
           <tt>myForm.input.$error = {{myForm.input.$error}}</tt><br/>
           <tt>myForm.$valid = {{myForm.$valid}}</tt><br/>
           <tt>myForm.$error.required = {{!!myForm.$error.required}}</tt><br/>
          </form>
        </file>
        <file name="protractor.js" type="protractor">
          var value = element(by.binding('example.value'));
          var valid = element(by.binding('myForm.input.$valid'));
          var input = element(by.model('example.value'));

          it('should initialize to model', function() {
            expect(value.getText()).toContain('12');
            expect(valid.getText()).toContain('true');
          });

          it('should be invalid if empty', function() {
            input.clear();
            input.sendKeys('');
            expect(value.getText()).toEqual('value =');
            expect(valid.getText()).toContain('false');
          });

          it('should be invalid if over max', function() {
            input.clear();
            input.sendKeys('123');
            expect(value.getText()).toEqual('value =');
            expect(valid.getText()).toContain('false');
          });
        </file>
      </example>
   */
number:numberInputType,/**
   * @ngdoc input
   * @name input[url]
   *
   * @description
   * Text input with URL validation. Sets the `url` validation error key if the content is not a
   * valid URL.
   *
   * <div class="alert alert-warning">
   * **Note:** `input[url]` uses a regex to validate urls that is derived from the regex
   * used in Chromium. If you need stricter validation, you can use `ng-pattern` or modify
   * the built-in validators (see the {@link guide/forms Forms guide})
   * </div>
   *
   * @param {string} ngModel Assignable angular expression to data-bind to.
   * @param {string=} name Property name of the form under which the control is published.
   * @param {string=} required Sets `required` validation error key if the value is not entered.
   * @param {string=} ngRequired Adds `required` attribute and `required` validation constraint to
   *    the element when the ngRequired expression evaluates to true. Use `ngRequired` instead of
   *    `required` when you want to data-bind to the `required` attribute.
   * @param {number=} ngMinlength Sets `minlength` validation error key if the value is shorter than
   *    minlength.
   * @param {number=} ngMaxlength Sets `maxlength` validation error key if the value is longer than
   *    maxlength. Setting the attribute to a negative or non-numeric value, allows view values of
   *    any length.
   * @param {string=} pattern Similar to `ngPattern` except that the attribute value is the actual string
   *    that contains the regular expression body that will be converted to a regular expression
   *    as in the ngPattern directive.
   * @param {string=} ngPattern Sets `pattern` validation error key if the ngModel {@link ngModel.NgModelController#$viewValue $viewValue}
   *    does not match a RegExp found by evaluating the Angular expression given in the attribute value.
   *    If the expression evaluates to a RegExp object, then this is used directly.
   *    If the expression evaluates to a string, then it will be converted to a RegExp
   *    after wrapping it in `^` and `$` characters. For instance, `"abc"` will be converted to
   *    `new RegExp('^abc$')`.<br />
   *    **Note:** Avoid using the `g` flag on the RegExp, as it will cause each successive search to
   *    start at the index of the last search's match, thus not taking the whole input value into
   *    account.
   * @param {string=} ngChange Angular expression to be executed when input changes due to user
   *    interaction with the input element.
   *
   * @example
      <example name="url-input-directive" module="urlExample">
        <file name="index.html">
         <script>
           angular.module('urlExample', [])
             .controller('ExampleController', ['$scope', function($scope) {
               $scope.url = {
                 text: 'http://google.com'
               };
             }]);
         </script>
         <form name="myForm" ng-controller="ExampleController">
           <label>URL:
             <input type="url" name="input" ng-model="url.text" required>
           <label>
           <div role="alert">
             <span class="error" ng-show="myForm.input.$error.required">
               Required!</span>
             <span class="error" ng-show="myForm.input.$error.url">
               Not valid url!</span>
           </div>
           <tt>text = {{url.text}}</tt><br/>
           <tt>myForm.input.$valid = {{myForm.input.$valid}}</tt><br/>
           <tt>myForm.input.$error = {{myForm.input.$error}}</tt><br/>
           <tt>myForm.$valid = {{myForm.$valid}}</tt><br/>
           <tt>myForm.$error.required = {{!!myForm.$error.required}}</tt><br/>
           <tt>myForm.$error.url = {{!!myForm.$error.url}}</tt><br/>
          </form>
        </file>
        <file name="protractor.js" type="protractor">
          var text = element(by.binding('url.text'));
          var valid = element(by.binding('myForm.input.$valid'));
          var input = element(by.model('url.text'));

          it('should initialize to model', function() {
            expect(text.getText()).toContain('http://google.com');
            expect(valid.getText()).toContain('true');
          });

          it('should be invalid if empty', function() {
            input.clear();
            input.sendKeys('');

            expect(text.getText()).toEqual('text =');
            expect(valid.getText()).toContain('false');
          });

          it('should be invalid if not url', function() {
            input.clear();
            input.sendKeys('box');

            expect(valid.getText()).toContain('false');
          });
        </file>
      </example>
   */
url:urlInputType,/**
   * @ngdoc input
   * @name input[email]
   *
   * @description
   * Text input with email validation. Sets the `email` validation error key if not a valid email
   * address.
   *
   * <div class="alert alert-warning">
   * **Note:** `input[email]` uses a regex to validate email addresses that is derived from the regex
   * used in Chromium. If you need stricter validation (e.g. requiring a top-level domain), you can
   * use `ng-pattern` or modify the built-in validators (see the {@link guide/forms Forms guide})
   * </div>
   *
   * @param {string} ngModel Assignable angular expression to data-bind to.
   * @param {string=} name Property name of the form under which the control is published.
   * @param {string=} required Sets `required` validation error key if the value is not entered.
   * @param {string=} ngRequired Adds `required` attribute and `required` validation constraint to
   *    the element when the ngRequired expression evaluates to true. Use `ngRequired` instead of
   *    `required` when you want to data-bind to the `required` attribute.
   * @param {number=} ngMinlength Sets `minlength` validation error key if the value is shorter than
   *    minlength.
   * @param {number=} ngMaxlength Sets `maxlength` validation error key if the value is longer than
   *    maxlength. Setting the attribute to a negative or non-numeric value, allows view values of
   *    any length.
   * @param {string=} pattern Similar to `ngPattern` except that the attribute value is the actual string
   *    that contains the regular expression body that will be converted to a regular expression
   *    as in the ngPattern directive.
   * @param {string=} ngPattern Sets `pattern` validation error key if the ngModel {@link ngModel.NgModelController#$viewValue $viewValue}
   *    does not match a RegExp found by evaluating the Angular expression given in the attribute value.
   *    If the expression evaluates to a RegExp object, then this is used directly.
   *    If the expression evaluates to a string, then it will be converted to a RegExp
   *    after wrapping it in `^` and `$` characters. For instance, `"abc"` will be converted to
   *    `new RegExp('^abc$')`.<br />
   *    **Note:** Avoid using the `g` flag on the RegExp, as it will cause each successive search to
   *    start at the index of the last search's match, thus not taking the whole input value into
   *    account.
   * @param {string=} ngChange Angular expression to be executed when input changes due to user
   *    interaction with the input element.
   *
   * @example
      <example name="email-input-directive" module="emailExample">
        <file name="index.html">
         <script>
           angular.module('emailExample', [])
             .controller('ExampleController', ['$scope', function($scope) {
               $scope.email = {
                 text: 'me@example.com'
               };
             }]);
         </script>
           <form name="myForm" ng-controller="ExampleController">
             <label>Email:
               <input type="email" name="input" ng-model="email.text" required>
             </label>
             <div role="alert">
               <span class="error" ng-show="myForm.input.$error.required">
                 Required!</span>
               <span class="error" ng-show="myForm.input.$error.email">
                 Not valid email!</span>
             </div>
             <tt>text = {{email.text}}</tt><br/>
             <tt>myForm.input.$valid = {{myForm.input.$valid}}</tt><br/>
             <tt>myForm.input.$error = {{myForm.input.$error}}</tt><br/>
             <tt>myForm.$valid = {{myForm.$valid}}</tt><br/>
             <tt>myForm.$error.required = {{!!myForm.$error.required}}</tt><br/>
             <tt>myForm.$error.email = {{!!myForm.$error.email}}</tt><br/>
           </form>
         </file>
        <file name="protractor.js" type="protractor">
          var text = element(by.binding('email.text'));
          var valid = element(by.binding('myForm.input.$valid'));
          var input = element(by.model('email.text'));

          it('should initialize to model', function() {
            expect(text.getText()).toContain('me@example.com');
            expect(valid.getText()).toContain('true');
          });

          it('should be invalid if empty', function() {
            input.clear();
            input.sendKeys('');
            expect(text.getText()).toEqual('text =');
            expect(valid.getText()).toContain('false');
          });

          it('should be invalid if not email', function() {
            input.clear();
            input.sendKeys('xxx');

            expect(valid.getText()).toContain('false');
          });
        </file>
      </example>
   */
email:emailInputType,/**
   * @ngdoc input
   * @name input[radio]
   *
   * @description
   * HTML radio button.
   *
   * @param {string} ngModel Assignable angular expression to data-bind to.
   * @param {string} value The value to which the `ngModel` expression should be set when selected.
   *    Note that `value` only supports `string` values, i.e. the scope model needs to be a string,
   *    too. Use `ngValue` if you need complex models (`number`, `object`, ...).
   * @param {string=} name Property name of the form under which the control is published.
   * @param {string=} ngChange Angular expression to be executed when input changes due to user
   *    interaction with the input element.
   * @param {string} ngValue Angular expression to which `ngModel` will be be set when the radio
   *    is selected. Should be used instead of the `value` attribute if you need
   *    a non-string `ngModel` (`boolean`, `array`, ...).
   *
   * @example
      <example name="radio-input-directive" module="radioExample">
        <file name="index.html">
         <script>
           angular.module('radioExample', [])
             .controller('ExampleController', ['$scope', function($scope) {
               $scope.color = {
                 name: 'blue'
               };
               $scope.specialValue = {
                 "id": "12345",
                 "value": "green"
               };
             }]);
         </script>
         <form name="myForm" ng-controller="ExampleController">
           <label>
             <input type="radio" ng-model="color.name" value="red">
             Red
           </label><br/>
           <label>
             <input type="radio" ng-model="color.name" ng-value="specialValue">
             Green
           </label><br/>
           <label>
             <input type="radio" ng-model="color.name" value="blue">
             Blue
           </label><br/>
           <tt>color = {{color.name | json}}</tt><br/>
          </form>
          Note that `ng-value="specialValue"` sets radio item's value to be the value of `$scope.specialValue`.
        </file>
        <file name="protractor.js" type="protractor">
          it('should change state', function() {
            var inputs = element.all(by.model('color.name'));
            var color = element(by.binding('color.name'));

            expect(color.getText()).toContain('blue');

            inputs.get(0).click();
            expect(color.getText()).toContain('red');

            inputs.get(1).click();
            expect(color.getText()).toContain('green');
          });
        </file>
      </example>
   */
radio:radioInputType,/**
   * @ngdoc input
   * @name input[range]
   *
   * @description
   * Native range input with validation and transformation.
   *
   * The model for the range input must always be a `Number`.
   *
   * IE9 and other browsers that do not support the `range` type fall back
   * to a text input without any default values for `min`, `max` and `step`. Model binding,
   * validation and number parsing are nevertheless supported.
   *
   * Browsers that support range (latest Chrome, Safari, Firefox, Edge) treat `input[range]`
   * in a way that never allows the input to hold an invalid value. That means:
   * - any non-numerical value is set to `(max + min) / 2`.
   * - any numerical value that is less than the current min val, or greater than the current max val
   * is set to the min / max val respectively.
   * - additionally, the current `step` is respected, so the nearest value that satisfies a step
   * is used.
   *
   * See the [HTML Spec on input[type=range]](https://www.w3.org/TR/html5/forms.html#range-state-(type=range))
   * for more info.
   *
   * This has the following consequences for Angular:
   *
   * Since the element value should always reflect the current model value, a range input
   * will set the bound ngModel expression to the value that the browser has set for the
   * input element. For example, in the following input `<input type="range" ng-model="model.value">`,
   * if the application sets `model.value = null`, the browser will set the input to `'50'`.
   * Angular will then set the model to `50`, to prevent input and model value being out of sync.
   *
   * That means the model for range will immediately be set to `50` after `ngModel` has been
   * initialized. It also means a range input can never have the required error.
   *
   * This does not only affect changes to the model value, but also to the values of the `min`,
   * `max`, and `step` attributes. When these change in a way that will cause the browser to modify
   * the input value, Angular will also update the model value.
   *
   * Automatic value adjustment also means that a range input element can never have the `required`,
   * `min`, or `max` errors.
   *
   * However, `step` is currently only fully implemented by Firefox. Other browsers have problems
   * when the step value changes dynamically - they do not adjust the element value correctly, but
   * instead may set the `stepMismatch` error. If that's the case, the Angular will set the `step`
   * error on the input, and set the model to `undefined`.
   *
   * Note that `input[range]` is not compatible with`ngMax`, `ngMin`, and `ngStep`, because they do
   * not set the `min` and `max` attributes, which means that the browser won't automatically adjust
   * the input value based on their values, and will always assume min = 0, max = 100, and step = 1.
   *
   * @param {string}  ngModel Assignable angular expression to data-bind to.
   * @param {string=} name Property name of the form under which the control is published.
   * @param {string=} min Sets the `min` validation to ensure that the value entered is greater
   *                  than `min`. Can be interpolated.
   * @param {string=} max Sets the `max` validation to ensure that the value entered is less than `max`.
   *                  Can be interpolated.
   * @param {string=} step Sets the `step` validation to ensure that the value entered matches the `step`
   *                  Can be interpolated.
   * @param {string=} ngChange Angular expression to be executed when the ngModel value changes due
   *                  to user interaction with the input element.
   * @param {expression=} ngChecked If the expression is truthy, then the `checked` attribute will be set on the
   *                      element. **Note** : `ngChecked` should not be used alongside `ngModel`.
   *                      Checkout {@link ng.directive:ngChecked ngChecked} for usage.
   *
   * @example
      <example name="range-input-directive" module="rangeExample">
        <file name="index.html">
          <script>
            angular.module('rangeExample', [])
              .controller('ExampleController', ['$scope', function($scope) {
                $scope.value = 75;
                $scope.min = 10;
                $scope.max = 90;
              }]);
          </script>
          <form name="myForm" ng-controller="ExampleController">

            Model as range: <input type="range" name="range" ng-model="value" min="{{min}}"  max="{{max}}">
            <hr>
            Model as number: <input type="number" ng-model="value"><br>
            Min: <input type="number" ng-model="min"><br>
            Max: <input type="number" ng-model="max"><br>
            value = <code>{{value}}</code><br/>
            myForm.range.$valid = <code>{{myForm.range.$valid}}</code><br/>
            myForm.range.$error = <code>{{myForm.range.$error}}</code>
          </form>
        </file>
      </example>

   * ## Range Input with ngMin & ngMax attributes

   * @example
      <example name="range-input-directive-ng" module="rangeExample">
        <file name="index.html">
          <script>
            angular.module('rangeExample', [])
              .controller('ExampleController', ['$scope', function($scope) {
                $scope.value = 75;
                $scope.min = 10;
                $scope.max = 90;
              }]);
          </script>
          <form name="myForm" ng-controller="ExampleController">
            Model as range: <input type="range" name="range" ng-model="value" ng-min="min" ng-max="max">
            <hr>
            Model as number: <input type="number" ng-model="value"><br>
            Min: <input type="number" ng-model="min"><br>
            Max: <input type="number" ng-model="max"><br>
            value = <code>{{value}}</code><br/>
            myForm.range.$valid = <code>{{myForm.range.$valid}}</code><br/>
            myForm.range.$error = <code>{{myForm.range.$error}}</code>
          </form>
        </file>
      </example>

   */
range:rangeInputType,/**
   * @ngdoc input
   * @name input[checkbox]
   *
   * @description
   * HTML checkbox.
   *
   * @param {string} ngModel Assignable angular expression to data-bind to.
   * @param {string=} name Property name of the form under which the control is published.
   * @param {expression=} ngTrueValue The value to which the expression should be set when selected.
   * @param {expression=} ngFalseValue The value to which the expression should be set when not selected.
   * @param {string=} ngChange Angular expression to be executed when input changes due to user
   *    interaction with the input element.
   *
   * @example
      <example name="checkbox-input-directive" module="checkboxExample">
        <file name="index.html">
         <script>
           angular.module('checkboxExample', [])
             .controller('ExampleController', ['$scope', function($scope) {
               $scope.checkboxModel = {
                value1 : true,
                value2 : 'YES'
              };
             }]);
         </script>
         <form name="myForm" ng-controller="ExampleController">
           <label>Value1:
             <input type="checkbox" ng-model="checkboxModel.value1">
           </label><br/>
           <label>Value2:
             <input type="checkbox" ng-model="checkboxModel.value2"
                    ng-true-value="'YES'" ng-false-value="'NO'">
            </label><br/>
           <tt>value1 = {{checkboxModel.value1}}</tt><br/>
           <tt>value2 = {{checkboxModel.value2}}</tt><br/>
          </form>
        </file>
        <file name="protractor.js" type="protractor">
          it('should change state', function() {
            var value1 = element(by.binding('checkboxModel.value1'));
            var value2 = element(by.binding('checkboxModel.value2'));

            expect(value1.getText()).toContain('true');
            expect(value2.getText()).toContain('YES');

            element(by.model('checkboxModel.value1')).click();
            element(by.model('checkboxModel.value2')).click();

            expect(value1.getText()).toContain('false');
            expect(value2.getText()).toContain('NO');
          });
        </file>
      </example>
   */
checkbox:checkboxInputType,hidden:noop,button:noop,submit:noop,reset:noop,file:noop},inputDirective=["$browser","$sniffer","$filter","$parse",function($browser,$sniffer,$filter,$parse){return{restrict:"E",require:["?ngModel"],link:{pre:function(scope,element,attr,ctrls){ctrls[0]&&(inputType[lowercase(attr.type)]||inputType.text)(scope,element,attr,ctrls[0],$sniffer,$browser,$filter,$parse)}}}}],CONSTANT_VALUE_REGEXP=/^(true|false|\d+)$/,ngValueDirective=function(){/**
   *  inputs use the value attribute as their default value if the value property is not set.
   *  Once the value property has been set (by adding input), it will not react to changes to
   *  the value attribute anymore. Setting both attribute and property fixes this behavior, and
   *  makes it possible to use ngValue as a sort of one-way bind.
   */
function updateElementValue(element,attr,value){
// Support: IE9 only
// In IE9 values are converted to string (e.g. `input.value = null` results in `input.value === 'null'`).
var propValue=isDefined(value)?value:9===msie?"":null;element.prop("value",propValue),attr.$set("value",value)}return{restrict:"A",priority:100,compile:function(tpl,tplAttr){return CONSTANT_VALUE_REGEXP.test(tplAttr.ngValue)?function(scope,elm,attr){var value=scope.$eval(attr.ngValue);updateElementValue(elm,attr,value)}:function(scope,elm,attr){scope.$watch(attr.ngValue,function(value){updateElementValue(elm,attr,value)})}}}},ngBindDirective=["$compile",function($compile){return{restrict:"AC",compile:function(templateElement){return $compile.$$addBindingClass(templateElement),function(scope,element,attr){$compile.$$addBindingInfo(element,attr.ngBind),element=element[0],scope.$watch(attr.ngBind,function(value){element.textContent=stringify(value)})}}}}],ngBindTemplateDirective=["$interpolate","$compile",function($interpolate,$compile){return{compile:function(templateElement){return $compile.$$addBindingClass(templateElement),function(scope,element,attr){var interpolateFn=$interpolate(element.attr(attr.$attr.ngBindTemplate));$compile.$$addBindingInfo(element,interpolateFn.expressions),element=element[0],attr.$observe("ngBindTemplate",function(value){element.textContent=isUndefined(value)?"":value})}}}}],ngBindHtmlDirective=["$sce","$parse","$compile",function($sce,$parse,$compile){return{restrict:"A",compile:function(tElement,tAttrs){var ngBindHtmlGetter=$parse(tAttrs.ngBindHtml),ngBindHtmlWatch=$parse(tAttrs.ngBindHtml,function(val){
// Unwrap the value to compare the actual inner safe value, not the wrapper object.
return $sce.valueOf(val)});return $compile.$$addBindingClass(tElement),function(scope,element,attr){$compile.$$addBindingInfo(element,attr.ngBindHtml),scope.$watch(ngBindHtmlWatch,function(){
// The watched value is the unwrapped value. To avoid re-escaping, use the direct getter.
var value=ngBindHtmlGetter(scope);element.html($sce.getTrustedHtml(value)||"")})}}}}],ngChangeDirective=valueFn({restrict:"A",require:"ngModel",link:function(scope,element,attr,ctrl){ctrl.$viewChangeListeners.push(function(){scope.$eval(attr.ngChange)})}}),ngClassDirective=classDirective("",!0),ngClassOddDirective=classDirective("Odd",0),ngClassEvenDirective=classDirective("Even",1),ngCloakDirective=ngDirective({compile:function(element,attr){attr.$set("ngCloak",void 0),element.removeClass("ng-cloak")}}),ngControllerDirective=[function(){return{restrict:"A",scope:!0,controller:"@",priority:500}}],ngEventDirectives={},forceAsyncEvents={blur:!0,focus:!0};forEach("click dblclick mousedown mouseup mouseover mouseout mousemove mouseenter mouseleave keydown keyup keypress submit focus blur copy cut paste".split(" "),function(eventName){var directiveName=directiveNormalize("ng-"+eventName);ngEventDirectives[directiveName]=["$parse","$rootScope",function($parse,$rootScope){return{restrict:"A",compile:function($element,attr){
// NOTE:
// We expose the powerful `$event` object on the scope that provides access to the Window,
// etc. This is OK, because expressions are not sandboxed any more (and the expression
// sandbox was never meant to be a security feature anyway).
var fn=$parse(attr[directiveName]);return function(scope,element){element.on(eventName,function(event){var callback=function(){fn(scope,{$event:event})};forceAsyncEvents[eventName]&&$rootScope.$$phase?scope.$evalAsync(callback):scope.$apply(callback)})}}}}]});/**
 * @ngdoc directive
 * @name ngDblclick
 *
 * @description
 * The `ngDblclick` directive allows you to specify custom behavior on a dblclick event.
 *
 * @element ANY
 * @priority 0
 * @param {expression} ngDblclick {@link guide/expression Expression} to evaluate upon
 * a dblclick. (The Event object is available as `$event`)
 *
 * @example
   <example name="ng-dblclick">
     <file name="index.html">
      <button ng-dblclick="count = count + 1" ng-init="count=0">
        Increment (on double click)
      </button>
      count: {{count}}
     </file>
   </example>
 */
/**
 * @ngdoc directive
 * @name ngMousedown
 *
 * @description
 * The ngMousedown directive allows you to specify custom behavior on mousedown event.
 *
 * @element ANY
 * @priority 0
 * @param {expression} ngMousedown {@link guide/expression Expression} to evaluate upon
 * mousedown. ({@link guide/expression#-event- Event object is available as `$event`})
 *
 * @example
   <example name="ng-mousedown">
     <file name="index.html">
      <button ng-mousedown="count = count + 1" ng-init="count=0">
        Increment (on mouse down)
      </button>
      count: {{count}}
     </file>
   </example>
 */
/**
 * @ngdoc directive
 * @name ngMouseup
 *
 * @description
 * Specify custom behavior on mouseup event.
 *
 * @element ANY
 * @priority 0
 * @param {expression} ngMouseup {@link guide/expression Expression} to evaluate upon
 * mouseup. ({@link guide/expression#-event- Event object is available as `$event`})
 *
 * @example
   <example name="ng-mouseup">
     <file name="index.html">
      <button ng-mouseup="count = count + 1" ng-init="count=0">
        Increment (on mouse up)
      </button>
      count: {{count}}
     </file>
   </example>
 */
/**
 * @ngdoc directive
 * @name ngMouseover
 *
 * @description
 * Specify custom behavior on mouseover event.
 *
 * @element ANY
 * @priority 0
 * @param {expression} ngMouseover {@link guide/expression Expression} to evaluate upon
 * mouseover. ({@link guide/expression#-event- Event object is available as `$event`})
 *
 * @example
   <example name="ng-mouseover">
     <file name="index.html">
      <button ng-mouseover="count = count + 1" ng-init="count=0">
        Increment (when mouse is over)
      </button>
      count: {{count}}
     </file>
   </example>
 */
/**
 * @ngdoc directive
 * @name ngMouseenter
 *
 * @description
 * Specify custom behavior on mouseenter event.
 *
 * @element ANY
 * @priority 0
 * @param {expression} ngMouseenter {@link guide/expression Expression} to evaluate upon
 * mouseenter. ({@link guide/expression#-event- Event object is available as `$event`})
 *
 * @example
   <example name="ng-mouseenter">
     <file name="index.html">
      <button ng-mouseenter="count = count + 1" ng-init="count=0">
        Increment (when mouse enters)
      </button>
      count: {{count}}
     </file>
   </example>
 */
/**
 * @ngdoc directive
 * @name ngMouseleave
 *
 * @description
 * Specify custom behavior on mouseleave event.
 *
 * @element ANY
 * @priority 0
 * @param {expression} ngMouseleave {@link guide/expression Expression} to evaluate upon
 * mouseleave. ({@link guide/expression#-event- Event object is available as `$event`})
 *
 * @example
   <example name="ng-mouseleave">
     <file name="index.html">
      <button ng-mouseleave="count = count + 1" ng-init="count=0">
        Increment (when mouse leaves)
      </button>
      count: {{count}}
     </file>
   </example>
 */
/**
 * @ngdoc directive
 * @name ngMousemove
 *
 * @description
 * Specify custom behavior on mousemove event.
 *
 * @element ANY
 * @priority 0
 * @param {expression} ngMousemove {@link guide/expression Expression} to evaluate upon
 * mousemove. ({@link guide/expression#-event- Event object is available as `$event`})
 *
 * @example
   <example name="ng-mousemove">
     <file name="index.html">
      <button ng-mousemove="count = count + 1" ng-init="count=0">
        Increment (when mouse moves)
      </button>
      count: {{count}}
     </file>
   </example>
 */
/**
 * @ngdoc directive
 * @name ngKeydown
 *
 * @description
 * Specify custom behavior on keydown event.
 *
 * @element ANY
 * @priority 0
 * @param {expression} ngKeydown {@link guide/expression Expression} to evaluate upon
 * keydown. (Event object is available as `$event` and can be interrogated for keyCode, altKey, etc.)
 *
 * @example
   <example name="ng-keydown">
     <file name="index.html">
      <input ng-keydown="count = count + 1" ng-init="count=0">
      key down count: {{count}}
     </file>
   </example>
 */
/**
 * @ngdoc directive
 * @name ngKeyup
 *
 * @description
 * Specify custom behavior on keyup event.
 *
 * @element ANY
 * @priority 0
 * @param {expression} ngKeyup {@link guide/expression Expression} to evaluate upon
 * keyup. (Event object is available as `$event` and can be interrogated for keyCode, altKey, etc.)
 *
 * @example
   <example name="ng-keyup">
     <file name="index.html">
       <p>Typing in the input box below updates the key count</p>
       <input ng-keyup="count = count + 1" ng-init="count=0"> key up count: {{count}}

       <p>Typing in the input box below updates the keycode</p>
       <input ng-keyup="event=$event">
       <p>event keyCode: {{ event.keyCode }}</p>
       <p>event altKey: {{ event.altKey }}</p>
     </file>
   </example>
 */
/**
 * @ngdoc directive
 * @name ngKeypress
 *
 * @description
 * Specify custom behavior on keypress event.
 *
 * @element ANY
 * @param {expression} ngKeypress {@link guide/expression Expression} to evaluate upon
 * keypress. ({@link guide/expression#-event- Event object is available as `$event`}
 * and can be interrogated for keyCode, altKey, etc.)
 *
 * @example
   <example name="ng-keypress">
     <file name="index.html">
      <input ng-keypress="count = count + 1" ng-init="count=0">
      key press count: {{count}}
     </file>
   </example>
 */
/**
 * @ngdoc directive
 * @name ngSubmit
 *
 * @description
 * Enables binding angular expressions to onsubmit events.
 *
 * Additionally it prevents the default action (which for form means sending the request to the
 * server and reloading the current page), but only if the form does not contain `action`,
 * `data-action`, or `x-action` attributes.
 *
 * <div class="alert alert-warning">
 * **Warning:** Be careful not to cause "double-submission" by using both the `ngClick` and
 * `ngSubmit` handlers together. See the
 * {@link form#submitting-a-form-and-preventing-the-default-action `form` directive documentation}
 * for a detailed discussion of when `ngSubmit` may be triggered.
 * </div>
 *
 * @element form
 * @priority 0
 * @param {expression} ngSubmit {@link guide/expression Expression} to eval.
 * ({@link guide/expression#-event- Event object is available as `$event`})
 *
 * @example
   <example module="submitExample" name="ng-submit">
     <file name="index.html">
      <script>
        angular.module('submitExample', [])
          .controller('ExampleController', ['$scope', function($scope) {
            $scope.list = [];
            $scope.text = 'hello';
            $scope.submit = function() {
              if ($scope.text) {
                $scope.list.push(this.text);
                $scope.text = '';
              }
            };
          }]);
      </script>
      <form ng-submit="submit()" ng-controller="ExampleController">
        Enter text and hit enter:
        <input type="text" ng-model="text" name="text" />
        <input type="submit" id="submit" value="Submit" />
        <pre>list={{list}}</pre>
      </form>
     </file>
     <file name="protractor.js" type="protractor">
       it('should check ng-submit', function() {
         expect(element(by.binding('list')).getText()).toBe('list=[]');
         element(by.css('#submit')).click();
         expect(element(by.binding('list')).getText()).toContain('hello');
         expect(element(by.model('text')).getAttribute('value')).toBe('');
       });
       it('should ignore empty strings', function() {
         expect(element(by.binding('list')).getText()).toBe('list=[]');
         element(by.css('#submit')).click();
         element(by.css('#submit')).click();
         expect(element(by.binding('list')).getText()).toContain('hello');
        });
     </file>
   </example>
 */
/**
 * @ngdoc directive
 * @name ngFocus
 *
 * @description
 * Specify custom behavior on focus event.
 *
 * Note: As the `focus` event is executed synchronously when calling `input.focus()`
 * AngularJS executes the expression using `scope.$evalAsync` if the event is fired
 * during an `$apply` to ensure a consistent state.
 *
 * @element window, input, select, textarea, a
 * @priority 0
 * @param {expression} ngFocus {@link guide/expression Expression} to evaluate upon
 * focus. ({@link guide/expression#-event- Event object is available as `$event`})
 *
 * @example
 * See {@link ng.directive:ngClick ngClick}
 */
/**
 * @ngdoc directive
 * @name ngBlur
 *
 * @description
 * Specify custom behavior on blur event.
 *
 * A [blur event](https://developer.mozilla.org/en-US/docs/Web/Events/blur) fires when
 * an element has lost focus.
 *
 * Note: As the `blur` event is executed synchronously also during DOM manipulations
 * (e.g. removing a focussed input),
 * AngularJS executes the expression using `scope.$evalAsync` if the event is fired
 * during an `$apply` to ensure a consistent state.
 *
 * @element window, input, select, textarea, a
 * @priority 0
 * @param {expression} ngBlur {@link guide/expression Expression} to evaluate upon
 * blur. ({@link guide/expression#-event- Event object is available as `$event`})
 *
 * @example
 * See {@link ng.directive:ngClick ngClick}
 */
/**
 * @ngdoc directive
 * @name ngCopy
 *
 * @description
 * Specify custom behavior on copy event.
 *
 * @element window, input, select, textarea, a
 * @priority 0
 * @param {expression} ngCopy {@link guide/expression Expression} to evaluate upon
 * copy. ({@link guide/expression#-event- Event object is available as `$event`})
 *
 * @example
   <example name="ng-copy">
     <file name="index.html">
      <input ng-copy="copied=true" ng-init="copied=false; value='copy me'" ng-model="value">
      copied: {{copied}}
     </file>
   </example>
 */
/**
 * @ngdoc directive
 * @name ngCut
 *
 * @description
 * Specify custom behavior on cut event.
 *
 * @element window, input, select, textarea, a
 * @priority 0
 * @param {expression} ngCut {@link guide/expression Expression} to evaluate upon
 * cut. ({@link guide/expression#-event- Event object is available as `$event`})
 *
 * @example
   <example name="ng-cut">
     <file name="index.html">
      <input ng-cut="cut=true" ng-init="cut=false; value='cut me'" ng-model="value">
      cut: {{cut}}
     </file>
   </example>
 */
/**
 * @ngdoc directive
 * @name ngPaste
 *
 * @description
 * Specify custom behavior on paste event.
 *
 * @element window, input, select, textarea, a
 * @priority 0
 * @param {expression} ngPaste {@link guide/expression Expression} to evaluate upon
 * paste. ({@link guide/expression#-event- Event object is available as `$event`})
 *
 * @example
   <example name="ng-paste">
     <file name="index.html">
      <input ng-paste="paste=true" ng-init="paste=false" placeholder='paste here'>
      pasted: {{paste}}
     </file>
   </example>
 */
/**
 * @ngdoc directive
 * @name ngIf
 * @restrict A
 * @multiElement
 *
 * @description
 * The `ngIf` directive removes or recreates a portion of the DOM tree based on an
 * {expression}. If the expression assigned to `ngIf` evaluates to a false
 * value then the element is removed from the DOM, otherwise a clone of the
 * element is reinserted into the DOM.
 *
 * `ngIf` differs from `ngShow` and `ngHide` in that `ngIf` completely removes and recreates the
 * element in the DOM rather than changing its visibility via the `display` css property.  A common
 * case when this difference is significant is when using css selectors that rely on an element's
 * position within the DOM, such as the `:first-child` or `:last-child` pseudo-classes.
 *
 * Note that when an element is removed using `ngIf` its scope is destroyed and a new scope
 * is created when the element is restored.  The scope created within `ngIf` inherits from
 * its parent scope using
 * [prototypal inheritance](https://github.com/angular/angular.js/wiki/Understanding-Scopes#javascript-prototypal-inheritance).
 * An important implication of this is if `ngModel` is used within `ngIf` to bind to
 * a javascript primitive defined in the parent scope. In this case any modifications made to the
 * variable within the child scope will override (hide) the value in the parent scope.
 *
 * Also, `ngIf` recreates elements using their compiled state. An example of this behavior
 * is if an element's class attribute is directly modified after it's compiled, using something like
 * jQuery's `.addClass()` method, and the element is later removed. When `ngIf` recreates the element
 * the added class will be lost because the original compiled state is used to regenerate the element.
 *
 * Additionally, you can provide animations via the `ngAnimate` module to animate the `enter`
 * and `leave` effects.
 *
 * @animations
 * | Animation                        | Occurs                               |
 * |----------------------------------|-------------------------------------|
 * | {@link ng.$animate#enter enter}  | just after the `ngIf` contents change and a new DOM element is created and injected into the `ngIf` container |
 * | {@link ng.$animate#leave leave}  | just before the `ngIf` contents are removed from the DOM |
 *
 * @element ANY
 * @scope
 * @priority 600
 * @param {expression} ngIf If the {@link guide/expression expression} is falsy then
 *     the element is removed from the DOM tree. If it is truthy a copy of the compiled
 *     element is added to the DOM tree.
 *
 * @example
  <example module="ngAnimate" deps="angular-animate.js" animations="true" name="ng-if">
    <file name="index.html">
      <label>Click me: <input type="checkbox" ng-model="checked" ng-init="checked=true" /></label><br/>
      Show when checked:
      <span ng-if="checked" class="animate-if">
        This is removed when the checkbox is unchecked.
      </span>
    </file>
    <file name="animations.css">
      .animate-if {
        background:white;
        border:1px solid black;
        padding:10px;
      }

      .animate-if.ng-enter, .animate-if.ng-leave {
        transition:all cubic-bezier(0.250, 0.460, 0.450, 0.940) 0.5s;
      }

      .animate-if.ng-enter,
      .animate-if.ng-leave.ng-leave-active {
        opacity:0;
      }

      .animate-if.ng-leave,
      .animate-if.ng-enter.ng-enter-active {
        opacity:1;
      }
    </file>
  </example>
 */
var ngIfDirective=["$animate","$compile",function($animate,$compile){return{multiElement:!0,transclude:"element",priority:600,terminal:!0,restrict:"A",$$tlb:!0,link:function($scope,$element,$attr,ctrl,$transclude){var block,childScope,previousElements;$scope.$watch($attr.ngIf,function(value){value?childScope||$transclude(function(clone,newScope){childScope=newScope,clone[clone.length++]=$compile.$$createComment("end ngIf",$attr.ngIf),
// Note: We only need the first/last node of the cloned nodes.
// However, we need to keep the reference to the jqlite wrapper as it might be changed later
// by a directive with templateUrl when its template arrives.
block={clone:clone},$animate.enter(clone,$element.parent(),$element)}):(previousElements&&(previousElements.remove(),previousElements=null),childScope&&(childScope.$destroy(),childScope=null),block&&(previousElements=getBlockNodes(block.clone),$animate.leave(previousElements).done(function(response){response!==!1&&(previousElements=null)}),block=null))})}}}],ngIncludeDirective=["$templateRequest","$anchorScroll","$animate",function($templateRequest,$anchorScroll,$animate){return{restrict:"ECA",priority:400,terminal:!0,transclude:"element",controller:angular.noop,compile:function(element,attr){var srcExp=attr.ngInclude||attr.src,onloadExp=attr.onload||"",autoScrollExp=attr.autoscroll;return function(scope,$element,$attr,ctrl,$transclude){var currentScope,previousElement,currentElement,changeCounter=0,cleanupLastIncludeContent=function(){previousElement&&(previousElement.remove(),previousElement=null),currentScope&&(currentScope.$destroy(),currentScope=null),currentElement&&($animate.leave(currentElement).done(function(response){response!==!1&&(previousElement=null)}),previousElement=currentElement,currentElement=null)};scope.$watch(srcExp,function(src){var afterAnimation=function(response){response===!1||!isDefined(autoScrollExp)||autoScrollExp&&!scope.$eval(autoScrollExp)||$anchorScroll()},thisChangeId=++changeCounter;src?(
//set the 2nd param to true to ignore the template request error so that the inner
//contents and scope can be cleaned up.
$templateRequest(src,!0).then(function(response){if(!scope.$$destroyed&&thisChangeId===changeCounter){var newScope=scope.$new();ctrl.template=response;
// Note: This will also link all children of ng-include that were contained in the original
// html. If that content contains controllers, ... they could pollute/change the scope.
// However, using ng-include on an element with additional content does not make sense...
// Note: We can't remove them in the cloneAttchFn of $transclude as that
// function is called before linking the content, which would apply child
// directives to non existing elements.
var clone=$transclude(newScope,function(clone){cleanupLastIncludeContent(),$animate.enter(clone,null,$element).done(afterAnimation)});currentScope=newScope,currentElement=clone,currentScope.$emit("$includeContentLoaded",src),scope.$eval(onloadExp)}},function(){scope.$$destroyed||thisChangeId===changeCounter&&(cleanupLastIncludeContent(),scope.$emit("$includeContentError",src))}),scope.$emit("$includeContentRequested",src)):(cleanupLastIncludeContent(),ctrl.template=null)})}}}}],ngIncludeFillContentDirective=["$compile",function($compile){return{restrict:"ECA",priority:-400,require:"ngInclude",link:function(scope,$element,$attr,ctrl){
// WebKit: https://bugs.webkit.org/show_bug.cgi?id=135698 --- SVG elements do not
// support innerHTML, so detect this here and try to generate the contents
// specially.
return toString.call($element[0]).match(/SVG/)?($element.empty(),void $compile(jqLiteBuildFragment(ctrl.template,window.document).childNodes)(scope,function(clone){$element.append(clone)},{futureParentElement:$element})):($element.html(ctrl.template),void $compile($element.contents())(scope))}}}],ngInitDirective=ngDirective({priority:450,compile:function(){return{pre:function(scope,element,attrs){scope.$eval(attrs.ngInit)}}}}),ngListDirective=function(){return{restrict:"A",priority:100,require:"ngModel",link:function(scope,element,attr,ctrl){var ngList=attr.ngList||", ",trimValues="false"!==attr.ngTrim,separator=trimValues?trim(ngList):ngList,parse=function(viewValue){
// If the viewValue is invalid (say required but empty) it will be `undefined`
if(!isUndefined(viewValue)){var list=[];return viewValue&&forEach(viewValue.split(separator),function(value){value&&list.push(trimValues?trim(value):value)}),list}};ctrl.$parsers.push(parse),ctrl.$formatters.push(function(value){if(isArray(value))return value.join(ngList)}),
// Override the standard $isEmpty because an empty array means the input is empty.
ctrl.$isEmpty=function(value){return!value||!value.length}}}},VALID_CLASS="ng-valid",INVALID_CLASS="ng-invalid",PRISTINE_CLASS="ng-pristine",DIRTY_CLASS="ng-dirty",UNTOUCHED_CLASS="ng-untouched",TOUCHED_CLASS="ng-touched",EMPTY_CLASS="ng-empty",NOT_EMPTY_CLASS="ng-not-empty",ngModelMinErr=minErr("ngModel");/**
 * @ngdoc type
 * @name ngModel.NgModelController
 *
 * @property {*} $viewValue The actual value from the control's view. For `input` elements, this is a
 * String. See {@link ngModel.NgModelController#$setViewValue} for information about when the $viewValue
 * is set.
 *
 * @property {*} $modelValue The value in the model that the control is bound to.
 *
 * @property {Array.<Function>} $parsers Array of functions to execute, as a pipeline, whenever
 *  the control updates the ngModelController with a new {@link ngModel.NgModelController#$viewValue
    `$viewValue`} from the DOM, usually via user input.
    See {@link ngModel.NgModelController#$setViewValue `$setViewValue()`} for a detailed lifecycle explanation.
    Note that the `$parsers` are not called when the bound ngModel expression changes programmatically.

  The functions are called in array order, each passing
    its return value through to the next. The last return value is forwarded to the
    {@link ngModel.NgModelController#$validators `$validators`} collection.

  Parsers are used to sanitize / convert the {@link ngModel.NgModelController#$viewValue
    `$viewValue`}.

  Returning `undefined` from a parser means a parse error occurred. In that case,
    no {@link ngModel.NgModelController#$validators `$validators`} will run and the `ngModel`
    will be set to `undefined` unless {@link ngModelOptions `ngModelOptions.allowInvalid`}
    is set to `true`. The parse error is stored in `ngModel.$error.parse`.

  This simple example shows a parser that would convert text input value to lowercase:
 * ```js
 * function parse(value) {
 *   if (value) {
 *     return value.toLowerCase();
 *   }
 * }
 * ngModelController.$parsers.push(parse);
 * ```

 *
 * @property {Array.<Function>} $formatters Array of functions to execute, as a pipeline, whenever
    the bound ngModel expression changes programmatically. The `$formatters` are not called when the
    value of the control is changed by user interaction.

  Formatters are used to format / convert the {@link ngModel.NgModelController#$modelValue
    `$modelValue`} for display in the control.

  The functions are called in reverse array order, each passing the value through to the
    next. The last return value is used as the actual DOM value.

  This simple example shows a formatter that would convert the model value to uppercase:

 * ```js
 * function format(value) {
 *   if (value) {
 *     return value.toUpperCase();
 *   }
 * }
 * ngModel.$formatters.push(format);
 * ```
 *
 * @property {Object.<string, function>} $validators A collection of validators that are applied
 *      whenever the model value changes. The key value within the object refers to the name of the
 *      validator while the function refers to the validation operation. The validation operation is
 *      provided with the model value as an argument and must return a true or false value depending
 *      on the response of that validation.
 *
 * ```js
 * ngModel.$validators.validCharacters = function(modelValue, viewValue) {
 *   var value = modelValue || viewValue;
 *   return /[0-9]+/.test(value) &&
 *          /[a-z]+/.test(value) &&
 *          /[A-Z]+/.test(value) &&
 *          /\W+/.test(value);
 * };
 * ```
 *
 * @property {Object.<string, function>} $asyncValidators A collection of validations that are expected to
 *      perform an asynchronous validation (e.g. a HTTP request). The validation function that is provided
 *      is expected to return a promise when it is run during the model validation process. Once the promise
 *      is delivered then the validation status will be set to true when fulfilled and false when rejected.
 *      When the asynchronous validators are triggered, each of the validators will run in parallel and the model
 *      value will only be updated once all validators have been fulfilled. As long as an asynchronous validator
 *      is unfulfilled, its key will be added to the controllers `$pending` property. Also, all asynchronous validators
 *      will only run once all synchronous validators have passed.
 *
 * Please note that if $http is used then it is important that the server returns a success HTTP response code
 * in order to fulfill the validation and a status level of `4xx` in order to reject the validation.
 *
 * ```js
 * ngModel.$asyncValidators.uniqueUsername = function(modelValue, viewValue) {
 *   var value = modelValue || viewValue;
 *
 *   // Lookup user by username
 *   return $http.get('/api/users/' + value).
 *      then(function resolved() {
 *        //username exists, this means validation fails
 *        return $q.reject('exists');
 *      }, function rejected() {
 *        //username does not exist, therefore this validation passes
 *        return true;
 *      });
 * };
 * ```
 *
 * @property {Array.<Function>} $viewChangeListeners Array of functions to execute whenever the
 *     view value has changed. It is called with no arguments, and its return value is ignored.
 *     This can be used in place of additional $watches against the model value.
 *
 * @property {Object} $error An object hash with all failing validator ids as keys.
 * @property {Object} $pending An object hash with all pending validator ids as keys.
 *
 * @property {boolean} $untouched True if control has not lost focus yet.
 * @property {boolean} $touched True if control has lost focus.
 * @property {boolean} $pristine True if user has not interacted with the control yet.
 * @property {boolean} $dirty True if user has already interacted with the control.
 * @property {boolean} $valid True if there is no error.
 * @property {boolean} $invalid True if at least one error on the control.
 * @property {string} $name The name attribute of the control.
 *
 * @description
 *
 * `NgModelController` provides API for the {@link ngModel `ngModel`} directive.
 * The controller contains services for data-binding, validation, CSS updates, and value formatting
 * and parsing. It purposefully does not contain any logic which deals with DOM rendering or
 * listening to DOM events.
 * Such DOM related logic should be provided by other directives which make use of
 * `NgModelController` for data-binding to control elements.
 * Angular provides this DOM logic for most {@link input `input`} elements.
 * At the end of this page you can find a {@link ngModel.NgModelController#custom-control-example
 * custom control example} that uses `ngModelController` to bind to `contenteditable` elements.
 *
 * @example
 * ### Custom Control Example
 * This example shows how to use `NgModelController` with a custom control to achieve
 * data-binding. Notice how different directives (`contenteditable`, `ng-model`, and `required`)
 * collaborate together to achieve the desired result.
 *
 * `contenteditable` is an HTML5 attribute, which tells the browser to let the element
 * contents be edited in place by the user.
 *
 * We are using the {@link ng.service:$sce $sce} service here and include the {@link ngSanitize $sanitize}
 * module to automatically remove "bad" content like inline event listener (e.g. `<span onclick="...">`).
 * However, as we are using `$sce` the model can still decide to provide unsafe content if it marks
 * that content using the `$sce` service.
 *
 * <example name="NgModelController" module="customControl" deps="angular-sanitize.js">
    <file name="style.css">
      [contenteditable] {
        border: 1px solid black;
        background-color: white;
        min-height: 20px;
      }

      .ng-invalid {
        border: 1px solid red;
      }

    </file>
    <file name="script.js">
      angular.module('customControl', ['ngSanitize']).
        directive('contenteditable', ['$sce', function($sce) {
          return {
            restrict: 'A', // only activate on element attribute
            require: '?ngModel', // get a hold of NgModelController
            link: function(scope, element, attrs, ngModel) {
              if (!ngModel) return; // do nothing if no ng-model

              // Specify how UI should be updated
              ngModel.$render = function() {
                element.html($sce.getTrustedHtml(ngModel.$viewValue || ''));
              };

              // Listen for change events to enable binding
              element.on('blur keyup change', function() {
                scope.$evalAsync(read);
              });
              read(); // initialize

              // Write data to the model
              function read() {
                var html = element.html();
                // When we clear the content editable the browser leaves a <br> behind
                // If strip-br attribute is provided then we strip this out
                if (attrs.stripBr && html === '<br>') {
                  html = '';
                }
                ngModel.$setViewValue(html);
              }
            }
          };
        }]);
    </file>
    <file name="index.html">
      <form name="myForm">
       <div contenteditable
            name="myWidget" ng-model="userContent"
            strip-br="true"
            required>Change me!</div>
        <span ng-show="myForm.myWidget.$error.required">Required!</span>
       <hr>
       <textarea ng-model="userContent" aria-label="Dynamic textarea"></textarea>
      </form>
    </file>
    <file name="protractor.js" type="protractor">
    it('should data-bind and become invalid', function() {
      if (browser.params.browser === 'safari' || browser.params.browser === 'firefox') {
        // SafariDriver can't handle contenteditable
        // and Firefox driver can't clear contenteditables very well
        return;
      }
      var contentEditable = element(by.css('[contenteditable]'));
      var content = 'Change me!';

      expect(contentEditable.getText()).toEqual(content);

      contentEditable.clear();
      contentEditable.sendKeys(protractor.Key.BACK_SPACE);
      expect(contentEditable.getText()).toEqual('');
      expect(contentEditable.getAttribute('class')).toMatch(/ng-invalid-required/);
    });
    </file>
 * </example>
 *
 *
 */
NgModelController.$inject=["$scope","$exceptionHandler","$attrs","$element","$parse","$animate","$timeout","$q","$interpolate"],NgModelController.prototype={$$initGetterSetters:function(){if(this.$options.getOption("getterSetter")){var invokeModelGetter=this.$$parse(this.$$attr.ngModel+"()"),invokeModelSetter=this.$$parse(this.$$attr.ngModel+"($$$p)");this.$$ngModelGet=function($scope){var modelValue=this.$$parsedNgModel($scope);return isFunction(modelValue)&&(modelValue=invokeModelGetter($scope)),modelValue},this.$$ngModelSet=function($scope,newValue){isFunction(this.$$parsedNgModel($scope))?invokeModelSetter($scope,{$$$p:newValue}):this.$$parsedNgModelAssign($scope,newValue)}}else if(!this.$$parsedNgModel.assign)throw ngModelMinErr("nonassign","Expression '{0}' is non-assignable. Element: {1}",this.$$attr.ngModel,startingTag(this.$$element))},/**
   * @ngdoc method
   * @name ngModel.NgModelController#$render
   *
   * @description
   * Called when the view needs to be updated. It is expected that the user of the ng-model
   * directive will implement this method.
   *
   * The `$render()` method is invoked in the following situations:
   *
   * * `$rollbackViewValue()` is called.  If we are rolling back the view value to the last
   *   committed value then `$render()` is called to update the input control.
   * * The value referenced by `ng-model` is changed programmatically and both the `$modelValue` and
   *   the `$viewValue` are different from last time.
   *
   * Since `ng-model` does not do a deep watch, `$render()` is only invoked if the values of
   * `$modelValue` and `$viewValue` are actually different from their previous values. If `$modelValue`
   * or `$viewValue` are objects (rather than a string or number) then `$render()` will not be
   * invoked if you only change a property on the objects.
   */
$render:noop,/**
   * @ngdoc method
   * @name ngModel.NgModelController#$isEmpty
   *
   * @description
   * This is called when we need to determine if the value of an input is empty.
   *
   * For instance, the required directive does this to work out if the input has data or not.
   *
   * The default `$isEmpty` function checks whether the value is `undefined`, `''`, `null` or `NaN`.
   *
   * You can override this for input directives whose concept of being empty is different from the
   * default. The `checkboxInputType` directive does this because in its case a value of `false`
   * implies empty.
   *
   * @param {*} value The value of the input to check for emptiness.
   * @returns {boolean} True if `value` is "empty".
   */
$isEmpty:function(value){
// eslint-disable-next-line no-self-compare
return isUndefined(value)||""===value||null===value||value!==value},$$updateEmptyClasses:function(value){this.$isEmpty(value)?(this.$$animate.removeClass(this.$$element,NOT_EMPTY_CLASS),this.$$animate.addClass(this.$$element,EMPTY_CLASS)):(this.$$animate.removeClass(this.$$element,EMPTY_CLASS),this.$$animate.addClass(this.$$element,NOT_EMPTY_CLASS))},/**
   * @ngdoc method
   * @name ngModel.NgModelController#$setPristine
   *
   * @description
   * Sets the control to its pristine state.
   *
   * This method can be called to remove the `ng-dirty` class and set the control to its pristine
   * state (`ng-pristine` class). A model is considered to be pristine when the control
   * has not been changed from when first compiled.
   */
$setPristine:function(){this.$dirty=!1,this.$pristine=!0,this.$$animate.removeClass(this.$$element,DIRTY_CLASS),this.$$animate.addClass(this.$$element,PRISTINE_CLASS)},/**
   * @ngdoc method
   * @name ngModel.NgModelController#$setDirty
   *
   * @description
   * Sets the control to its dirty state.
   *
   * This method can be called to remove the `ng-pristine` class and set the control to its dirty
   * state (`ng-dirty` class). A model is considered to be dirty when the control has been changed
   * from when first compiled.
   */
$setDirty:function(){this.$dirty=!0,this.$pristine=!1,this.$$animate.removeClass(this.$$element,PRISTINE_CLASS),this.$$animate.addClass(this.$$element,DIRTY_CLASS),this.$$parentForm.$setDirty()},/**
   * @ngdoc method
   * @name ngModel.NgModelController#$setUntouched
   *
   * @description
   * Sets the control to its untouched state.
   *
   * This method can be called to remove the `ng-touched` class and set the control to its
   * untouched state (`ng-untouched` class). Upon compilation, a model is set as untouched
   * by default, however this function can be used to restore that state if the model has
   * already been touched by the user.
   */
$setUntouched:function(){this.$touched=!1,this.$untouched=!0,this.$$animate.setClass(this.$$element,UNTOUCHED_CLASS,TOUCHED_CLASS)},/**
   * @ngdoc method
   * @name ngModel.NgModelController#$setTouched
   *
   * @description
   * Sets the control to its touched state.
   *
   * This method can be called to remove the `ng-untouched` class and set the control to its
   * touched state (`ng-touched` class). A model is considered to be touched when the user has
   * first focused the control element and then shifted focus away from the control (blur event).
   */
$setTouched:function(){this.$touched=!0,this.$untouched=!1,this.$$animate.setClass(this.$$element,TOUCHED_CLASS,UNTOUCHED_CLASS)},/**
   * @ngdoc method
   * @name ngModel.NgModelController#$rollbackViewValue
   *
   * @description
   * Cancel an update and reset the input element's value to prevent an update to the `$modelValue`,
   * which may be caused by a pending debounced event or because the input is waiting for some
   * future event.
   *
   * If you have an input that uses `ng-model-options` to set up debounced updates or updates that
   * depend on special events such as `blur`, there can be a period when the `$viewValue` is out of
   * sync with the ngModel's `$modelValue`.
   *
   * In this case, you can use `$rollbackViewValue()` to manually cancel the debounced / future update
   * and reset the input to the last committed view value.
   *
   * It is also possible that you run into difficulties if you try to update the ngModel's `$modelValue`
   * programmatically before these debounced/future events have resolved/occurred, because Angular's
   * dirty checking mechanism is not able to tell whether the model has actually changed or not.
   *
   * The `$rollbackViewValue()` method should be called before programmatically changing the model of an
   * input which may have such events pending. This is important in order to make sure that the
   * input field will be updated with the new model value and any pending operations are cancelled.
   *
   * <example name="ng-model-cancel-update" module="cancel-update-example">
   *   <file name="app.js">
   *     angular.module('cancel-update-example', [])
   *
   *     .controller('CancelUpdateController', ['$scope', function($scope) {
   *       $scope.model = {value1: '', value2: ''};
   *
   *       $scope.setEmpty = function(e, value, rollback) {
   *         if (e.keyCode === 27) {
   *           e.preventDefault();
   *           if (rollback) {
   *             $scope.myForm[value].$rollbackViewValue();
   *           }
   *           $scope.model[value] = '';
   *         }
   *       };
   *     }]);
   *   </file>
   *   <file name="index.html">
   *     <div ng-controller="CancelUpdateController">
   *       <p>Both of these inputs are only updated if they are blurred. Hitting escape should
   *       empty them. Follow these steps and observe the difference:</p>
   *       <ol>
   *         <li>Type something in the input. You will see that the model is not yet updated</li>
   *         <li>Press the Escape key.
   *           <ol>
   *             <li> In the first example, nothing happens, because the model is already '', and no
   *             update is detected. If you blur the input, the model will be set to the current view.
   *             </li>
   *             <li> In the second example, the pending update is cancelled, and the input is set back
   *             to the last committed view value (''). Blurring the input does nothing.
   *             </li>
   *           </ol>
   *         </li>
   *       </ol>
   *
   *       <form name="myForm" ng-model-options="{ updateOn: 'blur' }">
   *         <div>
   *           <p id="inputDescription1">Without $rollbackViewValue():</p>
   *           <input name="value1" aria-describedby="inputDescription1" ng-model="model.value1"
   *                  ng-keydown="setEmpty($event, 'value1')">
   *           value1: "{{ model.value1 }}"
   *         </div>
   *
   *         <div>
   *           <p id="inputDescription2">With $rollbackViewValue():</p>
   *           <input name="value2" aria-describedby="inputDescription2" ng-model="model.value2"
   *                  ng-keydown="setEmpty($event, 'value2', true)">
   *           value2: "{{ model.value2 }}"
   *         </div>
   *       </form>
   *     </div>
   *   </file>
       <file name="style.css">
          div {
            display: table-cell;
          }
          div:nth-child(1) {
            padding-right: 30px;
          }

        </file>
   * </example>
   */
$rollbackViewValue:function(){this.$$timeout.cancel(this.$$pendingDebounce),this.$viewValue=this.$$lastCommittedViewValue,this.$render()},/**
   * @ngdoc method
   * @name ngModel.NgModelController#$validate
   *
   * @description
   * Runs each of the registered validators (first synchronous validators and then
   * asynchronous validators).
   * If the validity changes to invalid, the model will be set to `undefined`,
   * unless {@link ngModelOptions `ngModelOptions.allowInvalid`} is `true`.
   * If the validity changes to valid, it will set the model to the last available valid
   * `$modelValue`, i.e. either the last parsed value or the last value set from the scope.
   */
$validate:function(){
// ignore $validate before model is initialized
if(!isNumberNaN(this.$modelValue)){var viewValue=this.$$lastCommittedViewValue,modelValue=this.$$rawModelValue,prevValid=this.$valid,prevModelValue=this.$modelValue,allowInvalid=this.$options.getOption("allowInvalid"),that=this;this.$$runValidators(modelValue,viewValue,function(allValid){
// If there was no change in validity, don't update the model
// This prevents changing an invalid modelValue to undefined
allowInvalid||prevValid===allValid||(
// Note: Don't check this.$valid here, as we could have
// external validators (e.g. calculated on the server),
// that just call $setValidity and need the model value
// to calculate their validity.
that.$modelValue=allValid?modelValue:void 0,that.$modelValue!==prevModelValue&&that.$$writeModelToScope())})}},$$runValidators:function(modelValue,viewValue,doneCallback){function processParseErrors(){var errorKey=that.$$parserName||"parse";
// Set the parse error last, to prevent unsetting it, should a $validators key == parserName
return isUndefined(that.$$parserValid)?(setValidity(errorKey,null),!0):(that.$$parserValid||(forEach(that.$validators,function(v,name){setValidity(name,null)}),forEach(that.$asyncValidators,function(v,name){setValidity(name,null)})),setValidity(errorKey,that.$$parserValid),that.$$parserValid)}function processSyncValidators(){var syncValidatorsValid=!0;return forEach(that.$validators,function(validator,name){var result=Boolean(validator(modelValue,viewValue));syncValidatorsValid=syncValidatorsValid&&result,setValidity(name,result)}),!!syncValidatorsValid||(forEach(that.$asyncValidators,function(v,name){setValidity(name,null)}),!1)}function processAsyncValidators(){var validatorPromises=[],allValid=!0;forEach(that.$asyncValidators,function(validator,name){var promise=validator(modelValue,viewValue);if(!isPromiseLike(promise))throw ngModelMinErr("nopromise","Expected asynchronous validator to return a promise but got '{0}' instead.",promise);setValidity(name,void 0),validatorPromises.push(promise.then(function(){setValidity(name,!0)},function(){allValid=!1,setValidity(name,!1)}))}),validatorPromises.length?that.$$q.all(validatorPromises).then(function(){validationDone(allValid)},noop):validationDone(!0)}function setValidity(name,isValid){localValidationRunId===that.$$currentValidationRunId&&that.$setValidity(name,isValid)}function validationDone(allValid){localValidationRunId===that.$$currentValidationRunId&&doneCallback(allValid)}this.$$currentValidationRunId++;var localValidationRunId=this.$$currentValidationRunId,that=this;
// check parser error
// check parser error
return processParseErrors()&&processSyncValidators()?void processAsyncValidators():void validationDone(!1)},/**
   * @ngdoc method
   * @name ngModel.NgModelController#$commitViewValue
   *
   * @description
   * Commit a pending update to the `$modelValue`.
   *
   * Updates may be pending by a debounced event or because the input is waiting for a some future
   * event defined in `ng-model-options`. this method is rarely needed as `NgModelController`
   * usually handles calling this in response to input events.
   */
$commitViewValue:function(){var viewValue=this.$viewValue;this.$$timeout.cancel(this.$$pendingDebounce),
// If the view value has not changed then we should just exit, except in the case where there is
// a native validator on the element. In this case the validation state may have changed even though
// the viewValue has stayed empty.
(this.$$lastCommittedViewValue!==viewValue||""===viewValue&&this.$$hasNativeValidators)&&(this.$$updateEmptyClasses(viewValue),this.$$lastCommittedViewValue=viewValue,
// change to dirty
this.$pristine&&this.$setDirty(),this.$$parseAndValidate())},$$parseAndValidate:function(){function writeToModelIfNeeded(){that.$modelValue!==prevModelValue&&that.$$writeModelToScope()}var viewValue=this.$$lastCommittedViewValue,modelValue=viewValue,that=this;if(this.$$parserValid=!isUndefined(modelValue)||void 0,this.$$parserValid)for(var i=0;i<this.$parsers.length;i++)if(modelValue=this.$parsers[i](modelValue),isUndefined(modelValue)){this.$$parserValid=!1;break}isNumberNaN(this.$modelValue)&&(
// this.$modelValue has not been touched yet...
this.$modelValue=this.$$ngModelGet(this.$$scope));var prevModelValue=this.$modelValue,allowInvalid=this.$options.getOption("allowInvalid");this.$$rawModelValue=modelValue,allowInvalid&&(this.$modelValue=modelValue,writeToModelIfNeeded()),
// Pass the $$lastCommittedViewValue here, because the cached viewValue might be out of date.
// This can happen if e.g. $setViewValue is called from inside a parser
this.$$runValidators(modelValue,this.$$lastCommittedViewValue,function(allValid){allowInvalid||(
// Note: Don't check this.$valid here, as we could have
// external validators (e.g. calculated on the server),
// that just call $setValidity and need the model value
// to calculate their validity.
that.$modelValue=allValid?modelValue:void 0,writeToModelIfNeeded())})},$$writeModelToScope:function(){this.$$ngModelSet(this.$$scope,this.$modelValue),forEach(this.$viewChangeListeners,function(listener){try{listener()}catch(e){
// eslint-disable-next-line no-invalid-this
this.$$exceptionHandler(e)}},this)},/**
   * @ngdoc method
   * @name ngModel.NgModelController#$setViewValue
   *
   * @description
   * Update the view value.
   *
   * This method should be called when a control wants to change the view value; typically,
   * this is done from within a DOM event handler. For example, the {@link ng.directive:input input}
   * directive calls it when the value of the input changes and {@link ng.directive:select select}
   * calls it when an option is selected.
   *
   * When `$setViewValue` is called, the new `value` will be staged for committing through the `$parsers`
   * and `$validators` pipelines. If there are no special {@link ngModelOptions} specified then the staged
   * value is sent directly for processing through the `$parsers` pipeline. After this, the `$validators` and
   * `$asyncValidators` are called and the value is applied to `$modelValue`.
   * Finally, the value is set to the **expression** specified in the `ng-model` attribute and
   * all the registered change listeners, in the `$viewChangeListeners` list are called.
   *
   * In case the {@link ng.directive:ngModelOptions ngModelOptions} directive is used with `updateOn`
   * and the `default` trigger is not listed, all those actions will remain pending until one of the
   * `updateOn` events is triggered on the DOM element.
   * All these actions will be debounced if the {@link ng.directive:ngModelOptions ngModelOptions}
   * directive is used with a custom debounce for this particular event.
   * Note that a `$digest` is only triggered once the `updateOn` events are fired, or if `debounce`
   * is specified, once the timer runs out.
   *
   * When used with standard inputs, the view value will always be a string (which is in some cases
   * parsed into another type, such as a `Date` object for `input[date]`.)
   * However, custom controls might also pass objects to this method. In this case, we should make
   * a copy of the object before passing it to `$setViewValue`. This is because `ngModel` does not
   * perform a deep watch of objects, it only looks for a change of identity. If you only change
   * the property of the object then ngModel will not realize that the object has changed and
   * will not invoke the `$parsers` and `$validators` pipelines. For this reason, you should
   * not change properties of the copy once it has been passed to `$setViewValue`.
   * Otherwise you may cause the model value on the scope to change incorrectly.
   *
   * <div class="alert alert-info">
   * In any case, the value passed to the method should always reflect the current value
   * of the control. For example, if you are calling `$setViewValue` for an input element,
   * you should pass the input DOM value. Otherwise, the control and the scope model become
   * out of sync. It's also important to note that `$setViewValue` does not call `$render` or change
   * the control's DOM value in any way. If we want to change the control's DOM value
   * programmatically, we should update the `ngModel` scope expression. Its new value will be
   * picked up by the model controller, which will run it through the `$formatters`, `$render` it
   * to update the DOM, and finally call `$validate` on it.
   * </div>
   *
   * @param {*} value value from the view.
   * @param {string} trigger Event that triggered the update.
   */
$setViewValue:function(value,trigger){this.$viewValue=value,this.$options.getOption("updateOnDefault")&&this.$$debounceViewValueCommit(trigger)},$$debounceViewValueCommit:function(trigger){var debounceDelay=this.$options.getOption("debounce");isNumber(debounceDelay[trigger])?debounceDelay=debounceDelay[trigger]:isNumber(debounceDelay["default"])&&(debounceDelay=debounceDelay["default"]),this.$$timeout.cancel(this.$$pendingDebounce);var that=this;debounceDelay>0?// this fails if debounceDelay is an object
this.$$pendingDebounce=this.$$timeout(function(){that.$commitViewValue()},debounceDelay):this.$$scope.$root.$$phase?this.$commitViewValue():this.$$scope.$apply(function(){that.$commitViewValue()})},/**
   * @ngdoc method
   *
   * @name ngModel.NgModelController#$overrideModelOptions
   *
   * @description
   *
   * Override the current model options settings programmatically.
   *
   * The previous `ModelOptions` value will not be modified. Instead, a
   * new `ModelOptions` object will inherit from the previous one overriding
   * or inheriting settings that are defined in the given parameter.
   *
   * See {@link ngModelOptions} for information about what options can be specified
   * and how model option inheritance works.
   *
   * @param {Object} options a hash of settings to override the previous options
   *
   */
$overrideModelOptions:function(options){this.$options=this.$options.createChild(options)}},/**
 * @ngdoc method
 * @name ngModel.NgModelController#$setValidity
 *
 * @description
 * Change the validity state, and notify the form.
 *
 * This method can be called within $parsers/$formatters or a custom validation implementation.
 * However, in most cases it should be sufficient to use the `ngModel.$validators` and
 * `ngModel.$asyncValidators` collections which will call `$setValidity` automatically.
 *
 * @param {string} validationErrorKey Name of the validator. The `validationErrorKey` will be assigned
 *        to either `$error[validationErrorKey]` or `$pending[validationErrorKey]`
 *        (for unfulfilled `$asyncValidators`), so that it is available for data-binding.
 *        The `validationErrorKey` should be in camelCase and will get converted into dash-case
 *        for class name. Example: `myError` will result in `ng-valid-my-error` and `ng-invalid-my-error`
 *        class and can be bound to as  `{{someForm.someControl.$error.myError}}` .
 * @param {boolean} isValid Whether the current state is valid (true), invalid (false), pending (undefined),
 *                          or skipped (null). Pending is used for unfulfilled `$asyncValidators`.
 *                          Skipped is used by Angular when validators do not run because of parse errors and
 *                          when `$asyncValidators` do not run because any of the `$validators` failed.
 */
addSetValidityMethod({clazz:NgModelController,set:function(object,property){object[property]=!0},unset:function(object,property){delete object[property]}});/**
 * @ngdoc directive
 * @name ngModel
 *
 * @element input
 * @priority 1
 *
 * @description
 * The `ngModel` directive binds an `input`,`select`, `textarea` (or custom form control) to a
 * property on the scope using {@link ngModel.NgModelController NgModelController},
 * which is created and exposed by this directive.
 *
 * `ngModel` is responsible for:
 *
 * - Binding the view into the model, which other directives such as `input`, `textarea` or `select`
 *   require.
 * - Providing validation behavior (i.e. required, number, email, url).
 * - Keeping the state of the control (valid/invalid, dirty/pristine, touched/untouched, validation errors).
 * - Setting related css classes on the element (`ng-valid`, `ng-invalid`, `ng-dirty`, `ng-pristine`, `ng-touched`,
 *   `ng-untouched`, `ng-empty`, `ng-not-empty`) including animations.
 * - Registering the control with its parent {@link ng.directive:form form}.
 *
 * Note: `ngModel` will try to bind to the property given by evaluating the expression on the
 * current scope. If the property doesn't already exist on this scope, it will be created
 * implicitly and added to the scope.
 *
 * For best practices on using `ngModel`, see:
 *
 *  - [Understanding Scopes](https://github.com/angular/angular.js/wiki/Understanding-Scopes)
 *
 * For basic examples, how to use `ngModel`, see:
 *
 *  - {@link ng.directive:input input}
 *    - {@link input[text] text}
 *    - {@link input[checkbox] checkbox}
 *    - {@link input[radio] radio}
 *    - {@link input[number] number}
 *    - {@link input[email] email}
 *    - {@link input[url] url}
 *    - {@link input[date] date}
 *    - {@link input[datetime-local] datetime-local}
 *    - {@link input[time] time}
 *    - {@link input[month] month}
 *    - {@link input[week] week}
 *  - {@link ng.directive:select select}
 *  - {@link ng.directive:textarea textarea}
 *
 * # Complex Models (objects or collections)
 *
 * By default, `ngModel` watches the model by reference, not value. This is important to know when
 * binding inputs to models that are objects (e.g. `Date`) or collections (e.g. arrays). If only properties of the
 * object or collection change, `ngModel` will not be notified and so the input will not be  re-rendered.
 *
 * The model must be assigned an entirely new object or collection before a re-rendering will occur.
 *
 * Some directives have options that will cause them to use a custom `$watchCollection` on the model expression
 * - for example, `ngOptions` will do so when a `track by` clause is included in the comprehension expression or
 * if the select is given the `multiple` attribute.
 *
 * The `$watchCollection()` method only does a shallow comparison, meaning that changing properties deeper than the
 * first level of the object (or only changing the properties of an item in the collection if it's an array) will still
 * not trigger a re-rendering of the model.
 *
 * # CSS classes
 * The following CSS classes are added and removed on the associated input/select/textarea element
 * depending on the validity of the model.
 *
 *  - `ng-valid`: the model is valid
 *  - `ng-invalid`: the model is invalid
 *  - `ng-valid-[key]`: for each valid key added by `$setValidity`
 *  - `ng-invalid-[key]`: for each invalid key added by `$setValidity`
 *  - `ng-pristine`: the control hasn't been interacted with yet
 *  - `ng-dirty`: the control has been interacted with
 *  - `ng-touched`: the control has been blurred
 *  - `ng-untouched`: the control hasn't been blurred
 *  - `ng-pending`: any `$asyncValidators` are unfulfilled
 *  - `ng-empty`: the view does not contain a value or the value is deemed "empty", as defined
 *     by the {@link ngModel.NgModelController#$isEmpty} method
 *  - `ng-not-empty`: the view contains a non-empty value
 *
 * Keep in mind that ngAnimate can detect each of these classes when added and removed.
 *
 * ## Animation Hooks
 *
 * Animations within models are triggered when any of the associated CSS classes are added and removed
 * on the input element which is attached to the model. These classes include: `.ng-pristine`, `.ng-dirty`,
 * `.ng-invalid` and `.ng-valid` as well as any other validations that are performed on the model itself.
 * The animations that are triggered within ngModel are similar to how they work in ngClass and
 * animations can be hooked into using CSS transitions, keyframes as well as JS animations.
 *
 * The following example shows a simple way to utilize CSS transitions to style an input element
 * that has been rendered as invalid after it has been validated:
 *
 * <pre>
 * //be sure to include ngAnimate as a module to hook into more
 * //advanced animations
 * .my-input {
 *   transition:0.5s linear all;
 *   background: white;
 * }
 * .my-input.ng-invalid {
 *   background: red;
 *   color:white;
 * }
 * </pre>
 *
 * @example
 * <example deps="angular-animate.js" animations="true" fixBase="true" module="inputExample" name="ng-model">
     <file name="index.html">
       <script>
        angular.module('inputExample', [])
          .controller('ExampleController', ['$scope', function($scope) {
            $scope.val = '1';
          }]);
       </script>
       <style>
         .my-input {
           transition:all linear 0.5s;
           background: transparent;
         }
         .my-input.ng-invalid {
           color:white;
           background: red;
         }
       </style>
       <p id="inputDescription">
        Update input to see transitions when valid/invalid.
        Integer is a valid value.
       </p>
       <form name="testForm" ng-controller="ExampleController">
         <input ng-model="val" ng-pattern="/^\d+$/" name="anim" class="my-input"
                aria-describedby="inputDescription" />
       </form>
     </file>
 * </example>
 *
 * ## Binding to a getter/setter
 *
 * Sometimes it's helpful to bind `ngModel` to a getter/setter function.  A getter/setter is a
 * function that returns a representation of the model when called with zero arguments, and sets
 * the internal state of a model when called with an argument. It's sometimes useful to use this
 * for models that have an internal representation that's different from what the model exposes
 * to the view.
 *
 * <div class="alert alert-success">
 * **Best Practice:** It's best to keep getters fast because Angular is likely to call them more
 * frequently than other parts of your code.
 * </div>
 *
 * You use this behavior by adding `ng-model-options="{ getterSetter: true }"` to an element that
 * has `ng-model` attached to it. You can also add `ng-model-options="{ getterSetter: true }"` to
 * a `<form>`, which will enable this behavior for all `<input>`s within it. See
 * {@link ng.directive:ngModelOptions `ngModelOptions`} for more.
 *
 * The following example shows how to use `ngModel` with a getter/setter:
 *
 * @example
 * <example name="ngModel-getter-setter" module="getterSetterExample">
     <file name="index.html">
       <div ng-controller="ExampleController">
         <form name="userForm">
           <label>Name:
             <input type="text" name="userName"
                    ng-model="user.name"
                    ng-model-options="{ getterSetter: true }" />
           </label>
         </form>
         <pre>user.name = <span ng-bind="user.name()"></span></pre>
       </div>
     </file>
     <file name="app.js">
       angular.module('getterSetterExample', [])
         .controller('ExampleController', ['$scope', function($scope) {
           var _name = 'Brian';
           $scope.user = {
             name: function(newName) {
              // Note that newName can be undefined for two reasons:
              // 1. Because it is called as a getter and thus called with no arguments
              // 2. Because the property should actually be set to undefined. This happens e.g. if the
              //    input is invalid
              return arguments.length ? (_name = newName) : _name;
             }
           };
         }]);
     </file>
 * </example>
 */
var defaultModelOptions,ngModelDirective=["$rootScope",function($rootScope){return{restrict:"A",require:["ngModel","^?form","^?ngModelOptions"],controller:NgModelController,
// Prelink needs to run before any input directive
// so that we can set the NgModelOptions in NgModelController
// before anyone else uses it.
priority:1,compile:function(element){
// Setup initial state of the control
return element.addClass(PRISTINE_CLASS).addClass(UNTOUCHED_CLASS).addClass(VALID_CLASS),{pre:function(scope,element,attr,ctrls){var modelCtrl=ctrls[0],formCtrl=ctrls[1]||modelCtrl.$$parentForm,optionsCtrl=ctrls[2];optionsCtrl&&(modelCtrl.$options=optionsCtrl.$options),modelCtrl.$$initGetterSetters(),
// notify others, especially parent forms
formCtrl.$addControl(modelCtrl),attr.$observe("name",function(newValue){modelCtrl.$name!==newValue&&modelCtrl.$$parentForm.$$renameControl(modelCtrl,newValue)}),scope.$on("$destroy",function(){modelCtrl.$$parentForm.$removeControl(modelCtrl)})},post:function(scope,element,attr,ctrls){function setTouched(){modelCtrl.$setTouched()}var modelCtrl=ctrls[0];modelCtrl.$options.getOption("updateOn")&&element.on(modelCtrl.$options.getOption("updateOn"),function(ev){modelCtrl.$$debounceViewValueCommit(ev&&ev.type)}),element.on("blur",function(){modelCtrl.$touched||($rootScope.$$phase?scope.$evalAsync(setTouched):scope.$apply(setTouched))})}}}}}],DEFAULT_REGEXP=/(\s+|^)default(\s+|$)/;ModelOptions.prototype={/**
   * @ngdoc method
   * @name ModelOptions#getOption
   * @param {string} name the name of the option to retrieve
   * @returns {*} the value of the option
   * @description
   * Returns the value of the given option
   */
getOption:function(name){return this.$$options[name]},/**
   * @ngdoc method
   * @name ModelOptions#createChild
   * @param {Object} options a hash of options for the new child that will override the parent's options
   * @return {ModelOptions} a new `ModelOptions` object initialized with the given options.
   */
createChild:function(options){var inheritAll=!1;
// make a shallow copy
// Inherit options from the parent if specified by the value `"$inherit"`
/* @this */
// We have a property of the form: `"*": "$inherit"`
// Finally add in any missing defaults
return options=extend({},options),forEach(options,function(option,key){"$inherit"===option?"*"===key?inheritAll=!0:(options[key]=this.$$options[key],
// `updateOn` is special so we must also inherit the `updateOnDefault` option
"updateOn"===key&&(options.updateOnDefault=this.$$options.updateOnDefault)):"updateOn"===key&&(
// If the `updateOn` property contains the `default` event then we have to remove
// it from the event list and set the `updateOnDefault` flag.
options.updateOnDefault=!1,options[key]=trim(option.replace(DEFAULT_REGEXP,function(){return options.updateOnDefault=!0," "})))},this),inheritAll&&(delete options["*"],defaults(options,this.$$options)),defaults(options,defaultModelOptions.$$options),new ModelOptions(options)}},defaultModelOptions=new ModelOptions({updateOn:"",updateOnDefault:!0,debounce:0,getterSetter:!1,allowInvalid:!1,timezone:null});/**
 * @ngdoc directive
 * @name ngModelOptions
 *
 * @description
 * This directive allows you to modify the behaviour of {@link ngModel} directives within your
 * application. You can specify an `ngModelOptions` directive on any element. All {@link ngModel}
 * directives will use the options of their nearest `ngModelOptions` ancestor.
 *
 * The `ngModelOptions` settings are found by evaluating the value of the attribute directive as
 * an Angular expression. This expression should evaluate to an object, whose properties contain
 * the settings. For example: `<div "ng-model-options"="{ debounce: 100 }"`.
 *
 * ## Inheriting Options
 *
 * You can specify that an `ngModelOptions` setting should be inherited from a parent `ngModelOptions`
 * directive by giving it the value of `"$inherit"`.
 * Then it will inherit that setting from the first `ngModelOptions` directive found by traversing up the
 * DOM tree. If there is no ancestor element containing an `ngModelOptions` directive then default settings
 * will be used.
 *
 * For example given the following fragment of HTML
 *
 *
 * ```html
 * <div ng-model-options="{ allowInvalid: true, debounce: 200 }">
 *   <form ng-model-options="{ updateOn: 'blur', allowInvalid: '$inherit' }">
 *     <input ng-model-options="{ updateOn: 'default', allowInvalid: '$inherit' }" />
 *   </form>
 * </div>
 * ```
 *
 * the `input` element will have the following settings
 *
 * ```js
 * { allowInvalid: true, updateOn: 'default', debounce: 0 }
 * ```
 *
 * Notice that the `debounce` setting was not inherited and used the default value instead.
 *
 * You can specify that all undefined settings are automatically inherited from an ancestor by
 * including a property with key of `"*"` and value of `"$inherit"`.
 *
 * For example given the following fragment of HTML
 *
 *
 * ```html
 * <div ng-model-options="{ allowInvalid: true, debounce: 200 }">
 *   <form ng-model-options="{ updateOn: 'blur', "*": '$inherit' }">
 *     <input ng-model-options="{ updateOn: 'default', "*": '$inherit' }" />
 *   </form>
 * </div>
 * ```
 *
 * the `input` element will have the following settings
 *
 * ```js
 * { allowInvalid: true, updateOn: 'default', debounce: 200 }
 * ```
 *
 * Notice that the `debounce` setting now inherits the value from the outer `<div>` element.
 *
 * If you are creating a reusable component then you should be careful when using `"*": "$inherit"`
 * since you may inadvertently inherit a setting in the future that changes the behavior of your component.
 *
 *
 * ## Triggering and debouncing model updates
 *
 * The `updateOn` and `debounce` properties allow you to specify a custom list of events that will
 * trigger a model update and/or a debouncing delay so that the actual update only takes place when
 * a timer expires; this timer will be reset after another change takes place.
 *
 * Given the nature of `ngModelOptions`, the value displayed inside input fields in the view might
 * be different from the value in the actual model. This means that if you update the model you
 * should also invoke {@link ngModel.NgModelController#$rollbackViewValue} on the relevant input field in
 * order to make sure it is synchronized with the model and that any debounced action is canceled.
 *
 * The easiest way to reference the control's {@link ngModel.NgModelController#$rollbackViewValue}
 * method is by making sure the input is placed inside a form that has a `name` attribute. This is
 * important because `form` controllers are published to the related scope under the name in their
 * `name` attribute.
 *
 * Any pending changes will take place immediately when an enclosing form is submitted via the
 * `submit` event. Note that `ngClick` events will occur before the model is updated. Use `ngSubmit`
 * to have access to the updated model.
 *
 * The following example shows how to override immediate updates. Changes on the inputs within the
 * form will update the model only when the control loses focus (blur event). If `escape` key is
 * pressed while the input field is focused, the value is reset to the value in the current model.
 *
 * <example name="ngModelOptions-directive-blur" module="optionsExample">
 *   <file name="index.html">
 *     <div ng-controller="ExampleController">
 *       <form name="userForm">
 *         <label>
 *           Name:
 *           <input type="text" name="userName"
 *                  ng-model="user.name"
 *                  ng-model-options="{ updateOn: 'blur' }"
 *                  ng-keyup="cancel($event)" />
 *         </label><br />
 *         <label>
 *           Other data:
 *           <input type="text" ng-model="user.data" />
 *         </label><br />
 *       </form>
 *       <pre>user.name = <span ng-bind="user.name"></span></pre>
 *     </div>
 *   </file>
 *   <file name="app.js">
 *     angular.module('optionsExample', [])
 *       .controller('ExampleController', ['$scope', function($scope) {
 *         $scope.user = { name: 'say', data: '' };
 *
 *         $scope.cancel = function(e) {
 *           if (e.keyCode === 27) {
 *             $scope.userForm.userName.$rollbackViewValue();
 *           }
 *         };
 *       }]);
 *   </file>
 *   <file name="protractor.js" type="protractor">
 *     var model = element(by.binding('user.name'));
 *     var input = element(by.model('user.name'));
 *     var other = element(by.model('user.data'));
 *
 *     it('should allow custom events', function() {
 *       input.sendKeys(' hello');
 *       input.click();
 *       expect(model.getText()).toEqual('say');
 *       other.click();
 *       expect(model.getText()).toEqual('say hello');
 *     });
 *
 *     it('should $rollbackViewValue when model changes', function() {
 *       input.sendKeys(' hello');
 *       expect(input.getAttribute('value')).toEqual('say hello');
 *       input.sendKeys(protractor.Key.ESCAPE);
 *       expect(input.getAttribute('value')).toEqual('say');
 *       other.click();
 *       expect(model.getText()).toEqual('say');
 *     });
 *   </file>
 * </example>
 *
 * The next example shows how to debounce model changes. Model will be updated only 1 sec after last change.
 * If the `Clear` button is pressed, any debounced action is canceled and the value becomes empty.
 *
 * <example name="ngModelOptions-directive-debounce" module="optionsExample">
 *   <file name="index.html">
 *     <div ng-controller="ExampleController">
 *       <form name="userForm">
 *         Name:
 *         <input type="text" name="userName"
 *                ng-model="user.name"
 *                ng-model-options="{ debounce: 1000 }" />
 *         <button ng-click="userForm.userName.$rollbackViewValue(); user.name=''">Clear</button><br />
 *       </form>
 *       <pre>user.name = <span ng-bind="user.name"></span></pre>
 *     </div>
 *   </file>
 *   <file name="app.js">
 *     angular.module('optionsExample', [])
 *       .controller('ExampleController', ['$scope', function($scope) {
 *         $scope.user = { name: 'say' };
 *       }]);
 *   </file>
 * </example>
 *
 * ## Model updates and validation
 *
 * The default behaviour in `ngModel` is that the model value is set to `undefined` when the
 * validation determines that the value is invalid. By setting the `allowInvalid` property to true,
 * the model will still be updated even if the value is invalid.
 *
 *
 * ## Connecting to the scope
 *
 * By setting the `getterSetter` property to true you are telling ngModel that the `ngModel` expression
 * on the scope refers to a "getter/setter" function rather than the value itself.
 *
 * The following example shows how to bind to getter/setters:
 *
 * <example name="ngModelOptions-directive-getter-setter" module="getterSetterExample">
 *   <file name="index.html">
 *     <div ng-controller="ExampleController">
 *       <form name="userForm">
 *         <label>
 *           Name:
 *           <input type="text" name="userName"
 *                  ng-model="user.name"
 *                  ng-model-options="{ getterSetter: true }" />
 *         </label>
 *       </form>
 *       <pre>user.name = <span ng-bind="user.name()"></span></pre>
 *     </div>
 *   </file>
 *   <file name="app.js">
 *     angular.module('getterSetterExample', [])
 *       .controller('ExampleController', ['$scope', function($scope) {
 *         var _name = 'Brian';
 *         $scope.user = {
 *           name: function(newName) {
 *             return angular.isDefined(newName) ? (_name = newName) : _name;
 *           }
 *         };
 *       }]);
 *   </file>
 * </example>
 *
 *
 * ## Specifying timezones
 *
 * You can specify the timezone that date/time input directives expect by providing its name in the
 * `timezone` property.
 *
 * @param {Object} ngModelOptions options to apply to {@link ngModel} directives on this element and
 *   and its descendents. Valid keys are:
 *   - `updateOn`: string specifying which event should the input be bound to. You can set several
 *     events using an space delimited list. There is a special event called `default` that
 *     matches the default events belonging to the control.
 *   - `debounce`: integer value which contains the debounce model update value in milliseconds. A
 *     value of 0 triggers an immediate update. If an object is supplied instead, you can specify a
 *     custom value for each event. For example:
 *     ```
 *     ng-model-options="{
 *       updateOn: 'default blur',
 *       debounce: { 'default': 500, 'blur': 0 }
 *     }"
 *     ```
 *   - `allowInvalid`: boolean value which indicates that the model can be set with values that did
 *     not validate correctly instead of the default behavior of setting the model to undefined.
 *   - `getterSetter`: boolean value which determines whether or not to treat functions bound to
 *     `ngModel` as getters/setters.
 *   - `timezone`: Defines the timezone to be used to read/write the `Date` instance in the model for
 *     `<input type="date" />`, `<input type="time" />`, ... . It understands UTC/GMT and the
 *     continental US time zone abbreviations, but for general use, use a time zone offset, for
 *     example, `'+0430'` (4 hours, 30 minutes east of the Greenwich meridian)
 *     If not specified, the timezone of the browser will be used.
 *
 */
var ngModelOptionsDirective=function(){function NgModelOptionsController($attrs,$scope){this.$$attrs=$attrs,this.$$scope=$scope}return NgModelOptionsController.$inject=["$attrs","$scope"],NgModelOptionsController.prototype={$onInit:function(){var parentOptions=this.parentCtrl?this.parentCtrl.$options:defaultModelOptions,modelOptionsDefinition=this.$$scope.$eval(this.$$attrs.ngModelOptions);this.$options=parentOptions.createChild(modelOptionsDefinition)}},{restrict:"A",
// ngModelOptions needs to run before ngModel and input directives
priority:10,require:{parentCtrl:"?^^ngModelOptions"},bindToController:!0,controller:NgModelOptionsController}},ngNonBindableDirective=ngDirective({terminal:!0,priority:1e3}),ngOptionsMinErr=minErr("ngOptions"),NG_OPTIONS_REGEXP=/^\s*([\s\S]+?)(?:\s+as\s+([\s\S]+?))?(?:\s+group\s+by\s+([\s\S]+?))?(?:\s+disable\s+when\s+([\s\S]+?))?\s+for\s+(?:([$\w][$\w]*)|(?:\(\s*([$\w][$\w]*)\s*,\s*([$\w][$\w]*)\s*\)))\s+in\s+([\s\S]+?)(?:\s+track\s+by\s+([\s\S]+?))?$/,ngOptionsDirective=["$compile","$document","$parse",function($compile,$document,$parse){function parseOptionsExpression(optionsExp,selectElement,scope){function Option(selectValue,viewValue,label,group,disabled){this.selectValue=selectValue,this.viewValue=viewValue,this.label=label,this.group=group,this.disabled=disabled}function getOptionValuesKeys(optionValues){var optionValuesKeys;if(!keyName&&isArrayLike(optionValues))optionValuesKeys=optionValues;else{
// if object, extract keys, in enumeration order, unsorted
optionValuesKeys=[];for(var itemKey in optionValues)optionValues.hasOwnProperty(itemKey)&&"$"!==itemKey.charAt(0)&&optionValuesKeys.push(itemKey)}return optionValuesKeys}var match=optionsExp.match(NG_OPTIONS_REGEXP);if(!match)throw ngOptionsMinErr("iexp","Expected expression in form of '_select_ (as _label_)? for (_key_,)?_value_ in _collection_' but got '{0}'. Element: {1}",optionsExp,startingTag(selectElement));
// Extract the parts from the ngOptions expression
// The variable name for the value of the item in the collection
var valueName=match[5]||match[7],keyName=match[6],selectAs=/ as /.test(match[0])&&match[1],trackBy=match[9],valueFn=$parse(match[2]?match[1]:valueName),selectAsFn=selectAs&&$parse(selectAs),viewValueFn=selectAsFn||valueFn,trackByFn=trackBy&&$parse(trackBy),getTrackByValueFn=trackBy?function(value,locals){return trackByFn(scope,locals)}:function(value){return hashKey(value)},getTrackByValue=function(value,key){return getTrackByValueFn(value,getLocals(value,key))},displayFn=$parse(match[2]||match[1]),groupByFn=$parse(match[3]||""),disableWhenFn=$parse(match[4]||""),valuesFn=$parse(match[8]),locals={},getLocals=keyName?function(value,key){return locals[keyName]=key,locals[valueName]=value,locals}:function(value){return locals[valueName]=value,locals};return{trackBy:trackBy,getTrackByValue:getTrackByValue,getWatchables:$parse(valuesFn,function(optionValues){
// Create a collection of things that we would like to watch (watchedArray)
// so that they can all be watched using a single $watchCollection
// that only runs the handler once if anything changes
var watchedArray=[];optionValues=optionValues||[];for(var optionValuesKeys=getOptionValuesKeys(optionValues),optionValuesLength=optionValuesKeys.length,index=0;index<optionValuesLength;index++){var key=optionValues===optionValuesKeys?index:optionValuesKeys[index],value=optionValues[key],locals=getLocals(value,key),selectValue=getTrackByValueFn(value,locals);
// Only need to watch the displayFn if there is a specific label expression
if(watchedArray.push(selectValue),match[2]||match[1]){var label=displayFn(scope,locals);watchedArray.push(label)}
// Only need to watch the disableWhenFn if there is a specific disable expression
if(match[4]){var disableWhen=disableWhenFn(scope,locals);watchedArray.push(disableWhen)}}return watchedArray}),getOptions:function(){for(var optionItems=[],selectValueMap={},optionValues=valuesFn(scope)||[],optionValuesKeys=getOptionValuesKeys(optionValues),optionValuesLength=optionValuesKeys.length,index=0;index<optionValuesLength;index++){var key=optionValues===optionValuesKeys?index:optionValuesKeys[index],value=optionValues[key],locals=getLocals(value,key),viewValue=viewValueFn(scope,locals),selectValue=getTrackByValueFn(viewValue,locals),label=displayFn(scope,locals),group=groupByFn(scope,locals),disabled=disableWhenFn(scope,locals),optionItem=new Option(selectValue,viewValue,label,group,disabled);optionItems.push(optionItem),selectValueMap[selectValue]=optionItem}return{items:optionItems,selectValueMap:selectValueMap,getOptionFromViewValue:function(value){return selectValueMap[getTrackByValue(value)]},getViewValueFromOption:function(option){
// If the viewValue could be an object that may be mutated by the application,
// we need to make a copy and not return the reference to the value on the option.
return trackBy?copy(option.viewValue):option.viewValue}}}}}function ngOptionsPostLink(scope,selectElement,attr,ctrls){
// ------------------------------------------------------------------ //
function addOptionElement(option,parent){var optionElement=optionTemplate.cloneNode(!1);parent.appendChild(optionElement),updateOptionElement(option,optionElement)}function getAndUpdateSelectedOption(viewValue){var option=options.getOptionFromViewValue(viewValue),element=option&&option.element;return element&&!element.selected&&(element.selected=!0),option}function updateOptionElement(option,element){option.element=element,element.disabled=option.disabled,
// NOTE: The label must be set before the value, otherwise IE10/11/EDGE create unresponsive
// selects in certain circumstances when multiple selects are next to each other and display
// the option list in listbox style, i.e. the select is [multiple], or specifies a [size].
// See https://github.com/angular/angular.js/issues/11314 for more info.
// This is unfortunately untestable with unit / e2e tests
option.label!==element.label&&(element.label=option.label,element.textContent=option.label),element.value=option.selectValue}function updateOptions(){var previousValue=options&&selectCtrl.readValue();
// We must remove all current options, but cannot simply set innerHTML = null
// since the providedEmptyOption might have an ngIf on it that inserts comments which we
// must preserve.
// Instead, iterate over the current option elements and remove them or their optgroup
// parents
if(options)for(var i=options.items.length-1;i>=0;i--){var option=options.items[i];jqLiteRemove(isDefined(option.group)?option.element.parentNode:option.element)}options=ngOptions.getOptions();var groupElementMap={};
// Check to see if the value has changed due to the update to the options
if(
// Ensure that the empty option is always there if it was explicitly provided
providedEmptyOption&&selectElement.prepend(selectCtrl.emptyOption),options.items.forEach(function(option){var groupElement;isDefined(option.group)?(
// This option is to live in a group
// See if we have already created this group
groupElement=groupElementMap[option.group],groupElement||(groupElement=optGroupTemplate.cloneNode(!1),listFragment.appendChild(groupElement),
// Update the label on the group element
// "null" is special cased because of Safari
groupElement.label=null===option.group?"null":option.group,
// Store it for use later
groupElementMap[option.group]=groupElement),addOptionElement(option,groupElement)):
// This option is not in a group
addOptionElement(option,listFragment)}),selectElement[0].appendChild(listFragment),ngModelCtrl.$render(),!ngModelCtrl.$isEmpty(previousValue)){var nextValue=selectCtrl.readValue(),isNotPrimitive=ngOptions.trackBy||multiple;(isNotPrimitive?equals(previousValue,nextValue):previousValue===nextValue)||(ngModelCtrl.$setViewValue(nextValue),ngModelCtrl.$render())}}
// The emptyOption allows the application developer to provide their own custom "empty"
// option when the viewValue does not match any of the option values.
for(var selectCtrl=ctrls[0],ngModelCtrl=ctrls[1],multiple=attr.multiple,i=0,children=selectElement.children(),ii=children.length;i<ii;i++)if(""===children[i].value){selectCtrl.hasEmptyOption=!0,selectCtrl.emptyOption=children.eq(i);break}var providedEmptyOption=!!selectCtrl.emptyOption,unknownOption=jqLite(optionTemplate.cloneNode(!1));unknownOption.val("?");var options,ngOptions=parseOptionsExpression(attr.ngOptions,selectElement,scope),listFragment=$document[0].createDocumentFragment();
// Overwrite the implementation. ngOptions doesn't use hashes
selectCtrl.generateUnknownOptionValue=function(val){return"?"},
// Update the controller methods for multiple selectable options
multiple?(selectCtrl.writeValue=function(values){
// Only set `<option>.selected` if necessary, in order to prevent some browsers from
// scrolling to `<option>` elements that are outside the `<select>` element's viewport.
var selectedOptions=values&&values.map(getAndUpdateSelectedOption)||[];options.items.forEach(function(option){option.element.selected&&!includes(selectedOptions,option)&&(option.element.selected=!1)})},selectCtrl.readValue=function(){var selectedValues=selectElement.val()||[],selections=[];return forEach(selectedValues,function(value){var option=options.selectValueMap[value];option&&!option.disabled&&selections.push(options.getViewValueFromOption(option))}),selections},
// If we are using `track by` then we must watch these tracked values on the model
// since ngModel only watches for object identity change
ngOptions.trackBy&&scope.$watchCollection(function(){if(isArray(ngModelCtrl.$viewValue))return ngModelCtrl.$viewValue.map(function(value){return ngOptions.getTrackByValue(value)})},function(){ngModelCtrl.$render()})):(selectCtrl.writeValue=function(value){var selectedOption=options.selectValueMap[selectElement.val()],option=options.getOptionFromViewValue(value);
// Make sure to remove the selected attribute from the previously selected option
// Otherwise, screen readers might get confused
selectedOption&&selectedOption.element.removeAttribute("selected"),option?(
// Don't update the option when it is already selected.
// For example, the browser will select the first option by default. In that case,
// most properties are set automatically - except the `selected` attribute, which we
// set always
selectElement[0].value!==option.selectValue&&(selectCtrl.removeUnknownOption(),selectCtrl.unselectEmptyOption(),selectElement[0].value=option.selectValue,option.element.selected=!0),option.element.setAttribute("selected","selected")):providedEmptyOption?selectCtrl.selectEmptyOption():selectCtrl.unknownOption.parent().length?selectCtrl.updateUnknownOption(value):selectCtrl.renderUnknownOption(value)},selectCtrl.readValue=function(){var selectedOption=options.selectValueMap[selectElement.val()];return selectedOption&&!selectedOption.disabled?(selectCtrl.unselectEmptyOption(),selectCtrl.removeUnknownOption(),options.getViewValueFromOption(selectedOption)):null},
// If we are using `track by` then we must watch the tracked value on the model
// since ngModel only watches for object identity change
// FIXME: When a user selects an option, this watch will fire needlessly
ngOptions.trackBy&&scope.$watch(function(){return ngOptions.getTrackByValue(ngModelCtrl.$viewValue)},function(){ngModelCtrl.$render()})),providedEmptyOption&&(
// we need to remove it before calling selectElement.empty() because otherwise IE will
// remove the label from the element. wtf?
selectCtrl.emptyOption.remove(),
// compile the element since there might be bindings in it
$compile(selectCtrl.emptyOption)(scope),selectCtrl.emptyOption[0].nodeType===NODE_TYPE_COMMENT?(
// This means the empty option has currently no actual DOM node, probably because
// it has been modified by a transclusion directive.
selectCtrl.hasEmptyOption=!1,
// Redefine the registerOption function, which will catch
// options that are added by ngIf etc. (rendering of the node is async because of
// lazy transclusion)
selectCtrl.registerOption=function(optionScope,optionEl){""===optionEl.val()&&(selectCtrl.hasEmptyOption=!0,selectCtrl.emptyOption=optionEl,selectCtrl.emptyOption.removeClass("ng-scope"),
// This ensures the new empty option is selected if previously no option was selected
ngModelCtrl.$render(),optionEl.on("$destroy",function(){selectCtrl.hasEmptyOption=!1,selectCtrl.emptyOption=void 0}))}):
// remove the class, which is added automatically because we recompile the element and it
// becomes the compilation root
selectCtrl.emptyOption.removeClass("ng-scope")),selectElement.empty(),
// We need to do this here to ensure that the options object is defined
// when we first hit it in writeNgOptionsValue
updateOptions(),
// We will re-render the option elements if the option values or labels change
scope.$watchCollection(ngOptions.getWatchables,updateOptions)}
// we can't just jqLite('<option>') since jqLite is not smart enough
// to create it in <select> and IE barfs otherwise.
var optionTemplate=window.document.createElement("option"),optGroupTemplate=window.document.createElement("optgroup");return{restrict:"A",terminal:!0,require:["select","ngModel"],link:{pre:function(scope,selectElement,attr,ctrls){
// Deactivate the SelectController.register method to prevent
// option directives from accidentally registering themselves
// (and unwanted $destroy handlers etc.)
ctrls[0].registerOption=noop},post:ngOptionsPostLink}}}],ngPluralizeDirective=["$locale","$interpolate","$log",function($locale,$interpolate,$log){var BRACE=/{}/g,IS_WHEN=/^when(Minus)?(.+)$/;return{link:function(scope,element,attr){function updateElementText(newText){element.text(newText||"")}var lastCount,numberExp=attr.count,whenExp=attr.$attr.when&&element.attr(attr.$attr.when),// we have {{}} in attrs
offset=attr.offset||0,whens=scope.$eval(whenExp)||{},whensExpFns={},startSymbol=$interpolate.startSymbol(),endSymbol=$interpolate.endSymbol(),braceReplacement=startSymbol+numberExp+"-"+offset+endSymbol,watchRemover=angular.noop;forEach(attr,function(expression,attributeName){var tmpMatch=IS_WHEN.exec(attributeName);if(tmpMatch){var whenKey=(tmpMatch[1]?"-":"")+lowercase(tmpMatch[2]);whens[whenKey]=element.attr(attr.$attr[attributeName])}}),forEach(whens,function(expression,key){whensExpFns[key]=$interpolate(expression.replace(BRACE,braceReplacement))}),scope.$watch(numberExp,function(newVal){var count=parseFloat(newVal),countIsNaN=isNumberNaN(count);
// If both `count` and `lastCount` are NaN, we don't need to re-register a watch.
// In JS `NaN !== NaN`, so we have to explicitly check.
if(countIsNaN||count in whens||(
// If an explicit number rule such as 1, 2, 3... is defined, just use it.
// Otherwise, check it against pluralization rules in $locale service.
count=$locale.pluralCat(count-offset)),!(count===lastCount||countIsNaN&&isNumberNaN(lastCount))){watchRemover();var whenExpFn=whensExpFns[count];isUndefined(whenExpFn)?(null!=newVal&&$log.debug("ngPluralize: no rule defined for '"+count+"' in "+whenExp),watchRemover=noop,updateElementText()):watchRemover=scope.$watch(whenExpFn,updateElementText),lastCount=count}})}}}],ngRepeatDirective=["$parse","$animate","$compile",function($parse,$animate,$compile){var NG_REMOVED="$$NG_REMOVED",ngRepeatMinErr=minErr("ngRepeat"),updateScope=function(scope,index,valueIdentifier,value,keyIdentifier,key,arrayLength){
// TODO(perf): generate setters to shave off ~40ms or 1-1.5%
scope[valueIdentifier]=value,keyIdentifier&&(scope[keyIdentifier]=key),scope.$index=index,scope.$first=0===index,scope.$last=index===arrayLength-1,scope.$middle=!(scope.$first||scope.$last),
// eslint-disable-next-line no-bitwise
scope.$odd=!(scope.$even=0===(1&index))},getBlockStart=function(block){return block.clone[0]},getBlockEnd=function(block){return block.clone[block.clone.length-1]};return{restrict:"A",multiElement:!0,transclude:"element",priority:1e3,terminal:!0,$$tlb:!0,compile:function($element,$attr){var expression=$attr.ngRepeat,ngRepeatEndComment=$compile.$$createComment("end ngRepeat",expression),match=expression.match(/^\s*([\s\S]+?)\s+in\s+([\s\S]+?)(?:\s+as\s+([\s\S]+?))?(?:\s+track\s+by\s+([\s\S]+?))?\s*$/);if(!match)throw ngRepeatMinErr("iexp","Expected expression in form of '_item_ in _collection_[ track by _id_]' but got '{0}'.",expression);var lhs=match[1],rhs=match[2],aliasAs=match[3],trackByExp=match[4];if(match=lhs.match(/^(?:(\s*[$\w]+)|\(\s*([$\w]+)\s*,\s*([$\w]+)\s*\))$/),!match)throw ngRepeatMinErr("iidexp","'_item_' in '_item_ in _collection_' should be an identifier or '(_key_, _value_)' expression, but got '{0}'.",lhs);var valueIdentifier=match[3]||match[1],keyIdentifier=match[2];if(aliasAs&&(!/^[$a-zA-Z_][$a-zA-Z0-9_]*$/.test(aliasAs)||/^(null|undefined|this|\$index|\$first|\$middle|\$last|\$even|\$odd|\$parent|\$root|\$id)$/.test(aliasAs)))throw ngRepeatMinErr("badident","alias '{0}' is invalid --- must be a valid JS identifier which is not a reserved name.",aliasAs);var trackByExpGetter,trackByIdExpFn,trackByIdArrayFn,trackByIdObjFn,hashFnLocals={$id:hashKey};return trackByExp?trackByExpGetter=$parse(trackByExp):(trackByIdArrayFn=function(key,value){return hashKey(value)},trackByIdObjFn=function(key){return key}),function($scope,$element,$attr,ctrl,$transclude){trackByExpGetter&&(trackByIdExpFn=function(key,value,index){
// assign key, value, and $index to the locals so that they can be used in hash functions
return keyIdentifier&&(hashFnLocals[keyIdentifier]=key),hashFnLocals[valueIdentifier]=value,hashFnLocals.$index=index,trackByExpGetter($scope,hashFnLocals)});
// Store a list of elements from previous run. This is a hash where key is the item from the
// iterator, and the value is objects with following properties.
//   - scope: bound scope
//   - element: previous element.
//   - index: position
//
// We are using no-proto object so that we don't need to guard against inherited props via
// hasOwnProperty.
var lastBlockMap=createMap();
//watch props
$scope.$watchCollection(rhs,function(collection){var index,length,// node that cloned nodes should be inserted after
// initialized to the comment node anchor
nextNode,collectionLength,key,value,// key/value of iteration
trackById,trackByIdFn,collectionKeys,block,// last object information {scope, element, id}
nextBlockOrder,elementsToRemove,previousNode=$element[0],
// Same as lastBlockMap but it has the current state. It will become the
// lastBlockMap on the next iteration.
nextBlockMap=createMap();if(aliasAs&&($scope[aliasAs]=collection),isArrayLike(collection))collectionKeys=collection,trackByIdFn=trackByIdExpFn||trackByIdArrayFn;else{trackByIdFn=trackByIdExpFn||trackByIdObjFn,
// if object, extract keys, in enumeration order, unsorted
collectionKeys=[];for(var itemKey in collection)hasOwnProperty.call(collection,itemKey)&&"$"!==itemKey.charAt(0)&&collectionKeys.push(itemKey)}
// locate existing items
for(collectionLength=collectionKeys.length,nextBlockOrder=new Array(collectionLength),index=0;index<collectionLength;index++)if(key=collection===collectionKeys?index:collectionKeys[index],value=collection[key],trackById=trackByIdFn(key,value,index),lastBlockMap[trackById])
// found previously seen block
block=lastBlockMap[trackById],delete lastBlockMap[trackById],nextBlockMap[trackById]=block,nextBlockOrder[index]=block;else{if(nextBlockMap[trackById])
// if collision detected. restore lastBlockMap and throw an error
throw forEach(nextBlockOrder,function(block){block&&block.scope&&(lastBlockMap[block.id]=block)}),ngRepeatMinErr("dupes","Duplicates in a repeater are not allowed. Use 'track by' expression to specify unique keys. Repeater: {0}, Duplicate key: {1}, Duplicate value: {2}",expression,trackById,value);
// new never before seen block
nextBlockOrder[index]={id:trackById,scope:void 0,clone:void 0},nextBlockMap[trackById]=!0}
// remove leftover items
for(var blockKey in lastBlockMap){if(block=lastBlockMap[blockKey],elementsToRemove=getBlockNodes(block.clone),$animate.leave(elementsToRemove),elementsToRemove[0].parentNode)
// if the element was not removed yet because of pending animation, mark it as deleted
// so that we can ignore it later
for(index=0,length=elementsToRemove.length;index<length;index++)elementsToRemove[index][NG_REMOVED]=!0;block.scope.$destroy()}
// we are not using forEach for perf reasons (trying to avoid #call)
for(index=0;index<collectionLength;index++)if(key=collection===collectionKeys?index:collectionKeys[index],value=collection[key],block=nextBlockOrder[index],block.scope){
// if we have already seen this object, then we need to reuse the
// associated scope/element
nextNode=previousNode;
// skip nodes that are already pending removal via leave animation
do nextNode=nextNode.nextSibling;while(nextNode&&nextNode[NG_REMOVED]);getBlockStart(block)!==nextNode&&
// existing item which got moved
$animate.move(getBlockNodes(block.clone),null,previousNode),previousNode=getBlockEnd(block),updateScope(block.scope,index,valueIdentifier,value,keyIdentifier,key,collectionLength)}else
// new item which we don't know about
$transclude(function(clone,scope){block.scope=scope;
// http://jsperf.com/clone-vs-createcomment
var endNode=ngRepeatEndComment.cloneNode(!1);clone[clone.length++]=endNode,$animate.enter(clone,null,previousNode),previousNode=endNode,
// Note: We only need the first/last node of the cloned nodes.
// However, we need to keep the reference to the jqlite wrapper as it might be changed later
// by a directive with templateUrl when its template arrives.
block.clone=clone,nextBlockMap[block.id]=block,updateScope(block.scope,index,valueIdentifier,value,keyIdentifier,key,collectionLength)});lastBlockMap=nextBlockMap})}}}}],NG_HIDE_CLASS="ng-hide",NG_HIDE_IN_PROGRESS_CLASS="ng-hide-animate",ngShowDirective=["$animate",function($animate){return{restrict:"A",multiElement:!0,link:function(scope,element,attr){scope.$watch(attr.ngShow,function(value){
// we're adding a temporary, animation-specific class for ng-hide since this way
// we can control when the element is actually displayed on screen without having
// to have a global/greedy CSS selector that breaks when other animations are run.
// Read: https://github.com/angular/angular.js/issues/9103#issuecomment-58335845
$animate[value?"removeClass":"addClass"](element,NG_HIDE_CLASS,{tempClasses:NG_HIDE_IN_PROGRESS_CLASS})})}}}],ngHideDirective=["$animate",function($animate){return{restrict:"A",multiElement:!0,link:function(scope,element,attr){scope.$watch(attr.ngHide,function(value){
// The comment inside of the ngShowDirective explains why we add and
// remove a temporary class for the show/hide animation
$animate[value?"addClass":"removeClass"](element,NG_HIDE_CLASS,{tempClasses:NG_HIDE_IN_PROGRESS_CLASS})})}}}],ngStyleDirective=ngDirective(function(scope,element,attr){scope.$watch(attr.ngStyle,function(newStyles,oldStyles){oldStyles&&newStyles!==oldStyles&&forEach(oldStyles,function(val,style){element.css(style,"")}),newStyles&&element.css(newStyles)},!0)}),ngSwitchDirective=["$animate","$compile",function($animate,$compile){return{require:"ngSwitch",
// asks for $scope to fool the BC controller module
controller:["$scope",function(){this.cases={}}],link:function(scope,element,attr,ngSwitchController){var watchExpr=attr.ngSwitch||attr.on,selectedTranscludes=[],selectedElements=[],previousLeaveAnimations=[],selectedScopes=[],spliceFactory=function(array,index){return function(response){response!==!1&&array.splice(index,1)}};scope.$watch(watchExpr,function(value){
// Start with the last, in case the array is modified during the loop
for(var i,ii;previousLeaveAnimations.length;)$animate.cancel(previousLeaveAnimations.pop());for(i=0,ii=selectedScopes.length;i<ii;++i){var selected=getBlockNodes(selectedElements[i].clone);selectedScopes[i].$destroy();var runner=previousLeaveAnimations[i]=$animate.leave(selected);runner.done(spliceFactory(previousLeaveAnimations,i))}selectedElements.length=0,selectedScopes.length=0,(selectedTranscludes=ngSwitchController.cases["!"+value]||ngSwitchController.cases["?"])&&forEach(selectedTranscludes,function(selectedTransclude){selectedTransclude.transclude(function(caseElement,selectedScope){selectedScopes.push(selectedScope);var anchor=selectedTransclude.element;caseElement[caseElement.length++]=$compile.$$createComment("end ngSwitchWhen");var block={clone:caseElement};selectedElements.push(block),$animate.enter(caseElement,anchor.parent(),anchor)})})})}}}],ngSwitchWhenDirective=ngDirective({transclude:"element",priority:1200,require:"^ngSwitch",multiElement:!0,link:function(scope,element,attrs,ctrl,$transclude){var cases=attrs.ngSwitchWhen.split(attrs.ngSwitchWhenSeparator).sort().filter(
// Filter duplicate cases
function(element,index,array){return array[index-1]!==element});forEach(cases,function(whenCase){ctrl.cases["!"+whenCase]=ctrl.cases["!"+whenCase]||[],ctrl.cases["!"+whenCase].push({transclude:$transclude,element:element})})}}),ngSwitchDefaultDirective=ngDirective({transclude:"element",priority:1200,require:"^ngSwitch",multiElement:!0,link:function(scope,element,attr,ctrl,$transclude){ctrl.cases["?"]=ctrl.cases["?"]||[],ctrl.cases["?"].push({transclude:$transclude,element:element})}}),ngTranscludeMinErr=minErr("ngTransclude"),ngTranscludeDirective=["$compile",function($compile){return{restrict:"EAC",terminal:!0,compile:function(tElement){
// Remove and cache any original content to act as a fallback
var fallbackLinkFn=$compile(tElement.contents());return tElement.empty(),function($scope,$element,$attrs,controller,$transclude){function ngTranscludeCloneAttachFn(clone,transcludedScope){clone.length&&notWhitespace(clone)?$element.append(clone):(useFallbackContent(),
// There is nothing linked against the transcluded scope since no content was available,
// so it should be safe to clean up the generated scope.
transcludedScope.$destroy())}function useFallbackContent(){
// Since this is the fallback content rather than the transcluded content,
// we link against the scope of this directive rather than the transcluded scope
fallbackLinkFn($scope,function(clone){$element.append(clone)})}function notWhitespace(nodes){for(var i=0,ii=nodes.length;i<ii;i++){var node=nodes[i];if(node.nodeType!==NODE_TYPE_TEXT||node.nodeValue.trim())return!0}}if(!$transclude)throw ngTranscludeMinErr("orphan","Illegal use of ngTransclude directive in the template! No parent directive that requires a transclusion found. Element: {0}",startingTag($element));
// If the attribute is of the form: `ng-transclude="ng-transclude"` then treat it like the default
$attrs.ngTransclude===$attrs.$attr.ngTransclude&&($attrs.ngTransclude="");var slotName=$attrs.ngTransclude||$attrs.ngTranscludeSlot;
// If the slot is required and no transclusion content is provided then this call will throw an error
$transclude(ngTranscludeCloneAttachFn,null,slotName),
// If the slot is optional and no transclusion content is provided then use the fallback content
slotName&&!$transclude.isSlotFilled(slotName)&&useFallbackContent()}}}}],scriptDirective=["$templateCache",function($templateCache){return{restrict:"E",terminal:!0,compile:function(element,attr){if("text/ng-template"===attr.type){var templateUrl=attr.id,text=element[0].text;$templateCache.put(templateUrl,text)}}}}],noopNgModelController={$setViewValue:noop,$render:noop},SelectController=["$element","$scope",/** @this */function($element,$scope){function scheduleRender(){renderScheduled||(renderScheduled=!0,$scope.$$postDigest(function(){renderScheduled=!1,self.ngModelCtrl.$render()}))}function scheduleViewValueUpdate(renderAfter){updateScheduled||(updateScheduled=!0,$scope.$$postDigest(function(){$scope.$$destroyed||(updateScheduled=!1,self.ngModelCtrl.$setViewValue(self.readValue()),renderAfter&&self.ngModelCtrl.$render())}))}var self=this,optionsMap=new NgMap;self.selectValueMap={},// Keys are the hashed values, values the original values
// If the ngModel doesn't get provided then provide a dummy noop version to prevent errors
self.ngModelCtrl=noopNgModelController,self.multiple=!1,
// The "unknown" option is one that is prepended to the list if the viewValue
// does not match any of the options. When it is rendered the value of the unknown
// option is '? XXX ?' where XXX is the hashKey of the value that is not known.
//
// We can't just jqLite('<option>') since jqLite is not smart enough
// to create it in <select> and IE barfs otherwise.
self.unknownOption=jqLite(window.document.createElement("option")),
// The empty option is an option with the value '' that te application developer can
// provide inside the select. When the model changes to a value that doesn't match an option,
// it is selected - so if an empty option is provided, no unknown option is generated.
// However, the empty option is not removed when the model matches an option. It is always selectable
// and indicates that a "null" selection has been made.
self.hasEmptyOption=!1,self.emptyOption=void 0,self.renderUnknownOption=function(val){var unknownVal=self.generateUnknownOptionValue(val);self.unknownOption.val(unknownVal),$element.prepend(self.unknownOption),setOptionSelectedStatus(self.unknownOption,!0),$element.val(unknownVal)},self.updateUnknownOption=function(val){var unknownVal=self.generateUnknownOptionValue(val);self.unknownOption.val(unknownVal),setOptionSelectedStatus(self.unknownOption,!0),$element.val(unknownVal)},self.generateUnknownOptionValue=function(val){return"? "+hashKey(val)+" ?"},self.removeUnknownOption=function(){self.unknownOption.parent()&&self.unknownOption.remove()},self.selectEmptyOption=function(){self.emptyOption&&($element.val(""),setOptionSelectedStatus(self.emptyOption,!0))},self.unselectEmptyOption=function(){self.hasEmptyOption&&self.emptyOption.removeAttr("selected")},$scope.$on("$destroy",function(){
// disable unknown option so that we don't do work when the whole select is being destroyed
self.renderUnknownOption=noop}),
// Read the value of the select control, the implementation of this changes depending
// upon whether the select can have multiple values and whether ngOptions is at work.
self.readValue=function(){var val=$element.val(),realVal=val in self.selectValueMap?self.selectValueMap[val]:val;return self.hasOption(realVal)?realVal:null},
// Write the value to the select control, the implementation of this changes depending
// upon whether the select can have multiple values and whether ngOptions is at work.
self.writeValue=function(value){
// Make sure to remove the selected attribute from the previously selected option
// Otherwise, screen readers might get confused
var currentlySelectedOption=$element[0].options[$element[0].selectedIndex];if(currentlySelectedOption&&setOptionSelectedStatus(jqLite(currentlySelectedOption),!1),self.hasOption(value)){self.removeUnknownOption();var hashedVal=hashKey(value);$element.val(hashedVal in self.selectValueMap?hashedVal:value);
// Set selected attribute and property on selected option for screen readers
var selectedOption=$element[0].options[$element[0].selectedIndex];setOptionSelectedStatus(jqLite(selectedOption),!0)}else null==value&&self.emptyOption?(self.removeUnknownOption(),self.selectEmptyOption()):self.unknownOption.parent().length?self.updateUnknownOption(value):self.renderUnknownOption(value)},
// Tell the select control that an option, with the given value, has been added
self.addOption=function(value,element){
// Skip comment nodes, as they only pollute the `optionsMap`
if(element[0].nodeType!==NODE_TYPE_COMMENT){assertNotHasOwnProperty(value,'"option value"'),""===value&&(self.hasEmptyOption=!0,self.emptyOption=element);var count=optionsMap.get(value)||0;optionsMap.set(value,count+1),
// Only render at the end of a digest. This improves render performance when many options
// are added during a digest and ensures all relevant options are correctly marked as selected
scheduleRender()}},
// Tell the select control that an option, with the given value, has been removed
self.removeOption=function(value){var count=optionsMap.get(value);count&&(1===count?(optionsMap["delete"](value),""===value&&(self.hasEmptyOption=!1,self.emptyOption=void 0)):optionsMap.set(value,count-1))},
// Check whether the select control has an option matching the given value
self.hasOption=function(value){return!!optionsMap.get(value)};var renderScheduled=!1,updateScheduled=!1;self.registerOption=function(optionScope,optionElement,optionAttrs,interpolateValueFn,interpolateTextFn){if(optionAttrs.$attr.ngValue){
// The value attribute is set by ngValue
var oldVal,hashedVal=NaN;optionAttrs.$observe("value",function(newVal){var removal,previouslySelected=optionElement.prop("selected");isDefined(hashedVal)&&(self.removeOption(oldVal),delete self.selectValueMap[hashedVal],removal=!0),hashedVal=hashKey(newVal),oldVal=newVal,self.selectValueMap[hashedVal]=newVal,self.addOption(newVal,optionElement),
// Set the attribute directly instead of using optionAttrs.$set - this stops the observer
// from firing a second time. Other $observers on value will also get the result of the
// ngValue expression, not the hashed value
optionElement.attr("value",hashedVal),removal&&previouslySelected&&scheduleViewValueUpdate()})}else interpolateValueFn?
// The value attribute is interpolated
optionAttrs.$observe("value",function(newVal){
// This method is overwritten in ngOptions and has side-effects!
self.readValue();var removal,previouslySelected=optionElement.prop("selected");isDefined(oldVal)&&(self.removeOption(oldVal),removal=!0),oldVal=newVal,self.addOption(newVal,optionElement),removal&&previouslySelected&&scheduleViewValueUpdate()}):interpolateTextFn?
// The text content is interpolated
optionScope.$watch(interpolateTextFn,function(newVal,oldVal){optionAttrs.$set("value",newVal);var previouslySelected=optionElement.prop("selected");oldVal!==newVal&&self.removeOption(oldVal),self.addOption(newVal,optionElement),oldVal&&previouslySelected&&scheduleViewValueUpdate()}):
// The value attribute is static
self.addOption(optionAttrs.value,optionElement);optionAttrs.$observe("disabled",function(newVal){
// Since model updates will also select disabled options (like ngOptions),
// we only have to handle options becoming disabled, not enabled
("true"===newVal||newVal&&optionElement.prop("selected"))&&(self.multiple?scheduleViewValueUpdate(!0):(self.ngModelCtrl.$setViewValue(null),self.ngModelCtrl.$render()))}),optionElement.on("$destroy",function(){var currentValue=self.readValue(),removeValue=optionAttrs.value;self.removeOption(removeValue),scheduleRender(),(self.multiple&&currentValue&&currentValue.indexOf(removeValue)!==-1||currentValue===removeValue)&&
// When multiple (selected) options are destroyed at the same time, we don't want
// to run a model update for each of them. Instead, run a single update in the $$postDigest
scheduleViewValueUpdate(!0)})}}],selectDirective=function(){function selectPreLink(scope,element,attr,ctrls){var selectCtrl=ctrls[0],ngModelCtrl=ctrls[1];
// if ngModel is not defined, we don't need to do anything but set the registerOption
// function to noop, so options don't get added internally
if(!ngModelCtrl)return void(selectCtrl.registerOption=noop);
// If the select allows multiple values then we need to modify how we read and write
// values from and to the control; also what it means for the value to be empty and
// we have to add an extra watch since ngModel doesn't work well with arrays - it
// doesn't trigger rendering if only an item in the array changes.
if(selectCtrl.ngModelCtrl=ngModelCtrl,
// When the selected item(s) changes we delegate getting the value of the select control
// to the `readValue` method, which can be changed if the select can have multiple
// selected values or if the options are being generated by `ngOptions`
element.on("change",function(){selectCtrl.removeUnknownOption(),scope.$apply(function(){ngModelCtrl.$setViewValue(selectCtrl.readValue())})}),attr.multiple){selectCtrl.multiple=!0,
// Read value now needs to check each option to see if it is selected
selectCtrl.readValue=function(){var array=[];return forEach(element.find("option"),function(option){if(option.selected&&!option.disabled){var val=option.value;array.push(val in selectCtrl.selectValueMap?selectCtrl.selectValueMap[val]:val)}}),array},
// Write value now needs to set the selected property of each matching option
selectCtrl.writeValue=function(value){forEach(element.find("option"),function(option){var shouldBeSelected=!!value&&(includes(value,option.value)||includes(value,selectCtrl.selectValueMap[option.value])),currentlySelected=option.selected;
// IE and Edge, adding options to the selection via shift+click/UP/DOWN,
// will de-select already selected options if "selected" on those options was set
// more than once (i.e. when the options were already selected)
// So we only modify the selected property if neccessary.
// Note: this behavior cannot be replicated via unit tests because it only shows in the
// actual user interface.
shouldBeSelected!==currentlySelected&&setOptionSelectedStatus(jqLite(option),shouldBeSelected)})};
// we have to do it on each watch since ngModel watches reference, but
// we need to work of an array, so we need to see if anything was inserted/removed
var lastView,lastViewRef=NaN;scope.$watch(function(){lastViewRef!==ngModelCtrl.$viewValue||equals(lastView,ngModelCtrl.$viewValue)||(lastView=shallowCopy(ngModelCtrl.$viewValue),ngModelCtrl.$render()),lastViewRef=ngModelCtrl.$viewValue}),
// If we are a multiple select then value is now a collection
// so the meaning of $isEmpty changes
ngModelCtrl.$isEmpty=function(value){return!value||0===value.length}}}function selectPostLink(scope,element,attrs,ctrls){
// if ngModel is not defined, we don't need to do anything
var ngModelCtrl=ctrls[1];if(ngModelCtrl){var selectCtrl=ctrls[0];
// We delegate rendering to the `writeValue` method, which can be changed
// if the select can have multiple selected values or if the options are being
// generated by `ngOptions`.
// This must be done in the postLink fn to prevent $render to be called before
// all nodes have been linked correctly.
ngModelCtrl.$render=function(){selectCtrl.writeValue(ngModelCtrl.$viewValue)}}}return{restrict:"E",require:["select","?ngModel"],controller:SelectController,priority:1,link:{pre:selectPreLink,post:selectPostLink}}},optionDirective=["$interpolate",function($interpolate){return{restrict:"E",priority:100,compile:function(element,attr){var interpolateValueFn,interpolateTextFn;
// If the value attribute is defined, check if it contains an interpolation
// If the value attribute is not defined then we fall back to the
// text content of the option element, which may be interpolated
return isDefined(attr.ngValue)||(isDefined(attr.value)?interpolateValueFn=$interpolate(attr.value,!0):(interpolateTextFn=$interpolate(element.text(),!0),interpolateTextFn||attr.$set("value",element.text()))),function(scope,element,attr){
// This is an optimization over using ^^ since we don't want to have to search
// all the way to the root of the DOM for every single option element
var selectCtrlName="$selectController",parent=element.parent(),selectCtrl=parent.data(selectCtrlName)||parent.parent().data(selectCtrlName);// in case we are in optgroup
selectCtrl&&selectCtrl.registerOption(scope,element,attr,interpolateValueFn,interpolateTextFn)}}}}],requiredDirective=function(){return{restrict:"A",require:"?ngModel",link:function(scope,elm,attr,ctrl){ctrl&&(attr.required=!0,// force truthy in case we are on non input element
ctrl.$validators.required=function(modelValue,viewValue){return!attr.required||!ctrl.$isEmpty(viewValue)},attr.$observe("required",function(){ctrl.$validate()}))}}},patternDirective=function(){return{restrict:"A",require:"?ngModel",link:function(scope,elm,attr,ctrl){if(ctrl){var regexp,patternExp=attr.ngPattern||attr.pattern;attr.$observe("pattern",function(regex){if(isString(regex)&&regex.length>0&&(regex=new RegExp("^"+regex+"$")),regex&&!regex.test)throw minErr("ngPattern")("noregexp","Expected {0} to be a RegExp but was {1}. Element: {2}",patternExp,regex,startingTag(elm));regexp=regex||void 0,ctrl.$validate()}),ctrl.$validators.pattern=function(modelValue,viewValue){
// HTML5 pattern constraint validates the input value, so we validate the viewValue
return ctrl.$isEmpty(viewValue)||isUndefined(regexp)||regexp.test(viewValue)}}}}},maxlengthDirective=function(){return{restrict:"A",require:"?ngModel",link:function(scope,elm,attr,ctrl){if(ctrl){var maxlength=-1;attr.$observe("maxlength",function(value){var intVal=toInt(value);maxlength=isNumberNaN(intVal)?-1:intVal,ctrl.$validate()}),ctrl.$validators.maxlength=function(modelValue,viewValue){return maxlength<0||ctrl.$isEmpty(viewValue)||viewValue.length<=maxlength}}}}},minlengthDirective=function(){return{restrict:"A",require:"?ngModel",link:function(scope,elm,attr,ctrl){if(ctrl){var minlength=0;attr.$observe("minlength",function(value){minlength=toInt(value)||0,ctrl.$validate()}),ctrl.$validators.minlength=function(modelValue,viewValue){return ctrl.$isEmpty(viewValue)||viewValue.length>=minlength}}}}};
// AngularJS is already loaded, so we can return here...
// try to bind to jquery now so that one can write jqLite(fn)
// but we will rebind on bootstrap again.
return window.angular.bootstrap?void(window.console&&console.log("WARNING: Tried to load angular more than once.")):(bindJQuery(),publishExternalAPI(angular),angular.module("ngLocale",[],["$provide",function($provide){function getDecimals(n){n+="";var i=n.indexOf(".");return i==-1?0:n.length-i-1}function getVF(n,opt_precision){var v=opt_precision;void 0===v&&(v=Math.min(getDecimals(n),3));var base=Math.pow(10,v),f=(n*base|0)%base;return{v:v,f:f}}var PLURAL_CATEGORY={ZERO:"zero",ONE:"one",TWO:"two",FEW:"few",MANY:"many",OTHER:"other"};$provide.value("$locale",{DATETIME_FORMATS:{AMPMS:["AM","PM"],DAY:["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"],ERANAMES:["Before Christ","Anno Domini"],ERAS:["BC","AD"],FIRSTDAYOFWEEK:6,MONTH:["January","February","March","April","May","June","July","August","September","October","November","December"],SHORTDAY:["Sun","Mon","Tue","Wed","Thu","Fri","Sat"],SHORTMONTH:["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"],STANDALONEMONTH:["January","February","March","April","May","June","July","August","September","October","November","December"],WEEKENDRANGE:[5,6],fullDate:"EEEE, MMMM d, y",longDate:"MMMM d, y",medium:"MMM d, y h:mm:ss a",mediumDate:"MMM d, y",mediumTime:"h:mm:ss a","short":"M/d/yy h:mm a",shortDate:"M/d/yy",shortTime:"h:mm a"},NUMBER_FORMATS:{CURRENCY_SYM:"$",DECIMAL_SEP:".",GROUP_SEP:",",PATTERNS:[{gSize:3,lgSize:3,maxFrac:3,minFrac:0,minInt:1,negPre:"-",negSuf:"",posPre:"",posSuf:""},{gSize:3,lgSize:3,maxFrac:2,minFrac:2,minInt:1,negPre:"-¤",negSuf:"",posPre:"¤",posSuf:""}]},id:"en-us",localeID:"en_US",pluralCat:function(n,opt_precision){var i=0|n,vf=getVF(n,opt_precision);return 1==i&&0==vf.v?PLURAL_CATEGORY.ONE:PLURAL_CATEGORY.OTHER}})}]),void jqLite(function(){angularInit(window.document,bootstrap)}))}(window),!window.angular.$$csp().noInlineStyle&&window.angular.element(document.head).prepend('<style type="text/css">@charset "UTF-8";[ng\\:cloak],[ng-cloak],[data-ng-cloak],[x-ng-cloak],.ng-cloak,.x-ng-cloak,.ng-hide:not(.ng-hide-animate){display:none !important;}ng\\:form{display:block;}.ng-animate-shim{visibility:hidden;}.ng-anchor{position:absolute;}</style>'),/**
 * @license AngularJS v1.6.4
 * (c) 2010-2017 Google, Inc. http://angularjs.org
 * License: MIT
 */
function(window,angular){"use strict";function isValidDottedPath(path){return null!=path&&""!==path&&"hasOwnProperty"!==path&&MEMBER_NAME_REGEX.test("."+path)}function lookupDottedPath(obj,path){if(!isValidDottedPath(path))throw $resourceMinErr("badmember",'Dotted member path "@{0}" is invalid.',path);for(var keys=path.split("."),i=0,ii=keys.length;i<ii&&angular.isDefined(obj);i++){var key=keys[i];obj=null!==obj?obj[key]:void 0}return obj}/**
 * Create a shallow copy of an object and clear other fields from the destination
 */
function shallowClearAndCopy(src,dst){dst=dst||{},angular.forEach(dst,function(value,key){delete dst[key]});for(var key in src)!src.hasOwnProperty(key)||"$"===key.charAt(0)&&"$"===key.charAt(1)||(dst[key]=src[key]);return dst}var $resourceMinErr=angular.$$minErr("$resource"),MEMBER_NAME_REGEX=/^(\.[a-zA-Z_$@][0-9a-zA-Z_$@]*)+$/;/**
 * @ngdoc module
 * @name ngResource
 * @description
 *
 * # ngResource
 *
 * The `ngResource` module provides interaction support with RESTful services
 * via the $resource service.
 *
 *
 * <div doc-module-components="ngResource"></div>
 *
 * See {@link ngResource.$resourceProvider} and {@link ngResource.$resource} for usage.
 */
/**
 * @ngdoc provider
 * @name $resourceProvider
 *
 * @description
 *
 * Use `$resourceProvider` to change the default behavior of the {@link ngResource.$resource}
 * service.
 *
 * ## Dependencies
 * Requires the {@link ngResource } module to be installed.
 *
 */
/**
 * @ngdoc service
 * @name $resource
 * @requires $http
 * @requires ng.$log
 * @requires $q
 * @requires ng.$timeout
 *
 * @description
 * A factory which creates a resource object that lets you interact with
 * [RESTful](http://en.wikipedia.org/wiki/Representational_State_Transfer) server-side data sources.
 *
 * The returned resource object has action methods which provide high-level behaviors without
 * the need to interact with the low level {@link ng.$http $http} service.
 *
 * Requires the {@link ngResource `ngResource`} module to be installed.
 *
 * By default, trailing slashes will be stripped from the calculated URLs,
 * which can pose problems with server backends that do not expect that
 * behavior.  This can be disabled by configuring the `$resourceProvider` like
 * this:
 *
 * ```js
     app.config(['$resourceProvider', function($resourceProvider) {
       // Don't strip trailing slashes from calculated URLs
       $resourceProvider.defaults.stripTrailingSlashes = false;
     }]);
 * ```
 *
 * @param {string} url A parameterized URL template with parameters prefixed by `:` as in
 *   `/user/:username`. If you are using a URL with a port number (e.g.
 *   `http://example.com:8080/api`), it will be respected.
 *
 *   If you are using a url with a suffix, just add the suffix, like this:
 *   `$resource('http://example.com/resource.json')` or `$resource('http://example.com/:id.json')`
 *   or even `$resource('http://example.com/resource/:resource_id.:format')`
 *   If the parameter before the suffix is empty, :resource_id in this case, then the `/.` will be
 *   collapsed down to a single `.`.  If you need this sequence to appear and not collapse then you
 *   can escape it with `/\.`.
 *
 * @param {Object=} paramDefaults Default values for `url` parameters. These can be overridden in
 *   `actions` methods. If a parameter value is a function, it will be called every time
 *   a param value needs to be obtained for a request (unless the param was overridden). The function
 *   will be passed the current data value as an argument.
 *
 *   Each key value in the parameter object is first bound to url template if present and then any
 *   excess keys are appended to the url search query after the `?`.
 *
 *   Given a template `/path/:verb` and parameter `{verb:'greet', salutation:'Hello'}` results in
 *   URL `/path/greet?salutation=Hello`.
 *
 *   If the parameter value is prefixed with `@`, then the value for that parameter will be
 *   extracted from the corresponding property on the `data` object (provided when calling actions
 *   with a request body).
 *   For example, if the `defaultParam` object is `{someParam: '@someProp'}` then the value of
 *   `someParam` will be `data.someProp`.
 *   Note that the parameter will be ignored, when calling a "GET" action method (i.e. an action
 *   method that does not accept a request body)
 *
 * @param {Object.<Object>=} actions Hash with declaration of custom actions that will be available
 *   in addition to the default set of resource actions (see below). If a custom action has the same
 *   key as a default action (e.g. `save`), then the default action will be *overwritten*, and not
 *   extended.
 *
 *   The declaration should be created in the format of {@link ng.$http#usage $http.config}:
 *
 *       {action1: {method:?, params:?, isArray:?, headers:?, ...},
 *        action2: {method:?, params:?, isArray:?, headers:?, ...},
 *        ...}
 *
 *   Where:
 *
 *   - **`action`** – {string} – The name of action. This name becomes the name of the method on
 *     your resource object.
 *   - **`method`** – {string} – Case insensitive HTTP method (e.g. `GET`, `POST`, `PUT`,
 *     `DELETE`, `JSONP`, etc).
 *   - **`params`** – {Object=} – Optional set of pre-bound parameters for this action. If any of
 *     the parameter value is a function, it will be called every time when a param value needs to
 *     be obtained for a request (unless the param was overridden). The function will be passed the
 *     current data value as an argument.
 *   - **`url`** – {string} – action specific `url` override. The url templating is supported just
 *     like for the resource-level urls.
 *   - **`isArray`** – {boolean=} – If true then the returned object for this action is an array,
 *     see `returns` section.
 *   - **`transformRequest`** –
 *     `{function(data, headersGetter)|Array.<function(data, headersGetter)>}` –
 *     transform function or an array of such functions. The transform function takes the http
 *     request body and headers and returns its transformed (typically serialized) version.
 *     By default, transformRequest will contain one function that checks if the request data is
 *     an object and serializes it using `angular.toJson`. To prevent this behavior, set
 *     `transformRequest` to an empty array: `transformRequest: []`
 *   - **`transformResponse`** –
 *     `{function(data, headersGetter, status)|Array.<function(data, headersGetter, status)>}` –
 *     transform function or an array of such functions. The transform function takes the http
 *     response body, headers and status and returns its transformed (typically deserialized)
 *     version.
 *     By default, transformResponse will contain one function that checks if the response looks
 *     like a JSON string and deserializes it using `angular.fromJson`. To prevent this behavior,
 *     set `transformResponse` to an empty array: `transformResponse: []`
 *   - **`cache`** – `{boolean|Cache}` – If true, a default $http cache will be used to cache the
 *     GET request, otherwise if a cache instance built with
 *     {@link ng.$cacheFactory $cacheFactory} is supplied, this cache will be used for
 *     caching.
 *   - **`timeout`** – `{number}` – timeout in milliseconds.<br />
 *     **Note:** In contrast to {@link ng.$http#usage $http.config}, {@link ng.$q promises} are
 *     **not** supported in $resource, because the same value would be used for multiple requests.
 *     If you are looking for a way to cancel requests, you should use the `cancellable` option.
 *   - **`cancellable`** – `{boolean}` – if set to true, the request made by a "non-instance" call
 *     will be cancelled (if not already completed) by calling `$cancelRequest()` on the call's
 *     return value. Calling `$cancelRequest()` for a non-cancellable or an already
 *     completed/cancelled request will have no effect.<br />
 *   - **`withCredentials`** - `{boolean}` - whether to set the `withCredentials` flag on the
 *     XHR object. See
 *     [requests with credentials](https://developer.mozilla.org/en/http_access_control#section_5)
 *     for more information.
 *   - **`responseType`** - `{string}` - see
 *     [requestType](https://developer.mozilla.org/en-US/docs/DOM/XMLHttpRequest#responseType).
 *   - **`interceptor`** - `{Object=}` - The interceptor object has two optional methods -
 *     `response` and `responseError`. Both `response` and `responseError` interceptors get called
 *     with `http response` object. See {@link ng.$http $http interceptors}.
 *   - **`hasBody`** - `{boolean}` - allows to specify if a request body should be included or not.
 *     If not specified only POST, PUT and PATCH requests will have a body.
 *
 * @param {Object} options Hash with custom settings that should extend the
 *   default `$resourceProvider` behavior.  The supported options are:
 *
 *   - **`stripTrailingSlashes`** – {boolean} – If true then the trailing
 *   slashes from any calculated URL will be stripped. (Defaults to true.)
 *   - **`cancellable`** – {boolean} – If true, the request made by a "non-instance" call will be
 *   cancelled (if not already completed) by calling `$cancelRequest()` on the call's return value.
 *   This can be overwritten per action. (Defaults to false.)
 *
 * @returns {Object} A resource "class" object with methods for the default set of resource actions
 *   optionally extended with custom `actions`. The default set contains these actions:
 *   ```js
 *   { 'get':    {method:'GET'},
 *     'save':   {method:'POST'},
 *     'query':  {method:'GET', isArray:true},
 *     'remove': {method:'DELETE'},
 *     'delete': {method:'DELETE'} };
 *   ```
 *
 *   Calling these methods invoke an {@link ng.$http} with the specified http method,
 *   destination and parameters. When the data is returned from the server then the object is an
 *   instance of the resource class. The actions `save`, `remove` and `delete` are available on it
 *   as  methods with the `$` prefix. This allows you to easily perform CRUD operations (create,
 *   read, update, delete) on server-side data like this:
 *   ```js
 *   var User = $resource('/user/:userId', {userId:'@id'});
 *   var user = User.get({userId:123}, function() {
 *     user.abc = true;
 *     user.$save();
 *   });
 *   ```
 *
 *   It is important to realize that invoking a $resource object method immediately returns an
 *   empty reference (object or array depending on `isArray`). Once the data is returned from the
 *   server the existing reference is populated with the actual data. This is a useful trick since
 *   usually the resource is assigned to a model which is then rendered by the view. Having an empty
 *   object results in no rendering, once the data arrives from the server then the object is
 *   populated with the data and the view automatically re-renders itself showing the new data. This
 *   means that in most cases one never has to write a callback function for the action methods.
 *
 *   The action methods on the class object or instance object can be invoked with the following
 *   parameters:
 *
 *   - "class" actions without a body: `Resource.action([parameters], [success], [error])`
 *   - "class" actions with a body: `Resource.action([parameters], postData, [success], [error])`
 *   - instance actions: `instance.$action([parameters], [success], [error])`
 *
 *
 *   When calling instance methods, the instance itself is used as the request body (if the action
 *   should have a body). By default, only actions using `POST`, `PUT` or `PATCH` have request
 *   bodies, but you can use the `hasBody` configuration option to specify whether an action
 *   should have a body or not (regardless of its HTTP method).
 *
 *
 *   Success callback is called with (value (Object|Array), responseHeaders (Function),
 *   status (number), statusText (string)) arguments, where the value is the populated resource
 *   instance or collection object. The error callback is called with (httpResponse) argument.
 *
 *   Class actions return empty instance (with additional properties below).
 *   Instance actions return promise of the action.
 *
 *   The Resource instances and collections have these additional properties:
 *
 *   - `$promise`: the {@link ng.$q promise} of the original server interaction that created this
 *     instance or collection.
 *
 *     On success, the promise is resolved with the same resource instance or collection object,
 *     updated with data from server. This makes it easy to use in
 *     {@link ngRoute.$routeProvider resolve section of $routeProvider.when()} to defer view
 *     rendering until the resource(s) are loaded.
 *
 *     On failure, the promise is rejected with the {@link ng.$http http response} object, without
 *     the `resource` property.
 *
 *     If an interceptor object was provided, the promise will instead be resolved with the value
 *     returned by the interceptor.
 *
 *   - `$resolved`: `true` after first server interaction is completed (either with success or
 *      rejection), `false` before that. Knowing if the Resource has been resolved is useful in
 *      data-binding.
 *
 *   The Resource instances and collections have these additional methods:
 *
 *   - `$cancelRequest`: If there is a cancellable, pending request related to the instance or
 *      collection, calling this method will abort the request.
 *
 *   The Resource instances have these additional methods:
 *
 *   - `toJSON`: It returns a simple object without any of the extra properties added as part of
 *     the Resource API. This object can be serialized through {@link angular.toJson} safely
 *     without attaching Angular-specific fields. Notice that `JSON.stringify` (and
 *     `angular.toJson`) automatically use this method when serializing a Resource instance
 *     (see [MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify#toJSON%28%29_behavior)).
 *
 * @example
 *
 * # Credit card resource
 *
 * ```js
     // Define CreditCard class
     var CreditCard = $resource('/user/:userId/card/:cardId',
      {userId:123, cardId:'@id'}, {
       charge: {method:'POST', params:{charge:true}}
      });

     // We can retrieve a collection from the server
     var cards = CreditCard.query(function() {
       // GET: /user/123/card
       // server returns: [ {id:456, number:'1234', name:'Smith'} ];

       var card = cards[0];
       // each item is an instance of CreditCard
       expect(card instanceof CreditCard).toEqual(true);
       card.name = "J. Smith";
       // non GET methods are mapped onto the instances
       card.$save();
       // POST: /user/123/card/456 {id:456, number:'1234', name:'J. Smith'}
       // server returns: {id:456, number:'1234', name: 'J. Smith'};

       // our custom method is mapped as well.
       card.$charge({amount:9.99});
       // POST: /user/123/card/456?amount=9.99&charge=true {id:456, number:'1234', name:'J. Smith'}
     });

     // we can create an instance as well
     var newCard = new CreditCard({number:'0123'});
     newCard.name = "Mike Smith";
     newCard.$save();
     // POST: /user/123/card {number:'0123', name:'Mike Smith'}
     // server returns: {id:789, number:'0123', name: 'Mike Smith'};
     expect(newCard.id).toEqual(789);
 * ```
 *
 * The object returned from this function execution is a resource "class" which has "static" method
 * for each action in the definition.
 *
 * Calling these methods invoke `$http` on the `url` template with the given `method`, `params` and
 * `headers`.
 *
 * @example
 *
 * # User resource
 *
 * When the data is returned from the server then the object is an instance of the resource type and
 * all of the non-GET methods are available with `$` prefix. This allows you to easily support CRUD
 * operations (create, read, update, delete) on server-side data.

   ```js
     var User = $resource('/user/:userId', {userId:'@id'});
     User.get({userId:123}, function(user) {
       user.abc = true;
       user.$save();
     });
   ```
 *
 * It's worth noting that the success callback for `get`, `query` and other methods gets passed
 * in the response that came from the server as well as $http header getter function, so one
 * could rewrite the above example and get access to http headers as:
 *
   ```js
     var User = $resource('/user/:userId', {userId:'@id'});
     User.get({userId:123}, function(user, getResponseHeaders){
       user.abc = true;
       user.$save(function(user, putResponseHeaders) {
         //user => saved user object
         //putResponseHeaders => $http header getter
       });
     });
   ```
 *
 * You can also access the raw `$http` promise via the `$promise` property on the object returned
 *
   ```
     var User = $resource('/user/:userId', {userId:'@id'});
     User.get({userId:123})
         .$promise.then(function(user) {
           $scope.user = user;
         });
   ```
 *
 * @example
 *
 * # Creating a custom 'PUT' request
 *
 * In this example we create a custom method on our resource to make a PUT request
 * ```js
 *    var app = angular.module('app', ['ngResource', 'ngRoute']);
 *
 *    // Some APIs expect a PUT request in the format URL/object/ID
 *    // Here we are creating an 'update' method
 *    app.factory('Notes', ['$resource', function($resource) {
 *    return $resource('/notes/:id', null,
 *        {
 *            'update': { method:'PUT' }
 *        });
 *    }]);
 *
 *    // In our controller we get the ID from the URL using ngRoute and $routeParams
 *    // We pass in $routeParams and our Notes factory along with $scope
 *    app.controller('NotesCtrl', ['$scope', '$routeParams', 'Notes',
                                      function($scope, $routeParams, Notes) {
 *    // First get a note object from the factory
 *    var note = Notes.get({ id:$routeParams.id });
 *    $id = note.id;
 *
 *    // Now call update passing in the ID first then the object you are updating
 *    Notes.update({ id:$id }, note);
 *
 *    // This will PUT /notes/ID with the note object in the request payload
 *    }]);
 * ```
 *
 * @example
 *
 * # Cancelling requests
 *
 * If an action's configuration specifies that it is cancellable, you can cancel the request related
 * to an instance or collection (as long as it is a result of a "non-instance" call):
 *
   ```js
     // ...defining the `Hotel` resource...
     var Hotel = $resource('/api/hotel/:id', {id: '@id'}, {
       // Let's make the `query()` method cancellable
       query: {method: 'get', isArray: true, cancellable: true}
     });

     // ...somewhere in the PlanVacationController...
     ...
     this.onDestinationChanged = function onDestinationChanged(destination) {
       // We don't care about any pending request for hotels
       // in a different destination any more
       this.availableHotels.$cancelRequest();

       // Let's query for hotels in '<destination>'
       // (calls: /api/hotel?location=<destination>)
       this.availableHotels = Hotel.query({location: destination});
     };
   ```
 *
 */
angular.module("ngResource",["ng"]).info({angularVersion:"1.6.4"}).provider("$resource",function(){var PROTOCOL_AND_IPV6_REGEX=/^https?:\/\/\[[^\]]*][^\/]*/,provider=this;/**
     * @ngdoc property
     * @name $resourceProvider#defaults
     * @description
     * Object containing default options used when creating `$resource` instances.
     *
     * The default values satisfy a wide range of usecases, but you may choose to overwrite any of
     * them to further customize your instances. The available properties are:
     *
     * - **stripTrailingSlashes** – `{boolean}` – If true, then the trailing slashes from any
     *   calculated URL will be stripped.<br />
     *   (Defaults to true.)
     * - **cancellable** – `{boolean}` – If true, the request made by a "non-instance" call will be
     *   cancelled (if not already completed) by calling `$cancelRequest()` on the call's return
     *   value. For more details, see {@link ngResource.$resource}. This can be overwritten per
     *   resource class or action.<br />
     *   (Defaults to false.)
     * - **actions** - `{Object.<Object>}` - A hash with default actions declarations. Actions are
     *   high-level methods corresponding to RESTful actions/methods on resources. An action may
     *   specify what HTTP method to use, what URL to hit, if the return value will be a single
     *   object or a collection (array) of objects etc. For more details, see
     *   {@link ngResource.$resource}. The actions can also be enhanced or overwritten per resource
     *   class.<br />
     *   The default actions are:
     *   ```js
     *   {
     *     get: {method: 'GET'},
     *     save: {method: 'POST'},
     *     query: {method: 'GET', isArray: true},
     *     remove: {method: 'DELETE'},
     *     delete: {method: 'DELETE'}
     *   }
     *   ```
     *
     * #### Example
     *
     * For example, you can specify a new `update` action that uses the `PUT` HTTP verb:
     *
     * ```js
     *   angular.
     *     module('myApp').
     *     config(['$resourceProvider', function ($resourceProvider) {
     *       $resourceProvider.defaults.actions.update = {
     *         method: 'PUT'
     *       };
     *     });
     * ```
     *
     * Or you can even overwrite the whole `actions` list and specify your own:
     *
     * ```js
     *   angular.
     *     module('myApp').
     *     config(['$resourceProvider', function ($resourceProvider) {
     *       $resourceProvider.defaults.actions = {
     *         create: {method: 'POST'},
     *         get:    {method: 'GET'},
     *         getAll: {method: 'GET', isArray:true},
     *         update: {method: 'PUT'},
     *         delete: {method: 'DELETE'}
     *       };
     *     });
     * ```
     *
     */
this.defaults={
// Strip slashes by default
stripTrailingSlashes:!0,
// Make non-instance requests cancellable (via `$cancelRequest()`)
cancellable:!1,
// Default actions configuration
actions:{get:{method:"GET"},save:{method:"POST"},query:{method:"GET",isArray:!0},remove:{method:"DELETE"},"delete":{method:"DELETE"}}},this.$get=["$http","$log","$q","$timeout",function($http,$log,$q,$timeout){function Route(template,defaults){this.template=template,this.defaults=extend({},provider.defaults,defaults),this.urlParams={}}function resourceFactory(url,paramDefaults,actions,options){function extractParams(data,actionParams){var ids={};return actionParams=extend({},paramDefaults,actionParams),forEach(actionParams,function(value,key){isFunction(value)&&(value=value(data)),ids[key]=value&&value.charAt&&"@"===value.charAt(0)?lookupDottedPath(data,value.substr(1)):value}),ids}function defaultResponseInterceptor(response){return response.resource}function Resource(value){shallowClearAndCopy(value||{},this)}var route=new Route(url,options);return actions=extend({},provider.defaults.actions,actions),Resource.prototype.toJSON=function(){var data=extend({},this);return delete data.$promise,delete data.$resolved,delete data.$cancelRequest,data},forEach(actions,function(action,name){var hasBody=action.hasBody===!0||action.hasBody!==!1&&/^(POST|PUT|PATCH)$/i.test(action.method),numericTimeout=action.timeout,cancellable=isDefined(action.cancellable)?action.cancellable:route.defaults.cancellable;numericTimeout&&!isNumber(numericTimeout)&&($log.debug("ngResource:\n  Only numeric values are allowed as `timeout`.\n  Promises are not supported in $resource, because the same value would be used for multiple requests. If you are looking for a way to cancel requests, you should use the `cancellable` option."),delete action.timeout,numericTimeout=null),Resource[name]=function(a1,a2,a3,a4){function cancelRequest(value){promise["catch"](noop),timeoutDeferred.resolve(value)}var data,success,error,params={};switch(arguments.length){case 4:error=a4,success=a3;
// falls through
case 3:case 2:if(!isFunction(a2)){params=a1,data=a2,success=a3;break}if(isFunction(a1)){success=a1,error=a2;break}success=a2,error=a3;
// falls through
case 1:isFunction(a1)?success=a1:hasBody?data=a1:params=a1;break;case 0:break;default:throw $resourceMinErr("badargs","Expected up to 4 arguments [params, data, success, error], got {0} arguments",arguments.length)}var timeoutDeferred,numericTimeoutPromise,isInstanceCall=this instanceof Resource,value=isInstanceCall?data:action.isArray?[]:new Resource(data),httpConfig={},responseInterceptor=action.interceptor&&action.interceptor.response||defaultResponseInterceptor,responseErrorInterceptor=action.interceptor&&action.interceptor.responseError||void 0,hasError=!!error,hasResponseErrorInterceptor=!!responseErrorInterceptor;forEach(action,function(value,key){switch(key){default:httpConfig[key]=copy(value);break;case"params":case"isArray":case"interceptor":case"cancellable":}}),!isInstanceCall&&cancellable&&(timeoutDeferred=$q.defer(),httpConfig.timeout=timeoutDeferred.promise,numericTimeout&&(numericTimeoutPromise=$timeout(timeoutDeferred.resolve,numericTimeout))),hasBody&&(httpConfig.data=data),route.setUrlParams(httpConfig,extend({},extractParams(data,action.params||{}),params),action.url);var promise=$http(httpConfig).then(function(response){var data=response.data;if(data){
// Need to convert action.isArray to boolean in case it is undefined
if(isArray(data)!==!!action.isArray)throw $resourceMinErr("badcfg","Error in resource configuration for action `{0}`. Expected response to contain an {1} but got an {2} (Request: {3} {4})",name,action.isArray?"array":"object",isArray(data)?"array":"object",httpConfig.method,httpConfig.url);if(action.isArray)value.length=0,forEach(data,function(item){"object"==typeof item?value.push(new Resource(item)):
// Valid JSON values may be string literals, and these should not be converted
// into objects. These items will not have access to the Resource prototype
// methods, but unfortunately there
value.push(item)});else{var promise=value.$promise;// Save the promise
shallowClearAndCopy(data,value),value.$promise=promise}}return response.resource=value,response});
// we are creating instance / collection
// - set the initial promise
// - return the instance / collection
return promise=promise["finally"](function(){value.$resolved=!0,!isInstanceCall&&cancellable&&(value.$cancelRequest=noop,$timeout.cancel(numericTimeoutPromise),timeoutDeferred=numericTimeoutPromise=httpConfig.timeout=null)}),promise=promise.then(function(response){var value=responseInterceptor(response);return(success||noop)(value,response.headers,response.status,response.statusText),value},hasError||hasResponseErrorInterceptor?function(response){
// Avoid `Possibly Unhandled Rejection` error,
// but still fulfill the returned promise with a rejection
return hasError&&!hasResponseErrorInterceptor&&promise["catch"](noop),hasError&&error(response),hasResponseErrorInterceptor?responseErrorInterceptor(response):$q.reject(response)}:void 0),isInstanceCall?promise:(value.$promise=promise,value.$resolved=!1,cancellable&&(value.$cancelRequest=cancelRequest),value)},Resource.prototype["$"+name]=function(params,success,error){isFunction(params)&&(error=success,success=params,params={});var result=Resource[name].call(this,params,this,success,error);return result.$promise||result}}),Resource.bind=function(additionalParamDefaults){var extendedParamDefaults=extend({},paramDefaults,additionalParamDefaults);return resourceFactory(url,extendedParamDefaults,actions,options)},Resource}var noop=angular.noop,forEach=angular.forEach,extend=angular.extend,copy=angular.copy,isArray=angular.isArray,isDefined=angular.isDefined,isFunction=angular.isFunction,isNumber=angular.isNumber,encodeUriQuery=angular.$$encodeUriQuery,encodeUriSegment=angular.$$encodeUriSegment;return Route.prototype={setUrlParams:function(config,params,actionUrl){var val,encodedVal,self=this,url=actionUrl||self.template,protocolAndIpv6="",urlParams=self.urlParams=Object.create(null);forEach(url.split(/\W/),function(param){if("hasOwnProperty"===param)throw $resourceMinErr("badname","hasOwnProperty is not a valid parameter name.");!new RegExp("^\\d+$").test(param)&&param&&new RegExp("(^|[^\\\\]):"+param+"(\\W|$)").test(url)&&(urlParams[param]={isQueryParamValue:new RegExp("\\?.*=:"+param+"(?:\\W|$)").test(url)})}),url=url.replace(/\\:/g,":"),url=url.replace(PROTOCOL_AND_IPV6_REGEX,function(match){return protocolAndIpv6=match,""}),params=params||{},forEach(self.urlParams,function(paramInfo,urlParam){val=params.hasOwnProperty(urlParam)?params[urlParam]:self.defaults[urlParam],isDefined(val)&&null!==val?(encodedVal=paramInfo.isQueryParamValue?encodeUriQuery(val,!0):encodeUriSegment(val),url=url.replace(new RegExp(":"+urlParam+"(\\W|$)","g"),function(match,p1){return encodedVal+p1})):url=url.replace(new RegExp("(/?):"+urlParam+"(\\W|$)","g"),function(match,leadingSlashes,tail){return"/"===tail.charAt(0)?tail:leadingSlashes+tail})}),
// strip trailing slashes and set the url (unless this behavior is specifically disabled)
self.defaults.stripTrailingSlashes&&(url=url.replace(/\/+$/,"")||"/"),
// Collapse `/.` if found in the last URL path segment before the query.
// E.g. `http://url.com/id/.format?q=x` becomes `http://url.com/id.format?q=x`.
url=url.replace(/\/\.(?=\w+($|\?))/,"."),
// Replace escaped `/\.` with `/.`.
// (If `\.` comes from a param value, it will be encoded as `%5C.`.)
config.url=protocolAndIpv6+url.replace(/\/(\\|%5C)\./,"/."),
// set params - delegate param encoding to $http
forEach(params,function(value,key){self.urlParams[key]||(config.params=config.params||{},config.params[key]=value)})}},resourceFactory}]})}(window,window.angular),/**
 * @license AngularJS v1.6.4
 * (c) 2010-2017 Google, Inc. http://angularjs.org
 * License: MIT
 */
function(window,angular){"use strict";/**
 * @ngdoc module
 * @name ngSanitize
 * @description
 *
 * # ngSanitize
 *
 * The `ngSanitize` module provides functionality to sanitize HTML.
 *
 *
 * <div doc-module-components="ngSanitize"></div>
 *
 * See {@link ngSanitize.$sanitize `$sanitize`} for usage.
 */
/**
 * @ngdoc service
 * @name $sanitize
 * @kind function
 *
 * @description
 *   Sanitizes an html string by stripping all potentially dangerous tokens.
 *
 *   The input is sanitized by parsing the HTML into tokens. All safe tokens (from a whitelist) are
 *   then serialized back to properly escaped html string. This means that no unsafe input can make
 *   it into the returned string.
 *
 *   The whitelist for URL sanitization of attribute values is configured using the functions
 *   `aHrefSanitizationWhitelist` and `imgSrcSanitizationWhitelist` of {@link ng.$compileProvider
 *   `$compileProvider`}.
 *
 *   The input may also contain SVG markup if this is enabled via {@link $sanitizeProvider}.
 *
 * @param {string} html HTML input.
 * @returns {string} Sanitized HTML.
 *
 * @example
   <example module="sanitizeExample" deps="angular-sanitize.js" name="sanitize-service">
   <file name="index.html">
     <script>
         angular.module('sanitizeExample', ['ngSanitize'])
           .controller('ExampleController', ['$scope', '$sce', function($scope, $sce) {
             $scope.snippet =
               '<p style="color:blue">an html\n' +
               '<em onmouseover="this.textContent=\'PWN3D!\'">click here</em>\n' +
               'snippet</p>';
             $scope.deliberatelyTrustDangerousSnippet = function() {
               return $sce.trustAsHtml($scope.snippet);
             };
           }]);
     </script>
     <div ng-controller="ExampleController">
        Snippet: <textarea ng-model="snippet" cols="60" rows="3"></textarea>
       <table>
         <tr>
           <td>Directive</td>
           <td>How</td>
           <td>Source</td>
           <td>Rendered</td>
         </tr>
         <tr id="bind-html-with-sanitize">
           <td>ng-bind-html</td>
           <td>Automatically uses $sanitize</td>
           <td><pre>&lt;div ng-bind-html="snippet"&gt;<br/>&lt;/div&gt;</pre></td>
           <td><div ng-bind-html="snippet"></div></td>
         </tr>
         <tr id="bind-html-with-trust">
           <td>ng-bind-html</td>
           <td>Bypass $sanitize by explicitly trusting the dangerous value</td>
           <td>
           <pre>&lt;div ng-bind-html="deliberatelyTrustDangerousSnippet()"&gt;
&lt;/div&gt;</pre>
           </td>
           <td><div ng-bind-html="deliberatelyTrustDangerousSnippet()"></div></td>
         </tr>
         <tr id="bind-default">
           <td>ng-bind</td>
           <td>Automatically escapes</td>
           <td><pre>&lt;div ng-bind="snippet"&gt;<br/>&lt;/div&gt;</pre></td>
           <td><div ng-bind="snippet"></div></td>
         </tr>
       </table>
       </div>
   </file>
   <file name="protractor.js" type="protractor">
     it('should sanitize the html snippet by default', function() {
       expect(element(by.css('#bind-html-with-sanitize div')).getAttribute('innerHTML')).
         toBe('<p>an html\n<em>click here</em>\nsnippet</p>');
     });

     it('should inline raw snippet if bound to a trusted value', function() {
       expect(element(by.css('#bind-html-with-trust div')).getAttribute('innerHTML')).
         toBe("<p style=\"color:blue\">an html\n" +
              "<em onmouseover=\"this.textContent='PWN3D!'\">click here</em>\n" +
              "snippet</p>");
     });

     it('should escape snippet without any filter', function() {
       expect(element(by.css('#bind-default div')).getAttribute('innerHTML')).
         toBe("&lt;p style=\"color:blue\"&gt;an html\n" +
              "&lt;em onmouseover=\"this.textContent='PWN3D!'\"&gt;click here&lt;/em&gt;\n" +
              "snippet&lt;/p&gt;");
     });

     it('should update', function() {
       element(by.model('snippet')).clear();
       element(by.model('snippet')).sendKeys('new <b onclick="alert(1)">text</b>');
       expect(element(by.css('#bind-html-with-sanitize div')).getAttribute('innerHTML')).
         toBe('new <b>text</b>');
       expect(element(by.css('#bind-html-with-trust div')).getAttribute('innerHTML')).toBe(
         'new <b onclick="alert(1)">text</b>');
       expect(element(by.css('#bind-default div')).getAttribute('innerHTML')).toBe(
         "new &lt;b onclick=\"alert(1)\"&gt;text&lt;/b&gt;");
     });
   </file>
   </example>
 */
/**
 * @ngdoc provider
 * @name $sanitizeProvider
 * @this
 *
 * @description
 * Creates and configures {@link $sanitize} instance.
 */
function $SanitizeProvider(){function toMap(str,lowercaseKeys){var i,obj={},items=str.split(",");for(i=0;i<items.length;i++)obj[lowercaseKeys?lowercase(items[i]):items[i]]=!0;return obj}/**
   * @example
   * htmlParser(htmlString, {
   *     start: function(tag, attrs) {},
   *     end: function(tag) {},
   *     chars: function(text) {},
   *     comment: function(text) {}
   * });
   *
   * @param {string} html string
   * @param {object} handler
   */
function htmlParserImpl(html,handler){null===html||void 0===html?html="":"string"!=typeof html&&(html=""+html),inertBodyElement.innerHTML=html;
//mXSS protection
var mXSSAttempts=5;do{if(0===mXSSAttempts)throw $sanitizeMinErr("uinput","Failed to sanitize html because the input is unstable");mXSSAttempts--,
// strip custom-namespaced attributes on IE<=11
window.document.documentMode&&stripCustomNsAttrs(inertBodyElement),html=inertBodyElement.innerHTML,//trigger mXSS
inertBodyElement.innerHTML=html}while(html!==inertBodyElement.innerHTML);for(var node=inertBodyElement.firstChild;node;){switch(node.nodeType){case 1:// ELEMENT_NODE
handler.start(node.nodeName.toLowerCase(),attrToMap(node.attributes));break;case 3:// TEXT NODE
handler.chars(node.textContent)}var nextNode;if(!(nextNode=node.firstChild)&&(1===node.nodeType&&handler.end(node.nodeName.toLowerCase()),nextNode=getNonDescendant("nextSibling",node),!nextNode))for(;null==nextNode&&(node=getNonDescendant("parentNode",node),node!==inertBodyElement);)nextNode=getNonDescendant("nextSibling",node),1===node.nodeType&&handler.end(node.nodeName.toLowerCase());node=nextNode}for(;node=inertBodyElement.firstChild;)inertBodyElement.removeChild(node)}function attrToMap(attrs){for(var map={},i=0,ii=attrs.length;i<ii;i++){var attr=attrs[i];map[attr.name]=attr.value}return map}/**
   * Escapes all potentially dangerous characters, so that the
   * resulting string can be safely inserted into attribute or
   * element text.
   * @param value
   * @returns {string} escaped text
   */
function encodeEntities(value){return value.replace(/&/g,"&amp;").replace(SURROGATE_PAIR_REGEXP,function(value){var hi=value.charCodeAt(0),low=value.charCodeAt(1);return"&#"+(1024*(hi-55296)+(low-56320)+65536)+";"}).replace(NON_ALPHANUMERIC_REGEXP,function(value){return"&#"+value.charCodeAt(0)+";"}).replace(/</g,"&lt;").replace(/>/g,"&gt;")}/**
   * create an HTML/XML writer which writes to buffer
   * @param {Array} buf use buf.join('') to get out sanitized html string
   * @returns {object} in the form of {
   *     start: function(tag, attrs) {},
   *     end: function(tag) {},
   *     chars: function(text) {},
   *     comment: function(text) {}
   * }
   */
function htmlSanitizeWriterImpl(buf,uriValidator){var ignoreCurrentElement=!1,out=bind(buf,buf.push);return{start:function(tag,attrs){tag=lowercase(tag),!ignoreCurrentElement&&blockedElements[tag]&&(ignoreCurrentElement=tag),ignoreCurrentElement||validElements[tag]!==!0||(out("<"),out(tag),forEach(attrs,function(value,key){var lkey=lowercase(key),isImage="img"===tag&&"src"===lkey||"background"===lkey;validAttrs[lkey]!==!0||uriAttrs[lkey]===!0&&!uriValidator(value,isImage)||(out(" "),out(key),out('="'),out(encodeEntities(value)),out('"'))}),out(">"))},end:function(tag){tag=lowercase(tag),ignoreCurrentElement||validElements[tag]!==!0||voidElements[tag]===!0||(out("</"),out(tag),out(">")),
// eslint-disable-next-line eqeqeq
tag==ignoreCurrentElement&&(ignoreCurrentElement=!1)},chars:function(chars){ignoreCurrentElement||out(encodeEntities(chars))}}}/**
   * When IE9-11 comes across an unknown namespaced attribute e.g. 'xlink:foo' it adds 'xmlns:ns1' attribute to declare
   * ns1 namespace and prefixes the attribute with 'ns1' (e.g. 'ns1:xlink:foo'). This is undesirable since we don't want
   * to allow any of these custom attributes. This method strips them all.
   *
   * @param node Root element to process
   */
function stripCustomNsAttrs(node){for(;node;){if(node.nodeType===window.Node.ELEMENT_NODE)for(var attrs=node.attributes,i=0,l=attrs.length;i<l;i++){var attrNode=attrs[i],attrName=attrNode.name.toLowerCase();"xmlns:ns1"!==attrName&&0!==attrName.lastIndexOf("ns1:",0)||(node.removeAttributeNode(attrNode),i--,l--)}var nextNode=node.firstChild;nextNode&&stripCustomNsAttrs(nextNode),node=getNonDescendant("nextSibling",node)}}function getNonDescendant(propName,node){
// An element is clobbered if its `propName` property points to one of its descendants
var nextNode=node[propName];if(nextNode&&nodeContains.call(node,nextNode))throw $sanitizeMinErr("elclob","Failed to sanitize html because the element is clobbered: {0}",node.outerHTML||node.outerText);return nextNode}var svgEnabled=!1;this.$get=["$$sanitizeUri",function($$sanitizeUri){return svgEnabled&&extend(validElements,svgElements),function(html){var buf=[];return htmlParser(html,htmlSanitizeWriter(buf,function(uri,isImage){return!/^unsafe:/.test($$sanitizeUri(uri,isImage))})),buf.join("")}}],/**
   * @ngdoc method
   * @name $sanitizeProvider#enableSvg
   * @kind function
   *
   * @description
   * Enables a subset of svg to be supported by the sanitizer.
   *
   * <div class="alert alert-warning">
   *   <p>By enabling this setting without taking other precautions, you might expose your
   *   application to click-hijacking attacks. In these attacks, sanitized svg elements could be positioned
   *   outside of the containing element and be rendered over other elements on the page (e.g. a login
   *   link). Such behavior can then result in phishing incidents.</p>
   *
   *   <p>To protect against these, explicitly setup `overflow: hidden` css rule for all potential svg
   *   tags within the sanitized content:</p>
   *
   *   <br>
   *
   *   <pre><code>
   *   .rootOfTheIncludedContent svg {
   *     overflow: hidden !important;
   *   }
   *   </code></pre>
   * </div>
   *
   * @param {boolean=} flag Enable or disable SVG support in the sanitizer.
   * @returns {boolean|ng.$sanitizeProvider} Returns the currently configured value if called
   *    without an argument or self for chaining otherwise.
   */
this.enableSvg=function(enableSvg){return isDefined(enableSvg)?(svgEnabled=enableSvg,this):svgEnabled},
//////////////////////////////////////////////////////////////////////////////////////////////////
// Private stuff
//////////////////////////////////////////////////////////////////////////////////////////////////
bind=angular.bind,extend=angular.extend,forEach=angular.forEach,isDefined=angular.isDefined,lowercase=angular.lowercase,noop=angular.noop,htmlParser=htmlParserImpl,htmlSanitizeWriter=htmlSanitizeWriterImpl,nodeContains=window.Node.prototype.contains||/** @this */function(arg){
// eslint-disable-next-line no-bitwise
return!!(16&this.compareDocumentPosition(arg))};
// Regular Expressions for parsing tags and attributes
var inertBodyElement,SURROGATE_PAIR_REGEXP=/[\uD800-\uDBFF][\uDC00-\uDFFF]/g,
// Match everything outside of normal chars and " (quote character)
NON_ALPHANUMERIC_REGEXP=/([^#-~ |!])/g,voidElements=toMap("area,br,col,hr,img,wbr"),optionalEndTagBlockElements=toMap("colgroup,dd,dt,li,p,tbody,td,tfoot,th,thead,tr"),optionalEndTagInlineElements=toMap("rp,rt"),optionalEndTagElements=extend({},optionalEndTagInlineElements,optionalEndTagBlockElements),blockElements=extend({},optionalEndTagBlockElements,toMap("address,article,aside,blockquote,caption,center,del,dir,div,dl,figure,figcaption,footer,h1,h2,h3,h4,h5,h6,header,hgroup,hr,ins,map,menu,nav,ol,pre,section,table,ul")),inlineElements=extend({},optionalEndTagInlineElements,toMap("a,abbr,acronym,b,bdi,bdo,big,br,cite,code,del,dfn,em,font,i,img,ins,kbd,label,map,mark,q,ruby,rp,rt,s,samp,small,span,strike,strong,sub,sup,time,tt,u,var")),svgElements=toMap("circle,defs,desc,ellipse,font-face,font-face-name,font-face-src,g,glyph,hkern,image,linearGradient,line,marker,metadata,missing-glyph,mpath,path,polygon,polyline,radialGradient,rect,stop,svg,switch,text,title,tspan"),blockedElements=toMap("script,style"),validElements=extend({},voidElements,blockElements,inlineElements,optionalEndTagElements),uriAttrs=toMap("background,cite,href,longdesc,src,xlink:href"),htmlAttrs=toMap("abbr,align,alt,axis,bgcolor,border,cellpadding,cellspacing,class,clear,color,cols,colspan,compact,coords,dir,face,headers,height,hreflang,hspace,ismap,lang,language,nohref,nowrap,rel,rev,rows,rowspan,rules,scope,scrolling,shape,size,span,start,summary,tabindex,target,title,type,valign,value,vspace,width"),svgAttrs=toMap("accent-height,accumulate,additive,alphabetic,arabic-form,ascent,baseProfile,bbox,begin,by,calcMode,cap-height,class,color,color-rendering,content,cx,cy,d,dx,dy,descent,display,dur,end,fill,fill-rule,font-family,font-size,font-stretch,font-style,font-variant,font-weight,from,fx,fy,g1,g2,glyph-name,gradientUnits,hanging,height,horiz-adv-x,horiz-origin-x,ideographic,k,keyPoints,keySplines,keyTimes,lang,marker-end,marker-mid,marker-start,markerHeight,markerUnits,markerWidth,mathematical,max,min,offset,opacity,orient,origin,overline-position,overline-thickness,panose-1,path,pathLength,points,preserveAspectRatio,r,refX,refY,repeatCount,repeatDur,requiredExtensions,requiredFeatures,restart,rotate,rx,ry,slope,stemh,stemv,stop-color,stop-opacity,strikethrough-position,strikethrough-thickness,stroke,stroke-dasharray,stroke-dashoffset,stroke-linecap,stroke-linejoin,stroke-miterlimit,stroke-opacity,stroke-width,systemLanguage,target,text-anchor,to,transform,type,u1,u2,underline-position,underline-thickness,unicode,unicode-range,units-per-em,values,version,viewBox,visibility,width,widths,x,x-height,x1,x2,xlink:actuate,xlink:arcrole,xlink:role,xlink:show,xlink:title,xlink:type,xml:base,xml:lang,xml:space,xmlns,xmlns:xlink,y,y1,y2,zoomAndPan",!0),validAttrs=extend({},uriAttrs,svgAttrs,htmlAttrs);!function(window){var doc;if(!window.document||!window.document.implementation)throw $sanitizeMinErr("noinert","Can't create an inert html document");doc=window.document.implementation.createHTMLDocument("inert");var docElement=doc.documentElement||doc.getDocumentElement(),bodyElements=docElement.getElementsByTagName("body");
// usually there should be only one body element in the document, but IE doesn't have any, so we need to create one
if(1===bodyElements.length)inertBodyElement=bodyElements[0];else{var html=doc.createElement("html");inertBodyElement=doc.createElement("body"),html.appendChild(inertBodyElement),doc.appendChild(html)}}(window)}function sanitizeText(chars){var buf=[],writer=htmlSanitizeWriter(buf,noop);return writer.chars(chars),buf.join("")}/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 *     Any commits to this file should be reviewed with security in mind.  *
 *   Changes to this file can potentially create security vulnerabilities. *
 *          An approval from 2 Core members with history of modifying      *
 *                         this file is required.                          *
 *                                                                         *
 *  Does the change somehow allow for arbitrary javascript to be executed? *
 *    Or allows for someone to change the prototype of built-in objects?   *
 *     Or gives undesired access to variables likes document or window?    *
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */
var bind,extend,forEach,isDefined,lowercase,noop,nodeContains,htmlParser,htmlSanitizeWriter,$sanitizeMinErr=angular.$$minErr("$sanitize");
// define ngSanitize module and register $sanitize service
angular.module("ngSanitize",[]).provider("$sanitize",$SanitizeProvider).info({angularVersion:"1.6.4"}),/**
 * @ngdoc filter
 * @name linky
 * @kind function
 *
 * @description
 * Finds links in text input and turns them into html links. Supports `http/https/ftp/mailto` and
 * plain email address links.
 *
 * Requires the {@link ngSanitize `ngSanitize`} module to be installed.
 *
 * @param {string} text Input text.
 * @param {string} target Window (`_blank|_self|_parent|_top`) or named frame to open links in.
 * @param {object|function(url)} [attributes] Add custom attributes to the link element.
 *
 *    Can be one of:
 *
 *    - `object`: A map of attributes
 *    - `function`: Takes the url as a parameter and returns a map of attributes
 *
 *    If the map of attributes contains a value for `target`, it overrides the value of
 *    the target parameter.
 *
 *
 * @returns {string} Html-linkified and {@link $sanitize sanitized} text.
 *
 * @usage
   <span ng-bind-html="linky_expression | linky"></span>
 *
 * @example
   <example module="linkyExample" deps="angular-sanitize.js" name="linky-filter">
     <file name="index.html">
       <div ng-controller="ExampleController">
       Snippet: <textarea ng-model="snippet" cols="60" rows="3"></textarea>
       <table>
         <tr>
           <th>Filter</th>
           <th>Source</th>
           <th>Rendered</th>
         </tr>
         <tr id="linky-filter">
           <td>linky filter</td>
           <td>
             <pre>&lt;div ng-bind-html="snippet | linky"&gt;<br>&lt;/div&gt;</pre>
           </td>
           <td>
             <div ng-bind-html="snippet | linky"></div>
           </td>
         </tr>
         <tr id="linky-target">
          <td>linky target</td>
          <td>
            <pre>&lt;div ng-bind-html="snippetWithSingleURL | linky:'_blank'"&gt;<br>&lt;/div&gt;</pre>
          </td>
          <td>
            <div ng-bind-html="snippetWithSingleURL | linky:'_blank'"></div>
          </td>
         </tr>
         <tr id="linky-custom-attributes">
          <td>linky custom attributes</td>
          <td>
            <pre>&lt;div ng-bind-html="snippetWithSingleURL | linky:'_self':{rel: 'nofollow'}"&gt;<br>&lt;/div&gt;</pre>
          </td>
          <td>
            <div ng-bind-html="snippetWithSingleURL | linky:'_self':{rel: 'nofollow'}"></div>
          </td>
         </tr>
         <tr id="escaped-html">
           <td>no filter</td>
           <td><pre>&lt;div ng-bind="snippet"&gt;<br>&lt;/div&gt;</pre></td>
           <td><div ng-bind="snippet"></div></td>
         </tr>
       </table>
     </file>
     <file name="script.js">
       angular.module('linkyExample', ['ngSanitize'])
         .controller('ExampleController', ['$scope', function($scope) {
           $scope.snippet =
             'Pretty text with some links:\n' +
             'http://angularjs.org/,\n' +
             'mailto:us@somewhere.org,\n' +
             'another@somewhere.org,\n' +
             'and one more: ftp://127.0.0.1/.';
           $scope.snippetWithSingleURL = 'http://angularjs.org/';
         }]);
     </file>
     <file name="protractor.js" type="protractor">
       it('should linkify the snippet with urls', function() {
         expect(element(by.id('linky-filter')).element(by.binding('snippet | linky')).getText()).
             toBe('Pretty text with some links: http://angularjs.org/, us@somewhere.org, ' +
                  'another@somewhere.org, and one more: ftp://127.0.0.1/.');
         expect(element.all(by.css('#linky-filter a')).count()).toEqual(4);
       });

       it('should not linkify snippet without the linky filter', function() {
         expect(element(by.id('escaped-html')).element(by.binding('snippet')).getText()).
             toBe('Pretty text with some links: http://angularjs.org/, mailto:us@somewhere.org, ' +
                  'another@somewhere.org, and one more: ftp://127.0.0.1/.');
         expect(element.all(by.css('#escaped-html a')).count()).toEqual(0);
       });

       it('should update', function() {
         element(by.model('snippet')).clear();
         element(by.model('snippet')).sendKeys('new http://link.');
         expect(element(by.id('linky-filter')).element(by.binding('snippet | linky')).getText()).
             toBe('new http://link.');
         expect(element.all(by.css('#linky-filter a')).count()).toEqual(1);
         expect(element(by.id('escaped-html')).element(by.binding('snippet')).getText())
             .toBe('new http://link.');
       });

       it('should work with the target property', function() {
        expect(element(by.id('linky-target')).
            element(by.binding("snippetWithSingleURL | linky:'_blank'")).getText()).
            toBe('http://angularjs.org/');
        expect(element(by.css('#linky-target a')).getAttribute('target')).toEqual('_blank');
       });

       it('should optionally add custom attributes', function() {
        expect(element(by.id('linky-custom-attributes')).
            element(by.binding("snippetWithSingleURL | linky:'_self':{rel: 'nofollow'}")).getText()).
            toBe('http://angularjs.org/');
        expect(element(by.css('#linky-custom-attributes a')).getAttribute('rel')).toEqual('nofollow');
       });
     </file>
   </example>
 */
angular.module("ngSanitize").filter("linky",["$sanitize",function($sanitize){var LINKY_URL_REGEXP=/((ftp|https?):\/\/|(www\.)|(mailto:)?[A-Za-z0-9._%+-]+@)\S*[^\s.;,(){}<>"\u201d\u2019]/i,MAILTO_REGEXP=/^mailto:/i,linkyMinErr=angular.$$minErr("linky"),isDefined=angular.isDefined,isFunction=angular.isFunction,isObject=angular.isObject,isString=angular.isString;return function(text,target,attributes){function addText(text){text&&html.push(sanitizeText(text))}function addLink(url,text){var key,linkAttributes=attributesFn(url);html.push("<a ");for(key in linkAttributes)html.push(key+'="'+linkAttributes[key]+'" ');!isDefined(target)||"target"in linkAttributes||html.push('target="',target,'" '),html.push('href="',url.replace(/"/g,"&quot;"),'">'),addText(text),html.push("</a>")}if(null==text||""===text)return text;if(!isString(text))throw linkyMinErr("notstring","Expected string but received: {0}",text);for(var match,url,i,attributesFn=isFunction(attributes)?attributes:isObject(attributes)?function(){return attributes}:function(){return{}},raw=text,html=[];match=raw.match(LINKY_URL_REGEXP);)
// We can not end in these as they are sometimes found at the end of the sentence
url=match[0],
// if we did not match ftp/http/www/mailto then assume mailto
match[2]||match[4]||(url=(match[3]?"http://":"mailto:")+url),i=match.index,addText(raw.substr(0,i)),addLink(url,match[0].replace(MAILTO_REGEXP,"")),raw=raw.substring(i+match[0].length);return addText(raw),$sanitize(html.join(""))}}])}(window,window.angular);