'use strict';

// required modules
var gulp = require('gulp'),
    sourcemaps = require('gulp-sourcemaps'),
    autoprefixer = require('gulp-autoprefixer'),
    scss = require('gulp-sass'),
    lessPath = require('path'),
    iconfont = require('gulp-iconfont'),
    iconfontCss = require('gulp-iconfont-css'),
    imagemin = require('gulp-imagemin'),
    cssbeautify = require('gulp-cssbeautify'),
    gcmq = require('gulp-group-css-media-queries'), // gruop media queries in css
    jsprettify = require('gulp-js-prettify'),
    cleanCSS = require('gulp-clean-css'), // minify css
    uglify = require('gulp-uglify'), // minify js
    pump = require('pump'), // additional to minify js
    fileinclude = require('gulp-file-include'), // html includes
    connect = require('gulp-connect'), // additional to livereload
    clean = require('gulp-clean'), // removes files and folders
    gulpCopy = require('gulp-copy'), // copy files from one folder to another
    notify = require("gulp-notify");

// functional variables 
var localhostId = '3030';
var distLocalhostId = '3031'; // port for the DIST folder. Might be equal to SRC port
var mainCss = 'all.css';
var mainJQuery = 'jquery.main.js';
var mainPureJs = 'main.js';
var fontName = 'iconfont';

// project structure
var path = {
    remoteMarkup: 'https://github.com/gladisihor/markup.git',
    root: './',
    distFolder: './dist/',
    distFolderCont: './dist/*',
    cssDist: './dist/css/',
    jsDist: './dist/js/',
    mainJsPath: 'js/bundle.js',
    imagesDist: './dist/images/',
    svgFontDist: './dist/fonts/',

    srcFolder: './src',
    htmlIncludes: './src/includes/*.html',
    scss: './src/scss/',
    less: './src/less/',
    css: './src/css/',
    js: './src/js/',
    imagesInput: './src/images/**/*.*',
    imagesOutput: './src/images/',

    svgFontInput: './src/sourceicons/*.svg',
    svgFontOutput: './src/fonts/',
    svgFontTemplate: './src/sourceicons/template/_icons.css',
    svgFontScssOutput: '../scss/base/_icons.scss',
    svgFontLessOutput: '../less/base/_icons.less',
    svgFontCssPath: '../fonts/',

    watch: {
        srcHtml: './src/*.html',
        distHtml: './dist/*.html',
        fonts: './src/fonts/*.*',
        html: './src/**/*.html',
        htmlIncludes: './src/includes/**/*.html',
        js: './src/js/**/*.js',
        jsAll: './src/js/**/*.*',
        jsDist: './dist/js/**/*.js',
        jsDistAll: './dist/js/**/*.*',
        scssToCss: './src/scss/**/*.scss',
        lessToCss: './src/less/**/*.less',
        css: './src/css/**/*.css',
        img: './src/sourceimages/**/*.*',
        svgFonts: './src/sourceicons/**/*.*'
    }
};

// modules' API
var prefApi = {
    browsers: ['last 2 versions', '> 1%',  'ie 10'],
    cascade: false
};
var connectApi = {
    root: path.srcFolder,
    port: localhostId,
    livereload: true
};
var connectDistApi = {
    root: path.distFolder,
    port: distLocalhostId,
    livereload: true
};
var prettifyApi = {
    indent: '	'
};
var fileincludeApi = {
    prefix: '@@',
    basepath: '@file'
};
var iconfontApi = function(less) {
    return {
        fontName: fontName,
        path: path.svgFontTemplate,
        targetPath: less ? path.svgFontLessOutput : path.svgFontScssOutput,
        fontPath: path.svgFontCssPath,
        cssClass: 'icon'
    };
};
var iconGeneratorApi = {
    fontName: fontName,
    height: 100,
    normalize: true,
    centerHorizontally: true,
    formats: ['ttf', 'eot', 'woff', 'woff2', 'svg']
};

/* git */
// src is the root folder for git to initialize 
gulp.task('git:init', function(){
    git.init(function (err) {
        if (err) throw err;
    });
});
// clone a remote markup template with all features
gulp.task('deploy', ['git:init'], function(){
    git.clone(path.remoteMarkup, function (err) {
        if (err) throw err;
    });
});

/* localhost src connect */
gulp.task('connect', function() {
    connect.server(connectApi);
    gulp.src('.')
        .pipe(notify('Localhost port (SRC): ' + localhostId));
});

/* localhost dist connect */
gulp.task('connect:dist', function() {
    connect.server(connectDistApi);
    gulp.src('.')
        .pipe(notify('Localhost port (DIST): ' + distLocalhostId));
});

/* scss */
gulp.task('scss', function () {
    return gulp.src(path.watch.scssToCss)
        .pipe(sourcemaps.init())
        .pipe(scss().on('error', scss.logError))
        .pipe(autoprefixer(prefApi))
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest(path.css))
        .pipe(connect.reload());
});

/* less */
gulp.task('less', function () {
    return gulp.src(path.watch.lessToCss)
        .pipe(sourcemaps.init())
        .pipe(less())
        .pipe(autoprefixer(prefApi))
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest(path.css))
        .pipe(connect.reload());
});

/* html */
gulp.task('html', function () {
    gulp.src(path.watch.html)
        .pipe(connect.reload());
});

