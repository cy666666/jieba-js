var AUTOANNO = {};


var SELECTOR=".content";
cache_id = undefined;
var SELECT_TEXT;

var URL_LDP="http://exp-linked-data-proxy-2017.dlll.nccu.edu.tw";
//var URL_LDP="http://pc.pulipuli.info:3000";
var URL_JIEBA="http://localhost:8000";

var URL_BASE = "http://localhost:8000/";

var MODULE_NAME = {
      "zh.wikipedia.org": "維基百科",
      "www.moedict.tw": "萌典",
      "cdict.net": "字典",
      "maps.cga.harvard.edu": "TGAZ",
      "cbdb.fas.harvard.edu": "CBDB"
    };
var MODULE_SYMBOL ={
      "zh.wikipedia.org": "wiki",
      "www.moedict.tw": "moedict",
      "cdict.net": "cdict",
      "maps.cga.harvard.edu": "tgaz",
      "cbdb.fas.harvard.edu": "cbdb"
    };

AUTOANNO.css_list = [
  'client/css/style.css',
  'client/css/tooltipster.bundle.min.css',
  'client/css/tooltipster-sideTip-noir.min.css'
];
  AUTOANNO.js_list = {
  "client/js/utils.js": "link_data_proxy_utils",
  "client/js/tooltipster.bundle.min.js": "tooltipster.bundle.min.js",
  "client/js/rangy-core.js": "rangy-core.js"
};



AUTOANNO.iframe_post = function (_url, _data, _callback) {
    
    var _DEBUG = false;
    
    if (typeof(_data) === "function" && typeof(_callback) === "undefined") {
        _callback = _data;
        _data = {};
    }
    else if (typeof(_data) === "undefined") {
        _data = {};
    }
    
    var _id = "iframe_post" + (new Date()).getTime();
    var _body = $("body");
    var _form = $('<form action="' + _url + '" method="post" target="' + _id +  '"></form>')
            .hide().appendTo(_body);
    var _iframe = $('<iframe name="' + _id + '"></iframe>')
            .hide()
            .appendTo(_body);
    if (_DEBUG === true) {
        _iframe.show();
    }
    
    for (var _key in _data) {
        var _value = _data[_key];
        
        $('<input type="hidden" name="' + _key + '" value="' + _value + '" />')
                .appendTo(_form);
    }
    
    _iframe.bind("load", function () {
        setTimeout(function () {
            if (_DEBUG !== true) {
                _iframe.remove();
            }
            
            if (typeof(_callback) === "function") {
                _callback();
            }
        }, 100);
    });
    
    setTimeout(function () {
        _form.submit();
    }, 100);
    
};

AUTOANNO.iframe_post_callback = function(result) {

    var _retry = function () {
      $.getJSON(URL_JIEBA+"/parse_article?callback=?", function (data) {
          if (data === null) {
            setTimeout(function () {
              console.log("再次查詢");
              _retry();
            }, 10000);
            return;
          }

          var result = data.result;
          cache_id = data.cache_id;
          if (result === undefined || result === null) {
            setTimeout(function () {
              console.log("再次查詢");
              _retry();
            }, 10000);
            return;
          }
          else {
            //console.log(result);
            $(SELECTOR).html(result);

            AUTOANNO._setup_tooltip();

          }
      });
    };

    setTimeout(function () {
        _retry();
    }, 100);
};

