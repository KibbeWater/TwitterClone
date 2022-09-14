$('#registerBtn').click(function () {
	const input_pass = $('#input_pass').val();
	const input_user = $('#input_user').val();
	const input_confirm = $('#input_confirm').val();

	if (input_pass != input_confirm) {
		return alert('Passwords do not match');
	}

	// Send a request to /api/register with (username, password) as parameters JSON encoded
	$.ajax({
		url: '/api/register',
		type: 'POST',
		data: JSON.stringify({ username: input_user, password: input_pass }),
		contentType: 'application/json',
		success: function (resp) {
			const data = JSON.parse(resp);
			if (!data.success) return alert(data.error);
			window.location.href = '/home';
		},
		error: (data) => alert('An error occurred'),
	});
});
