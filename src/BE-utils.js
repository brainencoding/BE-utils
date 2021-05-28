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
	BE.crypto = {};
	BE.number = {};
	BE.html = {};
	BE.httpClient = {};

	/*
	 * =======> STRING <=======
	 * */

	/**
	 * @param string {String}
	 * @return {String}
	 * */
	function Utf8Encode(string) {
		string = string.replace(/\r\n/g,"\n");
		let utftext = "";

		for (let n = 0; n < string.length; n++) {
			let c = string.charCodeAt(n);

			if (c < 128) {
				utftext += String.fromCharCode(c);
			} else if((c > 127) && (c < 2048)) {
				utftext += String.fromCharCode((c >> 6) | 192);
				utftext += String.fromCharCode((c & 63) | 128);
			} else {
				utftext += String.fromCharCode((c >> 12) | 224);
				utftext += String.fromCharCode(((c >> 6) & 63) | 128);
				utftext += String.fromCharCode((c & 63) | 128);
			}
		}

		return utftext;
	}
	BE.string.utf8Encode = Utf8Encode;

	/**
	 * @param lValue {String}
	 * @return {String}
	 * */
	function WordToHex(lValue) {
		let WordToHexValue="", WordToHexValue_temp="", lByte, lCount;

		for (lCount = 0;lCount<=3;lCount++) {
			lByte = (lValue>>>(lCount * 8)) & 255;
			WordToHexValue_temp = "0" + lByte.toString(16);
			WordToHexValue = WordToHexValue + WordToHexValue_temp.substr(WordToHexValue_temp.length-2,2);
		}

		return WordToHexValue;
	}
	BE.string.wordToHex = WordToHex;

	/*
	 * =======> NUMBER <=======
	 * */

	/**
	 * @param lValue {Number}
	 * @param iShiftBits {Number}
	 * @return {Number}
	 * */
	function RotateLeft(lValue, iShiftBits) {
		return (lValue<<iShiftBits) | (lValue>>>(32-iShiftBits));
	}
	BE.number.rotateLeft = RotateLeft;

	/**
	 * @param lX {Number}
	 * @param lY {Number}
	 * @return {Number}
	 * */
	function AddUnsigned(lX,lY) {
		let lX4, lY4, lX8, lY8, lResult;
		lX8 = (lX & 0x80000000);
		lY8 = (lY & 0x80000000);
		lX4 = (lX & 0x40000000);
		lY4 = (lY & 0x40000000);
		lResult = (lX & 0x3FFFFFFF) + (lY & 0x3FFFFFFF);

		if (lX4 & lY4) {
			return (lResult ^ 0x80000000 ^ lX8 ^ lY8);
		}

		if (lX4 | lY4) {
			if (lResult & 0x40000000) {
				return (lResult ^ 0xC0000000 ^ lX8 ^ lY8);
			} else {
				return (lResult ^ 0x40000000 ^ lX8 ^ lY8);
			}
		} else {
			return (lResult ^ lX8 ^ lY8);
		}
	}
	BE.number.addUnsigned = AddUnsigned;

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

	/**
	 * class EventEmitter.
	 * */
	class _EventEmitter {

		/**
		 * Init events array
		 */
	 	constructor() {
	 		this.events = [];
		}

		/**
		 * set new event
		 * @param eventName {String}
		 * @param callbacks {callbacks<Function>}
		 * @return {void | Error}
		 * */
		on(eventName, ...callbacks) {
	 		if (!eventName) {
	 			throw new Error('\n\t {eventName} is not specified');
			}

			if (!callbacks) {
				this.events[eventName] = [];
				return;
			}

			this.events[eventName] = callbacks;
		}

		/**
		 * emit event
		 * @param eventName {String}
		 * @param args {...args}
		 * @return {void | Error}
		 * */
		emit(eventName, ...args) {
	 		this.events &&
				this.events[eventName].length &&
				this.events[eventName].forEach((fn) => {
					args.length
						? args.forEach((arg) => {
							fn(arg);
						})
						: fn(undefined);
				});
		}
	}

	BE.EventEmmiter = _EventEmitter;

	/*
	 * =======> CRYPTO <=======
	 * */

	 function MD5() {
	 	
	 }

	 BE.crypto.md5 = MD5;

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
	 * @param string {String}
	 * @return {Array<number | empty>}
	 * */
	function ConvertToWordArray(string) {
		let lWordCount;
		let lMessageLength = string.length;
		let lNumberOfWords_temp1 = lMessageLength + 8;
		let lNumberOfWords_temp2 = (lNumberOfWords_temp1-(lNumberOfWords_temp1 % 64)) / 64;
		let lNumberOfWords = (lNumberOfWords_temp2 + 1 ) * 16;
		let lWordArray = Array(lNumberOfWords - 1);
		let lBytePosition = 0;
		let lByteCount = 0;

		while ( lByteCount < lMessageLength ) {
			lWordCount = (lByteCount-(lByteCount % 4)) / 4;
			lBytePosition = (lByteCount % 4) * 8;
			lWordArray[lWordCount] = (lWordArray[lWordCount] | (string.charCodeAt(lByteCount)<<lBytePosition));
			lByteCount++;
		}

		lWordCount = (lByteCount-(lByteCount % 4))/4;
		lBytePosition = (lByteCount % 4)*8;
		lWordArray[lWordCount] = lWordArray[lWordCount] | (0x80<<lBytePosition);
		lWordArray[lNumberOfWords-2] = lMessageLength<<3;
		lWordArray[lNumberOfWords-1] = lMessageLength>>>29;
		return lWordArray;
	}
	BE.array.convertToWordArray = ConvertToWordArray;

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
