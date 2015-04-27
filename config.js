"use strict";

module.exports = {
    debug: true,
    port: 3002,
    db: 'mongodb://127.0.0.1:27017/vision',
    routes:{
    	todo: require('./controllers/todoController')
    }
}