// 部分DOM操作封装

(function(window, document) {
    'use strict';

    if (window.domUtil) {
        return;
    }


    // 向指定容器开头添加元素
    function prependChild(newEl, el) {
        var firstEl = firstChild(el);
        if (firstEl) {
            el.insertBefore(newEl, firstEl);
        } else {
            el.appendChild(newEl);
        }
    }


    // 向容器中某个元素之前添加元素
    function insertBefore(newEl, el) {
        el.parentNode.insertBefore(newEl, el);
    }


    // 向容器中某个元素之后添加元素
    function insertAfter(newEl, el) {
        var nextEl = next(el);
        if (nextEl) {
            el.parentNode.insertBefore(newEl, nextEl);
        } else {
            el.parentNode.appendChild(newEl);
        }
    }


    // 获取子元素
    function children(el) {
        if (el.children) {
            children = function(el) {
                return el.children;
            };
        } else {
            children = function(el) {
                var arr = [];
                var nodeList = el.childNodes;
                for (var i = 0, len = nodeList.length; i < len; i++) {
                    if (nodeList[i].nodeType === 1) {
                        arr.push(nodeList[i]);
                    }
                }
                return arr;
            };
        }
        return children(el);
    }


    // 获取第一个子元素
    function firstChild(el) {
        if (el.children) {
            firstChild = function(el) {
                return el.children[0];
            };
        } else {
            firstChild = function(el) {
                var nodeList = el.childNodes;
                for (var i = 0, len = nodeList.length; i < len; i++) {
                    if (nodeList[i].nodeType === 1) {
                        return nodeList[i];
                    }
                }
            };
        }
        return firstChild(el);
    }


    // 获取最后一个子元素
    function lastChild(el) {
        if (el.children) {
            lastChild = function(el) {
                return el.children[el.children.length - 1];
            };
        } else {
            lastChild = function(el) {
                var nodeList = el.childNodes;
                for (var i = nodeList.length - 1; i >= 0; i--) {
                    if (nodeList[i].nodeType === 1) {
                        return nodeList[i];
                    }
                }
            };
        }
        return lastChild(el);
    }


    // 获取相邻前兄弟元素
    function prev(el) {
        if (el.previousElementSibling) {
            prev = function(el) {
                return el.previousElementSibling;
            };
        } else {
            prev = function(el) {
                var preEl = el.previousSibling;
                while (preEl) {
                    if (preEl.nodeType === 1) {
                        return preEl;
                    }
                    preEl = preEl.previousSibling;
                }
            };
        }
        return prev(el);
    }


    // 获取所有前兄弟元素
    function prevAll(el) {
        var preEls = [];
        var preEl = prev(el);
        while (preEl) {
            preEls.push(preEl);
            preEl = prev(preEl);
        }
        return preEls.reverse();
    }


    // 获取相邻后兄弟元素
    function next(el) {
        if (el.nextElementSibling) {
            next = function(el) {
                return el.nextElementSibling;
            };
        } else {
            next = function(el) {
                var nextEl = el.nextSibling;
                while (nextEl) {
                    if (nextEl.nodeType === 1) {
                        return nextEl;
                    }
                    nextEl = nextEl.nextSibling;
                }
            };
        }
        return next(el);
    }


    // 获取所有后兄弟元素
    function nextAll(el) {
        var nextEls = [];
        var nextEl = next(el);
        while (nextEl) {
            nextEls.push(nextEl);
            nextEl = next(nextEl);
        }
        return nextEls;
    }


    // 获取前后相邻兄弟元素
    function sibling(el) {
        return [prev(el), next(el)];
    }


    // 获取所有前后相邻兄弟元素
    function siblings(el) {
        return prevAll(el).concat(nextAll(el));
    }


    // 获取或设置元素内容
    function html(el, h) {
        if (h === undefined) {
            return el.innerHtml;
        }
        el.innerHtml = h;
    }


    // 获取或设置元素文本
    function text(el, t) {
        if (el.textContent) {
            text = function(el, t) {
                if (t === undefined) {
                    return el.textContent;
                }
                el.textContent = t;
            };
        } else {
            text = function(el, t) {
                if (t === undefined) {
                    return el.innerText;
                }
                el.innerText = t;
            };
        }
        return text(el, t);
    }


    // 获取或设置元素属性
    function attr(el, attr, value) {
        if (value === undefined) {
            return el.getAttribute(attr);
        }
        el.setAttribute(attr, value);
    }


    // 获取或设置表单元素值
    function val(el, value) {
        if (value == undefined) {
            return el.value;
        }
        el.value = value;
    }


    // 获取或设置元素样式
    function style(el, attr, value) {
        if (value === undefined) {
            return window.getComputedStyle ? window.getComputedStyle(el, null)[attr] : el.currentStyle[attr];
        }
        if (attr === 'float') {
            el['style']['cssFloat'] = value;
            el['style']['styleFloat'] = value;
            return;
        }
        var reg = /^(width|height|top|bottom|left|right|((margin|padding)(Top|Bottom|Left|Right)?))$/;
        if (!/px$/.test(value) && reg.test(attr)) {
            value += 'px';
        }
        el['style'][attr] = value;
    }


    // 通过类名获取元素集合
    function getElementsByClass(el, cls) {
        var ret = [];
        var els = el.getElementsByTagName('*');
        for (var i = 0, len = els.length; i < len; i++) {
            if (hasClass(el, cls)) {
                ret.push(els[i]);
            }
        }
        return ret;
    }


    // 判断元素是否含有指定类名
    function hasClass(el, cls) {
        return el.className.indexOf(cls) !== -1;
    }


    // 给元素添加指定类名
    function addClass(el, cls) {
        if (!hasClass(el, cls)) {
            el.className += ' ' + cls;
        }
    }


    // 移除元素指定类名
    function removeClass(el, cls) {
        if (hasClass(el, cls)) {
            el.className = el.className.replace(new RegExp('(^| +)' + cls + '( +|$)', 'g'), ' ');
        }
    }


    // 类名存在则移除，不存在则添加
    function toggleClass(el, cls) {
        if (hasClass(el, cls)) {
            removeClass(el, cls);
        } else {
            addClass(el, cls);
        }
    }


    window.domUtil = {
        'prependChild': prependChild,
        'insertBefore': insertBefore,
        'insertAfter': insertAfter,
        'children': children,
        'firstChild': firstChild,
        'lastChild': lastChild,
        'prev': prev,
        'prevAll': prevAll,
        'next': next,
        'nextAll': nextAll,
        'sibling': sibling,
        'siblings': siblings,
        'html': html,
        'text', text,
        'attr': attr,
        'val': val,
        'style': style,
        'getElementsByClass': getElementsByClass,
        'hasClass': hasClass,
        'addClass': addClass,
        'removeClass': removeClass,
        'toggleClass': toggleClass
    };
})(window, document);
