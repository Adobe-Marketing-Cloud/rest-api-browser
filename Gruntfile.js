// Generated on 2015-02-16 using generator-angular 0.11.1
'use strict';

// # Globbing
// for performance reasons we're only matching one level down:
// 'test/spec/{,*/}*.js'
// use this if you want to recursively match all subfolders:
// 'test/spec/**/*.js'

module.exports = function (grunt) {

  // Load grunt tasks automatically
  require('load-grunt-tasks')(grunt);

  // Time how long tasks take. Can help when optimizing build times
  require('time-grunt')(grunt);

  var proxyUtils = require('grunt-connect-proxy/lib/utils');

  // Define the configuration for all the tasks
  grunt.initConfig({
    browserify: {
      js: {
        // A single entry point for our app
        src: 'app/scripts/app.js',
        // Compile to a single file to add a script tag for in your HTML
        dest: '.tmp/scripts/app.js',

        options: {

            debug: true

        }
      }
    },

    // Watches files for changes and runs tasks based on the changed files
    watch: {
      js: {
        files: ['app/scripts/{,*/}*.js'],
        tasks: ['newer:jshint:all', 'browserify'],
        options: {
          livereload: '<%= connect.options.livereload %>'
        }
      },
      styles: {
        files: ['app/styles/{,*/}*.css'],
        tasks: ['newer:copy:styles', 'autoprefixer']
      },
      gruntfile: {
        files: ['Gruntfile.js']
      },
      livereload: {
        options: {
          livereload: '<%= connect.options.livereload %>'
        },
        files: [
          'app/{,*/}*.html',
          '.tmp/styles/{,*/}*.css',
          '.tmp/scripts/{,*/}*.js',
          'app/images/{,*/}*.{png,jpg,jpeg,gif,webp,svg}'
        ]
      }
    },

    // The actual grunt server settings
    connect: {
      options: {
        port: 9000,
        // Change this to '0.0.0.0' to access the server from outside.
        hostname: 'localhost',
        livereload: 35729
      },
      proxies: [{
        context: '/api',
        host: 'localhost',
        port: 4502,
        headers: {
          // AEM default login: admin:admin
          'Authorization': 'Basic YWRtaW46YWRtaW4='
        }
      }],
      livereload: {
        options: {
          open: true,
          middleware: function (connect) {
            return [
              proxyUtils.proxyRequest,
              connect.static('.tmp'),
              connect().use(
                '/node_modules',
                connect.static('./node_modules')
              ),
              connect().use(
                '/app/styles',
                connect.static('./app/styles')
              ),
              connect.static('app')
            ];
          }
        }
      },
      test: {
        options: {
          port: 9001,
          middleware: function (connect) {
            return [
              connect.static('.tmp'),
              connect.static('test'),
              connect().use(
                '/bower_components',
                connect.static('./bower_components')
              ),
              connect.static('app')
            ];
          }
        }
      },
      dist: {
        options: {
          open: true,
          base: 'dist'
        }
      }
    },

    // Make sure code styles are up to par and there are no obvious mistakes
    jshint: {
      options: {
        jshintrc: '.jshintrc',
        reporter: require('jshint-stylish')
      },
      all: {
        src: [
          'Gruntfile.js',
          'app/scripts/{,*/}*.js'
        ]
      },
      test: {
        options: {
          jshintrc: 'test/.jshintrc'
        },
        src: ['test/spec/{,*/}*.js']
      }
    },

    // Empties folders to start fresh
    clean: {
      dist: {
        files: [{
          dot: true,
          src: [
            '.tmp',
            'dist/{,*/}*',
            '!dist/.git{,*/}*'
          ]
        }]
      },
      server: '.tmp'
    },

    // Add vendor prefixed styles
    autoprefixer: {
      options: {
        browsers: ['last 1 version']
      },
      server: {
        options: {
          map: true
        },
        files: [{
          expand: true,
          cwd: '.tmp/styles/',
          src: '{,*/}*.css',
          dest: '.tmp/styles/'
        }]
      },
      dist: {
        files: [{
          expand: true,
          cwd: '.tmp/styles/',
          src: '{,*/}*.css',
          dest: '.tmp/styles/'
        }]
      }
    },
    uglify: {
       dist: {
         files: {
           'dist/scripts/app.js': [
             'dist/scripts/app.js'
           ]
         }
       }
    },

    // ng-annotate tries to make the code safe for minification automatically
    // by using the Angular long form for dependency injection.
    ngAnnotate: {
      options: {
        singleQuotes: true
      },
      dist: {
        files: [{
          expand: true,
          cwd: '.tmp/concat/scripts',
          src: '*.js',
          dest: '.tmp/concat/scripts'
        }]
      }
    },

    // Replace Google CDN references
    cdnify: {
      dist: {
        html: ['dist/*.html']
      }
    },

    // Copies remaining files to places other tasks can use
    copy: {
      dist: {
        files: [{
          expand: true,
          dot: true,
          cwd: 'app',
          dest: 'dist',
          src: [
            '*.{ico,png,txt}',
            '.htaccess',
            '*.html',
            'views/{,*/}*.html',
            'images/{,*/}*.{webp}',
            'styles/fonts/{,*/}*.*'
          ]
        }, {
          expand: true,
          cwd: '.tmp/images',
          dest: 'dist/images',
          src: ['generated/*']
        }, {
          expand: true,
          cwd: '.tmp/scripts',
          dest: 'dist/scripts',
          src: ['*.js']
        }]
      },
      styles: {
        expand: true,
        cwd: 'app/styles',
        dest: '.tmp/styles/',
        src: '{,*/}*.css'
      }
    },

    // Run some tasks in parallel to speed up the build process
    concurrent: {
      server: [
        'copy:styles'
      ],
      test: [
        'copy:styles'
      ],
      dist: [
        'copy:styles'
      ]
    },

    // Test settings
    karma: {
      unit: {
        configFile: 'test/karma.conf.js',
        singleRun: true
      }
    }
  });


  grunt.registerTask('serve', 'Compile then start a connect web server', function (target) {
    if (target === 'dist') {
      return grunt.task.run(['build', 'connect:dist:keepalive']);
    }

    grunt.task.run([
      'clean:server',
      'browserify',
      'configureProxies',
      'concurrent:server',
      'connect:livereload',
      'watch'
    ]);
  });

  grunt.registerTask('server', 'DEPRECATED TASK. Use the "serve" task instead', function (target) {
    grunt.log.warn('The `server` task has been deprecated. Use `grunt serve` to start a server.');
    grunt.task.run(['serve:' + target]);
  });

  grunt.registerTask('test', [
    'clean:server',
    'browserify',
    'concurrent:test',
    'connect:test'
  ]);

  grunt.registerTask('build', [
    'clean:dist',
    'browserify',
    'ngAnnotate:dist',
    'concurrent:dist',
    'copy:dist'
  ]);

  grunt.registerTask('default', [
    'newer:jshint',
    'test',
    'build'
  ]);
};
