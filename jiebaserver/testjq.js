
require("jsdom").env("", function(err, window) {
    if (err) {
        console.error(err);
        return;
    }


  query_from_server=function(){
    
    var result;
    $.getJSON("http://exp-linked-data-proxy-2017.dlll.nccu.edu.tw/wiki,moedict,cbdb,tgaz,cdict,pixabay/apple?callback=?", function (_data) {
    console.log(_data);
        result=$(_data[0]["response"]).text();
        console.log(result+"1");
    });
    console.log(result+"2");
    return result;
};

   var $ = require('jquery')(window);
   var test=query_from_server();
   console.log(test+"3");


});
/*
require("jsdom").env("", function(err, window) {
    if (err) {
        console.error(err);
        return;
    }




    $ = require("jquery")(window);
});
*/
/*
query_from_server=function(){
    
    var _output="";

    $.getJSON("http://exp-linked-data-proxy-2017.dlll.nccu.edu.tw/wiki,moedict,cbdb,tgaz,cdict,pixabay/apple?callback=?", function (_data) {
       // console.log(_data[1]["response"]);
        _output = _data[1]["response"];

    })
    console.log(_output);
    return _output;
};
*/
/*
var jsdom = require("jsdom");
var window = jsdom.jsdom().defaultView;

jsdom.jQueryify(window, "http://code.jquery.com/jquery-2.1.1.js", function () {
  window.$("body").append('<div class="testing">Hello World, It works</div>');

  console.log(window.$(".testing").text());
});
*/