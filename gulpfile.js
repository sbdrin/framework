var gulp = require('gulp'),
rename = require('gulp-rename'),
uglify = require('gulp-uglify'),
replace = require('gulp-replace'),
concat = require('gulp-concat'),
notify = require('gulp-notify'),
rename = require('gulp-rename'),
livereload = require('gulp-livereload');
// ½Å±¾
var gen = require('./gen.js');
gulp.task('gen',
function() {
    var stream;
    for (var i in gen) {
        stream = gulp.src('**/*.*').pipe(rename((function(i) {
            return function(path) {
                path.dirname = path.dirname.replace("todo", i);
                path.basename = path.basename.replace("todo", i);
            }
        })(i)
        )).pipe(replace("todo", i)).pipe(gulp.dest("../output"));
    }
    return stream;
});
gulp.task('control', ['gen'],
function() {
    var old = "post:[]";
    var oldCon = "routes:{";
    var newCon = [];
    for (var i in gen) {
        newCon.push([i,":require('./controllers/" ,i,"Controller')"].join(""));
        var newFuncs = [old];
        var funcs = gen[i].urls;
        var model = JSON.stringify(gen[i].model);
        model && gulp.src(['../output/model/',i,".js"].join("")).pipe(replace(/\({([^]+)}\)/,["(", model.replace(/:"/g,':').replace(/",/g,',').replace(/"}/g,'}') ,")"].join(""))).pipe(gulp.dest("../output/model"));

        for (var func in funcs) {
            newFuncs.push("  " + func + " : function(item, req, res, next) {return req.body =" + JSON.stringify(funcs[func]) + "}");
        }
        gulp.src(['../output/controllers/', i, "controller.js"].join("")).pipe(replace(old, newFuncs.join(","))).pipe(gulp.dest("../output/controllers/"));
    }
    gulp.src('../output/config.js').pipe(replace(/routes:{([^]+)}/, oldCon + newCon.join(",") + "}}")).pipe(gulp.dest("../output"));
});
gulp.task('scripts', ['gen', 'control']);