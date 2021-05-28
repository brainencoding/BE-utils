/**
 *	Author: Adamets Vladislav
 *
 *	BrainEncoding org.
 *
 *	GitHub author: https://github.com/adametsofficial
 *	GitHub org: https://github.com/brainencoding
 *	GitHub project: https://github.com/brainencoding/BE-utils
 * */

"use strict";
let BE;

(function (BE) {
	/*
	 * Initialize namespace group
	 * */
	BE.array = {};
	BE.object = {};
	BE.string = {};
	BE.number = {};
	BE.html = {};
	BE.httpClient = {};

	/*
	 * =======> STRING <=======
	 * */

	/*
	 * =======> NUMBER <=======
	 * */

	/*
	 * =======> HTML <=======
	 * */

	/**
	 * Get element's by regular expression
	 * 
	 * Example: DOMRegex(/(.*)/)
	 *
	 * @param regex {RegExp}
	 * @return {Array} HTMLCollection || Error
	 * */
	function getElementByRegex(regex) {
		if (!regex) {
			throw new Error('\n\t{regex} was not specified');
		}

		let collection = [];

		for (let i of document.querySelectorAll('*')) {
			for (let j of i.attributes) {
				if (regex.test(j.value)) {
					collection.push(i);
				}
			}
		}

		return collection;
	}

	BE.html.getElementByRegex = getElementByRegex;

	/*
	 * =======> HTTP CLIENT <=======
	 * */

	/*
	 * =======> COMMON <=======
	 * */

	BE._immediateState = {
		storage: {},
		uid: 0,
		firstCall: true,
		message: 'setImmediatePolyfillMessage'
	}

	function _setImmediate() {
		let slice = Array.prototype.slice;

		function fastApply(args) {
			let func = args[0];
			switch (args.length) {
				case 1:
					return func();
				case 2:
					return func(args[1]);
				case 3:
					return func(args[1], args[2]);
			}
			return func.apply(window, slice.call(args, 1));
		}

		function callback(event) {
			let key = event.data;
			let data;
			if (typeof key == 'string' && key.indexOf(BE._immediateState.message) === 0) {
				data = BE._immediateState.storage[key];
				if (data) {
					delete BE._immediateState.storage[key];
					fastApply(data);
				}
			}
		}

		let id = BE._immediateState.uid++;
		let key = BE._immediateState.message + id;
		let i = arguments.length;
		let args = new Array(i);

		while (i--) {
			args[i] = arguments[i];
		}

		BE._immediateState.storage[key] = args;

		if (BE._immediateState.firstCall) {
			BE._immediateState.firstCall = false;
			window.addEventListener('message', callback);
		}

		window.postMessage(key, '*');
		
		return id;
	}
	function _clearImmediate(id) {
		if (!id || typeof id !== 'number') return new Error('argument "id" was not specified or type is invalid');
		delete BE._immediateState.storage[BE._immediateState.message + id];
		return true;
	}

	BE.setImmediate =_setImmediate;
	BE.clearImmediate =_clearImmediate;

	/*
	 * =======> ARRAY <=======
	 * */
	
	/**
	 * 	Arrays comparing
	 *  
	 * 	Example: arrayEquals([1,2,3], [1,2,3]) => true
	 *
	 * 	@param source {Array}
	 * 	@param comparable {Array}
	 * 	@return {Boolean}
	 * */
	function arrayEquals(source, comparable) {
		// if the other array is a falsy value, return
		if (!source && !comparable) {
			return false;
		}

		// compare lengths - can save a lot of time
		if (source.length !== comparable.length) {
			return false;
		}

		for (let i = 0, l=source.length; i < l; i++) {
			// Check if we have nested arrays
			if (source[i] instanceof Array && comparable[i] instanceof Array) {
				// recurse into the nested arrays
				if (!source[i].equals(comparable[i]))
					return false;
			}
			else if (source[i] !== comparable[i]) {
				// Warning - two different object instances will never be equal: {x:20} != {x:20}
				return false;
			}
		}

		return true;
	}
	BE.array.equals = arrayEquals;

	/**
	 * 	Array chunk breaker
	 *
	 * 	Example:
	 * 	const fibonacciNumsArray = [0, 1, 1, 2, 3, 5, 8, 13, 21, 34];
	 * 	BE.array.chunksOf(fibonacciNumsArray, 3) => [[0, 1, 1], [2, 3, 5], [8, 13, 21], [34]]
	 *
	 * 	@param array {Array}
	 * 	@param size {number}
	 * 	@return {Array<[]> | Error}
	 * */
	function chunksOf(array, size) {
		if (!array) {
			throw new Error('\n\t {array} is not specified')
		}

		if (!size) {
			throw new Error('\n\t {array} is not specified')
		}

		return array.reduce(function (previousValue, currentValue) {
			let chunk;

			if (previousValue.length === 0 || previousValue[previousValue.length - 1].length === size) {
				chunk = [];
				previousValue.push(chunk);
			} else {
				chunk = previousValue[previousValue.length - 1];
			}
			
			chunk.push(currentValue);

			return previousValue;
		}, []);
	}

	BE.array.chunksOf = chunksOf;

	/**
	 * =======> OBJECT <=======
	 * */

	/**
	 * Objects comparing
	 *
	 * 	Example:
	 * 		objectEquals({key: [1, 2]}, {key: [1, 2]}) => true
	 * 		objectEquals({key: [1, 2]}, {diffProp: [1, 2]}) => false
	 *
	 * 	@param source {object}
	 * 	@param comparable {object}
	 * 	@return {Boolean}
	 * */
	function objectEquals(source, comparable) {
		//For the first loop, we only check for types
		for (let propName in source) {
			//Check for inherited methods and properties - like .equals itself
			//https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/hasOwnProperty
			//Return false if the return value is different
			if (source.hasOwnProperty(propName) !== comparable.hasOwnProperty(propName)) {
				return false;
			}
			//Check instance type
			else if (typeof source[propName] !== typeof comparable[propName]) {
				//Different types => not equal
				return false;
			}
		}
		//Now a deeper check using other objects property names
		for(let propName in comparable) {
			//We must check instances anyway, there may be a property that only exists in object2
			//I wonder, if remembering the checked values from the first loop would be faster or not
			if (source.hasOwnProperty(propName) !== comparable.hasOwnProperty(propName)) {
				return false;
			}
			else if (typeof source[propName] !== typeof comparable[propName]) {
				return false;
			}
			//If the property is inherited, do not check any more (it must be equa if both objects inherit it)
			if(!source.hasOwnProperty(propName)) {
				continue;
			}

			//Now the detail check and recursion

			//This returns the script back to the array comparing
			/***REQUIRES Array.equals**/
			if (source[propName] instanceof Array && comparable[propName] instanceof Array) {
				// recurse into the nested arrays
				if (!arrayEquals(source[propName], comparable[propName])) {
					return false;
				}
			} else if (source[propName] instanceof Object && comparable[propName] instanceof Object) {
				// recurse into another objects
				//console.log("Recursing to compare ", this[propName],"with",object2[propName], " both named \""+propName+"\"");
				if (!source[propName].equals(comparable[propName]))
					return false;
			} /** Normal value comparison for strings and numbers */ else if(source[propName] !== comparable[propName]) {
				return false;
			}
		}
		//If everything passed, let's say YES
		return true;
	}
	BE.object.equals = objectEquals;
})(BE || (BE = {}));
