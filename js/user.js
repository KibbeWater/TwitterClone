let user;
let loadingUser = false;

function GetUser() {
	return new Promise((resolve, reject) => {
		if (user) return resolve(user);

		// If we're already loading the user, wait for it to finish
		$.ajax({
			url: '/api/login',
			type: 'GET',
			contentType: 'application/json',
			success: function (json) {
				if (!json.success) return reject(json.error);
				user = json.user;
				resolve(user);
			},
			error: function (resp) {
				reject(resp.responseJSON.error);
			},
		});
	});
}
