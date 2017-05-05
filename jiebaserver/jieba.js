require('../scripts/main.js');
require('../jiebaserver/testjq.js');

var express = require('express');
var GENERAL_DICT = require('../scripts/data/dictionary.js');

var request = require("request");


var sub_array=[];     //for loop把temp_array裡的sub_array取出來依序丟到linked data proxy進行check
var check_result_array=[];  //各個sub_array進行check後回傳的check_result_array
var sub_result;         //各個check_result_array轉為string

var URL = "http://exp-linked-data-proxy-2017.dlll.nccu.edu.tw/check/wiki,moedict,cbdb,tgaz,cdict,pixabay/" ;
//var URL = "http://pc.pulipuli.info:3000/check_post/wiki,moedict,cbdb,tgaz,cdict,pixabay/";
var fs = require('fs');

var DIR_LJL='../jiebaserver/ljlarticle';

/*var _modules = ["wiki","moedict","cbdb","tgaz","pixabay"];*/
app=express();

var bodyParser = require('body-parser');
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies

require("./session.js");
Cookies = require( "cookies" );

require('./database.js');
//--------------------------------------------------------------------------------------------
app.get("/client/js/linked-data-proxy-lib.js", function (_req, _res) {
    fs.readFile("./client_js/linked-data-proxy-lib.js", 'utf8', function (err, data) {
        _res.setHeader('content-type', 'text/javascript');
        _res.send(data);
    });
});

app.get("/client/css/style.css", function (_req, _res) {
    fs.readFile("./client_css/style.css", 'utf8', function (err, data) {
        _res.setHeader('content-type', 'text/css');
        _res.send(data);
    });
});
app.get("/client/css/tooltipster.bundle.min.css", function (_req, _res) {
    fs.readFile("./client_css/tooltipster.bundle.min.css", 'utf8', function (err, data) {
        _res.setHeader('content-type', 'text/css');
        _res.send(data);
    });
});
app.get("/client/css/tooltipster-sideTip-noir.min.css", function (_req, _res) {
    fs.readFile("./client_css/tooltipster-sideTip-noir.min.css", 'utf8', function (err, data) {
        _res.setHeader('content-type', 'text/css');
        _res.send(data);
    });
});

app.get("/client/js/jquery.js", function (_req, _res) {
    fs.readFile("./client_js/jquery.js", 'utf8', function (err, data) {
        _res.setHeader('content-type', 'text/javascript');
        _res.send(data);
    });
});
app.get("/client/js/rangy-core.js", function (_req, _res) {
    fs.readFile("./client_js/rangy-core.js", 'utf8', function (err, data) {
        _res.setHeader('content-type', 'text/javascript');
        _res.send(data);
    });
});
app.get("/client/js/utils.js", function (_req, _res) {
    fs.readFile("./client_js/utils.js", 'utf8', function (err, data) {
        _res.setHeader('content-type', 'text/javascript');
        _res.send(data);
    });
});
app.get("/client/js/tooltipster.bundle.min.js", function (_req, _res) {
    fs.readFile("./client_js/tooltipster.bundle.min.js", 'utf8', function (err, data) {
        _res.setHeader('content-type', 'text/javascript');
        _res.send(data);
    });
});

app.get("/client/js/loading.gif", function (_req, _res) {
    fs.readFile("./client_js/loading.gif", function (err, data) {
        _res.setHeader('content-type', 'image/gif');
        _res.send(data);
    });
});

//----------------------------------------------------------------------------------------------
app.get("/article",function(req, res){
	fs.readFile("./template/article.html", 'utf8',function(err, data){
		res.setHeader('content-type', 'text/html');

		//var _title = "title";
		
		//console.log(typeof(data));
		//console.log(data);
		fs.readFile('./ljlarticle/'+req.query.file, 'utf8', function (err,content) {
		  if (err) {
		    return console.log(err);
		  }
		  var _title = req.query.file;
		  var _content = content;

		  _content = _content.split("\n").join("<br />");

		  data = data.replace(/{{TITLE}}/g, _title);
		  data = data.replace(/{{CONTENT}}/g, _content);
		  res.send(data);
		});
		
		
	});
});


app.get("/directory",function(req, res){
	fs.readFile("./template/directory.html", 'utf8',function(err, data){
		res.setHeader('content-type', 'text/html');
		

		fs.readdir(DIR_LJL, function(err, files) {
		    if (err) return;
		    var _content="";
		    files.forEach(function(f) {
		        _content = _content 
		        	+ '<li><a href="article?file=' + f + '">' + f + '</a></li>' ;
		    });
		    data = data.replace(/{{CONTENT}}/g, _content);
		    res.send(data);
		});
	});
});
//----------------------------------------------------------------------------------------------

