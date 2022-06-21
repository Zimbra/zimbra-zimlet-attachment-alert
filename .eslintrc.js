module.exports = {
	extends: ['eslint-config-synacor', 'plugin:prettier/recommended'],
	plugins: ['prettier', 'react-hooks', 'preact-i18n'],
	rules: {
		'brace-style': ['error', '1tbs'],
		eqeqeq: ['error', 'smart'],

		'react/jsx-wrap-multilines': 'warn',
		'react-hooks/rules-of-hooks': 'error',
		'react-hooks/exhaustive-deps': 'warn',

		'no-shadow': 'error',
		'no-unused-vars': [
			'error',
			{
				vars: 'all',
				args: 'after-used',
				ignoreRestSiblings: true
			}
		],
		'prefer-const': [
			'error',
			{
				destructuring: 'all'
			}
		],

		indent: 'off',

		'prettier/prettier': [
			'error',
			{
				singleQuote: true,
				printWidth: 100,
				trailingComma: 'none',
				arrowParens: 'avoid'
			}
		],

		'preact-i18n/no-missing-template-field': 'error',
		'preact-i18n/no-text-as-attribute': 'error',
		// Ignore some characters, possibly surrounded by whitespace
		'preact-i18n/no-text-as-children': [
			'error',
			{ ignoreTextRegex: '^(?:\\s*[()🚩.":<>\\-/]\\s*)*$' }
		],
		'preact-i18n/no-unknown-key': 'error'
	},
	settings: {
		react: {
			pragma: 'createElement',
			version: '16.3'
		},
		'preact-i18n': {
			languageFiles: [
				{
					name: 'ar',
					path: 'src/intl/ar.json'
				},
				{
					name: 'bg',
					path: 'src/intl/bg.json'
				},
				{
					name: 'ca',
					path: 'src/intl/ca.json'
				},
				{
					name: 'cs',
					path: 'src/intl/cs.json'
				},
				{
					name: 'da',
					path: 'src/intl/da.json'
				},
				{
					name: 'de',
					path: 'src/intl/de.json'
				},
				{
					name: 'en_US',
					path: 'src/intl/en_US.json'
				},
				{
					name: 'es',
					path: 'src/intl/es.json'
				},
				{
					name: 'eu',
					path: 'src/intl/eu.json'
				},
				{
					name: 'fr_FR',
					path: 'src/intl/fr_FR.json'
				},
				{
					name: 'fr_CA',
					path: 'src/intl/fr_CA.json'
				},
				{
					name: 'hi',
					path: 'src/intl/hi.json'
				},
				{
					name: 'hr',
					path: 'src/intl/hr.json'
				},
				{
					name: 'hu',
					path: 'src/intl/hu.json'
				},
				{
					name: 'id',
					path: 'src/intl/id.json'
				},
				{
					name: 'it',
					path: 'src/intl/it.json'
				},
				{
					name: 'ja',
					path: 'src/intl/ja.json'
				},
				{
					name: 'ko',
					path: 'src/intl/ko.json'
				},
				{
					name: 'lo',
					path: 'src/intl/lo.json'
				},
				{
					name: 'ms',
					path: 'src/intl/ms.json'
				},
				{
					name: 'nl',
					path: 'src/intl/nl.json'
				},
				{
					name: 'nn_NO',
					path: 'src/intl/nn_NO.json'
				},
				{
					name: 'pl',
					path: 'src/intl/pl.json'
				},
				{
					name: 'pt_BR',
					path: 'src/intl/pt_BR.json'
				},
				{
					name: 'pt',
					path: 'src/intl/pt.json'
				},
				{
					name: 'ro',
					path: 'src/intl/ro.json'
				},
				{
					name: 'ru',
					path: 'src/intl/ru.json'
				},
				{
					name: 'sl',
					path: 'src/intl/sl.json'
				},
				{
					name: 'sv',
					path: 'src/intl/sv.json'
				},
				{
					name: 'ta',
					path: 'src/intl/ta.json'
				},
				{
					name: 'th',
					path: 'src/intl/th.json'
				},
				{
					name: 'tr',
					path: 'src/intl/tr.json'
				},
				{
					name: 'uk',
					path: 'src/intl/uk.json'
				},
				{
					name: 'vi',
					path: 'src/intl/vi.json'
				},
				{
					name: 'zh_CN',
					path: 'src/intl/zh_CN.json'
				},
				{
					name: 'zh_HK',
					path: 'src/intl/zh_HK.json'
				},
				{
					name: 'zh_TW',
					path: 'src/intl/zh_TW.json'
				}
			],
			textComponents: [
				{ nameRegex: '^Text$' },
				{ nameRegex: '^TextInput$', id: 'placeholderId' },
				{ nameRegex: '^AlignedLabel$', id: 'textId' },
				{ nameRegex: '^(?:Inline)?Modal(?:Dialog|Drawer)', id: 'title' },
				{ nameRegex: '^ContactSuggestion$', id: 'previouslySelectedLabel' }
			]
		}
	}
};
