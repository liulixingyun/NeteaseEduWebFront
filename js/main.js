window.onload = function() {
    'use strict';
    var expiDay = 10; // 设置失效日期为10天

    /**
     * m-msg 消息模块
     */
    (function($) {
        var msg = $.dom.$('#m-msg'); // 获取id为“m-msg”的元素
        var close = $.dom.$('.close', msg)[0]; // 获取msg节点下，class为“close”的元素

        var c = $.cookie.get('message'); // 获取名为“message”的cookie值

        if (c == '0') { // 如果cookie值为'0'，说明已经被被关闭则，不在提醒
            $.css.add(msg.parentNode, 'z-hide');
        }

        $.event.add(close, 'click', function() {
            $.cookie.set('message', '0', expiDay);
            $.css.add(msg.parentNode, 'z-hide');
        });

    })(lib);

    /**
     * m-video 视频播放模块
     */
    (function($) {

        var introOrg = $.dom.$('#m-intro-org');
        var btnVideo = $.dom.$('.video', introOrg)[0];

        var videoPlayer = $.dom.$('#m-video');
        var btnClose = $.dom.$('.close', videoPlayer)[0];
        var video = $.dom.$('.video', videoPlayer)[0];

        var mask = $.dom.$('#u-mask');

        $.event.add(btnVideo, 'click', function() {
            $.css.rm(mask, 'z-hide');
            $.css.rm(videoPlayer, 'z-hide');
        });

        $.event.add(btnClose, 'click', function() {
            $.css.add(mask, 'z-hide');
            $.css.add(videoPlayer, 'z-hide');
            video.pause();
        });

    })(lib);

    /**
     * m-login 关注和登录模块
     */
    (function($) {
        var attention = $.dom.$('#m-nav');
        var att = $.dom.$('.att', attention)[0];
        var atted = $.dom.$('.atted', attention)[0];
        var cancel = $.dom.$('.cancel', attention)[0];
        var fansNum = $.dom.$('.num', attention)[0];

        var login = $.dom.$('#m-login');
        var btnSubmit = $.dom.$('.submit', login)[0];
        var btnClose = $.dom.$('.close', login)[0];
        var userName = $.dom.$('.name', login)[0];
        var userPwd = $.dom.$('.pwd', login)[0];
        var mask = $.dom.$('#u-mask');

        /**
         * 关注状态的更新
         */
        function attStatusUpdate() {
            var flag = false;
            if ($.cookie.get('loginSuc')) { // 如果已经登录并关注过
                if ($.cookie.get('followSuc')) { // 并且本地已经关注
                    attedShow(); // 默认显示已关注
                    flag = true;
                } else { // 或者，并且服务器端用户已经关注
                    getAttValue(function(value) { // 异步获取服务器端关注状态值
                        if (value == 1) {
                            $.cookie.set('followSuc', '1', expiDay);
                            attedShow(); // 默认显示已关注
                            flag = true;
                        }
                    });
                }
            }
            return flag;
        }

        attStatusUpdate(); // 执行关注的初始化更新

        /**
         * 显示登录窗口
         */
        function loginShow() {
            $.css.rm(mask, 'z-hide');
            $.css.rm(login, 'z-hide');
        }

        /**
         * 隐藏登录窗口
         */
        function loginHide() {
            $.css.add(login, 'z-hide');
            $.css.add(mask, 'z-hide');
        }

        /**
         * 显示未关注状态
         */
        function attShow() {
            $.css.add(atted, 'z-hide');
            $.css.rm(att, 'z-hide');
            $.dom.setText(fansNum, parseInt($.dom.getText(fansNum)) - 1)
        }

        /**
         * 显示已关注状态
         */
        function attedShow() {
            $.css.add(att, 'z-hide');
            $.css.rm(atted, 'z-hide');
            $.dom.setText(fansNum, parseInt($.dom.getText(fansNum)) + 1)
        }

        /**
         * 异步获取服务器上用户关注状态的值
         * @param {Function} getValue 异步方式从服务器返回的状态值的处理的回调函数
         */
        function getAttValue(getValue) {

            var url = 'http://study.163.com/webDev/attention.htm';
            var a;
            $.ajax.get(url, null, function(resp) {
                getValue(resp);
            });
        }

        //关注 事件处理
        $.event.add(att, 'click', function() {
            if (!attStatusUpdate()) { // 更新关注状态，如果需要登录，显示登录窗口
                loginShow(); // 显示登录窗口
            }
        });

        // 取消关注 事件处理
        $.event.add(cancel, 'click', function() {
            attShow();
            $.cookie.rm('followSuc');
            // 真是环境下，应该同时取消服务器关注的状态数据
            // 测试环境下，没有post的接口，取消后刷新任然显示已关注
        });

        // 登录 事件处理
        $.event.add(btnSubmit, 'click', function() {
            var url = 'http://study.163.com/webDev/login.htm';
            var data = {
                userName: $.encrypt.hex_md5(userName.value),
                password: $.encrypt.hex_md5(userPwd.value)
            };

            $.ajax.get(url, data, function(resp) {
                if (resp) { // 如果登录成功
                    $.cookie.set('loginSuc', '1', expiDay);
                    loginHide(); // 隐藏登录信息

                    $.cookie.set('followSuc', '1', expiDay);
                    // 真是环境下，应该同时取消服务器关注的状态数据

                    attStatusUpdate(); // 判断关注状态
                }
            })
        });

        // 关闭登录窗口 事件处理
        $.event.add(btnClose, 'click', function() {
            loginHide();
        });

    })(lib);


    /**
     * m-banner 轮播banner
     */
    (function($) {
        var CONS = { // 常量参数
            AUTO_DURATION: 5000, // 自动轮播的时间间隔
            FADE_DURATION: 500, // 动画效果持续时间
            FADE_INTERVAL: 2, // 动画刷新间隔时间
            FADE_TARGET: 100, // 点入动画的目标值，100，为完全不透明
        }

        var banner = $.dom.$('#m-banner');
        var gallery = $.dom.$('.gallery', banner)[0];
        var imgs = $.dom.$('li', gallery);
        var pointer = $.dom.$('.u-pointer', banner)[0];
        var pointers = $.dom.$('li', pointer);

        var crt = 0, // 当前轮播的位置，初始值为0，即第一幅图
            timer = null, // 淡入的timer
            autotimer = null; // 自动切换的timer

        /**
         * 通过循环，给所有元素添加事件的处理
         */
        for (var i = 0; i < pointers.length; i++) {

            pointers[i].index = i; // 将索引值添加到元素的属性中,供以后使用
            imgs[i].index = i;

            // 当鼠标移入，清除自动循环
            $.event.add(imgs[i], 'mouseover', function() {
                clearInterval(autotimer);
            });

            // 当鼠标移出，开始自动循环
            $.event.add(imgs[i], 'mouseout', function() {
                auto(this.index);
            });

            // 当点击指示器时，轮播到相应图片
            $.event.add(pointers[i], 'click', function() {
                clearInterval(autotimer);
                play(this.index);
            });
        }

        auto(crt); // 从当前图开始轮播，crt初始值为0，即，从第一幅图开始轮播

        /**
         * 自动轮播
         * @param {Object} start  自动轮播开始的索引
         */
        function auto(index) {
            clearInterval(autotimer);
            autotimer = setInterval(function() {
                index = ++index % imgs.length; // 确定下一个轮播的索引
                play(index); // 轮播到第i个元素
            }, CONS.AUTO_DURATION);
        }

        function play(index) {
            clearInterval(timer);

            pointers[crt].className = ''; // 重置上一个元素的样式
            imgs[crt].className = 'z-hide';
            crt = index; // 更新当前位置索引
            pointers[crt].className = 'z-crt'; // 设置当前元素的样式
            imgs[crt].className = 'z-crt';
            imgs[crt].style.opacity = 0; // 初始化样式的透明度
            imgs[crt].style.filter = 'alpha(opacity:"0")';

            var alpha = parseInt(parseFloat($.css.get(imgs[crt], 'opacity')) * 100);

            var speed = CONS.FADE_INTERVAL * CONS.FADE_TARGET / CONS.FADE_DURATION; // 计算速度
            speed = alpha < CONS.FADE_TARGET ? speed : -speed; // 判断速度的方向

            timer = setInterval(function() {
                if (Math.abs(alpha - CONS.FADE_TARGET) <= Math.abs(speed)) { // 如果速度单位大于或等于剩下的间隔，则呈现完成状态
                    clearInterval(timer);
                    imgs[crt].style.opacity = CONS.FADE_TARGET / 100.0;
                    imgs[crt].style.filter = 'alpha(opacity:' + CONS.FADE_TARGET + ')';
                } else {
                    alpha += speed;
                    imgs[crt].style.opacity = alpha / 100.0;
                    imgs[crt].style.filter = 'alpha(opacity:' + CONS.FADE_TARGET + ')';
                }
            }, CONS.FADE_INTERVAL);
        }

    })(lib);
}
