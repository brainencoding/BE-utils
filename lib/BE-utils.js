"use strict";
let BE;
(function (BE) {
	BE.array = {};
	BE.object = {};
	BE.string = {};
	BE.number = {};
	BE.http = {};

	/*
	* ARRAYS COMPARING
	*
	* 	USAGE:
	*
	*  	arrayEquals([1, 2, 3], [1, 2, 3]) => true
	*  	arrayEquals([1, 2, 3], [4, 5, 6, 7]) => false
	*  	arrayEquals([1, 2, 3], [4, 5, 6]) => false
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

	/*
	* OBJECTS COMPARING
	*
	* 	USAGE:
	*
	*  	objectEquals({key: [1, 2]}, {key: [1, 2]}) => true
	*  	objectEquals({key: [1, 2]}, {diffProp: [1, 2]}) => false
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
			/**REQUIRES Array.equals**/
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
			} /* Normal value comparison for strings and numbers */ else if(source[propName] !== comparable[propName]) {
				return false;
			}
		}
		//If everything passed, let's say YES
		return true;
	}

	BE.array.equals = arrayEquals;
	BE.object.equals = objectEquals;
})(BE || (BE = {}));
