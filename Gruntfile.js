module.exports = function ( grunt ) {

	grunt.initConfig({

		pkg: grunt.file.readJSON('package.json'),

		meta: {
			banner: '/*! <%= pkg.name %> <%= pkg.version %> - <%= pkg.description %> | Author: <%= pkg.author %>, <%= grunt.template.today("yyyy") %> | License: <%= pkg.license %> */\n'
		},

		concat: {
			dist: {
				options: {
					stripBanners: true,
					banner: '<%= meta.banner %>'
				},
				files: {
					'dist/kist-segment.js': ['compiled/index.js']
				}
			}
		},

		uglify: {
			dist: {
				options: {
					banner: '<%= meta.banner %>'
				},
				files: {
					'dist/kist-segment.min.js': ['compiled/index.js']
				}
			}
		},

		bump: {
			options: {
				files: ['package.json', 'bower.json'],
				updateConfigs: ['pkg'],
				commit: true,
				commitMessage: 'Release %VERSION%',
				commitFiles: ['-a'],
				createTag: true,
				tagName: '%VERSION%',
				tagMessage: '',
				push: false
			}
		},

		jscs: {
			main: {
				options: {
					config: '.jscsrc'
				},
				files: {
					src: [
						'<%= pkg.main %>',
						'src/**/*.js'
					]
				}
			}
		},

		jshint: {
			main: {
				options: {
					jshintrc: '.jshintrc'
				},
				src: [
					'<%= pkg.main %>',
					'src/**/*.js'
				]
			}
		},

		browserify: {
			options: {
				browserifyOptions: {
					standalone: 'jQuery.kist.segment'
				}
			},
			standalone: {
				options: {
					plugin: ['bundle-collapser/plugin']
				},
				files: {
					'compiled/index.js': ['index.js']
				}
			},
			dev: {
				options: {
					watch: true,
					keepAlive: true
				},
				files: {
					'compiled/index.js': ['index.js']
				}
			}
		},

		connect: {
			test:{
				options: {
					open:true
				}
			}
		}

	});

	require('load-grunt-tasks')(grunt);

	grunt.registerTask('dev',['browserify:dev']);
	grunt.registerTask('test',['connect:test:keepalive']);
	grunt.registerTask('stylecheck', ['jshint:main', 'jscs:main']);
	grunt.registerTask('default', ['stylecheck', 'browserify:standalone', 'concat', 'uglify']);
	grunt.registerTask('releasePatch', ['bump-only:patch', 'default', 'bump-commit']);
	grunt.registerTask('releaseMinor', ['bump-only:minor', 'default', 'bump-commit']);
	grunt.registerTask('releaseMajor', ['bump-only:major', 'default', 'bump-commit']);

};
