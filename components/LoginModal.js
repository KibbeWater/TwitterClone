class LoginModal extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			username: '',
			password: '',
			loading: false,

			buttonEnabled: false,
			error: '',
		};
	}

	componentDidMount() {
		this.usernameInput.focus();
	}

	componentDidUpdate() {
		if (this.state.error) {
			this.passwordInput.focus();

			setTimeout(() => {
				this.setState({ error: '' });
			}, 3000);
		}

		// If the username or password is empty or an error is visible, disable the button
		if (this.state.username === '' || this.state.password === '' || this.state.error !== '') {
			if (this.state.buttonEnabled) this.setState({ buttonEnabled: false });
		} else if (!this.state.buttonEnabled) this.setState({ buttonEnabled: true });
	}

	handleUsernameChange(e) {
		this.setState({ username: e.target.value });
	}

	handlePasswordChange(e) {
		this.setState({ password: e.target.value });
	}

	handleRegister(e) {
		e.preventDefault();

		ShowModal(React.createElement(RegModal, null));
	}

	handleLogin(e) {
		e.preventDefault();

		this.setState({ loading: true });

		$.ajax({
			url: '/api/login',
			type: 'POST',
			data: JSON.stringify({ username: this.state.username, password: this.state.password }),
			contentType: 'application/json',
			success: (resp) => {
				const data = JSON.parse(resp);
				if (!data.success) return this.setState({ error: 'Invalid username or password', loading: false });

				window.location.replace('/home');
			},
			error: (data) => this.setState({ error: 'An error occurred', loading: false }),
		});
	}

	render() {
		let e = React.createElement;
		return e('div', { className: 'modal__login' }, [
			e('h1', { className: 'mlogin__title' }, 'Sign-In'),
			e('p', { className: 'mlogin__subtitle' }, 'Please sign in to continue'),
			e('div', { className: 'mlogin__form' }, [
				e('input', {
					className: 'mlogin__form_input',
					type: 'text',
					placeholder: 'Username',
					value: this.state.username,
					onChange: this.handleUsernameChange.bind(this),
					ref: (input) => (this.usernameInput = input),
				}),
				e('input', {
					className: 'mlogin__form_input',
					type: 'password',
					placeholder: 'Password',
					value: this.state.password,
					onChange: this.handlePasswordChange.bind(this),
					ref: (input) => (this.passwordInput = input),
				}),
			]),
			e(
				'button',
				{
					className: 'mlogin__button',
					onClick: this.handleLogin.bind(this),
					disabled: this.state.loading || !this.state.buttonEnabled,
				},
				this.state.error || 'Sign In'
			),
			e('div', { className: 'mlogin_separator' }, [
				e('div', { className: 'mlogin_separator__line' }),
				e('p', { className: 'mlogin_separator__text' }, 'OR'),
				e('div', { className: 'mlogin_separator__line' }),
			]),
			e('button', { className: 'mlogin__button', onClick: this.handleRegister.bind(this) }, 'Create Account'),
		]);
	}
}

class RegModal extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			username: '',
			password: '',
			confirm: '',
			loading: false,

			buttonEnabled: false,
			error: '',
		};
	}

	componentDidMount() {
		this.usernameInput.focus();
	}

	componentDidUpdate() {
		if (this.state.error) {
			this.passwordInput.focus();

			setTimeout(() => {
				this.setState({ error: '' });
			}, 3000);
		}

		// If the username or password is empty or an error is visible, disable the button
		if (this.state.username === '' || this.state.password === '' || this.state.confirm === '' || this.state.error !== '') {
			if (this.state.buttonEnabled) this.setState({ buttonEnabled: false });
		} else if (!this.state.buttonEnabled) this.setState({ buttonEnabled: true });
	}

	handleUsernameChange(e) {
		this.setState({ username: e.target.value });
	}

	handlePasswordChange(e) {
		this.setState({ password: e.target.value });
	}

	handleConfirmChange(e) {
		this.setState({ confirm: e.target.value });
	}

	handleLogin(e) {
		e.preventDefault();

		ShowModal(React.createElement(LoginModal, null));
	}

	handleRegister(e) {
		e.preventDefault();

		this.setState({ loading: true });

		// if the passwords don't match, show an error
		if (this.state.password !== this.state.confirm) {
			return this.setState({ error: 'Passwords do not match', loading: false });
		}

		$.ajax({
			url: '/api/register',
			type: 'POST',
			data: JSON.stringify({ username: this.state.username, password: this.state.password }),
			contentType: 'application/json',
			success: (resp) => {
				const data = JSON.parse(resp);
				if (!data.success) return this.setState({ error: 'User already exists', loading: false });

				window.location.replace('/home');
			},
			error: (data) => this.setState({ error: 'An error occurred', loading: false }),
		});
	}

	handle;

	render() {
		return e('div', { className: 'modal__login' }, [
			e('h1', { className: 'mlogin__title' }, 'Register'),
			e('p', { className: 'mlogin__subtitle' }, 'Please sign up to continue'),
			e('div', { className: 'mlogin__form' }, [
				e('input', {
					className: 'mlogin__form_input',
					type: 'text',
					placeholder: 'Username',
					value: this.state.username,
					onChange: this.handleUsernameChange.bind(this),
					ref: (input) => (this.usernameInput = input),
				}),
				e('input', {
					className: 'mlogin__form_input',
					type: 'password',
					placeholder: 'Password',
					value: this.state.password,
					onChange: this.handlePasswordChange.bind(this),
					ref: (input) => (this.passwordInput = input),
				}),
				e('input', {
					className: 'mlogin__form_input',
					type: 'password',
					placeholder: 'Confirm Password',
					value: this.state.confirm,
					onChange: this.handleConfirmChange.bind(this),
					ref: (input) => (this.confirmInput = input),
				}),
			]),
			e(
				'button',
				{
					className: 'mlogin__button',
					onClick: this.handleRegister.bind(this),
					disabled: this.state.loading || !this.state.buttonEnabled,
				},
				this.state.error || 'Sign Up'
			),
			e('div', { className: 'mlogin_separator' }, [
				e('div', { className: 'mlogin_separator__line' }),
				e('p', { className: 'mlogin_separator__text' }, 'OR'),
				e('div', { className: 'mlogin_separator__line' }),
			]),
			e('button', { className: 'mlogin__button', onClick: this.handleLogin.bind(this) }, 'Sign In'),
		]);
	}
}
