// 字符串相关工具

(function(global) {
    'use strict';

    if (global.stringUtil) {
        return;
    }


    // 判断是否为字符串
    function isString(obj) {
        return typeof obj === 'string';
    }


    // 判断字符串开头
    function startsWith(str, prefix) {
        if (isString(str) && isString(prefix)) {
            return str.slice(0, prefix.length) === prefix;
        }
    }


    // 判断字符串结尾
    function endsWith(str, suffix) {
        if (isString(str) && isString(suffix)) {
            return str.slice(str.length - suffix.length) === suffix;
        }
    }


    // 清除字符串两端空格
    function trim(str) {
        if (isString(str)) {
            var tmp =  str.replace(/^\s+/, '');
            var end = tmp.length - 1;
            var ws = /\s/;
            while (ws.test(tmp.charAt(end))) {
                end--;
            }
            return tmp.slice(0, end + 1);
        }
    }


    // 获取字符串在另一字符串中出现次数
    function count(str, c) {
        var count,
            index;
        if (isString(str) && isString(c)) {
            count = 0;
            index = str.indexOf(c);
            while (index !== -1) {
                count++;
                index = str.indexOf(c, index + 1);
            }
        }
        return count;
    }


    // 模板字符串
    var tmplReg = /(\\)?\{([^\{\}\\]+)(\\)?\}/g;
    function render(tmpl, ctx) {
        if (isString(tmpl)) {
            return tmpl.replace(tmplReg, function(word, slash1, token, slash2) {
                // 转义符
                if (slash1 || slash2) {
                    return word.replace('\\', '');
                }
                var props = token.replace(/\s/g, '').split('.');
                var prop = ctx;
                // 逐级查找
                for (var i = 0, len = props.length; i < len; i++) {
                    prop = prop[props[i]];
                    if (prop === undefined || prop === null) {
                        return '';
                    }
                }
                return prop;
            })
        }
    }


    // 字符串转义html标签
    var escapes = {'<':'&lt;','>':'&gt;','&':'&amp;','"':'&quot;'};
    function escape(str) {
        if (isString(str)) {
            return str.replace(/[<>&"]/g, function(c){return escapes[c];});
        }
    }


    // html标签还原字符串
    var unescaples = {'lt':'<','gt':'>','nbsp':' ','amp':'&','quot':'"'};
    function unescape(str) {
        if (isString(str)) {
            return str.replace(/&(lt|gt|nbsp|amp|quot);/g, function(w, c){return unescaples[c];});
        }
    }


    // 字符串反转
    function reverse(str) {
        if (isString(str)) {
            return str.split('').reverse().join('');
        }
    }


    // 字符串重复
    function repeat(str, count) {
        var arr = [];
        if (isString(str) && typeof count === 'number') {
            for (var i = 0; i < count; i++) {
                arr.push(str);
            }
        }
        return arr.join('');
    }


    // 字符串转换成数值
    function toNumber(str) {
        if (isString(str)) {
            var tmp = str.replace(/(^\s*)/g, ''),
                len = str.length,
                num = 0,
                sign = 1,
                i = 0;

            if (tmp[i] === '+') {
                i++;
            } else if (tmp[i] === '-') {
                sign = -1;
                i++;
            }

            while (i < len && tmp[i] >= '0' && tmp[i] <= '9') {
                num = num * 10 + (tmp[i] - '0');
                i++;
            }

            return num * sign;
        }
    }


    // 首字母大写，其余小写
    function capitalize(str) {
        var arr = [];
        if (isString(str)) {
            arr.push(str[0].toUpperCase());
            for (var i = 1, len = str.length; i < len; i++) {
                var ch = str[i];
                if (ch >= 'A' && ch <= 'Z') {
                    arr.push(ch.toLowerCase());
                } else {
                    arr.push(ch);
                }
            }
        }
        return arr.join('');
    }


    // 判断是否为纯字母
    function isAlpha(str) {
        if (isString(str)) {
            return !/[^A-Za-z]/g.test(str);
        }
    }


    // 判断是否为数字
    function isNumeric(str) {
        if (isString(str)) {
            return !/[^0-9]/g.test(str);
        }
    }


    // 判断是否为空白串
    function isBlank(str) {
        if (isString(str)) {
            return !/[^\s]/g.test(str);
        }
    }


    // 判断是否为全小写
    function isLower(str) {
        if (isString(str)) {
            return !/[A-Z]/g.test(str);
        }
    }


    // 判断是否为全大写
    function isUpper(str) {
        if (isString(str)) {
            return !/[a-z]/g.test(str);
        }
    }


    // 判断是否为首字母大写，其余小写
    function isCapitalize(str) {
        if (isString(str)) {
            return /[A-Z]/.test(str[0]) && !/[A-Z]/g.test(str.substr(1));
        }
    }


    global.stringUtil = {
        'startsWith': startsWith,
        'endsWith': endsWith,
        'trim': trim,
        'count': count,
        'render': render,
        'escape': escape,
        'unescape': unescape,
        'reverse': reverse,
        'repeat': repeat,
        'toNumber': toNumber,
        'capitalize': capitalize,
        'isAlpha': isAlpha,
        'isNumeric': isNumeric,
        'isBlank': isBlank,
        'isLower': isLower,
        'isUpper': isUpper,
        'isCapitalize': isCapitalize
    };
})(typeof self === 'undefined' ? typeof global === 'undefined' ? this : global : self);

