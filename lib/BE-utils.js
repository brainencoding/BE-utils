"use strict";
let BE;
(function (BE) {
    BE.array = {};
    BE.object = {};
    BE.string = {};
    BE.number = {};
    BE.html = {};
    BE.httpClient = {};
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
    BE._immediateState = {
        storage: {},
        uid: 0,
        firstCall: true,
        message: 'setImmediatePolyfillMessage'
    };
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
        if (!id || typeof id !== 'number')
            return new Error('argument "id" was not specified or type is invalid');
        delete BE._immediateState.storage[BE._immediateState.message + id];
        return true;
    }
    BE.setImmediate = _setImmediate;
    BE.clearImmediate = _clearImmediate;
    function arrayEquals(source, comparable) {
        if (!source && !comparable) {
            return false;
        }
        if (source.length !== comparable.length) {
            return false;
        }
        for (let i = 0, l = source.length; i < l; i++) {
            if (source[i] instanceof Array && comparable[i] instanceof Array) {
                if (!source[i].equals(comparable[i]))
                    return false;
            }
            else if (source[i] !== comparable[i]) {
                return false;
            }
        }
        return true;
    }
    BE.array.equals = arrayEquals;
    function chunksOf(array, size) {
        if (!array) {
            throw new Error('\n\t {array} is not specified');
        }
        if (!size) {
            throw new Error('\n\t {array} is not specified');
        }
        return array.reduce(function (previousValue, currentValue) {
            let chunk;
            if (previousValue.length === 0 || previousValue[previousValue.length - 1].length === size) {
                chunk = [];
                previousValue.push(chunk);
            }
            else {
                chunk = previousValue[previousValue.length - 1];
            }
            chunk.push(currentValue);
            return previousValue;
        }, []);
    }
    BE.array.chunksOf = chunksOf;
    function objectEquals(source, comparable) {
        for (let propName in source) {
            if (source.hasOwnProperty(propName) !== comparable.hasOwnProperty(propName)) {
                return false;
            }
            else if (typeof source[propName] !== typeof comparable[propName]) {
                return false;
            }
        }
        for (let propName in comparable) {
            if (source.hasOwnProperty(propName) !== comparable.hasOwnProperty(propName)) {
                return false;
            }
            else if (typeof source[propName] !== typeof comparable[propName]) {
                return false;
            }
            if (!source.hasOwnProperty(propName)) {
                continue;
            }
            if (source[propName] instanceof Array && comparable[propName] instanceof Array) {
                if (!arrayEquals(source[propName], comparable[propName])) {
                    return false;
                }
            }
            else if (source[propName] instanceof Object && comparable[propName] instanceof Object) {
                if (!source[propName].equals(comparable[propName]))
                    return false;
            }
            else if (source[propName] !== comparable[propName]) {
                return false;
            }
        }
        return true;
    }
    BE.object.equals = objectEquals;
})(BE || (BE = {}));
//# sourceMappingURL=BE-utils.js.map