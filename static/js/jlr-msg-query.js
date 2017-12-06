$(document).ready(function(){
	turnOnLoadingOverlay();
	var vue = new Vue({
		el: "#app",
		data: {
			vin : '',
			send : [],
			receive : [],
		},
		methods: {
			query: function() {
				var url = "{0}/vdcs/jlr/msg?vin={1}".format(URL_PRE, this.vin);
				$._get(url)
					.done(function(data) {
						this.send = data.send;
						this.receive = data.receive;
					}.bind(this))	
				.fail(function(jqXHR) {
					alertError(jqXHR);
				});
			},
		},
	});
});
