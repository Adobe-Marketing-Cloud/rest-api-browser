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
var sourcemaps = require('gulp-sourcemaps');
var ngAnnotate = require('gulp-ng-annotate');
var uglify = require('gulp-uglify');
var concat = require('gulp-concat');
//var inject = require('gulp-inject');


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

gulp.task('process-js', jsTask({
  src: ['app/**/*.module.js', 'app/**/*.js'],
  dest: './build/js',
  require: [
    //'angular',
    //'angular-ui-router',
    //'angular-bootstrap-npm'
  ]
}));

gulp.task('vendor-js',
  jsTask({
    src: [
      'node_modules/angular/angular.js',
      'node_modules/angular-ui-router/release/angular-ui-router.js',
      'node_modules/angular-bootstrap-npm/dist/angular-bootstrap.js'
    ],
    dest: './build/js/vendor',
    require: []
  })


  //var browserify = require('browserify');
  //var source = require('vinyl-source-stream');
  //browserify()
  //  .require('angular', {expose: 'angular'})
  //  .require('angular-ui-router', 'angular-bootstrap-npm')
  //  .bundle()
  //  .pipe(source('angular.js'))
  //  .pipe(gulp.dest('./build/js/vendor'));
);

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
      return [proxy({
        route: '/api/',
        preserveHost: true,
        hostname: 'localhost',
        port: 4502,
        pathname: '/api/',
        headers: {
          'Authorization': 'Basic YWRtaW46YWRtaW4='
        }
      })];
    }
  });
});

gulp.task('watch', function () {
  gulp.watch('app/**/*.html', ['copy-html']);
  gulp.watch('app/styles/**/*.css', ['copy-css']);
  gulp.watch('app/scripts/**/*.js', ['process-js']);
});

gulp.task('copy', ['copy-html', 'copy-css', 'copy-bootstrap']);
gulp.task('build', ['copy', 'vendor-js', 'process-js']);
gulp.task('serve', ['build', 'watch', 'webserver']);
gulp.task('default', ['build']);

//gulp.task('process-js', function() {
//  var browserified = transform(function(filename) {
//    var b = browserify(filename);
//    b.require(['angular', 'angular-ui-router', 'angular-bootstrap-npm']);
//    return b.bundle();
//  });
//
//  return gulp.src('app/scripts/app.js')
//    .pipe(browserified)
//    .pipe(gulp.dest('build/js/'))
//    .pipe(connect.reload());
//});

function jsTask(config) {
  gulp.src(config.src)
    .pipe(sourcemaps.init())
    .pipe(concat('app.js'))
    .pipe(ngAnnotate())
    //.pipe(uglify())
    //.pipe(rename({extname: ".min.js"})
    .pipe(sourcemaps.write())
    .pipe(gulp.dest(config.dest))
    .pipe(connect.reload());
}

function javascriptTask(config) {
  //var watchify = require('watchify');
  var browserify = require('browserify');
  var through = require('through2');

  var browserifier = through.obj(function (file, enc, next) {
    browserify(file.path, {debug: true})
      .require(config.require)
      .bundle(function (err, res) {
        if (err) {
          return next(err);
        }
        file.contents = res;
        next(null, file);
      })
  });

  function bundle() {
    return gulp.src(config.src)
      .pipe(ngAnnotate())
      .pipe(browserifier)
      .pipe(sourcemaps.init({loadMaps: true})) // loads map from browserify file
      //.pipe(uglify())
      //.pipe(rename({extname: ".min.js"})
      .pipe(sourcemaps.write('./')) // writes .map file
      .pipe(gulp.dest(config.dest))
      .pipe(connect.reload());
  }

  return bundle;
}



