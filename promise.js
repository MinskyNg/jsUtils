// Promise/A+规范实现

(function(global){
    'use strict';

    if (global.Promise) {
        return;
    }


    // 选择合适的异步API
    var asyncProcess = (function () {
        if (typeof process === 'object' && process !== null && typeof (process.nextTick) === 'function') {
            return process.nextTick;
        }

        if (typeof (setImmediate) === 'function') {
            return setImmediate;
        }

        return setTimeout;
    }());


    // Promise构造函数
    function Promise(executor) {
        if (typeof executor !== 'function') {
            throw new TypeError('Promise executor ' + executor + ' is not a function');
        }

        var self = this;
        this.status = 'pending'; // Promise的状态
        this.data = undefined;  // Promise的值
        this.onResolvedCallback = []; // resolve状态时的回调函数
        this.onRejectedCallback = []; // reject状态时的回调函数

        // 将Promise状态变为resolved
        function resolve(value) {
            if (value instanceof Promise) {
                return value.then(resolve, reject);
            }
            // 回调需要通过异步方式执行，以保证一致可靠的执行顺序
            asyncProcess(function() {
                if (self.status === 'pending') {
                    self.status = 'resolved';
                    self.data = value;
                    for (var i = 0, len = self.onResolvedCallback.length; i < len; i++) {
                        self.onResolvedCallback[i](value);
                    }
                }
            });
        }

        // 将Promise状态变为rejected
        function reject(reason) {
            asyncProcess(function() {
                if (self.status === 'pending') {
                    self.status = 'rejected';
                    self.data = reason;
                    // 在尾部输出错误
                    if (self.onRejectedCallback.length === 0) {
                        console.error(reason);
                    }
                    for (var i = 0, len = self.onRejectedCallback.length; i < len; i++) {
                        self.onRejectedCallback[i](reason);
                    }
                }
            });
        }

        try {
            executor(resolve, reject);
        } catch(e) {
            reject(e);
        }
    };


    Promise.prototype = {
        then: function(onResolved, onRejected) {
            var self = this;
            var promise2; // then要返回一个新Promise

            // 如果then的参数不是function，需新建函数以传递value或reason
            onResolved = typeof onResolved === 'function' ? onResolved : function(value) { return value; };
            onRejected = typeof onRejected === 'function' ? onRejected : function(reason) {
                throw reason; };

            // 当promise1状态为resolved时
            if (self.status === 'resolved') {
                return promise2 = new Promise(function(resolve, reject) {
                    asyncProcess(function() {
                        try {
                            var returnValue = onResolved(self.data);
                            resolvePromise(promise2, returnValue, resolve, reject);
                        } catch (e) {
                            reject(e);
                        }
                    });
                });
            }

            // 当promise1状态为rejected时
            if (self.status === 'rejected') {
                return promise2 = new Promise(function(resolve, reject) {
                    asyncProcess(function() {
                        try {
                            var returnValue = onRejected(self.data);
                            resolvePromise(promise2, returnValue, resolve, reject);
                        } catch (e) {
                            reject(e);
                        }
                    });
                });
            }

            // 当promise1状态仍为pending时，注册回调到promise1上
            if (self.status === 'pending') {
                return promise2 = new Promise(function(resolve, reject) {
                    self.onResolvedCallback.push(function(value) {
                        asyncProcess(function() {
                            try {
                                var returnValue = onResolved(value);
                                resolvePromise(promise2, returnValue, resolve, reject);
                            } catch (e) {
                                reject(e);
                            }
                        });
                    });

                    self.onRejectedCallback.push(function(reason) {
                        asyncProcess(function() {
                            try {
                                var returnValue = onRejected(reason);
                                resolvePromise(promise2, returnValue, resolve, reject);
                            } catch (e) {
                                reject(e);
                            }
                        });
                    });
                });
            }
        },


        catch: function(onRejected) {
            return this.then(null ,onRejected);
        },


        valueOf: function() {
            return this.data;
        }
    };


    // 返回状态为resolved的Promise
    Promise.resolve = function(value) {
        return new Promise(function(resolve, reject) {
            resolve(value);
        });
    };


    // 返回状态为rejected的Promise
    Promise.reject = function(reason) {
        return new Promise(function(resolve, reject) {
            reject(reason);
        });
    };


    // 数组中所有Promise状态为resolved时才返回
    Promise.all = function(promises) {
        return new Promise(function(resolve, reject) {
            var count = 0,
                len = promises.length,
                values = new Array(len);

            for (var i = 0; i < len; i++) {
                (function(i) {
                    Promise.resolve(promises[i]).then(function(value) {
                        count++;
                        values[i] = value;
                        if (count === len) {
                            return resolve(values);
                        }
                    }, function(reason) {
                        return reject(reason);
                    });
                })(i);
            }
        });
    };


    // 数组中有Promise状态变化时便返回
    Promise.race = function(promises) {
        return new Promise(function(resolve, reject) {
            for (var i = 0, len = promises.length; i < len; i++) {
                Promise.resolve(promises[i]).then(function(value) {
                    return resolve(value);
                }, function(reason) {
                    return reject(reason);
                });
            }
        });
    };


    // 返回永远处于pending的Promise，以阻止后续执行
    Promise.cancel =  function() {
        return new Promise(function(){});
    };


    // 返回deferred对象
    Promise.deferred = Promise.defer = function() {
        var dfd = {};
        dfd.promise = new Promise(function(resolve, reject) {
            dfd.resolve = resolve;
            dfd.reject = reject;
        })
        return dfd;
    }


    // 尝试让promise2接收returnValue状态
    function resolvePromise(promise2, returnValue, resolve, reject) {
        var then;
        var thenCalled = false; // 标志thenable对象是否调用 只能调用一次

        // 防止循环调用
        if (promise2 === returnValue) {
            return reject(new Error('promise circular chain!'));
        }

        if (returnValue instanceof Promise) {
            if (returnValue.status === 'pending') {
                returnValue.then(function(value) {
                    resolvePromise(promise2, value, resolve, reject);
                }, reject);
            } else {
                returnValue.then(resolve, reject);
            }
            return;
        }

        if ((returnValue !== null) && ((typeof returnValue === 'object') || (typeof returnValue === 'function'))) {
            try {
                // 将thenable对象作为Promise对象处理
                then = returnValue.then;
                if (typeof then === 'function') {
                    then.call(returnValue, function(v) {
                        if (thenCalled) return;
                        thenCalled = true;
                        return resolvePromise(promise2, v, resolve, reject);
                    }, function(r) {
                        if (thenCalled) return;
                        thenCalled = true;
                        return reject(r);
                    })
                } else {
                    return resolve(returnValue);
                }
            } catch (e) {
                return reject(e);
            }
        } else {
            return resolve(returnValue);
        }
    }


    global.Promise = Promise;
})(typeof self === 'undefined' ? typeof global === 'undefined' ? this : global : self);

// 测试
var p = new Promise(function(resolve, reject) {
    setTimeout(resolve('success'), 100);
});
p.then(function(value){console.log(value)},function(reason){console.log(reason)});
