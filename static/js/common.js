/*jQuery.each( [ "json_put", "json_delete", "json_post" ], function( i, method ) {
	jQuery[ method ] = function( url, data, callback, type ) {

		// Shift arguments if data argument was omitted
		if ( jQuery.isFunction( data ) ) {
			type = type || callback;
			callback = data;
			data = undefined;
		}

		// The url can be an options object (which then must have .url)
		return jQuery.ajax( jQuery.extend( {
			url: url,
			type: method.split("_")[1],
			dataType: type,
			contentType: "application/json",
			data: data,
			success: callback
		}, jQuery.isPlainObject( url ) && url ) );
	};
} );*/

var HOST = window.location.host;
var PROTOCOL = "http://";
var APP = "";
var URL_PRE = PROTOCOL + HOST + APP;
LANG_MAP = { 
	role : "角色", user : "用户", asset: "固定资产", manage : "管理", query : "查询", all: "全部", vdcs_eu_dlr: "vdcs_eu_dlr", jlr_msg_query: "jlr_msg_query",
},

jQuery.each( [ "json_put", "json_delete", "json_post", "_get" ], function( i, method ) {
	jQuery[ method ] = function( url, data, callback, type ) {

		//Shift arguments if data argument was omitted
		if ( jQuery.isFunction( data ) ) {
			type = type || callback;
			callback = data;
			data = undefined;
		}

		//The url can be an options object (which then must have .url)
		return jQuery.ajax( jQuery.extend( {
			url: url,
			type: method.split("_")[1],
			dataType: type,
			contentType: "application/json",
			data: data,
			success: callback,
			error: function(jqXHR, textStatus, errorThrown) {
				if (jqXHR.status === 401) {
					if (jqXHR.responseJSON !== undefined && jqXHR.responseJSON.err_code !== undefined) {
						var err_code = jqXHR.responseJSON.err_code;
						if (err_code === 4011 || err_code === 4012) {
							window.location.href = "login.html";
						} else if (err_code === 4013) {
							alertError(jqXHR);
						}
					}
				}
			},
		}, jQuery.isPlainObject( url ) && url ) );
	};
} );

function alertError(jqXHR, title) {
	var title = typeof title !== 'undefined' ?  title : "出错啦";
	var error = jqXHR.responseJSON && jqXHR.responseJSON.err_msg ? jqXHR.responseJSON.err_msg : "status: {0}<br/>statusText: {1}".format(jqXHR.status, jqXHR.statusText);  
	layer.alert(error, {
		title: title,
		icon: 5,
		skin: 'error',
	});
}

//String.format('{0} is dead, but {1} is alive! {0} {2}', 'ASP', 'ASP.NET');
//ASP is dead, but ASP.NET is alive! ASP {2}
if (!String.prototype.format) {
	String.prototype.format = function() {
		var args = arguments;
		return this.replace(/{(\d+)}/g, function(match, number) { 
			return typeof args[number] != 'undefined'
				? args[number]
				: match
				;
		});
	};
}

var _$ = function(elementID) {
	return document.getElementById(elementID);
};

function isEmpty(obj)
{
	for (var name in obj) 
	{
		return false;
	}
	return true;
}

function turnOnLoadingOverlay() {
	$(document).ajaxStart(function(){
		$.LoadingOverlay("show");
	});
	$(document).ajaxStop(function(){
		$.LoadingOverlay("hide");
	});
}

function highlight(ele) {
	ele.style.background = "#DDDDDD";
}

function clearHighlight(ele) {
	ele.style.background = "#FFFFFF";
}

function clearHighlightElems(_class) {
	var trs = document.getElementsByClassName(_class);
	if (trs) {
		var i = 0;
		for (; i < trs.length; i++) {
			clearHighlight(trs[i]);
		}
	}
}

var clone = function(obj) {
	return JSON.parse(JSON.stringify(obj));
};

function remove(array, element) {
	var index = array.indexOf(element);

	if (index !== -1) {
		array.splice(index, 1);
	}
}

function isASCII(str) {
    return /^[\x00-\x7F]*$/.test(str);
}

function isAlphanumeric(str) {
	return /^[0-9a-zA-Z]+$/.test(str);
}

//Non-Mutating Element Removal
//function remove(array, element) {
    //return array.filter(e => e !== element);
//}

/*function find_obj_by_key_value(key, value, array){*/
    //for (var i=0; i < array.length; i++) {
        //if (array[i][key] === value) {
            //return array[i];
        //}
    //}
//}

//function jsonToQueryString(json) {
	//return '?' + 
		//Object.keys(json).map(function(key) {
			//return encodeURIComponent(key) + '=' +
				//encodeURIComponent(json[key]);
		//}).join('&');
//}

//function clearFalse(obj) {
	//var _new = clone(obj);
	//Object.keys(_new).forEach(function (key) {
		//if(isFalse(_new[key])) {
			//delete _new[key];
		//}
	//});
	//return _new;
/*}*/

function isFalse(value) {
	return value ? false : true;
}

/*Layer = {*/

	//open : function(ele) {
		//if (ele instanceof jQuery) {
			//throw "ele should not be a jQuery object!";
		//}	
		//var _ele = $(ele);
		//var index = layer.open({
			//type: 1,
			//content: _ele,
			//closeBtn: 0
		//});
		//ele.layerIndex = index;
	//},

	//close : function(ele) {
		//if (ele instanceof jQuery) {
			//throw "ele should not be a jQuery object!";
		//}	
		//layer.close(ele.layerIndex);
		//ele.layerIndex = undefined;
	//},

/*};*/
