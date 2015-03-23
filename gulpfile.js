/*
 https://www.npmjs.com/package/gulp-connect
 https://www.npmjs.com/package/gulp-ng-annotate/
 https://github.com/tschaub/gulp-newer

 https://medium.com/@addyosmani/javascript-application-architecture-on-the-road-to-2015-d8125811101b
 https://medium.com/@erikdkennedy/7-rules-for-creating-gorgeous-ui-part-1-559d4e805cda
 https://github.com/greypants/gulp-starter

 http://blog.overzealous.com/post/74121048393/why-you-shouldnt-create-a-gulp-plugin-or-how-to

 Create re-usable pipe(-fragments): https://www.npmjs.com/package/lazypipe
 Inject CSS + JS into HTML files: https://www.npmjs.com/package/gulp-inject

 Angular app structure recommendation: https://docs.google.com/document/d/1XXMvReO8-Awi1EZXAXS4PzDzdNvV6pGcuaF4Q9821Es/pub

 */

var gulp = require('gulp');
var del = require('del');
var connect = require('gulp-connect');
var proxy = require('proxy-middleware');
var ngAnnotate = require('gulp-ng-annotate');
var browserify = require('browserify');
var source = require('vinyl-source-stream');

gulp.task('clean', function (callback) {
  del('./build', callback);
});

gulp.task('copy-html', function () {
  return gulp.src('app/**/*.html')
    //.pipe(inject())
    .pipe(gulp.dest('build/'))
    .pipe(connect.reload());
});

gulp.task('copy-css', function () {
  return gulp.src('app/styles/**/*.css')
    .pipe(gulp.dest('build/css/'))
    .pipe(connect.reload());
});

gulp.task('process-js', browserifyTask({
    src: './app/scripts/asset-browser.module.js',
    dest: './build/js',
    filename: 'asset-browser.js',
    require: []
}));

gulp.task('copy-bootstrap', function () {
  return gulp.src('./node_modules/bootstrap/dist/**/*', {
    base: './node_modules/bootstrap/dist/'
  })
    .pipe(gulp.dest('build/vendor/'));
});

gulp.task('webserver', function () {
  connect.server({
    root: 'build',
    port: 9000,
    livereload: true,
    middleware: function (connect, o) {
      return [
        proxy({
          route: '/api/',
          preserveHost: true,
          hostname: 'localhost',
          port: 4502,
          pathname: '/api/',
          headers: {
            'Authorization': 'Basic YWRtaW46YWRtaW4='
          }
        }),
        proxy({
          route: '/api.json',
          preserveHost: true,
          hostname: 'localhost',
          port: 4502,
          pathname: '/api.json',
          headers: {
            'Authorization': 'Basic YWRtaW46YWRtaW4='
          }
        })
      ];
    }
  });
});

gulp.task('watch', function () {
  gulp.watch('app/**/*.html', ['copy-html']);
  gulp.watch('app/styles/**/*.css', ['copy-css']);
  gulp.watch('app/scripts/**/*.js', ['process-js']);
});

gulp.task('copy', ['copy-html', 'copy-css', 'copy-bootstrap']);
gulp.task('build', ['copy', 'process-js']);
gulp.task('serve', ['build', 'watch', 'webserver']);
gulp.task('default', ['build']);

function browserifyTask(config) {
  function bundle() {
    var bundler = browserify({ debug: true });
    bundler.add(config.src);
    bundler.transform('browserify-ngannotate');
    bundler.bundle()
      .pipe(source(config.filename))
      .pipe(gulp.dest(config.dest));
  }
  return bundle;
}
