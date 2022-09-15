function GeneratePost(post) {
	let postDiv = document.createElement('div');
	postDiv.classList.add('post');

	let postAuthorAvatar = document.createElement('img');
	postAuthorAvatar.src = post.author.avatar;
	postAuthorAvatar.alt = post.author.username + "'s avatar";
	postAuthorAvatar.classList.add('post__author_avatar');
	postDiv.appendChild(postAuthorAvatar);

	let postContent = document.createElement('div');
	postContent.classList.add('post__content');
	postDiv.appendChild(postContent);

	let postHeader = document.createElement('div');
	postHeader.classList.add('post__header');
	postContent.appendChild(postHeader);

	let postAuthorUsername = document.createElement('span');
	postAuthorUsername.classList.add('post__author_username');
	postAuthorUsername.innerText = post.author.username;
	postHeader.appendChild(postAuthorUsername);

	let postAuthorTag = document.createElement('span');
	postAuthorTag.classList.add('post__author_tag');
	postAuthorTag.innerText = ' @' + post.author.tag + ' · ';
	postHeader.appendChild(postAuthorTag);

	let postTimestamp = document.createElement('span');
	postTimestamp.classList.add('post__timestamp');
	postTimestamp.innerText = post.timestamp;
	postHeader.appendChild(postTimestamp);

	let postContentText = document.createElement('span');
	postContentText.innerText = post.content;
	postContent.appendChild(postContentText);

	return postDiv;
}

$(document).ready(function () {
	console.log($('.searchbar__input'));
	$('.searchbar__input').focus(function () {
		$('.searchbar').addClass('searchbar__active');
		$('.searchbar__input').addClass('searchbar__input__active');
	});
	$('.searchbar__input').blur(function () {
		$('.searchbar').removeClass('searchbar__active');
		$('.searchbar__input').removeClass('searchbar__input__active');
	});
	$('#btn_post').click(function () {
		var post = $('.post__form_input').val();

		if (post == '') return alert('You cannot post an empty message');

		//JSON request
		$.ajax({
			url: '/api/post.php',
			type: 'POST',
			data: JSON.stringify({
				post: post,
			}),
			contentType: 'application/json',
			success: function (data) {
				const json = JSON.parse(data);
				console.log(json);
				if (!json.success) return alert(json.error);
				$('.post__form_input').val('');
				$('#feed').prepend(GeneratePost(json.post));
			},
		});
	});
	autosize($('textarea'));
});
