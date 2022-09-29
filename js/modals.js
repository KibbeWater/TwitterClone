// Get the modal_root element
const modalRoot = document.getElementById('modal_root');

let currentModal = null;

const root = ReactDOM.createRoot(modalRoot);

function ShowModal(modal) {
	currentModal = modal;
	root.render(currentModal);

	// Add the active_modal class to the modal_root element
	modalRoot.classList.add('active_modal');
}

function HideModal() {
	currentModal = null;
	root.render(currentModal);

	// Remove the active_modal class from the modal_root element
	modalRoot.classList.remove('active_modal');
}
