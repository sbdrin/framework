"use strict";

var db = require('../dao/todoDao');

module.exports = {
    get:[],
    post:[],
    index: function(req, res, next) {
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

    new: function(req, res, next) {
        var title = req.body.title || '';
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
    view: function(req, res, next) {
        res.redirect('/');

    },
    edit: function(req, res, next) {
        var id = req.query.id;
        db.findTodoById(id,
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
    save: function(req, res, next) {
        var id = req.query.id;
        var title = req.body.title || '';
        title = title.trim();
        if (!title) {
            return res.render('error.html', {
                message: '标题是必须的'
            });
        }
        db.editTitle(id, title,
        function(err, result) {
            if (err) {
                return next(err);
            }
            res.redirect('/');
        });
    },
    delete: function(req, res, next) {
        var id = req.query.id;
        db.delete(id,
        function(err) {
            if (err) {
                return next(err);
            }
            res.redirect('/');
        });
    },
    finish: function(req, res, next) {
        var finished = req.query.status === 'yes' ? true: false;
        var id = req.query.id;
        db.editFinished(id, finished,
        function(err, result) {
            if (err) {
                return next(err);
            }
            res.redirect('/');
        });
    }
}