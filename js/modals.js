// Get the modal_root element
const modalRoot = document.getElementById('modal_root');
console.log(modalRoot);

let currentModal = null;

const root = ReactDOM.createRoot(modalRoot);
root.render(currentModal);

function ShowModal(modal) {
	currentModal = modal;
	root.render(currentModal);

	// Add the active_modal class to the modal_root element
	modalRoot.addClass('active_modal');
}

function HideModal() {
	currentModal = null;
	root.render(currentModal);

	// Remove the active_modal class from the modal_root element
	modalRoot.removeClass('active_modal');
}
