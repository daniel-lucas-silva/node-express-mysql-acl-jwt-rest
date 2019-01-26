const express = require('express');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const compression = require('compression');
const helmet = require('helmet');
const cors = require('cors');

const routes = require('./routes');

const app = express();

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

app.use(
  bodyParser.json({
    limit: '20mb'
  })
);
app.use(
  bodyParser.urlencoded({
    limit: '20mb',
    extended: true
  })
); /* for parsing application/x-www-form-urlencoded ~*/
app.use(cors());
app.use(compression());
app.use(helmet());

// Redis cache enabled only for production
if (process.env.NODE_ENV === 'production') {
  // app.use(cache);
}
app.use(express.static('public'));
app.use(routes);

app.listen(8080);

module.exports = app; // for testing
