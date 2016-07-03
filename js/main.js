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
   * m-banner 轮播banner模块
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

      pointers[crt].setAttribute('class', ''); // 重置上一个元素的样式
      imgs[crt].setAttribute('class', 'z-hide');
      crt = index; // 更新当前位置索引
      pointers[crt].setAttribute('class', 'z-crt'); // 设置当前元素的样式
      imgs[crt].setAttribute('class', 'z-crt');
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

  /**
   * m-hot 最热排行模块
   */
  (function($) {
    var CONS = { // 常量参数
      URL: 'http://study.163.com/webDev/hotcouresByCategory.htm',
      SHOW_NUMBER: 10, // 最热排行显示的课程数量
      INTERVAL: 5000 // 动画刷新间隔时间
    }

    $.ajax.get(CONS.URL, null, function(resp) { //获取课程数据，并异步处理

      var hotCourses = JSON.parse(resp); // 解析JSON

      var hot = $.dom.$('#m-hot');
      var list = $.dom.$('.list', hot)[0];

      // 初始化要显示的节点
      for (var i = 0; i < CONS.SHOW_NUMBER; i++) {
        list.appendChild(createHotLiNode(i));
      }

      // 每隔5s刷新一次最热课程列表。循环刷新，不需要清除IntervalID
      setInterval(function() {
        // var i = list.firstElementChild.index; // 获取当前第一个元素的索引值
        var i = $.dom.firstElem(list).index;
        // list.removeChild(list.firstElementChild); // 删除第一个元素
        list.removeChild($.dom.firstElem(list));

        list.appendChild(createHotLiNode((i + CONS.SHOW_NUMBER) % hotCourses.length)); // 将新的元素添加到最后
      }, CONS.INTERVAL);

      /**
       * 创建DOM节点
       * <li>
       *  <img class="picture" src="#" alt="最热课程">
       *  <h3 class="title">舞曲揭秘音乐揭秘舞曲揭秘音乐揭秘</h3>
       *  <div class="number">123456</div>
       * </li>
       * @param {Number} i 创建节点的索引值，用以从对象中获取到相应的值
       * @return {Object} DOM节点<li>
       */
      function createHotLiNode(i) {

        var li = document.createElement('li');

        var img = document.createElement('img');
        var title = document.createElement('h3');
        var number = document.createElement('div');

        img.setAttribute('class', 'picture');
        img.setAttribute('src', hotCourses[i].smallPhotoUrl);
        img.setAttribute('alt', '最热课程');
        title.setAttribute('class', 'title');
        number.setAttribute('class', 'number');

        $.dom.setText(title, hotCourses[i].name);
        $.dom.setText(number, hotCourses[i].learnerCount);

        li.appendChild(img);
        li.appendChild(title);
        li.appendChild(number);

        li.index = i; // 给每个课程节点添加索引属性

        return li;
      }
    });

  })(lib);

  /**
   * m-course 课程模块
   */
  (function($) {

    var CONS = { // 常量参数
      URL: 'http://study.163.com/webDev/couresByCategory.htm',
      Page_SIZE: 20, // 每页返回的个数
      TYPE: { // 类型
        PRODUCT_DESIGN: 10,
        PROGRAM_LANGUAGE: 20
      },
      MAX_PAGE_SHOW: 8
    }

    var tabs = $.dom.$('#m-tab');
    var pages = $.dom.$('#m-page');
    var crtPage = 1; // 当前是第几页
    var crtType = CONS.TYPE.PRODUCT_DESIGN; // 当前的类型
    var totalPage = null; // 服务器端总共有多少页的数据
    var showPageNum = null; // 屏幕中显示的分页器的个数
    var isPrev = false, // 点击了上一页按钮之后，是否更新分页列表
        isNext = false, // 点击了下一页按钮之后，是否更新分页列表
        loadFinished = false;  // 本次的ajax请求是否完成。
                               // 防止用户“快速、连续”点击上一页或下一页按钮，造成ajax加载完成之后异步触发的事件之间冲突

    loadCourses(); // 初始化课程列表的显示

    for (var i = 0; i < tabs.children.length; i++) {
      tabs.children[i].index = i;
      $.event.add(tabs.children[i], 'click', function() { // 添加切换课程类型的点击事件处理
        if (!loadFinished) {  // 如果上一个ajax请求还没有加载完成，直接返回，不响应此次点击事件
          return;             // 现在服务器响应速度很快，不加入判断影响不大。
        }                     // 出于逻辑的完备性，建议加入判断
        crtPage = 1;  // 更新当前页数为第1页，因为切换tab从第1页开始显示
        var previndex = crtType == CONS.TYPE.PRODUCT_DESIGN ? 0 : 1;
        crtType = this.index == 0 ? CONS.TYPE.PRODUCT_DESIGN : CONS.TYPE.PROGRAM_LANGUAGE;

        this.parentNode.children[previndex].setAttribute('class', ''); // 取消上一个tab的选中状态
        this.setAttribute('class', 'z-crt'); // 更新当前tab为选中状态

        loadCourses(); // 更新课程信息
      });
    }

    // 添加上一页的点击事件处理
    $.event.add($.dom.firstElem(pages), 'click', function() {
      if (crtPage == 1 || !loadFinished) {  // 如果已经是第一页，或上一个ajax请求还没有加载完成
        return;                             // 直接返回，不响应此次点击事件
      }
      var maxPage = pages.children[showPageNum].index;
      var minPage = pages.children[1].index;
      crtPage--;
      if (crtPage < minPage) {
        isPrev = true;
      }

      loadCourses();
    });
    // 添加下一页的点击事件处理
    $.event.add($.dom.lastElem(pages), 'click', function() {
      if (crtPage == totalPage || !loadFinished) {  // 如果已经是最后一页，或上一个ajax请求还没有加载完成
        return;                                     // 直接返回，不响应此次点击事件
      }
      var maxPage = pages.children[showPageNum].index;
      var minPage = pages.children[1].index;
      crtPage++;
      if (crtPage > maxPage) {
        isNext = true;
      }

      loadCourses();
    });

    /**
     *  获取并显示课程
     */
    function loadCourses() {
      loadFinished = false; // 加载初始阶段，还未加载完成，阻止因切换页码导致的再次加载

      var data = {
        pageNo: crtPage,
        psize: CONS.Page_SIZE,
        type: crtType,
        // hash: Math.random() // 随机参数，避免有些服务器响应重复get请求
      };
      $.ajax.get(CONS.URL, data, function(resp) { //获取课程数据，并异步处理

        var courseList = JSON.parse(resp); // 解析JSON

        totalPage = courseList.totalPage;
        showPageNum = totalPage > CONS.MAX_PAGE_SHOW ? CONS.MAX_PAGE_SHOW : totalPage;

        var courses = $.dom.$('#m-course');

        createCourses(); // 创建所有课程节点
        createPages(); // 创建所有分页器节点

        loadFinished = true; // 加载完成后，更新状态信息，允许因切换页码导致的再次加载

        /**
         * 创建所有的课程节点
         */
        function createCourses() {
          // 清空所有已有子节点
          while ($.dom.firstElem(courses)) {
            courses.removeChild($.dom.firstElem(courses));
          }

          // 创建当页所有子节点
          for (var i = 0; i < data.psize; i++) { // 注意js中i的非块级作用域
            courses.appendChild(createCourseLiNode(i));
          }
        }

        /**
         * 创建所有的分页器节点,实现简单分页功能
         * 通过上一页和下一页可以实现所有页面的浏览
         */
        function createPages() {

          // 如果没有分页按钮，则初始化分页按钮
          if (pages.children.length <= 2) {
            for (var i = 1; i <= showPageNum; i++) { //注意js中i的非块级作用域
              pages.insertBefore(createPageLiNode(i), $.dom.lastElem(pages));
            }
          } else if (isNext) { // 点击了下一页按钮
            pages.insertBefore(createPageLiNode(crtPage), $.dom.lastElem(pages));
            pages.removeChild(pages.children[1]);
            isNext = false; // 恢复标志
          } else if (isPrev) { // 点急了上一页按钮
            pages.removeChild(pages.children[showPageNum]); // 先删除，后添加。要不然添加之后就多了一个元素
            pages.insertBefore(createPageLiNode(crtPage), pages.children[1]);
            isPrev = false; // 恢复标志
          }

          updatePageStatus(); // 更新分页器的状态

          /**
           * 更新分页器的状态
           */
          function updatePageStatus() {
            var minPage = pages.children[1].index; // 当前分页器中的最小值
            for (var i = 1; i < pages.children.length - 1; i++) {
              pages.children[i].setAttribute('class', '');
            }
            pages.children[crtPage - minPage + 1].setAttribute('class', 'z-crt');
          }
        }

        /**
         * 创建DOM节点
         * <li class="z-crt">1</li>
         * <li>2</li>
         * @param {Number} i 创建节点的索引值，用以从对象中获取到相应的值
         * @return {Object} DOM节点<li>
         */
        function createPageLiNode(i) {
          var li = document.createElement('li');
          li.index = i; // 给每个课程节点添加索引属性
          $.dom.setText(li, i);

          // 分页器点击事件处理
          $.event.add(li, 'click', function() {
            if (!loadFinished) {  // 如果上一个ajax请求还没有加载完成，直接返回，不响应此次点击事件
              return;             // 现在服务器响应速度很快，不加入判断影响不大。
            }                     // 出于逻辑的完备性，建议加入判断
            crtPage = this.index;

            loadCourses();
          });

          return li;
        }

        /**
         * 创建DOM节点
         * <li class="course">
         *   <img class="picture" src="#" alt="课程">
         *   <h3 class="title">混音全揭秘 舞曲实战篇 混音全揭秘 舞曲实战篇 揭秘音乐揭</h3>
         *   <div class="org">音乐幇</div>
         *   <div class="number">123456</div>
         *   <div class="price">￥800.00</div>
         * </li>
         * @param {Number} i 创建节点的索引值，用以从对象中获取到相应的值
         * @return {Object} DOM节点<li>
         */
        function createCourseLiNode(i) {

          var li = document.createElement('li');
          li.setAttribute('class', 'course');

          var img = document.createElement('img');
          var title = document.createElement('h3');
          var org = document.createElement('div');
          var number = document.createElement('div');
          var price = document.createElement('div');

          img.setAttribute('class', 'picture');
          img.setAttribute('src', courseList.list[i].middlePhotoUrl);
          img.setAttribute('alt', '课程');
          title.setAttribute('class', 'title');
          org.setAttribute('class', 'org');
          number.setAttribute('class', 'number');
          price.setAttribute('class', 'price');

          $.dom.setText(title, courseList.list[i].name);
          $.dom.setText(org, courseList.list[i].provider);
          $.dom.setText(number, courseList.list[i].learnerCount);
          $.dom.setText(price, courseList.list[i].price ? '￥' + courseList.list[i].price : '免费');

          li.appendChild(img);
          li.appendChild(title);
          li.appendChild(org);
          li.appendChild(number);
          li.appendChild(price);

          li.index = i; // 给每个课程节点添加索引属性

          // 当鼠标移入时，显示对应的悬浮弹窗
          // mouseenter & mouseleave 仅支持冒泡阶段，如果设置为捕获阶段，则不会屏蔽子元素的触发
          $.event.add(li, 'mouseenter', function() {
            var hoverLi = createHoverLiNode(i);

            hoverLi.style.left = this.offsetLeft - 10 + 'px';
            hoverLi.style.top = this.offsetTop - 10 + 'px';

            courses.appendChild(hoverLi);
          }, false);

          return li;
        }

        /**
         * 创建DOM节点
         * <li class="course-hover">
         *   <div class="clearfix">
         *     <img class="picture" src="#" alt="课程">
         *     <div class="abstract">
         *       <h3 class="title">手绘画系列教程</h3>
         *       <div class="number">57人在学</div>
         *       <div class="org">发布者：几分钟网</div>
         *       <div class="category">分类： 手绘设计</div>
         *     </div>
         *   </div>
         *   <p class="article">生活中不乏有很多美好的画面，何不用画笔记录下来呢？那么就跟几分钟网一起来记录美好画面吧！</p>
         * </li>
         * @param {Number} i 创建节点的索引值，用以从对象中获取到相应的值
         * @return {Object} DOM节点<li>
         */
        function createHoverLiNode(i) {

          var li = document.createElement('li');
          li.setAttribute('class', 'course-hover');

          var clearfix = document.createElement('div');
          clearfix.setAttribute('class', 'clearfix');

          var picture = document.createElement('img');
          picture.setAttribute('class', 'picture');
          picture.setAttribute('src', courseList.list[i].middlePhotoUrl);
          picture.setAttribute('alt', '课程');

          var abstract = document.createElement('div');
          abstract.setAttribute('class', 'abstract');

          var title = document.createElement('h3');
          title.setAttribute('class', 'title');
          $.dom.setText(title, courseList.list[i].name);

          var number = document.createElement('div');
          number.setAttribute('class', 'number');
          $.dom.setText(number, courseList.list[i].learnerCount + ' 人在学');

          var org = document.createElement('div');
          org.setAttribute('class', 'org');
          $.dom.setText(org, '发布者： ' + courseList.list[i].provider);

          var category = document.createElement('div');
          category.setAttribute('class', 'category');
          $.dom.setText(category, '分类： ' + courseList.list[i].categoryName);

          var article = document.createElement('p');
          article.setAttribute('class', 'article');
          $.dom.setText(article, courseList.list[i].description);

          li.appendChild(clearfix);
          li.appendChild(article);

          clearfix.appendChild(picture);
          clearfix.appendChild(abstract);

          abstract.appendChild(title);
          abstract.appendChild(number);
          abstract.appendChild(org);
          abstract.appendChild(category);

          li.index = i; // 给每个课程节点添加索引属性

          // 当鼠标移出时，删除自己这个悬浮弹窗
          // mouseenter & mouseleave 仅支持冒泡阶段，如果设置为捕获阶段，则不会屏蔽子元素的触发
          $.event.add(li, 'mouseleave', function() {
            courses.removeChild(this);
          }, false);

          return li;
        }
      });
    }

  })(lib);

}
