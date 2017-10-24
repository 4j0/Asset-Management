var app;
var HighlightColor = "#DDDDDD";

turnOnLoadingOverlay();

$(function() {

	$._get(URL_PRE + "/permissions")
		.done(function(data) {
			Permission.TEMPLATE = JSON.parse(data);
		});

	app = new Vue({

		el: '#app',

		data: {
			LANG_MAP : LANG_MAP,
			users : [],
			roleQueryResult : [],
			userQueryInput: "",
			userName : "",
			userPassword : "",
			userPasswordConfirm : "",
			roleQueryInput : "",
			selectedUserTr : null,
			selectedUser : null,
			showSaveBtn : false,
			showInputUserName : false,
			showAddUserBtn : true,
			firstClick : true,
			resetUserPassword : false,
			resetPasswordUser : null,
		},

		methods: {

			userQuery : function() {
				var url;
				if (this.userQueryInput) {
					url = URL_PRE + "/users?user_name=" + encodeURIComponent(this.userQueryInput);  
				} else {
					url = URL_PRE + "/users";
				}
				$._get(url)
					.done(function(data) {
						userData = JSON.parse(data);
						var users = userData.map(function(user) { return new User(user); });
						this.updateUsers(users);
					}.bind(this))
					.fail(function(jqXHR, textStatus) {
						if ( jqXHR.status === 404) {
							this.updateUsers([]);
						}
					}.bind(this));
			},

			roleQuery : function() {
				this.roleQueryResult = [];
				var url = URL_PRE + "/roles";
				if (this.roleQueryInput) {
					url = url + "?role_name=" + encodeURIComponent(this.roleQueryInput);
				}
				$._get(url)
					.done(function(data) {
						roleData = JSON.parse(data);
						this.roleQueryResult = roleData.map(function(role) { return new Role(role); });
					}.bind(this))
				.fail(function(jqXHR, textStatus) {
					if ( jqXHR.status === 404) {
						this.roleQueryResult = [];
					}
				}.bind(this));
			},
		
			newUser : function() {
				clearHighlightElems("User_tr");
				this.showAddUserBtn = false;
				this.showInputUserName = true;	
				$('#addUser').modal('show');
				this.selectedUser = new User({ permission : 0, name: "", id: null }); 
			},
			
			clearInputBox: function() {
				this.userName = "";
				this.userPassword = "";
				this.userPasswordConfirm = "";
			},

			submitNewUser : function() {
				if (this.userName) {
					if (this.userPassword === this.userPasswordConfirm) {
						var user = new User({ permission : 0, name: this.userName, id: null , password : this.userPassword});
						user.post()
							.done(function() {
								this.users.push(user);
								this.selectedUser = user;
								this.selectedUser.backupPermission();
								$('#addUser').modal('hide');
								this.clearInputBox();
								this.highlightNewUser();
							}.bind(this))
							.fail(function(jqXHR) {
								alertError(jqXHR);
							});
					} else {
						layer.alert("两次输入的密码不一致！");
						this.userPassword = "";
						this.userPasswordConfirm = "";
					}
				} else {
					layer.alert("请输入用户名");
				}
			},

			showAddRolePanel : function() {
				this.roleQueryResult = [];
				$('#addRoleRow').modal('show');
			},

			handleRemoveRole : function(role) {
				layer.confirm("是否删除角色？", { title:"提示", }, 
						function(index) {
							this.selectedUser.removeRole(role);
							layer.close(index);
						}.bind(this), function() {
							//pass
						});
			},

			roleQueryResultRemoveRoleByID : function(role_id) {
				var i = 0;
				for (; i < this.roleQueryResult.length; i++) {
					if (role_id === this.roleQueryResult[i].id) {
						this.roleQueryResult.splice(i, 1);
					}
				}
			},

			addRole : function(role) {
				this.selectedUser.addRole(role)
					.done(function(_role) {
						this.roleQueryResultRemoveRoleByID(_role.id);
					}.bind(this))
					.fail(function(jqXHR) {
						alertError(jqXHR, "角色添加失败");
					});
			},

			highlightNewUser : function() {
				this.$nextTick(function() {
					var user_trs = document.getElementsByClassName('User_tr');
					var lastUserTr = user_trs[user_trs.length -1];
					if (this.selectedUserTr) { clearHighlight(this.selectedUserTr); }
					this.selectedUserTr = lastUserTr;
					highlight(this.selectedUserTr);
				});
			},

			highlightSelectedUserTr : function(event) {
				if (this.selectedUserTr === null) {
					this.selectedUserTr = event.target.parentElement;	
					highlight(this.selectedUserTr);
				} else {
					clearHighlight(this.selectedUserTr);
					this.selectedUserTr = event.target.parentElement;
					highlight(this.selectedUserTr);
				}
			},

			updateUsers : function(userArray) {
				this.users = userArray;
				clearHighlightElems("User_tr");
			},

			applyUser : function(user, event) {
				this.selectedUser = user;
				this.selectedUser.getPermission();
				this.highlightSelectedUserTr(event);
				this.showSaveBtn = false;
			},

			clickResetPassword : function(user, event) {
				this.userName = user.name;
				this.userPassword = "";
				this.userPasswordConfirm = "";
				this.resetPasswordUser = user;
				$('#resetUserPassword').modal('show');
			},

			submitUserPassword : function() {
				if (this.userPassword === this.userPasswordConfirm) {
					this.resetPasswordUser.putPassword(this.userPassword)
						.done(function() {
							$("#resetUserPassword").modal("hide");
						})
					.fail(function(jqXHR) {
						alertError(jqXHR);
					});
				} else {
					layer.alert("两次输入的密码不一致！");
				}
			},

			userSelected : function(user, event) {
				user.backupPermission();
				if (user !== this.selectedUser) {
					//如果当前角色被修改过
					if (this.showSaveBtn === true) {
						layer.confirm("是否放弃修改?", { title:"提示", }, 
								function(index) {
									//恢复selectedUser到初始状态
									this.selectedUser.restorePermission();
									//切换selectedUser到user
									this.applyUser(user, event);
									layer.close(index);
								}.bind(this), function() {
									//pass
								});
					} else {
						//如果当前角色未被修改过则直接切换selectedUser到user
						this.applyUser(user, event);
					}
				}
			},

			savePermission : function() {
				this.selectedUser.putPermission()
					.done(function() {
						this.showSaveBtn = false;
					}.bind(this))
				.fail(function(jqXHR) {
					alertError(jqXHR);
				});
			},

			clickTrash : function(user, event) {
				layer.confirm("是否删除用户:{0}？".format(user.name), { title:"提示", }, 
						function(index) {
							user.delete()
								.done(function() {
									this.removeUser(user);
									this.selectedUser = null;
									layer.close(index);
								}.bind(this))
							.fail(function(jqXHR) {
								alertError(jqXHR);
							});
						}.bind(this), function() {
							//pass
						});
			},

			removeUser: function(user) {
				var index = this.users.indexOf(user);
				if (index > -1) {
					this.users.splice(index, 1);
				}
			},
		},

	});

});