// html includes
gulp.task('fileinclude', function() {
    gulp.src([path.htmlIncludes])
        .pipe(fileinclude(fileincludeApi))
        .pipe(gulp.dest(path.srcFolder));
});

/* icon fonts */
gulp.task('iconfont', function(){
    gulp.src([path.svgFontInput])
        .pipe(iconfontCss(iconfontApi()))
        .pipe(iconfont(iconGeneratorApi))
        .pipe(gulp.dest(path.svgFontOutput));
});
gulp.task('iconfont:less', function(){
    gulp.src([path.svgFontInput])
        .pipe(iconfontCss(iconfontApi('less')))
        .pipe(iconfont(iconGeneratorApi))
        .pipe(gulp.dest(path.svgFontOutput));
});

/* optimize images */
gulp.task('optimize', function () {
    return gulp.src(path.imagesInput)
        .pipe(imagemin())
        .pipe(gulp.dest(path.imagesDist));
});

/* prettify css */
gulp.task('prettify:css', function () {
    return gulp.src(path.watch.css)
        .pipe(gcmq())
        .pipe(cssbeautify(prettifyApi))
        .pipe(gulp.dest(path.cssDist));
});
gulp.task('prettify:srccss', function () {
    return gulp.src(path.watch.css)
        .pipe(gcmq())
        .pipe(cssbeautify(prettifyApi))
        .pipe(gulp.dest(path.css));
});

/* minify css */
gulp.task('minify:css', function () {
    return gulp.src(path.css + mainCss)
        .pipe(gcmq())
        .pipe(cleanCSS())
        .pipe(gulp.dest(path.cssDist));
});

/* minify js */
gulp.task('uglify:js', function() {
    return gulp.src(path.watch.js)
        .pipe(uglify())
        .pipe(gulp.dest(path.jsDist));
});

/* prettify js */
gulp.task('prettify:js', function() {
    return gulp.src(path.watch.js)
        .pipe(jsprettify())
        .pipe(gulp.dest(path.jsDist));
});
gulp.task('prettify:srcjs', function() {
    gulp.src(path.js + mainJQuery)
        .pipe(jsprettify())
        .pipe(gulp.dest(path.js));
});

/* minify js */
gulp.task('minify:js', ['uglify:js'], function() {
    return gulp.src([path.watch.jsDist, '!' + path.mainJsDist], {
        read: false,
        force: true
    }).pipe(clean());
});

/* clean folders */
// clean all dist
gulp.task('clean', function () {
    return gulp.src(path.distFolder, {
        read: false,
        force: true
    }).pipe(clean());
});
// clean css
gulp.task('clean:css', function () {
    return gulp.src(path.cssDist, {
        read: false,
        force: true
    }).pipe(clean());
});
// clean js
gulp.task('clean:js', function () {
    return gulp.src(path.jsDist, {
        read: false,
        force: true
    }).pipe(clean());
});
// clean images
gulp.task('clean:images', function () {
    return gulp.src(path.imagesDist, {
        read: false,
        force: true
    }).pipe(clean());
});
// clean fonts
gulp.task('clean:fonts', function () {
    return gulp.src(path.svgFontDist, {
        read: false,
        force: true
    }).pipe(clean());
});
gulp.task('clean:nodes', function () {
    return gulp.src('./node_modules', {
        read: false,
        force: true
    }).pipe(clean());
});

/* inits */
gulp.task('copy:html', function () {
    return gulp
        .src(path.watch.srcHtml)
        .pipe(gulpCopy(path.distFolder, {
            prefix: 1
        }));
});
gulp.task('copy:fonts', function () {
    return gulp
        .src(path.watch.fonts)
        .pipe(gulpCopy(path.svgFontDist, {
            prefix: 2
        }));
});

/* watchers */
gulp.task('watch', ['scss'], function() {
    gulp.watch(path.watch.scssToCss, ['scss']);
    gulp.watch(path.watch.html, ['html']);
});
gulp.task('watch:less', ['less'], function() {
    gulp.watch(path.watch.lessToCss, ['less']);
    gulp.watch(path.watch.html, ['html']);
});
gulp.task('watch:includes', ['fileinclude'], function() {
    gulp.watch(path.watch.htmlIncludes, ['fileinclude']);
});
gulp.task('watch:icons', ['iconfont'], function() {
    gulp.watch(path.watch.htmlIncludes, ['iconfont']);
});
gulp.task('watch:lessicons', ['iconfont:less'], function() {
    gulp.watch(path.watch.htmlIncludes, ['iconfont:less']);
});

gulp.task('localhost', ['connect', 'watch']);
gulp.task('localhost:includes', ['connect', 'watch', 'watch:includes']);
gulp.task('localhost:scss', ['connect', 'watch']);
gulp.task('localhost:incscss', ['connect', 'watch', 'watch:includes']);
gulp.task('localhost:icons', ['connect', 'watch', 'watch:icons']);
gulp.task('localhost:incicons', ['connect', 'watch', 'watch:includes', 'watch:icons']);

gulp.task('default', ['localhost:includes']);

// groups
gulp.task('copy', ['copy:html', 'copy:fonts']);
gulp.task('prettify', ['prettify:js', 'prettify:css']);
gulp.task('minify', ['minify:js', 'minify:css']);

gulp.task('dist', ['copy', 'prettify', 'optimize']);
gulp.task('dist:min', ['copy', 'minify', 'optimize']);
