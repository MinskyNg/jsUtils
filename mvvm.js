// 简易MVVM（指令式双向绑定，mvvm-html、mvvm-form、mvvm-on:xxx）(参考https://segmentfault.com/a/1190000006599500)

(function(window, document) {
    'use strict';

    if (window.MVVM) {
        return;
    }


    // MVVM构造器 双向绑定入口
    function MVVM(data, el) {
        var model = this.model = data || {};
        var view = this.view = typeof el === 'object' && el.nodeType === 1 ? el : document.querySelector(el);

        // 数据代理
        this.proxy();
        // 创建Observer实例
        new Observer(model);
        // 创建Compile实例
        new Compile(view || document.body, this);
    }

    MVVM.prototype = {
        proxy: function() {
            var self = this;
            Object.keys(this.model).forEach(function(key) {
                Object.defineProperty(self, key, {
                    // 不可再次配置
                    configurable: false,
                    // 可用for in遍历
                    enumerable: true,
                    // 读属性劫持
                    get: function() {
                        return this.model[key];
                    },
                    // 写属性劫持
                    set: function(newVal) {
                        this.model[key] = newVal;
                    }
                });
            });
        }
    };


    // 数据监听器 对数据对象的属性进行监听
    function Observer(data) {
        if (!val || typeof val !== 'Object') {
            return;
        }

        var self = this;
        Object.keys(data).forEach(function(key) {
            self.defineReactive(data, key, data[key]);
        });
    }

    Observer.prototype = {
        // 监听处理
        defineReactive: function(data, key, val) {
            var dep = new Dep();
            // 递归监听属性值
            Observer(val);
            Object.defineProperty(data, key, {
                configurable: false,
                enumerable: true,
                get: function() {
                    if (Dep.target) {
                        // 添加Watcher到依赖列表
                        dep.addSub(Dep.target);
                    }
                    return val;
                },
                set: function(newVal) {
                    if (newVal === val) {
                        return;
                    }
                    val = newVal;
                    // 对新的属性值重新监听
                    Observer(val);
                    // 发出通知
                    dep.notify();
                }
            });
        }
    };


    // 依赖管理器 用于添加和通知订阅器
    function Dep() {
        this.subs = [];
    }

    Dep.prototype = {
        addSub: function(sub) {
            this.subs.push(sub);
        },

        notify: function() {
            this.subs.forEach(function(sub) {
                sub.update();
            });
        }
    };

    // 全局变量 用于标识当前作用Watcher
    Dep.target = null;



    // 指令解析器 对元素节点进行扫描并解析指令
    function Compile(el, vm) {
        this.el = el;
        this.vm = vm;

        if (this.el) {
            // 将节点el转换成DocumentFragment 提高效率
            this.fragment = this.node2Fragment(this.el);
            // 进行解析编译操作
            this.compile(this.fragment);
            // 将fragment添加回实际的dom节点中
            this.el.appendChild(this.fragment);
        }
    }

    Compile.prototype = {
        node2Fragment: function(node) {
            var fragment = document.createDocumentFragment(),
                child;
            // 将元素子节点添加到DocumentFragment中 会从元素中移除该节点
            while (child = node.firstChild) {
                fragment.appendChild(child);
            }
            return fragment;
        },

        compile: function(el) {
            var self = this;
            Array.prototype.forEach.call(el.children, function(child) {
                // 解析节点属性 查找是否存在规定指令
                Array.prototype.forEach.call(child.attributes, function(attr) {
                    var attrName = attr.name;
                    if (attrName.indexOf('mvvm-') === 0) {
                        var expr = attr.value;
                        var dir = attrName.slice(0, 5);
                        // 事件绑定指令
                        if (dir.indexOf('on') === 0) {
                            directives.on(child, self.vm, expr, dir.slice(0, 3));
                        } else if (directives[dir]) {
                            directives[dir](child, self.vm, expr);
                        }
                    }
                    child.removeAttribute(attrName);
                });

                // 递归编译子节点
                if (child.children) {
                    compile(child);
                }
            });
        }
    };

    // 指令操作集
    var directives = {
        // 将标签内容显示为指定值 model -> view
        html: function(node, vm, expr) {
            var val = getVM(expr);
            // 创始化内容
            node.innerHTML = typeof val === 'undefined' ? '' : val;
            // 创建Watcher实例
            new Watcher(vm, expr, function(newVal) {
                node.innerHTML = typeof newVal === 'undefined' ? '' : newVal;
            });
        },

        // 将表单值和属性值双向绑定 model <-> view
        form: function(node, vm, expr) {
            var val = getVM(expr);
            node.value = typeof val === 'undefined' ? '' : val;
            new Watcher(vm, expr, function(newVal) {
                node.value = typeof newVal === 'undefined' ? '' : newVal;
            });
            // 绑定表单变更事件
            node.addEventListener('change', function() {
                var newVal = node.value;
                if (val === newVal) {
                    return;
                }
                setVM(vm, expr, newVal);
                val = newVal;
            });
        },

        // 绑定指定事件 view -> model
        on: function(node, vm, expr, type) {
            var cb = getVM(expr);
            if (type && cb) {
                node.addEventListener(type, cb.bind(vm), false);
            }
        }
    };

    // 获取指令表达式在model中的属性值
    function getVM(vm, expr) {
        var data = vm.model;
        expr = expr.split('.');
        expr.forEach(function(key) {
            data = data[key];
        });
        return data;
    }

    // 设置指令表达式在model中的属性值
    function setVM(vm, expr, val) {
        var data = vm.model;
        var pre = null;
        expr = expr.split('.');
        expr.forEach(function(key) {
            pre = data;
            data = data[key];
        });
        pre = val;
    }



    // 消息订阅器
    function Watcher(vm, expr, cb) {
        this.vm = vm;
        this.expr = expr;
        this.cb = cb;
        this.init();
    }

    Watcher.prototype = {
        init: function() {
            Dep.target = this;
            this.val = getVM(this.vm, this.expr);
            Dep.target = null;
        },

        update: function() {
            val = getVM(this.vm, this.expr);
            if (val !== this.val) {
                this.val = val;
                this.cb.call(this.vm, val)
            }
        }
    };
})(window, document);
