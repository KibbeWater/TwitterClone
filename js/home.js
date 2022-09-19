function GeneratePost(post) {
	let postDiv = document.createElement('div');
	postDiv.classList.add('post');
	postDiv.setAttribute('data-id', post.id);

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

let disableObserver = null;

function Observe() {
	if (disableObserver) {
		disableObserver();
		disableObserver = null;
	}

	const feed = document.getElementById('feed');
	const observer = new IntersectionObserver(
		(entries) => {
			if (entries[0].isIntersecting) {
				const lastPost = feed.lastElementChild;
				const lastPostId = parseInt(lastPost.getAttribute('data-id'));
				if (isNaN(lastPostId)) return;

				console.log('Fetching posts before ' + lastPostId);

				$.ajax({
					url: '/api/post',
					type: 'GET',
					data: { lastPost: lastPostId },
					success: (data) => {
						const json = JSON.parse(data);
						if (!json.success) return alert(json.error);
						for (const post of json.posts) {
							feed.appendChild(GeneratePost(post));
						}
					},
				});
			}
		},
		{ threshold: 1 }
	);
	observer.observe(feed.lastElementChild);

	// Return a function to disconnect the observer
	return () => observer.disconnect();
}

$(document).ready(function () {
	disableObserver = Observe();

	const feed = document.getElementById('feed');
	const observer = new MutationObserver(() => {
		disableObserver = Observe();
	});
	observer.observe(feed, { childList: true });
	return () => observer.disconnect();
});
