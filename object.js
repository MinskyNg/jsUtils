// 对象相关工具

(function(global) {
    'use strict';

    if (global.objectUtil) {
        return;
    }

    var toString = Object.prototype.toString;

    // 原型继承
    function inherit(subType, superType) {
        var prototype;
        function F(){}
        F.prototype = superType.prototype;
        prototype = new F();
        prototype.constructor = subType;
        subType.prototype = prototype;
    }


    // 合并
    function extend() {
        var target = arguments[0],
            options,
            key;

        if (!isObject(target)) {
            target = {};
        }

        for (var i = 1, len = arguments.length; i < len; i++) {
            if (isObject(arguments[i])) {
                options = arguments[i];
                for (key in options) {
                    if (options.hasOwnProperty(key)) {
                        target[key] = options[key];
                    }
                }
            }
        }

        return target;
    }


    // 浅拷贝
    function clone(obj) {
        if (!isObject(obj)) {
            return obj;
        }

        var newObj = {};
        for (var key in obj) {
            if (obj.hasOwnProperty(key)) {
                newObj[key] = obj[key];
            }
        }
        return newObj;
    }


    // 深拷贝
    function deepClone(obj, copy) {
        if (!isObject(obj)) {
            return obj;
        }

        // 防止自身循环引用
        if (copy === obj) {
            return;
        }

        var newObj = {};
        for (var key in obj) {
            if (obj.hasOwnProperty(key)) {
                newObj[key] = deepClone(obj, copy || obj);
            }
        }
        return newObj;
    }


    // 获取所有可枚举属性名
    function keys(obj) {
        var ret = [];
        for (var key in obj) {
            if (obj.hasOwnProperty(key)) {
                ret.push(key);
            }
        }
        return ret;
    }


    // 获取所有可枚举属性值
    function values(obj) {
        var ret = [];
        for (var key in obj) {
            if (obj.hasOwnProperty(key)) {
                ret.push(obj[key]);
            }
        }
        return ret;
    }


    // 把对象转化为[key, value]形式数组
    function pairs(obj) {
        var arr = [];
        for (var key in obj) {
            if (obj.hasOwnProperty(key)) {
                arr.push([key, obj[key]]);
            }
        }
        return arr;
    }


    // 过滤出数组指定的属性或判断函数指定的属性值
    function pick(obj, pickUp) {
        var newObj = {},
            key;

        if (isArray(pickUp)) {
            for (var i = 0, len = pickUp.length; i < len; i++) {
                key = pickUp[i];
                if (obj.hasOwnProperty(key)) {
                    newObj[key] = obj[key];
                }
            }
        } else if (isFunction(pickUp)) {
            for (key in obj) {
                if (obj.hasOwnProperty(key) && pickUp(obj[key])) {
                    newObj[key] = obj[key];
                }
            }
        }

        return newObj;
    }


    // 用def对象填充obj对象中的undefined属性
    function defaults(obj, def) {
        for (var key in def) {
            if (def.hasOwnProperty(key) && !(key in obj)) {
                obj[key] = def[key];
            }
        }
    }


    // 判断是否为对象
    function isObject(obj) {
        return obj instanceof Object;
    }

    // 判断是否为数组
    function isArray(obj) {
        return toString.call(obj) === '[object Array]';
    }


    // 判断是否为函数
    function isFunction(obj) {
        return typeof obj === 'function';
    }


    // 判断是否为字符串
    function isString(obj) {
        return typeof obj === 'string';
    }


    // 判断是否为数值
    function isNumber(obj) {
        return typeof obj === 'number';
    }


    // 判断是否为布尔值
    function isBoolean(obj) {
        return typeof obj === 'boolean';
    }


    // 判断是否为NaN
    function isNaN(obj) {
        return typeof obj === 'number' && +obj !== +obj;
    }


    // 判断是否为DOM元素
    var isElement = (typeof HTMLElement === 'object') ?
        function(obj) { return obj instanceof HTMLElement; } :
        function(obj) { return obj instanceof Object && obj.nodeType === 1 && typeof obj.nodeName === 'string'; };


    // 比较两个对象是否相等
    function isEqual(a, b, aStack, bStack) {
        if (a === b) {
            // 排除0和-0
            return a !== 0 || 1 / a === 1 / b;
        }

        var className = toString.call(a);
        if (className !== toString.call(b)) {
            return false;
        }
        switch (className) {
            case '[object RegExp]':
            case '[object String]':
                return '' + a === '' + b;
            case '[object Number]':
                // 注意NaN
                return (+a !== +a) ? (+b !== +b) : (+a === +b);
            case '[object Date]':
            case '[object Boolean]':
                return +a === +b;
        }

        if (typeof a !== 'object' || typeof b !== 'object' || a.constructor !== b.constructor) {
            return false;
        }

        // 处理自身循环引用
        aStack = aStack || [];
        bStack = bStack || [];
        var len = aStack.length;
        while (len--) {
            if (aStack[len] === a) {
                return bStack[len] === b;
            }
        }

        aStack.push(a);
        bStack.push(b);

        var aKeys = keys(a),
            key,
            size = aKeys.length,
            result = keys(b).length === size;
        if (result) {
            while (size--) {
                key = aKeys[size];
                if (b[key] === undefined || !isEqual(a[key], b[key], aStack, bStack)) {
                    return false
                }
            }
        }

        aStack.pop();
        bStack.pop();

        return result;
    }


    // 判断对象是否为空{}
    function isEmpty(obj) {
        for (var key in obj) {
            if (obj.hasOwnProperty(key)) {
                return false;
            }
        }
        return true;
    }


    global.objectUtil = {
        'inherit': inherit,
        'extend': extend,
        'clone': clone,
        'deepClone': deepClone,
        'keys': keys,
        'values': values,
        'pairs': pairs,
        'pick': pick,
        'defaults': defaults,
        'isObject': isObject,
        'isArray': isArray,
        'isFunction': isFunction,
        'isString': isString,
        'isNumber': isNumber,
        'isBoolean': isBoolean,
        'isNaN': isNaN,
        'isElement': isElement,
        'isEqual': isEqual,
        'isEmpty': isEmpty
    };
})(typeof self === 'undefined' ? typeof global === 'undefined' ? this : global : self);

