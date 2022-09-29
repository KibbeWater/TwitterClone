let GetUser = () => {
	return {
		id: 1,
		username: 'Snow',
		tag: 'snow',
		avatar: '/assets/imgs/default_avatar.png',
		group: 0,
	};
};

// Get the user from the server /api/login GET
$.ajax({
	url: '/api/login',
	type: 'GET',
	contentType: 'application/json',
	success: function (json) {
		if (!json.success) return alert(json.error);
		let user = json.user;

		GetUser = () => {
			return user;
		};
	},
});
