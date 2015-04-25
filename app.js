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

app.get('/',config.routes.todo.index);
for (var i in config.routes) {
    var route = config.routes[i];
    app.get('/' + i,route.index);
    for (var item in route) {
        if (route.get && route.get.indexOf(item) > -1) {
            app.route('/' + [i, item].join('/')).get(route[item]);
        } else if (route.post && route.post.indexOf(item) > -1) {
            app.route('/' + [i, item].join('/')).post(route[item]);
        } else {
            app.route('/' + [i, item].join('/')).all(route[item]);
        }
    }
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