// cookie操作

(function(window, document) {
    'use strict';

    if (window.cookieUtil) {
        return;
    }


    // cookie集合对象
    var cookies = {},
        arr,
        p;

    if (document.cookie) {
        arr = document.cookie.split('; ');
        for (var i = 0, len = arr.length; i < len; i++) {
            p = arr[i].indexOf('=');
            cookies[decodeURIComponent(arr[i].substring(0, p))] = decodeURIComponent(arr[i].substring(p + 1));
        }
    }


    // 获取指定cookie
    function get(key) {
        return cookies[key] || null;
    }


    // 获取全部cookie
    function getAll() {
        return cookies;
    }


    // 设置cookie
    function set(key, value, opts) {
        if (key !== undefined && value !== undefined) {
            var cookie = encodeURIComponent(key) + '=' + encodeURIComponent(value);
            if (opts) {
                if (opts.maxAge !== undefined) {
                    cookie += '; max-age=' + opts.maxAge;
                }
                if (opts.path !== undefined) {
                    cookie += '; path=' + opts.path;
                }
                if (opts.domain !== undefined) {
                    cookie += '; domain=' + opts.domain;
                }
                if (opts.secure !== undefined) {
                    cookie += '; secure';
                }
            }
            cookies[key] = value;
            document.cookie = cookie;
            return cookie;
        }
    }


    // 删除cookie
    function remove(key) {
        if (cookies[key] !== undefined) {
            document.cookie = key + '=; max-age=0';
            delete cookies[key];
        }
    }


    // 清空cookie
    function clear() {
        for (var key in cookies) {
            document.cookie = key + '=; max-age=0';
        }
        cookies = {};
    }


    window.cookieUtil = {
        'get': get,
        'getAll': getAll,
        'set': set,
        'remove': remove,
        'clear': clear
    };
})(window, document);
