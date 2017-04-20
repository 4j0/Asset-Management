var Role = function (roleData) {
	this.id = roleData.id;
	this.name = roleData.name;
	this.permission = this.init_permission(roleData.permission);
	this.url = this.generate_url();
	this.post_url = URL_PRE + "/roles";
	this.permissionBak = null;
};

Role.prototype = {

	generate_url : function() {
		return URL_PRE + "/roles/" + this.id;
	},

	post : function() {
		var def = $.Deferred();
		var data = JSON.stringify({ name : this.name, permission : this.getPermissionNum() });
		$.json_post(this.post_url, data, 'json')
			.done(function(data) {
				var dataObj = JSON.parse(data);
				this.id = dataObj.id;
				this.url = this.generate_url();
				def.resolve();
			}.bind(this))
		.fail(function(jqXHR) {
			def.reject(jqXHR);
		});
		return def.promise();
	},

	init_permission : function(n) {
		if (n < 0 || n > 2147483647) {
			throw new RangeError();
		}
		var permission = {};
		for (var module in Role.PERMISSIONS) {
			permission[module] = {};
			for (var p in Role.PERMISSIONS[module]) {
				if (Role.PERMISSIONS[module][p] & n) {
					permission[module][p] = true;
				} else {
					permission[module][p] = false;
				}
			}
		}
		return permission;
	},

	backupPermission : function() {
		this.permissionBak = clone(this.permission);
	},

	restorePermission : function() {
		this.permission = clone(this.permissionBak);
	},

	getPermissionNum : function() {
		var n = 0;
		for (var module in this.permission) {
			for (var p in this.permission[module]) {
				if (this.permission[module][p] === true) {
					n += Role.PERMISSIONS[module][p];
				}
			}
		}
		return n;
	},	

	putPermission : function() {
		var def = $.Deferred();
		var n = this.getPermissionNum();
		var url = this.url + "/permission";
		var data = JSON.stringify({ "permission" : n });
		$.json_put(url, data)
			.done(function() {
				def.resolve();
			})
		.fail(function(jqXHR) {
			def.reject(jqXHR);
		});
		return def.promise();
	},

	delete : function() {
		var def = $.Deferred();
		var data = JSON.stringify({ "id" : this.id });
		$.json_delete(this.url, data)
			.done(function() {
				def.resolve();
			})
		.fail(function(jqXHR) {
			def.reject(jqXHR);
		});
		return def.promise();
	},

};
