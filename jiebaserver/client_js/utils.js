LINK_DATA_PROXY = {};

LINK_DATA_PROXY.host;
LINK_DATA_PROXY.get_host = function () {
    if (LINK_DATA_PROXY.host !== undefined) {
        return LINK_DATA_PROXY.host;
    }
    var _scripts = $("script#link_data_proxy_utils");
    var _needle = "/utils.js";
    for (var _i = 0; _i < _scripts.length; _i++) {
        var _src = _scripts.eq(_i).attr("src");
        if (_src.substring( _src.length-_needle.length, _src.length ) === _needle) {
            LINK_DATA_PROXY.host = _src.substr(0, _src.length - _needle.length + 1);
            return LINK_DATA_PROXY.host;
        }
    }
};

LINK_DATA_PROXY.check = function (_query, _modules, _callback) {
    if (typeof(_callback) !== "function") {
        return;
    }
    
    var _url = "http://exp-linked-data-proxy-2017.dlll.nccu.edu.tw/" + "check/" + _modules.join(",") + "?callback=?";
    var _data = {
        "query": _query
    };
        
    $.post(_url, _data, function () {
    //    console.log(1);

        var _check = function () {
            $.getJSON(_url, function (_result) {
                //console.log(2);
                //console.log(_result);
                if (typeof(_result) !== "object") {
                    setTimeout(function () {
                        //console.log("wait");
                        _check();
                    }, 3000);
                }
                else {
                    //$("#check_result").html(_result.join(" "));
                    _callback(_result);
                }
            });
        };
        _check();

    });
};

LINK_DATA_PROXY.vote = function (_query, _module, _score, _callback) {
    var _url = "http://exp-linked-data-proxy-2017.dlll.nccu.edu.tw/" + _module + "/" + encodeURI(_query) + "/" + _score + "?callback=?";
    $.getJSON(_url, _callback);
};

LINK_DATA_PROXY.query = function (_query, _modules, _callback) {
    var _url = "http://exp-linked-data-proxy-2017.dlll.nccu.edu.tw/" + _modules.join(",") + "/" + encodeURI(_query) + "?callback=?";
    $.getJSON(_url, _callback);
};