function unescapeHtml(text) {
	var map = {
		'&amp;': '&',
		'&lt;': '<',
		'&gt;': '>',
		'&quot;': '"',
		'&#039;': "'",
	};

	return text.replace(/&amp;|&lt;|&gt;|&quot;|&#039;/g, function (m) {
		return map[m];
	});
}

function GeneratePost(post, isRef) {
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
	postContentText.innerText = unescapeHtml(post.content);
	postContent.appendChild(postContentText);

	// If we have a reference defined, create a new div with the class post__reference and add it into the postContent. Then make it's innerHTML a recursive call to GeneratePost with the reference as the parameter.
	if (post.reference && !isRef) {
		let postReference = document.createElement('div');
		postReference.classList.add('post__reference');
		postContent.appendChild(postReference);
		postReference.appendChild(GeneratePost(post.reference, true));
	}

	if (!isRef) {
		// Create the post footer
		let postFooter = document.createElement('div');
		postFooter.classList.add('post__footer');
		postContent.appendChild(postFooter);

		// Create the retweet button
		let postFooterRetweetButton = document.createElement('button');
		postFooterRetweetButton.classList.add('post__footer_button');
		postFooterRetweetButton.id = 'btnRetwat';
		postFooter.appendChild(postFooterRetweetButton);

		// Create the retweet button svg
		let postFooterRetweetButtonSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
		postFooterRetweetButton.appendChild(postFooterRetweetButtonSvg);

		// Create the retweet button svg image
		let postFooterRetweetButtonSvgImage = document.createElementNS('http://www.w3.org/2000/svg', 'image');
		postFooterRetweetButtonSvgImage.setAttributeNS('http://www.w3.org/1999/xlink', 'href', '/assets/svg/repeat-solid.svg');
		postFooterRetweetButtonSvgImage.setAttribute('height', '100%');
		postFooterRetweetButtonSvg.appendChild(postFooterRetweetButtonSvgImage);
	}

	return postDiv;
}

function Retwat(e) {
	// Get the '.post' parent element of the button
	const post = e.target.closest('.post');

	// Get the post ID from the data-id attribute
	const postId = parseInt(post.getAttribute('data-id')) || -1;

	// Send a JSON request to the API
	$.ajax({
		url: '/api/post.php?id=' + postId,
		type: 'GET',
		contentType: 'application/json',
		success: function (data) {
			const json = JSON.parse(data);
			if (!json.success) return alert(json.error);

			const retwat = json.post;

			ShowModal(React.createElement(PostModal, { postRef: retwat }));

			/* retwat.reference.content = unescapeHtml(retwat.reference.content);
			$('#feed').prepend(GeneratePost(retwat)); */
		},
	});
}

function GetUnreadPosts(latestId) {
	return new Promise((resolve, reject) => {
		// Fetch /API/unread with GET with latestPost as the query parameter
		$.ajax({
			url: '/api/unread.php?latestPost=' + latestId,
			type: 'GET',
			contentType: 'application/json',
			success: function (data) {
				const json = JSON.parse(data);
				if (!json.success) return reject(json.error);
				resolve(json.posts);
			},
		});
	});
}

function LoadUnread() {
	return new Promise((resolve, reject) => {
		// Get the latest post ID
		const latestId = parseInt($('#feed').children().first().attr('data-id')) || -1;

		$.ajax({
			url: '/api/post?latestPost=' + latestId,
			type: 'GET',
			contentType: 'application/json',
			success: function (data) {
				const json = JSON.parse(data);
				if (!json.success) return reject(json.error);

				const posts = json.posts;

				// Loop through the posts in reverse and prepend them to the feed
				for (let i = posts.length - 1; i >= 0; i--) {
					$('#feed').prepend(GeneratePost(posts[i]));
				}

				// Set the data-unread attribute to 0
				$('#unread').attr('data-unread', 0);
				resolve();
			},
			error: function (err) {
				reject(err);
			},
		});
	});
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
		LoadUnread().then(() => {
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
					if (!json.success) return alert(json.error);
					$('.post__form_input').val('');
					$('#feed').prepend(GeneratePost({ ...json.post, content: post }));
				},
			});
		});
	});
	$('#btnPost').click(function () {
		ShowPostModal();
	});
	$('#feed').on('click', '#btnRetwat', null, Retwat);
	autosize($('textarea'));

	const unreadObserver = new MutationObserver(function (mutations) {
		if (mutations[0].type !== 'attributes' || mutations[0].attributeName !== 'data-unread') return;

		// Check the data-unread attribute, this is the number of unread posts
		const unread = parseInt($('#unread').attr('data-unread')) || 0;

		// if there are no unread posts, make sure the data attribute is hidden, otherwise 'visible'
		const newData = unread > 0 ? 'visible' : 'hidden';
		if (newData !== $('#unread').attr('data')) $('#unread').attr('data', newData);

		// Get the span inside #unread_txt
		$('#unread_txt').children('span').text(unread);
	});
	unreadObserver.observe($('#unread')[0], { attributes: true });

	$('#unread').click(() => LoadUnread());

	// Set up a timer for every 5 seconds to get the first element in #feed and get the ID
	setInterval(function () {
		// Get the first element in #feed which has the class post
		const firstPost = document.querySelector('#feed .post');
		if (!firstPost) return;

		// Get the data-id attribute of the first post
		const firstPostId = parseInt(firstPost.getAttribute('data-id')) || -1;

		// If the first post ID is -1, return
		if (firstPostId === -1) return;

		// Get the unread posts
		GetUnreadPosts(firstPostId).then((num) => {
			console.log('Got unread posts: ' + num);
			// Set the data-unread attribute to the number of posts
			$('#unread').attr('data-unread', num);
		});
	}, 5000);

	GetUser()
		.then((user) => {
			console.log('Logged in as ' + user.username);
		})
		.catch((err) => {
			ShowModal(React.createElement(LoginModal));
		});
});

function ShowPostModal() {
	ShowModal(React.createElement(PostModal));
}

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
