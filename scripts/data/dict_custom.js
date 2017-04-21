_custom_dict = [
	["泡沫", 99999, "n"],
	["泡沫紅茶", 99999, "n"],
	["泡沫綠茶", 99999, "n"],
	["天公伯", 999, "n"],	
	["新詞", 999, "n"],
	["漫畫", 99999999, "n"],
	["誠意伯",999999,"n"],
	["郁離子",9999,"n"],
	["明經",999,"n"],
	["國初",999,"n"],
	["國初誠意伯",1,"n"]
];

// 引用設定檔案，以下不用變更
if (typeof(define) === "function") {
    define(function (require) {
        return _custom_dict;
    });
}
else {
    module.exports = _custom_dict;
}