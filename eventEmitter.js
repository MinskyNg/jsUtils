// 事件发射器

(function(global) {
    'use strict';

    if (global.EventEmitter) {
        return;
    }


    // 选择合适的异步API
    var asyncProcess = (function() {
        if (typeof process === 'object' && process !== null && typeof (process.nextTick) === 'function') {
            return process.nextTick;
        }

        if (typeof (setImmediate) === 'function') {
            return setImmediate;
        }

        return setTimeout;
    }());


    var eventList = {}; // 事件列表

    var EventEmitter = {
        // 绑定事件处理
        on: function(type, fn, ctx, once) {
            if (!type || typeof fn !== 'function') {
                return;
            }

            if (eventList[type] !== undefined) {
                eventList[type].push({
                    fn: fn,
                    ctx: ctx,
                    once: once
                });
            } else {
                eventList[type] = [{
                    fn: fn,
                    ctx: ctx,
                    once: once
                }];
            }
        },


        // 触发事件
        emit: function(type, args) {
            var emitSync = this.emitSync;
            asyncProcess(function() {
                emitSync(type, args);
            });
        },


        // 同步触发事件
        emitSync: function(type, args) {
            var events,
                handler;

            if (eventList[type] !== undefined) {
                events = eventList[type];

                for (var i = 0, len = events.length; i < len; i++) {
                    handler = events[i];
                    handler.fn.apply(handler.ctx, args);
                    if (handler.once) {
                        i--;
                        len--;
                        events.splice(i, 1);
                    }
                }
            }
        },


        // 解除事件绑定
        off: function(type, fn) {
            var events;

            if (eventList[type] !== undefined) {
                events = eventList[type];

                for (var i = 0, len = events.length; i < len; i++) {
                    if (events[i].fn === fn) {
                        events.splice(i, 1);
                        return true;
                    }
                }
            }

            return false;
        },


        // 清除事件
        clear: function(type) {
            if (eventList[type] !== undefined) {
                delete eventList[type];
                return true;
            }
            return false;
        },


        // 返回所有事件
        events: function() {
            var keys = [];
            for (var key in eventList) {
                keys.push(key);
            }
            return keys;
        },


        // 返回事件所有监听器
        listeners: function(type) {
            return eventList[type];
        }
    };


    global.EventEmitter = EventEmitter;
})(typeof self === 'undefined' ? typeof global === 'undefined' ? this : global : self);


// 测试
var c = 0;
var fn = function(a) {
    c = a + this.b;
}
var ctx = {b: 4};

EventEmitter.on('add', fn, ctx, true);
EventEmitter.emit('add', [1]);
// 触发前
console.log(c);
console.log(EventEmitter.listeners('add'));
// 触发后
setTimeout(function() {
    console.log(c);
    console.log(EventEmitter.listeners('add'));
}, 3);
