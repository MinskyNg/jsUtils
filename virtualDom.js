// 简易Virtual DOM实现(尚未完成，感谢https://github.com/livoras/blog/issues/13)

(function(window, document) {
    'use strict';

    if (window.VDom) {
        return;
    }


    // Virtual DOM构造函数，用JavaScript对象模拟真实DOM
    function VDom(type, props, children) {
        // 确保构造函数调用
        if (!(this instanceof VDom)) {
            return new VDom(type, props, children);
        }

        // 可不传递元素属性prop
        if (isArray(props)) {
            children = props;
            props = {};
        }

        this.type = type; // 标签类型
        this.props = props; // 属性
        this.children = children; // 子元素
        this.key = props.key; // 唯一标识
        var count = 0;
        children.forEach(function(child, i) {
            if (child instanceof VDom) {
                count += child.count;
            } else {
                children[i] = '' + child;
            }
            count++;
        });
        this.count = count; // 后代数量
    }


    // 将Virtual DOM渲染为真实DOM
    VDom.prototype.render = function() {
        var el = document.createElement(this.type);

        // 设置属性
        var props = this.props;
        for (var key in props) {
            el.setAttribute(key, props[key]);
        }

        // 创建子节点
        var children = this.children || [];
        children.forEach(function(child) {
            if (child instanceof VDom) {
                el.appendChild(child.render());
            } else {
                el.appendChild(document.createTextNode(child));
            }
        });

        return el;
    }


    // 比较两棵Virtual DOM
    VDom.prototype.diff = function(newVDom) {
        var index = 0; // 节点索引
        var patches = {}; // 补丁集合
        diffWalk(this, newVDom, index, patches);
        return patches;
    }


    // 深度优先遍历，记录差异
    function diffWalk(oldVDom, newVDom, index, patches) {
        // 当前节点补丁
        var curPatches = [];

        // 不同文本节点
        if (isString(oldVDom) && isString(newVDom) && oldVDom !== newVDom) {
            curPatches.push({
                type: 'TEXT',
                content: newVDom
            });
        // 相同类型节点
        } else if (oldVDom.type === newVDom.type && oldVDom.key === newVDom.key) {
            var propsPatches = diffProps(oldVDom.props, newVDom.props);
            if (propsPatches) {
                curPatches.push({
                    type: 'PROPS',
                    props: propsPatches
                });
            }
            diffChildren(oldVDom, newVDom, index, patches, curPatches);
        // 节点类型不同
        } else {
            curPatches.push({
                type: 'REPLACE',
                node: newVDom
            });
        }

        if (curPatches.length) {
            patches[index] = curPatches;
        }
    }


    // 比较属性
    function diffProps(oldProps, newProps) {
        var key,
            propsPatches;

        // 查找不同的属性
        for (key in oldProps) {
            if (newProps[key] !== oldProps[key]) {
                propsPatches[key] = newProps[key];
            }
        }

        // 查找新增属性
        for (key in newProps) {
            if (!oldProps[key]) {
                propsPatches[key] = newProps[key];
            }
        }

        return isEmptyObject(propsPatches) ? null : propsPatches;
    }


    // 比较子节点
    function diffChildren(oldVNode, newVNode, index, patches, curPatches) {
        var diffs = listDiff(oldVNode, newVNode);
        newVNode = diffs.children;

        if (diffs.moves.length) {
            currentPatch.push({
                type: 'REORDER',
                moves: diffs.moves
            });
        }

        // 先前节点数量
        var prevCount = 0;
        oldVNode.forEach(function(oldChild, i) {
            var newChild = newVNode[i];
            index += prevCount + 1;
            diffWalk(oldChild, newChild, index, patches);
            prevCount += oldChild.count;
        });
    }


    // 求两子节点集合差异(最小编辑距离 - 动态规划)
    function listDiff() {

    }


    // 将差异修改到真实DOM上
    VDom.patch = function(dom, patches) {
        // index保存在对象中，方便传递共享
        var walker = {index: 0};
        patchWalk(dom, walker, patches);
    }


    // 深度优先遍历，修改节点
    function patchWalk(node, walker, patches) {
        var curPatches = patches[walker.index];
        var childNodes = node.childNodes;
        var len = childNodes ? childNodes.length : 0;

        for (var i = 0; i < len; i++) {
            walker.index++;
            patchWalk(childNodes[i], walker, patches);
        }

        if (curPatches) {
            applyPatches(node, curPatches);
        }
    }


    // 根据不同类型的差异对当前节点进行DOM操作
    function applyPatches(node, curPatches) {
        curPatches.forEach(function(patch) {
            switch(patch) {
                case 'REPLACE':
                    var pNode = patch.node;
                    node.parentNode.replaceChild(isString(pNode) ? document.createTextNode(pNode) : pNode.render(), node);
                    break;
                case 'REORDER':
                    reorderChildren(node, patch.moves);
                    break;
                case 'PROPS':
                    setProps(node, patch.props);
                    break;
                case 'TEXT':
                    if (node.textContent) {
                        node.textContent = patch.content;
                    } else {
                        node.innerText = patch.content;
                    }
                    break;
            }
        });
    }


    // 重排子节点
    function reorderChildren(node, moves) {

    };


    // 更改属性
    function setProps(node, props) {
        for (var key in props) {
            if (props[key] === undefined) {
                node.removeAttribute(key);
            } else {
                node.setAttribute(key, props[key]);
            }
        }
    }


    // 判断数组
    function isArray(arr) {
        return Object.prototype.toString.call(arr) === '[object Array]';
    }


    // 判断字符串
    function isString(str) {
        return typeof str === 'string';
    }


    // 判断对象是否为空
    function isEmptyObject(obj) {
        var p;
        for (p in obj)
            return false;
        return true;
    }


    // 数组forEach方法
    if (typeof Array.prototype.forEach != 'function') {
        Array.prototype.forEach = function (fn, ctx) {
            if (typeof fn === 'function') {
               for (var i = 0, len = this.length; i < len; i++) {
                  fn.call(ctx, this[i], i, this);
              }
            }
        };
    }


    window.VDom = VDom;
})(window, document);
