/**
*
* JZB JsBridge 1.7.4
*
* @author Silver
* 2017.05.17
*
*/
var JzbBridge = (function() {
  var D = document.body || document.documentElement;

  var ios = !!navigator.userAgent.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/);
  if (ios) {
    var WVJBIframe = document.createElement('iframe');
    WVJBIframe.style.display = 'none';
    WVJBIframe.src = 'https://__bridge_loaded__';
    D.appendChild(WVJBIframe);
  }
  var ua = navigator.userAgent.toLowerCase(),
      isAndroid = ua.match(/(Android);?[\s\/]+([\d.]+)?/i)?1:0,
      isJzb = ua.match(/patriarch/i)?1:0,
      user_info = null,   //用户信息 用于游客身份判断等
      bridge = null,      //jsbridge 主要对象
      handler_queue = []; //执行队列

  //简易发布订阅模式
  var PubSub = { handlers : {}};
  PubSub.on = function(event,handler){
      if(!(event in this.handlers)){
          this.handlers[event] = [];
      }
      this.handlers[event].push(handler);

      return this;
  }
  PubSub.emit = function(event){
      var handlerArgs = Array.prototype.slice.call(arguments,1);
      if(this.handlers[event]){
        for (var i = 0; i < this.handlers[event].length; i++) {
            this.handlers[event][i].apply(this,handlerArgs);
        };
        return this;
      }
      return null;
  };
  // 获得客户端的版本号值
  // function getAppVersion(){
  //   var matchs = navigator.userAgent.match(/patriarch\/(\d[0-9.]+)/i);
  //   if (matchs && matchs.length == 2) {
  //       return parseFloat(matchs[1].replace(/(\d\.)(\d)\.(\d)$/, '$1$2$3'));
  //   }

  //   return 0;
  // }

  //家长帮版本检查
  var VersionCheck = {
    getAppVersion: function(){
      var matchs = navigator.userAgent.match(/patriarch\/(\d[0-9.]+)/i);
      if (matchs && matchs.length == 2) {
          return parseFloat(matchs[1].replace(/(\d\.)(\d)\.(\d)$/, '$1$2$3'));
      }

      return 0;
    },

    checkVersion: function(){
      var _v = VersionCheck.getVersion();

      if(_v){
        if(_v.one > 3)
          return 1;
        else if(_v.one < 3)
          return 0;
        else if(_v.one == 3 && _v.two < 5)
          return 2;
        else
          return 1;
      }

      return 0;
    },
    checkMinVersion: function(v){
      var _v = VersionCheck.getVersion();

      if(_v&&(_v.one+"."+_v.two >= v)){
        return true;
      }
      return false;
    },
    getVersion: function(){
      var version = ua.match(/patriarch\/([0-9]{1,2}.){1,2}\d/i);
          version = version?version[0].split("/")[1]:0;

      if(version){
        return {
          one: version.split(".")[0],
          two: version.split(".")[1]
        }
      }

      return null;
    },
    isNotUpdate: function(){
      var _v = VersionCheck.getVersion();
      if(_v&&((_v.one == 3&&_v.two<=3) || _v.one <3)){
        return true;
      }
      return false;
    }
  }

  //升级弹出层
  /*;(function(){
    var _v = VersionCheck.getVersion();
    var text_info = "当前版本过低，请升级至最新版本";
    var btn_str = '<a style="display:inline-block;width:47%;height:36px;line-height:36px;background:#f9f9f9;border:solid 1px #e3e3e3;text-align:center;border-radius:5px;"'
                  +'onclick="upLayer.style.display=\'none\'">取消</a>'
                  +'<a style="display:inline-block;width:47%;height:36px;line-height:36px;background:#f9f9f9;border:solid 1px #e3e3e3;text-align:center;border-radius:5px;float:right;text-decoration: none;color:#666;"'
                  +'href="http://mapi.eduu.com/a?c=90">立即升级</a>';

    if(isAndroid&&VersionCheck.isNotUpdate()){
      text_info = "当前版本过低，为了不错过更多精彩，请进入个人中心-设置，点击“版本升级”进行更新。";
      btn_str = '<a style="display:inline-block;width:100%;height:36px;line-height:36px;background:#f9f9f9;border:solid 1px #e3e3e3;text-align:center;border-radius:5px;"'
                +'onclick="upLayer.style.display=\'none\'">取消</a>'
    }

    window.
    upLayer = document.createElement("div");
    upLayer.setAttribute("style","background:rgba(0,0,0,.8);width:100%;height:100%;position:fixed;top:0;left:0;display:none;z-index:99999999;");
    upLayer.innerHTML = [
      '<div style="width:80%;margin:100px 5% 0 5%;background:#fff;border-radius:10px;padding:20px 5%;color:#666;line-height:22px;">',
      text_info,
      '<div style="margin-top:30px;">',
      btn_str,
      '</div></div>'
    ].join("");
    document.head.parentNode.appendChild(upLayer);
  })();*/

  //调用handler主函数
  function callHandler(name, obj, cb){

      setTimeout(function(){
        window.WebViewJavascriptBridge.callHandler(name, JSON.stringify(obj), cb || function(){});
      },10);

  }

  //是否游客检查
  function guestCheck(){
    if(user_info&&user_info.isyouke){
      JzbApi.noLogin();
      return 0;
    }

    return 1;
  }

  function updateLayer(){

  }


  var JzbApi = {
    //分销插码
    setUTMSource: function(utm_source, url) {
      callHandler('setUTMSource', {
        utm_source: utm_source,
        url: url
      });
    },
    getUTMSource: function(cb) {
      callHandler('getUTMSource', {}, cb);
    },
    ShowFullScreenImage: function(imglist, selectedIndex) {
      if (!imglist || !imglist.length) return false;
      if (!selectedIndex) var selectedIndex = 0;
      callHandler('fullScreenPreviewImage', {imglist: imglist, selectedIndex: selectedIndex});
    },
    anonPersonalPage: function(uid) {
      if (!uid) return;
      if (typeof uid !== String) uid.toString();
      callHandler('anonPersonalPage', {uid: uid});
    },
    lockScreenControl: function(image, title, currenttime, duration) {
      callHandler('lockScreenControl', {image: image, title: title, currenttime: currenttime, duration: duration});
    },
    anonVipBuy: function() {
      callHandler('anonVipBuy', {});
    },
    backBtnControlHandler: function(isShow){
      callHandler('backBtnControlHandler', {"isShow": isShow});
    },
    paySuccessClosePage: function(close) {
      callHandler('paySuccessClosePage', {"close": close});
    },
    replyExpertComplete: function(id) { //  2016-08-26 wz  问答ID
      callHandler('replyExpertComplete', {"qaId": id});
    },
    gotoOneTOneChat: function(id) { //  2016-08-26 wz  一对一聊天房间ID
      callHandler('gotoOneTOneChat', {"roomId": id});
    },
    schoolDetailView: function(id) {
      callHandler('schoolDetailView', {"schoolId": id});
    },

    vueRouter: function(callback) {
      callHandler('vueRouter', {}, callback);
    },

    orderStatusChange: function(id, status, orderType, productJson) {
      callHandler('orderStatusChange', {"orderId":id, "status":(status||'unknown'), "orderType":orderType, "productJson":productJson});
    },

    orderStatusHandler: function(id) {
      callHandler('orderStatusHandler', {"orderId":id});
    },

    coursePayAlert: function(id, msg) {

        callHandler('coursePayAlert', {'courseID':id.toString(), msg:msg});

    },

    turnToCourse: function(id, is_singin) {   //调播放器
      var data = {};
          data.courseID = id.toString();
          data.signState = is_singin || "unknow";
      callHandler('turnToCourse', data);
    },

    courseSigned: function(id) {   //报名成功
      callHandler('courseSigned', { 'courseID':id });
    },

    runAudio: function() {
      callHandler('runAudio', {});
    },

    showClassroomDetail : function(contentID, type) {

      callHandler('showClassroomDetail', {'contentID':contentID, 'type': type});

    },

    showCommentList : function(contentID, type, callback) {

      callHandler('showCommentList', {'contentID':contentID, 'type': type}, callback);

    },

    historyMedia: function(obj) {
      callHandler('historyMedia', {}, function() {
        clearInterval(obj);
      });
    },

    alipay: function(opt) {

      var o = {
         tradeNO: "",
         productName: "",
         productDescription: "",
         amount: "",
         notifyURL: "",
         itBPay: null,
         showUrl: ""
      };
      for(var i in opt) o[i] = opt[i];

      o.productName?encodeURIComponent(o.productName):"";
      o.productDescription?encodeURIComponent(o.productDescription):"";

      callHandler('alipay', o);
    },

    wechatpay: function(opt) {

      var o = {
        openID: null,
        partnerId: null,
        prepayId: null,
        nonceStr: null,
        timeStamp: null,
        package: null,
        sign: null
      };
      for(var i in opt) o[i] = opt[i];

      callHandler('wechatpay', o);

    },

    historyZK: function() {
      callHandler('webLoadedHandler',{});
    },

    historyFirstLevelHandler : function() {
      callHandler('firstLevelHandler',{});
    },

    //关闭当前webview
    closeWebview: function(){
      callHandler('closeWebview',{});
    },

    //分享按钮开关及文案
    shareBtn: function(title, desc, img, url, display, btns, awardInfo){
      var o = {
        "title": encodeURIComponent(title || ""),
        "desc": encodeURIComponent(desc || ""),
        "img": img || "",
        "url": url || "",
        "display": display || false,
        "btns": btns || "1,1,1,1,1,24"
      };

      if(awardInfo) {
        o.awardInfo = {
          "sharetype": awardInfo.sharetype || "",
          "id": awardInfo.id || "",
          "type":awardInfo.type || ""
        }
      }

      callHandler('shareBtn', o);
    },

    //直接分享
    directShare: function (type, title, desc, img, url) {
      var dShare = {
        "type": type || "",
        "title": encodeURIComponent(title || ""),
        "desc": encodeURIComponent(desc || ""),
        "img": img || "",
        "url": url || ""
      }

      callHandler('directShare', dShare);
    },

    //改变导航颜色
    changeNavColor: function(backgroundColor,separateLineColor,titleColor,btnColor){
      callHandler('changeNavColor', {
        "backgroundColor": backgroundColor || "",
        "separateLineColor": separateLineColor || "",
        "titleColor": titleColor || "",
        "btnColor": btnColor || ""});
    },

    //改变导航颜色
    changeNav: function(value){
      callHandler('changeNav', {"value": value || 1});
    },

    //打开jzb用户个人主页
    userProfile: function(uid){
      if(VersionCheck.checkVersion()==2){
        location = "http://eduu_user?id="+uid;
        return;
      }

      callHandler('userProfileHandler', {uid: uid});
    },

    //打开帖子详情
    threadsDetail: function(threadId, pId){
      if(VersionCheck.checkVersion()==2){
        location = "http://eduu_thread?id="+threadId+"&pageNum=1&pid="+pId;
        return;
      }
      callHandler('threadsDetailHandler', {threadId: threadId, pId:pId});
    },

    //群组资料页跳转
    groupDetail: function(groupId, isShowShare,knowledge_unique){
      if(VersionCheck.checkVersion()==2 && VersionCheck.checkMinVersion(3.1)){
        location = "http://eduu_openroom?room_name="+groupId;
        return;
      }
      callHandler('groupDetailHandler', {groupId: groupId, isShowShare: isShowShare, knowledge_unique:knowledge_unique});
    },

    //聊天界面跳转
    groupChat: function(groupId){
      if(VersionCheck.checkVersion()==2 && VersionCheck.checkMinVersion(3.1)){
        location = "http://eduu_goto_group?group_id="+groupId;
        return;
      }
      callHandler('groupChatHandler', {groupId: groupId});
    },

    //私信会话界面跳转
    privateChat: function(buddyId, buddyName){
      if(buddyId && buddyId !="" && buddyName && buddyName !=""){
        callHandler('privateChatHandler', {buddyId: buddyId, buddyName: encodeURIComponent(buddyName || "")});
      }else{
        alert("输入参数错误，id及name都不能为空");
      }
    },
    //Native顶掉头部
    navigationBarHide: function(type,action){
        callHandler('navigationBarHide', {hide:type,animate:action})
    },
    
    //新建私信界面跳转
    newPrivateChat: function(buddyName, msgContent){
      callHandler('newrivateChatHandler', {buddyName: encodeURIComponent(buddyName || ""), msgContent: encodeURIComponent(msgContent || "")});
    },

    //调用系统浏览器打开链接
    outAppRedirectURL: function(url){
      callHandler('outAppRedirectURLHandler', {url: url});
    },

    //数据分享
    share: function(url, image, title, desc, btns, award, awardType){
      if(VersionCheck.checkVersion()==2){
        location = "http://eduu_share?title="+title+"&image="+image+"&url="+url;
        return;
      }

      if(isAndroid){
        callHandler('shareHandler',
          { url: url,
            img: image,
            title: encodeURIComponent(title || ""),
            desc: encodeURIComponent(desc || ""),
            des: encodeURIComponent(desc || ""),
            btns: btns || "1,0,0,0,0",
            award: award || "0",
            awardType: awardType || "0"
          });
      }else{
        callHandler('shareHandler',
          { url: url,
            image: image,
            title: encodeURIComponent(title || ""),
            desc: encodeURIComponent(desc || ""),
            des: encodeURIComponent(desc || ""),
            btns: btns || "1,0,0,0,0",
            award: award || "0",
            awardType: awardType || "0"
          });
      }

    },

    //复制粘贴板
    pasteboard: function(text){
      callHandler('PasteboardHandler', {text: encodeURIComponent(text || "")});
    },

    //读取粘贴板
    loadPasteboard: function(cb){
      callHandler('loadPasteboardHandler', {}, function(r){
        alert(r.res);
      });
    },

    //未登录提醒

    noLogin: function(title, url){
      if(VersionCheck.checkVersion()==2){
        location = "http://eduu_no_login";
        return;
      }
      callHandler('noLoginHandler', {title: encodeURIComponent(title || ""), loginRefreshUrl: url});
    },

    //打电话
    telephone: function(phone){
      callHandler('telephoneHandler', {phone: phone});
    },

    //发短信
    sendSMS: function(phone, Msg){
      callHandler('sendSMSHandler', {phone: phone, Msg: encodeURIComponent(Msg || "")});
    },

    //是否显示底部导航
    bottomBarShow: function(display){
      callHandler('bottomBarShowHandler', {display: display});
    },

    //个人资料修改
    userInfoUpdate: function(){
      callHandler('userInfoUpdateHandler', {});
    },

    //个人资料-修改学校
    updateSchool: function(){
      callHandler('updateSchoolHandler', {});
    },

    //判断当前网络
    checkNetwork: function(cb){
      callHandler('checkNetwork', {}, function(r){
        if(cb) cb(r.res);
      });
    },

    //下拉刷新
    showRefresh: function(isShow){
      callHandler('showRefresh', {isShow: isShow});
    },

    //显示Toast
    showToast: function(content){
      callHandler('showToastHanlder', {content: encodeURIComponent(content || "")});
    },

    //显示Alert
    showAlert: function(content, title){
      callHandler('showAlertHanlder', {content: encodeURIComponent(content || ""), title: encodeURIComponent(title || "家长帮")});
    },

    //显示Loading
    showLoading: function(display){
      callHandler('showLoadingHanlder', {display: display});
    },

    //活动通知
    acCallback: function(tid, closeWeb){
      var close = closeWeb || 'N';
      callHandler('acCallback', {tid: tid, closeWeb: close});
    },

    //禁用返回
    canBack: function(isCan){
      callHandler('canBackHanlder', {isCan: isCan});
    },

    //调用通讯录
    addressList: function(cb){
      callHandler('addressListHandler', {}, cb);
    },

    //得到用户的信息
    getUserInfo: function(cb){
      if(VersionCheck.checkVersion() != 1) return;

      callHandler('getUserInfoHandler', {}, cb);
    },

    //进入群组列表
    enterGroupList: function(uid){
      callHandler('enterGroupList', {userId: uid});
    },

    //进入帖子列表
    enterThreadList: function(uid){
      callHandler('enterThreadList', {userId: uid});
    },

    //进入赞过的帖列表
    enterPraiseThreadList: function(uid){
      callHandler('enterPraiseThreadList', {userId: uid});
    },

    //得到用户的信息
    showUpdateDialog: function(){
      callHandler('showUpdateDialog', {});
    },

    //发送页面高度
    sendHeight: function(height){
      callHandler('sendHeight', {height: height});
    },

    //发送页面高度
    innerAppRedirectURLHandler: function(url){
      callHandler('innerAppRedirectURLHandler', {url: url});
    },

    //导航栏右键跳转
    pageJumpButton: function(is_show, func, icon_type, icon_title, icon_url){
      callHandler('pageJumpButton', {is_show: is_show, func: func || "", icon_type: icon_type || "", icon_title: encodeURIComponent(icon_title) || "",icon_url:icon_url || ""});
    },

    //进入客户端搜索页面
    searchKeyword: function(keyword){
      callHandler('searchKeyword', {keyword: encodeURIComponent(keyword || "")});
    },

    //客户端导航栏展示搜索框
    showSearchView: function(is_show, title, cb){
      callHandler('showSearchView', {is_show: is_show, title: encodeURIComponent(title || "")}, function(r){
        if(cb) cb(r);
      });
    },

    //学校关注通知
    schoolFollow: function(){
      callHandler('schoolFollowHandler', {});
    },

    //安卓禁止左滑退出
    disableExit: function(){
      callHandler('disableExit', {});
    },

    //个人元宝更变通知 安卓端用
    goldChange: function(num){
      callHandler('goldChange', {num: num});
    },

    //改变webview标题
    changeTitle: function(title){
      callHandler('changeTitle', {title: encodeURIComponent(title)});
    },

    //发新帖
    newTopic: function(fid, tid, title, palceHolderString){
      callHandler('newTopic', {fid: fid, tid: tid, title: encodeURIComponent(title), palceHolderString: encodeURIComponent(palceHolderString)});
    },
    //发新帖 1.5
    newTopicN: function(opt){
      var o = {
        fid               : 0,
        tid               : 0,
        schid             : 0,
        schname           : '',
        schicon           : '',
        title             : '',
        palceHolderString : '',
      };

      for(var i in opt) {
        o[i] = opt[i];
      }

      callHandler('newTopic', o);
    },
    //跳到对应的帮
    goToFaction: function(id){
      callHandler('goToFaction', {id: id});
    },
    //进入知识关联群组详情页
    goToKnowLedgePage: function(roomname, share, klunique){
      callHandler('goToKnowLedgePage', {room_name: roomname, share: share, knowledge_unique: klunique});
    },
    //知识分享
    knowShare: function(title, image, link){
      callHandler('knowShare', {title: title, image: image, link:link});
    },

    //进入客户端的每日知识
    enterKnowledge: function(url){
      callHandler('enterKnowledge', {url:url});
    },

    //在线直播群组列表
    onlineGroupchat: function(){
      if(VersionCheck.getAppVersion() >= 4.2){
        callHandler('onlineGroupchat', {});
      }
    },

    //导航栏显示多个按钮
    multipleNavBtn: function(is_show, opt){
      var btnlist = [];
      for(var i in opt) {
        btnlist[i] = opt[i];
      }
      var o = {
        "is_show": is_show,
        "btnList":btnlist
      };

      callHandler('multipleNavBtn', o);
    },

    //跳到问答详情
    gotoQADetail: function(qaID){
      callHandler('gotoQADetail', {qaID: qaID});
    },
    //跳到专家问答
    gotoQAAnswer: function(qaID){
      callHandler('gotoQAAnswer', {qaID: qaID});
    },
    //顶部导航
    segment: function(opt, selectedIndex){
      var btnlist = [];
      for(var i in opt) {
        btnlist[i] = opt[i];
      }
      var o = {
        "btnlist":btnlist,
        "selectedIndex": selectedIndex
      };

      callHandler('segment', o);
    },
    //打开目标地址
    openURLHandler: function(opt) {
      var o = {
        srcURL: "",
        directURL: ""
      };
      for(var i in opt) o[i] = opt[i];
      callHandler('openURLHandler', o);
    }
  };

  //下载回调
  window.downloadCompleteCB = {};
  window.downloadProcessCB = {};
  window.downloadFailCB = {};
  window.downloadCancleCB = {};

  //Downloader 设置
  var _Downloader = (function(){
    var down_list = [];
    var uniqueId = 1;

    function _createDownload(url, opt){

      if(!opt)
        opt = {
          completeCB: function(){},
          processCB: function(){},
          failCB: function(){},
        }
      else{
        if(!opt.completeCB) opt.completeCB = function(){}
        if(!opt.processCB) opt.processCB = function(){}
        if(!opt.failCB) opt.failCB = function(){}
        if(!opt.cancleCB) opt.cancleCB = function(){}
      }

      var callbackId = 'cb_'+(uniqueId++)+'_'+new Date().getTime();

      window.downloadCompleteCB[callbackId] = opt.completeCB;
      window.downloadProcessCB[callbackId] = opt.processCB;
      window.downloadFailCB[callbackId] = opt.failCB;
      window.downloadCancleCB[callbackId] = opt.cancleCB;

      var data = {
        callbackId: callbackId,
        url: url
      };

      callHandler("downloaderHandler", data);

      return callbackId;
    }

    function _cancleDownload(id){
      callHandler("cancleDownloadHandler", {id: id});
    }

    return{
      createDownload: _createDownload,
      cancleDownload: _cancleDownload
    }
  })();

  //跳转任一页
  var _GotoAnyPage = (function(){
    var PTYPE = {
      NO_ANDROID: 0,
      ALL: 1,
      NO_IOS: 2
    }

    var relationTable = {
      "EditUserInfo": isAndroid?"com.eduu.bang.app.UserInfoUpdateActivity":"SettingUserInfoViewController",
      "AreaListView": isAndroid?"com.eduu.bang.app.ZoneBangActivity":"AreaListViewController",
      "WebView": isAndroid?"com.eduu.bang.app.BrowserActivity":"WebViewController",
      "ThreadListView": isAndroid?"":"ThreadListViewController",
      "NoticeListView": isAndroid?"com.eduu.bang.app.SystemNotifyActivity":"NoticeListViewController",
      "GroupChatNoticeListView": isAndroid?"com.eduu.bang.app.GroupMsgActivity":"GroupChatNoticeListViewController",
      "RecAppListView": isAndroid?"com.eduu.bang.app.AppActivity":"RecAppListViewController",
      "AboutView": isAndroid?"com.eduu.bang.app.AboutUsActivity":"AboutViewController",
      "FeedbackView": isAndroid?"com.eduu.bang.app.FeedbackActivity":"FeedbackViewController",
      "SettingView": isAndroid?"com.eduu.bang.app.SettingActivity":"SettingViewController",
      "GroupPushSettingView": isAndroid?"com.eduu.bang.chat.GroupMessageSetActivity":"GroupPushSettingViewController", //
      "MessageListView": isAndroid?"com.eduu.bang.app.MessageActivity":"MessageListViewController",
      "UserCenterView": isAndroid?"com.eduu.bang.app.MineActivity":"UserCenterViewController",
      "PersonPageGroupListView": isAndroid?"com.eduu.bang.mycenter.PersonalGroupActivity":"PersonPageGroupListViewController",
      "PersonalPageThreadListView": isAndroid?"com.eduu.bang.mycenter.PersonalThreadActivity":"PersonalPageThreadListViewController",
      "PersonPageFriendView": isAndroid?"com.eduu.bang.mycenter.MyFriendShipActivity":"PersonPageFriendViewController",
      "PersonalPageBackImageChooseView": isAndroid?"com.eduu.bang.mycenter.DefaultBgPicActivity":"PersonalPageBackImageChooseViewController",
      "NewPostView": isAndroid?"com.eduu.bang.app.CreateThreadActivity":"NewPostViewController",
      "DraftView": isAndroid?"com.eduu.bang.app.ThreadDraftActivity":"DraftViewController",
      "BangDetailView": isAndroid?"com.eduu.bang.app.ForumProfileActivity":"BangDetailViewController",
      "ThreadsView": isAndroid?"com.eduu.bang.app.ForumActivity":"ThreadsViewController",
      "JZBBangHomeView": isAndroid?"com.eduu.bang.bbs.BBSBangHomeActivity":"JZBBangHomeViewController", //
      "PushListView": isAndroid?"com.eduu.bang.app.ChoicenessPushActivity":"PushListViewController",
      "MyKnowledgeView": isAndroid?"com.eduu.bang.app.BrowserKnowledgeActivity":"MyKnowledgeViewController",
      "GroupChatHomeView": isAndroid?"com.eduu.bang.chat.GroupActivity":"GroupChatHomeViewController",
      "AddGroupView": isAndroid?"com.eduu.bang.chat.GroupSearchActivity":"AddGroupViewController",
      "AddFriendsView": isAndroid?"com.eduu.bang.app.InviteFriendActivity":"AddFriendsViewController",
      "MyFriendsListView": isAndroid?"com.eduu.bang.app.FriendActivity":"MyFriendsListViewController",
      "RecommendFriendsListView": isAndroid?"com.eduu.bang.app.RecmdAddressBookFriendActivity":"RecommendFriendsListViewController"
    }

    //有参数调用
    function _call(className, methodName, params){
      var now_params = [];

      for (var i = 0; i < params.length; i++) {
        var _p = params[i];
        if(isAndroid && _p.ctg != PTYPE.NO_ANDROID){
          now_params.push({key: _p.key, type: _p.type, value: _p.value});
        }else if(!isAndroid && _p.ctg != PTYPE.NO_IOS){
          if(_p.type == "int")
            _p.value = _p.value/1;
          now_params.push(_p.value);
        }
      };

      var data = {
        className: className,
        methodName: methodName,
        params: now_params
      };

      callHandler("gotoAnyPageHandler", data);
    }

    //无参数调用
    function _callNoParams(className){

      var data = {
        className: className,
        methodName: "init",
        params: []
      };

      callHandler("gotoAnyPageHandler", data);
    }

    function EditUserInfo(){
      if(!guestCheck()) return;

      var className = relationTable["EditUserInfo"];
      var now_params = [
        {ctg: PTYPE.NO_ANDROID, type: "int", index: 1, value: 1},
        {ctg: PTYPE.NO_IOS, type: "int", index: 1, value: 1, key: "from"}
      ];

      _call(className, "initWithShowBack:userId:", now_params);
    }

    function ThreadListView(params){
      if(params[2] == "0"&&!guestCheck()) return;

      var className = relationTable["ThreadListView"];
      var now_params = [
        {ctg: PTYPE.NO_ANDROID, type: "int", index: 1, value: params[0] },
        {ctg: PTYPE.NO_ANDROID, type: "String", index: 2, value: params[1]},
        {ctg: PTYPE.NO_ANDROID, type: "int", index: 3, value: params[2]}
      ];

      if(isAndroid && params[2] == "0"){
        className = "com.eduu.bang.app.PublishThreadActivity";
      }

      if(isAndroid && params[2] == "1"){
        className = "com.eduu.bang.app.FavoriteThreadActivity";
      }

      _call(className, "initWithUid:buddyName:type:", now_params);
    }

    function NoticeListView(params){
      var className = relationTable["NoticeListView"];
      var now_params = [
        {ctg: PTYPE.NO_ANDROID, type: "int", index: 1, value: params[0] }
      ];
      _call(className, "initWithOwnUid:", now_params);
    }

    function WebView(params){
      var className = relationTable["WebView"];
      var now_params = [
        {ctg: PTYPE.ALL, type: "String", index: 1, value: params[0], key: "url" },
        {ctg: PTYPE.NO_ANDROID, type: "String", index: 2, value: "" },
        {ctg: PTYPE.NO_ANDROID, type: "int", index: 3, value: 0 }
      ];
      _call(className, "initWithURL:Title:showMenu:", now_params);
    }

    function SettingView(params){
      var className = relationTable["SettingView"];
      var now_params = [
        {ctg: PTYPE.NO_ANDROID, type: "int", index: 1, value: params[0]}
      ];
      _call(className, "initWithOwnUid:", now_params);
    }

    function PersonPageGroupListView(params){
      var className = relationTable["PersonPageGroupListView"];
      var now_params = [
        {ctg: PTYPE.ALL, type: "String", index: 1, value: params[0], key: "uid"}
      ];
      _call(className, "initWithuID:", now_params);
    }

    function PersonalPageThreadListView(params){
      var className = relationTable["PersonalPageThreadListView"];
      var now_params = [
        {ctg: PTYPE.ALL, type: "String", index: 1, value: params[0], key: "uid"}
      ];
      _call(className, "initWithuID:", now_params);
    }

    function PersonPageFriendView(params){
      var className = relationTable["PersonPageFriendView"];
      var now_params = [
        {ctg: PTYPE.ALL, type: "String", index: 1, value: params[0], key: "id"},
        {ctg: PTYPE.ALL, type: "int", index: 1, value: params[1], key: "index"}
      ];
      _call(className, "initWithuID:type:", now_params);
    }

    function NewPostView(params){
      if(!guestCheck()) return;

      var className = relationTable["NewPostView"];
      var now_params = [
        {ctg: PTYPE.ALL, type: "String", index: 1, value: params[0], key: "id"}
      ];
      _call(className, "initWithBangID:", now_params);
    }

    function BangDetailView(params){
      var className = relationTable["BangDetailView"];
      var now_params = [
        {ctg: PTYPE.NO_ANDROID, type: "String", index: 1, value: params[0]},
        {ctg: PTYPE.NO_IOS, type: "long", index: 1, value: params[0], key: "id"}
      ];
      _call(className, "initWithBangID:", now_params);
    }

    function ThreadsView(params){
      var className = relationTable["ThreadsView"];
      var now_params = [
        {ctg: PTYPE.NO_ANDROID, type: "String", index: 1, value: params[0]},
        {ctg: PTYPE.NO_IOS, type: "long", index: 1, value: params[0], key: "id"},
        {ctg: PTYPE.NO_ANDROID, type: "int", index: 1, value: 0}
      ];
      _call(className, "initWithBangID:initSkip:", now_params);
    }

    function MyKnowledgeView(params){
      var className = relationTable["MyKnowledgeView"];
      var now_params = [
        {ctg: PTYPE.ALL, type: "String", index: 1, value: params[0], key: "url"}
      ];
      _call(className, "initWithURL:", now_params);
    }

    function MessageListView(params){
      var className = relationTable["MessageListView"];
      var now_params = [
        {ctg: PTYPE.NO_ANDROID, type: "int", index: 1, value: params[0]}
      ];
      _call(className, "initWithOwnUid:", now_params);
    }

    return{
      EditUserInfo: EditUserInfo,
      ThreadListView: ThreadListView,
      NoticeListView: NoticeListView,
      WebView: WebView,
      SettingView: SettingView,
      PersonPageGroupListView: PersonPageGroupListView,
      PersonalPageThreadListView: PersonalPageThreadListView,
      PersonPageFriendView: PersonPageFriendView,
      NewPostView: NewPostView,
      BangDetailView: BangDetailView,
      ThreadsView: ThreadsView,
      MyKnowledgeView: MyKnowledgeView,
      MessageListView: MessageListView,

      AreaListView: function(){_callNoParams(relationTable["AreaListView"])},
      GroupChatNoticeListView: function(){_callNoParams(relationTable["GroupChatNoticeListView"])},
      RecAppListView: function(){_callNoParams(relationTable["RecAppListView"])},
      AboutView: function(){_callNoParams(relationTable["AboutView"])},
      FeedbackView: function(){_callNoParams(relationTable["FeedbackView"])},
      GroupPushSettingView: function(){if(!guestCheck()) return;_callNoParams(relationTable["GroupPushSettingView"])},
      UserCenterView: function(){_callNoParams(relationTable["UserCenterView"])},
      PersonalPageBackImageChooseView: function(){_callNoParams(relationTable["PersonalPageBackImageChooseView"])},
      DraftView: function(){if(!guestCheck()) return;_callNoParams(relationTable["DraftView"])},
      JZBBangHomeView: function(){_callNoParams(relationTable["JZBBangHomeView"])},
      PushListView: function(){_callNoParams(relationTable["PushListView"])},
      GroupChatHomeView: function(){_callNoParams(relationTable["GroupChatHomeView"])},
      AddGroupView: function(){_callNoParams(relationTable["AddGroupView"])},
      AddFriendsView: function(){if(!guestCheck()) return;_callNoParams(relationTable["AddFriendsView"])},
      MyFriendsListView: function(){_callNoParams(relationTable["MyFriendsListView"])},
      RecommendFriendsListView: function(){if(!guestCheck()) return;_callNoParams(relationTable["RecommendFriendsListView"])},
    }
  })();

  function initReady(cb){
    if(cb) cb(JzbApi);
    JzbApi.getUserInfo(function(r){
      user_info = r;
    });
  }

  // function randomString(len) {
  //   var len    = len || 32,
  //       $chars = "ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz2345678",
  //       maxPos = $chars.length,
  //       pwd    = "";
  //   for (var i = 0; i < len; i++) {
  //     pwd += $chars.charAt(Math.floor(Math.random() * maxPos));
  //   }
  //   return pwd;
  // }

  return {
    ready: function(cb){
      var base = 2000, deng = 0;
      if(isJzb){
        setTimeout(function() {
          run()
        }, 0)
      }
      function run() {
        if (!ios || WVJBIframe) {
          if(window.WebViewJavascriptBridge) {
	          initReady(cb);
	        }else{
	          document.addEventListener('WebViewJavascriptBridgeReady', function(){
	            initReady(cb);
	          },false);

	          setTimeout(function(){
	            if(!window.WebViewJavascriptBridge&&cb)
	              cb(JzbApi);
	          },1000);
	        }
          if (WVJBIframe) setTimeout(function() { D.removeChild(WVJBIframe) }, 0)
        } else {
          if (deng >= base) {
            alert('bridge error, 请联系家长帮技术部')
            return;
          }
          setTimeout(function() {
            deng += 50
            run()
          }, 50)
        }
      }
    },
    Downloader: _Downloader,
    GotoAnyPage: _GotoAnyPage
  }
})();
