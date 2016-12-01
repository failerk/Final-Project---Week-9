'use strict';

const browserSync   = require('browser-sync').create();
const runSequence   = require('run-sequence');

const gulp          = require('gulp');
const sass          = require('gulp-sass');
const cssimport     = require('gulp-cssimport');
const autoprefixer  = require('gulp-autoprefixer'); 
const concat        = require('gulp-concat');
const minifyCss     = require('gulp-minify-css');
const streamqueue   = require('streamqueue'); 

const imagemin      = require('gulp-imagemin');
const cache         = require('gulp-cache');

const child         = require('child_process');
const gutil         = require('gulp-util');
const babel         = require('gulp-babel');

const del           = require('del');

const plumber       = require('gulp-plumber');
const notify        = require('gulp-notify');

const ghPages       = require('gulp-gh-pages');

const siteRoot      = 'dist/';
const sassFiles     = 'app/sass/**/*.scss';
const cssFiles      = 'app/css/**/*.?(s)css';
const jsFiles       = 'app/js/**/*.js';
const controllers   = 'app/js/controllers/**/*.js';
const services     = 'app/js/services/**/*.js';
const directives = 'app/js/directives/**/*.js';
const vendor = 'app/js/vendor/**/*.js';

// --------------------------------------------------
// Gulp Task Options
// --------------------------------------------------
var sassOptions = {
  errLogToConsole: true,
  outputStyle: 'expanded'
};

var autoprefixerOptions = {
  browsers: ['last 2 versions', '> 5%', 'Firefox ESR']
};



// --------------------------------------------------
// Gulp Tasks
// --------------------------------------------------
gulp.task('css', () => {
  return streamqueue({ objectMode: true },
    gulp.src('./app/sass/*.scss') 
      .pipe(plumber({errorHandler: notify.onError("Error: <%= error.message %>")}))
      .pipe(sass(sassOptions)),
    gulp.src('./app/css/*.css')
      .pipe(plumber({errorHandler: notify.onError("Error: <%= error.message %>")}))
      .pipe(cssimport()) 
      .pipe(autoprefixer(autoprefixerOptions)))
    .pipe(concat('main.css')) 
    .pipe(minifyCss()) 
    .pipe(gulp.dest('./dist/css/'))
    .pipe(notify("CSS has completed"));
});



gulp.task('images', () => {
  return gulp.src('app/images/**/*.+(png|jpg|gif|svg)')
    .pipe(plumber({errorHandler: notify.onError("Error: <%= error.message %>")}))
    .pipe(cache(imagemin({
      interlaced:true
    })))
    .pipe(gulp.dest('dist/images'))
    .pipe(notify("Images has completed"));
});



gulp.task('babel', () => {
  return gulp.src([jsFiles, controllers, services, directives, vendor])
    .pipe(plumber({errorHandler: notify.onError("Error: <%= error.message %>")}))
    .pipe(babel({
      presets: ['es2015']
    }))
    .on('error', console.error.bind(console))
    .pipe(gulp.dest('dist/js/'))
    .pipe(notify("Babel has completed"));
});



gulp.task('html', () => {
  gulp.src(['./app/**/*.html', './app/partials/**/*.html'])
    .pipe(plumber({errorHandler: notify.onError("Error: <%= error.message %>")}))
    .pipe(gulp.dest('./dist/'))
    .pipe(notify("HTML has completed"));
})



gulp.task('fonts', () => {
  return gulp.src('app/fonts/**/*')
    .pipe(plumber({errorHandler: notify.onError("Error: <%= error.message %>")}))
    .pipe(gulp.dest('dist/fonts'))
    .pipe(notify("Fonts has completed"));
});



gulp.task('serve', () => {
  browserSync.init({
    files: [siteRoot + '/**'],
    port: 3000,
    server: {
      baseDir: siteRoot
    }
  });

  gulp.watch(['app/**/*.html', 'app/partials/**/*.html'], ['html'])
  gulp.watch(sassFiles, ['css'])
  gulp.watch([jsFiles, controllers, services, directives, vendor], ['babel']);
});


gulp.task('clean:dist', function() {
  return del.sync('dist');
});


gulp.task('deploy', function() {
  return gulp.src('./dist/**/*')
    .pipe(ghPages());
});

// --------------------------------------------------
// Build Sequences
// --------------------------------------------------
gulp.task('build', ['css', 'images', 'babel', 'html', 'fonts', 'serve']);



gulp.task('default', function(callback) {
  runSequence(
    'clean:dist', 
    ['build'], 
    callback
  )
});
