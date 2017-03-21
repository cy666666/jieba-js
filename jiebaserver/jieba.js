require('../scripts/main.js');
var express = require('express');
var dict1 = require('../scripts/data/dictionary.js');
var dict2 = require('../scripts/data/dict_custom.js');

app=express();
app.set('port',process.env.PORT || 8000);


var server=app.listen(app.get('port'),function(){
	console.log('Server up: http://localhost:'+app.get('port'));
});

app.get('/',function(req,res){
	var article ;
	article=JSON.stringify(req.query.article);
	article=article.replace(/\"/g, "");
	article=article.replace(/(?:\\[rnt]|[\r\n\t]+)+/g, "");
	var result ;
	node_jieba_parsing([dict1, dict2], article, function (_result) {
    console.log(_result.join(" "));
    	var resultlength=_result.length-1;
					for(i=0;i<=resultlength;i=i+1){
						if(_result[i].length>1){
							_result[i]='<span class="popuptext" id="myPopup">'+_result[i]+'</span>';
						}
					}
		result=_result.join(" ");
	});

	res.jsonp(result);
})
/*

require('../scripts/main.js');

_text = "這個布丁是在無聊的世界中找尋樂趣的一種不能吃的食物，喜愛動漫畫、遊戲、程式，以及跟世間脫節的生活步調。";

dict1 = require('../scripts/data/dictionary.js');
dict2 = require('../scripts/data/dict_custom.js');


node_jieba_parsing([dict1, dict2], _text, function (_result) {
    console.log(_result.join(" "));
});


*/