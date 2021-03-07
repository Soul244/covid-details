/**
 * Module dependencies.
 */
const express = require('express');
const compression = require('compression');
const bodyParser = require('body-parser');
const logger = require('morgan');
const chalk = require('chalk');
const errorHandler = require('errorhandler');
const lusca = require('lusca');
const dotenv = require('dotenv');
const path = require('path');
const mongoose = require('mongoose');
const sass = require('node-sass-middleware');
const { getLatestData } = require('./getData');

getLatestData();

// const fs = require('fs');
// const rawData = fs.readFileSync('cities.json');
// const json = JSON.parse(rawData);
// const { cities } = json;

/**
 * Load environment variables from .env file, where API keys and passwords are configured.
 */
dotenv.config({ path: '.env' });

/**
 * Controllers (route handlers).
 */
const homeController = require('./controllers/home');

/**
 * Create Express server.
 */
const app = express();

/**
 * Connect to MongoDB.
 */
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);
mongoose.set('useNewUrlParser', true);
mongoose.set('useUnifiedTopology', true);
mongoose.connect(process.env.MONGODB_URI);
mongoose.connection.on('error', (err) => {
  console.error(err);
  console.log('%s MongoDB connection error. Please make sure MongoDB is running.', chalk.red('✗'));
  process.exit();
});

// City.insertMany(
//   cities.map((city) => {
//     const { id, ...restCity } = city;
//     const newCity = {
//       ...restCity,
//       population: parseInt(city.population.replace(/\./g, ''), 10),
//       population100: parseInt(city.population.replace(/\./g, ''), 10) / 100000,
//     };
//     return newCity;
//   })
// );

/**
 * Express configuration.
 */
app.set('host', process.env.OPENSHIFT_NODEJS_IP || '0.0.0.0');
app.set('port', process.env.PORT || process.env.OPENSHIFT_NODEJS_PORT || 8080);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');
app.use(compression());
app.use(
  sass({
    src: path.join(__dirname, 'public'),
    dest: path.join(__dirname, 'public'),
  })
);
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(lusca.xframe('SAMEORIGIN'));
app.use(lusca.xssProtection(true));
app.disable('x-powered-by');

app.use('/', express.static(path.join(__dirname, 'public'), { maxAge: 31557600000 }));
app.use(
  '/js/lib',
  express.static(path.join(__dirname, 'node_modules/chart.js/dist'), {
    maxAge: 31557600000,
  })
);
app.use(
  '/js/lib',
  express.static(path.join(__dirname, 'node_modules/popper.js/dist/umd'), {
    maxAge: 31557600000,
  })
);
app.use(
  '/js/lib',
  express.static(path.join(__dirname, 'node_modules/bootstrap/dist/js'), {
    maxAge: 31557600000,
  })
);
app.use(
  '/js/lib',
  express.static(path.join(__dirname, 'node_modules/jquery/dist'), {
    maxAge: 31557600000,
  })
);
app.use('/webfonts', express.static(path.join(__dirname, 'node_modules/@fortawesome/fontawesome-free/webfonts'), { maxAge: 31557600000 }));

/**
 * Primary app routes.
 */
app.get('/', homeController.index);

/**
 * Error Handler.
 */
if (process.env.NODE_ENV === 'development') {
  // only use in development
  app.use(errorHandler());
} else {
  app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).send('Server Error');
  });
}

/**
 * Start Express server.
 */
app.listen(app.get('port'), () => {
  console.log('%s App is running at http://localhost:%d in %s mode', chalk.green('✓'), app.get('port'), app.get('env'));
  console.log('  Press CTRL-C to stop\n');
});

module.exports = app;
