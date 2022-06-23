# Listen for events using a Zimlet

This article explains how to write a Zimlet that listens for an event using zimletEventEmitter. This way you can write for example an Attachment Alert Zimlet. The Attachment Alert Zimlet can register an event listener that is fired when the user clicks the Send button when writing an email. Then the Zimlet can look in the body of the email and look for words like `attached` and in case no attachment is uploaded it can show the user a reminder for uploading the attachment.

## Downloading and running the Attachment Alert Zimlet

Create a folder on your local computer to store the Attachment Alert Zimlet:

      mkdir ~/zimbra_course_pt16
      cd ~/zimbra_course_pt16
      git clone https://github.com/Zimbra/zimbra-zimlet-attachment-alert
      cd zimbra-zimlet-attachment-alert
      npm install
      zimlet watch

The output of this command should be:

```
Compiled successfully!

You can view the application in browser.

Local:            https://localhost:8081/index.js
On Your Network:  https://192.168.1.100:8081/index.js
```

Visit https://localhost:8081/index.js in your browser and accept the self-signed certificate. The index.js is a packed version of the `Attachment Alert Zimlet`. More information about the zimlet command, npm and using SSL certificates can be found in https://github.com/Zimbra/zm-zimlet-guide. 

Have you already used Zimlet Cli in the past? Make sure to update it using `sudo npm install -g @zimbra/zimlet-cli`. You can check your version using `zimlet --version`. You will need version `12.8.0` of Zimlet Cli for this Zimlet to work.

## Sideload the Attachment Alert Zimlet

Log on to your Zimbra development server and make sure that you are seeing the modern UI. Then click the Jigsaw puzzle icon and Zimlets Sideloader. If you are not seeing the Zimlet Sideloader menu. You have to run `apt/yum install zimbra-zimlet-sideloader` on your Zimbra server and enable the Sideloader Zimlet in your Class of Service.

![](screenshots/03-Sideload.png)
*Sideload the Attachment Alert Zimlet by clicking Load Zimlet. The Zimlet is now added to the Zimbra UI in real-time. No reload is necessary.*

Write a new email and put something like `Please see attached document for more information.` in the body of the email. Do not attach a file and click Send. You will then see the new Attachment Alert Zimlet in action.

![](screenshots/04-attachment-alert.png)
*The Attachment Alert*

## zimletEventEmitter events 

Zimlets can register listeners that are provided via zimletEventEmitter. The following events are supported:

- AFTERONSEND
- LOGOUT
- ONBEFORESEND (props: message)
- ONSEND
- ONSENDINVITEREPLY

_New events will be added to Zimbra soon, this guide will be updated when that happens._

After the user clicks the send button and when all `ONSEND` event handlers have resolved, the `AFTERONSEND` event is fired. At this point the back-end will process the email for sending. This event can not abort the sending, so it should always resolve. This event can be used for compliance, custom logging or custom REST API calls.

The `LOGOUT` event is fired when the user clicks the `Logout` menu item. It can be used to trigger a log-out in non Single Log Out aware 3rd party application.

The `ONBEFORESEND` event is fired when the user clicks the `Send` button when sending an email. It can be used for email error checks, such as a forgotten attachment reminder. The message to send is passed via the `message` prop. See https://github.com/Zimbra/zimbra-zimlet-attachment-alert for an example.

The `ONSEND` event is fired when the user clicks the `Send` button when sending an email. It can be used for email error checks or do a check in a 3rd party application for compliance validation.

The `ONSENDINVITEREPLY` is fired when a user RSVP's to a calendar invitation. The `verb` and `invitation` are passed to the event handler. You can use the `verb` to determine if the user accepted, declined, proposed a new time or tentatively accepted the invitation. Define your handler like: `onSendHandler = (args) => {console.log(args);}`.

There can be two types of handlers.

1. Handler doing synchronous tasks like - calculating something, displaying toast, or updating view/state. Here is an example of this kind of handler:
```
import { zimletEventEmitter } from '@zimbra-client/util';
import { ZIMBRA_ZIMLET_EVENTS } from '@zimbra-client/constants';

const onLogoutHandler = () => { /** Display toast message */ };
zimletEventEmitter.on(ZIMBRA_ZIMLET_EVENTS.LOGOUT, onLogoutHandler);
```

