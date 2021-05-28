"use strict";
let BE;
(function (BE) {
    BE.array = {};
    BE.object = {};
    BE.string = {};
    BE.crypto = {};
    BE.common = {};
    BE.number = {};
    BE.html = {};
    BE.httpClient = {};
    function Utf8Encode(string) {
        string = string.replace(/\r\n/g, "\n");
        let utftext = "";
        for (let n = 0; n < string.length; n++) {
            let c = string.charCodeAt(n);
            if (c < 128) {
                utftext += String.fromCharCode(c);
            }
            else if ((c > 127) && (c < 2048)) {
                utftext += String.fromCharCode((c >> 6) | 192);
                utftext += String.fromCharCode((c & 63) | 128);
            }
            else {
                utftext += String.fromCharCode((c >> 12) | 224);
                utftext += String.fromCharCode(((c >> 6) & 63) | 128);
                utftext += String.fromCharCode((c & 63) | 128);
            }
        }
        return utftext;
    }
    BE.string.utf8Encode = Utf8Encode;
    function WordToHex(lValue) {
        let WordToHexValue = "", WordToHexValue_temp = "", lByte, lCount;
        for (lCount = 0; lCount <= 3; lCount++) {
            lByte = (lValue >>> (lCount * 8)) & 255;
            WordToHexValue_temp = "0" + lByte.toString(16);
            WordToHexValue = WordToHexValue + WordToHexValue_temp.substr(WordToHexValue_temp.length - 2, 2);
        }
        return WordToHexValue;
    }
    BE.string.wordToHex = WordToHex;
    function RotateLeft(lValue, iShiftBits) {
        return (lValue << iShiftBits) | (lValue >>> (32 - iShiftBits));
    }
    BE.number.rotateLeft = RotateLeft;
    function AddUnsigned(lX, lY) {
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
            }
            else {
                return (lResult ^ 0x40000000 ^ lX8 ^ lY8);
            }
        }
        else {
            return (lResult ^ lX8 ^ lY8);
        }
    }
    BE.number.addUnsigned = AddUnsigned;
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
    BE.common._immediateState = {
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
            if (typeof key == 'string' && key.indexOf(BE.common._immediateState.message) === 0) {
                data = BE.common._immediateState.storage[key];
                if (data) {
                    delete BE.common._immediateState.storage[key];
                    fastApply(data);
                }
            }
        }
        let id = BE.common._immediateState.uid++;
        let key = BE.common._immediateState.message + id;
        let i = arguments.length;
        let args = new Array(i);
        while (i--) {
            args[i] = arguments[i];
        }
        BE.common._immediateState.storage[key] = args;
        if (BE.common._immediateState.firstCall) {
            BE.common._immediateState.firstCall = false;
            window.addEventListener('message', callback);
        }
        window.postMessage(key, '*');
        return id;
    }
    function _clearImmediate(id) {
        if (!id || typeof id !== 'number') {
            return new Error('argument "id" was not specified or type is invalid');
        }
        delete BE.common._immediateState.storage[BE.common._immediateState.message + id];
        return true;
    }
    BE.common.setImmediate = _setImmediate;
    BE.common.clearImmediate = _clearImmediate;
    class _EventEmitter {
        constructor() {
            this.events = [];
        }
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
    BE.common.EventEmmiter = _EventEmitter;
    function MD5(string) {
        function F(x, y, z) { return (x & y) | ((~x) & z); }
        function G(x, y, z) { return (x & z) | (y & (~z)); }
        function H(x, y, z) { return (x ^ y ^ z); }
        function I(x, y, z) { return (y ^ (x | (~z))); }
        function FF(a, b, c, d, x, s, ac) {
            a = AddUnsigned(a, AddUnsigned(AddUnsigned(F(b, c, d), x), ac));
            return AddUnsigned(RotateLeft(a, s), b);
        }
        function GG(a, b, c, d, x, s, ac) {
            a = AddUnsigned(a, AddUnsigned(AddUnsigned(G(b, c, d), x), ac));
            return AddUnsigned(RotateLeft(a, s), b);
        }
        function HH(a, b, c, d, x, s, ac) {
            a = AddUnsigned(a, AddUnsigned(AddUnsigned(H(b, c, d), x), ac));
            return AddUnsigned(RotateLeft(a, s), b);
        }
        function II(a, b, c, d, x, s, ac) {
            a = AddUnsigned(a, AddUnsigned(AddUnsigned(I(b, c, d), x), ac));
            return AddUnsigned(RotateLeft(a, s), b);
        }
        let x = Array();
        let k, AA, BB, CC, DD, a, b, c, d;
        let S11 = 7, S12 = 12, S13 = 17, S14 = 22;
        let S21 = 5, S22 = 9, S23 = 14, S24 = 20;
        let S31 = 4, S32 = 11, S33 = 16, S34 = 23;
        let S41 = 6, S42 = 10, S43 = 15, S44 = 21;
        string = Utf8Encode(string);
        x = ConvertToWordArray(string);
        a = 0x67452301;
        b = 0xEFCDAB89;
        c = 0x98BADCFE;
        d = 0x10325476;
        for (k = 0; k < x.length; k += 16) {
            AA = a;
            BB = b;
            CC = c;
            DD = d;
            a = FF(a, b, c, d, x[k], S11, 0xD76AA478);
            d = FF(d, a, b, c, x[k + 1], S12, 0xE8C7B756);
            c = FF(c, d, a, b, x[k + 2], S13, 0x242070DB);
            b = FF(b, c, d, a, x[k + 3], S14, 0xC1BDCEEE);
            a = FF(a, b, c, d, x[k + 4], S11, 0xF57C0FAF);
            d = FF(d, a, b, c, x[k + 5], S12, 0x4787C62A);
            c = FF(c, d, a, b, x[k + 6], S13, 0xA8304613);
            b = FF(b, c, d, a, x[k + 7], S14, 0xFD469501);
            a = FF(a, b, c, d, x[k + 8], S11, 0x698098D8);
            d = FF(d, a, b, c, x[k + 9], S12, 0x8B44F7AF);
            c = FF(c, d, a, b, x[k + 10], S13, 0xFFFF5BB1);
            b = FF(b, c, d, a, x[k + 11], S14, 0x895CD7BE);
            a = FF(a, b, c, d, x[k + 12], S11, 0x6B901122);
            d = FF(d, a, b, c, x[k + 13], S12, 0xFD987193);
            c = FF(c, d, a, b, x[k + 14], S13, 0xA679438E);
            b = FF(b, c, d, a, x[k + 15], S14, 0x49B40821);
            a = GG(a, b, c, d, x[k + 1], S21, 0xF61E2562);
            d = GG(d, a, b, c, x[k + 6], S22, 0xC040B340);
            c = GG(c, d, a, b, x[k + 11], S23, 0x265E5A51);
            b = GG(b, c, d, a, x[k], S24, 0xE9B6C7AA);
            a = GG(a, b, c, d, x[k + 5], S21, 0xD62F105D);
            d = GG(d, a, b, c, x[k + 10], S22, 0x2441453);
            c = GG(c, d, a, b, x[k + 15], S23, 0xD8A1E681);
            b = GG(b, c, d, a, x[k + 4], S24, 0xE7D3FBC8);
            a = GG(a, b, c, d, x[k + 9], S21, 0x21E1CDE6);
            d = GG(d, a, b, c, x[k + 14], S22, 0xC33707D6);
            c = GG(c, d, a, b, x[k + 3], S23, 0xF4D50D87);
            b = GG(b, c, d, a, x[k + 8], S24, 0x455A14ED);
            a = GG(a, b, c, d, x[k + 13], S21, 0xA9E3E905);
            d = GG(d, a, b, c, x[k + 2], S22, 0xFCEFA3F8);
            c = GG(c, d, a, b, x[k + 7], S23, 0x676F02D9);
            b = GG(b, c, d, a, x[k + 12], S24, 0x8D2A4C8A);
            a = HH(a, b, c, d, x[k + 5], S31, 0xFFFA3942);
            d = HH(d, a, b, c, x[k + 8], S32, 0x8771F681);
            c = HH(c, d, a, b, x[k + 11], S33, 0x6D9D6122);
            b = HH(b, c, d, a, x[k + 14], S34, 0xFDE5380C);
            a = HH(a, b, c, d, x[k + 1], S31, 0xA4BEEA44);
            d = HH(d, a, b, c, x[k + 4], S32, 0x4BDECFA9);
            c = HH(c, d, a, b, x[k + 7], S33, 0xF6BB4B60);
            b = HH(b, c, d, a, x[k + 10], S34, 0xBEBFBC70);
            a = HH(a, b, c, d, x[k + 13], S31, 0x289B7EC6);
            d = HH(d, a, b, c, x[k], S32, 0xEAA127FA);
            c = HH(c, d, a, b, x[k + 3], S33, 0xD4EF3085);
            b = HH(b, c, d, a, x[k + 6], S34, 0x4881D05);
            a = HH(a, b, c, d, x[k + 9], S31, 0xD9D4D039);
            d = HH(d, a, b, c, x[k + 12], S32, 0xE6DB99E5);
            c = HH(c, d, a, b, x[k + 15], S33, 0x1FA27CF8);
            b = HH(b, c, d, a, x[k + 2], S34, 0xC4AC5665);
            a = II(a, b, c, d, x[k], S41, 0xF4292244);
            d = II(d, a, b, c, x[k + 7], S42, 0x432AFF97);
            c = II(c, d, a, b, x[k + 14], S43, 0xAB9423A7);
            b = II(b, c, d, a, x[k + 5], S44, 0xFC93A039);
            a = II(a, b, c, d, x[k + 12], S41, 0x655B59C3);
            d = II(d, a, b, c, x[k + 3], S42, 0x8F0CCC92);
            c = II(c, d, a, b, x[k + 10], S43, 0xFFEFF47D);
            b = II(b, c, d, a, x[k + 1], S44, 0x85845DD1);
            a = II(a, b, c, d, x[k + 8], S41, 0x6FA87E4F);
            d = II(d, a, b, c, x[k + 15], S42, 0xFE2CE6E0);
            c = II(c, d, a, b, x[k + 6], S43, 0xA3014314);
            b = II(b, c, d, a, x[k + 13], S44, 0x4E0811A1);
            a = II(a, b, c, d, x[k + 4], S41, 0xF7537E82);
            d = II(d, a, b, c, x[k + 11], S42, 0xBD3AF235);
            c = II(c, d, a, b, x[k + 2], S43, 0x2AD7D2BB);
            b = II(b, c, d, a, x[k + 9], S44, 0xEB86D391);
            a = AddUnsigned(a, AA);
            b = AddUnsigned(b, BB);
            c = AddUnsigned(c, CC);
            d = AddUnsigned(d, DD);
        }
        let temp = WordToHex(a) + WordToHex(b) + WordToHex(c) + WordToHex(d);
        return temp.toLowerCase();
    }
    BE.crypto.md5 = MD5;
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
    function ConvertToWordArray(string) {
        let lWordCount;
        let lMessageLength = string.length;
        let lNumberOfWords_temp1 = lMessageLength + 8;
        let lNumberOfWords_temp2 = (lNumberOfWords_temp1 - (lNumberOfWords_temp1 % 64)) / 64;
        let lNumberOfWords = (lNumberOfWords_temp2 + 1) * 16;
        let lWordArray = Array(lNumberOfWords - 1);
        let lBytePosition = 0;
        let lByteCount = 0;
        while (lByteCount < lMessageLength) {
            lWordCount = (lByteCount - (lByteCount % 4)) / 4;
            lBytePosition = (lByteCount % 4) * 8;
            lWordArray[lWordCount] = (lWordArray[lWordCount] | (string.charCodeAt(lByteCount) << lBytePosition));
            lByteCount++;
        }
        lWordCount = (lByteCount - (lByteCount % 4)) / 4;
        lBytePosition = (lByteCount % 4) * 8;
        lWordArray[lWordCount] = lWordArray[lWordCount] | (0x80 << lBytePosition);
        lWordArray[lNumberOfWords - 2] = lMessageLength << 3;
        lWordArray[lNumberOfWords - 1] = lMessageLength >>> 29;
        return lWordArray;
    }
    BE.array.convertToWordArray = ConvertToWordArray;
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
    BE.object._handlers = Symbol('handlers');
    function Observer(target) {
        if (!target) {
            throw new Error('\n\t {target} is not specified');
        }
        const handlers = BE.object._handlers;
        target[handlers] = [];
        target.observe = function (handler) {
            this[handlers].push(handler);
        };
        return new Proxy(target, {
            set(target, property, value, receiver) {
                let success = Reflect.set(...arguments);
                if (success) {
                    target[handlers].forEach((handler) => handler(property, value));
                }
                return success;
            },
        });
    }
    BE.object.observer = Observer;
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