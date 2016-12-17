// 数组相关工具

(function(global) {
    'use strict';

    if (global.arrayUtil) {
        return;
    }


    // 判断是否为数组
    function isArray(arr) {
        return toString.call(arr) === '[object Array]';
    }


    // 判断是否为函数
    function isFunction(fn) {
        return typeof fn === 'function';
    }


    // 遍历
    function each(arr, fn, ctx) {
        if (isArray(arr) && isFunction(fn)) {
            for (var i = 0, len = arr.length; i < len; i++) {
                fn.call(ctx, arr[i], i, arr);
            }
        }
    }


    // 映射
    function map(arr, fn, ctx) {
        var ret = [];
        if (isArray(arr) && isFunction(fn)) {
            for (var i = 0, len = arr.length; i < len; i++) {
                ret.push(fn.call(ctx, arr[i], i, arr));
            }
        }
        return ret;
    }


    // 累积
    function reduce(arr, fn, ctx) {
        var ret;
        if (isArray(arr) && isFunction(fn)) {
            ret = arr[0];
            for (var i = 1, len = arr.length; i < len; i++) {
                ret = fn.call(ctx, ret, arr[i], i, arr);
            }
        }
        return ret;
    }


    // 累积（从右到左）
    function reduceRight(arr, fn, ctx) {
        var ret;
        if (isArray(arr) && isFunction(fn)) {
            ret = arr[arr.length - 1];
            for (var i = arr.length - 2; i >= 0; i--) {
                ret = fn.call(ctx, ret, arr[i], i, arr);
            }
        }
        return ret;
    }


    // 过滤
    function filter(arr, fn, ctx) {
        var ret = [];
        if (isArray(arr) && isFunction(fn)) {
            for (var i = 0, len = arr.length; i < len; i++) {
                if (fn.call(ctx, arr[i], i, arr)) {
                    ret.push(arr[i]);
                }
            }
        }
        return ret;
    }


    // 返回两个数组，一个满足条件另一个不满足
    function partition(arr, fn, ctx) {
        var ret1 = [],
            ret2 = [];
        if (isArray(arr) && isFunction(fn)) {
            for (var i = 0, len = arr.length; i < len; i++) {
                if (fn.call(ctx, arr[i], i, arr)) {
                    ret1.push(arr[i]);
                } else {
                    ret2.push(arr[i]);
                }
            }
        }
        return [ret1, ret2];
    }


    // 数组中有一个满足条件就为true
    function some(arr, fn, ctx) {
        if (isArray(arr) && isFunction(fn)) {
            for (var i = 0, len = this.length; i < len; i++) {
                if (fn.call(ctx, this[i], i, this)) {
                    return true;
                }
            }
        }
        return false;
    }


    // 数组中全部满足条件才为true
    function every(arr, fn, ctx) {
        if (isArray(arr) && isFunction(fn)) {
            for (var i = 0, len = this.length; i < len; i++) {
                if (!fn.call(ctx, this[i], i, this)) {
                    return false;
                }
            }
        }
        return true;
    }


    // 展开
    function flatten(arr) {
        var ret = [];
        if (isArray(arr)) {
            for (var i = 0, len = arr.length; i < len; i++) {
                var item = arr[i];
                if (isArray(item)) {
                    item = flatten(item);
                    for (var j = 0, lem = item.length; j < lem; j++) {
                        ret.push(item[j]);
                    }
                } else {
                    ret.push(item);
                }
            }
        }
        return ret;
    }


    // 去重
    function uniq(arr) {
        var ret = [],
            hash = {};
        if (isArray(arr)) {
            for (var i = 0, len = arr.length; i < len; i++) {
                if (hash[arr[i]] === undefined) {
                    hash[arr[i]] = true;
                    ret.push(arr[i]);
                }
            }
        }
        return ret;
    }


    // 将每个数组中相应位置的值合并在一起
    function zip() {
        var ret = [],
            arg = [],
            tmp,
            i,
            j,
            len,
            lem;
        for (i = 0, len = arguments.length; i < len; i++) {
            if (isArray(arguments[i])) {
                arg.push(arguments[i]);
            }
        }
        lem = arg.length;
        for (i = 0, len = arg[0].length; i < len; i++) {
            tmp = [];
            for (j = 0; j < lem; j++) {
                tmp[j] = arg[j][i];
            }
            ret.push(tmp);
        }
        return ret;
    }


    // 接收两个数组，返回对象的key为前一数组，value为后一数组
    function object(arr1, arr2) {
        var obj = {};
        if (isArray(arr1) && isArray(arr2)) {
            for (var i = 0, len = arr1.length; i < len; i++) {
                obj[arr1[i]] = arr2[i];
            }
        }
        return obj;
    }


    // 返回第一次出现的索引
    function indexOf(arr, item) {
        if (isArray(arr)) {
            for (var i = 0, len = arr.length; i < len; i++) {
                if (arr[i] === item) {
                    return i;
                }
            }
        }
        return -1;
    }


    // 返回最后一次出现的索引
    function lastIndexOf(arr, item) {
        if (isArray(arr)) {
            for (var i = arr.length - 1; i >= 0; i--) {
                if (arr[i] === item) {
                    return i;
                }
            }
        }
        return -1;
    }


    global.arrayUtil = {
        'each': each,
        'map': map,
        'reduce': reduce,
        'reduceRight': reduceRight,
        'filter': filter,
        'partition': partition,
        'some': some,
        'every': every,
        'flatten': flatten,
        'uniq': uniq,
        'zip': zip,
        'object': object,
        'indexOf': indexOf,
        'lastIndexOf': lastIndexOf
    };
})(typeof self === 'undefined' ? typeof global === 'undefined' ? this : global : self);

