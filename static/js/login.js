function login() {
	var userName = $('#user').val();
	var passwd = $('#passwd').val();
	if (userName) {
		var user = { 'name' : userName, 'passwd' : passwd };
		$.ajax({
			url: URL_PRE + "/login",
			data: JSON.stringify(user),
			method: 'POST',
			contentType: "application/json"})
			.done(function() {
				window.location.href = "userHome.html";
			})
			.fail(function(jqXHR, textStatus, errorThrown) {
				switch(jqXHR.status) {
					case 401:
						alert("密码错误！");
						$('#passwd').val = "";
						break;
					case 404:
						alert("用户名不存在！");
						$('#passwd').val = "";
				}
			});
	}
}

$(document).ready(function(){
	$("#passwd").keypress(function(event){  
		if(event.which == 13)      
			login();
	}); 
});

