$('#loginBtn').click(function () {
	const input_pass = $('#input_pass').val();
	const input_user = $('#input_user').val();

	// Send a request to /api/login with (username, password) as parameters JSON encoded
	$.ajax({
		url: '/api/login',
		type: 'POST',
		data: JSON.stringify({ username: input_user, password: input_pass }),
		contentType: 'application/json',
		success: function (data) {
			if (data.status === 'success') window.location.replace('/home');
			else alert('Invalid username or password');
		},
		error: (data) => alert('An error occurred'),
	});
});