2. Handler doing asynchronous tasks like - invoke an API call or display a dialog to confirm the action with the user. Here is an example of this kind of handler:
```
import { zimletEventEmitter } from '@zimbra-client/util';
import { ZIMBRA_ZIMLET_EVENTS } from '@zimbra-client/constants';

const onLogoutHandler = () => new Promise((resolve, reject) => {
    if (window.confirm("Do you really want to logout?")) {
        resolve();
    } else {
        reject();
    }
});
zimletEventEmitter.on(ZIMBRA_ZIMLET_EVENTS.LOGOUT, onLogoutHandler, true);
```

## Visual Studio Code

This guides includes a fully functional `Attachment Alert Zimlet`. It works by registering the `ONBEFORESEND` event. In the `onSendHandler` method the Zimlet checks if the email message has files attached and if words like _attachment, bijlage, fichier joint, fichier attaché, etc_ are found in the body of the email. In case there are no attachments uploaded, but _attachment_ words are in the body of the email, the Zimlet will show the user a reminder to upload the attachments.

To learn from this Zimlet you should open it in Visual Studio Code and take a look at the implementation of the `Attachment Alert Zimlet`.

Open the folder `~/zimbra_course_pt16/zimbra-zimlet-attachment-alert` in Visual Studio Code to take a look at the code in the Attachment Alert Zimlet. The general structure of the Zimlet and the way menu's are implemented in Zimlet slots has been described in previous guides. Refer to https://wiki.zimbra.com/wiki/DevelopersGuide#Zimlet_Development_Guide.

## Attachment Alert Zimlet

The file src/index.js implements the basic Zimlet:
```javascript
import { createElement } from 'preact';

import { InitializeEvents } from './components/initialize-events';

export default function Zimlet(context) {
	const { plugins } = context;
	const exports = {};

	exports.init = function init() {
		plugins.register('slot::mail-composer-toolbar-send', () => (
			<InitializeEvents context={context} />
		));
	};

	return exports;
}
```

The file /src/components/initialize-events.js implements the `Attachment Alert Zimlet` reminder dialog. The in-code comments explain how it works:

```javascript
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

```

The reminder dialog itself is implemented in src/components/confirm-modal.js and `withIntl()` implements the localization of the alert message for the user.

```javascript
import { createElement } from 'preact';
import { Text } from 'preact-i18n';

import { withIntl } from '../enhancers';
import { ModalDialog } from '@zimbra-client/components';

const ConfirmModal = ({ onClose, onAction }) => {
	return (
		<ModalDialog
			title="attachment-alert-zimlet.title"
			onAction={onAction}
			onClose={onClose}
		>
			<p>
				<Text id="attachment-alert-zimlet.alert" />
			</p>
		</ModalDialog>
	);
};

export default withIntl()(ConfirmModal);

```

## Internationalization (i18n)

This Zimlet uses a regular expression to find words like `attachment` in the body of the email. The regular expression used is defined in the `intl` folder of the Zimlet and attachment `words` are defined for a large number of languages.

Some linguistic research has been done to be able to show users the Attachment Reminder dialog in case they write an email in a language that is not the same as the UI language setting.

For example in The Netherlands it is common for users to write emails in English and in Dutch. Since the words for `attachment` in Dutch is `bijlage` it is easy to make a regular expression that supports both Dutch and English. 

Take a look at the `words` in the Dutch language file located at `src/intl/nl.json`:
```
"words":"attach|bijlage|adjunto|fichero adjunto|envío el fichero|allegat",
```
Here you can see the words used to indicate `attachment` in English, Dutch, Spanish and Italian. As these are commonly written languages in The Netherlands, these words will all work for the user that has Zimbra set to use Dutch UI language. The regular expression can never be 100% accurate so sometimes it will show a false reminder, or no reminder, but there is no easy fix for that.

Also some languages like German are to similar to Dutch. Supporting German and Dutch at the same time will generate a lot of false reminders, so that won't work with this Zimlet.

## References

- https://github.com/Zimbra/zimlet-cli/wiki/Capture-Zimbra-events-inside-a-Zimlet

The latest version of this guide can be found at:

- https://github.com/Zimbra/zimlet-attachment-alert
