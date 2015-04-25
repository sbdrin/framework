"use strict";

var db = require('../dao/todoDao');

module.exports = {
    get:[],
    post:[],
    index: function(item, req, res, next) {
        db.allTodos(function(err, todos) {
            if (err) {
                return next(err);
            }
            res.render('todo/index', {
                todos: todos,
                layout: 'layout_empty'
            });
        });
    },

    new: function(item, req, res, next) {
        var title = item.title || '';
        title = title.trim();
        if (!title) {
            return res.render('error.html', {
                message: '标题是必须的'
            });
        }
        db.add(title,
        function(err, row) {
            if (err) {
                return next(err);
            }
            res.redirect('/');
        });
    },
    view: function(item, req, res, next) {
        res.redirect('/');

    },
    edit: function(item, req, res, next) {
        db.findTodoById(item.id,
        function(err, row) {
            if (err) {
                return next(err);
            }
            if (!row) {
                return next();
            }
            res.render('todo/edit.html', {
                todo: row
            });
        });
    },
    save: function(item, req, res, next) {
        var title = (item.title || '').trim();
        if (!title) {
            return res.render('error.html', {
                message: '标题是必须的'
            });
        }
        db.editTitle(item.id, title,
        function(err, result) {
            if (err) {
                return next(err);
            }
            res.redirect('/');
        });
    },
    delete: function(item, req, res, next) {
        db.delete(item.id,
        function(err) {
            if (err) {
                return next(err);
            }
            res.redirect('/');
        });
    },
    finish: function(item, req, res, next) {
        var finished = item.status === 'yes' ? true: false;
        db.editFinished(item.id, finished,
        function(err, result) {
            if (err) {
                return next(err);
            }
            res.redirect('/');
        });
    }
}