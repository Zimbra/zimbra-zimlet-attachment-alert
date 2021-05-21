import { createElement, Component, render } from 'preact';
import { withIntl } from '../../enhancers';
import { withText, Text } from 'preact-i18n';
import style from './style';
import { ModalDialog } from '@zimbra-client/components';

import { zimletEventEmitter } from '@zimbra-client/util';
import { ZIMBRA_ZIMLET_EVENTS } from '@zimbra-client/constants';

@withIntl()
@withText({
    title: 'attachment-alert-zimlet.title',
    words: 'attachment-alert-zimlet.words',
    alert: 'attachment-alert-zimlet.alert'
})

export default class MoreMenu extends Component {
    constructor(props) {
        super(props);
        this.zimletContext = props.children.context;
        const { zimbraBatchClient } = this.zimletContext;
        //Register this Zimlet onSendHandler handler to the ONSEND event
        zimletEventEmitter.on(ZIMBRA_ZIMLET_EVENTS.ONSEND, this.onSendHandler, true);
    }

    //Will be called by the Zimlet framework in case the user hits Send button
    onSendHandler = () => new Promise((resolve, reject) => {
        //Get the message that is about to be send via the prop passed via the Zimlet slot
        let message = this.props.getMessageToSend();

        //This message has attachments, so no alert will be shown.
        if (message.attachments.length > 0) {
            //We have to return by calling resolve() to let the Zimlet framework know this Zimlet is done. 
            //Then the sending of the email will continue after other error checks.
            resolve();
        }
        else {
            //If attachment words are found in the email text, ask the user a confirmation.
            //this.props.words comes via the files in `intl` folder.
            if (new RegExp(this.props.words).test(message.text.toLowerCase())) {
                this.showDialog(resolve, reject);
            }
            else {
                //If there are no attachment words, 
                //We have to return by calling resolve() to let the Zimlet framework know this Zimlet is done. 
                //Then the sending of the email will continue after other error checks.
                resolve();
            }
        }
    });

    //Dialog to ask user if attachment was forgotten to attach
    showDialog = (resolve, reject) => {
        this.modal = (
            <ModalDialog
                class={style.modalDialog}
                contentClass={style.modalContent}
                innerClass={style.inner}
                onClose={this.handleClose}
                cancelButton={false}
                header={false}
                footer={false}
            >
                <header class="zimbra-client_modal-dialog_header"><h2>{this.props.title}</h2><button onClick={e => this.handleClose(e, reject)} aria-label="Close" class="zimbra-client_close-button_close zimbra-client_modal-dialog_actionButton"><span role="img" class="zimbra-icon zimbra-icon-close blocks_icon_md"></span></button></header>
                <div class="zimbra-client_modal-dialog_content zimbra-client_language-modal_languageModalContent">{this.props.alert}</div>
                <footer class="zimbra-client_modal-dialog_footer"><button type="button" class="blocks_button_button blocks_button_primary blocks_button_regular blocks_button_brand-primary" onClick={e => this.handleSendAnyway(e, resolve)}><Text id="dialogs.noSubject.sendAnyway" /></button><button type="button" class="blocks_button_button blocks_button_regular" onClick={e => this.handleClose(e, reject)}><Text id="buttons.cancel" /></button></footer>

            </ModalDialog>
        );

        const { dispatch } = this.zimletContext.store;
        dispatch(this.zimletContext.zimletRedux.actions.zimlets.addModal({ id: 'addEventModal', modal: this.modal }));
    }

    //This is called when the user hits Send Anyway button.
    handleSendAnyway = (e, resolve) => {
        //Remove our event handler, so it will not trigger again.
        zimletEventEmitter.off(ZIMBRA_ZIMLET_EVENTS.ONSEND, this.onLogoutHandler);
        resolve();
        const { dispatch } = this.zimletContext.store;
        dispatch(this.zimletContext.zimletRedux.actions.zimlets.addModal({ id: 'addEventModal' }));
    }

    //This is called when the user hits Cancel button.
    //handleClose only removes the dialog, but does not finish the Promise with resolve(), so the user can try again.
    handleClose = (e, reject) => {
        const { dispatch } = this.zimletContext.store;
        dispatch(this.zimletContext.zimletRedux.actions.zimlets.addModal({ id: 'addEventModal' }));
    }

    //This Zimlet does not add UI elements, so it renders emptiness.
    render() {
        return ("");
    }
}
