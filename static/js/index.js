function init_pagination(page, total) {
	$(pagination_div).pagination({
        //items: 100,
        //itemsOnPage: 10,
		pages: total,
        cssStyle: 'light-theme',
		onPageClick: function() {
			getPage(this.currentPage + 1);
		},
    });
}

function getPage(n, do_init_pagination) {
	do_init_pagination = typeof do_init_pagination !== 'undefined' ?  do_init_pagination : false;
	var criteria = clearFalse(vue.criteria);
	var para = JSON.parse(JSON.stringify(criteria));
	para.page = n;
	para.per_page = PER_PAGE;
	var url =  URLS.assets + jsonToQueryString(para) + "&like=" + vue.like + "&logic=" + vue.logic;
	$.get(url)
		.done(function(data) {
			var response = JSON.parse(data);
			vue.assets = response.assets;
			if (do_init_pagination) {
				init_pagination(1, response.pages);
			}
		})
	.fail(function(jqXHR, textStatus, errorThrown) {
		if (jqXHR.status === 401) {
			window.location.href = "login.html";
		}
	});
}

$(document).ready(function(){

	window.vue = new Vue({
		el: "#app",
		data: {
			criteria: { asset_tag: "",
						asset_state: "",
						sn: "",
						user: "",
						location: "",
						specific_location: "",
						type: "",
						model: "",
						os: "",
						mac_wireless: "",
						mac_wired: "",
						remark: ""
			},
			like: true,
			logic: 'and',
			assets: [],
			pages: undefined,
			asset_tag: null,
			submit_asset: {},
			submit_asset_copy: {},
			submit_url: "",
			show_edit_panel: false,
			show_modal_mask: false,
		},
		methods: {
			search: function() {
				getPage(1, true);				
			},
			get_asset: function(event) {
				var asset_tag = this.get_asset_tag(event);
				return find_obj_by_key_value('asset_tag', asset_tag, this.assets);
			},
			get_asset_tag: function(event) {
				var tr = event.target.parentElement.parentElement;
				return tr.getElementsByClassName("r_asset_tag")[0].innerHTML;
			},
			open_edit_panel : function() {
				this.show_edit_panel = true;
				this.show_modal_mask = true;
			},
			close_edit_panel: function() {
				$("#form").validate().resetForm();
				this.show_edit_panel = false;
				this.show_modal_mask = false;
			},
			edit_asset: function(event) {
				var tr = event.target.parentElement.parentElement;
				var asset_tag = tr.getElementsByClassName("r_asset_tag")[0].innerHTML;
				this.submit_asset = find_obj_by_key_value("asset_tag", asset_tag, this.assets);
				this.submit_url =  URLS.assets + "/" + this.submit_asset.asset_tag;
				window.clicked_asset_copy = clone(this.submit_asset);
				this.open_edit_panel();
			},
			add_asset: function(event) {
				this.submit_asset = {asset_tag:null,asset_state:null, sn:null, user:null, location:null, specific_location: null, type: null, model:null, os:null, mac_wireless:null, mac_wired:null, remark:null};
				this.submit_url = URLS.assets;
				this.open_edit_panel();
			},
			del_asset: function(event) {
				this.clicked_asset = this.get_asset(event);
				layer.confirm('是否删除' + this.clicked_asset.asset_tag, {
					btn: ['确认','取消'] //按钮
				}, function(index){
					$.ajax({
						url: URLS.assets + "/" + vue.clicked_asset.asset_tag,
						method: 'DELETE',})
							.done(function( data, textStatus, jqXHR ) {
								var asset_index = $.inArray(vue.clicked_asset, vue.assets);
								vue.assets.splice(asset_index, 1);
							})
							.fail(function(jqXHR, textStatus, errorThrown) {
								if (jqXHR.status === 401) {
									window.location.href = "login.html";
								}
							});
					layer.close(index);
				}, function(index){
					layer.close(index);
				});
			},
			save: function(event) {
					//if add new asset
					if (this.submit_url == URLS.assets) {
						$( "#e_asset_tag" ).rules( "add", {
							remote: URLS.validate_asset_tag,
						});
						if (window.validator.form()) {
							$.ajax({
								url: URLS.assets,
								data: JSON.stringify(vue.submit_asset),
								method: 'POST',
								contentType: "application/json"})
								.done(function() {
									//如果请求成功则关闭编辑窗口并往assets添加一条数据
									vue.close_edit_panel();
									vue.assets.push(vue.submit_asset);
								})
							.fail(function(jqXHR, textStatus, errorThrown) {
								if (jqXHR.status === 401) {
									window.location.href = "login.html";
								}
							});
						}
					//update asset
					} else {
						$("#e_asset_tag").rules( "remove" , "remote" );
						if (window.validator.form()) {
							$.ajax({
								url: this.submit_url,
								method: 'PUT',
								data: JSON.stringify(vue.submit_asset),
								contentType: "application/json"})
								.done(function( data, textStatus, jqXHR ) {
									//如果请求成功则关闭编辑窗口
									vue.close_edit_panel();
								})
							.fail(function(jqXHR, textStatus, errorThrown) {
								if (jqXHR.status === 401) {
									window.location.href = "login.html";
								}
							});
						}
					}
				//}
			},				
			cancel_save: function(event) {
				if (this.submit_url != URLS.assets) {
					//not add
					var index = this.assets.indexOf(this.submit_asset);
					Vue.set(this.assets, index, window.clicked_asset_copy);
				}
				this.close_edit_panel();
			},
		},
	});

    window.validator = $("#form").validate({
		//onkeyup: false,
		onfocusout: false,
		debug:true,
        rules: {
			asset_tag: {
				required: true,
				minlength: 11,
				maxlength: 11,
				//remote: URLS.validate_asset_tag,
			},
            asset_state: {
				maxlength: 3,
            },
			sn: {
				maxlength: 20,
			},
			user: {
				maxlength: 5,
			},
			location: {
				maxlength: 6,
			},
			specific_location: {
				maxlength: 12,
			},
			type: {
				maxlength: 6,
			},
			model: {
				maxlength: 30,
			},
			os: {
				maxlength: 14,
			},
			mac_wireless: {
				mac: true,
			},
			mac_wired: {
				mac: true,
			},
			remark: {
				maxlength: 255,
			},
        },
		messages: {
			asset_tag: {
				remote: "asset_tag is already exists!",
			},
		},
    });
});

jQuery.validator.addMethod("mac", function(value, element) {
  return value === "" || /^([A-Fa-f0-9]{2}-){5}[A-Fa-f0-9]{2}$/.test(value);
}, "Please input the correct MAC Address AA-BB-CC-DD-EE-FF");

$(document).ajaxStart(function(){
	$.LoadingOverlay("show", {zIndex:3});
});

$(document).ajaxStop(function(){
	$.LoadingOverlay("hide");
});
