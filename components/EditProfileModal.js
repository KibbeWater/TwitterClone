class EditProfile extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			username: '',
			bio: '',
			avatar: '',
			banner: '',
			loading: false,
			error: '',
		};

		this.handleChangeName = this.handleChangeName.bind(this);
		this.handleChangeBio = this.handleChangeBio.bind(this);

		this.saveAndClose = this.saveAndClose.bind(this);
		this.closeModal = this.closeModal.bind(this);
		this.saveState = this.saveState.bind(this);

		this.removeBanner = this.removeBanner.bind(this);
		this.uploadBanner = this.uploadBanner.bind(this);
		this.uploadAvatar = this.uploadAvatar.bind(this);

		this.bannerRef = React.createRef();

		let t = this;
		GetUser().then((user) => {
			t.setState({
				username: user.username,
				bio: user.bio,
				avatar: user.avatar,
				banner: user.banner,
			});
		});
	}

	handleChangeName(e) {
		this.setState({ username: e.target.value });
	}

	handleChangeBio(e) {
		this.setState({ bio: e.target.value });
	}

	saveAndClose() {
		// Check if banner is a data url
		let banner = this.state.banner;
		let avatar = this.state.avatar;
		let t = this;

		if (banner.startsWith('data:') || avatar.startsWith('data:')) {
			$.ajax({
				url: '/api/profile/upload',
				type: 'POST',
				data: {
					...(banner.startsWith('data:') ? { banner } : {}),
					...(avatar.startsWith('data:') ? { avatar } : {}),
				},
				success: function (data) {
					t.setState({ banner: JSON.parse(data).url });
					t.saveState()
						.then(() => {
							window.location.reload();
						})
						.catch(() => {
							alert('Error saving profile');
						});
				},
			});
		} else
			this.saveState()
				.then(() => {
					window.location.reload();
				})
				.catch(() => {
					alert('Error saving profile');
				});
	}

	saveState() {
		return new Promise((resolve, reject) => {
			$.ajax({
				url: '/api/profile.php',
				type: 'POST',
				data: {
					username: this.state.username,
					bio: this.state.bio,
					...(!this.state.banner ? { banner: this.state.banner } : {}),
					...(!this.state.avatar ? { avatar: this.state.avatar } : {}),
				},
				success: function (data) {
					resolve();
				},
				error: function (data) {
					reject();
				},
			});
		});
	}

	closeModal() {
		HideModal();
	}

	removeBanner() {
		this.setState({ banner: '' });
	}

	uploadBanner() {
		let fileInput = document.createElement('input');
		fileInput.type = 'file';
		fileInput.accept = 'image/*';
		fileInput.onchange = (e) => {
			let file = e.target.files[0];
			let reader = new FileReader();
			reader.onload = (e) => {
				this.setState({ banner: e.target.result });
			};
			reader.readAsDataURL(file);
		};
		fileInput.click();
	}

	uploadAvatar() {
		let fileInput = document.createElement('input');
		fileInput.type = 'file';
		fileInput.accept = 'image/*';
		fileInput.onchange = (e) => {
			let file = e.target.files[0];
			let reader = new FileReader();
			reader.onload = (e) => {
				this.setState({ avatar: e.target.result });
			};
			reader.readAsDataURL(file);
		};
		fileInput.click();
	}

	componentDidUpdate(prevProps, prevState) {
		if (this.state.banner !== prevState.banner) {
			this.bannerRef.current.style.display = `block`;
		}
	}

	render() {
		let e = React.createElement;
		return e('div', { className: 'modal__edit' }, [
			e('div', { className: 'medit__header' }, [
				e('div', { className: 'medit__header_controls' }, [
					e('i', { className: 'fa-solid fa-xmark fa-xl medit__header__close', onClick: this.closeModal }, null),
					e('h3', { className: 'medit__header__title' }, 'Edit Profile'),
				]),
				e('div', { className: 'medit__header__save' }, [e('button', { onClick: this.saveAndClose }, 'Save')]),
			]),
			e('div', { className: 'medit__body' }, [
				e('div', { className: 'medit__body__banner' }, [
					e('img', { src: this.state.banner, ref: this.bannerRef, onError: (e) => (e.target.style.display = 'none') }, null),
					e('div', { className: 'medit__image_controls' }, [
						e('div', { className: 'medit__set_image', onClick: this.uploadBanner }, [
							e('i', { className: 'fa-solid fa-image' }, null),
						]),
						this.state.banner && this.state.banner != '/assets/imgs/default_banner.png'
							? e('div', { className: 'medit__set_image', onClick: this.removeBanner }, [
									e('i', { className: 'fa-solid fa-xmark' }, null),
							  ])
							: null,
					]),
				]),
				e('div', { className: 'medit__body__avatar' }, [
					e('div', { className: 'medit__body__avatar_container' }, [
						e('div', { className: 'medit__set_image', style: { position: 'absolute' }, onClick: this.uploadAvatar }, [
							e('i', { className: 'fa-solid fa-image' }, null),
						]),
						e('img', { src: this.state.avatar }, null),
					]),
				]),
				e('div', { className: 'medit__input', key: 'input-name' }, [
					e('p', { className: 'medit__input__label' }, 'Name'),
					e(
						'input',
						{ className: 'medit__input__input', type: 'text', onChange: this.handleChangeName, value: this.state.username },
						null
					),
				]),
				e('div', { className: 'medit__input', key: 'input-bio' }, [
					e('p', { className: 'medit__input__label' }, 'Bio'),
					e(
						'textarea',
						{ className: 'medit__input__input_textarea', onChange: this.handleChangeBio, value: this.state.bio },
						null
					),
				]),
			]),
		]);
	}
}
