require('../scripts/main.js');
var express = require('express');
var dict1 = require('../scripts/data/dictionary.js');
var dict2 = require('../scripts/data/dict_custom.js');
var request = require("request");
var seq_result_array;
var check_result_array;
var url = "http://exp-linked-data-proxy-2017.dlll.nccu.edu.tw/check/wiki,moedict,cbdb,tgaz,cdict,pixabay/" ;

require('../jiebaserver/testjq.js');
/*var _modules = ["wiki","moedict","cbdb","tgaz","pixabay"];*/
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
	
	seq_result_array=_result;  //save segement result to an array seq_result_array

	console.log(_result.join(" "));
		/*
    	var resultlength=_result.length-1;
					for(i=0;i<=resultlength;i=i+1){
							_result[i]='<span class="vocabulary">'+_result[i]+'</span>';
					}*/
		result=_result.join(" ");

	});
	request({
		url: url,
		method:'POST',
		json: {query:result}
	}, function (error, response, body) {
			  

		check_result_array=body;   //save segement result to an array seq_result_array		  
		
		if (!error && response.statusCode === 200) {

			

		    console.log(body.join(" "));
		}
	})

	console.log(seq_result_array);
	console.log(check_result_array);
	

	for ( var i = 0; i < seq_result_array.length; i++ ) {
			//if (seq_result_array[i]==check_result_array[j]) {
			var found = false;
			for (var j = 0; j < check_result_array.length; j++) {
				if (seq_result_array[i] === check_result_array[j]) {
					found = true;
					break;
				}
			}

			if (found === true)  {
 				seq_result_array[i]='<span class="vocabulary tooltip">'+seq_result_array[i]+'</span>';
			}
			else {
				seq_result_array[i]='<span class="vocabulary">'+seq_result_array[i]+'</span>';
			}
	}

	// [
	//    '<span class="vocabulary">誠意伯</span>',
	//    '<span class="vocabulary">劉</span>',



	result=seq_result_array.join("");

	res.jsonp(result);
})
