import { createElement } from 'preact';
import { useCallback, useEffect } from 'preact/hooks';

import { zimletEventEmitter, callWith } from '@zimbra-client/util';
import { ZIMBRA_ZIMLET_EVENTS } from '@zimbra-client/constants';
import ConfirmModal from './confirm-modal';

const MODAL_ID = 'zimbra-zimlet-attachment-alert';

export const InitializeEvents = ({ context }) => {
	const { dispatch } = context.store;
	const { addModal } = context.zimletRedux.actions.zimlets;
	const { removeModal } = context.zimletRedux.actions.zimlets;

	const onDialogClose = useCallback(
		reject => {
			reject();
			dispatch(removeModal({ id: MODAL_ID }));
		},
		[dispatch, removeModal]
	);

	const onDialogAction = useCallback(
		resolve => {
			resolve();
			dispatch(removeModal({ id: MODAL_ID }));
		},
		[dispatch, removeModal]
	);

	const onSendHandler = useCallback(
		({ message }) =>
			new Promise((resolve, reject) => {

				//Here we get the locale from the user settings
				const locale = context.store.getState().locale;

				//Read the i18n strings for this Zimlet
				let zimletStrings = require(`../intl/${locale}.json`);
				zimletStrings = zimletStrings['attachment-alert-zimlet'];
				//zimletStrings.words now holds the Regex for finding attachment words in the email body

				//This message has attachments, so no alert will be shown.
				if (message.attachments.length > 0) {
					//We have to return by calling resolve() to let the Zimlet framework know this Zimlet is done. 
					//Then the sending of the email will continue after other error checks.
					resolve();
				}
				else {
					//If attachment words are found in the email text, ask the user a confirmation.
					if (new RegExp(zimletStrings.words).test(message.text.toLowerCase())) {
						const modal = (
							<ConfirmModal
								onClose={callWith(onDialogClose, reject)}
								onAction={callWith(onDialogAction, resolve)}
							/>
						);
						dispatch(addModal({ id: MODAL_ID, modal }));
					}
					else {
						//If there are no attachment words, 
						//We have to return by calling resolve() to let the Zimlet framework know this Zimlet is done. 
						//Then the sending of the email will continue after other error checks.
						resolve();
					}
				}
			}),
		[dispatch, addModal, onDialogAction, onDialogClose]
	);

	useEffect(() => {
		zimletEventEmitter.on(ZIMBRA_ZIMLET_EVENTS.ONBEFORESEND, onSendHandler, true);

		return () => {
			zimletEventEmitter.off(ZIMBRA_ZIMLET_EVENTS.ONBEFORESEND, onSendHandler);
		};
	}, [onSendHandler]);

	return null;
};
