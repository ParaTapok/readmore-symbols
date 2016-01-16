"use strict";

var gulp        = require('gulp'),
    compass     = require('gulp-compass'),
    watch       = require('gulp-watch'),
    cssmin      = require('gulp-minify-css'),
    filter      = require('gulp-filter'),
    rename      = require('gulp-rename'),
    plumber     = require('gulp-plumber');

var local = 'template/',
    path = {
        build: {
            sass:     local + 'sass',
            styles:   local + 'css',
            js:       local + 'js',
            images:   local + 'img',
            fonts:    local + 'fonts'
        },
        src: {
            styles:   local + 'sass/**/*.scss',
            images:   local + 'img/**/*.*'
        },
        watch: {
            styles:   local + 'sass/**/*.scss',
            images:   local + 'img/**/*.*'
        }
    };

gulp.task('styles:build', function () {
    gulp.src(path.src.styles)
        .pipe(plumber())
        .pipe(compass({
            css:   path.build.styles,
            sass:  path.build.sass,
            image: path.build.images,
            font:  path.build.fonts
        }))
        .pipe(plumber.stop())
        .pipe(gulp.dest(path.build.styles))
});

gulp.task('styles:build:min', function () {
    gulp.src(path.build.styles + '/*.css')
        .pipe(filter(function(file) {
            return !/min.css/.test(file.path)
        }))
        .pipe(plumber())
        .pipe(rename({
            suffix: '.min'
        }))
        .pipe(plumber.stop())
        .pipe(cssmin())
        .pipe(gulp.dest(path.build.styles))
});

gulp.task('build', [ 'styles:build', 'styles:build:min' ]);

gulp.task('watch', function(){
    watch([path.watch.styles], function(event, cb) {
        gulp.start('styles:build');
        gulp.start('styles:build:min');
    });
});

gulp.task('default', ['build', 'watch']);