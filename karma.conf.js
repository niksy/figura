/* globals process:false */
/* eslint-disable no-process-env */

'use strict';

module.exports = function ( config ) {

	config.set({
		basePath: '',
		frameworks: ['browserify', 'mocha'],
		files: [
			'test/**/*.html',
			'test/**/*.js'
		],
		exclude: [],
		preprocessors: {
			'test/**/*.html': ['html2js'],
			'test/**/*.js': ['browserify']
		},
		reporters: ['mocha', 'coverage'],
		port: 9001,
		colors: true,
		logLevel: config.LOG_INFO,
		autoWatch: false,
		client: {
			mocha: {
				ui: 'bdd'
			}
		},
		browserify: {
			debug: true,
			transform: [
				'babelify',
				['browserify-babel-istanbul', { defaultIgnore: true }]
			]
		},
		coverageReporter: {
			reporters: [
				{
					type: 'html'
				},
				{
					type: 'text'
				}
			],
			check: {
				global: {
					statements: 80
				}
			}
		},
		customLaunchers: {
			'Chrome-CI': {
				base: 'Chrome',
				flags: ['--no-sandbox']
			}
		},
		browsers: [(process.env.TRAVIS ? 'Chrome-CI' : 'Chrome')],
		singleRun: true,
		concurrency: Infinity
	});

};
