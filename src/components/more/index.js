import { createElement, Component, render } from 'preact';
import { compose } from 'recompose';
import { withIntl } from '../../enhancers';
import { Text } from 'preact-i18n';
import style from './style';
import { ModalDialog } from '@zimbra-client/components';

//https://github.com/Zimbra/zimlet-cli/wiki/Capture-Zimbra-events-inside-a-Zimlet
import { zimletEventEmitter } from '@zimbra-client/util';
import { ZIMBRA_ZIMLET_EVENTS } from '@zimbra-client/constants';

function createMore(props, context) {
	//By importing withIntl the json translations from the intl folder are loaded into context, can we can access them directly, or use <Text...
	const zimletStrings = context.intl.dictionary['attachment-alert-zimlet'];

	const onSendHandler = () => new Promise((resolve, reject) => {
		//Get the message that is about to be send via the prop passed via the Zimlet slot
		let message = props.getMessageToSend();

		//This message has attachments, so no alert will be shown.
		if (message.attachments.length > 0) {
			//We have to return by calling resolve() to let the Zimlet framework know this Zimlet is done. 
			//Then the sending of the email will continue after other error checks.
			resolve();
		}
		else {
			//If attachment words are found in the email text, ask the user a confirmation.
			//zimletStrings.words are loaded JSON files found in `intl` folder, via withIntl
			if (new RegExp(zimletStrings.words).test(message.text.toLowerCase())) {
				showDialog(resolve, reject);
			}
			else {
				//If there are no attachment words, 
				//We have to return by calling resolve() to let the Zimlet framework know this Zimlet is done. 
				//Then the sending of the email will continue after other error checks.
				resolve();
			}
		}
	});

	//Register event handler
	zimletEventEmitter.on(ZIMBRA_ZIMLET_EVENTS.ONSEND, onSendHandler, true);

	//Dialog to ask user if attachment was forgotten to attach
	const showDialog = (resolve, reject) => {
		let modal = (
			<ModalDialog
				class={style.modalDialog}
				contentClass={style.modalContent}
				innerClass={style.inner}
				onClose={handleClose}
				cancelButton={false}
				header={false}
				footer={false}
			>
				<header class="zimbra-client_modal-dialog_header"><h2>{zimletStrings.title}</h2><button onClick={e => handleClose(e, reject)} aria-label="Close" class="zimbra-client_close-button_close zimbra-client_modal-dialog_actionButton"><span role="img" class="zimbra-icon zimbra-icon-close blocks_icon_md"></span></button></header>
				<div class="zimbra-client_modal-dialog_content zimbra-client_language-modal_languageModalContent">{zimletStrings.alert}</div>
				<footer class="zimbra-client_modal-dialog_footer"><button type="button" class="blocks_button_button blocks_button_primary blocks_button_regular blocks_button_brand-primary" onClick={e => handleSendAnyway(e, resolve)}><Text id="dialogs.noSubject.sendAnyway" /></button><button type="button" class="blocks_button_button blocks_button_regular" onClick={e => handleClose(e, reject)}><Text id="buttons.cancel" /></button></footer>

			</ModalDialog>
		);

		const { dispatch } = context.store;
		dispatch(context.zimletRedux.actions.zimlets.addModal({ id: 'addEventModal', modal: modal }));
	}

	//This is called when the user hits Send Anyway button.
	const handleSendAnyway = (e, resolve) => {
		//Remove our event handler, so it will not trigger again.
		zimletEventEmitter.off(ZIMBRA_ZIMLET_EVENTS.ONSEND, onSendHandler);
		resolve();
		const { dispatch } = context.store;
		dispatch(context.zimletRedux.actions.zimlets.addModal({ id: 'addEventModal' }));
	}

	//This is called when the user hits Cancel button.
	//handleClose only removes the dialog, but does not finish the Promise with resolve(), so the user can try again.
	const handleClose = (e, reject) => {
		const { dispatch } = context.store;
		dispatch(context.zimletRedux.actions.zimlets.addModal({ id: 'addEventModal' }));
	}

	//This Zimlet does not render anything in the slot, so we return an empty string.
	return (
		""
	);
}


//By using compose from recompose we can apply internationalization to our Zimlet
//https://blog.logrocket.com/using-recompose-to-write-clean-higher-order-components-3019a6daf44c/
export default compose(
	withIntl()
)
	(
		createMore
	)