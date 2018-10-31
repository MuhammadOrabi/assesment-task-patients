require('rootpath')();
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const errorHandler = require('_helpers/error-handler');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

require('./patients/patient.rabbitmq');

// global error handler
app.use(errorHandler);

// start server
const port = process.env.PORT ? process.env.PORT : 3000;
if (!module.parent) {
    const server = app.listen(port, function () {
        console.log('Server listening on port ' + port);
    });
}
module.exports = app;