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
