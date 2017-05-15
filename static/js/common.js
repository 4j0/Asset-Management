var HOST = window.location.host;
var PROTOCOL = "http://";
var APP = "";
var URL_PRE = PROTOCOL + HOST + APP;

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
};

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
//Non-Mutating Element Removal
//function remove(array, element) {
    //return array.filter(e => e !== element);
//}

function isFalse(value) {
	return value ? false : true;
}

//Ppd = Post Put Delete
var Ppd = function(data) {
	if (data) {
		this.id = data.id;
		this.data = {};
		this.update(data);
	}
};

Ppd.prototype = {

	post: function() {
		var def = $.Deferred();
		var data = JSON.stringify(this.data);
		$.json_post(this.URL, data, 'json')
			.done(function(data) {
				var dataObj = JSON.parse(data);
				this.id = dataObj.id;
				def.resolve();
			}.bind(this))
		.fail(function(jqXHR) {
			def.reject(jqXHR);
			alertError(jqXHR);
		});
		return def.promise();
	},

	put: function(_data) {
		var def = $.Deferred();
		_data = JSON.stringify(_data);
		var url = this.URL + "/" + this.id;
		$.json_put(url, _data, 'json')
			.done(function(data) {
				this.data = JSON.parse(_data);
				def.resolve();
			}.bind(this))
		.fail(function(jqXHR) {
			def.reject(jqXHR);
			alertError(jqXHR);
		});
		return def.promise();
	},

	patch: function() {

	},

	//url: function() {
		//return this.URL + "/" + this.id;
	//},

	del: function() {
		var def = $.Deferred();
		var data = JSON.stringify({ "id" : this.id });
		var url = this.URL + "/" + this.id;
		$.json_delete(url, data)
			.done(function() {
				def.resolve();
			})
		.fail(function(jqXHR) {
			def.reject(jqXHR);
			alertError(jqXHR);
		});
		return def.promise();
	},
};
