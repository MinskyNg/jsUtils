// 模块加载器(参考http://www.cnblogs.com/dojo-lzz/p/5138108.html)

(function(window, document) {
    'use strict';

    // head节点
    var docHead = document.getElementsByTagName('head')[0];

    var modules = {}, // 已加载模块信息
        loadings = [], // 正在加载模块id
        loadedJs = [], // 已开始加载模块id
        parsedConfig = {
            baseUrl: './', // 所有模块的查找根路径
            paths: {}, // 模块路径映射
            shim: {}, // 为非AMD规范模块做依赖和导出配置
            map: {} // 模块版本映射
        }, // 配置项
        hasCircle = false; // 依赖循环标志


    // 定义模块方法
    var define = function(id, deps, factory) {
        if (arguments.length < 2) {
            throw new Error('the number of parameters is incorrect!');
        }

        if (typeof id !== 'string' && arguments.length === 2) {
            factory = deps;
            deps = id;
            id = undefined;
        }

        var id = id || getCurrentScript();
        if (modules[id]) {
            throw new Error('multiple define module: ' + id);
        }

        var mId = getModuleId(id);
        // 替换依赖为特定版本
        if (mId || parsedConfig.shim[id]) {
            mId = mId || id;
            var maping = getMapSetting(mId);
            if (maping) {
                deps = deps.map(function(dep) {
                    return maping[dep] || dep;
                });
            }
        }

        if (!hasCircle) {
            require(deps, factory, id);
        }
    };


    define.amd = {};


    // 引用模块方法
    var require = function(deps, callback, parent){
        var id = parent || 'REQUIRE' + Date.now(), // 生成唯一标识
            count = 0, // 已加载依赖
            depCount = deps.length, // 依赖总数
            depsClone = deps.slice(); // 保留原始dep的模块id


        // dep为非绝对路径形式，而modules的key需要绝对路径
        deps = deps.map(function(dep) {
            // 路径已定义
            if (modules[dep] || parsedConfig.paths[dep]) {
                return dep;
            }

            // 来自直接require，则相对baseUrl
            if (/^REQUIRE/.test(id)) {
                return getDepUrl(dep, parsedConfig.baseUrl);
            }

            // 来自define，相对父模块路径
            var paths = parent.split('/');
            paths.pop();
            return getDepUrl(dep, paths.join('/'));
        });

        var module = {
            id: id, // 模块的唯一标识
            deps: deps, // 模块依赖标识数组
            factory: callback, // 模块执行函数
            state: 1, // 模块状态 1为已注册 2为已执行
            export: null // 模块输出对象
        };

        modules[id] = module;

        // 检查是否依赖循环
        if (checkCircleRef(id, id)) {
            hasCircle = true;
            return;
        }

        // 获取所有依赖
        for (var i = 0, len = deps.length; i < len; i++) {
            var dep = deps[i];
            if (modules[dep] && modules[dep].state === 2) {
                count++;
            } else if (!(modules[dep] && modules[dep].state === 1) && loadedJs.indexOf(dep) === -1) {
                loadJS(dep, depsClone[i]);
                loadedJs.push(dep);
            }
        }


        // 如果依赖模块被执行完毕，就执行模块的factory函数
        // 否则把模块id放入加载队列中，并执行依赖检查
        if (count === depCount) {
            callFactory(module);
        } else {
            loadings.push(id);
            checkDeps();
        }
    };


    // 配置模块
    require.config = function(config) {
        // 设置baseUrl
        if (config.baseUrl) {
            // 获取当前目录路径
            var currentDir = getCurrentScript().split('/');
            currentDir.pop();
            parsedConfig.baseUrl = getAbsUrl(currentDir.join('/'), config.baseUrl);
        }

        // 设置paths
        parsedConfig.paths = {};
        if (config.paths) {
            for (var p in config.paths) {
                parsedConfig.paths[p] = /^http(s)?/.test(config.paths[p]) ? config.paths[p] : getAbsUrl(burl, config.paths[p]);
            }
        }

        // 设置map
        parsedConfig.map = {};
        if (config.map) {
            parsedConfig.map = config.map;
        }

        // 设置shim
        parsedConfig.shim = {};
        if (config.shim) {
            parsedConfig.shim = config.shim;
            for (var p in config.shim) {
                var shimModule = config.shim[p];
                // 用AMD规范执行shim模块
                define(p, shimModule.deps, function() {
                    var exports;
                    if (shimModule.init) {
                        exports = shimModule.init.apply(shimModule, arguments);
                    }
                    shimModule.exports = exports;
                });
            }
        }
    }


    // 获取已加载模块id
    function getModuleId(url) {
        var script = document.querySelector('script[src="' + url + '"]');
        if (script) {
            return script.getAttribute('data-moduleId');
        } else {
            return null;
        }
    };


    // 获取依赖特定版本
    function getMapSetting(id) {
        if (parsedConfig.map[id]) {
            return parsedConfig[id];
        } else if (parsedConfig.map['*']) {
            return parsedConfig.map['*']; // 对于所有模块通用
        } else {
            return null;
        }
    };


    // 检查是否出现依赖循环
    function checkCircleRef(start, target){
        var m = modules[start];
        if (!m) {
            return false;
        }

        var deps = m.deps.map(function(dep) {
            return modules[dep] || null;
        });

        // 检查依赖项的依赖项
        return deps.some(function(m) {
            if (!m) {
                return false;
            }
            return m.deps.some(function(dep) {
                var equal = dep === target;
                if (equal) {
                    throw new Error('module circle reference: ', target, m.id);
                }
                return equal;
            });// 递归检查依赖项的依赖项的依赖项
        }) ? true : deps.some(function(m) {
            if (!m) {
                return false;
            }
            return m.deps.some(function(dep) {
                return checkCircleRef(dep, target);
            });
        });
    };


    // 获取模块绝对路径
    function getAbsUrl(base, target) {
        var bPath = base.replace(/\/$/, '').split('/');
        var tPath = target.split('/');
        while (tPath[0] !== null && tPath[0] !== undefined) {
            if (tPath[0] === '.') {
                return bPath.join('/') + '/' + tPath.slice(1).join('/');
            // 向上级目录
            } else if (tPath[0] === '..') {
                bPath.pop();
                tPath.shift();
            } else {
                return bPath.join('/') + '/' + tPath.join('/');
            }
        }
    };


    // 获取依赖模块相对路径
    function getDepUrl(moduleId, relative) {
        var mPath = moduleId.split('/');
        if (mPath[0] === '.' || mPath[0] === '..') {
            return getAbsUrl(relative, moduleId);
        } else {
            return getAbsUrl(parsedConfig.baseUrl, moduleId);
        }
    };


    // 加载模块(动态创建script标签方式)
    function loadJS(url, id) {
        var script = document.createElement('script');
        script.setAttribute('data-moduleId', id); // 绑定模块id
        script.type = 'text/javascript';
        script.async = true;
        script.src = (parsedConfig.paths[url] || url) + '.js';

        script.onload = function() {
            // 出现依赖循环 停止程序
            if (hasCircle) {
                return;
            }
            var module = modules[url];
            if (module && isReady(module) && loadings.indexOf(url) !== -1) {
                callFactory(module);
            }
            checkDeps();
        };

        docHead.appendChild(script);
    };


    // 更新所有已完成依赖加载的模块
    function checkDeps() {
        for (var p in modules) {
            var module = modules[p];
            if (isReady(module) && loadings.indexOf(module.id) !== -1) {
                callFactory(module);
                 // 检查是否有依赖此次成功加载模块的模块
                checkDeps();
            }
        }
    };


    // 检查模块依赖是否全部加载
    function isReady(m) {
        var deps = m.deps,
            depM;

        for (var i = 0, len = deps.length; i < len; i++) {
            depM = modules[deps[i]];
            if (!(depM && isReady(depM) && depM.state === 2)) {
                return false;
            }
        }

        return true;
    };


    // 执行factory 完成模块加载
    function callFactory(m) {
        // 收集依赖输出
        var args = [];
        for (var i = 0, len = m.deps.length; i < len; i++) {
            args.push(modules[m.deps[i]].export);
        }
        m.export = m.factory.apply(window, args);
        m.state = 2;

        // 从正在加载的脚本中去除
        var idx = loadings.indexOf(m.id);
        if (idx !== -1) {
            loadings.splice(idx, 1);
        }
    }


    // 获取当前运行脚本文件路径
    function getCurrentScript() {
        // 强制报错，以便在错误堆栈中用正则匹配获取文件路径
        // 参考 https://github.com/samyk/jiagra/blob/master/jiagra.js
        var stack;
        try {
            a.b.c();
        } catch (e) {
            stack = e.stack;
            if (!stack && window.opera) {
                stack = (String(e).match(/of linked script \S+/g) || []).join(' ');
            }
        }
        if (stack) {
            stack = stack.split(/[@ ]/g).pop();
            stack = stack[0] === '(' ? stack.slice(1, -1) : stack.replace(/\s/, '');
            return stack.replace(/(:\d+)?:\d+$/i, '').replace(/\.js$/, '');
        }

        // 在head中查找活动的script标签
        var scripts = docHead.getElementsByTagName('script');
        for (var i = 0, len = scripts.length; i < len; i++) {
            if(scripts[i].readyState === 'interactive'){
                return scripts[i].src;
            }
        }
    }


    // 数组map方法
    if (typeof Array.prototype.map !== 'function') {
        Array.prototype.map = function(fn, ctx) {
            var ret = [];
            if (typeof fn === 'function') {
                for (var i = 0, len = this.length; i < len; i++) {
                    ret[i] = fn.call(ctx, this[i], i, this);
                }
            }
            return ret;
        };
    }


    // 数组some方法
    if (typeof Array.prototype.some !== 'function') {
        Array.prototype.some = function(fn, ctx) {
            if (typeof fn === 'function') {
                for (var i = 0, len = this.length; i < len; i++) {
                    if (fn.call(ctx, this[i], i, this)) {
                        return true;
                    }
                }
            }
            return false;
        };
    }


    if (window.require === undefined) {
        window.require = require;
    }
    if (window.define === undefined) {
        window.define = define;
    }
})(window, document);
