// 事件处理相关兼容封装

eventUtil = {
    // 绑定事件
    addListener: function(target, type, handler) {
        if (target.addEventListener) {
            target.addEventListener(type, handler, false);
        } else if (target.attachEvent) {
            // IE事件this默认为window
            target['e' + type + handler] = function(e) {
                handler.call(target, e);
            };
            target.attachEvent('on' + type, target[type + handler]);
        } else {
            target['on' + type] = handler;
        }
    },


    // 解除事件
    removeListener: function(target, type, handler) {
        if (target.removeEventListener) {
            target.removeEventListener(type, handler, false);
        } else if (target.detachEvent) {
            target.detachEvent('on' + type, target['e' + type + handler]);
            target['e' + type + handler] = null;
        } else {
            target['on' + type] = null;
        }
    },


    // 获取事件对象
    getEvent: function(e) {
        return e || window.event;
    },


    // 获取目标对象
    getTarget: function(e) {
        var evt = eventUtil.getEvent(e);
        return evt.target || evt.srcElement;
    },


    // 获取键码
    getKey: function(e) {
        var evt = eventUtil.getEvent(e);
        return evt.keyCode || evt.which || evt.charCode;
    },


    // 获取滚轮方向
    getDelta: function(e) {
        var evt = eventUtil.getEvent(e);
        return evt.detail || (-evt.wheelDelta);
    },


    // 获取相关元素（用于mouseover和mouseout）
    getRelatedTarget: function(e) {
        var evt = eventUtil.getEvent(e);
        return evt.relatedTarget || evt.toElement || evt.fromElement;
    },


    // 停止冒泡
    stopPropagation: function(e) {
        var evt = eventUtil.getEvent(e);
        if (evt.stopPropagation) {
            evt.stopPropagation();
        } else {
            evt.cancelBubble = true;
        }
    },


    // 阻止默认行为
    preventDefault: function(e) {
        var evt = eventUtil.getEvent(e);
        if (evt.preventDefault) {
            evt.preventDefault();
        } else {
            evt.returnValue = false;
        }
    },


    // 触发事件
    trigger: function(target, type) {
        if (target.addEventListener) {
            var evt = document.createEvent('Event');
            evt.initEvent(type, true, true);
            target.dispatchEvent(evt);
        } else if (target.attachEvent) {
            target.fireEvent('on' + type);
        }
    },


    // 事件代理
    on: function(parent, type, handler, validater) {
        parent['on' + type + handler + validater] = function(e) {
            var target = eventUtil.getTarget(e);
            if (validater(target)) {
                return handler.call(target, e);
            }
        };
        eventUtil.addListener(parent, type, parent['on' + type + handler + validater]);
    },


    // 解除事件代理
    off: function(parent, type, handler, validater) {
        eventUtil.removeListener(parent, type, parent['on' + type + handler + validater]);
        parent['on' + type + handler + validater] = null;
    },


    // DOM就绪（DOM树完成）事件
    ready: function (handler) {
        // 非IE
        if (document.addEventListener) {
            document.addEventListener('DOMContentLoaded', function() {
                document.removeEventListener('DOMContentLoaded', arguments.callee, false);
                handler();
            }, false);
        } else if (document.attachEvent) {
            var doc = window.document,
                done = false,
                init = function () {
                if (!done) {
                    done = true;
                    handler();
                }
            };

            // IE8以前
            (function () {
                try {
                    doc.documentElement.doScroll('left');
                } catch (e) {
                    setTimeout(arguments.callee, 50);
                    return;
                }
                init();
            })();

            // IE8
            doc.onreadystatechange = function () {
                if (doc.readyState === 'complete') {
                    doc.onreadystatechange = null;
                    init();
                }
            };
        } else {
            // 完全加载事件
            eventUtil.addListener(window, 'load', function() {
                eventUtil.removeListener(window, 'load', arguments.callee);
                handler();
            });
        }
    },


    // 鼠标滚轮事件
    wheelScroll: function(handler) {
        // firefox浏览器事件名与其他浏览器不同
        if ((navigator.userAgent.toLowerCase().indexOf('firefox') !== -1)) {
            document.addEventListener('DOMMouseScroll', handler, false);
        } else if (document.addEventListener) {
            document.addEventListener('mousewheel', handler, false);
        } else if (document.attachEvent) {
            document.attachEvent('onmousewheel', handler);
        } else {
            document.onmousewheel = handler;
        }
    }
};
