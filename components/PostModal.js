class PostModal extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			user: {},
			ref: null,
			text: '',
		};

		if (this.props.postRef) this.state.ref = this.props.postRef;

		GetUser().then((user) => {
			this.setState({ user });
		});
	}

	post() {
		LoadUnread().then(() => {
			var post = this.state.text;

			if (post == '') return alert('You cannot post an empty message');

			const setState = this.setState.bind(this);
			const closeModal = this.closeModal.bind(this);

			const data = {
				post: post,
			};

			if (this.state.ref) data.ref = this.state.ref.id;

			console.log(data, this.state);

			//JSON request
			$.ajax({
				url: '/api/post.php',
				type: 'POST',
				data: JSON.stringify(data),
				contentType: 'application/json',
				success: function (data) {
					const json = JSON.parse(data);
					if (!json.success) return alert(json.error);
					setState({ text: '' });
					closeModal();
					$('#feed').prepend(GeneratePost({ ...json.post, content: post }));
				},
			});
		});
	}

	closeModal() {
		HideModal();
	}

	render() {
		let e = React.createElement;
		return e('div', { className: 'mpost' }, [
			e('div', { className: 'mpost_header' }, [
				e('div', { className: 'mpost_header__close', onClick: () => this.closeModal() }, [
					e('svg', {}, [e('image', { xlinkHref: '/assets/svg/xmark-solid.svg', height: '100%' })]),
				]),
			]),
			e('div', { className: 'mpost__content' }, [
				e('div', { className: 'mp_content__sidebar' }, [
					e('div', { className: 'mp_content__sidebar_avatar' }, [
						e('img', { src: this.state.user.avatar || '', alt: (this.state.user.username || 'null') + "'s avatar" }),
					]),
				]),
				e('div', { className: 'mp_content__post' }, [
					e('textarea', {
						rows: 1,
						className: 'mp_content__post_textarea',
						placeholder: "What's happening?",
						onChange: (e) => {
							console.log(e.target.value);
							this.setState({ text: e.target.value });
						},
						value: this.state.text,
					}),
					// Create a retweet post here if this.state.ref is set using the Post component
					this.state.ref
						? e('div', { className: 'post__reference' }, [e(PostUI, { post: this.state.ref, hideFooter: true })])
						: null,
					e('div', { className: 'mp__separator' }),
					e('div', { className: 'mp_content__footer' }, [
						e('div', {}, [e('p', {}, 'There might be buttons here')]),
						e('div', {}, [e('button', { className: 'mp_footer__post', onClick: () => this.post() }, 'Post')]),
					]),
				]),
			]),
		]);
	}
}