AUTOANNO._setup_tooltip = function () {

  var _TOOLTIP_LOCK = false;
  var _TOOLTIP_CONTENT;
  $('.autoanno_tooltip').tooltipster({
      //maxWidth: 400,
      contentAsHTML: true,
      interactive: true,
      trigger:'click',
      theme:'tooltipster-noir',
      //contentCloning: true,
      functionBefore: function (instance, helper) {
        if (_TOOLTIP_LOCK === true) {
          instance.close(function () {
            _TOOLTIP_LOCK = false;

            $(helper.origin).click();

          });
          return false;
        }
        else {
          //setTimeout(function() {
          _TOOLTIP_CONTENT = $('<div style="text-align:center;margin-top: calc(25vh - 15px - 0.5rem)"><img src="'+URL_BASE+'client/js/loading.gif" /><br />Loading</div>');
          //$("#linked_data_proxy_result").append(_TOOLTIP_CONTENT);
          $(".tooltipster-content").append(_TOOLTIP_CONTENT);

          setTimeout(function () {
            var _add_term_mode = false;
            var _query_text = helper.origin;
            if (SELECT_TEXT !== undefined) {
                _query_text = SELECT_TEXT;
                _add_term_mode = true;
                SELECT_TEXT = undefined;
            }

            AUTOANNO.query(_query_text, _add_term_mode, function (_result) {
              _TOOLTIP_CONTENT = _result;
              //(helper.tooltip).find(".tooltipster-content").html(_TOOLTIP_CONTENT);
              $("#linked_data_proxy_result").html(_TOOLTIP_CONTENT);
              $(".tooltipster-content").html(_TOOLTIP_CONTENT);
            });
          }, 0);
        }
      },
      functionReady: function (instance, helper) {
        $(".tooltipster-content").html(_TOOLTIP_CONTENT);
        _TOOLTIP_LOCK = true;
        //instance.disable();
      }
  });

  rangy.init();
  console.log("ready");
  $(SELECTOR).mouseup(function () {
    var sel = rangy.getSelection();
    var _selection_text = sel.toString().trim();
    if (_selection_text !== "") {
      console.log("顯示tooltip,載入:" + _selection_text);
      SELECT_TEXT = _selection_text;
      //console.log(sel.getRangeAt(0).getDocument());
      //$(sel.getRangeAt(0)).click();
      $(sel.focusNode.parentElement).click();
    }
  });
};

AUTOANNO.query = function (instance, add_term_mode, callback) {
  var ts;
  if (typeof(instance) === "object") {
    ts = $(instance).text();
  }
  else {
    ts = instance;
  }
  
  
  var _url = URL_LDP+"/wiki,moedict,cbdb,tgaz,cdict,pixabay/"+ts+"?callback=?"; 
  $.getJSON(_url, function (_data) {
    var _result = $("<div></div>");
    var _que=$("<div></div>").addClass("que").appendTo(_result);
    var _menu = $("<div></div>").addClass("menu").appendTo(_result);

    var _que_text='<h2 class="tooltip_title">查詢字詞: '+ ts +'</h2>';
    _que.append(_que_text);

    if(add_term_mode===true){
      var _addterm_button= $('<input type="button" id="term" data-term="'+ts+'" value="添加新詞">');
      _addterm_button.css({
        "float": "right"
      });
      _addterm_button.click(function () {
        var term_value = $(this).data("term");
        $.getJSON(URL_JIEBA+"/add_term?callback=?", {term: term_value, cache_id: cache_id}, function(result) {

        });
        $.getJSON(URL_LDP+"/add_term?callback=?", {term: term_value, cache_id: cache_id}, function(result) {

        });
      });

      _addterm_button.prependTo(_que);
    }

    for (var _i = 0; _i < _data.length; _i++) {
      var _d = _data[_i];
      var _module = _d.module;
      if (typeof(_d.response) === "string") {
          var _response = _d.response;
          var _name = _module;
          if (typeof(MODULE_NAME[_module]) === "string") {
            _name = MODULE_NAME[_module];
            _symbol = MODULE_SYMBOL[_module];
          }
          var _menu_button = $('<button type="button" data-module="' + _module + '">' + _name +  '</button>');    
          _menu_button.click(function(event) {
            _result.find("fieldset").hide();
            var _data_module = $(this).data("module");
            
            _result.find('fieldset[data-module="' + _data_module + '"]').show();
          });

          _menu.append(_menu_button);
          if(add_term_mode===true){
            var _fieldset = $("<fieldset data-module='" + _module + "'><legend>" + _name + "</legend>" + _response + "</fieldset>");
            
          }
          else{
            var _fieldset = $("<fieldset data-module='" + _module + "'><legend>" + _name + "</legend>" + _response + "</fieldset>");
            var _legend = _fieldset.find("legend");
            var _plus_button = $('<button type="button" id="plus"> 有幫助 </button>')
                .appendTo(_legend);
            _plus_button.click(function () {
              //------------------------
              var _module = $(this).parents("fieldset:first").data("module");
              if (typeof(MODULE_SYMBOL[_module]) === "string") {
                _module = MODULE_SYMBOL[_module];
              }
              //ts = encodeURIComponent(ts);
              $.getJSON(URL_LDP+"/"+_module+"/"+ts+"/1?callback=?" ,function(result) {

              });
              //------------------------
            });
            var _minus_button = $('<button type="button" id="minus"> 沒有幫助 </button>').appendTo(_legend);
            _minus_button.click(function () {
              var  _module= $(this).parents("fieldset:first").data("module");
              if (typeof(MODULE_SYMBOL[_module]) === "string") {
                _module = MODULE_SYMBOL[_module];
              }
              $.getJSON(URL_LDP+"/"+_module+"/"+ts+"/-1?callback=?" ,function(result) {

              });
            });
            
          }
          _fieldset.hide();
          //_fieldset.append(_addterm_button);
          _result.append(_fieldset);
      }
    }  //end of for loop
    _result.find("fieldset:first").show();
    callback(_result);
  });
};

