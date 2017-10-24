var app;
var HighlightColor = "#DDDDDD";

turnOnLoadingOverlay();

$(function() {

	$._get(URL_PRE + "/permissions")
		.done(function(data) {
			Role.PERMISSIONS = JSON.parse(data);
		});

	app = new Vue({

		el: '#app',

		data: {
			LANG_MAP : LANG_MAP,
			roles : [],
			roleInput : "",
			selectedRoleTr : null,
			selectedRole : null,
			showSaveBtn : false,
			showInputRoleName : false,
			showAddRoleBtn : true,
			firstClick : true,
		},

		methods: {

			getRoleArray : function(roleData) {
				var i;
				var roles = [];
				for (i = 0; i < roleData.length; i++) {
					roles[i] = new Role(roleData[i]);
				}
				return roles;
			},

			roleQuery : function() {
				var url;
				if (app.roleInput) {
					url = URL_PRE + "/roles?role_name=" + encodeURIComponent(app.roleInput);  
				} else {
					url = URL_PRE + "/roles";
				}
				$._get(url)
					.done(function(data) {
						roleData = JSON.parse(data);
						roles = app.getRoleArray(roleData);
						app.updateRoles(roles);
					})
					.fail(function(jqXHR, textStatus) {
						if ( jqXHR.status === 404) {
							app.updateRoles([]);
						}
					});
			},
		
			newRole : function() {
				clearHighlightElems("Role_tr");
				this.showAddRoleBtn = false;
				this.showInputRoleName = true;	
				this.selectedRole = new Role({permission: 0, name: "", id: null}); 
			},

			highlightSelectedRoleTr : function(event) {
				if (this.selectedRoleTr === null) {
					this.selectedRoleTr = event.target.parentElement;	
					highlight(this.selectedRoleTr);
				} else {
					clearHighlight(this.selectedRoleTr);
					this.selectedRoleTr = event.target.parentElement;
					highlight(this.selectedRoleTr);
				}
			},

			updateRoles : function(roleArray) {
				this.roles = roleArray;
				//不在新建用户状态下才重置roles为null,否则新建用户名的input绑定的v-model会变成null从而导致vue的渲染错误。
				if (this.showInputRoleName !== true) {
					this.selectedRole = null;
					this.showSaveBtn = false;
				}
				clearHighlightElems("Role_tr");
			},

			switchToAddRoleBtn : function() {
				this.showInputRoleName = false;
				this.showAddRoleBtn = true;
			},

			applyRole : function(role, event) {
				this.selectedRole = role;
				this.highlightSelectedRoleTr(event);
				this.showSaveBtn = false;
			},

			roleSelected : function(role, event) {
				role.backupPermission();
				if (role !== this.selectedRole) {
					//如果当前角色被修改过
					if (this.showSaveBtn === true) {
						layer.confirm("是否放弃修改?", { title:"提示", }, 
								function(index) {
									//恢复selectedRole到初始状态
									this.selectedRole.restorePermission();
									//切换selectedRole到role
									this.applyRole(role, event);
									//切换至新建角色按钮
									this.switchToAddRoleBtn();
									layer.close(index);
								}.bind(app), function() {
									//pass
								});
					} else {
						//如果当前角色未被修改过则直接切换selectedRole到role
						this.applyRole(role, event);
						//如果新建角色时只输入了角色名则视为放弃保存
						this.switchToAddRoleBtn();
					}
				}
			},

			savePermission : function() {
				if (this.showInputRoleName === true) {
					if (this.selectedRole.name) { 
						this.selectedRole.post()
							.done(function() {
								app.roles.push(app.selectedRole);
								app.selectedRole = null;
								app.showSaveBtn = false;
								app.switchToAddRoleBtn();
							})
						.fail(function(jqXHR) {
							alertError(jqXHR);
						});
					} else {
						layer.alert("请输入角色名");
					}
				} else {
					this.selectedRole.putPermission()
						.done(function() {
							app.showSaveBtn = false;
						})
						.fail(function(jqXHR) {
							alertError(jqXHR);
						});
				}
			},

			clickTrash : function(role, event) {
				layer.confirm("是否删除角色:{0}？".format(role.name), { title:"提示", }, 
						function(index) {
							role.delete()
								.done(function() {
									this.removeRole(role);
									this.selectedRole = null;
									this.showSaveBtn = false;
									layer.close(index);
								}.bind(this))
							.fail(function(jqXHR) {
								alertError(jqXHR);
							});
						}.bind(this), function() {
							//pass
						});
			},

			removeRole: function(role) {
				var index = this.roles.indexOf(role);
				if (index > -1) {
					this.roles.splice(index, 1);
				}
			},
		},

	});

});

