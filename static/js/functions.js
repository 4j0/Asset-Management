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

