var _$ = function(elementID) {
	return document.getElementById(elementID);
};

var clone = function(obj) {
	return JSON.parse(JSON.stringify(obj));
};

function find_obj_by_key_value(key, value, array){
    for (var i=0; i < array.length; i++) {
        if (array[i][key] === value) {
            return array[i];
        }
    }
}

function jsonToQueryString(json) {
	return '?' + 
		Object.keys(json).map(function(key) {
			return encodeURIComponent(key) + '=' +
				encodeURIComponent(json[key]);
		}).join('&');
}

function clearFalse(obj) {
	var _new = clone(obj);
	Object.keys(_new).forEach(function (key) {
		if(isFalse(_new[key])) {
			delete _new[key];
		}
	});
	return _new;
}

function isFalse(value) {
	return value ? false : true;
}

function Ajax() {}

/**
 * get请求
 * @param {String}   url     请求地址,文件名
 * @param {Function} fnSucc  请求成功时执行的函数
 * @param {Function} fnFaild 请求失败执行的函数
 */
Ajax.get = function(url, fnSucc, fnFaild) {
	var xmlHttpRequest = new XMLHttpRequest();
    //2.连接服务器
    //open(方法,url,是否异步)
    xmlHttpRequest.open("GET", url, true);
    //3.发送请求
    xmlHttpRequest.send();
    //4.接收返回
    //OnRedayStateChange事件
    xmlHttpRequest.onreadystatechange = function () {
        if (xmlHttpRequest.readyState === 4) {
            if (xmlHttpRequest.status === 200) {
                //alert("成功" + xmlHttpRequest.responseText);
                fnSucc(xmlHttpRequest.responseText);
            } else {
                //alert("服务器响应失败!");
                if (fnFaild) {
                    fnFaild();
                }
            }
        }
    };
};

/**
 * post请求
 * @param {String}   url     请求地址,文件名
 * @param {Function} fnSucc  请求成功时执行的函数
 * @param {Function} fnFaild 请求失败执行的函数
 */
Ajax.post = function(url, str, fnSucc, fnFaild) {
	var xmlHttpRequest = new XMLHttpRequest();
    //2.连接服务器
    //open(方法,url,是否异步)
    xmlHttpRequest.open("POST", url, true);
    //xmlHttpRequest.open("XMLHttpRequestPOST", url, true);
	//设置相应头为json格式
	xmlHttpRequest.setRequestHeader('Content-Type', 'application/json; charset=UTF-8');
    //3.发送请求
    xmlHttpRequest.send(str);
    //4.接收返回
    //OnRedayStateChange事件
    xmlHttpRequest.onreadystatechange = function () {
        if (xmlHttpRequest.readyState === 4) {
            if (xmlHttpRequest.status === 200) {
				if (fnSucc) {
					fnSucc(xmlHttpRequest.responseText);
				}
            } else {
                if (fnFaild) {
                    fnFaild();
                }
            }
        }
    };
};

Ajax.put = function(url, str, fnSucc, fnFaild) {
	var xmlHttpRequest = new XMLHttpRequest();
    //2.连接服务器
    //open(方法,url,是否异步)
    xmlHttpRequest.open("PUT", url, true);
	//设置相应头为json格式
	xmlHttpRequest.setRequestHeader('Content-Type', 'application/json; charset=UTF-8');
    //3.发送请求
    xmlHttpRequest.send(str);
    //4.接收返回
    //OnRedayStateChange事件
    xmlHttpRequest.onreadystatechange = function () {
        if (xmlHttpRequest.readyState === 4) {
            if (xmlHttpRequest.status === 201) {
				//console.log(xmlHttpRequest.responseText);
				if (fnSucc) {
					fnSucc();
				}
            } else {
                if (fnFaild) {
                    fnFaild(xmlHttpRequest.status);
                }
            }
        }
    };
};
