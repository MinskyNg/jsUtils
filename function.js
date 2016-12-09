// 函数相关

(function(global) {
    // 缓存slice方法
    var slice = Array.prototype.slice;


    // bind实现
    function bind(fn, ctx) {
        if (typeof fn === 'function') {
            var args = slice.call(arguments, 1);

            return function() {
                return fn.apply(ctx, args.concat(slice.call(arguments)));
            };
        } else {
            throw new Error('fn is not an Function!');
        }
    }


    // 柯里化
    function currying(fn) {
        if (typeof fn === 'function') {
            var args = slice.call(arguments, 1);

            return function () {
                return fn.apply(this, args.concat(slice.call(arguments)));
            };
        } else {
            throw new Error('fn is not an Function!');
        }
    }


    // 反柯里化
    function uncurrying(fn) {
        if (typeof fn === 'function') {
            return Function.prototype.call.bind(fn);
        } else {
            throw new Error('fn is not an Function!');
        }
    }


    // 装饰器
    function wrap(fn, before, after) {
        if (typeof fn === 'function') {
            return function() {
                var ret,
                    args = slice.call(arguments);

                if (typeof before === 'function') {
                    before.apply(this, args);
                }
                ret = fn.apply(this, arguments);
                if (typeof after === 'function') {
                    after.apply(this, [ret].concat(args));
                }
                return ret;
            };
        } else {
            throw new Error('fn is not an Function!');
        }
    }


    // 函数组合 从右到左执行
    function compose() {
        var fns = [];

        for (var i = arguments.length - 1; i >= 0; i--) {
            if (typeof arguments[i] === 'function') {
                fns.push(arguments[i]);
            }
        }

        return function() {
            var ret = fns[0].apply(this, arguments);

            for (var i = 1; i < fns.length - 1; i++) {
                ret = fns[i].call(this, ret);
            }

            return ret;
        };
    }


    // 缓存结果
    function memorize(fn) {
        if (typeof fn === 'function') {
            var cache = {};

            return function() {
                var argStr = JSON.stringify(arguments);
                cache[argStr] = cache[argStr] || fn.apply(this, arguments);
                return cache[argStr];
            };
        } else {
            throw new Error('fn is not an Function!');
        }
    }


    // 一次性函数
    function once(fn) {
        if (typeof fn === 'function') {
            var called = false;

            return function(){
                if(!called) {
                    called = true;
                    return fn.apply(this, arguments);
                }
            };
        } else {
            throw new Error('fn is not an Function!');
        }
    }


    // 函数防抖
    function debounce(fn, delay) {
        if (typeof fn === 'function') {
            var timer;

            return function() {
                var ctx = this,
                    args = arguments;

                clearTimeout(timer);
                timer = setTimeout(function(){
                    fn.apply(ctx, args);
                }, delay || 500);
            };
        } else {
            throw new Error('fn is not an Function!');
        }
    }


    // 函数节流
    function throttle(fn, duration, delay) {
        if (typeof fn === 'function') {
            var timer = null,
                startTime = new Date();

            return function () {
                var ctx = this,
                    args = arguments,
                    curTime = new Date();

                clearTimeout(timer);

                if(curTime - startTime >= duration){
                    fn.apply(ctx, args);
                    startTime = curTime;
                } else {
                    timer = setTimeout(fn, delay);
                }
            };
        } else {
            throw new Error('fn is not an Function!');
        }
    }

    global['functionUtil'] = {
        'bind': bind,
        'currying': currying,
        'uncurrying': uncurrying,
        'wrap': wrap,
        'compose': compose,
        'memorize': memorize,
        'once': once,
        'debounce': debounce,
        'throttle': throttle
    };
})(window);
