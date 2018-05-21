var express = require('express');
var http = require('http');
var cors = require('cors');
var mssql = require('mssql');
var bodyParser = require('body-parser');
var usseController = require('./ussd.controller');

// define app and requirements
var app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// set app route
usseController(app);

app.get('*', (req, res) => {
    res.status(200).send('this is ussd api service');
})

// error handler
app.use((req, res, next) => {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

app.use((err, req, res, next) => {
    res.status(err.status || 500);
    res.send(err.message)
});


// run server

const port = process.env.PORT || '3200';
app.set('port', port);

const server = http.createServer(app);
server.listen(port, () => console.log(`ussd api service listening on port:${port}`));
