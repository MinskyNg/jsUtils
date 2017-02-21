// 动画封装（尚未完善）

(function(window) {
    'use strict';

    if (window.Animation) {
        return;
    }


    if (!window.requestAnimationFrame) {
        requestAnimationFrame = function (fn) {
            setTimeout(fn, 16); // 1000 / 60帧
        };
    }

    var getStyle;
    if (document.defaultView) {
        getStyle = function(el, prop) {
            var style = document.defaultView.getComputedStyle(el, null);
            return style[prop] || style.getPropertyValue(prop);
        };
    } else {
        getStyle = function(el, prop) {
            return el.currentStyle[prop];
        };
    }


    /*
     * 动画构造函数
     * el: 作用元素
     * props: 结束属性值
     * duration: 持续时间
     * easing: 缓动类型
     * callback: 结束回调
     */
    function Animation(el, props, duration, easing, callback) {
            if (arguments.length < 2) {
                throw new Error('至少需传入2个参数!');
            }

            this.el = el;
            this.props = props;
            this.duration = duration || 300;
            this.easing = Tween[easing] || Tween.Linear;
            this.callback = callback;
            this.onPause = false;
            this.run();
    }

    Animation.prototype = {
        // 获取初始值和变化量
        getProps: function() {
            var init = {};
            var change = {};
            for (var p in this.props) {
                if (this.props.hasOwnProperty(p)) {
                    init[p] = getStyle(this.el, p);
                    change[p] = this.props[p] - init[p];
                }
            }
            return [init, change];
        },

        // 启动
        run: function() {
            var self = this;
            var value = this.getProps();
            var init = value[0];
            var change = value[1];
            var startTime = +new Date();

            function step() {
                if (self.onPause) {
                    return;
                }

                var time = +new Date() - startTime;
                if (time < self.duration) {
                    for (var p in init) {
                        self.el.stype[p] = self.easing(time, init[p], change[p], self.duration)
                    }
                    requestAnimationFrame(step);
                } else {
                    self.callback();
                }
            };

            requestAnimationFrame(step);
        },

        // 暂停
        pause: function () {
            this.onPause = true;
        }
    };


    /*
     * 各种缓动函数（来源：https://github.com/zhangxinxu/Tween/blob/master/tween.js）
     * t: 当前时间
     * b: 初始值
     * c: 变化量
     * d: 持续时间
     */
    var Tween = {
        // 线性匀速运动效果
        Linear: function(t, b, c, d) { return c*t/d + b; },
        // 二次方的缓动（t^2）
        QuadIn: function(t, b, c, d) {
            return c * (t /= d) * t + b;
        },
        QuadOut: function(t, b, c, d) {
            return -c *(t /= d)*(t-2) + b;
        },
        QuadInOut: function(t, b, c, d) {
            if ((t /= d / 2) < 1) return c / 2 * t * t + b;
            return -c / 2 * ((--t) * (t-2) - 1) + b;
        },
        // 三次方的缓动（t^3）
        CubicIn: function(t, b, c, d) {
            return c * (t /= d) * t * t + b;
        },
        CubicOut: function(t, b, c, d) {
            return c * ((t = t/d - 1) * t * t + 1) + b;
        },
        CubicInOut: function(t, b, c, d) {
            if ((t /= d / 2) < 1) return c / 2 * t * t*t + b;
            return c / 2*((t -= 2) * t * t + 2) + b;
        },
        // 四次方的缓动（t^4）
        QuartIn: function(t, b, c, d) {
            return c * (t /= d) * t * t*t + b;
        },
        QuartOut: function(t, b, c, d) {
            return -c * ((t = t/d - 1) * t * t*t - 1) + b;
        },
        QuartInOut: function(t, b, c, d) {
            if ((t /= d / 2) < 1) return c / 2 * t * t * t * t + b;
            return -c / 2 * ((t -= 2) * t * t*t - 2) + b;
        },
        // 五次方的缓动（t^5）
        QuintIn: function(t, b, c, d) {
            return c * (t /= d) * t * t * t * t + b;
        },
        QuintOut: function(t, b, c, d) {
            return c * ((t = t/d - 1) * t * t * t * t + 1) + b;
        },
        QuintInOut: function(t, b, c, d) {
            if ((t /= d / 2) < 1) return c / 2 * t * t * t * t * t + b;
            return c / 2*((t -= 2) * t * t * t * t + 2) + b;
        },
        // 正弦曲线的缓动（sin(t)）
        SineIn: function(t, b, c, d) {
            return -c * Math.cos(t/d * (Math.PI/2)) + c + b;
        },
        SineOut: function(t, b, c, d) {
            return c * Math.sin(t/d * (Math.PI/2)) + b;
        },
        SineInOut: function(t, b, c, d) {
            return -c / 2 * (Math.cos(Math.PI * t/d) - 1) + b;
        },
        // 指数曲线的缓动（2^t）
        ExpoIn: function(t, b, c, d) {
            return (t==0) ? b : c * Math.pow(2, 10 * (t/d - 1)) + b;
        },
        ExpoOut: function(t, b, c, d) {
            return (t==d) ? b + c : c * (-Math.pow(2, -10 * t/d) + 1) + b;
        },
        ExpoInOut: function(t, b, c, d) {
            if (t==0) return b;
            if (t==d) return b+c;
            if ((t /= d / 2) < 1) return c / 2 * Math.pow(2, 10 * (t - 1)) + b;
            return c / 2 * (-Math.pow(2, -10 * --t) + 2) + b;
        },
        // 圆形曲线的缓动（sqrt(1-t^2)）
        CircIn: function(t, b, c, d) {
            return -c * (Math.sqrt(1 - (t /= d) * t) - 1) + b;
        },
        CircOut: function(t, b, c, d) {
            return c * Math.sqrt(1 - (t = t/d - 1) * t) + b;
        },
        CircInOut: function(t, b, c, d) {
            if ((t /= d / 2) < 1) return -c / 2 * (Math.sqrt(1 - t * t) - 1) + b;
            return c / 2 * (Math.sqrt(1 - (t -= 2) * t) + 1) + b;
        },
        // 指数衰减的正弦曲线缓动
        ElasticIn: function(t, b, c, d, a, p) {
            var s;
            if (t==0) return b;
            if ((t /= d) == 1) return b + c;
            if (typeof p == 'undefined') p = d * .3;
            if (!a || a < Math.abs(c)) {
                s = p / 4;
                a = c;
            } else {
                s = p / (2 * Math.PI) * Math.asin(c / a);
            }
            return -(a * Math.pow(2, 10 * (t -= 1)) * Math.sin((t * d - s) * (2 * Math.PI) / p)) + b;
        },
        ElasticOut: function(t, b, c, d, a, p) {
            var s;
            if (t==0) return b;
            if ((t /= d) == 1) return b + c;
            if (typeof p == 'undefined') p = d * .3;
            if (!a || a < Math.abs(c)) {
                a = c;
                s = p / 4;
            } else {
                s = p/(2*Math.PI) * Math.asin(c/a);
            }
            return (a * Math.pow(2, -10 * t) * Math.sin((t * d - s) * (2 * Math.PI) / p) + c + b);
        },
        ElasticInOut: function(t, b, c, d, a, p) {
            var s;
            if (t==0) return b;
            if ((t /= d / 2) == 2) return b+c;
            if (typeof p == 'undefined') p = d * (.3 * 1.5);
            if (!a || a < Math.abs(c)) {
                a = c;
                s = p / 4;
            } else {
                s = p / (2  *Math.PI) * Math.asin(c / a);
            }
            if (t < 1) return -.5 * (a * Math.pow(2, 10* (t -=1 )) * Math.sin((t * d - s) * (2 * Math.PI) / p)) + b;
            return a * Math.pow(2, -10 * (t -= 1)) * Math.sin((t * d - s) * (2 * Math.PI) / p ) * .5 + c + b;
        },
        // 超过范围的三次方缓动（(s+1)*t^3 – s*t^2）
        BackIn: function(t, b, c, d, s) {
            if (typeof s == 'undefined') s = 1.70158;
            return c * (t /= d) * t * ((s + 1) * t - s) + b;
        },
        BackOut: function(t, b, c, d, s) {
            if (typeof s == 'undefined') s = 1.70158;
            return c * ((t = t/d - 1) * t * ((s + 1) * t + s) + 1) + b;
        },
        BackInOut: function(t, b, c, d, s) {
            if (typeof s == 'undefined') s = 1.70158;
            if ((t /= d / 2) < 1) return c / 2 * (t * t * (((s *= (1.525)) + 1) * t - s)) + b;
            return c / 2*((t -= 2) * t * (((s *= (1.525)) + 1) * t + s) + 2) + b;
        },
        // 指数衰减的反弹缓动
        BounceIn: function(t, b, c, d) {
            return c - Tween.BounceOut(d-t, 0, c, d) + b;
        },
        BounceOut: function(t, b, c, d) {
            if ((t /= d) < (1 / 2.75)) {
                return c * (7.5625 * t * t) + b;
            } else if (t < (2 / 2.75)) {
                return c * (7.5625 * (t -= (1.5 / 2.75)) * t + .75) + b;
            } else if (t < (2.5 / 2.75)) {
                return c * (7.5625 * (t -= (2.25 / 2.75)) * t + .9375) + b;
            } else {
                return c * (7.5625 * (t -= (2.625 / 2.75)) * t + .984375) + b;
            }
        },
        BounceInOut: function(t, b, c, d) {
            if (t < d / 2) {
                return Tween.BounceIn(t * 2, 0, c, d) * .5 + b;
            } else {
                return Tween.BounceOut(t * 2 - d, 0, c, d) * .5 + c * .5 + b;
            }
        }
    };


    window.Animation = Animation;
})(window);
