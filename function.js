// 函数相关

(function(global) {
    // 缓存slice方法
    var slice = Array.prototype.slice;


    // bind实现
    function bind(fn, ctx) {
        var args = slice.call(arguments, 1);

        return function() {
            return fn.apply(ctx, args.concat(slice.call(arguments)));
        };
    }


    // 柯里化
    function currying(fn) {
        var args = slice.call(arguments, 1);

        return function () {
            return fn.apply(this, args.concat(slice.call(arguments)));
        };
    }


    // 反柯里化
    function uncurrying(fn) {
        return Function.prototype.call.bind(fn);
    }


    // 装饰器
    function wrap(fn, before, after) {
        return function() {
            var ret,
                args = slice.call(arguments);

            before && before.apply(this, args);
            ret = fn.apply(this, arguments);
            after && after.apply(this, [ret].concat(args));
            return ret;
        };
    }


    // 函数组合 从右到左执行
    function compose() {
        var fns = [];

        for (var i = arguments.length - 1; i >= 0; i--) {
            fns.push(arguments[i]);
        }

        return function() {
            var ret = fns[0].apply(this, arguments);

            for (var i = 1; i < fns.length - 1; i++) {
                ret = fns[i].call(this, ret);
            }

            return ret;
        }
    }


    // 缓存结果
    function memorize(fn) {
        var cache = {};

        return function() {
            var argStr = JSON.stringify(arguments);
            cache[argStr] = cache[argStr] || fn.apply(this, arguments);
            return cache[argStr];
        };
    }


    // 一次性函数
    function once(fn) {
        var called = false;

        return function(){
            if(!called) {
                called = true;
                return fn.apply(this, arguments);
            }
        }
    }


    // 函数防抖
    function debounce(fn, delay) {
        var timer;

        return function(){
            var ctx = this,
                args = arguments;

            clearTimeout(timer);
            timer = setTimeout(function(){
                fn.apply(ctx, args);
            }, delay || 500);
        }
    }


    // 函数节流
    function throttle(fn, duration, delay) {
        var timer = null,
            startTime = new Date();

        return function (){
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
