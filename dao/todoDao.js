var util = require('util');
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var TodoScheme = new Schema({
    title: String,
    finished: {
        type: Boolean,
    default:
        false
    },
    post_date: {
        type: Date,
    default:
        Date.now
    }
});

//访问todo对象模型
mongoose.model('Todo', TodoScheme);
var Todo = mongoose.model('Todo');
var hasOpen = false;
//exports.emptyNote = { "_id": "", author: "", note: "" };
module.exports = {
    setup: function(callback) {
        callback(null);
    },
    add: function(title, callback) {
        var newTodo = new Todo();
        newTodo.title = title;
        newTodo.save(function(err) {
            if (err) {
                util.log("FATAL" + err);
                callback(err);
            } else {
                callback(null);
            }
        });
    },
    delete: function(id, callback) {
        module.exports.findTodoById(id,
        function(err, doc) {
            if (err) callback(err);
            else {
                util.log(util.inspect(doc));
                doc.remove();
                callback(null);
            }
        });
    },
    editTitle: function(id, title, callback) {
        module.exports.findTodoById(id,
        function(err, doc) {
            if (err) callback(err);
            else {
                doc.post_date = new Date();
                doc.title = title;
                doc.save(function(err) {
                    if (err) {
                        util.log('FATAL ' + err);
                        callback(err);
                    } else callback(null);
                });
            }
        });
    },
    editFinished: function(id, finished, callback) {
        module.exports.findTodoById(id,
        function(err, doc) {
            if (err) callback(err);
            else {
                doc.post_date = new Date();
                doc.finished = finished;
                doc.save(function(err) {
                    if (err) {
                        util.log('FATAL ' + err);
                        callback(err);
                    } else callback(null);
                });
            }
        });
    },
    allTodos: function(callback) {
        Todo.find({},callback);
    },
    forAll: function(doEach, done) {
       
        Todo.find({},
        function(err, docs) {
            if (err) {
                util.log('FATAL ' + err);
                done(err, null);
            }
            docs.forEach(function(doc) {
                doEach(null, doc);
            });
            done(null);
           
        });
    },
    findTodoById: function(id, callback) {
        Todo.findOne({
            _id: id
        },
        function(err, doc) {
            if (err) {
                util.log('FATAL ' + err);
                callback(err, null);
            }
            callback(null, doc);
        });
    }
};