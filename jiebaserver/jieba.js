require('../scripts/main.js');
require('../jiebaserver/testjq.js');

var express = require('express');
var dict1 = require('../scripts/data/dictionary.js');
var dict2 = require('../scripts/data/dict_custom.js');
var request = require("request");
//var tmp = require("tmp");

var temp_array=[];    //把斷完詞的array以每100個詞進行切分  切分為數個array ex:[[a,b,....],[c,d,....]]
var sub_array=[];     //for loop把temp_array裡的sub_array取出來依序丟到linked data proxy進行check
var check_result_array;  //各個sub_array進行check後回傳的check_result_array
var sub_result;         //各個check_result_array轉為string
var joined_result;    //把每個sub_result結合起來 準備回傳給client
var url = "http://exp-linked-data-proxy-2017.dlll.nccu.edu.tw/check/wiki,moedict,cbdb,tgaz,cdict,pixabay/" ;

var fs = require('fs');


/*var _modules = ["wiki","moedict","cbdb","tgaz","pixabay"];*/
app=express();

var bodyParser = require('body-parser');
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies

require("./session.js");
Cookies = require( "cookies" );

require('./database.js');


app.post("/parse_article", function (req, res) {

	var cookies = new Cookies( req, res );

	var article = req.body.article;
	
	tableArticleCache.findOrCreate({
		where:{article:article}
	})
		.spread(function(articlecache, created) {

	  	// 2. 把暫存檔案的路徑放入COOKIE	
	  	var cache_id = articlecache.get('id');
	  	cookies.set("cache_id", cache_id);
	  	res.send("");
		if (created === true || articlecache.get("result") === null || articlecache.get("result") === "") {
		  	// 3. 開始斷詞或其他的處理
		  	_process(article, function(result) {
		  		// 4. 處理完之後放入暫存檔案 
		  		tableArticleCache.update(
		  			{result:result},
		  			{where:{id:cache_id}}
		  		);
		  	});
	  	}
	  });	
});

app.get("/parse_article", function (req, res) {

	// 1. 取得COOKIE
	var cookies = new Cookies( req, res );
    var cache_id = cookies.get("cache_id");
    cache_id = parseInt(cache_id, 10);


	// 2. 取得暫存檔案
	tableArticleCache
	  .findById(cache_id)
	  .then(function(articlecache) {
	  	if (articlecache === null || articlecache.get("result") === null || articlecache.get("result") === "") {
	  		// 3-1. IF 暫存檔案沒有資料: 回傳undefined
	  		res.jsonp(null);
	  	}
	  	else {
	  		// 3-2. if 暫存檔案有資料
			// 回傳資料
			res.jsonp({
				result: articlecache.get("result"),
				cache_id: cache_id
			});
	  	}
	  });
});

app.get("/add_term",function (req, res){
	var term = req.query.term;
	var cache_id = req.query.cache_id;
	var dict_string="";
	// 1. 取得dict_custom.js
	var dict_custom='../scripts/data/dict_custom.js';
	var foo=fs.openSync(dict_custom,'r+');
	fs.readFile(dict_custom, "utf-8" ,function(err,data){
		if(err){
			console.log('檔案讀取錯誤');
		}
		else{
			dict_string=data.toString();
			//console.log(dict_string);
			var term_existat = dict_string.indexOf('"'+term+'",');
			
	// 2. 檢查裡面有沒有這個term
	// 3. 如果沒有
			if(term_existat === -1){    
				//console.log("這是新詞");

			// 4. 把詞庫加入term，重組dict_custom.js
				var _head = dict_string.substr(0,17);
				var _new_term = '\t["' + term  + '", 99999, "n"],\n';
				var _foot = dict_string.substring(17,dict_string.length);

				var _new_dict = _head + _new_term + _foot;

				//var termtojson='["'+term+'", 999, "n" ]';
				// 	["郁離子",9999,"n"],
				fs.writeSync(foo,_new_dict,0);
				fs.close(foo);

			// 5. 刪除快取 by cache id
				tableArticleCache
				.findById(cache_id)
				.then(function(task){
					return task.destroy();
				});
				}
	// 6. 如果已經有這個詞了...
			else{
				//console.log("詞庫的第:"+term_existat+"個字找到 "+term+" 這個詞");
				

			}	
		}
		
	});
	
	//console.log(term);
});
// --------------------------------------------------------

/**
 * callback(result)
 */
var _process = function (article, callback) {

	//callback("aaaaaaa12121212a" + article);
	//return;

	// --------------------------
	//article = article.substr(0, 50);

	article=article.replace(/\"/g, "");
	article=article.replace(/(?:\\[rnt]|[\r\n\t]+)+/g, "");
	
	node_jieba_parsing([dict1, dict2], article, function (_result) {
	

	for(var t=0,len=_result.length;t<len;t+=100){
		temp_array.push(_result.slice(t,t+100));
	}

	
	for(var s=0;s<temp_array.length;s++){
		sub_array=temp_array[s];
		sub_result=sub_array.join(" ");
		


		request({
			url: url,
			method:'POST',
			json: {query:sub_result}
		}, function (error, response, body) {
		  	
			check_result_array=body;   		  
			console.log(check_result_array);
			
			if (!error && response.statusCode === 200) {
			    //console.log(body.join(" "));
			    //console.log(seq_result_array);
				//console.log(check_result_array);

			for ( var i = 0; i < sub_array.length; i++ ) {
				var found = false;
				for (var j = 0; j < check_result_array.length; j++) {
					if (sub_array[i] === check_result_array[j]) {
						found = true;
						break;
					}
				}

				if (found === true)  {
	 				sub_array[i]='<span class="vocabulary tooltip">'+sub_array[i]+'</span>';
				}
				else {
					sub_array[i]='<span class="vocabulary">'+sub_array[i]+'</span>';
				}
			}

		sub_result=sub_array.join("");
		
		}
		});   //處理完每段sub array的check
		joined_result+=sub_result;
	
	}   //sub array的for迴圈

	callback(joined_result);
	});
};

	
/*
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
*/
	//res.jsonp(result);
	//callback(result);




// --------------------------------------------------------
/*
app.get('/',function(req,res){
	
	var article ;

	article=JSON.stringify(req.query.article);
	article=article.replace(/\"/g, "");
	article=article.replace(/(?:\\[rnt]|[\r\n\t]+)+/g, "");
	var result ;
	node_jieba_parsing([dict1, dict2], article, function (_result) {
	
	seq_result_array=_result;  //save segement result to an array seq_result_array

	console.log(_result.join(" "));

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


});

*/
// -------------------------------------------------------------


app.set('port',process.env.PORT || 8000);
var server=app.listen(app.get('port'),function(){
	console.log('Server up: http://localhost:'+app.get('port'));
});
