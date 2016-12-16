// 事件兼容处理工具

(function(window, document) {
    'use strict';

    if (window.eventUtil) {
        return;
    }


    // 绑定事件 先做一次能力检测
    var addListener = (function() {
        if (document.addEventListener) {
            return function(target, type, handler) {
                target.addEventListener(type, handler, false);
            };
        }

        if (document.attachEvent) {
            return function(target, type, handler) {
                // IE事件this默认为window
                target['e' + type + handler] = function(e) {
                    handler.apply(target, arguments);
                };
                target.attachEvent('on' + type, target[type + handler]);
            };
        }

        return function(target, type, handler) {
            target['on' + type] = handler;
        };
    })();


    // 解除事件 先做一次能力检测
    var removeListener = (function() {
        if (document.removeEventListener) {
            return function(target, type, handler) {
                target.removeEventListener(type, handler, false);
            };
        }

        if (document.detachEvent) {
            return function(target, type, handler) {
                target.detachEvent('on' + type, target['e' + type + handler]);
                target['e' + type + handler] = null;
            };
        }

        return function(target, type, handler) {
            target['on' + type] = null;
        };
    })();


    // 获取事件对象
    function getEvent(e) {
        return e || window.event;
    }


    // 获取目标对象
    function getTarget(e) {
        var evt = getEvent(e);
        return evt.target || evt.srcElement;
    }


    // 获取键码
    function getKey(e) {
        var evt = getEvent(e);
        return evt.keyCode || evt.which || evt.charCode;
    }


    // 获取滚轮方向
    function getDelta(e) {
        var evt = getEvent(e);
        return evt.detail || (-evt.wheelDelta);
    }


    // 获取相关元素（用于mouseover和mouseout）
    function getRelatedTarget(e) {
        var evt = getEvent(e);
        return evt.relatedTarget || evt.toElement || evt.fromElement;
    }


    // 停止冒泡
    function stopPropagation(e) {
        var evt = getEvent(e);
        if (evt.stopPropagation) {
            evt.stopPropagation();
        } else {
            evt.cancelBubble = true;
        }
    }


    // 阻止默认行为
    function preventDefault(e) {
        var evt = getEvent(e);
        if (evt.preventDefault) {
            evt.preventDefault();
        } else {
            evt.returnValue = false;
        }
    }


    // 触发事件
    function trigger(target, type) {
        if (target.addEventListener) {
            var evt = document.createEvent('Event');
            evt.initEvent(type, true, true);
            target.dispatchEvent(evt);
        } else if (target.attachEvent) {
            target.fireEvent('on' + type);
        }
    }


    // 只触发一次的事件
    function one(target, type, handler) {
        target['on' + type + handler] = function(e) {
            handler.apply(target, arguments);
            removeListener(target, type, target['on' + type + handler]);
            target['on' + type + handler] = null;
        };
        addListener(target, type, target['on' + type + handler]);
    }


    // 事件代理
    function on(parent, type, handler, validater) {
        parent['on' + type + handler + validater] = function(e) {
            var target = getTarget(e);
            if (validater(target)) {
                return handler.apply(target, arguments);
            }
        };
        addListener(parent, type, parent['on' + type + handler + validater]);
    }


    // 解除事件代理
    function off(parent, type, handler, validater) {
        removeListener(parent, type, parent['on' + type + handler + validater]);
        parent['on' + type + handler + validater] = null;
    }


    // DOM就绪（DOM树完成）事件
    function ready(handler) {
        // 非IE
        if (document.addEventListener) {
            document.addEventListener('DOMContentLoaded', function() {
                document.removeEventListener('DOMContentLoaded', ready, false);
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
                    setTimeout(ready, 50);
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
            addListener(window, 'load', function() {
                removeListener(window, 'load', ready);
                handler();
            });
        }
    }


    // 事件多个处理器切换
    function toggle(target, type) {
        var fnArr = Array.prototype.slice.call(arguments, 2);
        var toggles = fnArr.length;
        var i = 0;

        if (toggles < 1) {
            return;
        }

        var handler = function(e) {
            fnArr[(i % toggles) + 2].apply(target, arguments);
            i++;
        };

        addListener(target, type, handler);
    }


    // hover事件
    function hover(target, handleOver, handleOut) {
        addListener(target, 'mouseenter', handleOver);
        addListener(target, 'mouseleave', handleOut || handleOver);
    }


    // 鼠标滚轮事件
    function wheelScroll(target, handler) {
        // firefox浏览器事件名与其他浏览器不同
        if ((navigator.userAgent.toLowerCase().indexOf('firefox') !== -1)) {
            target.addEventListener('DOMMouseScroll', handler, false);
        } else if (target.addEventListener) {
            target.addEventListener('mousewheel', handler, false);
        } else if (target.attachEvent) {
            target.attachEvent('onmousewheel', handler);
        } else {
            target.onmousewheel = handler;
        }
    }


    // 旧浏览器的拖拽实现
    function drag(target, dragStart, dragMove, dragEnd) {
        var handleMouseDown = function(e) {
            if(!e) {
                // 防止IE文字选中
                target.onselectstart = function() {
                    return false;
                };
            }
            var evt = getEvent(e);
            // 鼠标相对物体距离
            var disX = evt.clientX - target.offsetLeft;
            var disY = evt.clientY - target.offsetTop;
            dragStart(e);


            // 鼠标移动 开始拖动目标
            addListener(document, 'mousemove', handleMouseMove);

            // 鼠标松开 拖拽结束
            addListener(document, 'mouseup', handleMouseUp);
        };


        var handleMouseMove = function(e) {
            var evt = getEvent(e);
            // 改变目标位置
            target.style.left = evt.clientX - disX + 'px';
            target.style.top = evt.clientY - disY + 'px';
            // 将位置参数传给回调函数
            dragMove(e, evt.clientX - disX, evt.clientY - disY);
        };


        var handleMouseUp = function(e) {
            removeListener(document, 'mousemove', handleMouseMove);
            removeListener(document, 'mouseup', handleMouseUp);
            dragEnd(e);
        };

        // 鼠标按下 拖拽开始
        addListener(target, 'mousedown', handleMouseDown);
    }


    window.eventUtil = {
        'addListener': addListener,
        'removeListener': removeListener,
        'getEvent': getEvent,
        'getTarget': getTarget,
        'getKey': getKey,
        'getDelta': getDelta,
        'getRelatedTarget': getRelatedTarget,
        'stopPropagation': stopPropagation,
        'preventDefault': preventDefault,
        'trigger': trigger,
        'one': one,
        'on': on,
        'off': off,
        'ready': ready,
        'toggle': toggle,
        'hover': hover,
        'wheelScroll': wheelScroll,
        'drag': drag
    };
})(window, document);

