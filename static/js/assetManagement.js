function reBuildPag(pag, total) {
	pag.pagination('destroy');
	pag.pagination('setPagesCount', total);
	pag.pagination('selectPage', 1);
	pag.pagination('redraw');
}

var Asset = function(data) {
	this.id = data.id;
	this.update(data);
};

Asset.prototype = {

	update: function(data) {
		this.company = data.company;
		this.asset_tag = data.asset_tag;
		this.asset_state = data.asset_state;
		this.purchase_date = data.purchase_date === '' ?  null : data.purchase_date;
		this.sn = data.sn;
		this.user = data.user;
		this.location = data.location;
		//this.specific_location = data.specific_location;
		this.type = data.type;
		this.model = data.model;
		this.os = data.os;
		this.mac_wireless = data.mac_wireless;
		this.mac_wired = data.mac_wired;
		this.remark = data.remark;
	},

	post: function() {
		var def = $.Deferred();
		var data = JSON.stringify(this);
		$.json_post(URL_PRE + "/assets", data, 'json')
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

	put: function(data) {
		var def = $.Deferred();
		data = JSON.stringify(data);
		var url = URL_PRE + "/assets/" + this.id;
		$.json_put(url, data, 'json')
			.done(function(data) {
				def.resolve();
			}.bind(this))
		.fail(function(jqXHR) {
			def.reject(jqXHR);
			alertError(jqXHR);
		});
		return def.promise();
	},

	delete: function() {
		var def = $.Deferred();
		var data = JSON.stringify({ "id" : this.id });
		var url = URL_PRE + "/assets/" + this.id;
		$.json_delete(url, data)
			.done(function() {
				def.resolve();
			})
		.fail(function(jqXHR) {
			def.reject(jqXHR);
		});
		return def.promise();
	},

};

var Query = function(str, sort, order) {
	this.str = str;
	this.like = true;
	this.logic = this.getLogic(this.str);
	this.criteria = this.getCriteria(this.str, this.logic);
	this.sort = sort;
	this.order = order;
};
Query.per_page = 50;
Query.prototype = {

	getLogic : function(str) {
		var logicAnd = str.indexOf("&");
		var logicOr = str.indexOf("|");
		//make sure only one logic character
		if (logicAnd !== -1 && logicOr !== -1) {
			throw new Error('more than one logic character!');
		}
		if (!logicAnd && !logicOr) {
			return "null";
		}
		if (logicAnd !== -1) return "and";
		return "or";
	},

	getCriteria : function(str, logic) {
		if (logic === "null") {
			return [str];
		}
		if (logic === 'and') return str.split("&");
		if (logic === 'or') return str.split("|");
	},

	get_url_str : function(page) {
		var q = this.criteria.map(function(c) {
			return encodeURIComponent(c);
		}).join("+");
		return "?q=" + q + "&logic={0}&like={1}&page={2}&per_page={3}&sort={4}&order={5}".format(this.logic, this.like, page, Query.per_page, this.sort, this.order); 
	},
};

$(document).ready(function(){
	turnOnLoadingOverlay();
	var vue = new Vue({
		el: "#app",
		data: {
			queryStr : "",
			default_sort: "asset_tag",
			default_order: "desc",
			sort: "",
			order: "",
			editBox: {	company: "",
						asset_tag: "",
						asset_state: "",
						purchase_date: "",
						sn: "",
						user: "",
						location: "",
						type: "",
						model: "",
						os: "",
						mac_wireless: "",
						mac_wired: "",
						remark: ""
			},
			assets: [],
			showPostAssetBtn: false,
			showPutAssetBtn: false,
			editing_asset: null,
		},
		methods: {

			queryAsset : function(page, buildPag) {
				buildPag = (typeof buildPag !== 'undefined') ?  buildPag : false;
				var query = new Query(this.queryStr, this.sort, this.order);
				var url = URL_PRE + "/assets" + query.get_url_str(page);
				$._get(url)
					.done(function(data) {
						var response = JSON.parse(data);
						if (buildPag) { 
							reBuildPag(pag, response.pages);
						}
						this.assets = response.assets.map(function(each) { return new Asset(each); });
						if (response.pages > 1) {
							$('#pagination_ul').show();
						} else {
							$('#pagination_ul').hide();
						}
					}.bind(this));
			},

			executeQuery : function() {
				this.sort = this.default_sort;
				this.order = this.default_order;
				this.queryAsset(1, true);
			},

			sortAsset: function(sort) {
				this.order = this.sort === sort && this.order === "desc" ? "asc" : "desc";
				this.sort = sort;
				this.queryAsset(pag.pagination('getCurrentPage'), false);
			},

			clearEditBox: function() {
				for (var key in this.editBox) {
					this.editBox[key] = '';
				}
			},

			newAsset: function() {
				this.showPostAssetBtn = true;
				this.showPutAssetBtn = false;
				$('#edit_panel').modal('show');
			},

			postAsset: function() {
				var self = this;
				if (window.validator.form()) {
					asset = new Asset(this.editBox);
					asset.post()
						.done(function() {
							self.assets.push(asset);
							$('#edit_panel').modal('hide');
						});
				}
			},

			putAsset: function() {
				if (window.validator.form()) {
					this.editing_asset.put(this.editBox)
						.done(function() {
							this.editing_asset.update(this.editBox);
							$('#edit_panel').modal('hide');
						}.bind(this));
				}
			},

			editAsset: function(asset) {
				this.showPostAssetBtn = false;
				this.showPutAssetBtn = true;
				$('#edit_panel').modal('show');
				for (var key in this.editBox) {
					this.editBox[key] = asset[key];
				}
				this.editing_asset = asset;
			},

			delAsset: function(asset) {
				var self = this;
				layer.confirm("是否删除{0} {1}？".format(asset.company, asset.asset_tag), { title:"提示", }, 
						function(index) {
							asset.delete()
								.done(function() {
									var _index = self.assets.indexOf(asset);
									if (_index > -1) {
										self.assets.splice(_index, 1);
									}
									layer.close(index);
								})
								.fail(function(jqXHR) {
									alertError(jqXHR);
								});
						}, function() {
							//pass
						});
			},

			showHelp: function() {
				$("#helpModal").modal("show");
			},
		},
	});

	$('#edit_panel').on("hidden.bs.modal", function() {
		vue.clearEditBox();
	});

	var pag = $('#pagination_ul').pagination({
		pages: 1,
		visiblePages: 10,
		onPageClick: function (pageNumber, event) {
			vue.queryAsset(pageNumber);
		}
	}).hide();

    window.validator = $("#assetEditForm").validate({
		//onkeyup: false,
		onfocusout: false,
		debug:true,
		ignore: ".ignore",
        rules: {
			company: { required: true },
			asset_tag: {
				required: true,
				//minlength: 11,
				maxlength: 11,
				//remote: URLS.validate_asset_tag,
			},
		   asset_state: {
			   required: true,
			},
			purchase_date: {
				date: true,
			},
			sn: {
				maxlength: 20,
			},
			user: {
				maxlength: 20,
			},
	   /*     location: {*/
				//maxlength: 20,
			/*},*/
		   /* type: {*/
				//maxlength: 6,
			/*},*/
			model: {
				maxlength: 30,
			},
			os: {
				maxlength: 30,
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

jQuery.validator.addMethod("date", function(value, element) {
  return value === "" || /^\d{4}-\d{2}-\d{2}$/.test(value);
}, "Please input the correct date format: 2017-01-01");
