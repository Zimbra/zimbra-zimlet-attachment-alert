//Load components from Zimbra
import { createElement } from 'preact';
import { provide } from 'preact-context-provider';

//Load the createMore function from our Zimlet component
import createMore from "./components/more";

//Create function by Zimbra convention
export default function Zimlet(context) {
	const { plugins } = context;
	const exports = {};

	exports.init = function init() {
		// The zimlet slots to load into, and what is being loaded into that slot
		//Here we are using preact-context-provider to pass the Zimlet context to the createMore function which implements our Zimlet
		//See: https://github.com/Zimbra/zimlet-cli/wiki/Zimlet-Context and https://github.com/synacor/preact-context-provider/
		plugins.register('slot::mail-composer-toolbar-send', provide(context)(createMore));
	};

	return exports;
}
