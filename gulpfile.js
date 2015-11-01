'use strict';

var gulp = require('gulp');
var clean = require('gulp-clean');
var gulp = require('gulp');
var gutil = require('gulp-util');
var webpack = require('webpack');
var Yargs = require('yargs');
var htmlreplace = require('gulp-html-replace');
var concat = require('gulp-concat');
var minifyCSS = require('gulp-minify-css');
var autoprefixer = require('gulp-autoprefixer');
var argv = Yargs.argv;

var settings = {
  environment: (!!argv.env
                  ? argv.env
                  : process.env.NODE_ENV || 'production')
};

var webpackConfig = settings.environment == 'production' ? require('./webpack.production.config.js') : require('./webpack.config.js');



gulp.task('clean', function(){
  if (settings.environment=='production')
    return gulp.src('dist')
               .pipe(clean());
  else
    return gulp.src(['src/bundle.js', 'src/bundle.map.js'])
               .pipe(clean());
});

gulp.task('copy', ['clean', 'webpack'], function(){
  return gulp.src(['src/img/**/*', 'src/sounds/**/*'], {base: 'src'})
             .pipe(gulp.dest('dist'));
});

gulp.task('webpack', function(callback){
  // run webpack
  console.log(settings.environment);
  webpack(webpackConfig, function(err, stats){
    if(err) throw new gutil.PluginError('webpack', err);
    gutil.log('[webpack]', stats.toString({
      // output options
    }));
    callback();
  });
});

gulp.task('css', ['clean'], function(){
  if (settings.environment=='production')
    gulp.src('src/styles/**/*.css')
      .pipe(minifyCSS())
      .pipe(autoprefixer('last 2 version', 'safari 5', 'ie 8', 'ie 9'))
      .pipe(concat('styles.css'))
      .pipe(gulp.dest('dist'));
});

gulp.task('build', ['copy', 'css'], function(){
  if (settings.environment=='production'){
    gulp.src('src/game.html')
        .pipe(htmlreplace({
          css: '123',
          js: '123'
        }))
        .pipe(gulp.dest('dist'));
  }
});