var express = require('express'),
http = require('http'),
bodyParser = require('body-parser'),
config = require("./config"),
partials = require('express-partials');

var connectAssets = require('connect-assets');

var app = express();

app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');
app.set('views', __dirname + '/views');
app.use(partials());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(express.static(__dirname + '/public'));

app.get('/',
function(req, res, next) {
    config.routes.todo.index({},
    req, res, next)
});
for (var i in config.routes) {
    (function(i) {
        var route = config.routes[i]; 
        for (var item in route) {
            if (route.get && route.get.indexOf(item) > -1) {
                app.route(["", i, item].join('/')).get((function(item) {
                    return function(req, res, next) {
                        route[item](req.query, req, res, next);
                    }
                } (item)));
            } else if (route.post && route.post.indexOf(item) > -1) {
                app.route(["", i, item].join('/')).post((function(item) {
                    return function(req, res, next) {
                        route[item](req.body, req, res, next);
                        console.log(item);
                    }
                } (item)));
            } else {
                app.route(["", i, item].join('/')).all((function(item) {
                    return function(req, res, next) {
                        var model = req.query || {};
                        for (var p in req.body) {
                            model[p] = req.body[p];
                        }
                        route[item](model, req, res, next);
                    }
                } (item)));
            }
        }
    })(i);
}

var mongoose = require('mongoose');
mongoose.connect(config.db);
app.on('close',
function(errno) {
    mongoose.disconnect(function(err) {});
});

http.createServer(app).listen(config.port,
function() {
    console.log("Express server listening on port " + config.port);
});
module.exports = app;