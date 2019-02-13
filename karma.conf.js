'use strict';

const path = require('path');

let config;

const local = typeof process.env.CI === 'undefined' || process.env.CI === 'false';
const port = 9001;

if ( local ) {
	config = {
		browsers: ['Chrome'],
	};
} else {
	config = {
		browserStack: {
			startTunnel: true,
			project: 'figura',
			name: 'Automated (Karma)',
			build: 'Automated (Karma)'
		},
		customLaunchers: {
			'BS-Chrome': {
				base: 'BrowserStack',
				browser: 'Chrome',
				os: 'Windows',
				'os_version': '7',
				project: 'figura',
				build: 'Automated (Karma)',
				name: 'Chrome'
			},
			'BS-Firefox': {
				base: 'BrowserStack',
				browser: 'Firefox',
				os: 'Windows',
				'os_version': '7',
				project: 'figura',
				build: 'Automated (Karma)',
				name: 'Firefox'
			},
			'BS-IE9': {
				base: 'BrowserStack',
				browser: 'IE',
				'browser_version': '9',
				os: 'Windows',
				'os_version': '7',
				project: 'figura',
				build: 'Automated (Karma)',
				name: 'IE9'
			},
			// 'BS-iOS 8.3': {
			// 	base: 'BrowserStack',
			// 	device: 'iPhone 6',
			// 	browser: 'Mobile Safari',
			// 	'browser_version': null,
			// 	os: 'ios',
			// 	'os_version': '8.3',
			// 	project: 'kist-view',
			// 	build: 'Automated (Karma)',
			// 	name: 'iOS'
			// },
			// 'BS-Android 4.2': {
			// 	base: 'BrowserStack',
			// 	device: 'Google Nexus 4',
			// 	browser: 'Android Browser',
			// 	'browser_version': null,
			// 	os: 'android',
			// 	'os_version': '4.2',
			// 	project: 'kist-view',
			// 	build: 'Automated (Karma)',
			// 	name: 'Android'
			// }
		},
		browsers: ['BS-Chrome', 'BS-Firefox', 'BS-IE9']
	};
}

module.exports = function ( baseConfig ) {

	baseConfig.set(Object.assign({
		basePath: '',
		frameworks: ['mocha', 'fixture'],
		files: [
			'test/**/*.html',
			'test/**/.webpack.js'
		],
		exclude: [],
		preprocessors: {
			'test/**/*.html': ['html2js'],
			'test/**/.webpack.js': ['webpack', 'sourcemap']
		},
		reporters: ['mocha', 'coverage-istanbul'],
		port: port,
		colors: true,
		logLevel: baseConfig.LOG_INFO,
		autoWatch: false,
		client: {
			captureConsole: true
		},
		browserConsoleLogOptions: {
			level: 'log',
			format: '%b %T: %m',
			terminal: true
		},
		webpack: {
			mode: 'none',
			devtool: 'inline-source-map',
			module: {
				rules: [
					{
						test: /\.js$/,
						exclude: /node_modules/,
						use: [{
							loader: 'babel-loader'
						}]
					},
					{
						test: /\.js$/,
						exclude: /(node_modules|test)/,
						enforce: 'post',
						use: [{
							loader: 'istanbul-instrumenter-loader',
							options: {
								esModules: true
							}
						}]
					}
				]
			}
		},
		coverageIstanbulReporter: {
			dir: path.join(__dirname, 'coverage/%browser%'),
			fixWebpackSourcePaths: true,
			reports: ['html', 'text'],
			thresholds: {
				global: {
					statements: 80
				}
			}
		},
		singleRun: true,
		concurrency: Infinity
	}, config));

};
