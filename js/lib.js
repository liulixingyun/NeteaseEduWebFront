/**
 * 通用工具库
 */
var lib = (function() {
    'use strict';

    /**
     * DOM处理子模块库
     */
    var dom = (function() {

        /**
         * 浏览器兼容性实现 getElementsByClassName
         * @param  {Object} elem  待获取元素的父节点
         * @param  {String} cls   待获取元素的CSS类名
         * @return {Array}        className符合要求的节点数组
         */
        function getElemsByClassName(elem, cls) {
            if (elem.getElementsByClassName) {
                return elem.getElementsByClassName(cls);
            } else {
                var nodes = elem.getElementsByTagName('*'),
                    result = [],
                    clsStr,
                    flag;
                cls = cls.split(' ');
                for (var i = 0; i < nodes.length; i++) {
                    clsStr = ' ' + nodes[i].className + ' ';
                    flag = true;
                    for (var j = 0; j < cls.length; j++) {
                        if (clsStr.indexOf(' ' + cls[j] + ' ') == -1) {
                            flag = false;
                            break;
                        }
                    }
                    if (flag) {
                        result.push(nodes[i]);
                    }
                }
                return result;
            }
        }

        /**
         * 获得元素文本
         * @param  {Object} elem  元素节点
         * @return {String}       元素的文本
         */
        function getText(elem) {
            if (typeof elem.textContent == 'string') {
                return elem.textContent;
            } else {
                return elem.innerText;
            }
        }

        /**
         * 设置元素文本
         * @param  {Object} elem  元素节点
         * @param  {String} text  元素的文本
         */
        function setText(elem, text) {
            if (typeof elem.textContent == 'string') {
                elem.textContent = text;
            } else {
                elem.innerText = text;
            }
        }

        function getFirstElementChild(elem) {
            if (elem.nodeType !== 1) { // 如果不是元素节点，直接返回
                return null;
            }
            if (elem.firstElementChild) {
                return elem.firstElementChild;
            }
            var nodes = elem.children,
                node,
                l = nodes.length;
            for (var i = 0; i < l; ++i) {
                node = nodes[i];
                if (node.nodeType === 1) {
                    return n;
                }
            }
            return null;
        }

        /**
         * 类jQuery选择器的简易实现
         * @param  {String} elem  待获取元素相关的表达式
         * @param  {Object} cls   待获取元素的父节点
         * @return {Element | NodeList | HTMLCollection}  符合条件的元素节点或节点集
         */
        function selector(expr, elem) {
            elem = elem || document; // 若不传第二个参数，则默认选取选取document下的节点
            if (/^#([\w-]+)$/.test(expr)) {
                return document.getElementById(expr.slice(1));
            } else if (/^\.([\w-]+)$/.test(expr)) { // 正则中 “.”一定要转义
                return getElemsByClassName(elem, expr.slice(1));
            } else if (/^\w+$/.test(expr)) {
                return elem.getElementsByTagName(expr);
            } else {
                return elem.querySelector(expr);
            }
        }

        return {
            $: selector,
            getText: getText,
            setText: setText,
            firstElem: getFirstElementChild
        }
    })();

    /**
     * 样式处理子模块库
     */
    var css = (function() {

        /**
         * 元素是否含有该样式
         * @param  {Object} obj  元素节点
         * @param  {String} cls  样式
         * @return {Boolean}     元素是否含有该样式
         */
        function hasClass(obj, cls) {
            return obj.className.match(new RegExp('(\\s|^)' + cls + '(\\s|$)'));
        }

        /**
         * 添加样式
         * @param  {Object} obj  元素节点
         * @param  {String} cls  样式
         */
        function addClass(obj, cls) {
            if (!hasClass(obj, cls)) {
                obj.className += ' ' + cls;
            }
        }

        /**
         * 替换原来的样式为新样式
         * @param  {Object} obj  元素节点
         * @param  {String} cls  样式
         */
        function replaceClass(obj, cls) {
            obj.className = cls;
        }

        /**
         * 删除样式
         * @param  {Object} obj  元素节点
         * @param  {String} cls  样式
         */
        function removeClass(obj, cls) {
            if (hasClass(obj, cls)) {
                var reg = new RegExp('(\\s|^)' + cls + '(\\s|$)');
                obj.className = obj.className.replace(reg, ' ');
            }
        }

        /**
         * 切换元素的样式，
         * 如果该元素包含此样式，那么删除此样式；
         * 如果该元素不包含此样式，那么添加此样式
         * @param  {Object} obj  元素节点
         * @param  {String} cls  样式
         */
        function toggleClass(obj, cls) {
            if (hasClass(obj, cls)) {
                removeClass(obj, cls);
            } else {
                addClass(obj, cls);
            }
        }

        /**
         * 获取元素当前实际样式
         * @param  {Object} obj  元素节点
         * @param  {String} attr 属性
         * @return {type}        元素的当前实际样式值
         */
        function getStyle(obj, attr) {
            if (obj.currentStyle) {
                return obj.currentStyle[attr];
            } else {
                return getComputedStyle(obj, false)[attr];
            }
        }

        return {
            has: hasClass,
            add: addClass,
            rm: removeClass,
            rp: replaceClass,
            toggle: toggleClass,
            get: getStyle
        }
    })();

    /**
     * 事件处理子模块库
     */
    var event = (function() {

        /**
         * 添加事件监听
         * elem.addEventListener      标准，兼容IE9+
         * elem.attachEvent           兼容IE6-8
         * @param {Object} elem       事件绑定元素
         * @param {String} type       事件类型
         * @param {Function} listener 事件出发后的回调函数
         */
        function addEvent(elem, type, listener, useCapture) {
            useCapture = useCapture || true;
            if (document.addEventListener) {
                elem.addEventListener(type, listener, useCapture);
            } else {
                elem.attachEvent('on' + type, listener);
            }
        }

        /**
         * 删除事件监听
         * elem.removeEventListener   标准，兼容IE9+
         * elem.detachEvent           兼容IE6-8
         * @param {Object} elem       事件绑定元素
         * @param {String} type       事件类型
         * @param {Function} listener 事件出发后的回调函数
         */
        function removeEvent(elem, type, listener, useCapture) {
            if (document.addEventListener) {
                elem.removeEventListener(type, listener, useCapture);
            } else {
                elem.detachEvent('on' + type, listener);
            }
        }

        /**
         * 获取事件对象
         * @param  {Object} event  事件对象
         * @return {Object}        事件对象
         */
        function getEvent(event) {
            return event || window.event;
        }

        /**
         * 获取事件触发对象
         * @param  {Object} event  事件对象
         * @return {Object}        事件触发元素
         */
        function getTarget(event) {
            return event.target || event.srcElement;
        }

        /**
         * 阻止默认行为
         * @param  {Object} event  事件对象
         */
        function preventDefault(event) {
            if (event.preventDefault) {
                event.preventDefault();
            } else {
                event.returnValue = false;
            }
        }

        /**
         * 停止冒泡
         * @param  {Object} event  事件对象
         */
        function stopPropagation(event) {
            if (event.stopPropagation) {
                event.stopPropagation();
            } else {
                event.cancelBubble = true;
            }
        }

        return {
            add: addEvent,
            del: removeEvent,
            e: getEvent,
            target: getTarget,
            preventDefault: preventDefault,
            stopPropagation: stopPropagation
        }
    })();

    /**
     * ajax处理子模块库
     */
    var ajax = (function() {

        /**
         * private
         * 序列化对象
         * @param  {Object}   obj     请求的查询参数对象
         */
        function serialize(obj) {
            if (!obj) return '';
            var pairs = [];
            for (var name in obj) {
                if (!obj.hasOwnProperty(name)) continue;
                if (typeof obj[name] === 'function') continue;
                var value = obj[name].toString();
                name = encodeURIComponent(name);
                value = encodeURIComponent(value);
                pairs.push(name + '=' + value);
            }
            return pairs.join('&');
        }

        /**
         * private
         * Create the XHR object.
         * @param  {String}   method   请求资源的方式
         * @param  {String}   url      请求资源的URL
         * @return {Object}            XHR object
         */
        function createCorsRequest(method, url) {
            var xhr = new XMLHttpRequest();
            if ('withCredentials' in xhr) {
                // Check if the XMLHttpRequest object has a "withCredentials" property.
                // "withCredentials" only exists on XMLHTTPRequest2 objects.
                xhr.open(method, url, true);
            } else if (typeof XDomainRequest != 'undefined') {
                // Otherwise, check if XDomainRequest.
                // XDomainRequest only exists in IE, and is IE's way of making CORS requests.
                xhr = new XDomainRequest();
                xhr.open(method, url);
            } else {
                // Otherwise, CORS is not supported by the browser.
                xhr = null;
            }
            return xhr;
        }


        /**
         * 封装AJAX get请求方式
         * @param  {String}   url      请求资源的URL
         * @param  {Object}   data     请求的查询参数对象
         * @param  {Function} callback 请求的回调函数，接收XMLHttpRequest对象的responseText属性作为参数
         */
        function getCorsRequest(url, data, callback) {
            var xhr = createCorsRequest('get', url + '?' + serialize(data));

            if (!xhr) {
                alert('CORS not supported');
                return;
            }

            // Response handlers.
            xhr.onload = function() {
                callback(xhr.responseText);
                console.log('CORS success! ' + xhr.responseText);
            };
            xhr.onerror = function() {
                // callback('require failed!');
                console.log('CORS failed');
            };

            xhr.send();
        }

        return {
            get: getCorsRequest
        }
    })();

    /**
     * cookie处理子模块库
     */
    var cookie = (function() {

        /**
         * private
         * 将cookie有效期的天数，转化为cookie的失效时间
         * @param {Number} expiDay  cookie有效期天数
         * @return {Date}           cookie失效时间
         */
        function getExpi(expiDay) {
            var expi = new Date(); // 获取系统当前时间
            var expiDuration = expiDay * 24 * 3600 * 1000; // 将30天转换成毫秒的整数
            expi.setTime(expi.getTime() + expiDuration); // 将当前时间加上cookie生效时长，获得cookie失效时间
            return expi;
        }

        /**
         * 获得所有cookie的对象
         * @return {Object} cookie对象
         */
        function getCookies() {
            var cookie = {};
            var all = document.cookie;
            if (all === '')
                return cookie;
            var list = all.split('; ');
            for (var i = 0; i < list.length; i++) {
                var item = list[i];
                var p = item.indexOf('=');

                var name = item.substring(0, p);
                name = decodeURIComponent(name);

                var value = item.substring(p + 1);
                value = decodeURIComponent(value);

                cookie[name] = value;
            }
            return cookie;
        }

        /**
         * 获得cookie值
         * @param {String} name    cookie属性名
         * @return {String}        cookie属性值
         */
        function getCookie(name) {
            return getCookies()[name] || null;
        }

        /**
         * 设置cookie
         * @param {String} name    cookie属性名（必须）
         * @param {String} value   cookie属性值（必须）
         * @param {Number} expires 失效时间
         * @param {String} path    作用路径，默认为当前文档路径
         * @param {String} domain  作用域，默认为当前文档域
         * @param {Boolean} secure https
         */
        function setCookie(name, value, expires, path, domain, secure) {
            if (name && value) {
                var cookie = encodeURIComponent(name) + '=' + encodeURIComponent(value);
                if (expires)
                    cookie += '; expires=' + getExpi(expires).toGMTString();
                if (path)
                    cookie += '; path=' + path;
                if (domain)
                    cookie += '; domain=' + domain;
                if (secure)
                    cookie += '; secure=' + secure;
                document.cookie = cookie;
            }
        }

        /**
         * 删除cookie
         * @param {String} name    cookie属性名
         */
        function removeCookie(name) {
            document.cookie = name + '=; max-age=0';
        }

        /**
         * 清空cookie
         */
        function clearCookie() {
            var cookies = getCookies();
            for (var name in cookies) {
                document.cookie = name + '=; max-age=0';
            }
        }

        return {
            cookies: getCookies,
            get: getCookie,
            set: setCookie,
            rm: removeCookie,
            clear: clearCookie
        }
    })();


    return {
        dom: dom,
        css: css,
        event: event,
        ajax: ajax,
        cookie: cookie
    }
})();
