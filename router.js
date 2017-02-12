// 简易前端路由(基于hash)

(function(window, location) {
    'use strict';

    if (window.routerUtil) {
        return;
    }


    function routerUtil(base, before, after) {
        var self = this;

        this.routes = [];  // 路由表
        if (arguments.length === 2) {
            this.base = '/'; // 根路由
            this.before = this.setBefore(base);  // 前置钩子
            this.after = this.setAfter(before);  // 后置钩子
        } else {
            this.base = base;
            this.before = this.setBefore(before);
            this.after = this.setAfter(after);
        }

        window.addEventListener('hashchange', function() {
            self.reload();
        }, false);
    }


    routerUtil.prototype = {
        // 添加路由 支持数组形式
        add: function(path, handler) {
            if (typeof path === 'string' && typeof handler === 'function') {
                this.routes.push({
                    path: path,
                    handler: handler
                });
            } else if (Object.prototype.toString.call(path) === '[object Array]') {
                for (var i = 0, len = path.length; i < len; i++) {
                    this.routes.push(path[i]);
                }
            }
        },


        // 移除路由
        remove: function(path) {
            if (typeof path === 'string') {
                var routes = this.routes,
                    i = 0;

                while (routes[i] !== undefined) {
                    if (routes.path === path) {
                        routes.splice(i, 1);
                    } else {
                        i++;
                    }
                }
            }
        },


        // 跳转
        go: function(path, params) {
            if (typeof path === 'string') {
                if (params !== undefined) {
                    location.hash = path + '?' + this.getQuery(params);
                } else {
                    location.hash = path;
                }
            }

        },


        // 重载
        reload: function() {
            var hash = location.hash.replace(/^#/, '').split('?'),
                path = decodeURIComponent(hash[0]),
                params = getParams(hash[1]),
                routes = this.routes;

            for (var i = 0, len = routes.length; i < len; i++) {
                if (routes[i].path === path) {
                    self.before && self.before(path, params);
                    routes[i].handler(path, params);
                    self.after && self.after(path, params);
                    return; // 只匹配第一个
                }
            }

            // 无法匹配则跳转首页
            go(self.index);
        },


        // 将查询字符串转换为参数
        getParams: function(query) {
            var arr = query.split('&'),
                params = {},
                p;

            for (var i = 0, len = arr.length; i < len; i++) {
                p = arr[i].indexOf('=');
                params[decodeURIComponent(arr[i].slice(0, p))] = decodeURIComponent(arr[i].slice(p+1));
            }

            return params;
        },


        // 将参数转换为查询字符串
        getQuery: function(params) {
            var arr = [];

            for (var key in params) {
                if (params.hasOwnProperty(key)) {
                    arr.push(encodeURIComponent(key) + '=' + encodeURIComponent(params[key]));
                }
            }

            return arr.join('&');
        },


        // 前置钩子
        setBefore: function(before) {
            if (typeof before === 'function') {
                this.before = before;
            }
        },


        // 后置钩子
        setAfter: function(after) {
            if (typeof after === 'function') {
                this.after = after;
            }
        },
    };


    window.routerUtil = routerUtil;
})(window, location);


// 简易前端路由(基于history API)
