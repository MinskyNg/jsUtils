// 简易模板引擎(基于正则)
// <% * %>内为JavaScript语句
// <%= * %>内为JavaScript变量或表达式

(function(global) {
    'use strict';

    if (global.templateUtil) {
        return;
    }

    // 匹配正则表达式
    var reg = /<%=([\s\S]+?)%>|<%([\s\S]+?)%>|$/g;
    // 特殊字符处理
    var escaper = /\\|'|\r|\n|\t|\u2028|\u2029/g;


    /**
     * 模板解析函数
     * @param {string} tpl 模板数据
     * @param  {object} data 配置参数
     * @return {object} target 载入字符串的dom节点
     */
    var templateUtil = function(tpl, data, target) {
        var cursor = 0; // 扫描记录
        var code = "var htmlText = '';with(data || {}) { htmlText += '"; // 代码字符串

        tpl.replace(reg, function(match, expr, stmt, index){
            code += tpl.slice(cursor, index).replace(escaper, '');

            // 语句
            if (stmt) {
                code += "';" + stmt + "htmlText += '";
            }
            // 变量或表达式
            if (expr) {
                code += "' + " + expr + " + '";
            }

            cursor = index + match.length;
            return;
        });

        // 代码最后应返回htmlText
        code += "';}return htmlText;";

        // 渲染函数
        var render = function(data, target) {
            var string = new Function('data', code)(data);

            if (target !== undefined) {
                target.innerHTML = string;
            }

            return string;
        };

        return data ? render(data, target) : render;
    };


    global.templateUtil = templateUtil;
})(typeof self === 'undefined' ? typeof global === 'undefined' ? this : global : self);


var tmpl = '<ul><% for (var i = 0, len = arr.length; i < len; i++){ %><li><%= arr[i] %></li><% } %></ul>',
    data = {arr: [1, 2, 3]},
    render = templateUtil(tmpl); // 缓存代码字符串

console.log(render(data));
console.log(templateUtil(tmpl, data)); // 直接执行


// 简易模板引擎(基于编译原理)