app.post("/parse_article", function (req, res) {

	var cookies = new Cookies( req, res );

	var article = req.body.article;
	//console.log(article);
	
	tableArticleCache.findOrCreate({
		where:{article:article}
	})
		.spread(function(articlecache, created) {

	  	// 2. 把暫存檔案的路徑放入COOKIE	
	  	var cache_id = articlecache.get('id');
	  	cookies.set("cache_id", cache_id);
	  	//console.log(created);
	  	//console.log(articlecache.get("result"));
	  	//console.log(articlecache.get({plain: true}));
	  	res.send("");
		if (created === true 
			|| articlecache.get("result") === null 
			|| articlecache.get("result") === "" ) {
		  	// 3. 開始斷詞或其他的處理
		  	_process(article, function(result) {
		  		// 4. 處理完之後放入暫存檔案 
		  		//console.log("4. 處理完之後放入暫存檔案 ");
		  		//console.log(result);
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
	var dict_custom='../scripts/data/dict_custom.json';
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
				var _head = dict_string.substr(0,2);
				var _new_term = '\t["' + term  + '", 99999, "n"],\n';
				var _foot = dict_string.substring(2,dict_string.length);

				var _new_dict = _head + _new_term + _foot;

				//var termtojson='["'+term+'", 999, "n" ]';
				// 	["郁離子",9999,"n"],
				fs.writeSync(foo,_new_dict,0);
				fs.close(foo);
				_load_custom_dict();

			// 5. 刪除快取 by cache id
			
			/*	tableArticleCache
				.findById(cache_id)
				.then(function(task){
					console.log(cache_id);
					return task.destroy();
				});
			*/
				tableArticleCache.update(
		  			{result:null},
		  			{where:{id:cache_id}}
		  		);
		  		res.jsonp(true);
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


var _custom_dict = undefined;
var _load_custom_dict = function () {
	var json = JSON.parse(fs.readFileSync('../scripts/data/dict_custom.json', 'utf8'));
	_custom_dict=json;
	node_jieba_reset();
};

_load_custom_dict();
/**
 * callback(result)
 */
var _process = function (article, callback) {

	//callback("aaaaaaa12121212a" + article);
	//return;


var _parse_check_result_array = function (sub_array, check_result_array) {
		var _result = [];
		//console.log(sub_array);
		if (check_result_array !== undefined) {
			for (var i = 0; i < sub_array.length; i++ ) {
				if (sub_array[i] === "\n" && _replace_br === true) {
					_result.push('<br />');
					continue;
				}

				var found = false;
				var _word = sub_array[i].replace(/(?:\\[rnt]|[\r\n\t]+)+/g, "").trim();
				if (_word === ""  
					|| _word === " " 
					|| _word === "\n"
					|| _word === "\r"
					|| _word === "\t") {
					_result.push(sub_array[i]);
					continue;
					
				} 


				for (var j = 0; j < check_result_array.length; j++) {
					if (sub_array[i] === check_result_array[j]) {
						found = true;
						break;
					}
				}


				if (found === true)  {
	 				_result.push('<span class="autoanno_vocabulary autoanno_tooltip" data-tooltip-content="#autoanno_tooltip_content">'
 						+ sub_array[i]
 						+ '</span>');
				}
				else {
					_result.push('<span class="autoanno_vocabulary">'
						+ sub_array[i] 
						+ '</span>');
				}
			}
		}
			
		//console.log(sub_result);
		sub_result=_result.join("");
		//console.log(sub_result);
		return sub_result;
	};  //end of var _parse_check_result_array = function (sub_array, check_result_array)

	// ----------------------------------------

var _node_jieba_parsing_callback = function (_result) {
		//console.log(_result);
		//return;

		var temp_array=[];    //把斷完詞的array以每50個詞進行切分  切分為數個array ex:[[a,b,....],[c,d,....]]
		var joined_result = "";    //把每個sub_result結合起來 準備回傳給client

		//console.log(article);
		var BATCH_CHECK = 10;

		for(var t=0,len=_result.length;t<len;t+=BATCH_CHECK){
			temp_array.push(_result.slice(t,t+BATCH_CHECK));
		}

		// array: temp_array
		// limit: temp_array.length
		// callback: callback(joined_result);



		var _loop = function (_i) {
			if (_i < temp_array.length) {
				//console.log("送出第" + _i + "次");
				// 執行迴圈
				var sub_array = [];
				for (var _t = 0; _t < temp_array[_i].length; _t++) {
					//var _term = temp_array[_i][_t].replace(/(?:\\[rnt]|[\r\n\t]+)+/g, "").trim();
					var _term = temp_array[_i][_t];
					if (_term !== "") {
						sub_array.push(_term);
					}
					
				}

				var sub_result=sub_array.join(" ");

				if(sub_array.length === 0 
					|| sub_result === "" 
					|| sub_result === undefined ){
					_i++;
					_loop(_i);
					return;
				}

				//console.log(sub_result);

				var _defalut_timeout=0;
				//console.log(["check url", URL]);
				request({
					url: URL,
					method:'POST',
					json: {query:sub_result}
				}, function (error, response, body) {
					if (!error 
						&& response.statusCode === 200 
						&& typeof(body) !== "undefined" ) {
						//console.log(body.join(","));
						if (typeof(body) === "undefined" 
							&& typeof(response.body) !== "undefined") {
							body = response.body;
						} 
						joined_result = joined_result + _parse_check_result_array(sub_array, body);
						_i++;
						_defalut_timeout=0;
					}
					else{
						_defalut_timeout=10000;
						//console.log("[" + sub_result + "]");
					}
					
					setTimeout(function() {
						//console.log(_defalut_timeout);
						_loop(_i);
					}, _defalut_timeout);
					
				});
				
			}
			else {
				// 結束了
				//console.log(joined_result);
				callback(joined_result);
			}
		};
		_loop(0);

	};

	// --------------------------
	//article = article.substr(0, 50);

	//article=article.replace(/\"/g, "");
	//article=article.replace(/(?:\\[rnt]|[\r\n\t]+)+/g, "");

	//console.log(article);
	//return;
	
	//console.log(_custom_dict);
	var _replace_br = false;
	if (article.indexOf("<br>") > -1) {
		article = article.replace(/<br>/g, "\n");
		_replace_br = true;
	}
	

	node_jieba_parsing([GENERAL_DICT, _custom_dict], article, _node_jieba_parsing_callback);	// end of node_jieba_parsing([dict1, dict2], article, function (_result) {
}; // end of process



app.set('port',process.env.PORT || 8000);
var server=app.listen(app.get('port'),function(){
	console.log('Server up: http://localhost:'+app.get('port'));
});
