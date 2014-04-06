var express = require('express');
var api = require('./routes/api');

var app = express();

app.configure(function () {
    app.use(express.logger('dev')); /* 'default', 'short', 'tiny', 'dev' */
    app.use(express.bodyParser());
});

//serve static content
app.use(express.static(__dirname + '/app'));

//route api requests
app.get('/API/helloworld', api.helloWorld);
app.get('/API/getroutes/:service', api.getRoutes);
app.get('/API/getstops', api.getStops);
app.get('/API/getduration', api.getDuration);

app.get('/API/getmock/:file', api.getMock);


//start the webserver on port process.env.PORT
app.listen(process.env.PORT);
console.log('Listening on port '+process.env.PORT);