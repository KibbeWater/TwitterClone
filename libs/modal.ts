import React, { createElement } from 'react';
import UserAuth from '../components/Modals/UserAuth';

let currentModal: React.ReactNode = null;

export function showModal(modal: React.ReactNode) {
	currentModal = modal;
}

export function hideModal() {
	currentModal = null;
}

export function useModal() {
	return currentModal;
}