//---------------------------------------------------

AUTOANNO.load_css = function (_path) {
  $(function() {
    $('head').append( $('<link rel="stylesheet" type="text/css" />').attr('href', URL_BASE + _path) );
  });
};

AUTOANNO.load_js = function (_path, _id) {
  $(function() {
    $('head').append( $('<scri' + 'pt type="text/javascri' + 'pt" />').attr('src', URL_BASE + _path).attr('id', _id) );
  });
};

AUTOANNO.check_jquery = function (_callback) {
  if (typeof($) === "function") {
    _callback();
  }
  else {
    var _jquery_path = URL_BASE + "client/js/"+"jquery.js";
    AUTOANNO.getScript(_jquery_path, _callback);
  }
};

AUTOANNO.getScript = function (source, callback) {
    var script = document.createElement('script');
    var prior = document.getElementsByTagName('script')[0];
    script.async = 1;

    script.onload = script.onreadystatechange = function( _, isAbort ) {
        if(isAbort || !script.readyState || /loaded|complete/.test(script.readyState) ) {
            script.onload = script.onreadystatechange = null;
            script = undefined;

            if(!isAbort) { if(callback) callback(); }
        }
    };

    script.src = source;
    prior.parentNode.insertBefore(script, prior);
};

//---------------------------------------------------




AUTOANNO.init = function () {

  for (var _i = 0; _i < AUTOANNO.css_list.length; _i++) {
    AUTOANNO.load_css(AUTOANNO.css_list[_i]);
  }

  // ----------------------


  var _key_list = [];
  for (var _key in AUTOANNO.js_list) {
    _key_list.push(_key);
  }

  for (var _i = 0; _i < _key_list.length; _i++) {
    var _path = _key_list[_i];
    var _id = AUTOANNO.js_list[_path];
    AUTOANNO.load_js(_path, _id);
  }

  // ----------------------

  $(function() {
    // 網頁讀取完成之後才會做
    $('<div class="autoanno_tooltip_templates"><span id="autoanno_tooltip_content"><div id="linked_data_proxy_result" style="width: 50vw;height: 50vh;max-height: 50vh; overflow-y: auto;"></div></span></div><div id="result"></div>').appendTo($("body"));
    var content=$(SELECTOR).html();
    AUTOANNO.iframe_post(URL_JIEBA+"/parse_article", {article: content}, AUTOANNO.iframe_post_callback);
  });    
};

AUTOANNO.check_jquery(function () {
  console.log("init");
  AUTOANNO.init();
});

