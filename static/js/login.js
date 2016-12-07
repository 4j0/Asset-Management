function login() {
	var userName = $('#user').val();
	var passwd = $('#passwd').val();
	if (userName && passwd) {
		var user = { 'name' : userName, 'passwd' : passwd };
		$.ajax({
			url: URLS.login,
			data: JSON.stringify(user),
			method: 'POST',
			contentType: "application/json"})
			.done(function() {
				window.location.href = "index.html";
			})
		.fail(function(jqXHR, textStatus, errorThrown) {
			alert("用户名，密码错误！");
			$('#passwd').val = "";
		});
	}
}
