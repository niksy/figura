'use strict';

const path = require('path');
const fs = require('fs');
const resolve = require('rollup-plugin-node-resolve');
const commonjs = require('rollup-plugin-commonjs');
const nodeBuiltins = require('rollup-plugin-node-builtins');
const globals = require('rollup-plugin-node-globals');
const babel = require('rollup-plugin-babel');
const istanbul = require('rollup-plugin-istanbul');
const polyfill = require('rollup-plugin-polyfill');
const rollupConfig = require('./rollup.config');

const babelrc = JSON.parse(
	fs.readFileSync(path.resolve(__dirname, '.babelrc'), 'utf8')
);

let config;

const local =
	typeof process.env.CI === 'undefined' || process.env.CI === 'false';
const port = 9001;

if (local) {
	config = {
		browsers: ['Chrome']
	};
} else {
	config = {
		hostname: 'bs-local.com',
		browserStack: {
			username: process.env.BROWSER_STACK_USERNAME,
			accessKey: process.env.BROWSER_STACK_ACCESS_KEY,
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
			'BS-iOS 10.0': {
				base: 'BrowserStack',
				device: 'iPhone 7 Plus',
				browser: 'Mobile Safari',
				'browser_version': null,
				'real_mobile': true,
				'os': 'ios',
				'os_version': '10.0',
				project: 'figura',
				build: 'Automated (Karma)',
				name: 'iOS'
			},
			'BS-Android 4.4': {
				base: 'BrowserStack',
				device: 'Google Nexus 5',
				browser: 'Android Browser',
				'browser_version': null,
				'real_mobile': true,
				os: 'android',
				'os_version': '4.4',
				project: 'figura',
				build: 'Automated (Karma)',
				name: 'Android'
			}
		},
		browsers: [
			'BS-Chrome',
			'BS-Firefox',
			'BS-IE9',
			'BS-iOS 10.0',
			'BS-Android 4.4'
		]
	};
}

module.exports = function(baseConfig) {
	baseConfig.set(
		Object.assign(
			{
				basePath: '',
				frameworks: ['mocha', 'fixture'],
				files: [
					'test/**/*.html',
					{ pattern: 'test/**/*.js', watched: false }
				],
				exclude: [],
				preprocessors: {
					'test/**/*.html': ['html2js'],
					'test/**/*.js': ['rollup', 'sourcemap']
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
				rollupPreprocessor: {
					plugins: [
						polyfill(path.resolve(__dirname, 'test'), [
							'proto-polyfill'
						]),
						nodeBuiltins(),
						babel({
							exclude: 'node_modules/**',
							runtimeHelpers: true
						}),
						resolve({
							preferBuiltins: true
						}),
						commonjs(),
						babel(
							Object.assign(
								{
									include:
										'node_modules/{has-flag,supports-color}/**',
									runtimeHelpers: true,
									babelrc: false
								},
								babelrc
							)
						),
						globals(),
						...rollupConfig.plugins.filter(
							({ name }) => !['babel'].includes(name)
						),
						istanbul({
							exclude: ['test/**/*.js', 'node_modules/**/*']
						})
					],
					output: {
						format: 'iife',
						name: 'figura',
						sourcemap: 'inline',
						intro: 'window.TYPED_ARRAY_SUPPORT = false;' // IE9
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
			},
			config
		)
	);
};
