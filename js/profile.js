/**
 * @typedef {Object} User
 * @property {number} id
 * @property {string} username
 * @property {string} tag
 * @property {string} avatar
 * @property {number} group
 * @property {string} bio
 */

function hideBannerImg(e) {
	e.style.display = 'none';
}

/**
 * Get the current following status
 * @param {number} profileId ID of the profile
 * @return {Promise<boolean>}
 */
function isFollowing(profileId) {
	return new Promise((resolve, reject) => {
		$.ajax({
			url: '/api/follow?user=' + profileId,
			type: 'GET',

			success: function (data) {
				resolve(data);
			},
			error: function (data) {
				const error = JSON.parse(data.responseText);

				alert('Unexpected error occured while attempting to get following status, check console for more details');
				console.error(error.error);
				reject(error.error);
			},
		});
	});
}

/**
 * Follow or unfollow a profile
 * @param {number} profileId ID of the profile
 * @param {string} follow If the user should be followed or not
 * @return {Promise<void>}
 */
function setFollow(profileId, follow) {
	return new Promise((resolve, reject) => {
		$.ajax({
			url: '/api/follow',
			type: 'POST',

			data: {
				user: profileId,
				follow: follow,
			},

			success: function (data) {
				resolve(data);
			},
			error: function (data) {
				alert('Unexpected error occured while attempting to follow/unfollow, check console for more details');

				const error = JSON.parse(data.responseText);

				console.error(error.error);
				reject(error.error);
			},
		});
	});
}

/**
 *
 * @returns {Promise<Profile>}
 */
function getProfile() {
	return new Promise((resolve, reject) => {
		const username = window.location.pathname.split('/')[1].replace('@', '');

		$.ajax({
			url: '/api/users?username=' + username,
			type: 'GET',

			success: function (data) {
				const json = JSON.parse(data);
				resolve(json.user);
			},
			error: function (data) {
				const error = JSON.parse(data.responseText);

				alert('Unexpected error occured while attempting to get profile, check console for more details');
				console.error(error.error);
				reject(error.error);
			},
		});
	});
}

$(document).ready(function () {
	$('#btnFollow').hover(
		function () {
			const btn = $(this);
			const followStatus = btn.attr('data-followstatus');

			if (btn.hasClass('profile__header__control_follow') && followStatus == 'following') btn.text('Unfollow');
		},
		function () {
			const btn = $(this);
			const followStatus = btn.attr('data-followstatus');

			if (btn.hasClass('profile__header__control_follow') && followStatus == 'following') btn.text('Following');
		}
	);

	$('#btnFollow').click(function () {
		const btn = $(this);
		const followStatus = btn.attr('data-followstatus');

		console.log('Follow status: ' + followStatus);
		console.log(btn);

		getProfile().then((profile) => {
			console.log(profile);
			switch (followStatus) {
				case 'following':
					setFollow(profile.id, false).then(() => {
						console.log('Unfollowed');
						btn.text('Follow');
						btn.attr('data-followstatus', 'follow');
					});
					break;

				case 'follow':
					setFollow(profile.id, true).then(() => {
						console.log('Followed');
						btn.text('Following');
						btn.attr('data-followstatus', 'following');
					});
					break;
			}
		});
	});
});
