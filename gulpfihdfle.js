var gulp = require('gulp'),rename = require('gulp-rename'),uglify = require('gulp-uglify'),
concat = require('gulp-concat') ,notify = require('gulp-notify'), livereload = require('gulp-livereload');
// ½Å±¾
gulp.task('scripts', function() {  
  return gulp.src('js/*.js')
    .pipe(concat('main.js'))
    .pipe(gulp.dest('dist/scripts'))
   // .pipe(rename({ suffix: '.min' }))
    .pipe(uglify())
    .pipe(gulp.dest('dist/scripts'))
    .pipe(notify({ message: 'Scripts task complete' }));
});
 