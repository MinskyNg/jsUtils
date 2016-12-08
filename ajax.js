// Ajax相关

(function(window) {
    // 默认参数
    var setup = {
        url: '',  // 请求地址
        method: 'get',  // 请求方法
        data: '',  // 发送数据
        dataType: '',  // 数据类型
        contentType: '',  // 请求头部
        timeout: undefined,  // 超时时间
        async: true,  // 是否异步
        success: function() {},  // 成功回调
        error: function() {},  // 失败回调
        callback: 'jsonpcallback' // jsonp回调函数名
    };


    // 传入参数与默认参数合并
    function extend(opts) {
        var extended = {};

        for (var key in setup) {
            if (opts[key] !== undefined) {
                extended[key] = opts[key]
            } else {
                extended[key] = setup[key];
            }
        }

        return extended;
    }


    // 设置默认参数
    function ajaxSetup(opts) {
        for (var key in setup) {
            if (opts[key] !== undefined) {
                setup[key] = opts[key];
            }
        }
    }


    // 数据编码
    function params(data) {
        var arr,
            i,
            len,
            p;

        if (typeof data === 'string') {
            arr = data.split('&');
            for (i = 0, len = arr.length; i < len; i++) {
                p = arr[i].indexOf('=');
                arr[i] = encodeURIComponent(arr[i].substring(0, p)) + '=' + encodeURIComponent(arr[i].substring(p + 1));
            }
        } else  if (typeof data === 'object') {
            arr = [];
            for (i in data) {
                arr.push(encodeURIComponent(i) + '=' + encodeURIComponent(data[i]));
            }
        }

        return arr.join('&');
    }


    // 处理超时
    function setTime(timeSet) {
        timeSet.timer = setTimeout(function() {
            if (timeSet.dataType === 'jsonp') {
                delete window[timeSet.callback];
                document.body.removeChild(timeSet.script);
            } else {
                timeSet.timer === null;
                timeSet.xhr.abort();
            }
            console.log('timeout');
        }, timeSet.timeOut);
    }


    // 创建XHR
    function createXHR() {
        if (window.XMLHttpRequest) {
            return new XMLHttpRequest();
        } else {
            // 兼容旧版IE 依次降级
            var versions = ['Microsoft', 'msxm3', 'msxml2', 'msxml1'];
            for (var i = 0; i < versions.length; i++) {
                try {
                    var version = versions[i] + '.XMLHTTP';
                    return  new ActiveXObject(version);
                } catch (e) {}
            }
        }

    }


    // 基本Ajax方法
    function ajax(opts) {
        var method = opts.method || setup.method,
            dataType = opts.dataType || setup.dataType;
        if (dataType.toLowerCase() === 'jsonp') {
            jsonp(opts);
        } else if (method.toLowerCase() === 'get') {
            get(opts);
        } else {
            post(opts);
        }
    }


    // jsonp
    function jsonp(opts) {
        var opts = extend(opts),
            data = params(opts.data),
            url = opts.url + (opts.url.indexOf('?') !== -1 ? (opts.url.indexOf('=') !== -1 ? '&' + data : data) : '?' + data),
            script = document.createElement('script'),
            callback = opts.callback,
            timeSet;

        // 超时处理
        if (opts.timeout) {
            timeSet = {
                timer: undefined,
                timeout: opts.timeout,
                dataType: opts.dataType,
                callback: callback,
                script: script
            }
            setTime(timeSet);
        }

        window[callback] = function(data) {
            if (opts.timeout) {
                clearTimeout(timeSet.timer);
            }
            document.body.removeChild(script);
            opts.success(data);
        }

        if (opts.async) {
            script.async = true;
            script.defer = true;
        }
        script.src = url + (url.indexOf('?') !== -1 ? '&' : '?') + 'callback=' + callback;
        script.type = 'text/javascript';
        document.body.appendChild(script);
    }


    // get请求
    function get(opts) {
        var opts = extend(opts),
            data = params(opts.data),
            url = opts.url + (opts.url.indexOf('?') !== -1 ? (opts.url.indexOf('=') !== -1 ? '&' + data : data) : '?' + data);
            xhr = createXHR();

        xhr.open('get', url, opts.async);
        if (opts.contentType) {
            xhr.setRequestHeader('Content-Type', opts.contentType);
        }

        // 超时处理
        if (opts.timeout) {
            timeSet = {
                timer: undefined,
                timeout: opts.timeout,
                dataType: opts.dataType,
                xhr: xhr
            }
            setTime(timeSet);
        }

        xhr.onreadystatechange = function() {
            if (xhr.readyState === 4) {
                if (opts.timeout !== undefined) {
                    clearTimeout(timeSet.timer);
                }
                if ((xhr.status >= 200 && xhr.status < 300) || xhr.status === 304) {
                    if (opts.dataType.toLowerCase() === 'json') {
                        opts.success(JSON.parse(responseText));
                    } else if (opts.dataType.toLowerCase() === 'xml') {
                        opts.success(responseXML);
                    } else {
                        opts.success(responseText);
                    }
                } else {
                    opts.error(xhr.status, xhr.statusText);
                }
            }
        };

        // 发送请求
        xhr.send();
    }


    // post请求
    function post(opts) {
        var opts = extend(opts),
            xhr = createXHR();

        xhr.open('post', opts.url, opts.async);
        xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded;charset=UTF-8');
        if (opts.contentType) {
            xhr.setRequestHeader('Content-Type', opts.contentType);
        }

        // 超时处理
        if (opts.timeout) {
            timeSet = {
                timer: undefined,
                timeout: opts.timeout,
                dataType: opts.dataType,
                xhr: xhr
            }
            setTime(timeSet);
        }

        xhr.onreadystatechange = function() {
            if (xhr.readyState === 4) {
                if (opts.timeout !== undefined) {
                    clearTimeout(timeSet.timer);
                }
                if ((xhr.status >= 200 && xhr.status < 300) || xhr.status === 304) {
                    if (opts.dataType.toLowerCase() === 'json') {
                        opts.success(JSON.parse(responseText));
                    } else if (opts.dataType.toLowerCase() === 'xml') {
                        opts.success(responseXML);
                    } else {
                        opts.success(responseText);
                    }
                } else {
                    opts.error(xhr.status, xhr.statusText);
                }
            }
        };

        // 发送请求
        xhr.send(params(opts.data));
    }


    // 加载脚本
    function getScript(opts) {
        var script = document.createElement('script');
        if (opts.async) {
            script.async = true;
            script.defer = true;
        }
        script.src = opts.url;
        script.type = 'text/javascript';
        document.body.appendChild(script);
    }


    // 加载JSON
    function getJSON(opts) {
        opts.dataType = 'json';
        get(opts);
    }


    window['ajaxUtil'] = {
        'ajaxSetup': ajaxSetup,
        'ajax': ajax,
        'jsonp': jsonp,
        'get': get,
        'post': post,
        'getScript': getScript,
        'getJSON': getJSON
    };
})(window);
