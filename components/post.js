class PostUI extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			post: null,
		};

		if (props.post) this.state.post = props.post;
	}

	render() {
		return e('div', { className: 'post', 'data-id': this.state.post.id }, [
			e('img', {
				src: this.state.post.author.avatar,
				alt: this.state.post.author.username + "'s avatar",
				className: 'post__author_avatar',
			}),
			e('div', { className: 'post__content' }, [
				e('div', { className: 'post__header' }, [
					e('span', { className: 'post__author_username' }, this.state.post.author.username),
					e('span', { className: 'post__author_tag' }, '@' + this.state.post.author.tag + ' ·'),
					e('span', { className: 'post__timestamp' }, this.state.post.timestamp),
				]),
				this.state.post.content,
				!this.props.hideFooter
					? e('div', { className: 'post__footer' }, [
							e('button', { id: 'btnRetwat', className: 'post__footer_button' }, [
								e('svg', {}, [e('image', { xlinkHref: '/assets/svg/repeat-solid.svg', height: '100%' })]),
							]),
					  ])
					: null,
			]),
		]);
	}
}
