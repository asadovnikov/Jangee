'use strict';

var path = require('path');
var gulp = require('gulp');
var conf = require('./conf');
var fs   = require('fs');

var imagesInfo = 'src/app/info.json';

var gutil = require('gulp-util');

var imgSrc = require('./imageSource');

var imageoptim = require('gulp-imageoptim');
var imagemin = require('gulp-imagemin');

var $ = require('gulp-load-plugins')({
  pattern: ['gulp-*', 'main-bower-files', 'uglify-save-license', 'del']
});

gulp.task('imagemin', function(){
  gulp.src('src/assets/images/compressed/*')
    .pipe(imagemin({
      progressive: true
    }))
    .pipe(gulp.dest('src/images/imagemin'));

});

gulp.task('imageoptim', function(){
  gulp.src('src/assets/images/compressed/*')
    .pipe(imageoptim.optimize())
    .pipe(gulp.dest('src/images/imageoptim'));

});

gulp.task('imageboth', function(){
  gulp.src('src/images/imagemin/**/*')
    .pipe($.imageoptim.optimize())
    .pipe(gulp.dest('src/images/both'));

});

var ghPages = require('gulp-gh-pages');

gulp.task('deploy', function() {
  return gulp.src('./dist/**/*')
    .pipe(ghPages());
});

gulp.task('images', function(){
  //var conf = require('./conf');
  gutil.log(fs.realpathSync(__filename));

  gulp.src('src/assets/images/compressed/*').pipe(imgSrc);

  //gulp.src([
  //  'src/assets/images/art/**/*.jpeg',
  //  'src/assets/images/art/**/*.jpg',
  //  'src/assets/images/art/**/*.JPEG',
  //  'src/assets/images/art/**/*.JPG',
  //  'src/assets/images/art/**/*.png'
  //]).pipe(imgSrc);

  var imagesObj = JSON.parse(fs.readFileSync(imagesInfo, 'utf8'));

  var counter = 0;
  var ratioSumUp = {};
  for(var key in imagesObj){
    counter++;
    var aspectRatio = imagesObj[key]['aspect_ratio'];
    if(!ratioSumUp[aspectRatio])
    {
      ratioSumUp[aspectRatio] = {'count' : 0};
    }
    ratioSumUp[aspectRatio].count += 1;
  }
  for(var aspectRatio in ratioSumUp){
   gutil.log(aspectRatio + ':' + ratioSumUp[aspectRatio].count);
  }
  gutil.log('Total: ' + counter);
});

gulp.task('partials', function () {
  return gulp.src([
    path.join(conf.paths.src, '/app/**/*.html'),
    path.join(conf.paths.tmp, '/serve/app/**/*.html')
  ])
    .pipe($.htmlmin({
      removeEmptyAttributes: true,
      removeAttributeQuotes: true,
      collapseBooleanAttributes: true,
      collapseWhitespace: true
    }))
    .pipe($.angularTemplatecache('templateCacheHtml.js', {
      module: 'jangee',
      root: 'app'
    }))
    .pipe(gulp.dest(conf.paths.tmp + '/partials/'));
});

gulp.task('html', ['inject', 'partials'], function () {
  var partialsInjectFile = gulp.src(path.join(conf.paths.tmp, '/partials/templateCacheHtml.js'), { read: false });
  var partialsInjectOptions = {
    starttag: '<!-- inject:partials -->',
    ignorePath: path.join(conf.paths.tmp, '/partials'),
    addRootSlash: false
  };

  var htmlFilter = $.filter('*.html', { restore: true });
  var jsFilter = $.filter('**/*.js', { restore: true });
  var cssFilter = $.filter('**/*.css', { restore: true });

  return gulp.src(path.join(conf.paths.tmp, '/serve/*.html'))
    .pipe($.inject(partialsInjectFile, partialsInjectOptions))
    .pipe($.useref())
    .pipe(jsFilter)
    .pipe($.sourcemaps.init())
    .pipe($.ngAnnotate())
    .pipe($.uglify({ preserveComments: $.uglifySaveLicense })).on('error', conf.errorHandler('Uglify'))
    .pipe($.rev())
    .pipe($.sourcemaps.write('maps'))
    .pipe(jsFilter.restore)
    .pipe(cssFilter)
    // .pipe($.sourcemaps.init())
    .pipe($.replace('../../bower_components/material-design-iconfont/iconfont/', '../fonts/'))
    .pipe($.cssnano())
    .pipe($.rev())
    // .pipe($.sourcemaps.write('maps'))
    .pipe(cssFilter.restore)
    .pipe($.revReplace())
    .pipe(htmlFilter)
    .pipe($.htmlmin({
      removeEmptyAttributes: true,
      removeAttributeQuotes: true,
      collapseBooleanAttributes: true,
      collapseWhitespace: true
    }))
    .pipe(htmlFilter.restore)
    .pipe(gulp.dest(path.join(conf.paths.dist, '/')))
    .pipe($.size({ title: path.join(conf.paths.dist, '/'), showFiles: true }));
  });

// Only applies for fonts from bower dependencies
// Custom fonts are handled by the "other" task
gulp.task('fonts', function () {
  return gulp.src($.mainBowerFiles().concat('bower_components/material-design-iconfont/iconfont/*'))
    .pipe($.filter('**/*.{eot,otf,svg,ttf,woff,woff2}'))
    .pipe($.flatten())
    .pipe(gulp.dest(path.join(conf.paths.dist, '/fonts/')));
});

gulp.task('other', function () {
  var fileFilter = $.filter(function (file) {
    return file.stat.isFile();
  });

  return gulp.src([
    path.join(conf.paths.src, '/**/*'),
    path.join('!' + conf.paths.src, '/**/*.{html,css,js,scss}')
  ])
    .pipe(fileFilter)
    .pipe(gulp.dest(path.join(conf.paths.dist, '/')));
});

gulp.task('clean', function () {
  return $.del([path.join(conf.paths.dist, '/'), path.join(conf.paths.tmp, '/')]);
});

gulp.task('build', ['html', 'fonts', 'other']);
