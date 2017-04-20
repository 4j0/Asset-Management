var Permission = function(n) {
	this.dict = {};
	this.n = 0;
	this.setN(n);
};

Permission.TEMPLATE = null;

Permission.prototype = {

	updateN : function() {
		this.n = this.dictToNum(this.dict);
	},

	dictToNum : function(dict) {
		var n = 0;
		for (var module in dict) {
			for (var p in dict[module]) {
				if (dict[module][p] === true) {
					n += Permission.TEMPLATE[module][p];
				}
			}
		}
		return n;
	},

	setN : function(n) {
		if (Number.isInteger(n) === false) {
			throw new TypeError("n must be an integer!");
		}
		if (n < 0 || n > 2147483647) {
			throw new RangeError();
		}
		this.n = n;
		this.dict = this.numToDict(n);
	},

	numToDict : function(n) {
		if (Number.isInteger(n) === false) {
			throw new TypeError("n must be an integer!");
		}
		if (n < 0 || n > 2147483647) {
			throw new RangeError();
		}
		var dict = {};
		for (var module in Permission.TEMPLATE) {
			dict[module] = {};
			for (var p in Permission.TEMPLATE[module]) {
				if (Permission.TEMPLATE[module][p] & n) {
					dict[module][p] = true;
				} else {
					dict[module][p] = false;
				}
			}
		}
		return dict;
	},

};

var Role = function(roleData) {
	this.id = roleData.id;
	this.name = roleData.name;
	this.permission = new Permission(roleData.permission);
};

var User = function (userData) {
	this.id = userData.id;
	this.name = userData.name;
	this.password = (typeof userData.password !== 'undefined') ?  userData.password : null;
	this.permissionCached = false;
	this.permission = new Permission(0);
	this.rolePermission = new Permission(0);
	this.userPermission = new Permission(userData.permission);
	this.url = this.generate_url();
	this.post_url = URL_PRE + "/users";
	this.roles = [];
};

User.prototype = {

	getRoles : function() {
		var def = $.Deferred();
		var url = this.url + "/roles";
		$._get(url)
			.done(function(data) {
				var roles = JSON.parse(data);
				var i = 0;
				for (; i < roles.length; i++) {
					this.roles.push(new Role(roles[i]));
				}
				def.resolve();
			}.bind(this));
		return def.promise();
	},

	getPermission : function() {
		if (this.permissionCached === false) {
			this.getRoles()
				.done(function() {
					this.init_rolePermission();
					this.permission = this.mergePermissions([this.userPermission, this.rolePermission]);
					this.permissionCached = true;
				}.bind(this));
		}
	},

	init_rolePermission : function() {
		if (this.roles.length !== 0) {
			if (this.roles.length === 1) {
				this.rolePermission = this.roles[0].permission;
			} else {
				var rolePermissions = this.roles.map(function(role) { return role.permission; });
				this.rolePermission = this.mergePermissions(rolePermissions);
			}
		}
	},

	mergePermissions : function(Permissions) {
		var p = Permissions.reduce(function(pre, next) {
			return new Permission(pre.n | next.n);
		});
		return p;
	},

	updateUserPermission : function() {
		this.permission.updateN();
		var commonPermission = this.rolePermission.n & this.userPermission.n;
		var temp = this.permission.n ^ this.rolePermission.n;
		this.userPermission.setN(temp | commonPermission);
	},

	updateRolePermission : function() {
		if (this.roles.length === 0) {
			this.rolePermission = new Permission(0);
		} else if (this.roles.length === 1) {
			this.rolePermission = this.roles[0].permission;
		} else {
			var rolePermissions = this.roles.map(function(role) { return role.permission; });
			this.rolePermission = this.mergePermissions(rolePermissions);
		}
	},

	generate_url : function() {
		return URL_PRE + "/users/" + this.id;
	},

	addRole : function(role) {
		var def = $.Deferred();
		var postData = JSON.stringify({ user_id : this.id, role_id : role.id });
		var url = URL_PRE + "/user_and_role_relationships";
		$.json_post(url, postData, 'json')
			.done(function(data) {
				var roleData = JSON.parse(data);
				var _role = new Role(roleData);
				this.roles.push(_role);
				this.updateRolePermission();
				this.permission = this.mergePermissions([this.rolePermission, this.userPermission]);
				def.resolve(_role);
			}.bind(this))
			.fail(function(jqXHR) {
				def.reject(jqXHR);
			});
		return def.promise();
	},

	removeRole : function(role) {
		console.log("User.removeRole:" + role.name);
		var data = JSON.stringify({ user_id : this.id, role_id : role.id });
		var url = URL_PRE + "/user_and_role_relationships";
		$.json_delete(url, data ,'json')
			.done(function(data) {
				var jsonData = JSON.parse(data);
				console.log("User.removeRole.done:" + jsonData.role_name);
				var i = 0;
				for (; i < this.roles.length; i++) {
					if (this.roles[i].id === jsonData.role_id) {
						this.roles.splice(i, 1);
					}
				}
				this.updateRolePermission();
				this.permission = this.mergePermissions([this.rolePermission, this.userPermission]);
			}.bind(this));
	},

	post : function() {
		var def = $.Deferred();
		var data = JSON.stringify({ name : this.name, permission : this.userPermission.n , password : this.password});
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

	backupPermission : function() {
		this.userPermissionN = this.userPermission.n;
	},

	restorePermission : function() {
		this.userPermission.setN(this.userPermissionN);
		this.permission = this.mergePermissions([this.userPermission, this.rolePermission]);
	},

	putPermission : function() {
		this.updateUserPermission();
		var def = $.Deferred();
		var url = this.url + "/permission";
		var data = JSON.stringify({ "permission" : this.userPermission.n });
		$.json_put(url, data)
			.done(function() {
				def.resolve();
			})
		.fail(function(jqXHR) {
			def.reject(jqXHR);
		});
		return def.promise();
	},

	putPassword : function(password) {
		var def = $.Deferred();
		var url = this.url + "/password";
		var data = JSON.stringify({ "password" : password });
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


